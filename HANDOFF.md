# Princeton USG website redesign: handoff

Owner: Rushil Chetty (USG communications). Read this first, then `src/js/core.js`.

## What this is

A redesign of **usg.princeton.edu** that keeps Squarespace as the content system.
Nothing is moved off Squarespace: a "skin" (CSS + JS) reads each page's existing
Squarespace content in the browser and re-renders it in the new design. Editors
keep editing in Squarespace as usual.

It runs in two places:

| Where | How | Status |
|---|---|---|
| **Dev site** `https://rushilec.github.io/usg-dev/` | GitHub Actions runs `mirror.py`: copies every live page, injects `header.html` + `footer.html`, publishes to GitHub Pages. Rebuilds on every push and every 4 hours. `noindex`. | **Live**, under review |
| **Real site** usg.princeton.edu | Paste `dist/PASTE-INTO-HEADER.txt` / `PASTE-INTO-FOOTER.txt` into Squarespace → Settings → Advanced → Code Injection | **Reverted** (boxes empty) until the review passes |

**Why reverted:** Princeton requires an accessibility review (OIT, arranged through
Dean Ian Deas, ODUS) before a redesigned site goes live on a princeton.edu domain.
After approval, paste the two files back in and Save. Reverting = clear both boxes.

## Commands

```bash
pip install playwright tinycss2 && python3 -m playwright install chromium   # once
npm install --prefix src/tests axe-core                              # once

python3 src/build.py          # writes header.html, footer.html (repo root) + dist/
python3 src/tests/run_all.py  # build + every check below; must end "ALL CHECKS PASSED"
python3 src/mock/server_test.py   # just run the local test site at http://localhost:8032
```

`run_all.py` checks: every page at 390px and 1440px (design loads, no sideways
scroll, no JS errors, no leaked code text), axe WCAG 2.1 A/AA, and the dev-site
copier (pages load under `/usg-dev`, homepage detected, no links escape the folder).

**Deploying:** run the tests, `python3 src/build.py`, commit, push. GitHub Actions runs
`run_all.py` first (and checks the built files match `src/`); if anything fails, nothing
deploys. Otherwise the dev site rebuilds itself within a few minutes. Never hand-edit `header.html` / `footer.html`: they're build output.

## Layout

```
HANDOFF.md            this file
mirror.py             dev-site copier (stdlib only; env: SOURCE, BASE, OUT)
.github/workflows/    dev-site.yml: test, then build + deploy to GitHub Pages
header.html footer.html   BUILT skin (used by mirror.py) — do not edit
dist/                 BUILT Squarespace paste files
src/build.py          the build
src/shell.html        page chrome: header, nav, footer, home sections
src/js/core.js        everything Squarespace-specific (routing, page renderers, a11y, video, mirror mode)
src/js/fx.js          scroll effects, reveals, flipbooks, hero motion (has a RM = reduced-motion flag)
src/js/tidy.js        content tidying helpers
src/css/chrome.css    unscoped: hides the Squarespace template, fonts, a11y, video band
src/css/design.css    the design system (scoped to #usg-root by scope.py at build time)
src/css/skin_content.css  styles for rebuilt Squarespace content (scoped)
src/mock/server_test.py   fake Squarespace site with realistic markup quirks (port 8032)
src/tests/run_all.py  the test suite
```

## How the skin works

1. `boot()` (end of core.js): finds Squarespace's main content `M`, records the
   banner video (`SQV = sqsVideo()`) **before** anything is tidied, inserts `#usg-root`
   (from `shell.html`), hides the template via `chrome.css`.
2. Routes on `PATH` (pathname, minus the dev-site folder) to a renderer: `pageHome`,
   committees (`#c-slug` subpages), working groups (`#w-slug`), Senate Members,
   class-government pages, elections, documents, events. Anything else: generic
   page via `prep()` + `sectionGrid()`.
3. `afterRender(root)` runs after each render: flipbooks, reveals, bubble font
   fitting, `a11y()` and `mirrorLinks()`.
4. Data from other pages comes from Squarespace JSON: `sqJSON(path)` →
   `path?format=json` (on the dev site: `<path>/index.json`, saved by mirror.py).

Mirror mode: mirror.py sets `window.USG_MIRROR=1` and `window.USG_BASE`. core.js
derives `BASE` from the **actual URL** (first path segment), so renaming the repo
can't break links. `asset()` / `mirrorLinks()` send `/s/...` files to the live site.

## Decisions made by the owner (don't undo without asking)

- **No pause button for motion.** Instead, `prefers-reduced-motion` stops everything:
  no video (still frame), static ticker, mission text fully shown, no animations.
- **Small orange-on-white text stays** (axe `color-contrast` failures are accepted;
  listed as known in `run_all.py`). Decorative fonts (e.g. Mr Dafoe chair signatures) stay.
- **Video band source priority:** the Squarespace banner/background video (YouTube,
  Vimeo or uploaded) first → a linked `.mp4` on the homepage (a file with "phone" in its
  name is used on phones) → YouTube fallback. The video is only visible while actually
  playing; otherwise a still frame (embedded in core.js as `VIDEO.poster`). Never let a
  native play button show.
- Instagram section: links on the left (Instagram, channel
  https://www.instagram.com/channel/roUr63fcnMk0VYgA/, usg@princeton.edu), square grid
  on the right, rounded to full rows.
- Nav/headings: caps in Unbounded; links: caps Space Grotesk with orange highlight;
  whole-line links become black pill buttons (`link-solo`).

## Hard-won gotchas

- **Hidden content loses line breaks.** The original Squarespace content is hidden, and
  `innerText` on hidden elements ignores `<br>`, so "President<br>Name" became
  "PresidentName". Always read captions with `capLines(el)`.
- **Safari drops a whole CSS rule** if any selector in it is unknown (e.g. a Chrome-only
  `::-webkit-media-controls-*`). One pseudo-element per rule.
- **Tidying removes "empty" blocks** (e.g. a background-video holder). Read anything you
  need from the raw page in `boot()` before `prep()` runs.
- **Code can leak as text**: page-level code injection without `<script>` tags renders
  raw JS in `<body>` outside `#usg-root`. `sweepStray()` removes it; `stripCode()`
  handles code inside content.
- **Docs page:** Squarespace stacks both headings first, then both flipbooks, so books
  are named from their own "Download …" links, not by position.
- The test site reads `dist/0-one-page-test.html` **at startup**: restart it after
  building (`run_all.py` does this for you).
- Phones: address-bar show/hide fires resize; fx.js ignores resizes with no width change.
- GitHub Actions "Node.js 20 deprecated" / "ubuntu-latest → 26" notices are harmless.

## Open items

- Accessibility review in progress; make whatever changes OIT asks for, run tests, push.
- After approval: paste `dist/` files into Squarespace; re-add the homepage video
  (banner video, or upload `usg-reel-phone.mp4` as a file link).
- Content fixes for editors (in Squarespace, not code): Senate Members still lists
  Emi Ren as Chief Elections Manager (Kasch Marquardt should be); delete or unlink the
  "test" page; the Committees page's own code-injection box holds an old jQuery
  accordion snippet (harmless now, can be cleared).

## Security

The skin loads no third-party scripts (only Google Fonts CSS, plus the YouTube or Vimeo
player when the banner uses one), uses no eval, escapes all inserted text with `esc()`,
and checks `postMessage` origins. The real risk is account access: anyone with
Squarespace admin or repo write access controls the site, so keep 2FA on both.
