# Princeton USG — dev site

A preview of the redesigned usg.princeton.edu for the accessibility review.
It copies every page of the live Squarespace site, applies the redesign, and
publishes to GitHub Pages. Content always comes from Squarespace, and the copy
refreshes every 4 hours (or instantly via Actions → Build USG dev site → Run workflow).
Search engines are told not to index it.

- `mirror.py` — copies the live pages and applies the redesign
- `skin/header.html`, `skin/footer.html` — the redesign (same code as the Squarespace paste files)
- `.github/workflows/dev-site.yml` — builds and publishes the site

To update the design: replace the two files in `skin/`.
