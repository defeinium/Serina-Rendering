'use strict';
// Trace the architectural source shell directly. Never reuse the enlarged 3D
// room grid as a surveyed floor plan. Electrical symbols use the same existing
// source registration; no drawing coordinate is a drilling dimension.
const $ = s => document.querySelector(s);
const svg = $('#plan'), canvas = $('#canvas'), NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs={}, parent=svg) => {const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
const text = (parent,x,y,value,cls='item-label',anchor='middle') => {const n=el('text',{x,y,class:cls,'text-anchor':anchor},parent);if(Array.isArray(value)){value.forEach((line,i)=>{const span=el('tspan',{x,dy:i?11:0},n);span.textContent=line;});}else n.textContent=value;return n;};
const path = (parent,points,attrs={}) => el('path',{d:points.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' '),fill:'none',...attrs},parent);
const root=el('g',{id:'drawing-root'});
const groups=Object.fromEntries(['architecture','rooms','furniture','walls','dimensions','lighting','labels'].map(k=>[k,el('g',{'data-layer':k},root)]));
const colours={proposed:'#b26b39',source:'#4f7b9e',unused:'#abb5af',socket:'#7b58a2',switch:'#527f64'};
const items=new Map();let selected=null;
const source=(ex,ey)=>[143+(ex-317)*(757/1008),218+(ey-311)*(724/974)];
// Keep the actual architectural wall/window linework instead of approximating
// it with disconnected generic wall strokes. White floor masks remove the
// developer's illustrative furniture; door leaves are traced at its jambs.
const defs=el('defs',{},svg);
const clip=el('clipPath',{id:'architectural-shell'},defs);
el('rect',{x:135,y:205,width:780,height:745},clip);
el('image',{href:'plan-assets/original-plan-type-a.jpeg',x:0,y:0,width:1080,height:1153,'clip-path':'url(#architectural-shell)',style:'filter:grayscale(1)'},groups.architecture);
const rooms=[
 ['Living',160,233,397,521],['Dining',160,521,397,737],['Kitchen',160,740,457,875],
 ['Foyer',160,895,281,931],['Yard',473,741,559,931],['AC ledge',577,741,627,931],
 ['B2',415,233,637,430],['Master',653,233,888,517],['Hall',397,445,650,520],
 ['Bath 2',413,535,517,725],['B3',534,535,755,725],['Bath 1',771,535,888,725]
];
for(const [name,x,y,x2,y2] of rooms)el('rect',{x,y,width:x2-x,height:y2-y,fill:name.startsWith('Bath')?'#f2f6f7':'#fafbf8'},groups.rooms);
// Clear the wet run and the main-door opening without masking the wall jambs.
for(const [x,y,w,h] of [[296,880,161,51],[160,875,90,20],[560,430,70,15]])el('rect',{x,y,width:w,height:h,fill:'#fafbf8'},groups.rooms);
const door=(id,x,y,r,start,end,sweep=0)=>{
 const g=el('g',{'data-door':id,'data-hinge-x':x,'data-hinge-y':y},groups.walls);
 const a=start*Math.PI/180,b=end*Math.PI/180;
 path(g,[[x,y],[x+r*Math.cos(a),y+r*Math.sin(a)]],{stroke:'#81948b','stroke-width':1.5});
 el('path',{d:`M${x+r*Math.cos(a)},${y+r*Math.sin(a)} A${r},${r} 0 0 ${sweep} ${x+r*Math.cos(b)},${y+r*Math.sin(b)}`,stroke:'#a5b2a7','stroke-width':1,fill:'none'},g);
};
// Hinge, open leaf and swing direction copied from the architectural source.
door('Entry',166,875,84,-90,0,1);
door('B2',627,437,66,-90,-180,0);
door('Master',650,515,65,0,-90,0);
door('Bath 2',511,534,61,90,180,1);
door('B3',541,535,65,90,0,0);
door('Bath 1',782,534,56,90,0,0);
// The kitchen/yard PD door is proposed, within the actual source opening;
// do not put a generic swing door over the window or a solid wall segment.
const pd=el('g',{'data-door':'Yard PD','data-opening-y1':812,'data-opening-y2':875},groups.walls);
path(pd,[[464,812],[519,844]],{stroke:'#81948b','stroke-width':1.5,'stroke-dasharray':'4 3'});
el('path',{d:'M464,875 A63,63 0 0 0 519,844',stroke:'#a5b2a7','stroke-width':1,fill:'none','stroke-dasharray':'3 3'},pd);
el('title',{},pd).textContent='PD door opens outward into Yard. No bifold leaf.';
// Window IDs aid source-coordinate QA; source frames themselves are retained.
const architecturalWindows={bath2:{x1:470,x2:518,y:733},bath1:{x1:784,x2:824,y:733},kitchen:{x:464,y1:881,y2:921}};

function marker(parent,id,x,y,shape='light',colour=colours.proposed,unused=false,dx=14,dy=-12,label=id,anchor=dx<0?'end':dx===0?'middle':'start'){
 const g=el('g',{class:'marker',tabindex:'0',role:'button','aria-label':Array.isArray(label)?label.join(' '):label,'data-id':id},parent);
 el('title',{},g).textContent=Array.isArray(label)?label.join(' '):label;
 el('circle',{cx:x,cy:y,r:19,class:'hit'},g);el('circle',{cx:x,cy:y,r:17,class:'halo'},g);
 if(shape==='socket')el('rect',{x:x-7,y:y-7,width:14,height:14,rx:2,stroke:colour,'stroke-width':2,fill:'#fff'},g);
 else if(shape==='switch')path(g,[[x,y-8],[x+8,y],[x,y+8],[x-8,y],[x,y-8]],{stroke:colour,'stroke-width':2,fill:'#fff'});
 else if(shape==='fan'){
  el('circle',{cx:x,cy:y,r:9,stroke:colour,'stroke-width':2,fill:'#fff'},g);
  path(g,[[x-5,y],[x+5,y]],{stroke:colour,'stroke-width':2});path(g,[[x,y-5],[x,y+5]],{stroke:colour,'stroke-width':2});
 }else{el('circle',{cx:x,cy:y,r:unused?5:8,stroke:colour,'stroke-width':unused?1.5:2,fill:'#fff'},g);if(!unused)el('circle',{cx:x,cy:y,r:2.5,fill:colour},g);}
 const t=text(g,x+dx,y+dy,label,unused?'unused-label':'point-label',anchor);t.style.fill=colour;
 g.addEventListener('click',e=>{e.stopPropagation();select(id);});
 g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(id);}});
 return g;
}
function add(id,title,status,specs,note='',x=null,y=null){items.set(id,{id,title,status,specs,note,x,y});}
function furniture(id,x,y,w,h,title,size,note='',label=title){
 const g=el('g',{'data-context':id},groups.furniture);
 el('rect',{x,y,width:w,height:h,rx:3,fill:'#eff2ec',stroke:'#c8d1c4','stroke-width':1},g);
}
const commonMmPerPx=3060/(397-159);
const diningY=source(491,865)[1];
const benchWidth=430/commonMmPerPx;
const tableWidth=800/commonMmPerPx;
const tableLength=1600/commonMmPerPx;
const benchFront=397-benchWidth;
const tableEast=benchFront-75/commonMmPerPx;
const diningX=tableEast-tableWidth/2;
const b2CabDepth=600/2517*(435-233);
const b2CabFront=435-b2CabDepth;
const b2NewFanY=233+(8.96-8.03)*(435-233)/(8.96-6.433);
furniture('SOFA',170,253,75,194,'Sofa','Site / model check','Keep the existing sofa proportions. Final product dimensions to confirm.');
el('rect',{x:245,y:253,width:55,height:65,rx:4,fill:'#e9ede6',stroke:'#b9c4b7'},groups.furniture);
furniture('TV',365,277,29,170,'TV cabinet','2134 W quoted','Floor-standing low cabinet. Samsung Frame Pro; cabinet height and TV cable route to confirm.','TV');
furniture('TABLE',tableEast-tableWidth,diningY-tableLength/2,tableWidth,tableLength,'Dining table','1600 × 800 target','Bench against Bath 2 wall. Table centre and pendant share one horizontal line. Final chair clearances to measure.','Table');
furniture('BENCH',benchFront,diningY-(1550/commonMmPerPx)/2,benchWidth,1550/commonMmPerPx,'Dining bench','1550 × 430 target','Back against Bath 2 wall; tuck the two opposite chairs under the table.','Bench');
for(const y of [diningY-47,diningY+19])el('rect',{x:tableEast-tableWidth-22,y,width:35,height:36,rx:5,fill:'#eef1eb',stroke:'#c2cbbe'},groups.furniture);
furniture('KITCHEN',296,881,161,50,'Kitchen cabinets','2134 W quoted','7 ft package. Architectural run is labelled 2065 mm: Jason must confirm the actual finished run. Full-height upper; lower depth ~610 mm target. Sink task LED; filter hood.','Kitchen');
furniture('PREP',291,741,107,60,'Prep cabinet','1372 × 762 quoted','2.5 × 4.5 ft; sintered-stone top. Light warm grey, no yellow undertone. Final height to confirm.','Prep');
furniture('FRIDGE',398,741,59,60,'Fridge cabinet','762 W quoted','Grey woodgrain. Depth, opening and ventilation depend on the actual fridge.','Fridge');
// Window cabinet detail is not drawn as an invented standalone box.
furniture('SHOE',259,886,27,48,'Shoe cabinet','610 W quoted','OUTSIDE the main door, in the foyer recess. Height, depth and suspended fixing to confirm.','');

furniture('B2-CAB',418,b2CabFront,145,b2CabDepth,'B2 wardrobe','1829 W quoted','6 ft; ~600 mm depth target; height to site ceiling. Door-side niche + mirror + curved detailing. No wardrobe lighting.','Wardrobe / niche');
el('rect',{x:532,y:b2CabFront,width:31,height:b2CabDepth,fill:'#e3e9e0',stroke:'#c8d1c4'},groups.furniture);
furniture('DESK',419,250,55,112,'Desk','1400 × 700 target','B2 office. Check chair aisle and sockets.','Desk');
furniture('B3-CAB',615,538,140,600/2450*(725-538),'B3 wardrobe','1829 W quoted','6 ft; ~600 mm depth target; full-height, NO niche. Rounded exposed corner. Internal hanging and three useful drawers to be signed off.','Full wardrobe');
furniture('B3-BED',598,643,155,74,'B3 bed','Model only','Confirm product size before circulation and fan setting-out.','Bed');
furniture('M-BED',666,259,158,146,'Master bed','Product TBC','Sleeping room. No fan or curtain box; optional plug-in bedside lamps.','Bed');
furniture('WASHER',479,744,46,48,'Washer / dryer','Product TBC','Existing water and drain at Bath 2 service end; dryer loop beside washer point.','Laundry');
furniture('CAT',479,880,73,42,'Cat litter area','Site check','Keep access to trap and AC ledge clear.','Cats');
// Basins and WCs are ADJACENT on the side walls, never facing each other.
for(const [x,side] of [[418,'left'],[856,'right']]){
 el('rect',{x,y:554,width:28,height:30,rx:3,fill:'#fff',stroke:'#a6bac0'},groups.furniture);
 el('rect',{x:x+5,y:559,width:18,height:20,rx:5,fill:'none',stroke:'#a6bac0'},groups.furniture);
 el('ellipse',{cx:x+14,cy:626,rx:19,ry:12,fill:'#fff',stroke:'#a6bac0'},groups.furniture);
 
 
}
for(const [x,w] of [[419,88],[787,94]]){el('rect',{x,y:660,width:w,height:60,rx:3,fill:'#eaf0f2',stroke:'#bccbd0','stroke-dasharray':'4 3'},groups.furniture);}
// Local dimensions explicitly distinguish architecture labels and quote sizes.
function dimension(x1,y1,x2,y2,label){
 path(groups.dimensions,[[x1,y1],[x2,y2]],{stroke:'#a3afa4','stroke-width':1});
 const horizontal=y1===y2;
 for(const [x,y] of [[x1,y1],[x2,y2]])path(groups.dimensions,horizontal?[[x,y-4],[x,y+4]]:[[x-4,y],[x+4,y]],{stroke:'#8f9e92','stroke-width':1});
 const t=text(groups.dimensions,(x1+x2)/2+(horizontal?0:12),(y1+y2)/2+(horizontal?-6:0),label,'dimension');
 if(!horizontal)t.setAttribute('transform',`rotate(-90 ${(x1+x2)/2+12} ${(y1+y2)/2})`);
}
dimension(159,189,397,189,'3060');dimension(416,189,627,189,'2865');dimension(658,189,888,189,'3010');
dimension(608,233,608,435,'2517');dimension(938,233,938,520,'3700');dimension(938,538,938,724,'2450');
dimension(536,611,764,611,'2865');dimension(296,961,457,961,'2065');

const ceiling=[['F-L1',396,1144],['L-L1',491,365],['L-FAN',491,468,'fan'],['L-L2',491,570],['D-L1',491,865],['K-L2',625,1144],['Y-L1',812,1144],['H-L1',817,666],['M-L1',1156,365],['M-FAN',1156,468,'fan'],['M-L2',1156,570],['M-L3',1155,666],['B2-L1',827,362],['B2-F',827,468,'fan'],['B2-L2',827,560],['B3-L1',878,895],['B3-F',985,895,'fan'],['B3-L2',1091,895],['B1-L',1237,866],['B2B-L',742,866]];
// Contractor-facing names; source codes remain in the tap details only.
const pointLabels={
 'F-L1':{label:['Entry','ceiling light'],dx:14,dy:-16},
 'L-L1':{label:['Existing supply'],dx:0,dy:26},
 'L-FAN':{label:['Ceiling fan'],dx:17,dy:3},
 'L-L2':{label:['Ceiling light'],dx:14,dy:5},
 'D-L1':{label:['Existing','supply'],dx:-15,dy:-13},
 'K-L2':{label:['Existing supply'],dx:0,dy:26},
 'Y-L1':{label:['Existing','light point'],dx:0,dy:-21},
 'H-L1':{label:['Existing supply'],dx:0,dy:23},
 'M-L1':{label:['Unused light point'],dx:0,dy:25},
 'M-FAN':{label:['Unused fan point'],dx:0,dy:25},
 'M-L2':{label:['Dimmable','ceiling light'],dx:14,dy:4},
 'M-L3':{label:['Unused light point'],dx:0,dy:24},
 'B2-L1':{label:['Track supply'],dx:0,dy:23},
 'B2-F':{label:['Old fan hook'],dx:0,dy:22},
 'B2-L2':{label:['Unused','light point'],dx:14,dy:2},
 'B3-F':{label:['Ceiling fan'],dx:0,dy:29},
 'B3-L1':{label:['Ceiling','light 1'],dx:0,dy:23},
 'B3-L2':{label:['Ceiling','light 2'],dx:0,dy:23},
 'B1-L':{label:['Existing supply'],dx:0,dy:-13},
 'B2B-L':{label:['Existing supply'],dx:0,dy:-13}
};
const decisions={
 'F-L1':['Entry light','Confirmed',{'Type':'Diffuse ceiling light','Position':'Existing point'},'Inside the main door.'],
 'L-L1':['Living L-track feed','Confirmed / set-out TBC',{'Type':'Surface L-track','Feed':'Existing L-L1'},'Track length and return require a check against the 48-inch fan, curtain and TV. Dashed track is a route study, not a fixing line.'],
 'L-FAN':['Living fan','Size target',{'Diameter':'48 in / ~1220 mm','Position':'Existing hook target'},'Exact model, blade height and clearances to confirm; track set-out must suit the selected fan.'],
 'L-L2':['Living ceiling light','Confirmed',{'Type':'Broad diffuse ceiling light','Position':'Existing L-L2'},'Latest owner brief replaces the earlier globe-pendant proposal. Model/output TBC.'],
 'D-L1':['Dining pendant feed','Confirmed / offset TBC',{'Type':'Pendant + offset adaptor','Move':'Horizontal → table centre'},'Keep the bench against Bath 2 wall. Measure the horizontal offset on site; the old 620 mm model distance is not approved.'],
 'K-L2':['Kitchen track','Confirmed / length TBC',{'Type':'Straight surface track','Feed':'Directly at K-L2'},'Track crosses the existing point. Length, heads and aiming to confirm; sink cabinet LED is separate.'],
 'H-L1':['Hall lighting feed','Confirmed / set-out TBC',{'Install':'2 matching diffuse lights','Ceiling':'Existing plaster retained'},'Reuse the existing feed and loop the second light. Centres and cut-outs to confirm; no new plaster ceiling.'],
 'M-L2':['Master ceiling light','Confirmed',{'Type':'Dimmable diffuse ceiling light','Position':'Existing M-L2','Fan':'None'},'Other master ceiling points remain unused and safely covered. No curtain box.'],
 'B2-L1':['Bedroom 2 track supply','Proposed / site check',{'Type':'1600 mm transverse diffuse track','Feed':'Original window-side light point'},'Rail crosses the existing window-side point. Two outboard heads avoid the proposed fan blade envelope; verify circuit and model-specific clearances on site.'],
 'B2-L2':['Bedroom 2 wardrobe-side light point','Unused',{'Action':'Safely terminate and retain access'},'The proposed wardrobe occupies this point. No second ceiling light is planned here.'],
 'B2-F':['B2 existing fan point','Relocation TBC',{'Diameter target':'33 in / ~838 mm','Move':'Away from wardrobe'},'New structural hook position to be marked on site. Check upper wardrobe doors, actual blade height and model-specific clearances.'],
 'B3-L1':['B3 ceiling light 1','Confirmed',{'Type':'Diffuse ceiling light','Position':'Existing B3-L1'},'Match B3-L2. Exact diameter/output TBC.'],
 'B3-L2':['B3 ceiling light 2','Confirmed',{'Type':'Diffuse ceiling light','Position':'Existing B3-L2'},'Match B3-L1. Exact diameter/output TBC.'],
 'B3-F':['B3 fan','Proposed size',{'Diameter':'33 in / ~838 mm','Position':'Existing hook target'},'Source centre corrected. No forced relocation is shown; model, height and opened wardrobe doors still require checking.'],
 'B1-L':['Bath 1 original feed','Existing feed',{'Action':'Feed 2 proposed lights'},'One shower downlight + one offset mirror-task spotlight. Original symbol is NOT a third light.'],
 'B2B-L':['Bath 2 original feed','Existing feed',{'Action':'Feed 2 proposed lights'},'One shower downlight + one offset mirror-task spotlight. Original symbol is NOT a third light.'],
 'Y-L1':['Yard light feed','Fitting TBC',{'Action':'Confirm retained light'},'Not included in the latest owner installation count. Do not silently add a new fitting.']
};
const unused=new Set(['M-L1','M-L3','M-FAN','B2-F','B2-L2','B1-L','B2B-L','H-L1','Y-L1']);
for(const [id,ex,ey,type] of ceiling){
 const [x,y]=source(ex,ey),a=decisions[id]||[type==='fan'?'Unused master fan point':'Unused master light point','Unused',{'Action':'Safely cap / cover'},'Retain access.'];
 add(id,...a,x,y);
 const l=pointLabels[id]||{label:['Unused light point'],dx:0,dy:24};
 const m=marker(groups.lighting,id,x,y,type||'light',unused.has(id)?colours.unused:colours.source,unused.has(id),l.dx,l.dy,l.label);
 m.dataset.sourceX=ex;m.dataset.sourceY=ey;m.dataset.cx=x;m.dataset.cy=y;
}
function studyLine(points, parent=groups.lighting){return path(parent,points,{stroke:colours.proposed,'stroke-width':3,'stroke-dasharray':'6 4','stroke-linecap':'round'});}
function track(id,points,heads,title,specs,note,labelAt){
 const g=el('g',{class:'marker',tabindex:'0',role:'button','aria-label':title,'data-id':id},groups.lighting);
 path(g,points,{stroke:'transparent','stroke-width':22});studyLine(points,g);
 for(const [x,y] of heads)el('rect',{x:x-3,y:y-5,width:6,height:10,rx:2,stroke:colours.proposed,'stroke-width':1,fill:'#fff'},g);
 text(g,...labelAt,id==='L-TK'?['L-shaped track lights']:id==='B2-TRACK'?['Diffuse track lights']:['Track lights'],'point-label','end');
 g.addEventListener('click',e=>{e.stopPropagation();select(id);});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(id);}});
 add(id,title,'Set-out TBC',specs,note);
}
// Feed the surface L-track directly at the original L-L1 symbol. The feed
// stays fixed; no separate window-side connection is implied.
const livingFeed=source(491,365),lf=source(491,468);
const livingTrack=[[203,livingFeed[1]],[374,livingFeed[1]],[374,371]];
track('L-TK',livingTrack,[[215,livingFeed[1]],[337,livingFeed[1]],[374,291],[374,350]],'Living L-track',{'Leg targets':'~2200 + 1450 mm','Feed':'Direct at L-L1'},'Rail crosses the original feed, without a separate surface link. Keep heads outside the fan sweep and aim away from its blades. Rail is closer to the fan than the previous window-side study; model-specific fixture clearances and mounting heights remain TBC.',[367,livingFeed[1]-12]);
el('circle',{cx:lf[0],cy:lf[1],r:(1219.2/2)/commonMmPerPx,fill:'none',stroke:colours.proposed,'stroke-width':1.3,'stroke-dasharray':'5 4','data-fan':'Living'},groups.lighting);
text(groups.lighting,lf[0]-3,lf[1]+58,'48 inches','point-label');
const dl=source(491,865);
path(groups.lighting,[dl,[diningX,diningY]],{stroke:colours.proposed,'stroke-width':1.7,'stroke-dasharray':'5 4'});
marker(groups.lighting,'D-P',diningX,diningY,'light',colours.proposed,false,15,-11,['Dining','pendant']);
add('D-P','Dining pendant','Offset TBC',{'Centre':'Table centre','Move':'Horizontal only'},'Bench back against Bath 2 wall. Measure the canopy-to-centre offset before ordering the adaptor.',diningX,diningY);
const kl=source(625,1144);
track('K-TK',[[kl[0]-62,kl[1]],[kl[0]+62,kl[1]]],[[kl[0]-47,kl[1]],[kl[0]+6,kl[1]],[kl[0]+47,kl[1]]],'Kitchen track',{'Length target':'~1600 mm','Feed':'Direct at K-L2'},'Use the rated feed adaptor at the existing point.',[kl[0]+61,kl[1]-15]);
studyLine([[394,887],[446,887]]);
marker(groups.lighting,'K-LED',423,887,'light',colours.proposed,false,-9,25,['Sink light strip']);
add('K-LED','Sink task LED','Detail TBC',{'Position':'Under upper cabinet','Length / driver':'Confirm'},'Keep the driver accessible.',423,887);
// Two hall fittings share the same passage centreline; source feed is NOT a third lamp.
const hallFeed=source(817,666),hallY=hallFeed[1];
for(const [id,x] of [['H1',465],['H2',586]]){
 path(groups.lighting,[hallFeed,[x,hallY]],{stroke:colours.proposed,'stroke-width':1.2,'stroke-dasharray':'3 3'});
 marker(groups.lighting,id,x,hallY,'light',colours.proposed,false,id==='H1'?-14:14,-17,['Hallway','light '+id.slice(1)]);
 add(id,'Hall light '+id.slice(1),'Set-out TBC',{'Type':'Matching diffuse light','Supply':'H-L1 loop'},'Retain existing plaster. Confirm these two aligned centres on site.',x,hallY);
}
const b2=source(827,468);
path(groups.lighting,[b2,[b2[0],b2NewFanY]],{stroke:colours.proposed,'stroke-width':1.5,'stroke-dasharray':'3 3'});
el('ellipse',{cx:b2[0],cy:b2NewFanY,rx:419/(2865/(627-416)),ry:419/(2517/(435-233)),fill:'none',stroke:colours.proposed,'stroke-width':1.4,'stroke-dasharray':'5 4','data-fan':'B2'},groups.lighting);
marker(groups.lighting,'B2-F-NEW',b2[0],b2NewFanY,'fan',colours.proposed,false,14,-4,['Ceiling fan','33 inches']);
add('B2-F-NEW','B2 fan target','Relocation TBC',{'Diameter':'33 in / ~838 mm','Move':'Away from wardrobe'},'Centre in the clear span between window wall and wardrobe front; hook position and cable route need site setting-out.',b2[0],b2NewFanY);
// Proposed track is anchored to the exact registered window-side supply.
const b2Light=source(827,362),b2Half=800/(2865/(627-416)),b2Head=650/(2865/(627-416));
track('B2-TRACK',[[b2Light[0]-b2Half,b2Light[1]],[b2Light[0]+b2Half,b2Light[1]]],[[b2Light[0]-b2Head,b2Light[1]],[b2Light[0]+b2Head,b2Light[1]]],'Bedroom 2 diffuse track',{'Length target':'1600 mm','Feed':'Original window-side light point'},'Proposed transverse rail; two diffuse heads outside the fan envelope. Verify original circuit, cabinet doors and fixture clearances on site.',[b2Light[0]+b2Half,b2Light[1]-16]);
const b3=source(985,895);
el('ellipse',{cx:b3[0],cy:b3[1],rx:419/(2865/(755-534)),ry:419/(2450/(725-535)),fill:'none',stroke:colours.proposed,'stroke-width':1.4,'stroke-dasharray':'5 4','data-fan':'B3'},groups.lighting);
text(groups.lighting,b3[0],b3[1]-25,'33 inches','point-label');
// Both bathrooms retain their plaster ceilings and get exactly two holes.
for(const [prefix,sx,mx] of [['B2B',463,463],['B1',835,838]]){
 marker(groups.lighting,prefix+'-DL',sx,690,'light',colours.proposed,false,0,22,['Shower','downlight']);
 marker(groups.lighting,prefix+'-SP',mx,570,'light',colours.proposed,false,0,22,['Mirror','spotlight']);
 add(prefix+'-DL',(prefix==='B1'?'Bath 1':'Bath 2')+' shower light','Proposed hole',{'Type':'Broad diffuse downlight','Ceiling':'Existing plaster','Cut-out':'Selected fixture TBC'},'Final centre, ceiling void and wet-zone protection to be checked before opening.',sx,690);
 add(prefix+'-SP',(prefix==='B1'?'Bath 1':'Bath 2')+' mirror-task light','Proposed hole',{'Type':'Offset adjustable spotlight','Aim':'Face / basin; spill to WC','Cut-out':'Selected fixture TBC'},'No powered mirror cabinet. Final aim and position to mock up on site.',mx,570);
 path(groups.lighting,[[mx,570],[prefix==='B1'?873:433,568]],{stroke:colours.proposed,'stroke-width':1.2,'stroke-dasharray':'3 3'});
}
// Minimal space labels are placed in clear areas, independent of source furniture.
for(const [name,x,y] of [['LIVING',283,497],['DINING',219,551],['KITCHEN',211,855],['FOYER',206,902],['YARD',513,859],[['BEDROOM','2'],597,362],[['MASTER','BEDROOM'],840,481],['HALLWAY',455,518],['BATHROOM 2',465,650],['BEDROOM 3',590,606],['BATHROOM 1',830,650]]){
 const t=text(groups.labels,x,y,name,'room-label');
 if(typeof name==='string' && name.startsWith('BATHROOM'))t.style.fontSize='10px';
}
const ledgeLabel=text(groups.labels,603,852,['AIR-CONDITIONER','LEDGE'],'room-label');ledgeLabel.style.fontSize='7px';ledgeLabel.style.letterSpacing='0';


function fullTerms(s){
 const references={'F-L1':'original entry light point','L-L1':'original living track supply','L-L2':'original living ceiling-light point','D-L1':'original dining light point','K-L2':'original kitchen light point','H-L1':'original hallway light supply','M-L2':'original master light point','B2-L1':'first original bedroom 2 light point','B2-L2':'second original bedroom 2 light point','B3-L1':'bedroom 3 ceiling light 1','B3-L2':'bedroom 3 ceiling light 2'};
 return String(s).replace(/F-L1|L-L[12]|D-L1|K-L2|H-L1|M-L2|B2-L[12]|B3-L[12]/g,m=>references[m]).replace(/\bTBC\b/g,'to confirm').replace(/\bB2\b/g,'Bedroom 2').replace(/\bB3\b/g,'Bedroom 3').replace(/\bBath ([12])\b/g,'Bathroom $1').replace(/\bL-track\b/g,'L-shaped track').replace(/\bLED\b/g,'light strip').replace(/\bWC\b/g,'toilet').replace(/\bAC\b/g,'air-conditioner').replace(/\bin\s*\//g,'inches /');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function select(id){
 const item=items.get(id);if(!item)return;
 selected=id;document.querySelectorAll('.marker').forEach(n=>n.classList.toggle('selected',n.dataset.id===id));
 $('#detail-tag').textContent='Drawing reference · '+id;$('#close-detail').hidden=false;
 const isHold=/TBC|target|Unused/i.test(item.status);
 $('#detail').innerHTML=`<h1>${escapeHtml(fullTerms(item.title))}</h1><span class="status ${isHold?'hold':item.status==='Source symbol'?'source':''}">${escapeHtml(fullTerms(item.status))}</span><dl class="specs">${Object.entries(item.specs).map(([k,v])=>`<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(fullTerms(v))}</dd></div>`).join('')}</dl>${item.note?`<p>${escapeHtml(fullTerms(item.note))}</p>`:''}`;
 $('.brief').scrollTop=0;
}
function resetDetail(){
 selected=null;document.querySelectorAll('.marker').forEach(n=>n.classList.remove('selected'));$('#close-detail').hidden=true;
 $('#detail-tag').textContent='LIGHTING PLAN · REVISION 06';
 $('#detail').innerHTML='<h1>Lights &amp; fans</h1><p>Tap a fitting for its brief.</p><div class="room-jump"><button data-room="Living">Living</button><button data-room="Kitchen">Kitchen</button><button data-room="B2">Bedroom 2</button><button data-room="B3">Bedroom 3</button><button data-room="Master">Master bedroom</button></div><p class="note-small">3500 K target · Dashed = set-out pending</p>';
 $('.brief').scrollTop=0;
}
$('#legend').innerHTML=[['#4f7b9e','Existing point'],['#b26b39','Fitting / target'],['#abb5af','Supply / unused point']].map(([c,t])=>`<span><i style="--colour:${c}"></i>${t}</span>`).join('');
let scale=1,tx=0,ty=0,frame=0;
const box={x:85,y:140,w:920,h:880};
function applyTransform(){if(frame)return;frame=requestAnimationFrame(()=>{root.setAttribute('transform',`translate(${tx} ${ty}) scale(${scale})`);frame=0;});}
function fit(){scale=1;tx=ty=0;applyTransform();}
function local(clientX,clientY){const m=svg.getScreenCTM();if(!m)return {x:0,y:0};return new DOMPoint(clientX,clientY).matrixTransform(m.inverse());}
function zoomAt(factor,p){const old=scale;scale=Math.min(5,Math.max(.7,scale*factor));const ratio=scale/old;tx=p.x-(p.x-tx)*ratio;ty=p.y-(p.y-ty)*ratio;applyTransform();}
function zoom(factor){zoomAt(factor,{x:box.x+box.w/2,y:box.y+box.h/2});}
function focusRoom(name){const room=rooms.find(r=>r[0]===name);if(!room)return;const [,x,y,x2,y2]=room;scale=Math.min(3,Math.min(box.w/(x2-x+120),box.h/(y2-y+120)));tx=box.x+box.w/2-((x+x2)/2)*scale;ty=box.y+box.h/2-((y+y2)/2)*scale;applyTransform();}
const pointers=new Map();let gesture=null,moved=false,suppressClickUntil=0;
function rebase(){const ps=[...pointers.values()];if(ps.length===1)gesture={kind:'pan',p:ps[0],tx,ty};else if(ps.length>=2){const [a,b]=ps;gesture={kind:'pinch',distance:Math.hypot(a.x-b.x,a.y-b.y),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},scale,tx,ty};}else gesture=null;}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;pointers.set(e.pointerId,local(e.clientX,e.clientY));if(pointers.size===1)moved=false;rebase();});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;const p=local(e.clientX,e.clientY);pointers.set(e.pointerId,p);if(gesture.kind==='pan'){const dx=p.x-gesture.p.x,dy=p.y-gesture.p.y;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;tx=gesture.tx+dx;ty=gesture.ty+dy;}else{const [a,b]=[...pointers.values()];const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const distance=Math.hypot(a.x-b.x,a.y-b.y);scale=Math.min(5,Math.max(.7,gesture.scale*distance/Math.max(1,gesture.distance)));const ratio=scale/gesture.scale;tx=mid.x-(gesture.mid.x-gesture.tx)*ratio;ty=mid.y-(gesture.mid.y-gesture.ty)*ratio;moved=true;}if(moved){canvas.classList.add('dragging');if(!canvas.hasPointerCapture(e.pointerId))canvas.setPointerCapture(e.pointerId);}applyTransform();});
function endPointer(e){if(moved)suppressClickUntil=performance.now()+250;pointers.delete(e.pointerId);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);rebase();if(!pointers.size)canvas.classList.remove('dragging');}
canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);window.addEventListener('pointerup',e=>{if(pointers.has(e.pointerId))endPointer(e);});
canvas.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.stopImmediatePropagation();e.preventDefault();}},true);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.exp(-e.deltaY*.0015),local(e.clientX,e.clientY));},{passive:false});
$('#furniture').addEventListener('change',e=>groups.furniture.style.display=e.target.checked?'':'none');
$('#dimensions').addEventListener('change',e=>groups.dimensions.style.display=e.target.checked?'':'none');
$('#zoom-in').addEventListener('click',()=>zoom(1.3));$('#zoom-out').addEventListener('click',()=>zoom(1/1.3));$('#fit').addEventListener('click',fit);
$('#close-detail').addEventListener('click',resetDetail);
$('.brief').addEventListener('click',e=>{const b=e.target.closest('[data-room]');if(b)focusRoom(b.dataset.room);});
$('#source').addEventListener('click',()=>window.open('plan-assets/electrical-right-type-a.png','_blank','noopener'));
let beforePrint=null;
window.addEventListener('beforeprint',()=>{beforePrint={scale,tx,ty};scale=1;tx=ty=0;root.removeAttribute('transform');});
window.addEventListener('afterprint',()=>{if(beforePrint){({scale,tx,ty}=beforePrint);beforePrint=null;applyTransform();}});
$('#print').addEventListener('click',()=>window.print());
resetDetail();
