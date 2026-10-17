// Plan-model coordinates in metres. These are deliberately labelled as estimates:
// the developer's symbolic electrical plan does not give horizontal set-out.
// Corners run clockwise in the viewer's XY plan system, starting at SW.
export const ROOM_SURVEY = {
  '玄关': {label:'Entry', corners:[[.09,1.00],[1.795,1.00],[1.795,2.60],[.09,2.60]], notes:'The inner main door is beside the shoe cabinet at the south edge. The separate outer threshold is the grill.'},
  '客厅': {label:'Living room', corners:[[.09,5.20],[3.245,5.20],[3.245,9.05],[.09,9.05]], notes:'North wall includes the three-bay window; confirm sofa and TV wall faces on site.'},
  '餐厅': {label:'Dining', corners:[[.09,2.60],[3.245,2.60],[3.245,5.20],[.09,5.20]], notes:'Dining is an open zone, so its north/south edges are planning boundaries, not full-height walls.'},
  '厨房': {label:'Kitchen', corners:[[1.795,.08],[4.04,.08],[4.04,2.60],[1.795,2.60]], notes:'East side: existing operable louvre retained. Verify frame and finished cabinet-to-wall clearances.'},
  'Yard': {label:'Yard', corners:[[4.04,.08],[5.37,.08],[5.37,2.60],[4.04,2.60]], notes:'East side includes the AC-ledge window/door; Bath 2 service end holds tap and trap.'},
  '走道': {label:'Hall', corners:[[3.245,5.20],[6.29,5.20],[6.29,6.353],[3.245,6.353]], notes:'Open connections and bedroom/bath doors interrupt these planning edges.'},
  '主人房': {label:'Master bedroom', corners:[[6.29,5.20],[9.57,5.20],[9.57,9.05],[6.29,9.05]], notes:'Full-wall double curtain on exposed ceiling rail; no curtain box. Measure jambs and recess.'},
  'B2': {label:'Bedroom 2', corners:[[3.245,6.353],[6.29,6.353],[6.29,9.05],[3.245,9.05]], notes:'North three-bay window. Wardrobe remains on the south wall; no east-wall electrical point assumed.'},
  'B3': {label:'Bedroom 3', corners:[[4.775,2.60],[7.82,2.60],[7.82,5.20],[4.775,5.20]], notes:'South wall includes two-bay window; Full four-door wardrobe, no niche; rounded exposed corner.'},
  'Bath 1': {label:'Bath 1', corners:[[7.82,2.60],[9.57,2.60],[9.57,5.20],[7.82,5.20]], notes:'Existing plaster ceiling; wall lengths and both light centres are estimates. Measure tiled finished faces, wet zones and ceiling void.'},
  'Bath 2': {label:'Bath 2', corners:[[3.245,2.60],[4.775,2.60],[4.775,5.20],[3.245,5.20]], notes:'Existing plaster ceiling; wall lengths and both light centres are estimates. Measure tiled finished faces, wet zones and ceiling void.'},
  'AC Ledge': {label:'AC ledge', corners:[[5.37,.08],[7.82,.08],[7.82,2.60],[5.37,2.60]], notes:'External/service area; model envelope only, access and equipment clearances require site survey.'}
};

// Openings and changes of wall type along the room outlines. These dimensions
// follow the current model shell, not a tape-measured finished wall survey.
export const ROOM_FEATURES = {
  '玄关':['South / main door ≈ 920 mm; short solid returns ≈ 60 / 725 mm','North opens to dining; east opens toward kitchen'],
  '客厅':['North / solid ≈ 480 mm + three-bay window ≈ 2250 mm + solid ≈ 425 mm','South is open to dining; east has a partial partition near Bedroom 2'],
  '餐厅':['East / Bath 2-side solid wall ≈ 2600 mm','North and south are open-zone boundaries, not continuous walls'],
  '厨房':['East / solid ≈ 240 mm + retained louvre window ≈ 600 mm + solid ≈ 180 mm + Yard door ≈ 700 mm + solid ≈ 800 mm','North opens to prep/dining; verify countertop and cabinet fronts'],
  'Yard':['West / kitchen opening: retained louvre window ≈ 600 mm and door ≈ 700 mm, separated by ≈ 180 mm wall','East / AC-ledge glazing ≈ 790 mm + door ≈ 790 mm; check frame and jamb widths'],
  '走道':['North / Bedroom 2 wall ≈ 1980 mm + door ≈ 800 mm + short return ≈ 265 mm','South / bathroom and Bedroom 3 doors interrupt wall; measure each jamb'],
  '主人房':['North / solid ≈ 535 mm + three-bay window ≈ 2300 mm + solid ≈ 445 mm','South / solid ≈ 1730 mm + Bath 1 door ≈ 800 mm + solid ≈ 750 mm','West / entry door ≈ 900 mm within the partition'],
  'B2':['North / solid ≈ 505 mm + three-bay window ≈ 2200 mm + solid ≈ 340 mm','South / solid ≈ 1980 mm + entry door ≈ 800 mm + solid ≈ 265 mm'],
  'B3':['South / solid ≈ 1830 mm + two-bay window ≈ 1100 mm + solid ≈ 115 mm','North / short return ≈ 180 mm + entry door ≈ 900 mm + solid ≈ 1965 mm'],
  'Bath 1':['North / entry door ≈ 800 mm; measure solid returns and wet finishes'],
  'Bath 2':['South / solid ≈ 905 mm + high opening ≈ 550 mm + solid ≈ 75 mm','North / solid ≈ 780 mm + entry door ≈ 750 mm'],
  'AC Ledge':['West / glazed window and access door to Yard','Outer edge is a grill; do not treat its length as an indoor finished wall']
};

// These entries must not acquire invented 3D marker coordinates. The source
// drawing or owner recollection establishes the group, not its exact offset.
export const UNLOCATED_POINTS = [
  {room:'玄关',id:'F-S1',name:'Entry single 13A socket',kind:'Socket',source:'Developer plan',height:'300 mm AFFL (legend)',note:'Exact faceplate centre at the inner entry/shoe cabinet wall is unmeasured; old outer-grill marker was removed.'},
  {room:'玄关',id:'F-DB',name:'Distribution board',kind:'Service',source:'Developer plan',height:'Site measure',note:'Record DB dimensions, door clearance and circuit labels.'},
  {room:'玄关',id:'F-DBELL',name:'Doorbell point',kind:'Low-voltage',source:'Developer legend',height:'2250 mm AFFL (legend)',note:'Horizontal offset from entry jamb unmeasured.'},
  {room:'玄关',id:'F-SW',name:'Public-area lighting switch groups',kind:'Switch',source:'Developer plan',height:'1200 mm AFFL (legend)',note:'Two 2-gang groups near foyer/kitchen junction; trace controlled circuits.'},
  {room:'B2',id:'B2-S1',name:'Bedroom 2 left-wall single 13A socket',kind:'Socket',source:'Developer electrical plan + elevation K; actual photo confirms left-wall socket',height:'300 mm AFFL (legend)',note:'Left side wall near window. Exact horizontal offset is not dimensioned; verify faceplate before cabinetry.'},
  {room:'B2',id:'B2-S2',name:'Bedroom 2 entry-wall single 13A socket',kind:'Socket',source:'Developer electrical plan + entry-wall elevation L / mirrored L-prime',height:'300 mm AFFL (legend)',note:'Beside the room door on the planned wardrobe wall. Both full-height and low-drawer cabinetry must leave the original socket usable and serviceable. A niche starting at 1200 mm does not resolve this low socket. Exact jamb offset is not dimensioned.'},
  {room:'餐厅',id:'D-S1–S3',name:'Three dining socket groups — count disputed',kind:'Socket',source:'Owner recollection; absent on developer schedule',height:'Site measure',note:'Do not set out cabinetry from these until all three faceplates and their walls are verified.'},
  {room:'厨房',id:'K-SW',name:'Kitchen lighting switches',kind:'Switch',source:'Developer plan',height:'1200 mm AFFL (legend)',note:'Trace kitchen, entry and yard circuits on site.'},
  {room:'客厅',id:'L-AC-SW',name:'Living AC pilot switch',kind:'Switch',source:'Developer legend',height:'1200 mm AFFL (legend)',note:'Match it to the fan-coil feed.'},
  {room:'主人房',id:'M-SW',name:'Bedroom and ensuite switch groups',kind:'Switch',source:'Developer plan',height:'1200 mm AFFL (legend)',note:'Two 2-gang groups; trace each lighting circuit and water-heater pilot.'},
  {room:'B2',id:'B2-SW',name:'Bedroom 2 two-gang light switch',kind:'Switch',source:'Developer plan',height:'1200 mm AFFL (legend)',note:'Entry-side low cabinet must leave the existing wall switch accessible; verify on site.'},
  {room:'B3',id:'B3-SW',name:'Bedroom 3 two-gang light switch',kind:'Switch',source:'Developer plan',height:'1200 mm AFFL (legend)',note:'Full wardrobe must leave relocated switch accessible; no cabinet lighting.'},
  {room:'Bath 1',id:'B1-WH-SW',name:'Water-heater pilot switch',kind:'Switch',source:'Developer plan',height:'1200 mm AFFL (legend)',note:'Outside/at bathroom entrance; verify zone and isolator.'},
  {room:'Bath 2',id:'B2B-WH-SW',name:'Water-heater pilot switch',kind:'Switch',source:'Developer plan',height:'1200 mm AFFL (legend)',note:'Outside/at bathroom entrance; verify zone and isolator.'},
  {room:'AC Ledge',id:'AC-1',name:'Condenser feeds and isolators',kind:'Fixed service',source:'AC service coordination; no general 13A shown',height:'Site measure',note:'Mark each condenser, isolator, breaker and service clearance with the AC contractor.'}
];

