import {ROOM_SURVEY} from './planning-data.js';

// This is a field checklist, not a dimensional claim about the completed unit.
// Stable IDs make a downloaded survey usable for later model calibration.
const ROOMS=Object.keys(ROOM_SURVEY);
const STORE_KEY='serina-site-survey-v1';
const GROUPS=[['shell','Shell & corners'],['openings','Doors, windows & wall breaks'],['points','Existing points & services'],['fitout','Cabinetry, furniture & clearances']];
const mm=(key,label)=>({key,label,type:'number'});
const txt=(key,label)=>({key,label,type:'text'});
const memo=(key,label)=>({key,label,type:'textarea'});
const sel=(key,label,options)=>({key,label,type:'select',options});
const task=(room,group,id,title,hint,fields,estimate='')=>({room,group,id,title,hint,fields,estimate});

const OPENINGS={
 '玄关':[
  ['inner-door','Inner main entrance door','South · beside shoe cabinet; measure from inner finished wall, not outer grill','door'],
  ['outer-grill','Outer entrance grill and passage','Separate outer threshold: measure gap to inner door and grill opening','door'],
  ['dining-transition','Entry to dining / kitchen transition','Record both returns and any step or beam','open']
 ],
 '客厅':[
  ['north-window','Three-bay living window','North wall · measure full frame and each sash separately','window'],
  ['dining-opening','Living-to-dining open edge','This is an open planning boundary; locate each actual wall end/return','open'],
  ['east-partition','TV-side / B2 partial partition','Measure each return and its thickness at the passage','open']
 ],
 '餐厅':[
  ['living-transition','Dining-to-living open edge','Open planning boundary, not a full-height wall','open'],
  ['kitchen-transition','Dining-to-kitchen / entry opening','Measure finished clear width and returns','open'],
  ['bath2-wall-ends','Bath 2 wall face and both ends','Locate exactly where this wall projects into dining','open']
 ],
 '厨房':[
  ['yard-louvre','Kitchen-to-yard louvre window','East wall; record all frame, sill and shutter clearances','window'],
  ['yard-door','Kitchen-to-yard door','East wall; record leaf swing/slide and washing-machine path','door'],
  ['dining-opening','Kitchen-to-dining opening','Record end returns and any beam below ceiling','open']
 ],
 'Yard':[
  ['kitchen-louvre','Kitchen-side louvre, Yard face','Cross-check kitchen measurement from the Yard finished face','window'],
  ['kitchen-door','Kitchen-side door, Yard face','Cross-check clear opening and frame depth','door'],
  ['ledge-window','AC-ledge glazing / window','East service side; distinguish glass from access door','window'],
  ['ledge-door','AC-ledge access door','Keep condenser servicing and opening path clear','door']
 ],
 '走道':[
  ['b2-door','Bedroom 2 door','Measure corridor-side jambs and swing','door'],
  ['b3-door','Bedroom 3 door','Measure corridor-side jambs and swing','door'],
  ['master-door','Master bedroom door','Measure corridor-side jambs and swing','door'],
  ['bath1-door','Bath 1 door','Record actual side/location in corridor sketch','door'],
  ['bath2-door','Bath 2 door','Record actual side/location in corridor sketch','door'],
  ['living-connection','Corridor-to-common-area connection','Measure width, returns and soffit height','open']
 ],
 '主人房':[
  ['north-window','Master three-bay window','North wall; record frame, each sash and reveal','window'],
  ['entry-door','Master entrance door','West partition in model; verify on site','door'],
  ['ensuite-door','Bath 1 / ensuite door','South side in model; verify on site','door']
 ],
 'B2':[
  ['north-window','Bedroom 2 three-bay window','North wall; preserve view, record window return to both corners','window'],
  ['entry-door','Bedroom 2 entrance door','South wardrobe-wall side; record opening and swing','door']
 ],
 'B3':[
  ['south-window','Bedroom 3 two-bay window','South wall; record frame and wall returns','window'],
  ['entry-door','Bedroom 3 entrance door','North side in model; verify actual jambs','door']
 ],
 'Bath 1':[['entry-door','Bath 1 entrance door','Measure finished tiled opening and swing','door'],['shower-screen','Shower screen / wet-zone opening','Record if present; mark Not present otherwise','open']],
 'Bath 2':[['entry-door','Bath 2 entrance door','Measure finished tiled opening and swing','door'],['high-opening','Bath 2 high opening / vent','South side in model; verify whether window, vent or open wall','window']],
 'AC Ledge':[['yard-window','Yard-side glazing','Service-side window or louvre; record actual arrangement','window'],['yard-door','Yard-to-ledge access door','Measure clear route for condenser servicing','door'],['outer-grill','Outer ledge grill','External barrier, not an indoor finished wall','open']]
};

// IDs follow the viewer's developer/owner register. A disputed point is a
// search item, not an assertion that a faceplate exists at that location.
const POINTS={
 '玄关':[['F-L1','Original ceiling light','ceiling'],['F-S1','13A socket beside entry / shoe cabinet','wall'],['F-DB','Distribution board','wall'],['F-DBELL','Doorbell point','wall'],['F-SW','Public-area switch groups','wall']],
 '客厅':[['L-L1','Window-side original ceiling light','ceiling'],['L-L2','Dining-side original ceiling light','ceiling'],['L-FAN','Fan hook / structural centre','ceiling'],['L-S1','Sofa-wall socket 1','wall'],['L-S2','Sofa-wall socket 2','wall'],['L-S3','TV-wall socket 1','wall'],['L-S4','TV-wall socket 2','wall'],['L-D1','TV / fibre point','wall'],['L-AC','Air-con power / route','wall'],['L-AC-SW','AC pilot switch','wall']],
 '餐厅':[['D-L1','Original dining ceiling light','ceiling'],['D-S1','Dining socket group 1 — owner-reported','wall'],['D-S2','Dining socket group 2 — owner-reported','wall'],['D-S3','Dining socket group 3 — owner-reported','wall']],
 '厨房':[['K-L2','Original kitchen ceiling light','ceiling'],['K-S1','Counter socket group 1','wall'],['K-S2','Counter socket group 2','wall'],['K-FR','Fridge socket','wall'],['K-SW','Kitchen switch groups','wall'],['K-HOOD','Hood power and duct route — locate if present','wall']],
 'Yard':[['Y-L1','Original Yard ceiling light','ceiling'],['Y-S1','Yard socket group 1','wall'],['Y-S2','Yard socket group 2','wall'],['Y-S3','Yard socket group 3','wall'],['Y-TAP','Washer tap / water supply','wall'],['Y-TRAP','Floor trap / drainage','floor']],
 '走道':[['H-L1','Original hall ceiling light','ceiling']],
 '主人房':[['M-L1','Window-side original light','ceiling'],['M-L2','Door-side original light','ceiling'],['M-L3','Entrance-side original light','ceiling'],['M-FAN','Original fan hook / central light target','ceiling'],['M-S1','Socket group 1','wall'],['M-S2','Socket group 2','wall'],['M-S3','Socket group 3','wall'],['M-AC','Air-con power / route','wall'],['M-SW','Bedroom / ensuite switch groups','wall']],
 'B2':[['B2-L1','Window-side original light','ceiling'],['B2-L2','Door-side original light','ceiling'],['B2-F','Original fan hook / central light target','ceiling'],['B2-S1','Socket 1 — actual wall unverified','wall'],['B2-S2','Socket 2 — actual wall unverified','wall'],['B2-SW','Two-gang light switch / cabinet niche','wall'],['B2-AC','Air-con power / route','wall']],
 'B3':[['B3-L1','Bath-2-side original light / fan concept','ceiling'],['B3-L2','Second original light','ceiling'],['B3-F','Original fan hook / central light target','ceiling'],['B3-S1','Socket 1','wall'],['B3-S2','Socket 2','wall'],['B3-SW','Two-gang light switch / cabinet niche','wall'],['B3-AC','Air-con power / route','wall']],
 'Bath 1':[['B1-L','Original bathroom light','ceiling'],['B1-WH','Water-heater outlet','wall'],['B1-WH-SW','Water-heater pilot switch','wall'],['B1-M','Mirror-cabinet power, only if existing','wall']],
 'Bath 2':[['B2B-L','Original bathroom light','ceiling'],['B2B-WH','Water-heater outlet','wall'],['B2B-WH-SW','Water-heater pilot switch','wall'],['B2B-M','Mirror-cabinet power, only if existing','wall']],
 'AC Ledge':[['AC-1','Condenser feeds, isolators and pipe entries','service']]
};

const FITOUT={
 '玄关':[
  ['shoe-wall','Shoe-cabinet usable wall beside inner door','Measure from inner-door jamb to wall end and note existing socket/switch', [mm('length','Usable width'),mm('depth','Max cabinet depth'),mm('height','Slab height'),mm('door','Door leaf clearance'),mm('passage','Clear walk-through'),memo('note','Obstructions / fixing wall')]],
  ['shoe-floor','Floating cabinet floor and ceiling clearances','Design target: 2700 mm cabinet body, 120 mm floor gap; verify actual height before fabrication',[mm('floor','Floor gap possible'),mm('top','Top scribe possible'),mm('socket','Socket centre from jamb'),memo('note','Door swing / service access')]]
 ],
 '客厅':[
  ['sofa-tv','Sofa-to-TV geometry','Measure finished wall faces; sofa model is not a reliable size reference',[mm('sofaWall','Sofa wall usable'),mm('tvWall','TV wall usable'),mm('distance','Face-to-face distance'),mm('tvHeight','TV centre AFFL'),memo('note','Sofa / rail actual product sizes')]],
  ['fan','Living fan clearance','Proposed 48 in fan: confirm existing hook, window pelmet, AC and walls',[mm('hookWindow','Hook to window wall'),mm('hookSofa','Hook to sofa wall'),mm('hookTV','Hook to TV wall'),mm('blade','Blade height AFFL'),memo('note','Fan and light obstruction')]],
  ['window-slot','Full window light slot / blind','Record finished window wall, soffit, blind projection and serviceable driver route',[mm('span','Wall-to-wall span'),mm('recess','Window reveal depth'),mm('blind','Blind projection'),mm('slot','Available slot depth'),memo('note','Driver access / curtain details')]]
 ],
 '餐厅':[
  ['bath2-wall','Bath 2 wall face and dining recess','Locate both ends of the wall against the dining floor; check if fridge cabinet can align',[mm('length','Bath 2 wall length'),mm('projection','Wall projection / recess'),mm('fridgeLine','Fridge-front plane offset'),memo('note','Corner and wall-thickness sketch')]],
  ['table-clear','1600 mm table, bench and chair clearances','Bench against Bath 2 wall in current model; measure usable circulation with chairs pulled out',[mm('bench','Bench-wall usable'),mm('table','Table placement offset'),mm('chair','Chair pull-out clearance'),mm('passage','Opposite passage clear'),memo('note','Pendant centre relative to final table')]]
 ],
 '厨房':[
  ['wet-run','Wet-run finished wall and countertop','Measure sink, hob, hood and every obstacle before Ace shop drawings',[mm('wall','Finished wet-wall length'),mm('baseDepth','Base cabinet max depth'),mm('topDepth','Countertop finished depth'),mm('counterHeight','Countertop AFFL'),mm('upperDepth','Upper cabinet max depth'),memo('note','Pipe / socket / hood positions')]],
  ['fridge','Fridge recess and cabinet envelope','Record actual appliance model and ventilation/hinge requirements',[mm('bayW','Available width'),mm('bayD','Available depth'),mm('bayH','Available height'),mm('fridgeW','Fridge actual width'),mm('fridgeD','Fridge actual depth'),mm('doorSwing','Door-opening clearance'),memo('note','Socket and ventilation access')]],
  ['island','Prep counter / island position','Current concept ≈ 1400 mm long; mark all four corner positions from fixed walls',[mm('long','Usable length'),mm('depth','Top depth'),mm('walkKitchen','Clearance to wet run'),mm('walkDining','Clearance to dining'),mm('topAFFL','Finished top AFFL'),memo('note','Pendant centres / stool movement')]]
 ],
 'Yard':[
  ['washer','Washer/dryer stack at Bath-2 service end','Check tap, floor trap, sockets, door and machine ventilation',[mm('bayW','Machine bay width'),mm('bayD','Machine bay depth'),mm('bayH','Clear height'),mm('tapAFFL','Tap AFFL'),mm('trapOffset','Trap to wall corner'),mm('doorClear','Ledge-door clearance'),memo('note','Water, drain and electrical route')]],
  ['cat-litter','Opposite dry-end litter boxes','Measure usable dry floor, window/door swing and cleaning access',[mm('length','Dry-end length'),mm('depth','Dry-end depth'),mm('walk','Remaining walkway'),memo('note','Ventilation / washable finish')]]
 ],
 '走道':[
  ['ceiling-run','Continuous flat ceiling through hall','Scheme 3 target drop 100 mm; capture every change at rooms and Bath 2 wall',[mm('length','Net hall length'),mm('width','Net hall width'),mm('drop','Possible drop'),mm('beam','Lowest beam underside AFFL'),memo('note','Access panels / AC crossings')]]
 ],
 '主人房':[
  ['bed','Bed and two bedside tables','Record actual bed product and accessible socket clearances',[mm('bedWall','Bed wall usable'),mm('bedW','Actual bed width'),mm('bedD','Actual bed depth'),mm('left','Left bedside space'),mm('right','Right bedside space'),memo('note','Switch/socket reaches')]],
  ['curtain','Full-wall double curtain and concealed strip','Measure wall-to-wall span, stack-back, track projection and driver access',[mm('wall','Full window-wall span'),mm('boxDrop','Possible pelmet drop'),mm('track','Track projection'),mm('stack','Curtain stack-back'),memo('note','AC / ceiling / driver conflicts')]]
 ],
 'B2':[
  ['wardrobe','Three-door wardrobe plus door-side open niche','Keep switch usable; do not presume any east-wall power point',[mm('southWall','South usable wall'),mm('doorJamb','Door jamb to cabinet start'),mm('switch','Switch from door jamb'),mm('nicheW','Niche usable width'),mm('cabinetD','Cabinet max depth'),mm('doorClear','Open cabinet door to fan/light'),memo('note','Circulator shelf / socket access')]],
  ['desk','Office desk and chair','Concept desk 1400 × 700; verify window glare, chair and socket access',[mm('deskWall','Desk wall usable'),mm('deskD','Max desk depth'),mm('chair','Chair pull-back clearance'),mm('window','Desk to window frame'),memo('note','Task lamp / monitor and AC position')]]
 ],
 'B3':[
  ['wardrobe','Four-door wardrobe and small door-side niche','Record full cabinet run, niche and door/fan swing',[mm('wall','Wardrobe wall usable'),mm('cabinetW','Four-door portion width'),mm('nicheW','Niche width'),mm('nicheAFFL','Niche shelf AFFL'),mm('depth','Cabinet depth'),mm('swing','Door-open projection'),memo('note','Switch and socket access')]],
  ['fan','Ceiling-mounted compact fan clearance','Measure from the Bath-2-side point to wardrobe doors, window and wall',[mm('pointCabinet','Point to cabinet face'),mm('doorOpen','Fan guard to opened door'),mm('pointWall','Point to nearest wall'),mm('mount','Safe mount height AFFL'),memo('note','Bracket rating / fixing substrate')]]
 ],
 'Bath 1':[['vanity','Vanity, mirror and wet-zone geometry','Measure tiled finished faces and mirror power only if physically present',[mm('vanityW','Vanity wall width'),mm('basinAFFL','Basin top AFFL'),mm('mirror','Mirror usable width'),mm('shower','Shower clear width'),memo('note','Waterproofing / service access')]]],
 'Bath 2':[['vanity','Vanity, mirror and wet-zone geometry','Measure tiled finished faces and keep dining wall position accurate',[mm('vanityW','Vanity wall width'),mm('basinAFFL','Basin top AFFL'),mm('mirror','Mirror usable width'),mm('shower','Shower clear width'),memo('note','Waterproofing / service access')]]],
 'AC Ledge':[['condensers','Condenser service envelope','Coordinate four planned AC units with installer; measure access, outlets and drain',[mm('length','Ledge usable length'),mm('depth','Ledge usable depth'),mm('grill','Grill clear height'),mm('access','Access path width'),mm('drain','Drain / fall location'),memo('note','Outdoor unit model sizes / isolators')]]]
};

function wallLength(corners,a,b){return Math.round(Math.hypot(corners[b][0]-corners[a][0],corners[b][1]-corners[a][1])*1000)}
function buildTasks(room){
 const s=ROOM_SURVEY[room],out=[];
 out.push(task(room,'shell',`${room}:photo`,'Room orientation & overview','Take photos of all four walls and the ceiling; mark A–D on one sketch.',[txt('photos','Photo numbers / names'),memo('sketch','Door/window positions and any wall jogs')]));
 out.push(task(room,'shell',`${room}:levels`,'Finished floor to slab / ceiling at A, B, C, D and centre','Measure vertical from the same finished floor datum; include beam, bulkhead and floor step.',[mm('a','A height AFFL'),mm('b','B height AFFL'),mm('c','C height AFFL'),mm('d','D height AFFL'),mm('centre','Centre height AFFL'),mm('lowest','Lowest soffit AFFL'),memo('note','Height changes / beam sketch')],room==='餐厅'?'Open zone; shared ceiling':'Model shell ≈ 2850 mm ceiling'));
 const sides=[['South A→B',0,1],['East B→C',1,2],['North D→C',3,2],['West A→D',0,3]];
 for(const [side,a,b] of sides){out.push(task(room,'shell',`${room}:wall:${side.split(' ')[0].toLowerCase()}`,`${side} · finished-face wall run`,'Measure each straight segment in order. If the edge is open, record the two wall ends and the clear gap; add a separate row for every extra return/jog.',[mm('length','Total face-to-face length'),mm('startHeight','Height at first corner'),mm('endHeight','Height at last corner'),mm('thickness','Wall thickness at opening'),memo('segments','Segment sequence + widths (mm)'),txt('photo','Photo / sketch #')],`Model ≈ ${wallLength(s.corners,a,b)} mm`))}
 out.push(task(room,'shell',`${room}:diagonals`,'Room diagonals and floor finish','Diagonals reveal out-of-square walls. In wet areas, measure from finished tile faces.',[mm('ac','A→C diagonal'),mm('bd','B→D diagonal'),mm('tileW','Tile width'),mm('tileH','Tile length'),mm('grout','Grout joint'),memo('note','Floor slope / threshold / skirting')]));
 for(const [id,title,hint,kind] of OPENINGS[room]||[]){
  const fields=[sel('side','Actual wall side',['South','East','North','West','Other / open zone']),mm('start','Start from wall first corner'),mm('clearW','Clear opening width'),mm('frameW','Overall frame width'),mm('clearH','Clear opening height'),mm('sill','Sill / threshold AFFL'),mm('head','Head AFFL'),mm('reveal','Reveal / frame depth'),txt('operation',kind==='door'?'Hinge / swing / slide direction':'Sash / louvre / open edge'),txt('photo','Photo / sketch #')];
  out.push(task(room,'openings',`${room}:opening:${id}`,title,hint,fields));
 }
 out.push(task(room,'openings',`${room}:other-breaks`,'Other returns, columns, niches or exposed pipes','Enter every interruption that changes the wall line or reduces cabinet/door clearance. Add more custom rows if needed.',[sel('side','Wall side',['South','East','North','West','Ceiling','Floor']),mm('start','Start from first corner'),mm('width','Width / run'),mm('projection','Projection / return depth'),mm('height','Top or underside AFFL'),memo('note','Describe each additional feature')]));
 for(const [id,title,kind] of POINTS[room]||[]){
  const ceiling=kind==='ceiling',floor=kind==='floor';
  out.push(task(room,'points',`${room}:point:${id}`,`${id} · ${title}`,ceiling?'Measure centre from west and south finished walls. Confirm the switch/circuit; the plan symbol is not a measured set-out.':floor?'Measure centre from two finished walls and note grate/drain diameter.':'Locate the real faceplate/pipe centre; note wall, corner/jamb reference and AFFL. Mark Not present if it is absent.',[
   sel('plane','Actual wall / plane',ceiling?['Ceiling','Soffit / beam','Other']:floor?['Floor','Wall','Other']:['South wall','East wall','North wall','West wall','Door reveal','Other']),
   mm('x',ceiling||floor?'From west wall':'Along-wall offset from first corner'),
   mm('y',ceiling||floor?'From south wall':'Offset from nearest door jamb (if useful)'),
   mm('affl','Centre / outlet AFFL'),
   mm('width','Faceplate / hole width'),
   txt('circuit','Switch / circuit label'),
   txt('photo','Photo #'),
   memo('note','Actual rating / extra outlets / obstruction')
  ]));
 }
 out.push(task(room,'points',`${room}:point:extra`,'Count and locate any additional unlisted points','Check behind doors, within kitchen/yard cabinetry and high AC locations. Add a custom row for each one.',[txt('ids','Temporary labels / count'),memo('locations','Wall, offsets and AFFL for every extra point'),txt('photo','Photo / sketch #')]));
 for(const [id,title,hint,fields] of FITOUT[room]||[])out.push(task(room,'fitout',`${room}:fitout:${id}`,title,hint,fields));
 return out;
}

let state={schema:'serina-site-survey-v1',entries:{},extras:[]};
try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');if(saved?.schema===state.schema){state.entries=saved.entries||{};state.extras=Array.isArray(saved.extras)?saved.extras:[]}}catch{}
let activeRoom=ROOMS[0];
const roomSelect=document.querySelector('#roomSelect'),tabs=document.querySelector('#roomTabs'),sections=document.querySelector('#taskSections');
for(const room of ROOMS){const option=document.createElement('option');option.value=room;option.textContent=ROOM_SURVEY[room].label;roomSelect.append(option)}
function store(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));document.querySelector('#exportMessage').textContent='Saved on this device.'}catch{document.querySelector('#exportMessage').textContent='Device storage unavailable. Export JSON now to keep this session.'}}
function entry(id){return state.entries[id]||(state.entries[id]={status:'todo',values:{}})}
function tasksFor(room){const base=buildTasks(room);for(const e of state.extras.filter(x=>x.room===room))base.push(task(room,'fitout',e.id,e.title||'Additional measurement','Use this for any missing wall turn, opening, point or clearance.',[txt('title','What is being measured'),sel('side','Wall / plane',['South','East','North','West','Ceiling','Floor','Other']),mm('offset','Offset from reference corner'),mm('value','Measured dimension'),memo('note','Sketch / explanation / photo #')]));return base}
function resolved(t){return ['measured','absent'].includes(state.entries[t.id]?.status)}
function makeField(t,f){const label=document.createElement('label');if(f.type==='textarea')label.className='wide';const caption=document.createElement('span');caption.textContent=f.label+(f.type==='number'?' · mm':'');label.append(caption);let input;
 if(f.type==='textarea')input=document.createElement('textarea');else if(f.type==='select'){input=document.createElement('select');const blank=document.createElement('option');blank.value='';blank.textContent='Choose…';input.append(blank);for(const name of f.options){const opt=document.createElement('option');opt.value=name;opt.textContent=name;input.append(opt)}}else input=document.createElement('input');
 if(f.type==='number'){input.type='number';input.inputMode='decimal';input.step='1';input.placeholder='mm'}else if(f.type==='text'){input.type='text';input.placeholder='Optional'}
 input.dataset.task=t.id;input.dataset.field=f.key;input.value=entry(t.id).values?.[f.key]??'';label.append(input);return label}
function makeTask(t){const card=document.createElement('article');card.className='task'+(resolved(t)?' done':'');card.dataset.taskId=t.id;
 const top=document.createElement('div');top.className='task-top';const title=document.createElement('h3');title.textContent=t.title;top.append(title);if(t.estimate){const est=document.createElement('span');est.className='estimate';est.textContent=t.estimate;top.append(est)}card.append(top);
 const hint=document.createElement('p');hint.className='task-hint';hint.textContent=t.hint;card.append(hint);
 const fields=document.createElement('div');fields.className='task-fields';for(const f of t.fields)fields.append(makeField(t,f));card.append(fields);
 const foot=document.createElement('div');foot.className='task-status';const label=document.createElement('span');label.textContent='Site status';foot.append(label);const select=document.createElement('select');select.dataset.status=t.id;for(const [value,name] of [['todo','To measure'],['measured','Measured'],['absent','Not present'],['blocked','Could not access']]){const o=document.createElement('option');o.value=value;o.textContent=name;select.append(o)}select.value=entry(t.id).status||'todo';foot.append(select);
 if(t.id.startsWith('extra-')){const remove=document.createElement('button');remove.className='remove-task';remove.type='button';remove.dataset.remove=t.id;remove.textContent='Remove';foot.append(remove)}card.append(foot);return card}
function updateProgress(){let roomDone=0,roomTotal=0,allDone=0,allTotal=0;for(const room of ROOMS){const roomTasks=tasksFor(room);const done=roomTasks.filter(resolved).length;if(room===activeRoom){roomDone=done;roomTotal=roomTasks.length}allDone+=done;allTotal+=roomTasks.length;const b=tabs.querySelector(`[data-room="${room}"]`);if(b){const small=b.querySelector('small');small.textContent=`${done}/${roomTasks.length}`}}
 document.querySelector('#roomProgress').textContent=`${roomDone} / ${roomTotal}`;document.querySelector('#roomProgress').style.borderColor=roomDone===roomTotal?'#4b9a69':'#dce8de';document.querySelector('#overallProgress').textContent=`${allDone} / ${allTotal} checked`}
function renderRoom(){roomSelect.value=activeRoom;document.querySelector('#roomTitle').textContent=ROOM_SURVEY[activeRoom].label;document.querySelector('#roomNote').textContent=ROOM_SURVEY[activeRoom].notes;tabs.replaceChildren();for(const room of ROOMS){const b=document.createElement('button');b.type='button';b.dataset.room=room;b.className=room===activeRoom?'active':'';b.textContent=ROOM_SURVEY[room].label;const count=document.createElement('small');b.append(count);b.onclick=()=>chooseRoom(room);tabs.append(b)}
 sections.replaceChildren();const list=tasksFor(activeRoom);for(const [group,label] of GROUPS){const groupTasks=list.filter(t=>t.group===group);const details=document.createElement('details');details.className='task-section';details.open=group==='shell';const summary=document.createElement('summary');const strong=document.createElement('b');strong.textContent=label;const n=document.createElement('span');n.textContent=`${groupTasks.length} items`;summary.append(strong,n);details.append(summary);const host=document.createElement('div');host.className='task-list';for(const t of groupTasks)host.append(makeTask(t));details.append(host);sections.append(details)}
 document.querySelector('#sectionCount').textContent=`${list.length} site checks in this space`;const i=ROOMS.indexOf(activeRoom);document.querySelector('#prevRoom').disabled=i===0;document.querySelector('#nextRoom').disabled=i===ROOMS.length-1;updateProgress()}
function chooseRoom(room){if(!ROOM_SURVEY[room])return;activeRoom=room;renderRoom();window.scrollTo({top:0,behavior:'smooth'})}
roomSelect.onchange=()=>chooseRoom(roomSelect.value);document.querySelector('#prevRoom').onclick=()=>chooseRoom(ROOMS[ROOMS.indexOf(activeRoom)-1]);document.querySelector('#nextRoom').onclick=()=>chooseRoom(ROOMS[ROOMS.indexOf(activeRoom)+1]);
sections.addEventListener('input',event=>{const el=event.target,id=el.dataset.task,key=el.dataset.field;if(!id||!key)return;entry(id).values[key]=el.value;if(key==='title'){const extra=state.extras.find(x=>x.id===id);if(extra){extra.title=el.value;const h=el.closest('.task').querySelector('h3');h.textContent=el.value||'Additional measurement'}}store()});
sections.addEventListener('change',event=>{const el=event.target;if(!el.dataset.status)return;entry(el.dataset.status).status=el.value;el.closest('.task').classList.toggle('done',resolved({id:el.dataset.status}));store();updateProgress()});
sections.addEventListener('click',event=>{const id=event.target.dataset.remove;if(!id)return;state.extras=state.extras.filter(x=>x.id!==id);delete state.entries[id];store();renderRoom()});
document.querySelector('#addTask').onclick=()=>{const id=`extra-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;state.extras.push({id,room:activeRoom,title:'Additional measurement'});store();renderRoom();const fitout=sections.querySelectorAll('.task-section')[3];fitout.open=true;fitout.querySelector(`[data-task="${id}"][data-field="title"]`)?.focus();fitout.scrollIntoView({behavior:'smooth',block:'start'})};
const menu=document.querySelector('#menuButton'),tools=document.querySelector('#tools');menu.onclick=()=>{tools.hidden=!tools.hidden;menu.setAttribute('aria-expanded',String(!tools.hidden));if(!tools.hidden)tools.scrollIntoView({behavior:'smooth',block:'start'})};
function exportPayload(){const catalog=ROOMS.flatMap(tasksFor).map(({room,group,id,title,hint,estimate,fields})=>({room,group,id,title,hint,estimate,fields:fields.map(({key,label,type})=>({key,label,type}))}));return {schema:state.schema,exportedAt:new Date().toISOString(),unit:'mm',reference:'Serina Type A plan-model survey; values entered by owner on site',rooms:ROOMS.map(id=>({id,label:ROOM_SURVEY[id].label,modelCornersMetres:ROOM_SURVEY[id].corners})),catalog,entries:state.entries,extras:state.extras}}
function exportFile(){const json=JSON.stringify(exportPayload(),null,2);return new File([json],`Serina-site-measurements-${new Date().toISOString().slice(0,10)}.json`,{type:'application/json'})}
function download(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
const message=text=>document.querySelector('#exportMessage').textContent=text;
document.querySelector('#exportButton').onclick=()=>{download(exportFile());message('JSON downloaded. Keep it in Files or share it with me when ready.')};
document.querySelector('#shareButton').onclick=async()=>{const file=exportFile();try{if(navigator.canShare?.({files:[file]})){await navigator.share({title:'Serina site measurements',files:[file]});message('Share sheet opened.')}else{download(file);message('Sharing files is unavailable here; JSON downloaded instead.')}}catch(error){if(error?.name!=='AbortError')message('Sharing failed. Use Export JSON instead.')}};
function summaryText(){const lines=['SERINA SITE MEASUREMENTS','Unit: mm','Model dimensions were not prefilled. Blank items still need a site check.',''];for(const room of ROOMS){let roomLines=[];for(const t of tasksFor(room)){const record=state.entries[t.id];if(!record||record.status==='todo'&&!Object.values(record.values||{}).some(Boolean))continue;const values=t.fields.map(f=>{const v=record.values?.[f.key];return v?`${f.label}: ${v}${f.type==='number'?' mm':''}`:null}).filter(Boolean);roomLines.push(`${t.title} [${record.status}]${values.length?' — '+values.join('; '):''}`)}if(roomLines.length)lines.push(ROOM_SURVEY[room].label,...roomLines,'')}return lines.join('\n')}
document.querySelector('#copyButton').onclick=async()=>{try{await navigator.clipboard.writeText(summaryText());message('Measured entries copied. You can paste them into our chat.')}catch{message('Clipboard unavailable. Use Export JSON instead.')}};
document.querySelector('#importInput').onchange=async event=>{const file=event.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.schema!==state.schema||!data.entries||!Array.isArray(data.extras))throw new Error('Wrong survey format');if(!window.confirm('Import this survey? It will replace measurements currently saved on this phone. Export a backup first if needed.'))return;state={schema:state.schema,entries:data.entries,extras:data.extras};store();renderRoom();message(`Imported ${file.name}.`)}catch{message('This is not a valid Serina site survey JSON file.')}finally{event.target.value=''}};
renderRoom();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./measure-sw.js').catch(()=>{});
