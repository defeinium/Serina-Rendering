// A simplified navigation map preserving the home's actual spatial relationships.
// The open common area is one continuous target, not separate room controls.
const PUBLIC_PLACES=new Set(['common','living','dining','kitchen','prep','entry','hall']);
export const SPACE_PLAN=[
 ['common','Common|area',[[160,233],[397,233],[397,445],[650,445],[650,520],[397,520],[397,740],[457,740],[457,931],[296,931],[296,875],[160,875]],[278,465]],
 ['b2','Bedroom|2',[416,233,637,435],[526,330]],
 ['master','Master|bedroom',[653,233,888,517],[770,365]],
 ['bath2','Bath|2',[413,535,517,725],[465,617]],
 ['b3','Bedroom|3',[534,535,755,725],[645,617]],
 ['bath1','Bath|1',[771,535,888,725],[830,617]],
 ['yard','Yard',[473,741,559,931],[516,820]],
 ['ledge','AC|ledge',[577,741,627,931],[602,820]],
 ['foyer','Foyer',[160,895,281,931],[225,915]]
];
const PUBLIC_MARKERS={common:[278,710],living:[278,330],dining:[278,625],kitchen:[355,820],prep:[355,820],entry:[205,828],hall:[524,481]};
function roundedOutline(points,r=10){
 const corners=points.map((v,i)=>{const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length],a=Math.hypot(prev[0]-v[0],prev[1]-v[1]),b=Math.hypot(next[0]-v[0],next[1]-v[1]),radius=Math.min(r,a/3,b/3);return {v,before:[v[0]+(prev[0]-v[0])*radius/a,v[1]+(prev[1]-v[1])*radius/a],after:[v[0]+(next[0]-v[0])*radius/b,v[1]+(next[1]-v[1])*radius/b]};});
 return 'M'+corners.at(-1).after.join(',')+corners.map(c=>' L'+c.before.join(',')+' Q'+c.v.join(',')+' '+c.after.join(',')).join('')+' Z';
}
export function createSpacePlan(host,choose){
 const ns='http://www.w3.org/2000/svg',el=(tag,attrs,parent)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e};
 host.className='space-plan-host';
 const svg=el('svg',{viewBox:'140 214 770 734',class:'space-plan','aria-label':'Your home floor plan — select a space',role:'group'},host),drawn=[];
 for(const[key,label,area,centre]of SPACE_PLAN){
  const g=el('g',{'data-quick-place':key,role:'button',tabindex:0,'aria-pressed':'false','aria-label':label.replace('|',' '),class:'space-plan-room'+(key==='common'?' common-plan-room':'')},svg);
  let points;if(Array.isArray(area[0]))points=area;else{const[x,y,x2,y2]=area;points=[[x,y],[x2,y],[x2,y2],[x,y2]];}
  g.dataset.sourcePoints=JSON.stringify(points);el('path',{d:roundedOutline(points)},g);
  const lines=label.split('|'),text=el('text',{x:centre[0],y:centre[1]-(lines.length-1)*15,'text-anchor':'middle','dominant-baseline':'middle','aria-hidden':'true'},g);
  for(const[i,line]of lines.entries()){const span=el('tspan',{x:centre[0],dy:i?30:0},text);span.textContent=line;}
  if(['foyer','ledge','yard'].includes(key))g.classList.add('compact-room');
  g.onclick=()=>choose(key);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();choose(key);}};drawn.push(g);
 }
 // Restrained window hints aid orientation without bringing back drafting clutter.
 const windows=el('g',{'aria-hidden':'true',class:'space-plan-windows'},svg);
 for(const[x1,x2]of [[204,351],[451,603],[697,844]])el('path',{d:`M${x1} 231 H${x2}`},windows);
 // Larger location badge: a simple solid person silhouette, steady outline and soft pulse.
 const marker=el('g',{class:'space-plan-person','aria-hidden':'true',visibility:'hidden'},svg);
 el('circle',{cx:0,cy:0,r:40,class:'person-halo'},marker);
 el('circle',{cx:0,cy:0,r:27,class:'person-badge'},marker);
 el('circle',{cx:0,cy:-10,r:5.5,class:'person-head'},marker);
 el('path',{d:'M-8 0 Q0 -5 8 0 L9 8 Q9 11 5 11 L4 20 H-4 L-5 11 Q-9 11 -9 8 Z',class:'person-body'},marker);
 const caption=document.createElement('p');caption.className='space-plan-caption';caption.setAttribute('role','status');host.append(caption);
 return {sync(location,overview){
  const key=PUBLIC_PLACES.has(location)?'common':location;
  for(const g of drawn){const active=!overview&&g.dataset.quickPlace===key;g.dataset.current=String(active);g.setAttribute('aria-pressed',String(active));if(active)g.setAttribute('aria-current','location');else g.removeAttribute('aria-current');}
  const room=SPACE_PLAN.find(r=>r[0]===key),label=room?.[1].replace('|',' ');
  if(overview||!room){marker.setAttribute('visibility','hidden');svg.dataset.location='overview';caption.textContent='Whole-home view · tap a space to enter';return;}
  let [x,y]=key==='common'?PUBLIC_MARKERS[location]:room[3];
  if(!PUBLIC_PLACES.has(location)){if(key==='foyer'){x=176;y=914;}else if(key==='ledge'){y=884;}else y+=55;}
  marker.setAttribute('transform',`translate(${x} ${y}) scale(${key==='foyer'?.5:1})`);marker.setAttribute('visibility','visible');marker.dataset.place=key;marker.dataset.viewpoint=location;svg.dataset.location=key;
  caption.textContent='You are in '+label;
 }};
}
