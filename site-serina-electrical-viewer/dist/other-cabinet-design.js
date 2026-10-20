import {CABINET_FINISHES} from './cabinet-palette.js?v=20261017-retained-louvre-r1';
import {CABINETS as CABINET_SPECS,CABINET_REVISION} from './cabinet-data.js?v=20261017-whole-home-cabinets-r1';
import {BEDROOM2,DESIGN_REVISION} from './agreed-design.js?v=20261020-cabinet-render-fix-r1';
const $=s=>document.querySelector(s), esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'), N=v=>Math.round(v*10)/10;
const C={ink:'#34453d',line:'#78857b',dim:'#a7613d',ref:'#88938c',front:CABINET_FINISHES.light.colour,shoe:CABINET_FINISHES.light.colour,inside:'#f1f3eb',wood:'#c1c4b9',drawer:'#dae3d5',graphite:CABINET_FINISHES.lower.colour,blue:'#c2d5d0'};
const state={cabinet:'all',view:'front',part:null};
const D={
 b2:{name:'Bedroom 2 multipurpose cabinet',code:'W-01',width:Math.round(BEDROOM2.wardrobe.width*1000),depth:600,height:2850,bodyTop:2820,plinth:100,split:2260,doors:3,endRadius:CABINET_SPECS.b2.exposedEndRadius,modules:CABINET_SPECS.b2.modules,note:'1440 mm three-door cabinet · convertible hanging + one drawer',parts:['b2-hang','b2-drawer','b2-shelves','b2-mirror','b2-loft'],drawer:[100,350],drawerRunner:450,drawerSide:'under right two-door hanging bay when facing cabinet',check:'Facing the cabinet: LEFT 480 mm adjustable shelves / fin compartment, RIGHT 960 mm hanging bay with ONE broad bottom drawer. No small drawer in the shelf column. Keep the 360 mm entry-side services wall clear. Pull both hanging doors open and tuck the chair before using the broad drawer. The room view distinguishes the working chair from a proposed tucked position; actual chair / hinges remain to verify.'},
 b3:{name:'Bedroom 3 wardrobe',code:'W-02',width:1829,depth:600,height:2850,bodyTop:2820,plinth:100,split:2260,doors:4,endRadius:CABINET_SPECS.b3.exposedEndRadius,modules:CABINET_SPECS.b3.modules,drawers:[350,280,220],drawerSide:'external drawers at left when facing cabinet',drawerRunner:450,note:'1829 mm footprint · aligned hinged main and loft doors',parts:['b3-hang','b3-extra','b3-drawers','b3-loft'],check:'Main doors finish at 2260 mm; four separate hinged loft doors align above. Upper doors still swing through the possible blade-height band; fan / door clearance remains to measure. Three external drawers at LEFT, nearest the entry / bed-foot aisle; open them directly without opening the wardrobe doors. Both bays have the same approximately 825 mm cabinet-to-bed gap in the current model; a 450 mm drawer leaves only about 375 mm. Use the foot-side approach and verify real standing space, hinges and bed together; changing sides does not create a wider frontal aisle.'},
 tv:{name:'Television cabinet',code:'L-01',width:2134,depth:360,height:320,modules:[533.5,533.5,533.5,533.5],note:'Quoted 7 ft footprint · low floor-standing plain charcoal finish',parts:['tv-left','tv-equipment','tv-media','tv-right'],check:'The equipment front is removable and ventilated, with rear access. Keep the Wi-Fi router in the open. Test Wireless One Connect signal and heat in the actual bay before closing its front. The TV still needs a power lead; the dashed surface route is not a concealed wall chase. No TV model or mounting height is fixed by this drawing.'},
 shoe:{name:'Shoe cabinet',code:'E-01',width:610,depth:380,height:2700,bottom:120,top:2820,drawer:[1000,1160],note:'Quoted 2 ft width · 2700 mm BODY · floated 120 mm',parts:['shoe-daily','shoe-keys','shoe-upper','shoe-mount'],check:'Cabinet body 2700 mm + 120 mm floor clearance = 2820 mm top; 30 mm site scribe to the assumed 2850 mm ceiling. The new key drawer is a proposed addition. Confirm loaded-wall fixings, the private foyer location, door / grille swings and clear exit path. Shelf spacing must suit the actual shoes.'}
};
const P={
 'b2-hang':{title:'Right two doors / convertible hanging',size:'960 mm outer bay · 924 mm nominal inner width',use:'Upper rail at 2050 mm; removable lower rail at 1200 mm. Ordinary short clothes can use both levels. Remove the lower rail for a single tall zone for dry dive gear / longer items.',detail:'One broad drawer below finishes at 350 mm, with an 18 mm shelf above. Lower-rail clearance to that shelf is about 832 mm; upper-to-lower rail spacing is 850 mm. Pin rows allow removable shelves if the future use changes.',hold:'Check actual garments with their hangers: both drops must suit the contents. The tall hanging drop is about 1682 mm with the lower rail removed. No promise that every wetsuit fits; store fully dried equipment only.'},
 'b2-drawer':{title:'One broad drawer below hanging',size:'250 mm front · 100–350 mm above floor · 450 mm runner target',use:'ONE wide internal drawer across the right two-door hanging bay. Use removable organisers for dive accessories, cables and small office items. No separate small drawer in the left column.',detail:'924 mm nominal bay interior; after two 25 mm hinge reservations the runner zone is about 874 mm wide. Actual drawer-box size / load rating depend on hardware. Open both doors before pulling the drawer.',hold:'This broad drawer faces the chair zone. Tuck the chair under the desk before opening it. The room study shows a 400 mm chair shift; test your actual chair base, posture, hinges and runner travel on site.'},
 'b2-shelves':{title:'Left column / all adjustable shelves',size:'480 mm outer bay · 444 mm nominal inner width',use:'No drawer here. Adjustable shelves hold folded clothes, bags, boxes and dive accessories. Remove lower shelves to create the dedicated upright fin / tall-item space.',detail:'The illustrated fin setup has about 1200 mm clear height from the 118 mm base top to the 1318 mm shelf underside. Shelf tops above are at 1336, 1660 and 1980 mm. The optional low shelf is shown dashed, removed for upright fins. The R40 end return is within the existing footprint; the first door front is about 40 mm narrower.',hold:'1200 mm is a provisional reservation, not your measured fin length. Confirm the longest fin including foot pocket and the actual pair width. Keep this tall compartment undivided; use a removable base liner. Upper shelves remain adjustable.'},
 'b2-mirror':{title:'Inside-door mirror / left door',size:'350 W × 1400 H mm target · bottom 750 mm',use:'Retain the unlit mirror inside the left narrow door. Outside remains three plain doors; no new exterior open niche.',detail:'Dashed overlay indicates the mirror attached to the door, not a fixed panel dividing the shelves. Reserve about 50 mm in front of the storage for the mirror / fittings.',hold:'Check mirrored-door weight, hinge angle and its clearance to the open adjacent pair. Final hinge handing and door / drawer clearances belong in the shop drawing.'},
 'b2-loft':{title:'Closed loft / spare fittings',size:'480 + 960 mm outer bays above 2260 mm',use:'Smaller left loft for spare fittings / boxes; larger right loft for luggage, removable shelves and rarely used items.',detail:'Three separate loft fronts follow the three main doors. About 524 mm raw clear height before hardware; ceiling scribe closes the assumed 30 mm gap.',hold:'Ceiling height and real luggage remain to measure. Include the broad drawer, removable rails and adjustable shelves in the shop drawing / revised price.'},
 'b3-hang':{title:'Right bay / double hanging',size:'914.5 mm outer bay · 878.5 mm nominal inner width',use:'Facing the cabinet: the RIGHT bay has two short-hanging rails at 1050 and 2050 mm. Prioritise your shirts and T-shirts here.',detail:'Hanging bars span approximately 838.5 mm between the illustrated supports. The drawing gives real hanging drops, not three cramped shirt rows.',hold:'Measure garments with their hangers before fixing the rail levels. Two 175 cm users do not automatically have identical reach or clothing lengths.'},
 'b3-extra':{title:'Left bay / hanging above drawers',size:'878.5 mm nominal inner width · rail at 2050 mm',use:'Facing the cabinet: one wide rail at LEFT for the remaining shirts or folded trousers. About 1082 mm from the rail to the proposed drawer-top shelf.',detail:'Together the two bays have three full-width clothes rails. Drawer-top shelf is 950–968 mm above floor.',hold:'No external niche or cabinet lighting. Hanging remains the main use of the wardrobe.'},
 'b3-drawers':{title:'Three external drawers / left bay',size:'About 828 mm runner-zone width · external fronts about 871 mm · 450 mm runner target',use:'LEFT bay, nearest the entry and bed-foot aisle. Top: underwear / socks with two removable organisers. Middle: towels. Bottom: bed sheets, pillowcases and duvet covers.',detail:'Front-height study, top to bottom: 220 / 280 / 350 mm. These are broad external drawers with direct access; no hinged door covers them. Final usable width / height depends on the runner system.',hold:'Left hinged doors start above the drawer stack at 968 mm. The R40 end return trims the first 40 mm of the left drawer fronts; drawer-box width stays unchanged. Confirm runner travel, bed clearance and standing space; external drawers do not need the upper doors opened first.'},
 'b3-loft':{title:'Luggage and miscellaneous storage',size:'Two 878.5 mm nominal clear bays · 524 mm raw height before hinges',use:'Suitcases stored flat, travel bags and bulky low-use items. A 700 × 450 × 280 mm case is shown as a size check only.',detail:'Four hinged loft fronts above 2260 mm align with the four main doors. Check hinge intrusion, actual case removal and the complete upper-door swing against the fan.',hold:'This loft-door target is now shown in the 3D preview; it still needs a signed shop drawing / quotation. Fan / site heights, hinges and opening clearances must be agreed.'},
 'tv-left':{title:'Daily remotes and small items',size:'533.5 mm nominal front module · 300 mm runner target',use:'Remote controls, charging leads and small living-room items in one shallow full-extension drawer.',detail:'Keep the top visually quiet. Graphite fronts share the same low horizontal line.',hold:'Drawer internals and hardware are proposed; the quotation establishes cabinet length, not this drawer count.'},
 'tv-equipment':{title:'Ventilated equipment bay',size:'533.5 mm nominal module · about 515 mm clear width × 224 H × 292 D mm',use:'One Connect / ONT position, subject to the actual equipment and power adapters. A removable non-metal ventilated front keeps access easy.',detail:'Reserve a 50 mm rear service zone in this bay; provide cabinet ventilation paths. The Wi-Fi router stays in the open. Do not seal warm equipment or a power strip inside an inaccessible box.',hold:'Samsung warns that enclosure / obstructions, especially metal, can affect the wireless link. Test in place; an open-front or top-of-console position may be needed. Equipment sizes are not selected here.'},
 'tv-media':{title:'Media and accessories',size:'533.5 mm nominal front module',use:'Controllers, small accessories and regularly used cables in a low drawer.',detail:'Use removable dividers so the arrangement can change as equipment changes.',hold:'Do not assume tall books, vertical game consoles or a soundbar fit the 224 mm raw internal height.'},
 'tv-right':{title:'Reserve storage',size:'533.5 mm nominal front module',use:'Spare cables, manuals and less-used small items. Keep spare adapters labelled together.',detail:'Floor-standing body, about 60 mm recessed plinth, 18 mm top and bottom as the study baseline.',hold:'Final equipment and skirting / socket positions determine back access and installation gaps.'},
 'shoe-daily':{title:'Everyday shoes',size:'610 mm outer width · 574 mm nominal inner width · about 340 mm useful depth',use:'Four adjustable rows below the key drawer. Aim for two pairs across only when your actual shoe widths fit.',detail:'Four lower openings are about 197 mm high, with shelf positions at 338, 553 and 768 mm. Slippers can park in the 120 mm floor gap.',hold:'Tall shoes need a shelf removed / repositioned. Check the longest pair; do not infer shoe size from body height.'},
 'shoe-keys':{title:'Reachable key drawer',size:'Full-width front at 1000–1160 mm above floor · 160 mm front height',use:'Keys, wallet and small entry items; two removable organisers for the two of you.',detail:'One direct-access drawer, so you do not need to open both shoe doors to drop your keys. A 300 mm runner is the depth target.',hold:'This drawer is a new design proposal to price with Jason, not an inclusion proven by the RM1040 shoe-cabinet line.'},
 'shoe-upper':{title:'Occasional shoes and boxes',size:'Upper section 1160–2820 mm · adjustable shelves',use:'Occasional footwear at the reachable levels; shoe boxes, spare bags and light low-use items high up.',detail:'Shelf targets at 1478, 1778, 2078 and 2408 mm. About 12–16 pairs overall is a planning estimate when some upper space is kept for boxes; real shoes may reduce it.',hold:'Provide cabinet ventilation and keep damp shoes out of the dry storage. Do not make one 2700 mm-high hinged door; the fronts are split.'},
 'shoe-mount':{title:'Floating body and floor gap',size:'120 floor gap + 2700 body = 2820 mm top',use:'A clear space below for slippers and cleaning. Hidden support rails / fixings carry the loaded cabinet.',detail:'380 mm overall depth is taken from the current model. Retain ventilation at the cabinet top / bottom; no wall vent is assumed.',hold:'Jason must design fixings for the actual wall and weight. No anchor size or load capacity is certified by this drawing.'}
};
function rect(x,y,w,h,fill=C.inside,stroke=C.line,extra=''){return `<rect x="${N(x)}" y="${N(y)}" width="${N(w)}" height="${N(h)}" fill="${fill}" stroke="${stroke}" stroke-width="1.3" ${extra}/>`;}
function line(x1,y1,x2,y2,col=C.line,extra=''){return `<line x1="${N(x1)}" y1="${N(y1)}" x2="${N(x2)}" y2="${N(y2)}" stroke="${col}" stroke-width="1.3" ${extra}/>`;}
function text(x,y,t,size=17,col=C.ink,anchor='middle',extra=''){return `<text x="${N(x)}" y="${N(y)}" font-size="${size}" fill="${col}" text-anchor="${anchor}" ${extra}>${esc(t)}</text>`;}
function words(x,y,rows,size=16,col=C.ink,anchor='middle'){return rows.map((t,i)=>text(x,y+i*(size+7),t,size,col,anchor)).join('');}
function dim(x1,y1,x2,y2,t,ref=false){const col=ref?C.ref:C.dim;return line(x1,y1,x2,y2,col)+line(x1-5,y1-5,x1+5,y1+5,col)+line(x2-5,y2-5,x2+5,y2+5,col)+(x1===x2?`<text transform="translate(${N(x1-10)} ${N((y1+y2)/2)}) rotate(-90)" fill="${col}" font-size="17" text-anchor="middle" paint-order="stroke" stroke="white" stroke-width="4">${esc(t)}</text>`:text((x1+x2)/2,y1-10,t,17,col,'middle','paint-order="stroke" stroke="white" stroke-width="4"'));}
function part(id,body){return `<g data-part="${id}" tabindex="0" role="button" aria-label="${esc(P[id].title)}">${body}</g>`;}
function svg(body,w=1000,h=1040,name='Cabinet drawing'){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="group" aria-label="${esc(name)}">${body}</svg>`;}
const pull=(x,y,h=160)=>line(x,y,x,y+h,C.ink,'stroke-width="2.5"');
function wardrobeFrame(id){const d=D[id],s=.24,x=260,f=850,X=v=>x+v*s,Y=v=>f-v*s;let a=text(500,40,d.name.toUpperCase(),22)+text(500,71,state.view==='inside'?'INTERNAL ELEVATION · Fronts removed':'Sahara Stone 37P002 · doors, sides and curved return',16,C.ref);a+=rect(X(0),Y(2820),d.width*s,2720*s,state.view==='inside'?C.inside:C.front);a+=rect(X(0),Y(100),d.width*s,100*s,'#69736b')+rect(X(0),Y(2850),d.width*s,30*s,C.front);a+=dim(X(0),137,X(d.width),137,`${d.width} overall`)+dim(175,Y(0),175,Y(2850),'2850 ceiling · assumed',true);a+=dim(215,Y(100),215,Y(2260),id==='b3'?'2160 right doors':'2160 main doors');a+=dim(800,Y(2260),800,Y(2820),'560 loft');a+=text(500,997,'600 overall depth · R40 exposed-end target · All sizes mm',15,C.ref);return {a,s,x,f,X,Y};}
function hangDrawing(X,Y,l,r,h,drop=760){let b=line(X(l),Y(h),X(r),Y(h),C.ink,'stroke-width="3"');for(let i=0;i<4;i++){const z=l+110+i*(r-l-220)/3;const pts=[[z-45,h-90],[z-100,h-145],[z-72,h-210],[z-55,h-185],[z-55,h-drop],[z+55,h-drop],[z+55,h-185],[z+72,h-210],[z+100,h-145],[z+45,h-90]];b+=line(X(z),Y(h),X(z),Y(h-55),'#97a69a')+`<path d="M ${X(z)} ${Y(h-55)} L ${X(z-75)} ${Y(h-100)} L ${X(z+75)} ${Y(h-100)} Z" fill="none" stroke="#97a69a"/><polygon points="${pts.map(([xx,yy])=>X(xx)+','+Y(yy)).join(' ')}" fill="#d7e1d7" stroke="#97a69a" stroke-width="1"/>`;}return b;}
function wardrobe(id){const d=D[id],q=wardrobeFrame(id),{s,X,Y}=q;let a=q.a;const inside=state.view==='inside';
 a+=line(X(40),Y(100),X(40),Y(2820),C.ref)+text(X(-35),Y(1400),'R40',12,C.dim);
 if(!inside){for(let i=0;i<d.doors;i++){const w=d.width/d.doors,inset=i===0?d.endRadius:0,bottom=id==='b3'&&i<2?968:100;a+=part(id==='b2'?(i===0?'b2-shelves':'b2-hang'):(i<2?'b3-extra':'b3-hang'),rect(X(i*w+inset),Y(2260),(w-inset)*s,(2260-bottom)*s,C.front)+pull(X((i+1)*w-55),Y(1220),180*s));}a+=line(X(0),Y(2260),X(d.width),Y(2260));
 if(id==='b2'){for(let i=1;i<3;i++)a+=line(X(i*480),Y(2820),X(i*480),Y(2260));a+=part('b2-loft',rect(X(0),Y(2820),1440*s,560*s,'transparent'));}
 else{let upper='';for(let i=0;i<d.doors;i++){const w=d.width/d.doors,inset=i===0?d.endRadius:0;upper+=rect(X(i*w+inset),Y(2820),(w-inset)*s,560*s,C.front)+line(X(i*w+inset),Y(2820),X((i+1)*w),Y(2260),C.ref,'stroke-dasharray="4 4"');}a+=part('b3-loft',upper); }
 if(id==='b3'){let z=100;for(const h of d.drawers){a+=part('b3-drawers',rect(X(42),Y(z+h),870.5*s,(h-3)*s,C.front)+line(X(180),Y(z+h-28),X(734.5),Y(z+h-28),C.ink));z+=h;}}
 }else{
 const left=d.modules[0],iw=left-36;a+=line(X(left),Y(100),X(left),Y(2820))+line(X(0),Y(2260),X(d.width),Y(2260));
 if(id==='b2'){
 let aHang=rect(X(498),Y(2242),924*s,1874*s,'#f4f5ee')+hangDrawing(X,Y,518,1402,2050)+text(X(960),Y(2140),'UPPER RAIL 2050',13);
 aHang+=hangDrawing(X,Y,518,1402,1200)+text(X(960),Y(1280),'LOWER RAIL 1200 · REMOVABLE',11,C.dim);
 for(let h=500;h<2200;h+=150)for(const v of [515,1405])aHang+=`<circle cx="${X(v)}" cy="${Y(h)}" r="1.5" fill="${C.ref}"/>`;
 a+=part('b2-hang',aHang);
 a+=part('b2-drawer',rect(X(523),Y(350),874*s,250*s,C.drawer)+text(X(960),Y(225)+4,'ONE BROAD DRAWER',12));
 a+=rect(X(498),Y(368),924*s,18*s,'#becbbb')+dim(780,Y(100),780,Y(350),'250 drawer');
 let b=rect(X(18),Y(2242),444*s,2124*s,C.inside);[1336,1660,1980].forEach(h=>b+=rect(X(18),Y(h),444*s,18*s,'#d1d9cb'));
 b+=line(X(18),Y(700),X(462),Y(700),C.ref,'stroke-dasharray="6 5"');
 b+=text(X(240),Y(2130),'ACCESSORIES',11)+text(X(240),Y(1820),'FOLDED',12)+text(X(240),Y(1500),'BOXES',12);
 for(const z of [125,315]){const pts=[[z-55,180],[z+55,180],[z+35,940],[z+40,1100],[z-40,1100],[z-35,940]];b+=`<polygon points="${pts.map(([xx,yy])=>X(xx)+','+Y(yy)).join(' ')}" fill="#c7d6cc" stroke="${C.line}"/>`+rect(X(z-23),Y(1070),46*s,130*s,'#9fb9ae',C.line,'rx="4"');}
 b+=text(X(125),Y(1220),'FIN',11)+text(X(315),Y(1220),'FIN',11)+text(X(240),Y(460),'LOW SHELF REMOVED',9,C.ref);
 a+=part('b2-shelves',b)+part('b2-mirror',rect(X(65),Y(2150),350*s,1400*s,'none','#72958c','stroke-dasharray="6 5"'));
 a+=part('b2-loft',text(X(240),Y(2520),'SPARES',13)+text(X(960),Y(2520),'LUGGAGE',14));
 }else{
 a+=part('b3-hang',rect(X(left+18),Y(2242),878.5*s,2124*s,'#f4f5ee')+hangDrawing(X,Y,left+38,d.width-38,2050)+hangDrawing(X,Y,left+38,d.width-38,1050)+text(X(left+457.25),Y(1140),'LOWER RAIL 1050',13)+text(X(left+457.25),Y(2140),'UPPER RAIL 2050',13));
 let b=part('b3-extra',rect(X(18),Y(2242),878.5*s,1274*s,C.inside)+hangDrawing(X,Y,38,left-38,2050)+text(X(457.25),Y(2150),'HANGING ABOVE DRAWERS',11));
 let low=100;for(const [h,label]of [[350,'BED LINEN'],[280,'TOWELS'],[220,'UNDERWEAR / SOCKS']]){b+=part('b3-drawers',rect(X(43),Y(low+h),828.5*s,h*s,C.drawer)+text(X(457.25),Y(low+h/2)+5,label,13));if(h===220)b+=line(X(457.25),Y(low+25),X(457.25),Y(low+h-25));low+=h;}
 b+=rect(X(18),Y(968),878.5*s,18*s,'#becbbb');a+=b;
 a+=part('b3-loft',rect(X(65),Y(2600),700*s,280*s,'#dbe2d4')+text(X(415),Y(2450),'CASE · 700 × 280',13)+words(X(left+457.25),Y(2510),['TRAVEL BAGS','MISCELLANEOUS'],13));
 a+=dim(245,Y(100),245,Y(450),'350')+dim(245,Y(450),245,Y(730),'280')+dim(245,Y(730),245,Y(950),'220');
 }
 }
 if(id==='b2'){
 a+=dim(X(-360),930,X(0),930,'360 KEEP CLEAR');
 a+=words(870,570,['ENTRY-SIDE','CLEAR WALL','is LEFT in','this front view'],13,C.ref);
 [0,480,960].forEach(v=>a+=dim(X(v),890,X(v+480),890,'480 bay'));
 a+=words(500,962,['Facing cabinet: shelves LEFT · Hanging + ONE broad drawer RIGHT'],15,C.ref);
 }else{
 for(let i=0;i<4;i++)a+=dim(X(i*457.25),890,X((i+1)*457.25),890,'457 bay');
 a+=words(500,947,['Facing cabinet: 3 external drawers LEFT · Double hanging RIGHT','Hinged loft doors align above main doors; verify fan clearance'],15,C.ref);
 }
 return svg(a,1000,1040,d.name);}
function tv(){const d=D.tv,s=.34,x=165,f=810,X=v=>x+v*s,Y=v=>f-v*s,inside=state.view==='inside';let a=text(550,40,'TELEVISION CABINET / ELEVATION',22)+text(550,72,'Plain charcoal grey · matches kitchen lower cabinets',16,C.ref);
 const tw=1456.8,th=836.9,c=1100;a+=rect(X((d.width-tw)/2),Y(c+th/2),tw*s,th*s,'#f0f1ea','#aeb8ae','stroke-dasharray="7 5"')+words(X(d.width/2),Y(1100),['SAMSUNG THE FRAME PRO','65-inch context only · size not selected'],16,C.ref);
 a+=line(X(d.width/2),Y(c-th/2),X(d.width/2),Y(320),C.ref,'stroke-dasharray="5 5"')+words(930,Y(560),['TV POWER','Surface route','to confirm'],14,C.ref);
 a+=rect(X(0),Y(320),d.width*s,320*s,C.graphite)+rect(X(25),Y(60),(d.width-50)*s,60*s,'#303c35')+line(X(0),Y(302),X(d.width),Y(302),'#7f8980');
 const ids=['tv-left','tv-equipment','tv-media','tv-right'];for(let i=0;i<4;i++){let b=rect(X(i*533.5),Y(302),533.5*s,242*s,inside?'#e5eadd':C.graphite);if(inside){b+=words(X((i+.5)*533.5),Y(205),[['REMOTES'],['EQUIPMENT'],['CONTROLLERS'],['SPARE CABLES']][i],12);if(i===1)b+=rect(X(i*533.5+60),Y(160),350*s,55*s,'#89998b');}else if(i===1){for(let j=0;j<7;j++)b+=line(X(i*533.5+65),Y(100+j*23),X((i+1)*533.5-65),Y(100+j*23),'#758075');}else b+=line(X(i*533.5+110),Y(275),X((i+1)*533.5-110),Y(275),'#929e93');a+=part(ids[i],b);}
 a+=dim(X(0),870,X(d.width),870,'2134 overall')+dim(100,Y(0),100,Y(320),'320 overall');
 a+=dim(65,Y(0),65,Y(1100),'1100 TV centre · study',true);
 a+=words(550,940,['4 × 533.5 mm nominal fronts · 360 overall depth','Ventilated equipment front / rear access · Router stays in the open'],16,C.ref);
 return svg(a,1100,1010,d.name);}
function shoe(){const d=D.shoe,s=.26,x=220,f=850,X=v=>x+v*s,Y=v=>f-v*s,inside=state.view==='inside';let a=text(500,40,'SHOE CABINET / ELEVATION',22)+text(500,72,'Sahara Stone 37P002 · 610 wide · floated 120',16,C.ref);
 a+=rect(X(0),Y(2820),610*s,2700*s,inside?C.inside:C.shoe)+rect(X(0),Y(2850),610*s,30*s,C.shoe);
 if(inside){const shelves=[338,553,768,982,1160,1478,1778,2078,2408];for(const h of shelves)a+=rect(X(18),Y(h),574*s,18*s,'#c3cfbe');
 a+=part('shoe-daily',rect(X(18),Y(982),574*s,844*s,'transparent')+words(510,Y(650),['DAILY SHOES','4 adjustable rows'],13));
 for(const h of [240,450,665,875])for(const v of [80,350])a+=rect(X(v),Y(h),180*s,75*s,'#d3dfcf',C.line,'rx="8"');
 a+=part('shoe-upper',words(X(305),Y(2600),['BOXES / BAGS'],12)+text(X(305),Y(2250),'OCCASIONAL',12)+text(X(305),Y(1940),'SHOES',12)+text(X(305),Y(1650),'SHOES',12)+text(X(305),Y(1320),'TALLER SHOES',12));
 }else{
 for(const [lo,hi] of [[120,1000],[1160,2820]])a+=line(X(305),Y(lo),X(305),Y(hi));
 a+=line(X(0),Y(1000),X(610),Y(1000))+line(X(0),Y(1160),X(610),Y(1160));
 // Concealed edge grips at the drawer split; no external vertical door handles.
 }
 a+=part('shoe-keys',rect(X(0),Y(1160),610*s,160*s,inside?C.drawer:C.shoe)+line(X(100),Y(1120),X(510),Y(1120),C.line,'stroke-width="2"'));
 a+=words(510,Y(1100),['KEY DRAWER','1000–1160'],13,C.ink);
 a+=part('shoe-mount',line(X(-35),Y(0),X(660),Y(0))+dim(170,Y(120),170,Y(2820),'2700 cabinet BODY')+dim(125,Y(0),125,Y(120),'120 gap'));
 a+=dim(X(0),900,X(610),900,'610 overall');
 // An actual-depth side section, not a wider invented cabinet.
 const sx=660,XX=v=>sx+v*s;a+=text(710,110,'SIDE SECTION',17)+rect(XX(0),Y(2820),380*s,2700*s,'#edf0e6');
 a+=line(XX(360),Y(120),XX(360),Y(2820),C.ref,'stroke-dasharray="5 5"');
 [338,553,768,982,1160,1478,1778,2078,2408].forEach(h=>a+=line(XX(18),Y(h),XX(350),Y(h)));
 a+=dim(XX(0),900,XX(380),900,'380 depth')+words(710,Y(600),['≈340 usable','shoe depth'],14,C.ref);
 a+=words(500,963,['Four lower rows for daily shoes · Upper shelves adjustable','Key drawer is a NEW proposal · Fixings / entrance clearances to site check'],15,C.ref);
 return svg(a,1000,1040,d.name);}
function section(id){if(id==='tv')return tvSection();if(id==='shoe')return shoeSection();return wardrobeAccess(id);}
function wardrobeAccess(id){
 const b2=id==='b2',w=2865,h=b2?2517:2450,s=.21,ox=185,oy=150,X=v=>ox+v*s,Y=v=>oy+v*s;
 let a=text(500,38,b2?'BEDROOM 2 / DRAWER ACCESS':'BEDROOM 3 / DRAWER ACCESS',22)+text(500,70,'NORTH-UP ROOM PLAN · Dimensions from drawing / current furniture model',14,C.ref);
 a+=rect(X(0),Y(0),w*s,h*s,'#fafbf5',C.ink)+dim(X(0),112,X(w),112,'2865 room width');
 const rr=(x,y,ww,hh,fill,stroke=C.line,extra='')=>rect(X(x),Y(y),ww*s,hh*s,fill,stroke,extra);
 const arc=(hx,hy,sign,L)=>`<path d="M ${X(hx+sign*L)} ${Y(hy)} A ${L*s} ${L*s} 0 0 ${sign>0?0:1} ${X(hx)} ${Y(hy-L)}" fill="none" stroke="${C.ref}" stroke-dasharray="5 5"/>`;
 if(b2){
  const front=1917;
  a+=rr(0,front,1440,600,C.inside)+rr(0,front,960,600,C.drawer)+line(X(960),Y(front),X(960),Y(h),C.ink);
  a+=words(X(480),Y(2150),['HANGING +','WIDE DRAWER'],12)+words(X(1200),Y(2150),['SHELVES /','FINS'],12);
  for(const [hx,sign]of [[0,1],[960,-1],[1440,-1]])a+=line(X(hx),Y(front),X(hx),Y(front-480),C.ref)+arc(hx,front,sign,480);
  a+=part('b2-drawer',rr(43,front-450,874,450,'#e5c6a970',C.dim,'stroke-dasharray="6 4"'));
  a+=rr(100,110,1400,600,'#e6e8df')+text(X(800),Y(380),'1400 × 600 DESK',14)+text(X(800),Y(530),'FACES WINDOW',12,C.ref);
  a+=`<circle cx="${X(800)}" cy="${Y(930)}" r="${300*s}" fill="none" stroke="${C.ref}" stroke-dasharray="6 5"/>`+text(X(800),Y(1130),'WORKING',10,C.ref);
  a+=`<circle cx="${X(800)}" cy="${Y(530)}" r="${300*s}" fill="#ccd8d350" stroke="${C.ref}"/>`+rr(560,290,480,480,'#cbd5d1',C.ref,'rx="12"')+rr(565,725,470,70,'#b8c6c0')+text(X(800),Y(530),'TUCKED',11);
  a+=line(X(800),Y(930),X(800),Y(830),C.dim,'stroke-width="2"')+text(X(1200),Y(990),'TUCK 400',11,C.dim);
  a+=rr(1507,1295,326,310,'#dae1d5',C.ref,'rx="25"')+text(X(1670),Y(1470),'FAN',11);
  a+=line(X(415),Y(0),X(2615),Y(0),'#739baa','stroke-width="5"')+text(X(1500),Y(-60),'NORTHWEST WINDOW',13,C.ref);
  a+=line(X(1800),Y(h),X(2600),Y(h),'white','stroke-width="6"')+line(X(2600),Y(h),X(2600),Y(h-800),C.ref)+text(X(2200),Y(h-150),'ENTRY',13);
  a+=dim(X(1440),Y(h+190),X(1800),Y(h+190),'360 clear')+dim(120,Y(710),120,Y(1467),'≈757 to desk',true);
  a+=words(500,780,['Facing cabinet: shelves LEFT; hanging + ONE wide drawer RIGHT.','Dashed chair = working position; tuck about 400 mm toward the desk for access.','450 drawer travel: ≈757 to desk, ≈637 to the illustrated tucked Ø600 chair base.'],16);
  a+=text(X(1450),Y(1930),'R40',11,C.dim);
  a+=`<path d="M ${X(1400)} ${Y(front)} L ${X(1440)} ${Y(front)} L ${X(1440)} ${Y(front+40)} A ${40*s} ${40*s} 0 0 0 ${X(1400)} ${Y(front)} Z" fill="#fafbf5" stroke="none"/><path d="M ${X(1440)} ${Y(front+40)} A ${40*s} ${40*s} 0 0 0 ${X(1400)} ${Y(front)}" fill="none" stroke="${C.line}"/>`;
  a+=words(500,890,['Shelf column contains NO small drawer. Fin compartment stays undivided; lower shelves are removable.','Floor fan shown pulled clear of the nominal door swings; final position adjustable.','All door sweeps are nominal. Room-door handing and final hardware remain to site check.'],14,C.ref);
 }else{
  const left=1036;
  a+=rr(left,0,1829,600,C.inside)+rr(left,0,914.5,600,C.drawer)+text(X(left+457.25),Y(280),'DRAWERS',13)+text(X(left+1371.75),Y(280),'HANGING',13);
  for(let i=0;i<4;i++){const leaf=457.25,hx=left+(i+(i%2))*leaf,sgn=i%2?-1:1;a+=line(X(hx),Y(600),X(hx),Y(600+leaf),C.ref)+`<path d="M ${X(hx+sgn*leaf)} ${Y(600)} A ${leaf*s} ${leaf*s} 0 0 ${sgn>0?1:0} ${X(hx)} ${Y(600+leaf)}" fill="none" stroke="${C.ref}" stroke-dasharray="5 5"/>`;}
  a+=part('b3-drawers',rr(left+43,600,828.5,450,'#e5c6a970',C.dim,'stroke-dasharray="6 4"'));
  a+=rr(915,1425,1920,950,'#e6e8df')+rr(2705,1425,120,950,'#c1cac0')+text(X(1830),Y(1910),'1920 × 950 GUEST BED',14)+text(X(2620),Y(2080),'HEAD',12)+text(X(1120),Y(2080),'FOOT',12);
  a+=line(X(0),Y(0),X(900),Y(0),'white','stroke-width="6"')+line(X(0),Y(0),X(0),Y(900),C.ref)+text(X(450),Y(210),'ENTRY',13);
  a+=line(X(1730),Y(h),X(2830),Y(h),'#739baa','stroke-width="5"')+text(X(2230),Y(h+120),'WINDOW',13,C.ref);
  a+=dim(820,Y(600),820,Y(1425),'≈825 closed',true)+dim(700,Y(1050),700,Y(1425),'≈375 open',true)+dim(X(0),Y(2190),X(915),Y(2190),'≈915 foot-side aisle',true);
  a+=words(500,780,['Facing cabinet: three drawers LEFT, beside the entry / bed-foot approach.','Both bays have the SAME ≈825 cabinet-to-bed gap.','450 drawer travel leaves only ≈375 in front: not a comfortable standing allowance.'],16);
  a+=text(X(left-65),Y(630),'R40',11,C.dim);
  a+=`<path d="M ${X(left)} ${Y(560)} L ${X(left)} ${Y(600)} L ${X(left+40)} ${Y(600)} A ${40*s} ${40*s} 0 0 1 ${X(left)} ${Y(560)} Z" fill="#fafbf5" stroke="none"/><path d="M ${X(left+40)} ${Y(600)} A ${40*s} ${40*s} 0 0 1 ${X(left)} ${Y(560)}" fill="none" stroke="${C.line}"/>`;
  a+=words(500,890,['Reach from the foot-side aisle; verify standing and door operation with the real bed.','If the guest bed stays permanently, trial shorter runners or move the bed before fabrication.','Left-side placement improves the approach; it does not solve the narrow frontal gap.'],14,C.ref);
 }
 a+=text(500,1010,'All sizes mm · Position study, not surveyed fabrication / drilling coordinates',15,C.ref);
 return svg(a,1000,1060,b2?'Bedroom 2 furniture and drawer access':'Bedroom 3 furniture and drawer access');
}
function tvSection(){let a=text(500,40,'TELEVISION CABINET / TOP + SECTION',22);const s=.35,x=110,y=155,X=v=>x+v*s,Y=v=>y+v*s;
 a+=rect(X(0),Y(0),2134*s,360*s,C.inside);for(let i=1;i<4;i++)a+=line(X(i*533.5),Y(0),X(i*533.5),Y(360));
 a+=part('tv-equipment',rect(X(533.5),Y(0),533.5*s,50*s,'#c8d7c5')+words(X(800),Y(220),['EQUIPMENT'],12));
 a+=rect(X(25),Y(360),480*s,300*s,'none',C.dim,'stroke-dasharray="6 5"')+text(X(265),Y(550),'DRAWER',12,C.dim);
 a+=dim(X(0),115,X(2134),115,'2134')+dim(920,Y(0),920,Y(360),'360 depth')+words(500,475,['50 mm rear service zone in equipment bay only','Other bays: 300 mm drawer-runner target; verify actual hardware'],16,C.ref);
 a+=text(500,560,'EQUIPMENT SECTION',18);const xx=250,ff=900,k=.75,V=v=>ff-v*k;
 a+=rect(xx,V(320),360*k,320*k,C.graphite)+rect(xx+18*k,V(302),292*k,224*k,'#e5ebdc');
 a+=rect(xx+310*k,V(302),50*k,224*k,'#b8cdb5')+dim(xx,V(-60),xx+360*k,V(-60),'360 depth')+dim(185,V(0),185,V(320),'320 total');
 a+=words(740,690,['VENTILATED REMOVABLE FRONT','ACCESSIBLE REAR SERVICE ZONE','Keep actual power plugs clear','Test wireless link before closing'],16);
 a+=text(500,1020,'No wall chasing or invisible-power promise is made by this cabinet drawing.',15,C.ref);return svg(a,1050,1080,'Television cabinet top and section');}
function shoeSection(){let a=text(500,40,'SHOE CABINET / TOP + MOUNTING',22);const s=.65,x=160,y=160,X=v=>x+v*s,Y=v=>y+v*s;
 a+=rect(X(0),Y(0),610*s,380*s,C.inside)+line(X(305),Y(0),X(305),Y(380),C.ref);
 for(const [hx,sgn]of [[0,1],[610,-1]]){a+=line(X(hx),Y(380),X(hx),Y(685));a+=`<path d="M ${X(hx+sgn*305)} ${Y(380)} A ${305*s} ${305*s} 0 0 ${sgn===1?1:0} ${X(hx)} ${Y(685)}" fill="none" stroke="${C.ref}" stroke-dasharray="5 5"/>`;}
 a+=dim(X(0),115,X(610),115,'610')+dim(640,Y(0),640,Y(380),'380 depth')+words(800,305,['KEEP ENTRANCE','AND GRILLE','SWINGS CLEAR'],16,C.ref);
 a+=words(500,700,['Nominal door leaf ≈305 mm; final handing and reveals to shop drawing','300 mm key-drawer runner target: test against the real entrance path'],16,C.ref);
 a+=rect(240,810,500,60,'#cbd5c3')+words(500,840,['WALL / LOAD-BEARING FIXING ZONE'],15)+words(500,935,['Hidden rails / anchors: contractor to design for the actual wall and loaded cabinet.','Ventilate the cabinet itself; no new opening through the building wall is assumed.'],15,C.ref);
 return svg(a,1000,1040,'Shoe cabinet top and mounting coordination');}
function draw(id){return state.view==='section'?section(id):(id==='tv'?tv():id==='shoe'?shoe():wardrobe(id));}
function choosePart(id){if(!P[id])return;state.part=id;const p=P[id];$('#zone-detail').innerHTML=`<p class="eyebrow">STORAGE DETAIL</p><h3>${esc(p.title)}</h3><p class="size">${esc(p.size)}</p><p>${esc(p.use)}</p><p>${esc(p.detail)}</p><p class="flag">${esc(p.hold)}</p>`;document.querySelectorAll('[data-select-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.selectPart===id)));}
function syncUrl(){const u=new URL(location.href);u.searchParams.set('cabinet',state.cabinet);u.searchParams.set('drawing',state.view);history.replaceState(null,'',u.pathname+u.search+'#drawings');}
function render(){const all=state.cabinet==='all';$('#overview').hidden=!all;$('#detail-sheet').hidden=all;$('#cabinet-summary').hidden=all;$('#print').textContent=all?'Print four drawings':'Print this drawing';document.querySelectorAll('[data-cabinet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cabinet===state.cabinet)));document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
 if(all){$('#overview').innerHTML=Object.entries(D).map(([id,d])=>`<article class="card"><p class="eyebrow">${d.code}</p><h2>${esc(d.name)}</h2><p class="size">${d.width} W × ${d.depth} D × ${d.height} H mm${id==='shoe'?' body':''}</p><div class="card-svg">${draw(id)}</div><p class="card-note">${esc(d.note)}</p><button data-open="${id}">Open full drawing</button></article>`).join('');document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.open)));}
 else{const d=D[state.cabinet];$('#sheet-number').textContent=d.code+' · DESIGN STUDY / NOT FOR FABRICATION';$('#sheet-title').textContent=d.name;$('#drawing').innerHTML=draw(state.cabinet);$('#storage-list').innerHTML=d.parts.map(id=>`<button data-select-part="${id}" aria-pressed="false"><b>${esc(P[id].title)}</b><span>${esc(P[id].use)}</span></button>`).join('');$('#coordination').innerHTML=`<b>Set-out and quote check</b><p>${esc(d.check)}</p>`;document.querySelectorAll('[data-select-part]').forEach(b=>b.addEventListener('click',()=>choosePart(b.dataset.selectPart)));choosePart(d.parts.includes(state.part)?state.part:d.parts[0]);}
 document.querySelectorAll('[data-part]').forEach(g=>{const go=()=>{if(state.cabinet==='all'){const cab=g.closest('.card').querySelector('[data-open]').dataset.open;state.cabinet=cab;state.part=g.dataset.part;render();syncUrl();}else choosePart(g.dataset.part);};g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});
 window.otherCabinetStudy={state:{...state},cabinetRevision:CABINET_REVISION,sourceRevision:DESIGN_REVISION,cabinets:D,checks:{b2DrawerRunnerZone:874,b2DrawerCount:1,b2FinClearHeight:1200,b2TuckedChairGap:637,b2DrawerDeskGap:757,b3OpenDrawerBedGap:375,b2Modules:D.b2.modules.reduce((a,b)=>a+b,0),b3Modules:D.b3.modules.reduce((a,b)=>a+b,0),b3DrawerSum:D.b3.drawers.reduce((a,b)=>a+b,0),b3DrawerTop:100+D.b3.drawers.reduce((a,b)=>a+b,0),b3DrawerRunnerZone:914.5-36-50,shoeTop:D.shoe.bottom+D.shoe.height,shoeUpperRows:[[1178,1478],[1496,1778],[1796,2078],[2096,2408],[2426,2802]],tvInnerHeight:320-60-18-18,tvEquipmentDepth:360-18-50}};
}
function pick(id){state.cabinet=id;state.part=null;zoom(false);render();syncUrl();(id==='all'?$('#overview'):$('#detail-sheet')).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function zoom(value){$('#drawing-scroll').classList.toggle('enlarged',value);$('#fit').setAttribute('aria-pressed',String(!value));$('#enlarge').setAttribute('aria-pressed',String(value));}
const url=new URL(location.href);if(['all',...Object.keys(D)].includes(url.searchParams.get('cabinet')))state.cabinet=url.searchParams.get('cabinet');if(['front','inside','section'].includes(url.searchParams.get('drawing')))state.view=url.searchParams.get('drawing');
$('#cabinet-tabs').id='drawings';document.querySelectorAll('[data-cabinet]').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.cabinet)));document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;render();syncUrl();}));$('#fit').addEventListener('click',()=>zoom(false));$('#enlarge').addEventListener('click',()=>zoom(true));$('#print').addEventListener('click',()=>window.print());render();
