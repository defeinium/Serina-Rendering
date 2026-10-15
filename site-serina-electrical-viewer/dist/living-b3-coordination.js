import D from './living-b3-coordination-data.js?v=20261015';
const $=id=>document.getElementById(id),round=Math.round;
const S={room:'living',livingLayout:'original',b3Layout:'split',livingFan:48,b3Fan:33};
const hypot=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function segDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
function rectDistance(p,[x,y,w,h]){return Math.hypot(Math.max(x-p[0],0,p[0]-x-w),Math.max(y-p[1],0,p[1]-y-h));}
function doorDistance(p,hinge,length,right){const vx=(p[0]-hinge[0])*(right?-1:1),vy=p[1]-hinge[1];let d=Math.min(segDistance(p,hinge,[hinge[0]+(right?-length:length),hinge[1]]),segDistance(p,hinge,[hinge[0],hinge[1]+length]));if(vx>=0&&vy>=0)d=Math.min(d,Math.max(0,Math.hypot(vx,vy)-length));return d;}
function calculate(){
 const living=S.room==='living',r=D[S.room],fan=r.points.fan.slice(),size=living?S.livingFan:S.b3Fan,R=size*25.4/2;
 const guide=$('clearance').value,wallLimit=guide==='1000'?1000:guide==='physical'?0:living?600:450,objectLimit=guide==='guide'?(living?600:450):0;
 const metrics=[],add=(id,name,value,limit=objectLimit,note='')=>metrics.push({id,name,value,limit,note,pass:value>=limit});
 let route=null,main=null,leaves=[],lampDiameter=living?+$('living-light').value:+$('b3-light').value,curtain=+(living?$('living-curtain'):$('b3-curtain')).value,doorGap=null;
 if(living){
  const preset=({original:[1000,0],coordinated:[1300,450],large:[1300,500]})[S.livingLayout],feed=r.points.track,turn=[feed[0]+preset[0],feed[1]];route=[feed,turn,[turn[0],turn[1]+2000]];main=[r.points.main[0],r.points.main[1]+preset[1]];
  add('side','Nearest side wall',Math.min(fan[0],r.width-fan[0])-R,wallLimit);
  add('window','Window wall',fan[1]-R,wallLimit);
  add('curtain','Curtain front',fan[1]-R-curtain,wallLimit,`${curtain} mm provisional projection`);
  add('rail','Unlit track centreline',Math.min(...route.slice(1).map((b,i)=>segDistance(fan,route[i],b)))-R,0,'Information only: rail is at ceiling; verify vertical separation from blades');
  const headCentres=[[feed[0]+preset[0]*.62,feed[1]],[turn[0],turn[1]+380],[turn[0],turn[1]+1000],[turn[0],turn[1]+1620]];
  add('heads','Nearest actual track lamp',Math.min(...headCentres.map(p=>hypot(fan,p)))-R-75,objectLimit,'Only the 4 drawn heads; 75 mm reach toward fan assumed');
  add('main','Main-light body',hypot(fan,main)-R-lampDiameter/2,objectLimit,`Ø${lampDiameter} mm actual body target`);
 }else{
  const c=r.wardrobe;
  for(let i=0;i<c.leaves;i++){const right=$('hinges').value==='right'||$('hinges').value==='pairs'&&i%2===1;leaves.push({hinge:[c.left+(i+(right?1:0))*c.nominalLeaf,c.depth],width:c.nominalLeaf,right});}
  doorGap=Math.min(...leaves.map(v=>doorDistance(fan,v.hinge,v.width,v.right)))-R-25;
  add('wall','Nearest side wall',Math.min(fan[0],r.width-fan[0])-R,wallLimit);
  add('window','Window / covering front',r.depth-fan[1]-R-curtain,wallLimit,`${curtain} mm covering projection; measure it`);
  add('closed','Closed wardrobe front',rectDistance(fan,[c.left,0,c.width,c.depth])-R,objectLimit,'600 mm cabinet depth');
  add('sweep','All opened door positions',doorGap,objectLimit,'0–90° upper-door sweep + 25 mm allowance; hinge handing and fan height to verify');
  add('left','Left ceiling-light body',hypot(fan,r.points.left)-R-lampDiameter/2,objectLimit,`Ø${lampDiameter} mm body`);
  add('right','Right ceiling-light body',hypot(fan,r.points.right)-R-lampDiameter/2,objectLimit,`Ø${lampDiameter} mm body`);
 }
 const fails=metrics.filter(m=>!m.pass);
 return {living,room:r,fan,size,R,wallLimit,objectLimit,metrics,fails,route,main,leaves,lampDiameter,curtain,doorGap,guide,assumptions:{trackReach:75,doorAllowance:25}};
}
function draw(v){const {living,room:r}=v,w=r.width,h=living?r.displayDepth:r.depth,s=Math.min(430/w,500/h),ox=65,oy=85,W=590,H=oy+h*s+90;
 const p=([x,y])=>[ox+x*s,oy+y*s],line=(a,b,col='#879588',width=1.5,dash='')=>`<path d="M${a} L${b}" fill="none" stroke="${col}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const txt=(x,y,t,extra='')=>`<text x="${x}" y="${y}" font-size="14" fill="#5b6f62" ${extra}>${t}</text>`;
 const rect=([x,y,ww,hh],col='#dfe5d8',stroke='#b0bdab')=>{const [xx,yy]=p([x,y]);return `<rect x="${xx}" y="${yy}" width="${ww*s}" height="${hh*s}" rx="3" fill="${col}" stroke="${stroke}"/>`;};
 const dim=(a,b,label,vertical=false)=>{const A=p(a),B=p(b);let out=line(A,B,'#a7b2a1',1);for(const q of [A,B])out+=line([q[0]-(vertical?4:0),q[1]-(vertical?0:4)],[q[0]+(vertical?4:0),q[1]+(vertical?0:4)],'#a7b2a1',1);return out+txt((A[0]+B[0])/2+(vertical?7:0),(A[1]+B[1])/2-(vertical?0:7),label,vertical?'': 'text-anchor="middle"');};
 let o=`<rect x="${ox}" y="${oy}" width="${w*s}" height="${h*s}" fill="#fbfcf8"/>`;
 if($('architecture').checked)o+=`<image href="${r.architecture}" x="${ox}" y="${oy}" width="${w*s}" height="${(r.architectureDepth||h)*s}" preserveAspectRatio="none" opacity=".13"/>`;
 if($('electrical').checked)o+=`<image href="${r.electrical}" x="${ox}" y="${oy}" width="${w*s}" height="${(r.electricalDepth||h)*s}" preserveAspectRatio="none" opacity=".56"/>`;
 o+=line(p([0,0]),p([w,0]),'#526957',3)+line(p([0,0]),p([0,h]),'#526957',3)+line(p([w,0]),p([w,h]),'#526957',3);
 if(!living)o+=line(p([0,h]),p([w,h]),'#526957',3);
 else o+=line(p([0,h]),p([w,h]),'#b0bca8',1.5,'5 5')+txt(...p([w/2,h+210]),'OPEN TO DINING','text-anchor="middle"');
 o+=dim([0,-260],[w,-260],w+' mm');
 if(living){
  o+=rect([0,0,w,v.curtain],'#cfdbcb66','#a0b29b');
  o+=rect([100,650,850,2200],'#e6e8df99','#bfcab6');o+=txt(...p([520,2500]),'SOFA','text-anchor="middle"');
  o+=rect([w-300,900,300,1900],'#e6e8df99','#bfcab6');o+=txt(...p([w-160,2200]),'TV','text-anchor="middle"');
  const points=v.route.map(a=>p(a));o+=`<polyline points="${points.map(a=>a.join(',')).join(' ')}" fill="none" stroke="#273e33" stroke-width="7"/>`;
  const arm=v.route[1][0]-v.route[0][0];o+=dim([v.route[0][0],v.route[0][1]-160],[v.route[1][0],v.route[1][1]-160],round(arm)+' mm');
  o+=txt(...p([v.route[1][0]+100,v.route[1][1]+1150]),'2000 mm','transform="rotate(90 '+p([v.route[1][0]+100,v.route[1][1]+1150]).join(' ')+')"');
  for(const f of [[v.route[0][0]+arm*.62,v.route[0][1]],[v.route[1][0],v.route[1][1]+380],[v.route[1][0],v.route[1][1]+1000],[v.route[1][0],v.route[1][1]+1620]]){const [x,y]=p(f);o+=`<circle cx="${x}" cy="${y}" r="${75*s}" fill="#62846966" stroke="#628469"/>`;}
  const a=p(v.main),b=p(r.points.main);if(hypot(v.main,r.points.main)>1)o+=line(a,b,'#ad7147',2,'4 3')+txt(a[0]+42,(a[1]+b[1])/2,round(hypot(v.main,r.points.main))+' mm offset');
  o+=`<circle cx="${a[0]}" cy="${a[1]}" r="${v.lampDiameter*s/2}" fill="#fffdf6" stroke="#ad7147" stroke-width="2"/>`+txt(a[0]-15,a[1]+v.lampDiameter*s/2+22,'Main light');
 }else{
  const c=r.wardrobe;o+=rect([c.left,0,c.width,c.depth],'#d9d3c466','#a48c6b');
  o+=txt(...p([c.left+c.width/2,260]),'1829 × 600 WARDROBE','text-anchor="middle"');
  for(let i=1;i<4;i++)o+=line(p([c.left+i*c.nominalLeaf,0]),p([c.left+i*c.nominalLeaf,c.depth]),'#a48c6b',1);
  for(const leaf of v.leaves){const [hx,hy]=p(leaf.hinge),rad=leaf.width*s,dx=leaf.right?-rad:rad;o+=`<path d="M${hx},${hy} L${hx+dx},${hy} A${rad},${rad} 0 0 ${leaf.right?0:1} ${hx},${hy+rad} Z" fill="#c68c4e22" stroke="#b77b45" stroke-width="1.4" ${S.b3Layout==='split'?'stroke-dasharray="4 3"':''}/>`;}
  o+=txt(...p([c.left+20,1140]),S.b3Layout==='split'?'Hinged loft sweep at blade height':'Full-height door sweep at blade height');
  o+=line(p([0,0]),p([900,0]),'#f9fbf5',5)+line(p([0,0]),p([0,900]),'#8fa38c',1.5);
  o+=txt(...p([80,350]),'ENTRY 900');o+=line(p([700,h]),p([w-150,h]),'#74a5bc',6)+txt(...p([w/2,h+190]),'WINDOW','text-anchor="middle"');
  if(v.curtain)o+=rect([0,h-v.curtain,w,v.curtain],'#a1bfbd44','#8ea9a0');
  for(const k of ['left','right']){const a=p(r.points[k]);o+=`<circle cx="${a[0]}" cy="${a[1]}" r="${v.lampDiameter*s/2}" fill="#fffdf6" stroke="#ad7147" stroke-width="2"/>`;}
  o+=dim([w+150,0],[w+150,h],'2450',true);
 }
 const [fx,fy]=p(v.fan),rad=v.R*s;
 if($('envelopes').checked&&v.objectLimit)o+=`<circle cx="${fx}" cy="${fy}" r="${(v.R+v.objectLimit)*s}" fill="none" stroke="#c6a887" stroke-width="1.2" stroke-dasharray="5 4"/>`;
 o+=`<circle cx="${fx}" cy="${fy}" r="${rad}" fill="#5d856a22" stroke="#4f7c5d" stroke-width="2.5"/>`+txt(fx,fy+35,`${v.size} in / Ø${round(v.R*2)}`,'text-anchor="middle" font-weight="700"');
 for(const [k,pos] of Object.entries(r.points)){const [x,y]=p(pos);o+=`<circle cx="${x}" cy="${y}" r="6" fill="white" stroke="#377da3" stroke-width="2"/>`+line([x-9,y],[x+9,y],'#377da3',1)+line([x,y-9],[x,y+9],'#377da3',1);}
 if(living){o+=dim([-140,0],[-140,v.fan[1]],round(v.fan[1])+' to fan',true);o+=txt(...p([w/2,-75]),'WINDOW / DOUBLE CURTAIN','text-anchor="middle"');}
 else{o+=dim([0,h+360],[v.fan[0],h+360],round(v.fan[0])+' to fan');}
 $('drawing').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${living?'Living room track main light and fan':'Bedroom 3 wardrobe opening and fan'} source registered overlay"><g font-family="Arial, sans-serif">${o}</g></svg>`;
}
function height(){const w=D.b3.wardrobe,top=45,bottom=370,scale=325/2850,z=v=>bottom-v*scale;let s=`<svg viewBox="0 0 520 420" role="img" aria-label="Illustrative height section showing full height doors versus split hinged doors"><rect x="30" y="${z(2850)}" width="155" height="${2850*scale}" fill="#ddd7c9" stroke="#a28e72"/><path d="M20 ${z(2850)}H500" stroke="#465f4a" stroke-width="3"/><path d="M175 ${z(2550)}H415" stroke="#aa543c" stroke-width="5"/><text x="245" y="${z(2550)-12}" fill="#aa543c" font-size="14">Blade height ~2550*</text>`;
 if(S.b3Layout==='split')s+=`<path d="M30 ${z(2260)}H185" stroke="#8d704e" stroke-width="2"/><path d="M80 ${z(2570)}h50m-10-5l10 5-10 5" fill="none" stroke="#427461" stroke-width="2"/><text x="220" y="${z(2260)+15}" font-size="14" fill="#427461">Main door top ~2260*</text><text x="35" y="${z(2560)+30}" font-size="13">Hinged loft</text>`;
 else s+=`<rect x="35" y="${z(2790)}" width="145" height="${2700*scale}" fill="none" stroke="#aa543c" stroke-width="2"/><text x="220" y="${z(2100)}" font-size="14" fill="#aa543c">Full-height door crosses</text><text x="220" y="${z(2100)+22}" font-size="14" fill="#aa543c">the blade-height band</text>`;
 s+=`<text x="28" y="400" font-size="13" fill="#69766c">*Illustrative heights; verify all site/product dimensions.</text></svg>`;$('height-drawing').innerHTML=s;}
function render(){const v=calculate();draw(v);height();
 $('plan-title').textContent=v.living?'Living · '+({original:'current 1 m + 2 m',coordinated:'coordinated 1.3 m + 2 m',large:'48-inch comparison'})[S.livingLayout]:'Bedroom 3 · '+(S.b3Layout==='full'?'full-height comparison':'current hinged loft');
 $('datum').textContent=v.living?'Datum: inside left wall + inside window face. Fan and all existing outlets stay at the original registered centres. Track and main-light offsets in comparison layouts are new proposals.':'Datum: inside left wall + north / wardrobe wall. Original fan and both light outlets stay in place. Wardrobe doors shown through their complete 90° movement.';
 $('metrics').innerHTML=v.metrics.map(m=>`<article class="metric ${m.pass?'pass':'fail'}"><b>${round(m.value)} mm</b><p>${m.name}</p><p class="status">${m.limit?`${round(m.limit)} mm screen · ${m.pass?'meets nominal screen':'below screen'}`:'Physical projection only'}${m.note?'<br>'+m.note:''}</p></article>`).join('');
 $('uncertainty').textContent=D.uncertainty+' Several nominal margins are smaller than this reading sensitivity. Vertical separation, fixture tilt, curtain folds and fan movement remain unmeasured.';
 $('assessment').classList.toggle('bad',v.fails.length>0);$('assessment').textContent=v.guide==='physical'?'Physical projection check only. It does not approve the installation or establish airflow clearance.':v.fails.length?`${v.fails.length} check(s) fall below the selected screen. See each gap below; do not order from diameter alone.`:'The screened light-body / wall gaps meet the nominal guide. Unlit rail height, real product envelopes, site margins and the exact fan manual still need confirmation.';
 if(v.living){$('recommendation-title').textContent='42-inch is the more forgiving target at this original hook.';$('recommendation').innerHTML=`<p><strong>Preferred coordinated study:</strong> retain the fan point, test a 42-inch fan; extend the short track leg to about 1300 mm toward the TV wall, then retain the 2000 mm return toward Dining. Move the Ø470 mm main light about 450 mm toward Dining from its existing outlet.</p><p>This layout leaves about 250 mm from the TV wall to the track centreline. Keep the first head at about 800 mm along the short arm, and the three return heads approximately 380 / 1000 / 1620 mm after the turn. These positions are part of the clearance calculation; do not slide a head toward the original feed without checking again.</p><p>The main light needs an approved surface offset / canopy arrangement; the study does not assume hidden wiring. The unlit rail can be closer in projection than the lamps because it stays at the ceiling; its complete height must still clear the blades.</p><p><strong>48-inch still physically fits the bay.</strong> The current 1000 mm TV-side offset is too tight under the 600 mm light-body guide. The 48-inch comparison uses a 1300 mm short leg and a 500 mm main-light offset; even then a 150 mm double-curtain projection leaves only about 555 mm at the window. It is not a guide-compliant purchase recommendation at the original hook.</p><p>56-inch takes still more space from the curtain, track and main light. I would not select it for this coordinated scheme. A specific fan requiring 1000 mm wall clearance is not approved here, including the 42-inch option at this window-side hook.</p>`;}
 else{$('recommendation-title').textContent='33-inch is a conditional upper target, not a cleared full-height-door layout.';$('recommendation').innerHTML=`<p><strong>Keep the existing fan centre and both light outlets.</strong> Start with two compact Ø200 mm diffuse lights. With a 33-inch blade disk, the light-body gaps are only about 450–465 mm; Ø250–300 mm lamps consume that margin. Verify actual fittings before ordering.</p><p>The four upper hinged doors have a projected gap of about ${round(v.doorGap)} mm to the selected fan through their sweep, including a 25 mm hardware allowance. That is a physical gap, not the 450 mm operating clearance in the small-room guide.</p><p><strong>Preferred cabinet coordination:</strong> use the owner-selected hinged loft fronts aligned with the lower doors. The upper leaves still swing through the blade-height band, so check their complete sweep against the actual fan before fabrication. Splitting the doors alone does not clear a collision.</p><p>33-inch has only about 470 mm to the bare window face before a covering is added. A projecting curtain / blind can change the result. A 30-inch disk with compact lights is a more forgiving comparison, but does not remove the full-height-door issue. Do not increase to 40/42 inches with this wardrobe.</p>`;}
 $('height-section').hidden=v.living;
 $('registration').innerHTML='<table><thead><tr><th>Original point</th><th>X from left / mm</th><th>Y from window (Living) or north wall (B3) / mm</th></tr></thead><tbody>'+Object.entries(v.room.points).map(([k,p])=>`<tr><td>${k==='main'?'Main ceiling light':k==='track'?'Track supply':k==='fan'?'Fan point':k==='left'?'Left ceiling light':'Right ceiling light'}</td><td>${round(p[0])}</td><td>${round(p[1])}</td></tr>`).join('')+'</tbody></table>';
 window.fanCoordination={state:{...S},calculation:v,source:D};
}
function roomSelect(room){S.room=room;const living=room==='living';document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.room===room));$('living-controls').hidden=!living;$('b3-controls').hidden=living;
 $('layout').innerHTML=living?'<option value="original">Current: original points / 1 m + 2 m</option><option value="coordinated">Proposal: 42 in / 1.3 m track / +450 light</option><option value="large">Comparison: 48 in / 1.3 m track / +500 light</option>':'<option value="full">Comparison: full-height swing doors</option><option value="split">Current: main + loft swing doors</option>';$('layout').value=living?S.livingLayout:S.b3Layout;
 $('fan-size').innerHTML=(living?[42,48,52,56]:[30,33,36,40,42]).map(n=>`<option value="${n}">${n} inches / ${round(n*25.4)} mm</option>`).join('');$('fan-size').value=living?S.livingFan:S.b3Fan;render();}
document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>roomSelect(b.dataset.room));
$('layout').onchange=e=>{if(S.room==='living'){S.livingLayout=e.target.value;S.livingFan=e.target.value==='coordinated'?42:48;$('fan-size').value=S.livingFan;}else S.b3Layout=e.target.value;render();};
$('fan-size').onchange=e=>{S[S.room==='living'?'livingFan':'b3Fan']=+e.target.value;render();};
for(const id of ['architecture','electrical','envelopes','living-light','living-curtain','b3-light','b3-curtain','hinges','clearance'])$(id).addEventListener('change',render);
roomSelect('living');
