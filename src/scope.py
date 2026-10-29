import tinycss2,re
ROOT="#usg-root"
def scope_sel(sel):
    sel=sel.strip()
    if not sel:return sel
    if sel in(":root","html","body") or sel.startswith(":root"):return sel
    if sel.startswith(".usg-r"):return ROOT+sel[len(".usg-r"):]
    m=re.match(r'^((?:html|body)(?:[.#:\[][^\s>+~]*)?)(\s*>?\s*)(.*)$',sel)
    if m:
        head,rest=m.group(1),m.group(3)
        if head.startswith("body") and not rest:return sel
        if head.startswith("html") and rest.startswith("body"):
            m2=re.match(r'^(body(?:[.#:\[][^\s>+~]*)?)\s*>?\s*(.*)$',rest)
            if m2:return f"{head} {m2.group(1)} {ROOT} {m2.group(2)}".strip() if m2.group(2) else sel
        if not rest:return sel
        return f"{head} {ROOT} {rest}"
    return f"{ROOT} {sel}"
def split_sel(s):
    out,depth,cur=[],0,""
    for ch in s:
        if ch in"([":depth+=1
        if ch in")]":depth-=1
        if ch=="," and depth==0:out.append(cur);cur=""
        else:cur+=ch
    out.append(cur);return out
def process(rules):
    res=[]
    for r in rules:
        if r.type=="qualified-rule":
            sel=tinycss2.serialize(r.prelude)
            new=", ".join(scope_sel(s) for s in split_sel(sel))
            res.append(new+"{"+tinycss2.serialize(r.content)+"}")
        elif r.type=="at-rule":
            kw=r.lower_at_keyword
            if kw in("media","supports","container","layer") and r.content is not None:
                inner=tinycss2.parse_rule_list(r.content,skip_comments=True,skip_whitespace=True)
                res.append("@"+r.at_keyword+tinycss2.serialize(r.prelude)+"{"+"".join(process(inner))+"}")
            else:res.append(tinycss2.serialize([r]))
    return res
def scope(css):return "\n".join(process(tinycss2.parse_stylesheet(css,skip_comments=True,skip_whitespace=True)))
if __name__=="__main__":
    for t in [".hero h1",":root",".usg-r :where(p)","html.noscroll .pin-h","html.usg-skin body","html.usg-skin body>*:not(#usg-root)","body.hero-dark header.top","#v-inner .side h2","@media (max-width:760px){.a{x:1}}","dialog::backdrop"]:
        print(t,"=>",scope(t+("" if "{" in t else "{x:1}")))
