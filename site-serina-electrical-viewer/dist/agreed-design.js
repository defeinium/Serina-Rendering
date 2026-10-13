// Latest accepted scope, 12 October 2026. Sizes are quote/visual targets,
// never surveyed drilling or fabrication dimensions. Shared by the viewer
// and contractor brief; the approved source-based 2D drawing remains intact.
export const DESIGN_REVISION = '2026-10-13-r10';
// Four developer fan-coil feeds around the hall. Indoor units face INTO their
// own rooms. Bodies are illustrative envelopes, not selected product sizes.
// Feed pixels identify the electrical symbols; bodies sit above the openings.
export const AIR_CONDITIONERS = [
 {id:'L-AC',room:'客厅',name:'Living air conditioner',sourcePixel:[663,700],wallCentre:[3.245,5.7765],rotation:-Math.PI/2,width:1.04,height:.30,depth:.24},
 {id:'B2-AC',room:'B2',name:'Bedroom 2 air conditioner',sourcePixel:[890,603],wallCentre:[5.625,6.353],rotation:Math.PI,width:.82,height:.29,depth:.22},
 {id:'B3-AC',room:'B3',name:'Bedroom 3 air conditioner',sourcePixel:[920,730],wallCentre:[5.405,5.20],rotation:0,width:.82,height:.29,depth:.22},
 {id:'M-AC',room:'主人房',name:'Master air conditioner',sourcePixel:[988,637],wallCentre:[6.29,5.80],rotation:Math.PI/2,width:.90,height:.30,depth:.24}
].map(a=>({...a,centreHeight:2.525,status:'Original doorway-side provision; body size and site offsets to confirm'}));
export const HALL_CEILING = {bottom:2.72,slab:2.85,outline:[[3.245,5.20],[6.29,5.20],[6.29,6.353],[3.245,6.353]],status:'Existing lowered hallway plaster confirmed in inspection photos; 2720 mm is an unmeasured model height'};
export const SOURCE_REGISTER = [
 ['F-L1','玄关',396,1144,'light','Entry original light point'],
 ['L-L1','客厅',491,365,'light','Living track supply'],
 ['L-FAN','客厅',491,468,'fan','Living original fan hook'],
 ['L-L2','客厅',491,570,'light','Living ceiling-light point'],
 ['D-L1','餐厅',491,865,'light','Dining original light point'],
 ['K-L2','厨房',625,1144,'light','Kitchen track supply'],
 ['Y-L1','Yard',812,1144,'light','Yard existing light point'],
 ['H-L1','走道',817,666,'light','Hall original lighting supply'],
 ['M-L1','主人房',1156,365,'light','Master unused window-side light point'],
 ['M-FAN','主人房',1156,468,'fan','Master unused fan point'],
 ['M-L2','主人房',1156,570,'light','Master dimmable ceiling-light point'],
 ['M-L3','主人房',1155,666,'light','Master unused entrance light point'],
 ['B2-L1','B2',827,362,'light','Bedroom 2 window-side light point'],
 ['B2-F','B2',827,468,'fan','Bedroom 2 original fan hook'],
 ['B2-L2','B2',827,560,'light','Bedroom 2 door-side light point'],
 ['B3-L1','B3',878,895,'light','Bedroom 3 ceiling-light point 1'],
 ['B3-F','B3',985,895,'fan','Bedroom 3 original fan point'],
 ['B3-L2','B3',1091,895,'light','Bedroom 3 ceiling-light point 2'],
 ['B1-L','Bath 1',1237,866,'light','Bathroom 1 original lighting supply'],
 ['B2B-L','Bath 2',742,866,'light','Bathroom 2 original lighting supply']
];
export const registeredSource = (ex,ey) => [143+(ex-317)*757/1008,218+(ey-311)*724/974];
// Original-plan bounds map onto the existing model's room faces. Raster
// registration and 3D geometry are approximate; source pixel centres are retained.
const bounds = {
 '客厅':[160,233,397,521,.17,5.20,3.165,8.96],
 '餐厅':[160,521,397,737,.17,2.60,3.165,5.20],
 '主人房':[653,233,888,517,6.37,5.28,9.49,8.96],
 'B2':[416,233,627,435,3.335,6.433,6.20,8.96],
 'B3':[534,535,755,725,4.865,2.69,7.73,5.14],
 'Bath 1':[771,535,888,725,7.91,2.69,9.48,5.14],
 'Bath 2':[413,535,517,725,3.335,2.69,4.685,5.14],
 'Yard':[473,741,559,931,4.22,.16,5.29,2.51],
 '走道':[397,445,650,520,3.325,5.28,6.21,6.273]
};
export function planToModel(x,y,room){
 if(room==='厨房'||room==='玄关')return [.09+(x-159)*3.155/238,.08+(931-y)*2.52/191];
 const [l,t,r,b,x1,y1,x2,y2]=bounds[room];
 return [x1+(x-l)/(r-l)*(x2-x1),y2-(y-t)/(b-t)*(y2-y1)];
}
export const sourceModel = id => {
 const row=SOURCE_REGISTER.find(p=>p[0]===id);
 return planToModel(...registeredSource(row[2],row[3]),row[1]);
};
const mmPerPixel=3060/(397-159),benchFront=397-430/mmPerPixel,tableEast=benchFront-75/mmPerPixel;
export const DINING = {
 centre:planToModel(tableEast-400/mmPerPixel,registeredSource(491,865)[1],'餐厅'),
 table:[1.60,.80],bench:[1.55,.43],benchGap:0,pendantMove:'Horizontal only',
 benchX:3.165-.43/2
};
const b2Front=435-600/2517*(435-233);
const b2Window=sourceModel('B2-L1'),b2FanY=(7.10+8.96)/2;
export const FANS = [
 {id:'L-FAN',room:'客厅',label:'Living ceiling fan',diameter:1.2192,centre:sourceModel('L-FAN'),status:'48-inch target · exact model pending'},
 {id:'B2-F-NEW',room:'B2',label:'Bedroom 2 ceiling fan',diameter:.8382,centre:[sourceModel('B2-F')[0],b2FanY],status:'33-inch target · new hook and clearances pending'},
 {id:'B3-F',room:'B3',label:'Bedroom 3 ceiling fan',diameter:.8382,centre:sourceModel('B3-F'),status:'33-inch target · fixing and clearances pending'}
];
const pointFixture=(id,room,name,kind,extra={})=>({id,room,name,kind,centre:sourceModel(id),installed:true,status:'Position at original supply',...extra});
const lf=registeredSource(491,365),kl=registeredSource(625,1144),hy=registeredSource(817,666)[1];
export const FIXTURES = [
 pointFixture('F-L1','玄关','Entry ceiling light','ceiling',{diameter:.34}),
 pointFixture('L-L1','客厅','Living L-track','track',{route:[[203,lf[1]],[374,lf[1]],[374,371]].map(p=>planToModel(...p,'客厅')),heads:[[215,lf[1]],[337,lf[1]],[374,291],[374,350]].map(p=>planToModel(...p,'客厅')),status:'Rail through original supply · lengths and heads to confirm',size:'Rail targets approximately 2200 + 1450 mm'}),
 pointFixture('L-L2','客厅','Living ceiling light','ceiling',{diameter:.47}),
 pointFixture('D-L1','餐厅','Dining pendant','pendant',{centre:DINING.centre,diameter:.46,status:'Horizontal offset to table centre · adaptor/model pending',size:'Illustrative Ø 460 mm; final fixture not selected'}),
 pointFixture('K-L2','厨房','Kitchen track','track',{route:[[kl[0]-62,kl[1]],[kl[0]+62,kl[1]]].map(p=>planToModel(...p,'厨房')),heads:[[kl[0]-47,kl[1]],[kl[0]+6,kl[1]],[kl[0]+47,kl[1]]].map(p=>planToModel(...p,'厨房')),aims:[[2.425,.63,.90],[2.481,2.23,.925],[3.60,.63,.90]],size:'Approximately 1600 mm target · 3 heads',status:'Rail at original supply; 2 heads toward cabinets, 1 toward prep/island top'}),
 ...[['H1',465],['H2',586]].map(([id,x])=>({id,room:'走道',name:'Hall light '+id.slice(1),kind:'recessed',centre:planToModel(x,hy,'走道'),diameter:.12,installed:true,status:'Two aligned centres in existing plaster · set-out pending',feed:'H-L1'})),
 pointFixture('M-L2','主人房','Master dimmable ceiling light','ceiling',{diameter:.47}),
 {id:'B2-TRACK',room:'B2',name:'Bedroom 2 diffuse track',kind:'track',centre:b2Window,route:[[b2Window[0]-.80,b2Window[1]],[b2Window[0]+.80,b2Window[1]]],heads:[[b2Window[0]-.65,b2Window[1]],[b2Window[0]+.65,b2Window[1]]],installed:true,white:true,feed:'B2-L1',status:'Proposed 1600 mm transverse rail through original window-side point; on-site circuit and clearance verification required',size:'1600 mm track target; 2 broad-diffuse modules, size pending'},
 pointFixture('B3-L1','B3','Bedroom 3 ceiling light 1','ceiling',{diameter:.30}),
 pointFixture('B3-L2','B3','Bedroom 3 ceiling light 2','ceiling',{diameter:.30}),
 ...[['Bath 1','B1',835,838],['Bath 2','B2B',463,463]].flatMap(([room,prefix,sx,mx])=>[
  {id:prefix+'-DL',room,name:room+' shower downlight',kind:'recessed',centre:planToModel(sx,690,room),diameter:.12,installed:true,status:'Existing plaster · new hole · final cut-out pending',feed:prefix+'-L'},
  {id:prefix+'-SP',room,name:room+' mirror spotlight',kind:'mirrorSpot',centre:planToModel(mx,570,room),aim:planToModel(prefix==='B1'?873:433,568,room),diameter:.09,installed:true,status:'Offset mirror task light · aim and cut-out pending',feed:prefix+'-L'}
 ]),
 {id:'K-LED',room:'厨房',name:'Sink task strip',kind:'strip',centre:[3.60,.54],installed:false,status:'Separate quoted cabinet LED · driver and length pending',size:'Under the sink-side upper cabinet'},
 {id:'L-FLOOR',room:'客厅',name:'Sofa-side floor lamp',kind:'floorLamp',centre:[.44,5.75],installed:false,status:'Plug-in furniture light · model pending',size:'Substantial shaded floor lamp'},
 {id:'Y-L1',room:'Yard',name:'Yard retained light',kind:'ceiling',centre:sourceModel('Y-L1'),diameter:.26,installed:false,status:'Existing fitting retained · replacement not in installation count'}
];
export const AGREED_SCOPE = {
 revision:DESIGN_REVISION,lightingAssemblies:15,fans:3,
 ceiling:'Original room slabs retained. Existing lowered hall plaster with closed entrance fascia; bathroom plaster retained. Heights require site measurement.',
 wallPaint:'Jotun 1928 Summer Snow · physical sample pending',
 bedroomFloor:'Retain actual warm pale oak bedroom floors; inspection-photo colour approximation.',
 ceilingPaint:'Matt white · repaint scope to confirm',
 windowTreatments:'Living: full-height double fabric curtain, white sheer + grey-greige drape, exposed rail. Bedroom 2: Roman blind retained. Master: full-wall double curtain; no curtain boxes.',
 kitchen:'Grey woodgrain fridge; light non-yellow warm-grey prep and uppers; deep-grey lowers.',
 excluded:['New flat ceilings','Curtain boxes','Window / sofa cove strips','Wardrobe lighting','Yard exhaust fan','Hood coring / external ducting'],
 cabinetry:[
  ['Kitchen package','2134 mm quoted','Full-height upper / lower; drawer set; sintered top; 600 mm sink and tap. Architectural run 2065 mm: site reconciliation required.'],
  ['Fridge enclosure','762 mm quoted','Grey woodgrain to original ceiling; exact appliance clearances pending.'],
  ['Prep cabinet','1372 × 762 mm quoted','Light warm grey; open above; separate sintered top.'],
  ['Bedroom 2 wardrobe','1829 mm quoted','Full height; three main doors + small door-side niche, unlit mirror and curved detailing.'],
  ['Bedroom 3 wardrobe','1829 mm quoted','Full height; four main doors; no niche; rounded exposed corner. Hanging + three useful drawers + loft internal layout to sign off.'],
  ['TV cabinet','2134 mm quoted','Low floor-standing graphite cabinet; Samsung The Frame Pro, size pending.'],
  ['Shoe cabinet','610 mm quoted','Outside the main door in foyer recess; suspended/full-height detail to confirm.']
 ],
 yard:'Laundry at existing Bath 2-side water/drain; litter trays at dry end. PD door opens outward into Yard; retained partly open, no cat hole. Not a bifold door. No exhaust fan.',
 appliances:'Recirculating hood: FOTILE or VATTI only. Induction hob independent; no model purchased or finalised.',
 pending:['Exact fan models and manufacturer clearances','Bedroom 2 relocated structural hook, original window-side track supply and on-site clearances','Dining pendant/adaptor and measured horizontal offset','Fixture sizes, heads, wattage and bathroom cut-outs','Cabinet shop drawings and board/stone samples','Final window-treatment purchase','All as-built dimensions']
};
export const fixtureMeta = c => {
 const f=FIXTURES.find(f=>f.id===c.id);if(!f)return null;
 return {x:f.centre[0],y:f.centre[1],size:f.size||`Illustrative Ø ${Math.round(f.diameter*1000)} mm; final size pending`,mount:f.status,feed:f.feed||f.id};
};
