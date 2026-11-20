'use strict';
const $=id=>document.getElementById(id);
const TAB_PREFIX=(function(){
  try{
    const s=document.querySelector('script[data-goatcounter-settings]');
    const p=s&&JSON.parse(s.dataset.goatcounterSettings).path||'';
    if(String(p).indexOf('/mipui-worksheet/')===0)return 'tab/geography';
  }catch(e){}
  return /\/mipui-worksheet\//.test(location.pathname)?'tab/geography':'tab/geography-site';
})();
function gcSkip(){
  try{
    if(navigator.webdriver)return true;
    if(new URLSearchParams(location.search).get('nogc')==='1')return true;
    if(localStorage&&localStorage.getItem('skipgc')==='t')return true;
  }catch(e){}
  return false;
}
const tabSeen=new Set();
function trackTab(path){
  if(!path||tabSeen.has(path)||gcSkip())return;
  tabSeen.add(path);
  const fire=()=>{if(gcSkip())return;try{window.goatcounter&&goatcounter.count&&goatcounter.count({path,title:path,event:true})}catch(e){}};
  if(window.goatcounter&&goatcounter.count)fire();
  else{let n=0;const t=setInterval(()=>{if((window.goatcounter&&goatcounter.count)||++n>50){clearInterval(t);fire()}},100)}
}
/* Pageviews are sent as a GET pixel (not sendBeacon POST), once. Retry on first gesture if the load-time hit did not land. */
let gcPv='idle';
function gcPageview(){
  if(gcSkip()||gcPv==='sent'||gcPv==='sending')return;
  try{if(window.goatcounter&&goatcounter.filter&&goatcounter.filter())return}catch(e){}
  if(!(window.goatcounter&&goatcounter.url))return;
  const url=goatcounter.url({});
  if(!url)return;
  gcPv='sending';
  const img=new Image();
  img.onload=()=>{gcPv='sent'};
  img.onerror=()=>{gcPv='idle'};
  img.src=url;
}
(function(){let n=0;const t=setInterval(()=>{if((window.goatcounter&&goatcounter.url)||++n>50){clearInterval(t);gcPageview()}},100)})();
document.addEventListener('pointerdown',gcPageview,true);
document.addEventListener('keydown',gcPageview,true);
const NS='http://www.w3.org/2000/svg';
const rnd=n=>Math.floor(Math.random()*n);
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function el(tag,attrs={},parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.append(e);return e}
function h(tag,attrs={},html=''){const e=document.createElement(tag);for(const k in attrs){if(k==='class')e.className=attrs[k];else e.setAttribute(k,attrs[k])}if(html)e.innerHTML=html;return e}

/* ---------- concepts ---------- */
const SATHINT={
 'אי':'האם יש מים מסביב ליבשה מכל הצדדים?',
 'חצי אי':'עוקבים אחרי קו החוף. בכמה צדדים יש מים, ואיפה היבשה מתחברת?',
 'מצר':'מסתכלים על המים ליד הנקודה. הם רחבים או צרים? מה יש משני הצדדים שלהם?',
 'מפרץ':'האם המים נכנסים לתוך היבשה? אפשר להתרחק עם שתי אצבעות.',
 'ים':'כמה גדולים המים? האם יש יבשה כמעט מסביב?',
 'אוקיינוס':'רואים סוף למים? כמה רחוקה היבשה?',
 'יבשת':'כמה גדולה היבשה? אפשר לראות איפה היא נגמרת?'
};
const DEF={
 'אי':'חלק של יבשה שיש סביבו מים מכל הצדדים.',
 'חצי אי':'חלק של יבשה שיש סביבו מים משלושה צדדים, ובצד הרביעי הוא מחובר ליבשה.',
 'מצר':'מעבר מים צר בין שני חלקי יבשה. הוא מחבר בין שני גופי מים.',
 'מפרץ':'חלק של ים או אוקיינוס שנכנס לתוך היבשה.',
 'ים':'גוף מים גדול ומלוח, קטן מאוקיינוס. לרוב יש יבשה כמעט מסביב לו.',
 'אוקיינוס':'גוף המים הגדול ביותר. בספר לומדים על שלושת הגדולים: האטלנטי, השקט וההודי.',
 'יבשת':'שטח יבשה גדול מאוד. יש שבע יבשות.'
};
const CONCEPTS=Object.keys(DEF);
const SEE={ // what did you see? first = correct
 'אי':['יבשה, ומסביב לה מים מכל הצדדים','מים, ומסביבם יבשה מכל הצדדים','יבשה שמחוברת ליבשה גדולה'],
 'חצי אי':['יבשה שבולטת לתוך המים, מחוברת רק מצד אחד','יבשה, ומסביב לה מים מכל הצדדים','מעבר מים צר'],
 'מצר':['מעבר מים צר בין שני חלקי יבשה','יבשה, ומסביב לה מים מכל הצדדים','מים רחבים בלי סוף'],
 'מפרץ':['מים שנכנסים לתוך היבשה','יבשה שנכנסת לתוך המים','יבשה, ומסביב לה מים מכל הצדדים'],
 'ים':['מים גדולים, ויבשה כמעט מסביב','מים ענקיים בין יבשות רחוקות','שטח יבשה גדול'],
 'אוקיינוס':['מים ענקיים בין יבשות רחוקות','מים קטנים בתוך היבשה','שטח יבשה ענקי'],
 'יבשת':['שטח יבשה ענקי','אי קטן בים','מים ענקיים']
};
const SEEHINT={
 'אי':'מסתכלים על הקו בין היבשה למים. האם יש מים מכל הצדדים?',
 'חצי אי':'עוקבים באצבע אחרי החוף. בכמה צדדים יש מים?',
 'מצר':'מסתכלים על המים שליד הסימון. הם רחבים או צרים? מה יש משני הצדדים?',
 'מפרץ':'האם המים נכנסים לתוך היבשה, או שהיבשה נכנסת לתוך המים?',
 'ים':'כמה גדולים המים? האם יש יבשה מכמה צדדים?',
 'אוקיינוס':'מסתכלים כמה גדולים המים. אפשר לראות יבשה מכל הצדדים?',
 'יבשת':'מסתכלים: זה מים או יבשה? וכמה גדול?'
};
// Real places. lat, lon, view radius (deg), detail key (from 50m data) or null
const PLACES={
 'אי':[{n:'קפריסין',near:'במזרח הים התיכון, ממערב לישראל',lat:35.05,lon:33.3,r:2.6,d:'cyprus'},
       {n:'סיציליה',near:'ליד איטליה',lat:37.6,lon:14.1,r:2.6,d:'sicily'},
       {n:'איסלנד',near:'בצפון האוקיינוס האטלנטי',lat:64.9,lon:-18.7,r:4.5,d:'iceland'},
       {n:'מדגסקר',near:'ליד אפריקה',lat:-19.5,lon:46.7,r:9,d:null}],
 'חצי אי':[{n:'חצי האי סיני',near:'דרומית־מערבית לישראל, ליד אילת',lat:29.6,lon:33.8,r:3.6,d:'sinai'},
       {n:'חצי האי האפניני (איטליה)',near:'בדרום אירופה',lat:42,lon:12.8,r:6,d:'italy'},
       {n:'חצי האי הקוריאני',near:'במזרח אסיה',lat:37.5,lon:127.5,r:5,d:'korea'}],
 'מצר':[{n:'מצר גיברלטר',near:'בין ספרד למרוקו',lat:35.95,lon:-5.6,r:1.3,d:'gibraltar'},
       {n:'מצר באב אל-מנדב',near:'בין אפריקה לתימן',lat:12.6,lon:43.35,r:1.8,d:'mandeb'},
       {n:'מצר ברינג',near:'בין רוסיה (אסיה) לאלסקה (אמריקה הצפונית)',lat:65.8,lon:-168.8,r:4.5,d:null}],
 'מפרץ':[{n:'מפרץ אילת',near:'בדרום ישראל',lat:28.9,lon:34.7,r:2.6,d:'eilat'},
       {n:'המפרץ הפרסי',near:'בין איראן לסעודיה',lat:26.8,lon:51.5,r:7,d:'persian'},
       {n:'מפרץ מקסיקו',near:'בין ארצות הברית למקסיקו',lat:24.5,lon:-90,r:12,d:'mexico'}],
 'ים':[{n:'הים התיכון',near:'בין אירופה, אסיה ואפריקה (ישראל על החוף שלו)',lat:36,lon:17,r:22,d:null},
       {n:'הים האדום',near:'בין אפריקה לסעודיה',lat:20.5,lon:38.5,r:10,d:'red'},
       {n:'הים השחור',near:'בין אירופה לאסיה',lat:43.3,lon:34.5,r:6.5,d:'black'}],
 'אוקיינוס':[{n:'האוקיינוס השקט',near:'בין אסיה ואוסטרליה לאמריקה',lat:0,lon:-160,r:80,d:null},
       {n:'האוקיינוס האטלנטי',near:'בין אמריקה לאירופה ולאפריקה',lat:15,lon:-38,r:62,d:null},
       {n:'האוקיינוס ההודי',near:'בין אפריקה, אסיה ואוסטרליה',lat:-20,lon:78,r:58,d:null}],
 'יבשת':[{n:'אפריקה',near:'מדרום לים התיכון',lat:3,lon:20,r:42,d:null},
       {n:'אוסטרליה',near:'בחצי הדרומי של כדור הארץ',lat:-25,lon:134,r:30,d:null},
       {n:'אמריקה הדרומית',near:'מדרום לאמריקה הצפונית',lat:-18,lon:-60,r:38,d:null}]
};
function satZoom(p){return Math.max(2,Math.min(12,Math.round(Math.log2(274/p.r))))}
let satReturn=null;
let satMap=null,satPin=null,satLabels=null;
function setSatLabels(on){if(!satMap)return;if(on)satLabels.addTo(satMap);else satLabels.remove();$('satLbl').setAttribute('aria-pressed',on);$('satLbl').textContent=on?'🏷️ להסתיר שמות':'🏷️ להציג שמות'}
$('satLbl').onclick=()=>setSatLabels($('satLbl').getAttribute('aria-pressed')!=='true');
$('satHintBtn').onclick=()=>{$('satHint').hidden=!$('satHint').hidden};
function openSat(p,btn,c){satReturn=btn;$('sat').hidden=false;
 if(!satMap){satMap=L.map('satMap',{zoomControl:true,attributionControl:true,minZoom:2,maxZoom:17,worldCopyJump:true,tap:false});
  satMap.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:17,maxNativeZoom:17,
   attribution:'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'}).addTo(satMap);
  satLabels=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:17,maxNativeZoom:17,attribution:'Labels &copy; Esri'});
  satPin=L.circleMarker([0,0],{radius:9,color:'#fff',weight:3,fillColor:'#e63946',fillOpacity:1}).addTo(satMap)}
 satMap.invalidateSize();satMap.setView([p.lat,p.lon],satZoom(p),{animate:false});satPin.setLatLng([p.lat,p.lon]);setSatLabels(false);$('satHint').hidden=true;$('satHint').textContent='💡 הנקודה האדומה היא המקום. '+(SATHINT[c]||'');$('satEarth').href=earthURL(p);$('satNear').textContent=p.near;$('sat').hidden=false;document.body.classList.add('noscroll');$('satClose').focus()}
function closeSat(){$('sat').hidden=true;document.body.classList.remove('noscroll');if(satReturn)satReturn.focus()}
$('satClose').onclick=closeSat;document.addEventListener('keydown',e=>{if($('sat').hidden)return;if(e.key==='Escape')return closeSat();
 if(e.key==='Tab'){const f=[...$('sat').querySelectorAll('button,a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>!x.hidden&&x.offsetParent);if(!f.length)return;
  const a=f[0],b=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}else if(!$('sat').contains(document.activeElement)){e.preventDefault();a.focus()}}});
function earthURL(p){const dist=Math.round(Math.min(16000000,Math.max(250000,p.r*360000)));return `https://earth.google.com/web/@${p.lat},${p.lon},0a,${dist}d,35y,0h,0t,0r`}

/* ---------- continents ---------- */
const CN={asia:'אסיה',europe:'אירופה',africa:'אפריקה',namerica:'אמריקה הצפונית',samerica:'אמריקה הדרומית',oceania:'אוסטרליה ואוקיאניה',antarctica:'אנטארקטיקה'};
const CC={asia:'#E07A5F',europe:'#9C89B8',africa:'#F0A04B',namerica:'#4F9A7E',samerica:'#97C05C',oceania:'#D17FA6',antarctica:'#F4F7FA'};
function fixWinding(g){if(!g||g.type!=='MultiPolygon')return g;g.coordinates=g.coordinates.map(p=>d3.geoArea({type:'Polygon',coordinates:p})>2*Math.PI?p.map(r=>[...r].reverse()):p);return g}
GEO.cont.forEach(f=>fixWinding(f.geometry));for(const k in GEO.pieces)fixWinding(GEO.pieces[k]);for(const k in GEO.detail)fixWinding(GEO.detail[k]);
// French Guiana is part of France in the source data: colour it with South America, not Europe.
(()=>{const sa=GEO.cont.find(f=>f.properties.c==='samerica');for(const f of GEO.cont){if(f.properties.c!=='europe')continue;const g=f.geometry;if(g.type!=='MultiPolygon')continue;
 const away=g.coordinates.filter(p=>Math.max(...p[0].map(q=>q[0]))<-30);if(!away.length)continue;
 g.coordinates=g.coordinates.filter(p=>!away.includes(p));GEO.cont.push({type:'Feature',properties:{c:'samerica'},geometry:{type:'MultiPolygon',coordinates:away}})}})();
const CONT=GEO.cont;
const PIECES={chukotka:{type:'Feature',properties:{c:'piece'},geometry:GEO.pieces.chukotka},wafrica:{type:'Feature',properties:{c:'piece'},geometry:GEO.pieces.wafrica}};
const grat=d3.geoGraticule10();

/* ---------- globe component ---------- */
function makeGlobe(box,{size=260,rotate=[-20,-20],piece=null,labels=[],onTap=null,onMove=null,uniform=false}={}){
 const svg=el('svg',{class:'globe',viewBox:`0 0 ${size} ${size}`,width:size,height:size,role:'img','aria-label':'גלובוס. אפשר לסובב עם האצבע או העכבר.'},box);
 const proj=d3.geoOrthographic().scale(size/2-4).translate([size/2,size/2]).rotate(rotate).clipAngle(90).precision(.5);
 const path=d3.geoPath(proj);
 const sphere=el('path',{fill:'#9fd3f0',stroke:'#5b8db0','stroke-width':1.5},svg);
 const g=el('path',{fill:'none',stroke:'#ffffff','stroke-opacity':.55,'stroke-width':.6},svg);
 const lands=CONT.map(f=>({f,p:el('path',{fill:CC[f.properties.c],stroke:CC[f.properties.c],'stroke-width':.8},svg)}));
 let pp=null,ph=null;if(piece){ph=el('path',{fill:'#FFE000',stroke:'#FFE000','stroke-width':6,'stroke-linejoin':'round'},svg);pp=el('path',{fill:'#FFE000',stroke:'#7a5a00','stroke-width':1},svg)}
 const lab=el('g',{},svg);
 const api={svg,proj,labels:[...labels],render(){
   sphere.setAttribute('d',path({type:'Sphere'}));g.setAttribute('d',path(grat));
   for(const l of lands)l.p.setAttribute('d',path(l.f)||'');
   if(pp){pp.setAttribute('d',path(piece)||'');ph.setAttribute('d',path(piece)||'')}
   lab.innerHTML='';const c=proj.invert([size/2,size/2]);
   for(const L of api.labels){if(d3.geoDistance([L.lon,L.lat],c)>1.35)continue;const [x,y]=proj([L.lon,L.lat]);
     if(L.dot)el('circle',{cx:x,cy:y,r:6,fill:'#e63946',stroke:'#fff','stroke-width':2},lab);
     if(L.t){const t=el('text',{x,y:y+(L.dot?-10:0),'text-anchor':'middle','font-size':13,'font-weight':700,fill:'#0b2a47',stroke:'#fff','stroke-width':3,'paint-order':'stroke'},lab);t.textContent=L.t}}
   onMove&&onMove(api)},
  center(){return proj.invert([size/2,size/2])},
  turnTo(lon,lat,ms=900){const r0=proj.rotate(),r1=[-lon,-lat,0];let d0=r1[0]-r0[0];d0=((d0+540)%360)-180;const t0=performance.now();
   const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const step=now=>{let k=reduce?1:Math.min(1,(now-t0)/ms);k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;proj.rotate([r0[0]+d0*k,r0[1]+(r1[1]-r0[1])*k,0]);api.render();if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}};
 // drag / tap
 let start=null,moved=0;
 svg.addEventListener('pointerdown',e=>{svg.setPointerCapture(e.pointerId);start={x:e.clientX,y:e.clientY,r:proj.rotate()};moved=0;e.preventDefault()});
 svg.addEventListener('pointermove',e=>{if(!start)return;const k=(svg.getBoundingClientRect().width/size);const s=75/(proj.scale()*k)*1.6;
   const dx=e.clientX-start.x,dy=e.clientY-start.y;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));
   proj.rotate([start.r[0]+dx*s,Math.max(-88,Math.min(88,start.r[1]-dy*s)),0]);api.render()});
 const end=e=>{if(!start)return;if(moved<6&&onTap){const b=svg.getBoundingClientRect();const pt=[(e.clientX-b.left)*size/b.width,(e.clientY-b.top)*size/b.height];
   const ll=proj.invert(pt);if(ll&&d3.geoDistance(ll,api.center())<1.55)onTap(hit(ll))}start=null};
 svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',()=>{start=null});
 // keyboard
 svg.tabIndex=0;svg.addEventListener('keydown',e=>{const r=proj.rotate();const m={ArrowLeft:[10,0],ArrowRight:[-10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!m)return;e.preventDefault();proj.rotate([r[0]+m[0],Math.max(-88,Math.min(88,r[1]+m[1])),0]);api.render()});
 function hit(ll){if(piece&&d3.geoContains(piece,ll))return 'piece';for(const f of CONT)if(d3.geoContains(f,ll))return f.properties.c;return 'water'}
 api.hit=hit;api.render();return api;
}
// Flat map (centre 0°): drop wrap-around slivers so each continent sits on one side only.
// Asia/Europe bits west of -160° (Chukotka, Wrangel) and North-America bits east of +165° (western Aleutians) are hidden;
// rings crossing the 180° line (Fiji) are clamped to the eastern side. The globe keeps the full data.
function flatCont(center){if(center!==0)return CONT;
 return CONT.map(f=>{const g=f.geometry,c=f.properties.c;const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;
  const keep=[];for(const p of polys){const xs=p[0].map(q=>q[0]);const mn=Math.min(...xs),mx=Math.max(...xs);
   if((c==='asia'||c==='europe'||c==='oceania')&&mx<-160)continue;
   if(c==='namerica'&&mn>165)continue;
   if(c!=='antarctica'&&mx-mn>300){keep.push(p.map(r=>r.map(([x,y])=>[x<0?180:x,y])));continue}
   keep.push(p)}
  return {type:'Feature',properties:f.properties,geometry:{type:'MultiPolygon',coordinates:keep}}})}
function makeFlat(box,{width=360,center=0,piece=null,labels=[],onTap=null}={}){
 const H=width/2;const svg=el('svg',{viewBox:`0 0 ${width} ${H}`,width,height:H,role:'img','aria-label':'מפה שטוחה של העולם'},box);
 const proj=d3.geoEquirectangular().scale(width/(2*Math.PI)).translate([width/2,H/2]).rotate([-center,0]).precision(.5);
 const path=d3.geoPath(proj);
 el('path',{d:path({type:'Sphere'}),fill:'#9fd3f0',stroke:'#5b8db0','stroke-width':1.5},svg);
 el('path',{d:path(grat)||'',fill:'none',stroke:'#fff','stroke-opacity':.55,'stroke-width':.6},svg);
 const FC=flatCont(center);
 for(const f of FC)el('path',{d:path(f)||'',fill:CC[f.properties.c],stroke:CC[f.properties.c],'stroke-width':.8},svg);
 if(piece){el('path',{d:path(piece)||'',fill:'#FFE000',stroke:'#FFE000','stroke-width':5,'stroke-linejoin':'round'},svg);el('path',{d:path(piece)||'',fill:'#FFE000',stroke:'#7a5a00','stroke-width':1},svg)}
 if(piece){const c=d3.geoCentroid(piece);let [x,y]=proj(c);x=Math.max(14,Math.min(width-14,x));el('circle',{cx:x,cy:y,r:13,fill:'none',stroke:'#e63946','stroke-width':2.5,'stroke-dasharray':'5 3'},svg)}
 const lab=el('g',{},svg);
 const api={svg,proj,setLabels(L){lab.innerHTML='';for(const l of L){const [x,y]=proj([l.lon,l.lat]);
   if(l.dot)el('circle',{cx:x,cy:y,r:5,fill:'#e63946',stroke:'#fff','stroke-width':2},lab);
   if(l.t){const t=el('text',{x:Math.max(30,Math.min(width-30,x)),y:y+(l.dot?-9:0),'text-anchor':'middle','font-size':12,'font-weight':700,fill:'#0b2a47',stroke:'#fff','stroke-width':3,'paint-order':'stroke'},lab);t.textContent=l.t}}}};
 api.setLabels(labels);
 if(onTap)svg.addEventListener('click',e=>{const b=svg.getBoundingClientRect();const ll=proj.invert([(e.clientX-b.left)*width/b.width,(e.clientY-b.top)*H/b.height]);
   let r='water';if(piece&&d3.geoContains(piece,ll))r='piece';else for(const f of FC)if(d3.geoContains(f,ll)){r=f.properties.c;break}onTap(r)});
 return api;
}
function legend(box,lead){const d=h('div',{class:'legend'});if(lead)d.insertAdjacentHTML('beforeend',`<b>${lead}</b>`);for(const k in CN)d.insertAdjacentHTML('beforeend',`<span><i style="background:${CC[k]}"></i>${CN[k]}</span>`);box.append(d)}
function stageWidth(){return Math.min($('stage').clientWidth||360,620)-14}

/* ---------- shell ---------- */
const TITLES={journey:'✈️ מסע מושגים',compare:'🌐 גלובוס מול מפה',detective:'🔎 בלשי המפה',find:'🧩 מוצאים במפה'};
const ORDER=['journey','compare','detective','find'];
let mode=null,M=null,hintStage=0,hintFn=null;
function show(s){['hub','game','end'].forEach(x=>$(x).hidden=x!==s);window.scrollTo(0,0)}
const STRETCH=10;let streak=0,autoT=null,tenNext=null;
let isSolved=false,carry='';
function setProgress(){const s=$('segs');s.innerHTML='';const solved=isSolved,k=streak%STRETCH,n=solved?(k===0&&streak>0?STRETCH:k):k,cur=solved?n:k+1;for(let j=0;j<STRETCH;j++){s.append(h('div',{class:'seg'+(j<n?' done':(!solved&&j===k)?' cur':'')}))}$('ptext').textContent=`תרגיל ${cur} מתוך ${STRETCH}`}
function stopAuto(){clearTimeout(autoT);autoT=null}
/* An exercise was finished correctly: count it and go straight on.
   The feedback and explanation travel to the top of the next exercise, so nothing has to wait. */
function solvedStep(fn,note){
 isSolved=true;streak++;setProgress();
 const fbHTML=$('fb').innerHTML,learnHTML=$('learn').hidden?'':$('learn').innerHTML;
 carry=fbHTML+(learnHTML?'<br>'+learnHTML:'')+(note?'<div class="roundnote">'+note+'</div>':'');
 const go=()=>{stopAuto();if(!mode||$('game').hidden)return;if(streak%STRETCH===0){tenNext=fn;show('end');$('again').focus();return}window.scrollTo(0,0);fn()};
 stopAuto();autoT=setTimeout(function tick(){if(!$('sat').hidden||!$('fbsheet').hidden){autoT=setTimeout(tick,500);return}go()},900);
}
function resetStep(){stopAuto();isSolved=false;if(carry){$('prev').innerHTML=carry;$('prev').hidden=false;carry=''}else $('prev').hidden=true;$('hintBtn').after($('helpTurn'));$('fb').textContent='';$('fb').className='';$('hint').hidden=true;$('learn').hidden=true;$('acts').hidden=true;$('helpTurn').hidden=true;hintStage=0;wrongs=0;$('stage').innerHTML='';[...$('acts').children].forEach(x=>{if(x.id!=='next')x.remove()})}
let wrongs=0;
function say(msg,ok){$('fb').textContent=msg;$('fb').className=ok?'success':'tryagain';if(ok){wrongs=0}else if(++wrongs>=2&&hintStage===0&&hintFn){hintFn(++hintStage)}}
function showHint(t){$('hint').textContent='💡 '+t;$('hint').hidden=false}
function nextBtn(label,fn){$('next').textContent=label;$('next').onclick=fn;$('acts').hidden=false;setTimeout(()=>$('acts').scrollIntoView({block:'nearest',behavior:'smooth'}),50)}
$('hintBtn').onclick=()=>{if(hintFn)hintFn(++hintStage)};
function start(m){stopAuto();streak=0;carry='';mode=m;document.body.dataset.mode=m;$('modeTitle').textContent=TITLES[m];trackTab(TAB_PREFIX+'/'+m);show('game');({journey:jStart,compare:cStart,detective:dStart,find:fStart})[m]()}
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>start(b.dataset.mode));
$('back').onclick=()=>{stopAuto();mode=null;show('hub')};$('menu').onclick=()=>{stopAuto();mode=null;show('hub')};
$('again').onclick=()=>{show('game');const f=tenNext;tenNext=null;if(f)f()};
function options(list,correct,onPick,cls=''){ // list of strings
 const box=h('div',{class:'opts '+cls});let done=false;
 for(const t of list){const b=h('button',{class:'opt',type:'button'});b.textContent=t;b.onclick=()=>{if(done)return;
   if(t===correct){done=true;b.classList.add('right');box.querySelectorAll('.opt').forEach(x=>{if(x!==b)x.disabled=true});onPick(true,t)}
   else{b.classList.add('wrongpick');b.disabled=true;onPick(false,t)}};box.append(b)}
 return box}

/* ---------- 1. journey ---------- */
function jStart(){const last=M&&M.deck&&M.deck[M.deck.length-1]&&M.deck[M.deck.length-1].c;let d=shuffle(CONCEPTS);if(d.length>1&&d[0]===last)d.push(d.shift());M={deck:d.map(c=>({c,p:PLACES[c][rnd(PLACES[c].length)]})),i:0};jStep()}
function drawPlace(box,p){
 const W=Math.min(stageWidth(),420),H=Math.round(W*0.62);
 const svg=el('svg',{class:'globe',viewBox:`0 0 ${W} ${H}`,width:W,height:H,role:'img','aria-label':'כדור הארץ עם המקום המסומן. אפשר לסובב עם האצבע, העכבר או החצים.'},box);svg.style.margin='auto';svg.style.borderRadius='10px';
 const fit=Math.min(W,H)/2-6,far=p.r>=30;const R0=far?fit:(Math.min(W,H)/2)/Math.sin(p.r*Math.PI/180);
 const RMIN=fit,RMAX=Math.max(R0*3,fit*3);
 const proj=d3.geoOrthographic().rotate([-p.lon,-p.lat]).scale(R0).translate([W/2,H/2]).clipAngle(90).clipExtent([[0,0],[W,H]]).precision(.3);
 const path=d3.geoPath(proj);
 const detail=p.d?{type:'Feature',geometry:GEO.detail[p.d]}:null;
 // detail land is drawn only while the whole frame lies inside its box, so a box edge (seam) can never show
 function useDetail(){const [lon,lat]=proj.invert([W/2,H/2]),k=Math.cos(lat*Math.PI/180);
  const frame=Math.asin(Math.min(1,Math.hypot(W,H)/2/proj.scale()))*180/Math.PI;
  return GEO.dbox[p.d].some(([w,s,e,n])=>Math.min(lat-s,n-lat,(lon-w)*k,(e-lon)*k)>frame*1.15)}
 el('rect',{width:W,height:H,fill:'#eaf2f9',rx:10},svg);
 const sph=el('path',{fill:'#5aa9dc',stroke:'#3f7fae','stroke-width':1},svg);
 const gr=el('path',{fill:'none',stroke:'#fff','stroke-opacity':.25,'stroke-width':.6},svg);
 const cg=el('g',{},svg);const cp=CONT.map(f=>({f,e:el('path',{fill:'#b8cf8a',stroke:'#b8cf8a','stroke-width':.8},cg)}));
 const dp=detail?el('path',{fill:'#b8cf8a',stroke:'#b8cf8a','stroke-width':1.6,'stroke-linejoin':'round'},svg):null;
 const ring=el('circle',{r:far?28:22,fill:'none',stroke:'#ffdf2b','stroke-width':3,'stroke-dasharray':'6 4'},svg);
 const dot=el('circle',{r:4.5,fill:'#e63946',stroke:'#fff','stroke-width':1.5},svg);
 // mini-globe inset (whole Earth, turns along, dot on the place) – shown while zoomed in
 const MS=Math.round(Math.min(84,H*0.36)),mg=el('g',{transform:'translate(6,6)','pointer-events':'none'},svg);
 const mproj=d3.geoOrthographic().scale(MS/2-2).translate([MS/2,MS/2]).clipAngle(90).precision(1),mpath=d3.geoPath(mproj);
 el('circle',{cx:MS/2,cy:MS/2,r:MS/2,fill:'#fff',opacity:.9},mg);const msph=el('path',{fill:'#5aa9dc',stroke:'#203b5c','stroke-width':1},mg);
 const mland=el('path',{fill:'#b8cf8a'},mg);const mdot=el('circle',{r:3.5,fill:'#e63946',stroke:'#fff','stroke-width':1.2},mg);
 const LANDALL={type:'FeatureCollection',features:CONT};
 function render(){sph.setAttribute('d',path({type:'Sphere'})||'');gr.setAttribute('d',path(grat)||'');
  for(const c of cp)c.e.setAttribute('d',path(c.f)||'');
  if(detail){const use=useDetail();dp.setAttribute('d',use?path(detail)||'':'');cg.style.display=use?'none':''}
  const c=proj.invert([W/2,H/2]);const vis=d3.geoDistance([p.lon,p.lat],c)<Math.PI/2-0.02;const [x,y]=proj([p.lon,p.lat]);
  for(const e of [ring,dot]){e.setAttribute('cx',x);e.setAttribute('cy',y);e.style.display=vis?'':'none'}
  const zoomed=proj.scale()>fit*1.4;mg.style.display=zoomed?'':'none';
  if(zoomed){mproj.rotate(proj.rotate());msph.setAttribute('d',mpath({type:'Sphere'}));mland.setAttribute('d',mpath(LANDALL)||'');const mv=d3.geoDistance([p.lon,p.lat],mproj.invert([MS/2,MS/2]))<Math.PI/2-0.02;const [mx,my]=mproj([p.lon,p.lat]);mdot.setAttribute('cx',mx);mdot.setAttribute('cy',my);mdot.style.display=mv?'':'none'}
  whole.hidden=!zoomed||flying;
  svg.dataset.scale=Math.round(proj.scale());home.hidden=flying||Math.abs(proj.scale()-R0)<1&&d3.geoDistance([p.lon,p.lat],c)<0.01}
 // drag + pinch (touch-action:none only on this svg, page scrolls elsewhere)
 const pts=new Map();let st=null;
 const begin=()=>{const a=[...pts.values()];st={r:proj.rotate(),s:proj.scale(),a:a.map(q=>({...q})),d:a.length>1?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0}};
 svg.addEventListener('pointerdown',e=>{flyTok++;flying=false;svg.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});begin();e.preventDefault()});
 svg.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId)||!st)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const a=[...pts.values()];
  if(a.length>1&&st.d>0){const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);proj.scale(Math.max(RMIN,Math.min(RMAX,st.s*d/st.d)));render();return}
  const k=svg.getBoundingClientRect().width/W,sen=75/(proj.scale()*k)*1.6;const dx=a[0].x-st.a[0].x,dy=a[0].y-st.a[0].y;
  proj.rotate([st.r[0]+dx*sen,Math.max(-88,Math.min(88,st.r[1]-dy*sen)),0]);render()});
 const up=e=>{pts.delete(e.pointerId);if(pts.size)begin();else st=null};
 svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
 svg.tabIndex=0;svg.addEventListener('keydown',e=>{const r=proj.rotate(),m={ArrowLeft:[10,0],ArrowRight:[-10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];
  if(m){e.preventDefault();proj.rotate([r[0]+m[0],Math.max(-88,Math.min(88,r[1]+m[1])),0]);render()}
  else if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.5)}else if(e.key==='-'){e.preventDefault();zoom(1/1.5)}});
 function zoom(f){flyTok++;flying=false;proj.scale(Math.max(RMIN,Math.min(RMAX,proj.scale()*f)));render()}
 let flyTok=0,flying=false;
 function flyScale(to,ms,delay=0){flying=true;const tok=++flyTok,from=proj.scale(),t0=performance.now()+delay,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){flying=false;proj.scale(to);render();return}
  const stp=now=>{if(tok!==flyTok)return;let k=Math.max(0,Math.min(1,(now-t0)/ms));if(k>=1)flying=false;k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;proj.scale(from*Math.pow(to/from,k));render();if(k<1)requestAnimationFrame(stp)};requestAnimationFrame(stp)}
 const bar=h('div',{class:'globebar'});
 const zi=h('button',{type:'button',class:'secondary mini','aria-label':'להתקרב'});zi.textContent='+';zi.onclick=()=>zoom(1.5);
 const zo=h('button',{type:'button',class:'secondary mini','aria-label':'להתרחק'});zo.textContent='−';zo.onclick=()=>zoom(1/1.5);
 const home=h('button',{type:'button',class:'secondary mini'});home.textContent='↺ חזרה למקום';
 home.onclick=()=>{flyTok++;flying=false;const r0=proj.rotate(),s0=proj.scale(),r1=[-p.lon,-p.lat,0];let d0=((r1[0]-r0[0]+540)%360)-180;const t0=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stp=now=>{let k=reduce?1:Math.min(1,(now-t0)/700);k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;proj.rotate([r0[0]+d0*k,r0[1]+(r1[1]-r0[1])*k,0]);proj.scale(s0+(R0-s0)*k);render();if(k<1)requestAnimationFrame(stp)};requestAnimationFrame(stp)};
 const whole=h('button',{type:'button',class:'secondary mini'});whole.textContent='🌍 כל הכדור';
 whole.onclick=()=>{const r=proj.rotate();flyScale(fit,700)};
 bar.append(zi,zo,whole,home);box.append(bar);
 const cap=h('div',{class:'maplabel'});cap.style.display='block';cap.innerHTML='🟡 המקום המסומן · ירוק = יבשה · כחול = מים<br>👆 אפשר לסובב את הכדור באצבע';box.append(cap);
 if(!far){proj.scale(fit);render();flyScale(R0,1500,500)}else render();
 return {proj,render,svg};
}
function jStep(){
 if(M.i>=M.deck.length)return jStart();resetStep();const {deck,i}=M;
 setProgress();const {c,p}=deck[i];
 $('task').textContent=`טסים למקום מסתורי: ${p.near}. מה רואים במקום המסומן?`;
 const box=h('div',{class:'mapbox'});$('stage').append(box);drawPlace(box,p);
 const a=h('button',{class:'ge',type:'button'});a.textContent='🛰️ טסים לשם – תצלום לוויין';a.onclick=()=>openSat(p,a,c);box.append(a);
 const q=h('div');q.innerHTML='<div style="font-weight:700;margin-top:6px">מה רואים שם?</div>';$('stage').append(q);
 hintFn=k=>showHint(k===1?SEEHINT[c]+' אפשר לסובב את הכדור או להתרחק עם „−” כדי לראות מה יש מסביב.':'לוחצים על „טסים לשם” לתצלום לוויין. '+SEEHINT[c]);
 q.append(options(shuffle(SEE[c]),SEE[c][0],ok=>{
   if(!ok){say('↺ כמעט. מסתכלים שוב על המפה ומנסים עוד פעם.',false);return}
   say('✓ נכון, זה מה שרואים שם!',true);jName(c,p)}));
}
function jName(c,p){
 const q=h('div');q.innerHTML='<div style="font-weight:700;margin-top:8px">אז איך קוראים לזה?</div>';$('stage').append(q);
 $('task').textContent='איזה מושג מתאים למה שרואים שם?';$('hint').hidden=true;hintStage=0;
 hintFn=k=>showHint(k===1?'חוזרים למה שרואים שם: '+SEE[c][0]+'.':'המושג שמתאים הוא: „'+DEF[c]+'”');
 const opts=shuffle([c,...shuffle(CONCEPTS.filter(x=>x!==c)).slice(0,3)]);
 q.append(options(opts,c,(ok,t)=>{
   if(!ok){say(`↺ לא בדיוק. ${t}: ${DEF[t]} ננסה שוב.`,false);return}
   say(`✓ נכון! ${p.n} – זה ${c}.`,true);
   $('learn').innerHTML=`<b>${c}</b> – ${DEF[c]}`;$('learn').hidden=false;
   solvedStep(()=>{M.i++;jStep()},M.i+1>=M.deck.length?'🌍 ביקרתם אצל כל שבעת המושגים! עכשיו כותבים בספר, במילים שלכם, מה זה כל מושג.':'');
   setTimeout(()=>$('acts').scrollIntoView({block:'nearest',behavior:'smooth'}),50)},'two'));
 setTimeout(()=>q.scrollIntoView({block:'nearest',behavior:'smooth'}),50);
}

/* ---------- 2. compare ---------- */
const CTASKS=[
 {id:'pacific',t:'מוצאים בגלובוס את האוקיינוס השקט (המים הגדולים בין אסיה לאמריקה). עכשיו מחפשים אותו במפה השטוחה. איפה הוא?',
  o:['חצי בקצה ימין וחצי בקצה שמאל','באמצע המפה','הוא לא מופיע במפה'],ok:'נכון! במפה השטוחה האוקיינוס השקט נחתך לשני חלקים, אחד בכל קצה.',
  h1:'מסובבים את הגלובוס עד שרואים כמעט רק מים כחולים.',turn:[-165,0],labels:[{lon:-150,lat:5,t:'השקט'}],flat:[{lon:-155,lat:0,t:'השקט'},{lon:165,lat:0,t:'השקט'}]},
 {id:'bering',t:'מוצאים בגלובוס את אלסקה (אמריקה הצפונית) ואת רוסיה (אסיה), למעלה. הן קרובות או רחוקות? ומה במפה השטוחה?',
  o:['בגלובוס קרובות, במפה רחוקות','בגלובוס רחוקות, במפה קרובות','קרובות בשניהם'],ok:'נכון! בגלובוס הן כמעט נוגעות. במפה השטוחה כל אחת נמצאת בקצה אחר.',
  h1:'מסובבים את הגלובוס כך שהחלק העליון של האוקיינוס השקט יהיה באמצע.',turn:[-170,55],labels:[{lon:-169,lat:66,dot:1,t:'כאן'}],flat:[{lon:-169,lat:66,dot:1},{lon:179,lat:66,dot:1}]},
 {id:'antarctica',t:'מסובבים את הגלובוס למטה ומוצאים את אנטארקטיקה. איך היא נראית במפה השטוחה?',
  o:['פס ארוך לאורך כל התחתית','עיגול קטן, כמו בגלובוס','היא לא מופיעה במפה'],ok:'נכון! בגלובוס אנטארקטיקה עגולה, ובמפה השטוחה היא נמתחת לפס ארוך.',
  h1:'אנטארקטיקה היא היבשת הלבנה ליד הקוטב הדרומי.',turn:[0,-75]},
 {id:'greenland',t:'גרינלנד היא האי הגדול למעלה. בגלובוס היא קטנה בהרבה מאוסטרליה (יותר מפי 3). ובמפה השטוחה?',
  o:['במפה היא נראית כמעט בגודל של אוסטרליה','במפה היא קטנה בהרבה מאוסטרליה, כמו בגלובוס','במפה לא רואים אותה'],ok:'נכון! בגלובוס גרינלנד קטנה בהרבה מאוסטרליה, ובמפה השטוחה היא נראית כמעט באותו גודל.',
  h1:'מוצאים במפה השטוחה את גרינלנד (למעלה) ואת אוסטרליה (למטה, מימין). מי נראית גדולה יותר?',turn:[-40,55],labels:[{lon:-41,lat:73,t:'גרינלנד'},{lon:134,lat:-25,t:'אוסטרליה'}],flat:[{lon:-41,lat:74,t:'גרינלנד'},{lon:134,lat:-25,t:'אוסטרליה'}]},
 {id:'whole',t:'מנסים לראות את כל העולם בבת אחת. איפה זה אפשרי?',
  o:['במפה השטוחה רואים הכול, בגלובוס רק חצי','בגלובוס רואים הכול, במפה רק חצי','בשניהם רואים רק חצי'],ok:'נכון! בגלובוס צריך לסובב כדי לראות את הצד השני.',
  h1:'בגלובוס, אפשר לראות את הצד האחורי בלי לסובב?'},
 {id:'carry',t:'מדמיינים שיוצאים לטיול. מה קל יותר לקפל ולשים בתיק?',
  o:['מפה שטוחה','גלובוס'],ok:'נכון! את המפה אפשר לקפל ולשים בתיק, ואת הגלובוס לא.',h1:'מה מהשניים אפשר לקפל?'}
];
function cStart(){const last=M&&M.deck&&M.deck[M.deck.length-1];let d=shuffle(CTASKS);if(d.length>1&&d[0]===last)d.push(d.shift());M={deck:d,i:0};cStep()}
function cStep(){
 if(M.i>=M.deck.length)return cStart();
 resetStep();const {deck,i}=M;
 setProgress();const T=deck[i];$('task').textContent=T.t;
 const W=stageWidth();const duo=h('div',{class:'duo'});$('stage').append(duo);
 const gb=h('div',{class:'mapbox'});duo.append(gb);const info=h('div',{class:'maplabel'});
 const tap=r=>{info.innerHTML=`<span class="tapinfo">${r==='water'?'כאן יש מים 💧':'זו '+CN[r]}</span><span>גוררים כדי לסובב</span>`};
 const G=makeGlobe(gb,{size:Math.min(innerWidth>=900?320:innerWidth>=700?260:195,W),rotate:[-30,-25],onTap:tap});gb.append(info);gb.append($('helpTurn'));info.innerHTML='<span>🌐 גלובוס · גוררים כדי לסובב</span><span>לוחצים על יבשה לשם</span>';
 const fbx=h('div',{class:'mapbox'});duo.append(fbx);const F=makeFlat(fbx,{width:Math.min(W,620),onTap:tap});
 legend(fbx,'🗺️ מפה שטוחה:');
 hintFn=k=>{if(k===1)showHint(T.h1);else{showHint(T.h1+(T.turn?' אפשר ללחוץ על „עזרה בסיבוב”.':''));if(T.labels){G.labels=T.labels;G.render()}if(T.flat)F.setLabels(T.flat)}
   if(T.turn&&k>=2){$('helpTurn').hidden=false;$('helpTurn').onclick=()=>{G.turnTo(...T.turn);if(T.labels){G.labels=T.labels}}}};
 const q=h('div');$('stage').append(q);
 q.append(options(shuffle(T.o),T.o[0],ok=>{if(!ok){say('↺ כמעט. מסובבים שוב את הגלובוס ומשווים למפה.',false);return}
   say('✓ '+T.ok,true);solvedStep(()=>{M.i++;cStep()},i+1>=deck.length?'🌐 גיליתם את כל ההבדלים! עכשיו אפשר לחזור לטבלה של תרגיל 23 ולכתוב במילים שלכם.':'')}));
}

/* ---------- 3. detective ---------- */
const DCASES=[
 {piece:'chukotka',center:0,c:[-175,67],side:'בקצה השמאלי, למעלה',ans:'asia',opts:['asia','namerica','europe','oceania'],
  near:{namerica:'כמעט! אלסקה באמת קרובה מאוד, אבל בין החתיכה לאלסקה יש מים (מצר ברינג). עם איזו יבשה היא מחוברת?'},
  ok:'נכון! 🎉 החתיכה הצהובה שייכת לאסיה – זה הקצה של רוסיה. במפה השטוחה היא „נחתכה” ועברה לצד השני של המפה.',
  h:['החתיכה נמצאת למעלה, ליד הקוטב הצפוני, בקצה של האוקיינוס השקט.','מסובבים כך שאלסקה תהיה באמצע הגלובוס. החתיכה ממש לידה.']},
 {piece:'wafrica',center:180,c:[-8,12],side:'בקצה הימני',intro:'זו מפה שהאוקיינוס השקט באמצע שלה. ככה מציירים מפות בחלק מהמדינות. ',ans:'africa',opts:['africa','samerica','europe','asia'],
  near:{samerica:'אמריקה הדרומית רחוקה – יש ביניהן אוקיינוס שלם. עם איזו יבשה החתיכה מחוברת?'},
  ok:'נכון! 🎉 החתיכה הצהובה היא חלק מאפריקה. במפה הזאת אפריקה „נחתכה” לשניים.',
  h:['החתיכה נמצאת קרוב לקו המשווה, ליד האוקיינוס האטלנטי.','מסובבים את הגלובוס עד שרואים את אפריקה באמצע.']}
];
let lastCase=-1;
function dStart(){let k=rnd(DCASES.length);if(DCASES.length>1&&k===lastCase)k=(k+1)%DCASES.length;lastCase=k;M={K:DCASES[k],step:0,found:false};dStep()}
function dStep(){
 resetStep();const K=M.K;setProgress();
 $('task').textContent=(K.intro||'')+`במפה השטוחה יש חתיכת יבשה צהובה ${K.side}. מסובבים את הגלובוס ומוצאים אותה.`;
 const W=stageWidth();const piece=PIECES[K.piece];const duo=h('div',{class:'duo'});$('stage').append(duo);
 const fbx=h('div',{class:'mapbox'});const F=makeFlat(fbx,{width:Math.min(W,620),center:K.center,piece});
 const fl=h('div',{class:'maplabel'});fl.innerHTML='<span>🗺️ מפה שטוחה · מחפשים את הצהוב</span>';fbx.append(fl);
 const gb=h('div',{class:'mapbox'});const info=h('div',{class:'maplabel'});info.innerHTML='<span>🌐 גוררים כדי לסובב את הגלובוס</span>';
 duo.append(gb);duo.append(fbx);
 const q=h('div');
 const G=makeGlobe(gb,{size:Math.min(innerWidth>=900?320:innerWidth>=700?260:220,W),rotate:K.center===180?[-150,-20]:[-20,-30],piece,
   onTap:r=>{info.innerHTML='<span class="tapinfo">'+(r==='piece'?'זו החתיכה הצהובה 🔎':r==='water'?'כאן יש מים 💧':'זו '+CN[r])+'</span>'},
   onMove:g=>{if(M.found)return;if(d3.geoDistance(K.c,g.center())<0.62){M.found=true;found()}}});
 gb.append(info);gb.append($('helpTurn'));legend(gb);$('stage').append(q);
 hintFn=k=>{if(M.found){showHint(k===1?'מסתכלים בגלובוס: בצבע של איזו יבשה החתיכה הצהובה נוגעת?':'אפשר ללחוץ על היבשה שנוגעת בחתיכה, והגלובוס יגיד את השם.');return}
   showHint(K.h[Math.min(k,2)-1]);if(k>=2){$('helpTurn').hidden=false;$('helpTurn').onclick=()=>G.turnTo(K.c[0],K.c[1]-8)}};
 function found(){say('🔎 מצאתם אותה בגלובוס!',true);$('hint').hidden=true;hintStage=0;$('helpTurn').hidden=true;
   $('task').textContent='מסתכלים על היבשה שנוגעת בחתיכה הצהובה בגלובוס. לאיזו יבשת החתיכה שייכת?';
   q.innerHTML='';q.append(options(shuffle(K.opts.map(x=>CN[x])),CN[K.ans],(ok,t)=>{
     if(!ok){const key=Object.keys(CN).find(x=>CN[x]===t);say('↺ '+(K.near[key]||'מסתכלים שוב על הגלובוס: איזו יבשה נוגעת בחתיכה הצהובה?'),false);return}
     say('✓ '+K.ok,true);
     solvedStep(()=>dStart());
   },'two'));setTimeout(()=>q.scrollIntoView({block:'nearest',behavior:'smooth'}),60)}
 if(d3.geoDistance(K.c,G.center())<0.62){M.found=true;found()}
}

/* ---------- 4. find on map ---------- */
// Two hand-drawn scenes, 400x300. Feature anchor points for numbers.
const SCENES=[
 {land:['M240,0 L236,48 L238,70 L300,74 L314,95 L300,116 L238,120 L232,152 L222,165 L120,168 L98,186 L120,203 L222,206 L232,232 L230,248 L400,248 L400,0 Z',
        'M226,262 L400,262 L400,300 L224,300 Z'],
  island:'M110,62 C150,52 160,90 125,102 C90,112 70,74 110,62 Z',
  sea:'M310,255 C310,232 330,222 350,222 C372,222 390,234 390,255 C390,276 372,286 350,286 C330,286 310,276 310,255 Z',
  extra:'M388,236 L400,236 L400,274 L388,274 Z',
  pts:{'אי':[118,82],'חצי אי':[150,186],'מצר':[262,255],'מפרץ':[278,95],'ים':[350,254],'אוקיינוס':[70,250],'יבשת':[340,120]}},
 {land:['M0,0 L400,0 L400,92 L300,92 L282,96 L276,52 L234,48 L228,94 L200,100 L120,96 L106,102 L104,206 L88,228 L70,206 L68,106 L40,100 L0,106 Z',
        'M150,300 L162,236 L232,210 L320,188 L400,182 L400,300 Z'],
  island:'M190,160 C230,146 258,170 236,186 C214,200 168,186 190,160 Z',
  sea:'M310,266 C310,250 328,242 350,242 C372,242 390,250 390,266 C390,282 372,292 350,292 C328,292 310,282 310,266 Z M318,170 L332,170 L332,254 L318,254 Z',
  pts:{'אי':[214,174],'חצי אי':[86,170],'מצר':[325,222],'מפרץ':[255,74],'ים':[352,268],'אוקיינוס':[50,250],'יבשת':[170,40]}}
];
const DISTRACT=['גלובוס','כדור הארץ'];
function fStart(){
 const s=SCENES[rnd(SCENES.length)],fx=Math.random()<.5,fy=Math.random()<.35;
 const keys=shuffle(CONCEPTS).slice(0,5+rnd(2));const nums=shuffle(keys.map((_,i)=>i+1));
 const items=keys.map((k,i)=>({k,n:nums[i]})).sort((a,b)=>a.n-b.n);
 M={s,fx,fy,items:shuffle(items),i:0};fStep()}
function fStep(){
 if(M.i>=M.items.length)return fStart();
 resetStep();const {s,fx,fy,items,i}=M;
 setProgress();const cur=items[i];
 $('task').textContent=`איזה מושג מתאים למספר ${cur.n}?`;
 const box=h('div',{class:'mapbox'});$('stage').append(box);
 const svg=el('svg',{viewBox:'0 0 400 300',width:Math.min(stageWidth(),520),role:'img','aria-label':'ציור של יבשה ומים עם מספרים'},box);svg.style.margin='auto';
 el('rect',{width:400,height:300,fill:'#3d8fd1',rx:10},svg);
 const g=el('g',{transform:`translate(${fx?400:0},${fy?300:0}) scale(${fx?-1:1},${fy?-1:1})`},svg);
 // waves on ocean
 for(let k=0;k<9;k++)el('path',{d:`M${20+(k%3)*120},${30+Math.floor(k/3)*95} q8,-6 16,0 t16,0`,stroke:'#ffffff70','stroke-width':2,fill:'none'},g);
 for(const d of s.land)el('path',{d,fill:'#b8cf8a',stroke:'#6f8f4e','stroke-width':2.5,'stroke-linejoin':'round'},g);
 if(s.sea)for(const d of s.sea.split(/(?=M)/))el('path',{d,fill:'#3d8fd1'},g);
 if(s.extra)el('path',{d:s.extra,fill:'#b8cf8a'},g);
 el('path',{d:s.island,fill:'#b8cf8a',stroke:'#6f8f4e','stroke-width':2.5},g);
 // a few trees/hills on land
 for(const [x,y] of [[360,30],[300,40]].concat(s.sea?[]:[[60,30],[120,40]]))el('path',{d:`M${x},${y} l7,-12 l7,12 z`,fill:'#6f8f4e'},g);
 for(const it of items){let [x,y]=s.pts[it.k];if(fx)x=400-x;if(fy)y=300-y;
   const ng=el('g',{class:'num'+(it===cur?' cur':items.indexOf(it)<i?' ok':'')},svg);el('circle',{cx:x,cy:y,r:it===cur?15:13},ng);
   const t=el('text',{x,y},ng);t.textContent=items.indexOf(it)<i?'✓':it.n}
 hintFn=k=>showHint(k===1?'מסתכלים סביב המספר: יש שם מים או יבשה? מה מקיף אותו?':'המושג שמתאים הוא: „'+DEF[cur.k]+'”');
 const chips=h('div',{class:'chips'});$('stage').append(chips);
 const all=shuffle([...CONCEPTS,...DISTRACT]);let done=false;
 for(const c of all){const b=h('button',{class:'chip',type:'button'});b.textContent=c;if(items.slice(0,i).some(x=>x.k===c))b.classList.add('used');
   b.onclick=()=>{if(done)return;if(c===cur.k){done=true;b.classList.add('right');b.style.background='#e6f5ec';b.style.borderColor='#3f7d5d';say(`✓ נכון! מספר ${cur.n} הוא ${c}.`,true);
       $('learn').innerHTML=`<b>${c}</b> – ${DEF[c]}`;$('learn').hidden=false;solvedStep(()=>{M.i++;fStep()},i+1>=items.length?'🧩 מצאתם את כל המספרים! לא כל המושגים מופיעים בציור, כמו בתרגיל 27. עכשיו ציור חדש.':'')}
     else{b.disabled=true;say(DEF[c]?`↺ לא בדיוק. ${c}: ${DEF[c]} ננסה שוב.`:(c==='גלובוס'?'↺ גלובוס הוא דגם עגול של כדור הארץ. הוא לא מקום בציור. ננסה שוב.':'↺ כדור הארץ הוא כל העולם שלנו, לא מקום אחד בציור. ננסה שוב.'),false)}};chips.append(b)}
}

/* ---------- feedback form (same setup as the English kit) ---------- */
let fbType='',fbFrom='תפריט';
document.querySelectorAll('.fb').forEach(b=>b.onclick=()=>{fbFrom=!$('game').hidden?(TITLES[mode]||'תרגול'):!$('end').hidden?'סוף סבב':'תפריט';$('fbmsg').textContent='';$('fbsheet').hidden=false;$('fbtext').focus()});
document.querySelectorAll('.fbchip').forEach(c=>c.onclick=()=>{fbType=c.dataset.t;document.querySelectorAll('.fbchip').forEach(x=>x.setAttribute('aria-pressed',x===c))});
$('fbclose').onclick=()=>{$('fbsheet').hidden=true};
const FORM_ACTION='https://api.web3forms.com/submit';
$('fbform').onsubmit=e=>{
 e.preventDefault();const msg=$('fbmsg'),text=$('fbtext').value.trim().slice(0,500);
 if(!fbType&&!text){msg.textContent='אפשר לבחור סוג, או לכתוב כמה מילים.';return}
 const data={type:fbType||'לא נבחר',text,mode:mode?TITLES[mode]:'—',screen:fbFrom,iphone:/iPhone|iPad/.test(navigator.userAgent)?'כן':'לא'};
 const f=document.createElement('form');f.method='POST';f.action=FORM_ACTION;f.target='fbsink';f.hidden=true;
 for(const k in data){const x=document.createElement('input');x.type='hidden';x.name=k;x.value=data[k];f.append(x)}
 for(const [k,v] of [['access_key','445cabfd-7c6f-4743-8149-992818386210'],['subject','דיווח מסע בעולם'],['from_name','מסע בעולם · גאוגרפיה']]){const x=document.createElement('input');x.type='hidden';x.name=k;x.value=v;f.append(x)}
 {const hp=document.createElement('input');hp.type='checkbox';hp.name='botcheck';hp.hidden=true;hp.tabIndex=-1;f.append(hp)}
 document.body.append(f);f.submit();f.remove();
 msg.textContent='✓ תודה, הדיווח נשלח.';$('fbtext').value='';fbType='';
 document.querySelectorAll('.fbchip').forEach(x=>x.setAttribute('aria-pressed','false'));
 setTimeout(()=>{$('fbsheet').hidden=true;msg.textContent=''},1500);
};
// testing hook (no data stored)
window.__geo={start,get M(){return M},DCASES,PLACES,earthURL,satZoom,get satMap(){return satMap},flatCont};
/* Optional deep-link from the subject hub, e.g. ?mode=journey. Default remains the menu. */
{
 const m=new URLSearchParams(location.search).get('mode');
 if(m&&{journey:1,compare:1,detective:1,find:1}[m]) start(m);
}
