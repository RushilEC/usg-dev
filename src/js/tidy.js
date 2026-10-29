/* ================= Page tidy-ups applied after a copied page renders ================= */
/* "2025: Fall & Spring Budget" / "March 2nd — Agenda & Packet" -> a label + rounded chips */
const ROW_RE=/^\s*((?:\d{4}(?:\s*[–-]\s*\d{2,4})?)|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?))\s*[:—–-]+\s*/i;
function docRows(root){root.querySelectorAll(".prose p").forEach(p=>{if(p.closest(".docrow"))return;const links=[...p.querySelectorAll("a")];if(!links.length)return;
    const txt=p.textContent;const m=txt.match(ROW_RE);if(!m)return;
    const label=m[1].trim();const tail=txt.replace(ROW_RE,"").replace(/[&,]/g," ").trim();
    const leftover=tail;let rest=leftover;links.forEach(a=>{rest=rest.replace(a.textContent.trim(),"")});rest=rest.replace(/\s+/g," ").trim();
    const row=document.createElement("div");row.className="docrow";
    row.innerHTML=`<span class="dr-label">${esc(label)}</span><span class="dr-chips"></span>${rest&&rest.length<30?`<span class="dr-note">${esc(rest)}</span>`:""}`;
    const box=row.querySelector(".dr-chips");
    links.forEach(a=>{const c=a.cloneNode(true);c.textContent=a.textContent.trim();c.className="chip-link"+(a.dataset.file?" is-file":"");box.appendChild(c)});
    const li=p.parentElement&&p.parentElement.tagName==="LI"&&p.parentElement.children.length===1?p.parentElement:null;
    if(li){li.classList.add("li-row");li.replaceChildren(row)}else p.replaceWith(row)});
  /* lists made entirely of rows: drop the bullets */
  root.querySelectorAll(".prose ul,.prose ol").forEach(ul=>{const lis=[...ul.children];if(lis.length&&lis.every(li=>li.classList.contains("li-row")||li.querySelector(":scope>p>a.file.solo:only-child")))ul.classList.add("rows")})}
/* in-page "Contents" links whose targets lost their ids: match by heading text */
function inPageLinks(root){root.querySelectorAll('.prose a[href^="#"]').forEach(a=>{const h=a.getAttribute("href").slice(1);
  if(/^(p-|c-|e-|edit-)|^(home|committees|admin|events|priorities|mission|do|visit|committees-home)$/.test(h))return;
  const want=a.textContent.replace(/^[\s\-–—•]+/,"").trim().toLowerCase().slice(0,40);
  a.addEventListener("click",ev=>{ev.preventDefault();const t=[...root.querySelectorAll(".prose h2,.prose h3,.prose h4")].find(x=>x!==a.closest("h2,h3,h4")&&x.textContent.trim().toLowerCase().startsWith(want.slice(0,24)));
    if(t)scrollTo({top:t.getBoundingClientRect().top+scrollY-110,behavior:RM?"auto":"smooth"})})})}
