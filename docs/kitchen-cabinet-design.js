import {CABINETS as CABINET_SPECS,CABINET_REVISION} from './cabinet-data.js?v=20261015-cabinets-r2';
const $ = s => document.querySelector(s);
const state = { view:'wet', layout:'quoted', rice:'stored', oven:'bay', inside:false, selected:'hob' };
const C = { ink:'#34443e', dim:'#a7613d', ref:'#7d8983', line:'#6a7770', upper:'#d2d3ce', base:'#4c5357', wood:'#a2a49b', stone:'#eeeee7', open:'#f5f5ed', accent:'#e7eee1', orange:'#ba7851' };
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const n = v => Math.round(v * 10) / 10;
const rect = (x,y,w,h,fill=C.open,stroke=C.line,extra='') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${stroke}" stroke-width="1.4" ${extra}/>`;
const line = (x1,y1,x2,y2,color=C.line,extra='') => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="1.3" ${extra}/>`;
const text = (x,y,s,size=17,color=C.ink,anchor='middle',extra='') => `<text x="${n(x)}" y="${n(y)}" font-size="${size}" fill="${color}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`;
const words = (x,y,rows,size=17,color=C.ink,anchor='middle') => rows.map((t,i)=>text(x,y+i*(size+7),t,size,color,anchor)).join('');
function dim(x1,y1,x2,y2,label,reference=false){ const col=reference?C.ref:C.dim; const vertical=x1===x2; return line(x1,y1,x2,y2,col)+line(x1-5,y1-5,x1+5,y1+5,col)+line(x2-5,y2-5,x2+5,y2+5,col)+(vertical?`<text transform="translate(${n(x1-9)} ${n((y1+y2)/2)}) rotate(-90)" text-anchor="middle" font-size="17" fill="${col}" paint-order="stroke" stroke="white" stroke-width="5">${esc(label)}</text>`:text((x1+x2)/2,y1-9,label,17,col,'middle','paint-order="stroke" stroke="white" stroke-width="5"')); }
const lead = (x,y,tx,ty,rows) => line(x,y,tx,ty,C.ref)+words(tx,ty-12,rows,16,C.ink,tx<x?'end':'start');
const cab = (id,body) => `<g data-cab="${id}" role="button" tabindex="0" aria-label="${esc(catalog()[id]?.title||id)}">${body}</g>`;
const panel = (x,y,w,h,fill,doors=1) => rect(x,y,w,h,fill)+Array.from({length:doors-1},(_,i)=>line(x+w*(i+1)/doors,y,x+w*(i+1)/doors,y+h)).join('');
function measure(){
 const width=state.layout==='proposal'?1900:CABINET_SPECS.prep.width, depth=state.layout==='proposal'?700:CABINET_SPECS.prep.depth;
 const sx=2065/161, sy=2450/190, prepLeft=1303-width;
 const hinge={x:(166-296)*sx,y:(875-741)*sy}, corner={x:prepLeft,y:depth};
 const doorGap=Math.hypot((corner.x-hinge.x)/sx,(corner.y-hinge.y)/sy)-84;
 return { width,depth,prepLeft,aisle:2450-650-depth,freePrep:width-(state.oven==='counter'?669:0)-(state.rice==='counter'?300:0),hoodClear:960-36, hoodBodyHeight:421, hoodOverallHeight:908, hoodChimneyWidth:420, hoodWallFraction:896/2065, hoodBayFraction:960/2065, wetWidth:2065, wetSum:50+960+230+775+50, fridgeClear:762-36, sinkClear:775-36, doorGap:Math.round(doorGap*Math.min(sx,sy)-50),drawerBanks:2, drawers:5, ovenBay:772, ovenBayClear:736, bayHeight:744, riceBayHeight:320, divider:18, ovenBayHeight:406, dishRackWidth:600, pantryWidth:405, upperWidth:1005, sinkPlanX:1627.5, sinkElevationX:437.5, hobPlanX:530, hobElevationX:1535 };
}
function catalog(){const m=measure();return {
 hob:{title:'Cooking base / 960 mm',size:'960 W × 650 D × 900 H mm',contents:'Two deep drawers for pans, steaming pots, lids and bowls. Reserve the top 120 mm below the worktop for the selected hob’s ventilation / heat shield.',detail:'Drawer-front study: 330 + 330 mm below a 120 mm service panel; 100 mm recessed plinth and 20 mm stone. Exact usable drawer height follows the chosen runners and hob.',flag:'Drawer bank and hob clearance need Jason’s shop drawing. Hob body shown: 600 × 430 mm planning envelope; no cut-out released.'},
 sauce:{title:'Sauce pull-out / 230 mm',size:'230 W × 650 D × 900 H mm',contents:'Cooking oil and everyday sauces beside the hob, separate from the sink services.',detail:'Nominal internal width 194 mm with 18 mm sides. Choose the actual rack before Jason fixes this width.',flag:'Sauce rack is in the package; compatibility with this narrower module is still to confirm.'},
 sink:{title:'Sink base / 775 mm',size:'775 W × 650 D × 900 H mm',contents:'Two hinged doors, removable waterproof tray, no fixed shelf. Reserve accessible space for the LG ATOM-U and the actual drain trap.',detail:'Included 600 mm sink and tap. This sketch uses a 220 mm-deep bowl envelope; actual bowl, clips, plumbing and purifier must be checked together.',flag:'LG main unit is 170 W × 410 D × 420 H mm. A 28 mm purified-water tap hole may be additional to the two quoted stone cut-outs.'},
 hood:{title:'V997 hood / 960 mm outer bay',size:'924 mm nominal clear width before fittings',contents:'Removable service panels above the hood; accessible filters and a supplier-approved return-air route to the room.',detail:'V997 is 896 W × 360 D mm; visible lower body is 421 mm high, overall height including chimney is 908 mm. The chimney is 420 mm wide. Manufacturer opening: 910 mm. Illustrated hood bottom is 1200 mm above floor, 300 mm above the proposed 900 mm hob surface.',flag:'Do not close the recirculation outlet inside the cabinet. Return kit, grille and internal route must be confirmed by VATTI / the supplier.'},
 pantry:{title:'Dry-food cupboard / 405 mm',size:'405 W × 350 D mm · lower shelf at 1450 mm above floor',contents:'Keep sealed grains / rice in reachable jars on the lower shelf; snacks and light refills above. Dry storage is separate from both the drainer and cleaning products.',detail:'Nominal 369 mm inner width before fittings. Lower daily space 330 mm high; upper daily space 420 mm. Use shallow removable bins, keep heavy refills low, and avoid stacking things behind each other.',flag:'Do not store wet dishes here. A complete cabinet side separates this food cupboard from the dish drainer.'},
 upper:{title:'Sink upper / drainer + food cupboard',size:'600 mm drainer + 405 mm pantry · 350 D mm',contents:'600 mm dish-drainer cabinet above the sink, beside an independent 405 mm dry-food cupboard. Same finish and continuous door / loft lines.',detail:'Drainer: two removable stainless racks and a removable drip tray; air-dry with the door open, then store dry tableware together in the prep drawers. Pantry: sealed grains on the lower reachable shelf, snacks / light refills above. Loft: light, rarely used items. Sink task LED remains.',flag:'Keep the drainer and food cupboard in separate carcasses so drips cannot reach food. A 600 mm rack is a verified market format; Jason must confirm the included rack and tray before manufacture. Heights remain proposed.'},
 smallupper:{title:'Small upper / 230 mm',size:'230 W × 350 D mm',contents:'Adjustable shelves for cups, spices and small dry goods. Keep heat-sensitive food away from the hood service area.',detail:'Loft continues above the daily shelves. Doors follow the same light warm grey finish as the sink upper.',flag:'Confirm rack and hinge clearances before fixing the narrow bay.'},
 drawers:{title:'Daily drawers / 600 mm',size:`600 W × ${m.depth} D × 900 H mm`,contents:'One serving station: top drawer for cutlery, knives in a protected insert and utensils; middle drawer for plates / bowls; bottom drawer for mugs, food containers and lunch boxes.',detail:'Front-height study: 160 + 270 + 350 mm within the 780 mm base body. Internal usable dimensions depend on runner and side-board thickness.',flag:'The quote names one drawer set. This proposal has two banks: cookware drawers plus these daily drawers. Ask Jason to price the extra bank.'},
 dry:{title:'Closed dry storage / optional longer layout',size:`${m.width-1372} W × ${m.depth} D × 900 H mm`,contents:'An extra closed cupboard in the longer study; retain the 600 mm drawer bank and 772 mm open appliance bay.',detail:'Dry ingredients and serving items behind doors. No additional open display shelves.',flag:'Not part of the quoted 1372 mm footprint. Requires a revised price.'},
 appliance:{title:'Half-open preparation base / 772 mm',size:`772 W × ${m.depth} D mm · 736 mm nominal inner width`,contents:'Open-front bay split vertically: upper clear height 406 mm for an oven position study; lower clear height 320 mm to store the rice cooker. A removable 18 mm divider separates them.',detail:'Usable nominal height is 744 mm: 406 oven bay + 18 divider + 320 rice-cooker bay. A 450 mm-high oven cannot fit this split. The drawn smaller oven is only a position marker; installation approval, clearances, weight support and shelf location depend on the chosen model.',flag:'Your earlier Toshiba countertop candidate cannot be operated here: its manual specifies freestanding placement, no untested cabinet enclosure, and a minimum 850 mm installation height. No oven or cut-out is approved by this sketch.'},
 oven:{title:state.oven==='bay'?'Oven position / model hold':'Countertop alternative / Toshiba candidate',size:state.oven==='bay'?'Upper bay 736 W × 406 H mm clear · not an appliance size':'Toshiba MW3-SAC24SF(BK) · 469 W × 415 D × 280 H mm',contents:state.oven==='bay'?'Reserve a compact oven position in the upper compartment. The oven body AND all installation clearances must fit inside 406 mm total height; no 450 mm-high model fits. Microwave + convection required; air fry optional.':'Microwave, convection, grill and air fry. Operate this freestanding model on the open worktop, with the manual clearances.',detail:state.oven==='bay'?'The position marker is not the Toshiba. Final support level, niche size, ventilation and electrical access follow the selected appliance’s installation drawing.':'Toshiba manual: minimum 850 mm support height; 300 mm above and 200 mm to adjacent side walls. The illustrated support is 900 mm.',flag:state.oven==='bay'?'Do not turn a countertop oven into a built-in unit by simply removing a cabinet door. If retaining a freestanding model, use the separate countertop option.':'This alternative occupies worktop space. The open bay can instead store trays, bowls or an unplugged appliance.'},
 rice:{title:'Rice-cooker parking',size:'300 W × 350 D × 300 H mm body allowance · lower bay 320 H mm',contents:state.rice==='counter'?'At the left end of the preparation counter. Leave the steam outlet open above.':'Stored with lid closed in the lower open compartment. Take it out onto the counter for cooking; no steaming inside the bay.',detail:'The 320 mm compartment leaves only 20 mm above the assumed 300 mm closed cooker. Check the real lid, handle and feet height. A pull-out tray / runner would reduce this clearance and is not included in the 320 mm figure.',flag:'Do not use below a cabinet or directly against the fridge side panel.'},
 fridge:{title:'Full-height fridge surround / 762 mm',size:'762 W mm outside · 726 mm nominal clear before fittings',contents:'Grey woodgrain surround and high storage. Preserve ventilation and enough hinge opening to remove the fridge drawers.',detail:'Reference fridge body only: 650 W × 680 D × 1850 H mm, plus 50 mm rear reserve. Actual refrigerator model is still needed.',flag:'This envelope does not certify fit. Side, rear, top ventilation and opening angle must follow the selected fridge manual.'},
 window:{title:'Kitchen-to-yard window infill',size:'Site measure · quoted RM450 cabinet',contents:'Keep the infill recessed / flush pending the actual window depth and opening survey.',detail:'The source-plan window is beside the yard door. No projecting cabinet box is assumed here.',flag:'Width, depth and its junction with the sink upper are not ready for manufacture.'}
 };}
function shell(body,w=1000,h=1000){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${({wet:'Kitchen hob and sink cabinet front elevation',prep:'Preparation counter and fridge front elevation',plan:'Kitchen plan with appliance and passage dimensions',services:'Under-sink equipment coordination'})[state.view]}"><defs><pattern id="woodgrain" width="9" height="20" patternUnits="userSpaceOnUse"><rect width="9" height="20" fill="#a2a49b"/><path d="M2 0v20 M7 0v20" stroke="#93998e" stroke-width=".6"/></pattern></defs>${body}</svg>`;}
function wet(){const s=.24,x=235,f=810,X=v=>x+v*s,Y=v=>f-v*s,inside=state.inside;let a='';
 a+=text(500,39,'A / WET KITCHEN ELEVATION',22)+text(500,69,'Viewed from INSIDE the kitchen, facing the wet wall',16,C.ref);
 a+=rect(X(0),Y(2850),2065*s,2850*s,'#fafaf6','#dedfd8');
 a+=dim(X(0),108,X(2065),108,'2065 · source wall',true);
 a+=words(190,190,['YARD /','WINDOW END'],13,C.ref,'end')+words(780,190,['FOYER','END'],13,C.ref,'start');
 a+=rect(X(0),Y(900),2065*s,20*s,C.stone)+rect(X(50),Y(100),1965*s,100*s,'#646c65');
 const base=(id,start,w,doors=1)=>cab(id,panel(X(start),Y(880),w*s,780*s,inside?C.open:C.base,doors));
 // Front-elevation x = 2065 - plan x: the room is viewed toward its south wall.
 a+=base('sink',50,775,2)+base('sauce',825,230)+base('hob',1055,960);
 if(inside){
  a+=rect(X(90),Y(880),600*s,200*s,'#d9e1d8')+rect(X(110),Y(538),170*s,420*s,'#c8d8cf');
  a+=text(X(195),Y(315),'LG',13)+words(X(437.5),Y(570),['SINK SERVICES'],14);
  a+=line(X(680),Y(680),X(680),Y(250),C.ref);
  [300,530,760].forEach(v=>a+=line(X(843),Y(v),X(1037),Y(v)));
  a+=text(X(940),Y(430),'SAUCES',12,C.ink,'middle',`transform="rotate(-90 ${X(940)} ${Y(430)})"`);
  a+=words(X(1535),Y(545),['POTS / STEAMER','2 deep drawers'],15);
 }else{
  [420,455].forEach(v=>a+=line(X(v),Y(750),X(v),Y(590),'#c2cbc3','stroke-width="3"'));
  a+=line(X(1010),Y(750),X(1010),Y(590),'#c2cbc3','stroke-width="3"');
 }
 [430,760].forEach(v=>a+=line(X(1055),Y(v),X(2015),Y(v)));
 a+=rect(X(1055),Y(880),960*s,120*s,inside?'#e7ebe1':C.base);
 if(inside)a+=text(X(1535),Y(810),'HOB VENT / HEAT ZONE',12,C.ref);
 else [385,715].forEach(v=>a+=line(X(1360),Y(v),X(1710),Y(v),'#c2cbc3','stroke-width="3"'));
 a+=rect(X(137.5),Y(920),600*s,20*s,'#b7c5be')+line(X(420),Y(920),X(420),Y(1100))+line(X(420),Y(1100),X(505),Y(1100));
 a+=rect(X(1235),Y(915),600*s,15*s,'#303b35');
 // Two calm upper masses, one continuous loft line; service details only in the internal view.
 const upper=(id,start,w,bottom)=>{let b=panel(X(start),Y(2820),w*s,(2820-bottom)*s,inside?C.open:C.upper,inside||id!=='hood'?1:2);b+=line(X(start),Y(2200),X(start+w),Y(2200));return cab(id,b);};
 // Two separate carcasses prevent drips reaching the food cupboard.
 a+=upper('upper',50,600,1450)+upper('pantry',650,405,1450)+upper('hood',1055,960,1621);
 if(inside){
  a+=text(X(350),Y(2480),'LIGHT STORAGE',12)+text(X(852.5),Y(2480),'REFILLS',12);
  [1620,1900].forEach(v=>a+=rect(X(80),Y(v),540*s,100*s,'#dce4d7'));
  a+=rect(X(80),Y(1490),540*s,25*s,'#b9c8bf')+words(X(350),Y(2110),['DISH DRAINER','+ REMOVABLE TRAY'],11);
  a+=line(X(668),Y(1780),X(1037),Y(1780))+words(X(852.5),Y(1980),['SNACKS','LIGHT REFILLS'],11)+words(X(852.5),Y(1620),['SEALED','GRAINS'],11);
  a+=rect(X(1160),Y(2680),750*s,380*s,'#edf0e7',C.line,'stroke-dasharray="5 4"')+words(X(1535),Y(2510),['HOOD SERVICE','RETURN AIR TO ROOM'],12);
 }else{
  // Hide the internal centre line: each functional bay has one calm door.
  a+=cab('upper',rect(X(50),Y(2200),600*s,750*s,C.upper))+cab('pantry',rect(X(650),Y(2200),405*s,750*s,C.upper));
  [610,690].forEach(v=>a+=line(X(v),Y(1520),X(v),Y(1650),C.line,'stroke-width="2.5"'));
 }

 // Manufacturer sheet page 2: lower body H421; chimney W420; total envelope H908.
 // The closed elevation conceals the narrow chimney behind removable fronts.
 let hoodShape='';
 if(inside)hoodShape+=rect(X(1325),Y(2108),420*s,487*s,'#5c6860')+line(X(1325),Y(2071),X(1745),Y(2071),'#a6b0a6');
 hoodShape+=rect(X(1087),Y(1621),896*s,421*s,'#414d47')+rect(X(1087),Y(1621),896*s,40*s,'#303c35')+rect(X(1130),Y(1560),810*s,220*s,'#536157')+rect(X(1130),Y(1300),810*s,60*s,'#25322b');
 hoodShape+=text(X(1535),Y(1440),'VATTI V997',14,'#eff1e9');
 a+=cab('hood',hoodShape);
 a+=dim(865,Y(1200),865,Y(1621),'421 body');
 a+=line(X(75),Y(1440),X(1025),Y(1440),'#c69553','stroke-width="4"');
 a+=dim(170,Y(0),170,Y(900),'900 worktop')+dim(120,Y(0),120,Y(2850),'2850 ceiling · assumed',true);
 a+=dim(810,Y(900),810,Y(1200),'300 hood gap');
 a+=dim(50,Y(900),50,Y(1450),'550 sink clearance');
 a+=dim(X(50),850,X(825),850,'775')+dim(X(825),850,X(1055),850,'230')+dim(X(1055),850,X(2015),850,'960');
 a+=dim(X(50),Y(1330),X(650),Y(1330),'600 drainer')+dim(X(650),Y(1330),X(1055),Y(1330),'405 food');
 a+=text(500,910,'SINK + LED LEFT  /  HOB + HOOD RIGHT',17)+words(500,946,['50 mm end allowances · Wet base 650 deep · Upper 350 deep','Hood 896 W × 421 body H; chimney concealed in closed-front view'],15,C.ref);
 return shell(a,1000,1000);}
function prep(){const m=measure(),s=.24,x=155,f=810,X=v=>x+v*s,Y=v=>f-v*s,inside=state.inside,ap=m.width-772;let a='';
 a+=text(500,39,'B / PREPARATION COUNTER + FRIDGE',22)+text(500,69,'Half-open base · Light warm-grey fronts + grey-wood recess',16,C.ref);
 a+=rect(X(0),Y(2850),(m.width+762)*s,2850*s,'#fafaf6','#e1e5db');
 a+=dim(X(0),108,X(m.width),108,`${m.width} prep counter`,state.layout==='quoted')+dim(X(m.width),108,X(m.width+762),108,'762 fridge',true);
 a+=rect(X(0),Y(100),m.width*s,100*s,'#646c65');
 let d=panel(X(0),Y(880),600*s,780*s,inside?C.open:C.upper);[450,720].forEach(v=>d+=line(X(0),Y(v),X(600),Y(v)));
 if(inside)d+=text(X(300),Y(800),'CUTLERY',13)+text(X(300),Y(570),'PLATES / BOWLS',13)+words(X(300),Y(300),['CONTAINERS','LUNCH BOXES'],13);
 else [385,655,815].forEach(v=>d+=line(X(150),Y(v),X(450),Y(v),C.line,'stroke-width="2.5"'));
 a+=cab('drawers',d);
 if(ap>600){a+=cab('dry',panel(X(600),Y(880),(ap-600)*s,780*s,inside?C.open:C.upper,1));if(inside)a+=text(X((600+ap)/2),Y(550),'DRY GOODS',12);}
 let bay=rect(X(ap),Y(880),772*s,780*s,'url(#woodgrain)')+rect(X(ap+18),Y(862),736*s,744*s,'#e3e5da');
 bay+=rect(X(ap+18),Y(456),736*s,18*s,'url(#woodgrain)');
 if(state.oven==='bay'){
  bay+=rect(X(ap+86),Y(806),600*s,350*s,'#d1d7ce',C.ref,'stroke-dasharray="5 4"');
  bay+=words(X(ap+386),Y(710),['OVEN BAY','406 H CLEAR','MODEL HOLD'],11);
 }else bay+=words(X(ap+386),Y(710),['OPEN STORAGE','406 H CLEAR'],12);
 if(state.rice==='stored')bay+=cab('rice',rect(X(ap+65),Y(418),300*s,300*s,'#f0f1e9',C.line,'rx="10"')+text(X(ap+215),Y(260),'RICE',11));
 bay+=words(X(ap+555),Y(320),['320 H','STORAGE','ONLY'],10);
 a+=cab('appliance',bay)+rect(X(0),Y(900),m.width*s,20*s,C.stone);
 if(state.oven==='counter'){
  const ov=m.width-669;
  a+=cab('oven',rect(X(ov),Y(1180),469*s,280*s,'#414c46')+rect(X(ov+25),Y(1155),350*s,225*s,'#87928a'));
  a+=rect(X(ov),Y(1480),469*s,300*s,'none',C.orange,'stroke-dasharray="5 5"')+text(X(ov+235),Y(1370),'300 clear above',12,C.dim);
  a+=dim(X(ov+469),Y(1230),X(m.width),Y(1230),'200 side');
 }
 if(state.rice==='counter')a+=cab('rice',rect(X(0),Y(1200),300*s,300*s,'#dde1d7',C.line,'rx="15"')+text(X(150),Y(1045),'RICE',13));
 a+=dim(X(state.rice==='counter'?300:0),Y(1280),X(state.oven==='counter'?m.width-669:m.width),Y(1280),`${m.freePrep} clear top`);
 let fr=rect(X(m.width),Y(2820),762*s,2820*s,'url(#woodgrain)');
 fr+=rect(X(m.width+56),Y(1850),650*s,1850*s,'#c4c9c1')+line(X(m.width+56),Y(600),X(m.width+706),Y(600))+text(X(m.width+381),Y(1200),'FRIDGE',16)+text(X(m.width+381),Y(1090),'model to confirm',13);
 fr+=panel(X(m.width+18),Y(2820),726*s,820*s,inside?C.open:'url(#woodgrain)',2);
 if(inside)fr+=text(X(m.width+381),Y(2490),'HIGH STORAGE',13);
 fr+=text(X(m.width+381),Y(2110),'VENT PER MANUAL',12);a+=cab('fridge',fr);
 a+=dim(110,Y(0),110,Y(900),'900 worktop');
 let chain=[600,...(ap>600?[ap-600]:[]),772],pos=0;chain.forEach(w=>{a+=dim(X(pos),855,X(pos+w),855,String(w));pos+=w;});
 a+=words(500,916,[`Prep ${m.width} W × ${m.depth} D mm · Open bay 736 mm nominal clear`,'744 clear height = 406 upper + 18 divider + 320 lower. All sizes mm.'],15,C.ref);
 a+=text(500,980,state.oven==='bay'?'Oven position pending: 450 mm-high ovens and the earlier Toshiba do NOT fit this arrangement.':'Rice cooker stored below; take out onto the counter before use.',15,C.dim);
 return shell(a,1050,1020);}
function plan(){const m=measure(),s=.19,X=v=>470+v*s,Y=v=>155+v*s,sx=2065/161,sy=2450/190;let a='';
 a+=text(500,40,'KITCHEN / TOP VIEW',22)+text(500,70,'Source-plan registration · Cabinet and appliance proposals overlaid',16,C.ref);
 a+=`<image href="plan-assets/kitchen-source-crop.png" x="${X((140-296)*sx)}" y="${Y((720-741)*sy)}" width="${350*sx*s}" height="${225*sy*s}" opacity=".24"/>`;
 const modules=[[50,960,'hob'],[1010,230,'sauce'],[1240,775,'sink']];
 a+=rect(X(0),Y(1800),2065*s,650*s,C.stone);for(const [left,w,id]of modules)a+=cab(id,rect(X(left),Y(1800),w*s,650*s,id==='sink'?'#dbe3d6':'#e7e8df'));
 a+=cab('hob',rect(X(230),Y(1955),600*s,430*s,'#4c5550')+text(X(530),Y(2200),'HOB',15,'#f0f2ed'));
 a+=cab('sink',rect(X(1327.5),Y(1900),600*s,450*s,'#bdcec6',C.line,'rx="8"')+text(X(1627.5),Y(2150),'SINK',15));
 a+=cab('dry',rect(X(m.prepLeft),Y(0),m.width*s,m.depth*s,C.upper));
 a+=cab('fridge',rect(X(1303),Y(0),762*s,730*s,'url(#woodgrain)')+words(X(1684),Y(330),['FRIDGE','762 outer'],16));
 const ovenLeft=1303-669;
 if(state.oven==='counter')a+=cab('oven',rect(X(ovenLeft),Y(m.depth-50-415),469*s,415*s,'#515d55')+text(X(ovenLeft+234.5),Y(m.depth-230),'COMBI',14,'white'));
 if(state.rice==='counter')a+=cab('rice',rect(X(m.prepLeft),Y(m.depth-400),300*s,350*s,'#eff2e9',C.line,'rx="12"')+text(X(m.prepLeft+150),Y(m.depth-190),'RICE',13));
 a+=dim(X(m.prepLeft),Y(-150),X(1303),Y(-150),`${m.width} prep`,state.layout==='quoted');
 a+=dim(X(1303),Y(-150),X(2065),Y(-150),'762',true);
 a+=dim(X(0),Y(2640),X(2065),Y(2640),'2065 source wall',true);
 a+=dim(X(-90),Y(m.depth),X(-90),Y(1800),`${m.aisle} clear aisle`);
 a+=dim(940,Y(0),940,Y(2450),'2450 source depth',true);
 a+=dim(X(m.prepLeft+(state.rice==='counter'?300:0)),Y(m.depth+110),X(state.oven==='counter'?ovenLeft:1303),Y(m.depth+110),`${m.freePrep} clear top`);
 if(state.oven==='bay')a+=cab('appliance',rect(X(1303-772),Y(100),772*s,(m.depth-200)*s,'none',C.ref,'stroke-dasharray="6 4"')+text(X(1303-386),Y(m.depth-160),'OPEN BAY BELOW',12,C.ref));
 // Source hinge and opening sector: entry door opens inward; yard PD opens outward.
 const hx=(166-296)*sx,hy=(875-741)*sy,rx=84*sx*s,ry=84*sy*s;
 a+=`<path d="M ${X(hx)} ${Y(hy)-ry} A ${rx} ${ry} 0 0 1 ${X(hx)+rx} ${Y(hy)} L ${X(hx)} ${Y(hy)} Z" fill="#dfe7d5" fill-opacity=".35" stroke="#8b9784" stroke-dasharray="5 4"/>`;
 a+=words(195,585,['ENTRY','Original door swing'],16,C.ref);
 a+=line(X(1050),Y(1430),X(1050),Y(1640),C.ink)+line(X(1050),Y(1640),X(1010),Y(1590),C.ink)+line(X(1050),Y(1640),X(1090),Y(1590),C.ink)+text(X(1050),Y(1350),'VIEW A',13);
 const py1=(812-741)*sy,py2=(875-741)*sy,px=(464-296)*sx;
 a+=line(X(px),Y(py1),X(px+600),Y(py1),C.orange)+text(953,Y((py1+py2)/2),'YARD',15)+words(805,Y(py2)+25,['PD DOOR','opens into yard'],14,C.ref);
 const wy1=(881-741)*sy,wy2=(921-741)*sy;
 a+=cab('window',rect(X(px-40),Y(wy1),80*s,(wy2-wy1)*s,'#cfdbd7',C.line,'stroke-dasharray="4 3"'));
 a+=line(X(px),Y(wy2),900,700,C.ref)+words(900,730,['WINDOW INFILL · site measure'],14,C.ref,'end');
 a+=words(500,760,[`Worktop depth: wet 650 / prep ${m.depth} mm`,`Approx. entry-door sweep margin: ${m.doorGap} mm after 50 mm allowance`],17,C.ref);
 a+=words(500,834,[state.oven==='counter'?'Oven body 469 × 415 mm; 200 mm beside fridge':'Counter clear of oven · Open bay below; model not selected','Closed-door aisle shown. Open oven / fridge doors temporarily occupy it.'],16,C.ref);
 return shell(a,1000,910);}
function services(){const x=130,s=.6,f=755,X=v=>x+v*s,Y=v=>f-v*s;let a='';
 a+=text(500,43,'SINK BASE / SERVICE COORDINATION',22)+text(500,77,'Illustrative equipment envelopes · Check actual bowl, trap and hoses',16,C.ref);
 a+=cab('sink',rect(X(0),Y(900),775*s,900*s,'#f7f8f1'));
 a+=rect(X(18),Y(880),739*s,762*s,'#fff')+rect(X(0),Y(900),775*s,20*s,C.stone)+rect(X(40),Y(880),600*s,200*s,'#d3dcd4');
 a+=cab('sink',rect(X(50),Y(538),170*s,420*s,'#bed0c4')+words(X(135),Y(370),['LG','ATOM-U'],16));
 a+=rect(X(25),Y(638),270*s,520*s,'none',C.orange,'stroke-dasharray="6 5"');
 a+=`<path d="M ${X(520)} ${Y(680)} v80 h50 v90 h-85 v-40" fill="none" stroke="#8b9891" stroke-width="13"/>`;
 a+=text(X(550),Y(280),'TRAP / HOSES',14,C.ref)+text(X(415),Y(70),'REMOVABLE TRAY',14);
 a+=dim(X(0),Y(1010),X(775),Y(1010),'775 outer / 739 inner');
 a+=dim(90,Y(0),90,Y(900),'900 worktop');
 a+=dim(X(310),Y(538),X(310),Y(680),'142 nominal');
 a+=words(720,260,['LG MAIN UNIT','170 W × 410 D × 420 H'],17)+words(720,335,['+ about 100 mm extra','installation space requested','by LG; exact access to confirm'],16,C.ref);
 a+=words(720,460,['NO FIXED SHELF','NO DRAWERS'],18,C.dim)+words(720,540,['Accessible dry-side sockets','Keep clear of water joints','Final route by electrician'],16);
 a+=words(720,670,['PURIFIED-WATER FAUCET','28 mm hole; larger fixing clearance','Confirm with sink template'],15,C.dim);
 a+=words(500,838,['The drawn purifier can fit below the assumed 220 mm-deep bowl envelope.','This does not verify hoses, filter servicing, clips or the actual drain trap.','LG installer and Jason must coordinate before cutting the stone.'],17,C.ref);
 return shell(a,1000,950);}
function selectCab(id){if(!catalog()[id])return;state.selected=id;const c=catalog()[id];$('#detail').innerHTML=`<p class="eyebrow">CABINET DETAIL</p><h3>${esc(c.title)}</h3><dl><dt>Outside / reference size</dt><dd>${esc(c.size)}</dd></dl><p>${esc(c.contents)}</p><p>${esc(c.detail)}</p><p class="flag">${esc(c.flag)}</p>`;document.querySelectorAll('#schedule button').forEach(b=>b.classList.toggle('selected',b.dataset.item===id));}
function render(){const m=measure();$('#sheet-number').textContent=`K-${({wet:'01',prep:'02',plan:'03',services:'04'})[state.view]} · DESIGN STUDY / NOT FOR CUTTING`;
 $('#sheet-title').textContent=({wet:'Hob + sink cabinets',prep:'Preparation counter + fridge',plan:'Kitchen footprint',services:'Under the sink'})[state.view];
 $('#drawing').innerHTML=({wet,prep,plan,services})[state.view]();
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
 $('#metrics').innerHTML=[['Clear prep',`${m.freePrep} mm`,state.oven==='bay'?'Oven position reserved below; model hold':(state.rice==='counter'?'Between rice cooker and oven':'Rice cooker stored below'),m.freePrep<900],['Working aisle',`${m.aisle} mm`,'Counter fronts; appliances closed',m.aisle<1067],['Hood opening',`${m.hoodClear} mm`,'960 outer − 2 × 18 mm sides; fittings still to check',false],['Scope status',state.layout==='proposal'?'Variation':'Quoted size','Interior modules and extra drawer bank need approval',true]].map(([label,value,note,warn])=>`<div class="metric ${warn?'warn':''}"><small>${label}</small><b>${value}</b><p>${note}</p></div>`).join('');
 const ids=['sink','sauce','hob','upper','pantry','hood','drawers','appliance',...(state.layout==='proposal'?['dry']:[]),'fridge','window'];
 $('#schedule').innerHTML=ids.map(id=>`<button data-item="${id}"><strong>${catalog()[id].title}</strong><span>${catalog()[id].size}</span></button>`).join('');
 document.querySelectorAll('[data-cab]').forEach(g=>{g.addEventListener('click',()=>selectCab(g.dataset.cab));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCab(g.dataset.cab);}});});
 document.querySelectorAll('[data-item]').forEach(b=>b.addEventListener('click',()=>{selectCab(b.dataset.item);$('#detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}));
 selectCab(state.selected);window.kitchenStudy={cabinetRevision:CABINET_REVISION,...m,state:{...state}};
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;state.selected=({wet:'hob',prep:'oven',plan:'appliance',services:'sink'})[state.view];render();}));
$('#rice').value=state.rice;$('#cabinet-view').value='front';$('#oven-mode').value=state.oven;$('#layout').value=state.layout;$('#layout').addEventListener('change',e=>{state.layout=e.target.value;if(state.selected==='dry'&&state.layout==='quoted')state.selected='appliance';render();});
$('#oven-mode').addEventListener('change',e=>{state.oven=e.target.value;render();});
$('#rice').addEventListener('change',e=>{state.rice=e.target.value;render();});$('#cabinet-view').addEventListener('change',e=>{state.inside=e.target.value==='inside';render();});
function zoom(enlarged){$('#drawing-scroll').classList.toggle('enlarged',enlarged);$('#enlarge').setAttribute('aria-pressed',String(enlarged));$('#fit').setAttribute('aria-pressed',String(!enlarged));}
$('#fit').addEventListener('click',()=>zoom(false));$('#enlarge').addEventListener('click',()=>zoom(true));$('#print').addEventListener('click',()=>window.print());
render();
