"""Builds the redesign from the source files in src/.

Writes:
  header.html, footer.html            (repo root; the GitHub dev site uses these)
  dist/PASTE-INTO-HEADER.txt          (Squarespace > Settings > Advanced > Code Injection > Header)
  dist/PASTE-INTO-FOOTER.txt          (... > Footer)
  dist/0-one-page-test.html           (single-page test; also what the local test site loads)
Run:  python3 src/build.py
"""
import json, os, sys
SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SRC)
DIST = os.path.join(ROOT, "dist")
sys.path.insert(0, SRC)
from scope import scope   # prefixes design CSS so it only applies inside #usg-root

def rd(*p): return open(os.path.join(SRC, *p), encoding="utf-8").read()

design = rd("css", "reset.css") + "\n" + rd("css", "design.css") + "\n" + rd("css", "skin_content.css")
css = rd("css", "chrome.css") + "\n" + scope(design)
js = ("(function(){\"use strict\";\nconst SHELL=" + json.dumps(rd("shell.html")) + ";\n"
      + rd("js", "fx.js") + "\n" + rd("js", "tidy.js") + "\n" + rd("js", "core.js") + "\n})();").replace("</script", "<\\/script")
fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
 '<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">\n'
 '<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">\n')
pre = '<script>if(!/[?&]skin=off/.test(location.search)&&window.self===window.top){document.documentElement.classList.add("usg-loading");setTimeout(function(){document.documentElement.classList.remove("usg-loading")},3500)}</script>\n'
header = ('<!--USG-SKIN-H-->\n<!-- Princeton USG redesign, part 1 of 2: paste into Settings > Advanced > Code Injection > HEADER -->\n'
          + fonts + pre + '<style>\n' + css + '\n</style>\n<!--/USG-SKIN-H-->\n')
footer = ('<!--USG-SKIN-F-->\n<!-- Princeton USG redesign, part 2 of 2: paste into Settings > Advanced > Code Injection > FOOTER -->\n<script>\n'
          + js + '\n</script>\n<!--/USG-SKIN-F-->\n')
test = ("<!-- Princeton USG redesign, ONE-PAGE TEST: paste into a single page's Settings > Advanced > Page Header Code Injection -->\n"
        + fonts + pre + '<style>\n' + css + '\n</style>\n<script>\n' + js + '\n</script>\n')

os.makedirs(DIST, exist_ok=True)
for path, text in [(os.path.join(ROOT, "header.html"), header), (os.path.join(ROOT, "footer.html"), footer),
                   (os.path.join(DIST, "PASTE-INTO-HEADER.txt"), header), (os.path.join(DIST, "PASTE-INTO-FOOTER.txt"), footer),
                   (os.path.join(DIST, "0-one-page-test.html"), test)]:
    with open(path, "w", encoding="utf-8") as f: f.write(text)
    print(f"{os.path.relpath(path, ROOT):32s} {len(text):>8,} bytes")
