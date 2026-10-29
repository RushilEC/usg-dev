"""One command to check the redesign:  python3 src/tests/run_all.py
1. builds,  2. starts the local test site (a fake Squarespace on :8032),
3. smoke test: every page at phone + desktop width,
4. accessibility (axe-core, WCAG 2.1 A/AA),
5. dev-site copier: runs mirror.py against the test site and checks the copy.
Needs: pip install playwright tinycss2 && python3 -m playwright install chromium
       npm install --prefix src/tests axe-core
"""
import os, re, sys, time, shutil, subprocess, tempfile, socket, http.server, threading, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "src")
PAGES = ['/', '/committees', '/committees#c-social', '/workinggroups', '/workinggroups#w-transit', '/senate-members',
         '/elections', '/2027classgovernment', '/cpucinformation', '/usgdocumentsandcharters', '/budgetreports',
         '/contactus', '/mentalhealthresources', '/projectsboardclubfunding', '/events-calendar']
KNOWN_OK_AXE = {"color-contrast"}   # deliberate: small orange-on-white text kept (owner's decision)
fails = []

def up(port):
    try: socket.create_connection(("localhost", port), 1).close(); return True
    except OSError: return False

def step(n): print(f"\n== {n}")

step("build"); subprocess.run([sys.executable, os.path.join(SRC, "build.py")], check=True)

step("start test site")
mock = subprocess.Popen([sys.executable, os.path.join(SRC, "mock", "server_test.py")], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(40):
    if up(8032): break
    time.sleep(.25)
else: sys.exit("test site did not start (is something else on port 8032?)")

CODE = re.compile(r"toggleClass|slideToggle|\$\(document\)|console\.log|function\s*\(")
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        step("smoke test")
        for path in PAGES:
            for vw in (390, 1440):
                errs = []
                pg = b.new_page(viewport={"width": vw, "height": 900}, is_mobile=vw < 500, has_touch=vw < 500)
                pg.on("pageerror", lambda e: errs.append(str(e)))
                pg.goto("http://localhost:8032" + path); pg.wait_for_timeout(1400)
                r = pg.evaluate("({skin:document.documentElement.classList.contains('usg-skin'),sideways:document.documentElement.scrollWidth>innerWidth+1,text:document.body.innerText})")
                if not r["skin"]: fails.append(f"{path}@{vw}: design did not load")
                if r["sideways"]: fails.append(f"{path}@{vw}: page scrolls sideways")
                if CODE.search(r["text"]): fails.append(f"{path}@{vw}: code text visible on page")
                if errs: fails.append(f"{path}@{vw}: JS error {errs[0][:120]}")
                pg.close()
        print("  checked", len(PAGES) * 2, "page views")

        axe_path = os.path.join(SRC, "tests", "node_modules", "axe-core", "axe.min.js")
        step("accessibility (axe)")
        if not os.path.exists(axe_path):
            print("  skipped: run  npm install --prefix src/tests axe-core")
        else:
            AXE = open(axe_path).read(); seen = {}
            for path in PAGES:
                for vw in (390, 1440):
                    pg = b.new_page(viewport={"width": vw, "height": 900}, is_mobile=vw < 500)
                    pg.goto("http://localhost:8032" + path); pg.wait_for_timeout(1500)
                    pg.add_script_tag(content=AXE)
                    v = pg.evaluate("axe.run(document.getElementById('usg-root')||document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}).then(r=>r.violations.map(v=>[v.id,v.nodes.length,v.nodes[0].target.join(' ')]))")
                    for rid, n, ex in v: seen.setdefault(rid, [0, ex]); seen[rid][0] += n
                    pg.close()
            for rid, (n, ex) in sorted(seen.items()):
                tag = "known/accepted" if rid in KNOWN_OK_AXE else "FAIL"
                print(f"  {rid}: {n} elements ({tag}) e.g. {ex}")
                if rid not in KNOWN_OK_AXE: fails.append(f"axe {rid}: {n} elements, e.g. {ex}")

        step("dev-site copier")
        tmp = tempfile.mkdtemp(); out = os.path.join(tmp, "usg-dev")
        env = dict(os.environ, SOURCE="http://localhost:8032", BASE="/usg-dev", OUT=out)
        subprocess.run([sys.executable, os.path.join(ROOT, "mirror.py")], cwd=ROOT, env=env, check=True)
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a): pass
        handler = functools.partial(Quiet, directory=tmp)
        srv = http.server.ThreadingHTTPServer(("", 8041), handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        for path in ['/', '/committees/', '/senate-members/', '/usgdocumentsandcharters/', '/events-calendar/']:
            pg = b.new_page(viewport={"width": 1440, "height": 900})
            pg.goto("http://localhost:8041/usg-dev" + path); pg.wait_for_timeout(1800)
            r = pg.evaluate("""({skin:document.documentElement.classList.contains('usg-skin'),home:!!document.getElementById('v-home')&&!document.getElementById('v-home').hidden,
                bad:[...document.querySelectorAll('#usg-root a[href^="/"]')].map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('/usg-dev'))})""")
            if not r["skin"]: fails.append(f"dev copy {path}: design did not load")
            if path == "/" and not r["home"]: fails.append("dev copy: homepage not shown as homepage")
            if r["bad"]: fails.append(f"dev copy {path}: links escape the dev site, e.g. {r['bad'][:2]}")
            pg.close()
        srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
        print("  ok")
        b.close()
finally:
    mock.terminate()

print("\n" + ("ALL CHECKS PASSED" if not fails else f"{len(fails)} PROBLEM(S):\n  - " + "\n  - ".join(fails)))
sys.exit(1 if fails else 0)
