"""Builds the USG dev site: copies every page of the live Squarespace site,
puts the redesign on top, and writes a static site to ./site for GitHub Pages.
Content always comes from Squarespace, so edits there show up on the next run."""
import os, re, json, html, urllib.request, urllib.parse, xml.etree.ElementTree as ET

SOURCE = os.environ.get("SOURCE", "https://usg.princeton.edu").rstrip("/")
repo = os.environ.get("GITHUB_REPOSITORY", "").split("/")[-1]
BASE = os.environ.get("BASE", "" if (not repo or repo.endswith(".github.io")) else "/" + repo).rstrip("/")
OUT = os.environ.get("OUT", "site")
MAX_PAGES = 250
def read_skin(name):
    # works whether the design files sit in skin/ or at the top of the repo
    for p in (os.path.join("skin", name), name):
        if os.path.exists(p):
            return open(p, encoding="utf-8").read()
    raise SystemExit(f"Can't find {name}. Upload header.html and footer.html (to the top of the repo or a 'skin' folder).")
HEAD, FOOT = read_skin("header.html"), read_skin("footer.html")
UA = {"User-Agent": "Mozilla/5.0 (USG dev-site builder; contact usg@princeton.edu)"}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "replace"), r.geturl()

def norm(p):
    p = urllib.parse.urlsplit(p).path or "/"
    p = re.sub(r"/+$", "", p) or "/"
    return p

skip = re.compile(r"^/(s|static|api|config|cart|checkout|account|commerce|universal|assets)(/|$)|\.(pdf|jpe?g|png|gif|mp4|mov|zip|docx?|pptx?|xlsx?|svg|ico|xml|txt|css|js)$", re.I)

def links_in(page_html):
    out = set()
    for m in re.finditer(r'href="([^"#?]*)', page_html):
        h = html.unescape(m.group(1))
        if h.startswith(SOURCE): h = h[len(SOURCE):]
        if h.startswith("/") and not h.startswith("//") and not skip.search(h):
            out.add(norm(h))
    return out

def strip_old_skin(t):
    # remove any copy of the redesign already injected on the live site
    t = re.sub(r"<!--USG-SKIN-H-->.*?<!--/USG-SKIN-H-->", "", t, flags=re.S)
    t = re.sub(r"<!--USG-SKIN-F-->.*?<!--/USG-SKIN-F-->", "", t, flags=re.S)
    t = re.sub(r"<script>\s*\(function\(\)\{\"use strict\";\s*const SHELL=.*?</script>", "", t, flags=re.S)
    return t

def rewrite(t):
    # files and images stay on the live site; page links stay inside the dev copy
    t = re.sub(r'(href|src|data-src)="/s/', r'\1="' + SOURCE + "/s/", t)
    t = re.sub(r'(src|data-src|srcset)="/(?!/)', r'\1="' + SOURCE + "/", t)
    def fix(m):
        attr, path = m.group(1), m.group(2)
        if path.startswith("//") or (BASE and (path == BASE or path.startswith(BASE + "/"))): return m.group(0)
        return f'{attr}="{BASE}{path}'
    t = re.sub(r'(href)="(/[^"]*)', fix, t)
    t = t.replace(f'href="{SOURCE}/', f'href="{BASE}/').replace(f'href="{BASE}/s/', f'href="{SOURCE}/s/')
    return t

def inject(t):
    meta = '<meta name="robots" content="noindex,nofollow">\n'
    flag = f'<script>window.USG_MIRROR=1;window.USG_BASE={json.dumps(BASE)};</script>\n'
    head_add, foot_add = meta + flag + HEAD, FOOT
    t = re.sub(r"</head>", lambda m: head_add + m.group(0), t, count=1, flags=re.I)
    i = t.lower().rfind("</body>")
    t = t[:i] + foot_add + t[i:] if i != -1 else t + foot_add
    return t

def save(path, name, data):
    d = os.path.join(OUT, path.strip("/"))
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name), "w", encoding="utf-8") as f: f.write(data)

# which pages: the sitemap, plus anything linked from pages we copy
todo, seen = ["/"], set()
try:
    sm, _ = get(SOURCE + "/sitemap.xml")
    for loc in ET.fromstring(sm).iter():
        if loc.tag.endswith("loc") and loc.text and loc.text.startswith(SOURCE):
            p = norm(loc.text[len(SOURCE):])
            if not skip.search(p): todo.append(p)
except Exception as e:
    print("no sitemap, crawling links instead:", e)

ok = 0
while todo and len(seen) < MAX_PAGES:
    p = todo.pop(0)
    if p in seen: continue
    seen.add(p)
    try:
        t, final = get(SOURCE + (p if p != "/" else "/"))
    except Exception as e:
        print("skip", p, e); continue
    if urllib.parse.urlsplit(final).netloc not in ("", urllib.parse.urlsplit(SOURCE).netloc):
        continue
    for l in links_in(t):
        if l not in seen: todo.append(l)
    save(p, "index.html", inject(rewrite(strip_old_skin(t))))
    try:
        j, _ = get(SOURCE + (p if p != "/" else "") + "?format=json")
        save(p, "index.json", j)
        if p == "/events-calendar":
            for it in json.loads(j).get("upcoming", []) + json.loads(j).get("past", []) + json.loads(j).get("items", []):
                u = it.get("fullUrl")
                if u and norm(u) not in seen: todo.append(norm(u))
    except Exception:
        pass
    ok += 1

if ok == 0:
    raise SystemExit(f"Couldn't copy any pages from {SOURCE}. The site may be down or blocking the copier; try Run workflow again in a few minutes.")
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, ".nojekyll"), "w").close()
with open(os.path.join(OUT, "404.html"), "w", encoding="utf-8") as f:
    f.write(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Not on the dev site</title>'
            f'<style>body{{font:18px/1.5 system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 24px}}a{{color:#c25400;font-weight:700}}</style></head>'
            f'<body><h1>This page isn\'t on the dev site yet</h1><p>It may be new since the last refresh. <a href="{BASE}/">Go to the homepage</a> or see the <a href="{SOURCE}">live site</a>.</p></body></html>')
print(f"copied {ok} pages from {SOURCE} into {OUT}/ (site folder: '{BASE or '/'}')")
