/* ================= v5: scroll motion, flipbooks, committee themes ================= */
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

/* ---------- Committee themes + stickers (original artwork) ---------- */
const K='stroke="#111" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
const T=(x,y,s,txt,fill="#111",w=900,anchor="middle",extra="")=>`<text x="${x}" y="${y}" font-family="Archivo,Arial,sans-serif" font-weight="${w}" font-size="${s}" fill="${fill}" text-anchor="${anchor}" ${extra}>${txt}</text>`;
const STK={
 cap:c=>`<path d="M60 22 108 44 60 66 12 44Z" fill="${c}" ${K}/><path d="M32 54v20c0 8 56 8 56 0V54L60 66Z" fill="#222" ${K}/><path d="M60 44 96 50v26" fill="none" ${K}/><circle cx="96" cy="82" r="6" fill="#FCC419" ${K}/>`,
 book:c=>`<path d="M12 30c16-6 32-6 48 6v58c-16-12-32-12-48-6Z" fill="#fff" ${K}/><path d="M108 30c-16-6-32-6-48 6v58c16-12 32-12 48-6Z" fill="${c}" ${K}/><path d="M22 46c10-3 20-2 28 3M22 60c10-3 20-2 28 3M70 49c8-5 18-6 28-3" fill="none" ${K}/>`,
 pencil:c=>`<g transform="rotate(-38 60 60)"><rect x="18" y="48" width="70" height="24" rx="3" fill="${c}" ${K}/><path d="M88 48l22 12-22 12Z" fill="#FFE8CC" ${K}/><path d="M102 56l8 4-8 4Z" fill="#111"/><rect x="8" y="48" width="12" height="24" rx="3" fill="#FF8787" ${K}/></g>`,
 aplus:c=>`<circle cx="60" cy="60" r="44" fill="${c}" ${K}/><circle cx="60" cy="60" r="34" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 6"/>${T(60,76,40,"A+","#fff")}`,
 pin:c=>`<path d="M60 108S26 72 26 48a34 34 0 0168 0c0 24-34 60-34 60Z" fill="${c}" ${K}/><circle cx="60" cy="48" r="12" fill="#fff" ${K}/>`,
 house:c=>`<path d="M18 58 60 22l42 36" fill="none" ${K}/><path d="M28 50v50h64V50" fill="${c}" ${K}/><rect x="50" y="70" width="20" height="30" fill="#fff" ${K}/><rect x="34" y="60" width="12" height="12" fill="#FFF3BF" ${K}/><rect x="74" y="60" width="12" height="12" fill="#FFF3BF" ${K}/>`,
 paw:c=>`<ellipse cx="60" cy="76" rx="24" ry="20" fill="${c}" ${K}/><ellipse cx="30" cy="50" rx="10" ry="13" fill="${c}" ${K}/><ellipse cx="48" cy="34" rx="10" ry="13" fill="${c}" ${K}/><ellipse cx="72" cy="34" rx="10" ry="13" fill="${c}" ${K}/><ellipse cx="90" cy="50" rx="10" ry="13" fill="${c}" ${K}/>`,
 bubble:(c,txt)=>`<path d="M14 24h92a8 8 0 018 8v42a8 8 0 01-8 8H52l-22 18 4-18H14a8 8 0 01-8-8V32a8 8 0 018-8Z" fill="${c}" ${K}/>${T(60,59,txt.length>9?13:17,txt,"#111")}`,
 globe:c=>`<circle cx="60" cy="60" r="44" fill="${c}" ${K}/><path d="M24 44c14 4 20-6 30 0s4 18 14 18 12-12 22-6M30 82c10-6 22 2 28-6" fill="none" ${K}/><ellipse cx="60" cy="60" rx="18" ry="44" fill="none" stroke="#111" stroke-width="3" opacity=".35"/>`,
 heart:c=>`<path d="M60 102S14 74 14 44a24 24 0 0146-10 24 24 0 0146 10c0 30-46 58-46 58Z" fill="${c}" ${K}/><path d="M34 40a10 10 0 0112-8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
 venn:c=>`<circle cx="44" cy="48" r="26" fill="${c}" fill-opacity=".85" ${K}/><circle cx="76" cy="48" r="26" fill="#FCC419" fill-opacity=".85" ${K}/><circle cx="60" cy="76" r="26" fill="#4DABF7" fill-opacity=".85" ${K}/>`,
 sun:c=>`<g ${K}>${Array.from({length:10},(_,i)=>`<path d="M60 8v14" transform="rotate(${i*36} 60 60)"/>`).join("")}</g><circle cx="60" cy="60" r="30" fill="${c}" ${K}/><circle cx="50" cy="56" r="3" fill="#111"/><circle cx="70" cy="56" r="3" fill="#111"/><path d="M48 68c6 7 18 7 24 0" fill="none" ${K}/>`,
 cloud:c=>`<path d="M18 78c-14-14 6-34 22-24 4-20 34-22 40-4 18-4 28 18 14 28Z" fill="#fff" ${K}/><path d="M28 98c0-18 14-30 32-30s32 12 32 30" fill="none" stroke="${c}" stroke-width="7"/><path d="M38 98c0-12 10-20 22-20s22 8 22 20" fill="none" stroke="#FCC419" stroke-width="7"/>`,
 badge:(c,txt)=>`<path d="M60 8l12 10 16-2 4 16 14 8-6 15 6 15-14 8-4 16-16-2-12 10-12-10-16 2-4-16-14-8 6-15-6-15 14-8 4-16 16 2Z" fill="${c}" ${K}/>${T(60,txt.length>9?58:64,txt.length>9?12:17,txt.split("|")[0],"#fff")}${txt.includes("|")?T(60,74,12,txt.split("|")[1],"#fff"):""}`,
 leaf:c=>`<path d="M20 100C20 50 50 18 104 16c0 54-32 86-84 84Z" fill="${c}" ${K}/><path d="M20 100 78 42M48 72l-2-18M62 58l14 2" fill="none" ${K}/>`,
 sprout:c=>`<path d="M34 78h52l-8 30H42Z" fill="#E8590C" ${K}/><path d="M60 78V48" fill="none" ${K}/><path d="M60 52c-4-18-22-24-34-20 2 14 16 24 34 20ZM60 46c4-16 20-22 32-18-2 12-16 22-32 18Z" fill="${c}" ${K}/>`,
 recycle:c=>`<circle cx="60" cy="60" r="46" fill="${c}" ${K}/><g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M40 46a24 24 0 0136-6"/><path d="M84 58a24 24 0 01-14 26"/><path d="M50 84a24 24 0 01-16-22"/></g><g fill="#fff"><path d="M74 30l8 12-14 2Z"/><path d="M76 88l-14 2 4-14Z"/><path d="M28 58l8-12 6 13Z"/></g>`,
 earth:c=>`<circle cx="60" cy="60" r="44" fill="#4DABF7" ${K}/><path d="M28 40c10-6 22 0 24 10s-10 14-8 24-14 10-18 0-6-26 2-34ZM70 26c12 2 22 12 26 24-8 2-14-4-22 0s-10-8-6-12 0-8 2-12ZM68 78c8-6 18-2 22 4-6 10-14 16-24 18-4-8-2-16 2-22Z" fill="${c}" ${K}/>`,
 coffee:c=>`<path d="M22 40h64l-8 62H30Z" fill="${c}" ${K}/><path d="M86 52h8a12 12 0 010 24h-12" fill="none" ${K}/><path d="M18 34h72" ${K}/><path d="M44 26c0-8 8-8 8-16M60 26c0-8 8-8 8-16" fill="none" ${K}/><path d="M40 62h28" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
 pizza:c=>`<path d="M12 22c34-12 62-12 96 0L60 110Z" fill="#FFD43B" ${K}/><path d="M12 22c34-12 62-12 96 0l-6 12c-30-10-54-10-84 0Z" fill="#E8590C" ${K}/><circle cx="48" cy="50" r="8" fill="${c}" ${K}/><circle cx="72" cy="56" r="7" fill="${c}" ${K}/><circle cx="58" cy="78" r="6" fill="${c}" ${K}/>`,
 key:c=>`<circle cx="36" cy="60" r="22" fill="${c}" ${K}/><circle cx="36" cy="60" r="8" fill="#fff" ${K}/><path d="M58 60h50M92 60v14M104 60v10" fill="none" ${K}/>`,
 popper:c=>`<path d="M20 104 46 40l34 34Z" fill="${c}" ${K}/><path d="M33 72l14 14M39 58l22 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/><g ${K}><path d="M62 30l6-14M80 40l16-8M86 58l16 2" fill="none"/></g><circle cx="98" cy="16" r="5" fill="#FCC419" ${K}/><circle cx="106" cy="80" r="5" fill="#4DABF7" ${K}/><rect x="70" y="8" width="8" height="8" fill="#E64980" ${K} transform="rotate(20 74 12)"/>`,
 disco:c=>`<path d="M60 4v14" ${K}/><circle cx="60" cy="62" r="42" fill="#DEE2E6" ${K}/><g stroke="#111" stroke-width="2" opacity=".55" fill="none"><path d="M18 62h84M24 42h72M24 82h72M60 20v84M38 26c-8 22-8 50 0 72M82 26c8 22 8 50 0 72"/></g><path d="M34 40h12v12H34ZM70 70h12v12H70Z" fill="${c}"/><path d="M96 20l4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#FCC419" ${K}/>`,
 note:c=>`<path d="M44 86V26l52-12v58" fill="none" ${K}/><path d="M44 36l52-12" ${K}/><ellipse cx="34" cy="88" rx="14" ry="11" fill="${c}" ${K}/><ellipse cx="86" cy="76" rx="14" ry="11" fill="${c}" ${K}/>`,
 ticket:(c,txt)=>`<path d="M8 34h104v14a12 12 0 000 24v14H8V72a12 12 0 000-24Z" fill="${c}" ${K}/><path d="M84 36v48" stroke="#111" stroke-width="3" stroke-dasharray="5 5"/>${T(46,66,txt.length>9?12:15,txt,"#fff")}${T(98,64,11,"★","#fff")}`
};
const THEMES={
 "academics":{acc:"#3B5BDB",acc2:"#FCC419",words:["Minors","Advising","Grading policy","Course of Study","A+"],st:[["cap","#3B5BDB"],["book","#4DABF7"],["pencil","#FCC419"],["aplus","#E64980"]]},
 "campus-community-affairs":{acc:"#2F9E44",acc2:"#FFD43B",words:["Farmers' market","Porchfest","Town + gown","Beyond the Orange Bubble"],st:[["pin","#F58025"],["house","#69DB7C"],["paw","#F58025"],["bubble","#FFD43B","hey neighbor!"]]},
 "dei":{acc:"#9C36B5",acc2:"#FF8787",words:["Belonging","Access","Equity","Every Tiger"],st:[["globe","#69DB7C"],["heart","#F06595"],["venn","#CC5DE8"],["bubble","#FFEC99","hello · hola · 你好"]]},
 "mental-health":{acc:"#0CA678",acc2:"#FFA8A8",words:["You matter","CPS","Rest","Community of care"],st:[["sun","#FFD43B"],["heart","#FF8787"],["cloud","#4DABF7"],["badge","#0CA678","you|matter"]]},
 "sustainability":{acc:"#2B8A3E",acc2:"#A9E34B",words:["Reduce","Reuse","Move-out resale","Green Princeton"],st:[["leaf","#51CF66"],["sprout","#94D82D"],["recycle","#2B8A3E"],["earth","#51CF66"]]},
 "university-student-life":{acc:"#E8590C",acc2:"#FFD43B",words:["Dining","Housing","Late meal","Student life"],st:[["coffee","#F76707"],["pizza","#E03131"],["key","#FAB005"],["badge","#1C7ED6","home sweet|frist"]]},
 "social":{acc:"#E03131",acc2:"#7048E8",words:["Lawnparties","Princhella","Dean's Date","Party"],st:[["popper","#7048E8"],["disco","#F06595"],["note","#E03131"],["ticket","#7048E8","LAWNPARTIES"]]}
};
const stickerSVG=([k,c,t])=>`<svg viewBox="0 0 120 120" aria-hidden="true">${STK[k](c,t||"")}</svg>`;
function stickerField(slug,where){const th=THEMES[slug];if(!th||RM&&where==="band")return"";
  const spots=where==="band"?[[60,40,-14,.10],[78,34,10,.18],[68,70,-6,.06],[88,66,16,.22]]:[[96,42,12,.12],[93,78,-8,.2],[-8,30,-10,.08],[-7,72,8,.16]];
  return th.st.map((s,i)=>{const[x,y,r,sp]=spots[i];return `<div class="sticker-x" style="left:${x}%;top:${y}%;--rot:${r}deg" data-speed="${sp}" title="Drag me">${stickerSVG(s)}</div>`}).join("")}
function themeStrip(slug){const th=THEMES[slug];if(!th)return"";const w=[...th.words,...th.words].map(x=>`<span>${esc(x)}</span>`).join("");return `<div class="cm-strip" style="--acc:${th.acc};--acc2:${th.acc2}"><div class="cm-strip-in">${w}${w}</div></div>`}

/* drag stickers */
document.addEventListener("pointerdown",e=>{const s=e.target.closest(".sticker-x");if(!s)return;e.preventDefault();s.setPointerCapture(e.pointerId);s.classList.add("grab");
  const sx=e.clientX,sy=e.clientY,dx=+(s.dataset.dx||0),dy=+(s.dataset.dy||0);
  const mv=ev=>{s.dataset.dx=dx+ev.clientX-sx;s.dataset.dy=dy+ev.clientY-sy;s.style.setProperty("--dx",s.dataset.dx+"px");s.style.setProperty("--dy",s.dataset.dy+"px")};
  const up=()=>{s.classList.remove("grab");s.removeEventListener("pointermove",mv);s.removeEventListener("pointerup",up);s.removeEventListener("pointercancel",up)};
  s.addEventListener("pointermove",mv);s.addEventListener("pointerup",up);s.addEventListener("pointercancel",up)});

/* ---------- Reveal on scroll ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
function reveal(root){if(RM)return;(root||document).querySelectorAll(".sh,.poster,.orbit,.quick a,.ct-main>*,.ct-card,.prose>*:not(.g-row),.prose .g-row.people figure,.chair,.book,.mcols>div,.upd,.side,.ev-page>*,.cm-photo,.empty").forEach((el,i)=>{if(el.dataset.rv)return;el.dataset.rv=1;el.classList.add("rv");el.style.setProperty("--d",(i%6)*70+"ms");io.observe(el)})}

/* ---------- Scroll-linked motion ---------- */
let ticking=false,lastY=scrollY,vel=0;
function fx(){ticking=false;const y=scrollY,vh=innerHeight;vel=vel*.8+(y-lastY)*.2;lastY=y;if(RM)return;
  const hero=$("#v-home:not([hidden]) .hero");
  if(hero){const c=hero._c||(hero._c={sp:hero.querySelectorAll("h1>span"),h1:hero.querySelector("h1"),st:hero.querySelector(".stripes"),ft:hero.querySelector(".hero-foot"),stk:$("#sticker")});
    if(!hero._h||hero._hw!==innerWidth){hero._hw=innerWidth;hero._h=hero.offsetHeight||1}
    const p=clamp(y/hero._h);if(!(p>=1&&hero._p>=1)&&!(p<=0&&hero._p<=0)){hero._p=p;
      if(c.sp[0]){c.sp[0].style.transform=`translate3d(${-p*28}vw,0,0)`;c.sp[1].style.transform=`translate3d(${p*16}vw,0,0)`;c.sp[2].style.transform=`translate3d(${-p*9}vw,0,0)`;c.h1.style.opacity=1-p*.7}
      if(c.st)c.st.style.transform=`translate3d(${p*14}%,0,0) scale(${1+p*.18})`;if(c.stk)c.stk.style.transform=`rotate(${-8+p*140}deg) scale(${1-p*.25})`;
      if(c.ft){c.ft.style.transform=`translate3d(0,${-p*60}px,0)`;c.ft.style.opacity=1-p*1.4}}}
  const band=$("#v-inner:not([hidden]) .band");if(band){const p=clamp(y/band.offsetHeight);band.querySelector(".stripes").style.transform=`translateY(${p*40}%) rotate(${p*-6}deg)`;const h=band.querySelector("h1");if(h)h.style.transform=`translateY(${p*50}px)`}
  const mq=$(".marquee");if(mq&&!matchMedia("(hover:none)").matches)mq.style.transform=`skewX(${clamp(-vel*.25,-10,10)}deg)`;
  document.querySelectorAll(".pin-words").forEach(sec=>{if(!sec.offsetParent||document.documentElement.classList.contains("noscroll"))return;const r=sec.getBoundingClientRect(),ph=(sec.firstElementChild&&sec.firstElementChild.offsetHeight)||vh,q=clamp(-r.top/Math.max(1,sec.offsetHeight-ph));
    const w=sec._w||(sec._w=[...sec.querySelectorAll(".w")]);const n=Math.round(q*w.length*1.15);w.forEach((s,i)=>s.classList.toggle("lit",i<n))});
  document.querySelectorAll(".pin-h").forEach(sec=>{if(!sec.offsetParent)return;const tr=sec.querySelector(".ph-track");const r=sec.getBoundingClientRect(),q=clamp(-r.top/(sec.offsetHeight-vh));
    const dist=tr.scrollWidth-innerWidth+48;if(dist<=0||sec.classList.contains("fits")){tr.style.transform="";return}tr.style.transform=`translateX(${-q*dist}px)`;const bar=sec.querySelector(".ph-bar i");if(bar)bar.style.width=(q*100)+"%"});
  document.querySelectorAll(".sticker-x[data-speed]").forEach(s=>{if(!s.offsetParent)return;s.style.setProperty("--py",(-y*s.dataset.speed)+"px")});
  if(Math.abs(vel)>.5)requestTick()}
function requestTick(){if(!ticking){ticking=true;requestAnimationFrame(fx)}}
addEventListener("scroll",requestTick,{passive:true});const TOUCH=matchMedia("(hover:none)").matches;let _lw=innerWidth,_rt;addEventListener("resize",()=>{if(TOUCH&&Math.abs(innerWidth-_lw)<2)return;_lw=innerWidth;clearTimeout(_rt);_rt=setTimeout(()=>{sizePins();requestTick()},150)});
function sizePins(){document.querySelectorAll(".pin-h").forEach(sec=>{const tr=sec.querySelector(".ph-track");if(!tr)return;
  const fits=tr.scrollWidth<=innerWidth-24;sec.classList.toggle("fits",fits);
  if(RM||innerWidth<760||fits){sec.style.height="";tr.style.transform="";return}sec.style.height=(tr.scrollWidth-innerWidth+innerHeight+120)+"px"})}

/* tilt on committee cards */
document.addEventListener("pointermove",e=>{if(RM)return;const a=e.target.closest(".cgrid a");if(!a)return;const r=a.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;a.style.transform=`perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg)`});
document.addEventListener("pointerout",e=>{const a=e.target.closest&&e.target.closest(".cgrid a");if(a&&!a.contains(e.relatedTarget))a.style.transform=""});

/* ---------- Flipbook for scanned documents ---------- */
function initFlips(root){(root||document).querySelectorAll(".flip:not([data-ready])").forEach(el=>new Flip(el))}
class Flip{
  constructor(el){this.el=el;el.dataset.ready=1;this.p=el.dataset.pages.split(",").filter(Boolean);this.n=this.p.length;this.s=0;this.busy=false;
    el.tabIndex=0;el.setAttribute("role","region");el.setAttribute("aria-label",(el.dataset.title||"Document")+", flip through the pages");
    el.innerHTML=`<div class="fb-stage"><div class="fb-book"><div class="fb-page fb-l"><img alt=""></div><div class="fb-page fb-r"><img alt=""></div><div class="fb-spine"></div></div>
      <button class="fb-hit fb-hl" aria-label="Previous page"></button><button class="fb-hit fb-hr" aria-label="Next page"></button></div>
      <div class="fb-ctl"><button class="fb-btn fb-prev" aria-label="Previous page">‹</button><input class="fb-range" type="range" min="0" value="0" aria-label="Jump to page"><span class="fb-count"></span><button class="fb-btn fb-next" aria-label="Next page">›</button><button class="fb-btn fb-max" aria-label="Full screen">⤢</button></div>`;
    this.L=el.querySelector(".fb-l img");this.R=el.querySelector(".fb-r img");this.range=el.querySelector(".fb-range");this.count=el.querySelector(".fb-count");
    const go=d=>this.turn(d);
    el.querySelector(".fb-prev").onclick=()=>go(-1);el.querySelector(".fb-next").onclick=()=>go(1);el.querySelector(".fb-hl").onclick=()=>go(-1);el.querySelector(".fb-hr").onclick=()=>go(1);
    el.querySelector(".fb-max").onclick=()=>{el.classList.toggle("fb-full");document.body.style.overflow=el.classList.contains("fb-full")?"hidden":"";this.draw()};
    el.addEventListener("keydown",e=>{if(e.key==="ArrowRight")go(1);else if(e.key==="ArrowLeft")go(-1);else if(e.key==="Escape"&&el.classList.contains("fb-full"))el.querySelector(".fb-max").click()});
    this.range.oninput=()=>{this.s=+this.range.value;this.draw()};
    let sx=null;const st=el.querySelector(".fb-stage");st.addEventListener("pointerdown",e=>sx=e.clientX);st.addEventListener("pointerup",e=>{if(sx!=null&&Math.abs(e.clientX-sx)>40)go(e.clientX<sx?1:-1);sx=null});
    this.mq=matchMedia("(max-width:760px)");this.mq.addEventListener("change",()=>{this.s=this.single?this.leftOf():Math.ceil(this.s/2);this.draw()});
    this.draw()}
  get single(){return this.mq.matches||this.el.classList.contains("fb-one")}
  leftOf(){return Math.max(0,2*this.s-1)}
  get max(){return this.single?this.n-1:Math.floor(this.n/2)}
  pair(s){return this.single?[null,s]:[s===0?null:2*s-1,2*s<this.n?2*s:null]}
  async set(img,i){img.closest(".fb-page").classList.toggle("blank",i==null);if(i==null){img.removeAttribute("src");return}img.alt=`Page ${i+1} of ${this.n}`;const u=await mediaURL(this.p[i]).catch(()=>null);if(u)img.src=u}
  draw(){const[l,r]=this.pair(this.s);this.el.classList.toggle("fb-single",this.single);this.set(this.L,l);this.set(this.R,r);
    this.range.max=this.max;this.range.value=this.s;const shown=[l,r].filter(x=>x!=null).map(x=>x+1);
    this.count.textContent=shown.length>1?`Pages ${shown[0]}–${shown[1]} of ${this.n}`:`Page ${shown[0]} of ${this.n}`;
    this.el.querySelector(".fb-prev").disabled=this.s<=0;this.el.querySelector(".fb-next").disabled=this.s>=this.max;
    [1,2].forEach(k=>{const[a,b]=this.pair(Math.min(this.max,this.s+k));[a,b].forEach(i=>i!=null&&mediaURL(this.p[i]).catch(()=>{}))})}
  async turn(d){const ns=this.s+d;if(this.busy||ns<0||ns>this.max)return;
    if(RM){this.s=ns;return this.draw()}
    this.busy=true;const book=this.el.querySelector(".fb-book");const leaf=document.createElement("div");leaf.className="fb-leaf "+(d>0?"to-left":"to-right")+(this.single?" one":"");
    const[cl,cr]=this.pair(this.s),[nl,nr]=this.pair(ns);
    const front=d>0?cr:cl,back=d>0?nl:nr;
    leaf.innerHTML=`<div class="fb-face front"><img alt=""></div><div class="fb-face back"><img alt=""></div>`;
    const fi=leaf.querySelector(".front img"),bi=leaf.querySelector(".back img");
    await Promise.all([front!=null?mediaURL(this.p[front]).then(u=>fi.src=u).catch(()=>{}):0,back!=null&&!this.single?mediaURL(this.p[back]).then(u=>bi.src=u).catch(()=>{}):0]);
    book.appendChild(leaf);
    if(this.single){await this.set(this.R,nr)}else{if(d>0)await this.set(this.R,nr);else await this.set(this.L,nl)}
    requestAnimationFrame(()=>leaf.classList.add("go"));
    setTimeout(()=>{this.s=ns;this.draw();leaf.remove();this.busy=false},this.single?520:720)}
}

/* ---------- hook into views ---------- */
function afterRender(root){hydrate(root);initFlips(root);reveal(root);sizePins();requestTick()}

/* ---------- Mobile + "no inner scroll" motion ----------
   Phones get swipe/tap-friendly versions of the scroll effects. And when the page is
   shown inside an app that scrolls the frame itself (so this page never sees a scroll
   event), effects switch to visibility-based triggers that work in any viewer. */
const MOB=matchMedia("(max-width:760px)");
let scrollSeen=false;addEventListener("scroll",()=>{if(scrollY>0)scrollSeen=true},{passive:true});
function checkNoScroll(){const ns=document.documentElement.scrollHeight<=innerHeight+4;document.documentElement.classList.toggle("noscroll",ns&&!scrollSeen)}
function mobileFX(){
  const tr=$("#pri");
  if(tr&&!tr._dots){const cards=[...tr.children];const dots=document.createElement("div");dots.className="ph-dots";dots.setAttribute("aria-hidden","true");dots.innerHTML=cards.map(()=>"<i></i>").join("");tr.after(dots);tr._dots=dots;
    const io2=new IntersectionObserver(es=>es.forEach(e=>{const on=e.intersectionRatio>.55;e.target.classList.toggle("on",on);const i=cards.indexOf(e.target);if(dots.children[i])dots.children[i].classList.toggle("on",on)}),{root:tr,threshold:[0,.55,1]});
    cards.forEach(c=>io2.observe(c));
    const hint=new IntersectionObserver(es=>{if(es[0].isIntersecting&&(MOB.matches||document.documentElement.classList.contains("noscroll"))&&!RM){hint.disconnect();setTimeout(()=>{tr.scrollTo({left:90,behavior:"smooth"});setTimeout(()=>tr.scrollTo({left:0,behavior:"smooth"}),650)},400)}},{threshold:.6});hint.observe(tr)}
  document.querySelectorAll(".pin-words").forEach(sec=>{if(sec._seq)return;sec._seq=1;const bq=sec.querySelector("blockquote");
    const io3=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;if(!document.documentElement.classList.contains("noscroll"))return;io3.disconnect();
      const w=[...sec.querySelectorAll(".w")];w.forEach((s,i)=>setTimeout(()=>s.classList.add("lit"),RM?0:250+i*65))}),{threshold:.3});io3.observe(bq)})}
checkNoScroll();addEventListener("load",()=>{checkNoScroll();mobileFX()});addEventListener("resize",checkNoScroll);
setTimeout(()=>{checkNoScroll();mobileFX()},1200);
