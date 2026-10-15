import * as THREE from 'three';
import {createCabinetry} from './cabinetry.js?v=20261015-cabinets-r2';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {ROOM_SURVEY,ROOM_FEATURES,UNLOCATED_POINTS} from './planning-data.js?v=20261013-r13';
import {AGREED_SCOPE,BEDROOM2,SOURCE_REGISTER,registeredSource,planToModel,sourceModel,DINING,FANS,FIXTURES,fixtureMeta,AIR_CONDITIONERS,HALL_CEILING} from './agreed-design.js?v=20261015-cabinets-r2';

import {createTileReflection} from './floor-reflection.js?v=20261013-r13';
import {LIGHT_COLOUR, roomViewingMatrix} from './light-colour.js?v=20261013-r13';
import {createWindowDaylight} from './window-daylight.js?v=20261015-cabinets-r2';

RectAreaLightUniformsLib.init();

const TYPES={light:{label:'Light point',color:0xffd166},fan:{label:'Fan point',color:0x6aa9ff},socket:{label:'Socket / power',color:0x56d68b},data:{label:'TV / fibre',color:0xb18cff},fixed:{label:'Air-con / water heater',color:0x4dd7e7},proposed:{label:'Proposed',color:0xff835c}};
const ROOMS=['全屋','玄关','客厅','餐厅','厨房','Yard','走道','主人房','B2','B3','Bath 1','Bath 2','AC Ledge'];
const ROOM_LABELS={'全屋':'Whole home','玄关':'Entry','客厅':'Living room','餐厅':'Dining','厨房':'Kitchen','Yard':'Yard','走道':'Hall','主人房':'Master bedroom','B2':'Bedroom 2','B3':'Bedroom 3','Bath 1':'Bath 1','Bath 2':'Bath 2','AC Ledge':'AC ledge'};
const points=SOURCE_REGISTER.map(([id,room,ex,ey,type,title])=>{
 const [x,y]=sourceModel(id);
 const unused=['M-L1','M-L3','M-FAN','B2-L2','B2-F'].includes(id);
 const fixture=FIXTURES.find(f=>f.id===id||f.feed===id),fan=FANS.find(f=>f.id===id);
 return {id,room,type,pos:[x,2.73,-y],title,spec:type==='fan'?'Original fan supply':'Original light supply',note:unused?'Unused: retain and safely cover. No fitting planned.':fixture?.status||fan?.status||(id==='B2-L1'?'Feed the proposed transverse track at this original point; verify circuit on site.':'Existing supply retained; new fitting centres are in the current 2D drawing.'),status:unused?'Unused':'Drawing-derived · verify on site',sourcePixel:[ex,ey]};
});
// Outlet locations are inherited approximations, hidden by default. Do not
// introduce a new wardrobe-niche supply or a powered mirror cabinet.
const outletRows=[
 ['L-S1','客厅','socket',.24,6.65,.30,'Sofa-wall socket 1'],['L-S2','客厅','socket',.24,8.25,.30,'Sofa-wall socket 2'],
 ['L-S3','客厅','socket',3.11,6.65,.30,'TV-wall single socket'],['L-S4','客厅','socket',3.11,7.68,.30,'TV-wall double socket'],
 ['L-D1','客厅','data',3.10,7.42,.35,'TV / fibre point'],
 ['K-S1','厨房','socket',2.42,.22,1.00,'Kitchen counter power A'],['K-S2','厨房','socket',3.43,.22,1.00,'Kitchen counter power B'],['K-FR','厨房','socket',3.91,2.18,1.00,'Fridge power'],
 ['Y-S1','Yard','socket',4.32,.25,1.00,'Yard socket 1'],['Y-S2','Yard','socket',4.86,.25,1.00,'Yard socket 2'],['Y-S3','Yard','socket',5.22,2.36,1.00,'Yard socket 3'],
 ['M-S1','主人房','socket',6.53,8.35,.30,'Master socket A'],['M-S2','主人房','socket',9.42,7.15,.30,'Master socket B'],['M-S3','主人房','socket',6.53,6.35,.30,'Master socket C'],
 ['B3-S1','B3','socket',5,4.62,.30,'Bedroom 3 socket 1'],['B3-S2','B3','socket',7.72,3.52,.30,'Bedroom 3 socket 2'],
 ['B1-WH','Bath 1','fixed',9.45,4.72,1.85,'Bathroom 1 water-heater feed'],['B2B-WH','Bath 2','fixed',3.62,4.72,1.85,'Bathroom 2 water-heater feed']
];
for(const [id,room,type,x,y,z,title] of outletRows)points.push({id,room,type,pos:[x,z,-y],title,spec:'Existing service indication',note:'Horizontal offset is unmeasured. Trace the actual outlet and circuit on site.',status:'Approximate model marker'});
for(const a of AIR_CONDITIONERS)points.push({id:a.id,room:a.room,type:'fixed',pos:[a.wallCentre[0],a.centreHeight,-a.wallCentre[1]],title:a.name+' feed',spec:'2525 mm AFFL · developer legend',note:a.status+'. Electrical symbol registration retained separately; marker is a doorway-side model indication.',status:'Drawing-derived · site-check',electricalPixel:a.sourcePixel});
for(const f of FIXTURES.filter(f=>f.installed&&!SOURCE_REGISTER.some(p=>p[0]===f.id))){points.push({id:f.id,room:f.room,type:'proposed',pos:[f.centre[0],2.70,-f.centre[1]],title:f.name,spec:'Current fitting target',note:f.status,status:'Proposed · set-out pending'});}
points.push({id:'B2-CIRCULATOR',room:'B2',type:'proposed',pos:[BEDROOM2.circulator.centre[0],.886,-BEDROOM2.circulator.centre[1]],title:'Bedroom 2 standing circulator',spec:'Plug-in · 326 × 310 × 886 mm reference',note:BEDROOM2.circulator.status,status:'Current layout · adjustable floor position'});

const canvas=document.querySelector('#scene'); const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
const isMobile=matchMedia('(max-width: 720px)').matches;
const maxDpr=Math.min(devicePixelRatio,isMobile?1.35:1.8);
renderer.setPixelRatio(maxDpr);renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.96;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xdfe3e5); scene.fog=new THREE.Fog(0xdfe3e5,28,52); const camera=new THREE.PerspectiveCamera(32,1,.1,100); camera.position.set(14.5,15.5,13.5);
const controls=new OrbitControls(camera,canvas); controls.enableDamping=true; controls.target.set(5,0,-4.8); controls.minDistance=.4; controls.maxDistance=32; controls.maxPolarAngle=Math.PI*.68;
const hemi=new THREE.HemisphereLight(0xeaf5ff,0xa79d8e,1.65);scene.add(hemi); const sun=new THREE.DirectionalLight(0xffe7c8,1.8); sun.position.set(-5,15,8);sun.castShadow=true;sun.shadow.mapSize.set(isMobile?1024:2048,isMobile?1024:2048);scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0xc8cdd0,roughness:.96})); ground.rotation.x=-Math.PI/2; ground.position.y=-.04; ground.receiveShadow=true;scene.add(ground);
let model; const markerGroup=new THREE.Group(); scene.add(markerGroup); const markerMeshes=[];
// Existing interior door frames and skirting share this white finish.
const doorTrimMat=new THREE.MeshStandardMaterial({color:0xf1f0ea,roughness:.48});

let wallPaintMaterial;
function buildShell(){
 // Jotun 1928 Summer Snow is a greyish white (NCS 1102-Y10R). The sRGB swatch
 // here is only a screen approximation; the paint recipe must come from Jotun.
 // Jotun's on-screen 1928 Summer Snow swatch is RGB(229,226,216).
 // Keep the base material anchored to that actual swatch; scene lights change its appearance.
 const wallMat=new THREE.MeshStandardMaterial({color:0xe5e2d8,roughness:.94});wallPaintMaterial=wallMat;
 const frameMat=new THREE.MeshStandardMaterial({color:0x24282b,roughness:.43});
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xe2e6e5,roughness:.13,transparent:true,opacity:.14,side:THREE.DoubleSide});
 const doorMat=new THREE.MeshStandardMaterial({color:0x333d43,roughness:.62});
 const serviceMat=doorTrimMat;
 const shell=new THREE.Group();shell.name='Verified Type A shell';scene.add(shell);model=shell;
 function part(name,x,z,w,d,bottom,height,mat=wallMat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,height,d),mat);m.name=name;m.position.set(x,bottom+height/2,-z);m.castShadow=true;m.receiveShadow=true;shell.add(m);return m}
 function wx(a,b,y,h=2.85,t=.16){if(b>a)part('wall x',(a+b)/2,y,b-a,t,0,h)}
 function wy(x,a,b,h=2.85,t=.16){if(b>a)part('wall y',x,(a+b)/2,t,b-a,0,h)}
 function openingX(a,b,y,sill=.88,top=2.36,t=.16){part('window sill wall',(a+b)/2,y,b-a,t,0,sill);part('window lintel',(a+b)/2,y,b-a,t,top,2.85-top);part('window glass',(a+b)/2,y,b-a-.08,.022,sill+.04,top-sill-.08,glassMat);part('window lower frame',(a+b)/2,y,b-a,.04,sill-.015,.04,frameMat);part('window upper frame',(a+b)/2,y,b-a,.04,top-.025,.05,frameMat);part('window jamb',a,y,.045,.045,sill,top-sill,frameMat);part('window jamb',b,y,.045,.045,sill,top-sill,frameMat);part('window mullion',(a+b)/2,y,.035,.045,sill,top-sill,frameMat)}
 function singleBathroomWindow(a,b,y){const sill=1.55,top=2.15;part('bathroom window sill wall',(a+b)/2,y,b-a,.16,0,sill);part('bathroom window lintel',(a+b)/2,y,b-a,.16,top,2.85-top);part('single bathroom frosted glazing',(a+b)/2,y,b-a-.06,.025,sill+.03,top-sill-.06,glassMat);for(const x of [a,b])part('bathroom black window jamb',x,y,.045,.05,sill,top-sill,frameMat);for(const z of [sill,top])part('bathroom black window rail',(a+b)/2,y,b-a,.05,z-.025,.05,frameMat)}
 function openingY(x,a,b,sill=.88,top=2.36,t=.16){part('window sill wall',x,(a+b)/2,t,b-a,0,sill);part('window lintel',x,(a+b)/2,t,b-a,top,2.85-top);part('window glass',x,(a+b)/2,.022,b-a-.08,sill+.04,top-sill-.08,glassMat);part('window lower frame',x,(a+b)/2,.04,b-a,sill-.015,.04,frameMat);part('window upper frame',x,(a+b)/2,.04,b-a,top-.025,.05,frameMat);part('window jamb',x,a,.045,.045,sill,top-sill,frameMat);part('window jamb',x,b,.045,.045,sill,top-sill,frameMat)}
 // Actual living and B2 photos: three tall black-framed bays with a continuous
 // lower horizontal rail. Generic two-bay openings cannot represent these.
 function threeBayWindow(a,b,y){const sill=.72,top=2.31;part('three-bay window sill wall',(a+b)/2,y,b-a,.16,0,sill);part('three-bay window lintel',(a+b)/2,y,b-a,.16,top,2.85-top);part('three-bay glazing',(a+b)/2,y,b-a-.055,.025,sill+.025,top-sill-.05,glassMat);for(const x of [a,a+(b-a)/3,a+2*(b-a)/3,b])part('three-bay black vertical frame',x,y,.05,.06,sill,top-sill,frameMat);for(const z of [sill,1.17,top])part('three-bay black horizontal frame',(a+b)/2,y,b-a,.06,z-.025,.05,frameMat)}
 // Actual B3 photo: two black-framed casements, with no lower transom.
 function twoBayWindow(a,b,y){const sill=1.10,top=2.29;part('two-bay window sill wall',(a+b)/2,y,b-a,.16,0,sill);part('two-bay window lintel',(a+b)/2,y,b-a,.16,top,2.85-top);part('two-bay glazing',(a+b)/2,y,b-a-.05,.025,sill+.025,top-sill-.05,glassMat);for(const x of [a,(a+b)/2,b])part('two-bay black vertical frame',x,y,.05,.06,sill,top-sill,frameMat);for(const z of [sill,top])part('two-bay black horizontal frame',(a+b)/2,y,b-a,.06,z-.025,.05,frameMat)}
 function doorX(a,b,y,mat=serviceMat){part('door',(a+b)/2,y,b-a-.09,.055,.01,2.14,mat);part('door header',(a+b)/2,y,b-a,.16,2.19,.66);for(const x of [a,b])part('interior door frame jamb',x,y,.05,.192,.018,2.19,doorTrimMat);part('interior door frame head',(a+b)/2,y,b-a+.05,.192,2.14,.07,doorTrimMat)}
 function doorY(x,a,b,mat=serviceMat){part('door',x,(a+b)/2,.055,b-a-.09,.01,2.14,mat);part('door header',x,(a+b)/2,.16,b-a,2.19,.66);for(const y of [a,b])part('interior door frame jamb',x,y,.192,.05,.018,2.19,doorTrimMat);part('interior door frame head',x,(a+b)/2,.192,b-a+.05,2.14,.07,doorTrimMat)}
 function inwardEntry(a,b,y){
  const pivot=new THREE.Group();pivot.name='main entrance inward swing';pivot.position.set(a,0,-y);pivot.rotation.y=Math.PI/3;shell.add(pivot);
  const leaf=new THREE.Mesh(new THREE.BoxGeometry(b-a-.035,2.14,.045),doorMat);
  leaf.name='main entrance door';leaf.position.set((b-a-.035)/2,1.08,0);leaf.castShadow=true;pivot.add(leaf);
  part('main entrance header',(a+b)/2,y,b-a,.16,2.19,.66);
 }
 // Original Plan is aligned in work/build_whole_home.py; use that accepted
 // structural geometry, not the old Blender furniture or guessed pixel traces.
 wy(.09,1.00,9.05);wy(9.57,2.60,9.05);
 wx(.09,.57,9.05);threeBayWindow(.57,2.82,9.05);wx(2.82,3.245,9.05);
 wx(3.245,3.75,9.05);threeBayWindow(3.75,5.95,9.05);wx(5.95,6.29,9.05);
 wx(6.29,6.825,9.05);threeBayWindow(6.825,9.125,9.05);wx(9.125,9.57,9.05);
 wx(1.795,5.37,.08);wx(7.82,8.08,2.60);singleBathroomWindow(8.08,8.63,2.60);wx(8.63,9.57,2.60);
 // The outer foyer threshold is the grill. The actual inward-opening main
 // door is on the inner transverse wall at y=1.00 beside the shoe cabinet.
 wx(.09,.15,1.00);inwardEntry(.15,1.07,1.00);wx(1.07,1.795,1.00);
 wy(1.795,.08,1.00);wy(.09,.08,1.00,1.0);
 // Main-door grill, inside the existing outer foyer opening. Pattern and
 // fabrication dimensions are indicative; no wall or threshold is relocated.
 for(const x of [.15,1.07])part('main-door grill jamb',x,.08,.035,.05,.015,2.12,frameMat);
 for(const h of [.025,1.03,2.12])part('main-door grill horizontal rail',.61,.08,.92,.035,h,.025,frameMat);
 for(let x=.27;x<1.06;x+=.13)part('main-door grill vertical bar',x,.08,.014,.025,.05,2.06,frameMat);

 // Living AC mounts over the open hall entrance, facing the living room.
 part('existing corridor entrance header',3.245,5.7765,.16,1.153,2.19,.66);
 // B2 and corridor; the master entry is in its west partition.
 wy(3.245,6.353,9.05);wx(3.245,BEDROOM2.entry.doorStart,6.353);doorX(BEDROOM2.entry.doorStart,BEDROOM2.entry.doorEnd,6.353);wx(BEDROOM2.entry.doorEnd,6.29,6.353);
 wy(6.29,6.25,9.05);doorY(6.29,5.35,6.25);wy(6.29,5.20,5.35);
 // Bathrooms and B3 block, with plan-correct entries.
 wy(3.245,2.60,5.20);wy(4.775,2.60,5.20);wy(7.82,2.60,5.20);
 wx(3.245,4.025,5.20);doorX(4.025,4.775,5.20);
 wx(4.775,4.955,5.20);doorX(4.955,5.855,5.20);wx(5.855,8.02,5.20);doorX(8.02,8.82,5.20);wx(8.82,9.57,5.20);
 wx(3.245,4.15,2.60);singleBathroomWindow(4.15,4.70,2.60);wx(4.70,4.775,2.60);
 wx(4.775,6.605,2.60);twoBayWindow(6.605,7.705,2.60);wx(7.705,7.82,2.60);
 // Actual unit photo: on the kitchen wall the door is north/left and the
 // retained louvre window south/right, separated by a solid 180 mm mullion.
 wy(4.04,.08,.32);openingY(4.04,.32,.92,.90,2.145);wy(4.04,.92,1.10);
 const pd=new THREE.Group();pd.name='PD yard door outward opening single leaf no cat hole';pd.position.set(4.04,0,-1.80);pd.rotation.y=Math.PI/3;shell.add(pd);
 const pdFinish=new THREE.MeshStandardMaterial({color:0x3c4548,roughness:.8});
 const pdGlass=new THREE.MeshStandardMaterial({color:0xc5cece,roughness:.7,transparent:true,opacity:.7});
 // Outward presentation into Yard (+X), not a folding pair. Exact PD
 // pivot hardware is supplier-specific; this leaf shows the agreed direction.
 for(const zz of [0,.70]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.035,2.09,.025),pdFinish);rail.position.set(0,1.065,zz);pd.add(rail)}
 for(const yy of [.035,1.05,2.09]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.035,.035,.70),pdFinish);rail.position.set(0,yy,.35);pd.add(rail)}
 const pane=new THREE.Mesh(new THREE.BoxGeometry(.022,2.00,.655),pdGlass);pane.position.set(0,1.055,.35);pd.add(pane);
 const handle=new THREE.Mesh(new THREE.BoxGeometry(.08,.12,.022),pdFinish);handle.position.set(.05,1.02,.60);pd.add(handle);
 pd.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
 part('PD door header',4.04,1.45,.16,.70,2.12,.73);wy(4.04,1.80,2.60);
 // Yard/ledge proposal: window on the near/south side, door on the far/north
 // side, as corrected against the user's view. The outer edge is a grill.
 wy(5.37,.08,1.00);
 part('ledge fixed window sill',5.37,1.405,.16,.79,0,.85);
 part('ledge fixed window',5.37,1.405,.025,.70,.91,1.14,glassMat);
 part('ledge fixed window transom',5.37,1.405,.025,.70,2.16,.49,glassMat);
 part('ledge window lower rail',5.37,1.405,.05,.79,.84,.05,frameMat);
 part('ledge window transom rail',5.37,1.405,.05,.79,2.10,.055,frameMat);
 part('ledge glass door',5.37,2.205,.055,.72,.01,2.09,glassMat);
 part('ledge door transom',5.37,2.205,.025,.75,2.16,.49,glassMat);
 part('ledge door transom rail',5.37,2.205,.05,.81,2.10,.055,frameMat);
 for(const y of [1.00,1.81,2.60])part('ledge door-window mullion',5.37,y,.05,.05,0,2.70,frameMat);
 part('ledge glazing header',5.37,1.80,.16,1.60,2.70,.15);
 wx(5.37,6.22,.08);
 part('outer ledge grill low curb',6.22,1.34,.10,2.52,0,.14);
 part('outer ledge grill top rail',6.22,1.34,.035,2.52,1.08,.045,frameMat);
 for(let y=.17;y<2.60;y+=.145)part('outer ledge grill vertical bar',6.22,y,.023,.023,.14,.94,frameMat);
 return shell;
}

function tileTexture(tone='public'){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle=tone==='bath'?'#62686a':'#bcbab2';x.fillRect(0,0,512,512);const g=x.createLinearGradient(0,0,512,512);g.addColorStop(0,'rgba(255,255,255,.045)');g.addColorStop(.5,'rgba(255,255,255,.008)');g.addColorStop(1,'rgba(92,94,91,.025)');x.fillStyle=g;x.fillRect(0,0,512,512);x.strokeStyle=tone==='bath'?'rgba(205,209,207,.42)':'rgba(89,91,89,.25)';x.lineWidth=2;x.strokeRect(1,1,510,510);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
// Photo reference: actual inspection report pp. 12, 16, 18 (all bedrooms).
// Warm pale oak, with staggered planks. Photo-matched screen approximation.
function woodTexture(){
 const c=document.createElement('canvas');c.width=1024;c.height=2048;const g=c.getContext('2d');let seed=71923;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 g.fillStyle='#b6a083';g.fillRect(0,0,c.width,c.height);
 for(let plank=0;plank<6;plank++){
  const x=plank*c.width/6,w=c.width/6,shade=Math.round((rand()-.5)*12),r=182+shade,green=160+shade,b=131+shade;
  g.fillStyle=`rgb(${r},${green},${b})`;g.fillRect(x,0,w,c.height);
  for(let i=0;i<92;i++){const gx=x+rand()*w;g.strokeStyle=`rgba(83,58,34,${.025+rand()*.055})`;g.lineWidth=.4+rand()*1.4;g.beginPath();g.moveTo(gx,0);g.bezierCurveTo(gx+(rand()-.5)*14,660,gx+(rand()-.5)*16,1320,gx+(rand()-.5)*6,2048);g.stroke()}
  g.strokeStyle='rgba(85,64,44,.25)';g.lineWidth=1;g.beginPath();g.moveTo(x,0);g.lineTo(x,2048);g.stroke();
  const joint=plank%3*620+160;g.strokeStyle='rgba(85,64,44,.22)';g.beginPath();g.moveTo(x,joint);g.lineTo(x+w,joint);g.stroke();
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}
function floorPlane(x,y,w,d,kind='tile'){const tex=kind==='wood'?woodTexture():tileTexture(kind==='bath'?'bath':'public');tex.repeat.set(kind==='wood'?w/1.08:w/.60,kind==='wood'?d/2.4:d/.60);const mat=kind==='wood'?new THREE.MeshStandardMaterial({map:tex,roughness:.60}):new THREE.MeshPhysicalMaterial({map:tex,roughness:kind==='bath'?.7:.085,metalness:0,clearcoat:kind==='bath'?0:.82,clearcoatRoughness:.065});const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);p.rotation.x=-Math.PI/2;p.position.set(x,.018,-y);p.receiveShadow=true;scene.add(p)}
function buildSurfaces(){
 // Same room extents as the plan-calibrated Blender structural script. The
 // bedroom wood finish and public 600×600 glossy tiles match actual photos.
 floorPlane(1.7125,4.60,3.065,8.84,'tile');
 floorPlane(3.6425,1.375,.795,2.45,'tile');
 floorPlane(.9725,.575,1.645,.85,'tile');
 floorPlane(4.8575,5.9415,3.225,1.183,'tile');
 floorPlane(4.7675,7.7015,2.865,2.517,'wood');
 floorPlane(7.975,7.20,3.01,3.70,'wood');
 floorPlane(4.10,3.975,1.35,2.45,'bath');
 floorPlane(6.3875,3.975,2.865,2.45,'wood');
 floorPlane(8.74,3.975,1.48,2.45,'bath');
 floorPlane(4.795,1.375,1.15,2.45,'tile');
 floorPlane(5.90,1.375,.70,2.45,'tile');
}

const mats={
 linen:new THREE.MeshPhysicalMaterial({color:0xffffff,map:linenTexture(),roughness:.93,sheen:.35,sheenColor:0xffffff}),
 black:new THREE.MeshStandardMaterial({color:0x17191c,roughness:.55}),
 graphite:new THREE.MeshStandardMaterial({color:0x3f454a,roughness:.68}),
 cabinet:new THREE.MeshStandardMaterial({color:0x4d5357,roughness:.82}),
 lightCab:new THREE.MeshStandardMaterial({color:0xc9c9c3,roughness:.86}),
 counter:new THREE.MeshStandardMaterial({color:0xe2e3df,roughness:.48}),
 bed:new THREE.MeshPhysicalMaterial({color:0xd7d4cd,roughness:.88}),
 wood:new THREE.MeshStandardMaterial({color:0x756e66,roughness:.76}),
 metal:new THREE.MeshStandardMaterial({color:0x30343a,roughness:.35,metalness:.7}),
 glass:new THREE.MeshPhysicalMaterial({color:0x91b3bf,roughness:.12,transmission:.55,transparent:true,opacity:.55}),
 screen:new THREE.MeshStandardMaterial({color:0x101215,roughness:.35}),
 ceramic:new THREE.MeshPhysicalMaterial({color:0xf3f3ef,roughness:.16,clearcoat:.45})
};
function travertineTexture(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#d9d3c7';g.fillRect(0,0,512,512);let seed=314159;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<32;i++){const y=rand()*512;g.strokeStyle=`rgba(124,116,99,${.025+rand()*.075})`;g.lineWidth=1+rand()*5;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(100,y-9+rand()*18,320,y-9+rand()*18,512,y-5+rand()*10);g.stroke()}for(let i=0;i<2800;i++){g.fillStyle=`rgba(105,98,82,${.018+rand()*.052})`;g.fillRect(rand()*512,rand()*512,1+rand()*13,.3+rand()*2)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const travertineMat=new THREE.MeshPhysicalMaterial({map:travertineTexture(),roughness:.62,clearcoat:.07,clearcoatRoughness:.55});
function greyAshTexture(){const c=document.createElement('canvas');c.width=256;c.height=768;const g=c.getContext('2d');g.fillStyle='#a5a8a5';g.fillRect(0,0,c.width,c.height);let seed=3184;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<1100;i++){const x=rand()*256,w=.2+rand()*1.7;g.strokeStyle=`rgba(65,70,68,${.010+rand()*.035})`;g.lineWidth=w;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x-3+rand()*6,220,x-4+rand()*8,520,x-3+rand()*6,768);g.stroke()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const greyAshMat=new THREE.MeshStandardMaterial({map:greyAshTexture(),roughness:.86});
// Repeat the light upper/fridge door finish on the open prep base. Bedroom
// wardrobes are a slightly cooler matte mineral grey; niches keep one quiet
// grey-ash grain rather than the former orange-brown lining.
mats.islandCabinet=mats.lightCab;
mats.wardrobeCab=new THREE.MeshStandardMaterial({color:0xc5c5c1,roughness:.88});
mats.nicheWood=greyAshMat;
mats.linen.bumpMap=mats.linen.map;mats.linen.bumpScale=.005;
let cabinetry;
const interior=new THREE.Group();interior.visible=true;scene.add(interior);
function linenTexture(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#e0ddd6';g.fillRect(0,0,256,256);let seed=1978;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<13000;i++){const v=130+Math.floor(rand()*85);g.fillStyle=`rgba(${v},${v},${v},${.025+rand()*.045})`;g.fillRect(rand()*256,rand()*256,rand()*2+.4,rand()*5+.6)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,5);return t}
function box(name,x,y,z,w,d,h,mat,r=.04){const g=r>.012?new RoundedBoxGeometry(w,h,d,name.startsWith('1978')?4:2,Math.min(r,w/2,d/2,h/2)):new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(g,mat);m.name=name;m.position.set(x,z+h/2,-y);m.castShadow=true;m.receiveShadow=true;interior.add(m);return m}
function standingCirculator(){
 const f=BEDROOM2.circulator,[x,y]=f.centre,g=new THREE.Group();
 g.name=f.name;g.userData={model:f.model,size:f.size,power:f.power,status:f.status};
 g.position.set(x,0,-y);g.rotation.y=Math.atan2(f.aim[0]-x,y-f.aim[1]);interior.add(g);
 const white=new THREE.MeshStandardMaterial({color:0xf0f0ed,roughness:.8});
 const grey=new THREE.MeshStandardMaterial({color:0xabb4b4,roughness:.9});
 function part(name,geometry,material,px,py,pz){const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(px,py,pz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
 part('B2 circulator round floor base',new THREE.CylinderGeometry(.155,.155,.026,40),white,0,.013,0);
 part('B2 circulator connected upright',new THREE.CylinderGeometry(.020,.025,.625,20),white,0,.338,-.014);
 const head=new THREE.Group();head.position.set(0,.723,0);head.rotation.x=-.10;g.add(head);
 function headPart(name,geometry,material,z){const m=new THREE.Mesh(geometry,material);m.name=name;m.position.z=z;m.castShadow=true;m.receiveShadow=true;head.add(m);return m}
 const shell=headPart('B2 circulator guarded round housing',new THREE.CylinderGeometry(.163,.163,.140,40),white,0);shell.rotation.x=Math.PI/2;
 headPart('B2 circulator visible front recess',new THREE.CircleGeometry(.151,40),grey,.071);
 for(let i=0;i<3;i++){const blade=headPart('B2 circulator enclosed static blade '+i,new THREE.CircleGeometry(.059,16),white,.073);blade.position.x=Math.cos(i*Math.PI*2/3)*.063;blade.position.y=Math.sin(i*Math.PI*2/3)*.063;blade.scale.set(1,.55,1);blade.rotation.z=i*Math.PI*2/3;}
 const wire=[];for(const radius of [.044,.080,.116,.149])for(let i=0;i<48;i++){const a=i*Math.PI*2/48,b=(i+1)*Math.PI*2/48;wire.push(radius*Math.cos(a),radius*Math.sin(a),.079,radius*Math.cos(b),radius*Math.sin(b),.079)}
 for(let i=0;i<16;i++){const a=i*Math.PI*2/16;wire.push(.018*Math.cos(a),.018*Math.sin(a),.080,.149*Math.cos(a),.149*Math.sin(a),.080)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(wire,3));
 const grille=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xe5e8e5}));grille.name='B2 circulator protective grille';head.add(grille);
 headPart('B2 circulator front hub',new THREE.CircleGeometry(.020,20),white,.082);
 // Cable follows the clear wall-side strip instead of crossing the doorway.
 const p=BEDROOM2.services.socket;
 const cord=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(p.centre[0],.30,-p.centre[1]-.02),new THREE.Vector3(p.centre[0],.03,-p.centre[1]-.04),new THREE.Vector3(x,.015,-y+.14)]),16,.003,6,false),grey);
 cord.name='B2 circulator cable to existing socket';interior.add(cord);
}
function dimoutRollerBlind(name,a,b,planY){
 // Softly translucent linen-look dimout fabric; physical transmission is unmeasured.
 // Transparency is illustrative; actual openness and privacy need a sample.
 a-=.10;b+=.10;
 const width=b-a,geom=new THREE.PlaneGeometry(width,1.72);
 const fabric=new THREE.Mesh(geom,new THREE.MeshPhysicalMaterial({map:linenTexture(),color:0xf0efeb,roughness:.98,side:THREE.DoubleSide,transparent:true,opacity:.94,depthWrite:false}));
 fabric.name=name+' flat linen-look dimout fabric';fabric.position.set((a+b)/2,1.60,-planY);fabric.receiveShadow=true;interior.add(fabric);
 box(name+' slim roller housing',(a+b)/2,planY,2.46,width,.065,.065,mats.lightCab,.009);
 box(name+' straight weighted hem',(a+b)/2,planY-.008,.73,width,.018,.035,mats.lightCab,.005);
 for(const y of [planY-.035,planY-.025])box(name+' control chain',b+.028,y,1.64,.004,.004,.79,mats.lightCab,.001);
}
function fabricCurtain(name,cx,width,planY,material,depth=.035){
 const geom=new THREE.PlaneGeometry(width,2.70,32,1),v=geom.attributes.position;
 for(let i=0;i<v.count;i++)v.setZ(i,Math.sin((v.getX(i)/width+.5)*Math.PI*10)*depth);
 geom.computeVertexNormals();const mesh=new THREE.Mesh(geom,material);mesh.name=name;mesh.position.set(cx,1.405,-planY);mesh.castShadow=true;mesh.receiveShadow=true;interior.add(mesh);
}
function windowTreatments(){
 // Full-height double fabric curtain on exposed rails; no curtain box.
 const livingSheer=new THREE.MeshPhysicalMaterial({color:0xefeee9,roughness:1,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false});
 const livingDrape=new THREE.MeshStandardMaterial({color:0xbdbbb5,roughness:1,side:THREE.DoubleSide});
 box('living double curtain exposed ceiling rail',1.6675,8.78,2.79,2.99,.12,.035,mats.lightCab,.009);
 fabricCurtain('living full-height white sheer',1.6675,2.91,8.86,livingSheer,.025);
 fabricCurtain('living left gathered grey greige fabric curtain',.40,.46,8.74,livingDrape,.060);
 fabricCurtain('living right gathered grey greige fabric curtain',2.94,.46,8.74,livingDrape,.060);
 dimoutRollerBlind('B2 linen-look dimout roller blind',3.75,5.95,8.91);
 const sheer=new THREE.MeshPhysicalMaterial({color:0xefeee9,roughness:1,transparent:true,opacity:.56,side:THREE.DoubleSide,depthWrite:false});
 const drape=new THREE.MeshPhysicalMaterial({color:0xbdbbb5,roughness:1,side:THREE.DoubleSide});
 box('master full-wall double curtain ceiling rail',7.93,8.82,2.79,3.22,.08,.035,mats.lightCab,.009);
 fabricCurtain('master full-wall white sheer',7.93,3.13,8.88,sheer,.022);
 fabricCurtain('master left gathered warm grey drape',6.51,.43,8.76,drape,.045);
 fabricCurtain('master right gathered warm grey drape',9.35,.43,8.76,drape,.045);
}
function lineGap(x,y,z,w,d,h,mat,count,axis='x'){for(let i=1;i<count;i++){const t=i/count;if(axis==='x')box('door seam',x-w/2+w*t,y-d/2-.006,z,.012,.012,h,mat,0);else box('door seam',x-w/2,y-d/2+d*t,z,w,.012,.012,mat,0)}}
function sofa(){
 // King Living 1978 reference: low armless modules, rounded broad seats and
 // one soft back with a horizontal lumbar division, without a separate roll.
 const f=mats.linen;
 box('1978 two-seat single rounded cushion body',.72,7.11,.025,1.04,1.62,.46,f,.18);
 box('1978 chaise single rounded cushion body',1.03,8.43,.025,1.66,1.02,.46,f,.18);
 box('1978 two-seat integrated soft back',.34,7.11,.18,.30,1.59,.72,f,.095);
 box('1978 chaise integrated soft back',.34,8.43,.18,.30,.99,.72,f,.095);
 box('1978 two-seat shallow lumbar contour',.492,7.11,.49,.045,1.47,.15,f,.023);
 box('1978 chaise shallow lumbar contour',.492,8.43,.49,.045,.88,.15,f,.023);
 const seam=new THREE.MeshStandardMaterial({color:0xc6c3bd,roughness:.98});
 box('1978 two-seat back subtle seam',.493,7.11,.672,.004,1.48,.006,seam,.001);
 box('1978 chaise back subtle seam',.493,8.43,.672,.004,.89,.006,seam,.001);
 // Leave roughly 150 mm to the finished window wall, not a near-zero gap.
 for(const piece of interior.children.filter(o=>o.name.startsWith('1978 ')))piece.position.z+=.12;
}
function wardrobe(x,y,w,d,label){box(label,x,y,.02,w,d,2.64,mats.lightCab,.025);lineGap(x,y-d/2-.006,.04,w,.012,2.55,mats.graphite,Math.max(2,Math.round(w/.55)))}
function bed(x,y,w,d,label){box(label+' frame',x,y,.03,w,d,.25,mats.wood,.08);box(label+' mattress',x,y,.28,w-.08,d-.10,.24,mats.bed,.09);box(label+' pillow 1',x-w*.22,y-d*.31,.54,w*.36,.45,.12,mats.bed,.09);box(label+' pillow 2',x+w*.22,y-d*.31,.54,w*.36,.45,.12,mats.bed,.09);box(label+' headboard',x,y-d/2+.08,.02,w,.14,.92,mats.graphite,.08)}
function rotateNamed(prefix,cx,cy,angle){const c=Math.cos(angle),q=Math.sin(angle);for(const o of interior.children.filter(o=>o.name.startsWith(prefix))){const dx=o.position.x-cx,dz=o.position.z+cy;o.position.x=cx+c*dx+q*dz;o.position.z=-cy-q*dx+c*dz;o.rotation.y+=angle}}
function litterBox(name,x,y){box(name+' body',x,y,.02,.48,.64,.18,mats.graphite,.09);box(name+' rim',x,y,.20,.50,.66,.07,mats.lightCab,.08)}
function diningChair(name,x,y,backSide=1){
 box(name+' light upholstered seat',x,y,.44,.48,.48,.07,mats.linen,.055);
 box(name+' black back frame',x+backSide*.225,y,.45,.025,.49,.49,mats.metal,.008);
 box(name+' light upholstered back',x+backSide*.185,y,.49,.075,.44,.40,mats.linen,.035);
 for(const dx of [-.17,.17])for(const dy of [-.17,.17])box(name+' slim leg',x+dx,y+dy,.02,.025,.025,.42,mats.metal,.006);
}
function frameArtTexture(){
 const c=document.createElement('canvas');c.width=768;c.height=432;const g=c.getContext('2d');
 g.fillStyle='#deddd3';g.fillRect(0,0,768,432);g.fillStyle='#aeb9b8';g.fillRect(0,210,768,222);
 for(const [colour,top,offset] of [['#8d9d97',226,32],['#627b77',275,10],['#465e5c',329,24]]){g.fillStyle=colour;g.beginPath();g.moveTo(0,432);g.lineTo(0,top);for(let x=0;x<=768;x+=25)g.lineTo(x,top+Math.sin(x/105+offset)*18+Math.cos(x/62)*6);g.lineTo(768,432);g.closePath();g.fill();}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function buildInterior(){
 windowTreatments();
 // Living: standalone King Living 1978 planning geometry and a single table.
 sofa();
 // A low oval table keeps clear of the chaise and still leaves the TV-side aisle.
 const coffeeTop=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.048,48),mats.black);
 coffeeTop.name='1000 by 600 black coffee-table top, product pending';coffeeTop.scale.set(.60,1,1.00);coffeeTop.position.set(1.92,.365,-7.05);coffeeTop.castShadow=true;interior.add(coffeeTop);
 box('coffee table slim central pedestal',1.92,7.05,.035,.18,.42,.305,mats.black,.04);
 box('coffee table recessed oval foot',1.92,7.05,.018,.46,.66,.026,mats.black,.08);
 box('Samsung The Frame Pro provisional 65 inch bezel',3.12,7.62,.68155,.050,1.4568,.8369,mats.black,.008);
 const art=new THREE.Mesh(new THREE.PlaneGeometry(1.4188,.7989),new THREE.MeshStandardMaterial({map:frameArtTexture(),roughness:.96}));art.name='The Frame Pro Art Mode size pending';art.rotation.y=-Math.PI/2;art.position.set(3.088,1.10,-7.62);interior.add(art);
 // Dining: bench sits beside the Bath 2 wall; table and two chairs face it.
 // Bench against the Bath 2 finished face. Pendant offset is horizontal only.
 const [tx,ty]=DINING.centre;const diningStart=interior.children.length;
 box('dining table 1600 travertine top',tx,ty,.71,.80,1.60,.055,travertineMat,.09);
 for(const y of [ty-.51,ty+.51]){
  box('dining table sculpted black blade pedestal',tx,y,.035,.34,.075,.665,mats.metal,.018);
  box('dining table black pedestal foot',tx,y,.018,.53,.24,.035,mats.metal,.015);
  box('dining table underside support',tx,y,.675,.55,.13,.035,mats.metal,.012);
 }
 box('dining bench light greige upholstered cushion',DINING.benchX,ty,.43,.43,1.55,.095,mats.linen,.048);
 box('dining bench black inset underframe',DINING.benchX,ty,.385,.34,1.44,.040,mats.metal,.014);
 for(const y of [ty-.61,ty+.61])for(const x of [DINING.benchX-.16,DINING.benchX+.16])box('dining bench slim black leg',x,y,.02,.025,.025,.39,mats.metal,.006);
 diningChair('dining chair 1',tx-.46,ty-.37,-1);
 diningChair('dining chair 2',tx-.46,ty+.37,-1);
 // Cabinet module follows the current 2D kitchen / storage drawings.
 cabinetry=createCabinetry({parent:interior,mats,greyAshMat});
 // Master: king headboard at the west partition. The inward room door opens
 // through y=5.35..6.25, so keep the lower bedside wholly north of y=6.35.
 bed(7.50,7.60,1.88,2.05,'master king');rotateNamed('master king',7.50,7.60,-Math.PI/2);
 box('master slim bedside near entry',6.72,6.50,.02,.40,.30,.45,mats.graphite,.045);
 box('master slim bedside near window',6.72,8.72,.02,.40,.30,.45,mats.graphite,.045);
 // Window-facing desk moves the work surface out of the wardrobe door sweep.
 const desk=BEDROOM2.desk,[dx,dy]=desk.centre,[cx,cy]=desk.chairCentre;
 box('B2 1400 x 600 window-facing desk top',dx,dy,.71,desk.length,desk.depth,.045,mats.wood,.016);
 for(const x of [dx-.60,dx+.60])for(const y of [dy-.22,dy+.22])box('B2 desk slim leg',x,y,.02,.025,.025,.69,mats.metal,.004);
 for(const x of [dx-.31,dx+.31]){
  box('B2 window-facing 24 inch monitor display',x,dy+.17,.96,.54,.032,.33,mats.screen,.008);
  box('B2 monitor arm post',x,dy+.265,.755,.018,.018,.36,mats.metal,.004);
  box('B2 monitor support arm',x,dy+.215,1.10,.018,.10,.018,mats.metal,.004);
  box('B2 monitor arm clamp',x,dy+.27,.725,.05,.05,.05,mats.metal,.004);
 }
 box('B2 window-facing office chair seat',cx,cy,.43,.48,.48,.08,mats.graphite,.06);
 box('B2 window-facing office chair back',cx,cy-.23,.52,.47,.07,.56,mats.graphite,.04);
 box('B2 chair centre column',cx,cy,.055,.045,.045,.385,mats.metal,.012);
 for(let i=0;i<5;i++){
  const angle=i*Math.PI*2/5,arm=box('B2 chair five-spoke base '+i,cx+.145*Math.cos(angle),cy+.145*Math.sin(angle),.045,.30,.025,.025,mats.metal,.006);
  arm.rotation.y=angle;
  box('B2 chair caster '+i,cx+.29*Math.cos(angle),cy+.29*Math.sin(angle),.020,.050,.035,.035,mats.graphite,.006);
 }
 // The B2 dimension sheet labels 1800 mm solid wall beside an 800 mm door.
 // Keep 360 mm of original wall clear of cabinets from floor to ceiling.
 // Source legend fixes height. Horizontal offsets remain drawing estimates.
 for(const [key,title] of [['socket','entry-wall socket'],['lightSwitch','light switch'],['acSwitch','air-con switch']]){
  const p=BEDROOM2.services[key],x=p.centre[0],y=p.centre[1];
  box('B2 exposed original '+title+' faceplate',x,y,p.height-.043,.086,.014,.086,mats.ceramic,.007);
  if(key==='socket'){
   for(const [ox,oz] of [[0,.018],[-.018,-.012],[.018,-.012]])box('B2 original socket pin opening',x+ox,y+.008,p.height+oz-.005,.008,.003,.010,mats.graphite,.001);
  }else{
   box('B2 original switch rocker',x,y+.009,p.height-.025,.040,.006,.050,mats.lightCab,.002);
  }
 }
 const ls=BEDROOM2.services.leftSocket;
 box('B2 existing left-wall socket faceplate',ls.centre[0],ls.centre[1],ls.height-.043,.014,.086,.086,mats.ceramic,.007);
 box('B3 guest bed frame',6.75,3.22,.02,1.92,.95,.28,mats.wood,.08);
 box('B3 guest mattress',6.75,3.22,.30,1.84,.87,.20,mats.bed,.08);
 box('B3 guest headboard',7.64,3.22,.02,.12,.95,.88,mats.graphite,.05);
 box('B3 guest pillow',7.32,3.22,.51,.34,.52,.10,mats.bed,.06);
 standingCirculator();
 // Yard: the developer plan places the laundry at the Bath 2/service end.
 // The actual-unit photo shows its tap and floor trap there. Keep the stack
 // clear of the AC-ledge opening; put the two litter boxes at the dry end.
 // Final washer clearance and waste routing still need a site measurement.
 box('washing machine at service end',4.52,2.18,.02,.62,.65,.86,mats.lightCab,.035);
 box('stacked dryer at service end',4.52,2.18,.92,.62,.65,.86,mats.lightCab,.035);
 litterBox('dry-end litter box 1',4.45,.52);litterBox('dry-end litter box 2',4.99,.52);
 // Type A plan plus the two ACTUAL unit bathroom photos: door-side wall-hung
 // white basins (no vanity cabinet or mirror cabinet), WCs behind them, and
 // a window-end wet area divided by a full-height tiled service pier.
 box('bath1 wall-hung basin',9.21,4.91,.73,.58,.46,.14,mats.ceramic,.068);
 box('bath2 wall-hung basin',3.61,4.91,.73,.58,.46,.14,mats.ceramic,.068);
 box('bath1 unpowered mirror cabinet',9.395,4.91,1.10,.13,.50,.70,mats.lightCab,.006);
 box('bath2 unpowered mirror cabinet',3.415,4.91,1.10,.13,.50,.70,mats.lightCab,.006);
 const mirrorMat=new THREE.MeshStandardMaterial({color:0xb9c7c7,metalness:.8,roughness:.13});
 box('bath1 mirror face',9.32,4.91,1.12,.009,.46,.66,mirrorMat,.001);
 box('bath2 mirror face',3.49,4.91,1.12,.009,.46,.66,mirrorMat,.001);
 box('bath1 basin drain',9.19,4.91,.873,.05,.05,.003,mats.metal,.002);
 box('bath2 basin drain',3.63,4.91,.873,.05,.05,.003,mats.metal,.002);
 box('bath1 basin tap',9.41,4.91,.88,.04,.045,.12,mats.metal,.006);
 box('bath2 basin tap',3.41,4.91,.88,.04,.045,.12,mats.metal,.006);
 box('bath1 WC tank',9.41,4.02,.02,.23,.42,.72,mats.ceramic,.055);
 box('bath1 WC pan',9.10,4.02,.02,.55,.43,.42,mats.ceramic,.16);
 box('bath2 WC tank',3.39,4.02,.02,.23,.42,.72,mats.ceramic,.055);
 box('bath2 WC pan',3.70,4.02,.02,.55,.43,.42,mats.ceramic,.16);
 const bathPierTile=new THREE.MeshStandardMaterial({color:0x646b6d,roughness:.81});
 const bathroomWallTexture=tileTexture('bath');bathroomWallTexture.repeat.set(3,4);
 const bathroomWallTile=new THREE.MeshStandardMaterial({map:bathroomWallTexture,roughness:.84});
 for(const side of [
  ['bath2 west',3.335],['bath2 east',4.685],['bath1 west',7.910],['bath1 east',9.480]
 ])box(`${side[0]} dark grey tiled wall`,side[1],3.90,.02,.012,2.40,2.36,bathroomWallTile,.001);
 for(const segment of [
  ['bath2 south west',3.74,.82],['bath2 south east',4.72,.08],
  ['bath1 south west',7.99,.18],['bath1 south east',9.06,.86]
 ])box(`${segment[0]} dark grey tiled wall`,segment[1],2.692,.02,segment[2],.012,2.36,bathroomWallTile,.001);
 for(const [name,x] of [['bath2',4.425],['bath1',8.355]]){
  box(`${name} dark tile below window`,x,2.692,.02,.55,.012,1.55,bathroomWallTile,.001);
  box(`${name} dark tile above window`,x,2.692,2.15,.55,.012,.22,bathroomWallTile,.001);
 }
 for(const s of [
  {name:'bath1',pierX:9.37,fixtureX:9.18,drainX:8.75},
  {name:'bath2',pierX:3.45,fixtureX:3.64,drainX:4.07}
 ]){
  box(`${s.name} tiled service pier`,s.pierX,3.08,.02,.34,.88,2.72,bathPierTile,.005);
  box(`${s.name} shower mixer`,s.fixtureX,3.18,1.08,.022,.12,.18,mats.metal,.006);
  box(`${s.name} shower riser`,s.fixtureX,3.18,1.30,.018,.018,.77,mats.metal,.004);
  box(`${s.name} shower head`,s.fixtureX,3.18,2.06,.22,.075,.025,mats.metal,.009);
  box(`${s.name} shower drain`,s.drainX,2.82,.021,.20,.02,.008,mats.metal,.002);
 }
}
function buildContactShadows(){
 // Broad area light needs subtle contact grounding even without a costly
 // real-time GI/SSAO pass. These soft footprints do not invent hard sun beams.
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 const radial=g.createRadialGradient(64,64,12,64,64,64);radial.addColorStop(0,'rgba(0,0,0,.34)');radial.addColorStop(.55,'rgba(0,0,0,.19)');radial.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=radial;g.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,toneMapped:false});
 const [dx,dy]=DINING.centre;
 const footprints=[
  [.72,7.11,1.12,1.70],[1.03,8.43,1.74,1.10],[1.92,7.05,.42,.65],[2.95,7.62,.58,2.28],
  [dx,dy-.51,.58,.29],[dx,dy+.51,.58,.29],[dx-.46,dy-.37,.62,.62],[dx-.46,dy+.37,.62,.62],[DINING.benchX,dy,.52,1.65],
  [.44,5.75,.38,.38],[2.506,2.139,1.46,.89],[3.0075,.46,2.15,.70],
  [7.50,7.60,2.12,1.95],[6.75,3.22,1.99,1.02]
 ];
 const shadows=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,footprints.length),transform=new THREE.Object3D();shadows.name='soft furniture contact shadows';
 for(const [i,[x,y,w,d]] of footprints.entries()){transform.position.set(x,.023,-y);transform.rotation.set(-Math.PI/2,0,0);transform.scale.set(w,d,1);transform.updateMatrix();shadows.setMatrixAt(i,transform.matrix);}
 shadows.instanceMatrix.needsUpdate=true;shadows.renderOrder=2;interior.add(shadows);
}
function batchStatic(root){
 root.updateMatrixWorld(true);const batches=new Map();
 root.traverse(m=>{if(!m.isMesh||m.userData.cabinetPart||m.isReflector||!m.visible||Array.isArray(m.material)||m.material.transparent)return;
  const key=m.material.uuid+'-'+m.castShadow+'-'+m.receiveShadow;
  if(!batches.has(key))batches.set(key,{mat:m.material,geos:[],meshes:[],cast:m.castShadow,receive:m.receiveShadow});
  const b=batches.get(key),g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);b.geos.push(g);b.meshes.push(m);
 });
 for(const b of batches.values()){
  const result=new THREE.BufferGeometry();
  for(const attr of ['position','normal','uv']){if(!b.geos.every(g=>g.getAttribute(attr)))continue;const size=b.geos[0].getAttribute(attr).itemSize,total=b.geos.reduce((n,g)=>n+g.getAttribute(attr).array.length,0),values=new Float32Array(total);let i=0;for(const g of b.geos){values.set(g.getAttribute(attr).array,i);i+=g.getAttribute(attr).array.length;}result.setAttribute(attr,new THREE.BufferAttribute(values,size));}
  result.computeBoundingSphere();const mesh=new THREE.Mesh(result,b.mat);mesh.name=root===model?'wall/shell static batch':'furniture static batch';mesh.castShadow=b.cast;mesh.receiveShadow=b.receive;root.add(mesh);for(const m of b.meshes)m.visible=false;for(const g of b.geos)g.dispose();
 }
}
const skirtingPieces=[];
function buildSkirting(){
 // 75 × 12 mm indicated developer profile. Dry-side runs only; leave doors
 // and the tiled bathrooms clear. The finish is the same material as frames.
 const xRun=(a,b,y)=>{if(b<=a)return;const m=new THREE.Mesh(new THREE.BoxGeometry(b-a,.075,.012),doorTrimMat);m.name='matching door-frame white skirting';m.position.set((a+b)/2,.0555,-y);m.receiveShadow=true;model.add(m);skirtingPieces.push(m)};
 const yRun=(x,a,b)=>{if(b<=a)return;const m=new THREE.Mesh(new THREE.BoxGeometry(.012,.075,b-a),doorTrimMat);m.name='matching door-frame white skirting';m.position.set(x,.0555,-(a+b)/2);m.receiveShadow=true;model.add(m);skirtingPieces.push(m)};
 yRun(.176,1.086,8.964);xRun(.176,3.159,8.964);yRun(3.159,6.353,8.964);yRun(3.159,2.60,5.20);
 xRun(1.07,1.709,1.086);yRun(1.709,.166,1.00);xRun(1.881,3.954,.166);
 for(const [a,b] of [[.166,.32],[.92,1.10],[1.80,2.514]])yRun(3.954,a,b);
 for(const [a,b] of [[3.245,BEDROOM2.entry.doorStart],[BEDROOM2.entry.doorEnd,6.29]]){xRun(a,b,6.267);xRun(a,b,6.439);}
 for(const [a,b] of [[3.245,4.025],[4.775,4.955],[5.855,6.29]])xRun(a,b,5.286);
 yRun(3.331,6.439,8.964);xRun(3.331,6.204,8.964);yRun(6.204,6.439,8.964);
 yRun(6.376,6.25,8.964);yRun(6.376,5.286,5.35);xRun(6.376,9.484,5.286);yRun(9.484,5.286,8.964);xRun(6.376,9.484,8.964);
 yRun(4.861,2.686,5.114);yRun(7.734,2.686,5.114);xRun(4.861,7.734,2.686);
 for(const [a,b] of [[4.861,4.955],[5.855,7.734]])xRun(a,b,5.114);
}
buildShell();buildSurfaces();buildInterior();buildSkirting();buildContactShadows();batchStatic(model);batchStatic(interior);fitWholeHome();
// Keep equipment separate from furniture and roofs: visible in Overview,
// and retained when the furniture toggle is off. No fabricated pipe routes.
const airConGroup=new THREE.Group();airConGroup.name='Four doorway-side air conditioners';scene.add(airConGroup);
const acWhite=new THREE.MeshStandardMaterial({color:0xf1f2ef,roughness:.6});
const acVent=new THREE.MeshStandardMaterial({color:0x30383b,roughness:.85});
const acSeam=new THREE.MeshStandardMaterial({color:0xb5bcb9,roughness:.85});
for(const a of AIR_CONDITIONERS){
 const unit=new THREE.Group();unit.name=a.name+' indoor unit';unit.position.set(a.wallCentre[0],a.centreHeight,-a.wallCentre[1]);unit.rotation.y=a.rotation;unit.userData=a;airConGroup.add(unit);
 const part=(name,w,h,d,x,y,z,mat,r=.006)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,h/2,d/2)),mat);m.name=a.name+' '+name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;unit.add(m);return m;};
 const front=.08+a.depth;
 part('rounded white casing',a.width,a.height,a.depth,0,0,.08+a.depth/2,acWhite,.018);
 part('panel seam',a.width-.045,.006,.004,0,-.052,front+.002,acSeam,.001);
 part('outlet opening',a.width-.10,.042,.018,0,-a.height/2+.047,front-.007,acVent,.004);
 part('angled outlet louvre',a.width-.11,.015,.046,0,-a.height/2+.032,front+.006,acWhite,.002).rotation.x=-.30;
 part('unlit status window',.035,.012,.004,a.width/2-.073,-.035,front+.004,acVent,.002);
}
batchStatic(airConGroup);
// A single accepted design. No alternative ceilings or hidden legacy circuits.
// Explicit linear input avoids treating linear light energy as an sRGB swatch.
const LIGHT_3500K=new THREE.Color().setRGB(...LIGHT_COLOUR.variants['3500'].linearRGB,THREE.LinearSRGBColorSpace);
const LIGHT_3000K=new THREE.Color().setRGB(...LIGHT_COLOUR.variants['3000'].linearRGB,THREE.LinearSRGBColorSpace);
const LIGHT_4000K=new THREE.Color().setRGB(...LIGHT_COLOUR.variants['4000'].linearRGB,THREE.LinearSRGBColorSpace);
const temperatureColours={3000:LIGHT_3000K,3500:LIGHT_3500K,4000:LIGHT_4000K};
let commonKelvin=3500;
const colourForRoom=room=>COMMON_LIGHT_ROOMS.has(room)?temperatureColours[commonKelvin]:LIGHT_3500K;
const reflectedLight=new THREE.HemisphereLight(LIGHT_3500K,LIGHT_3500K,0);scene.add(reflectedLight);
const viewingWhiteBalance={value:new THREE.Matrix3()};
let viewingIlluminantRGB=[1,1,1],adaptationDegree=0;
let bounceBudget={maxIrradiance:3.6,totals:Array(8).fill(0),scales:Array(8).fill(1)};

const windowDaylight=createWindowDaylight(scene);
const tileReflection=createTileReflection(scene,isMobile);
const daylightFabrics=new Map();
interior.traverse(m=>{if(m.isMesh&&/white sheer|linen-look dimout fabric/.test(m.name))daylightFabrics.set(m.material,/dimout/.test(m.name)?.36:.65)});
const indoorCeiling=new THREE.Group();indoorCeiling.name='Original ceilings and retained existing plaster';indoorCeiling.visible=false;scene.add(indoorCeiling);
const ceilingMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide});
function ceilingPlane(name,outline,bottom,holes=[]){
 const shape=new THREE.Shape();shape.moveTo(...outline[0]);for(const p of outline.slice(1))shape.lineTo(...p);shape.closePath();
 for(const f of holes){const h=new THREE.Path();h.absarc(...f.centre,f.diameter/2,0,2*Math.PI,true);shape.holes.push(h)}
 const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,curveSegments:16}),ceilingMat);
 m.name=name;m.rotation.x=-Math.PI/2;m.position.y=bottom;m.receiveShadow=true;indoorCeiling.add(m);
}
ceilingPlane('Original common-area slab',[[.09,1],[1.795,1],[1.795,.08],[4.04,.08],[4.04,2.60],[3.245,2.60],[3.245,9.05],[.09,9.05]],2.85);
ceilingPlane('Original foyer slab',[[.09,.08],[1.795,.08],[1.795,1],[.09,1]],2.85);
ceilingPlane('Original master slab',[[6.29,5.20],[9.57,5.20],[9.57,9.05],[6.29,9.05]],2.85);
ceilingPlane('Original bedroom 2 slab',[[3.245,6.353],[6.29,6.353],[6.29,9.05],[3.245,9.05]],2.85);
ceilingPlane('Original bedroom 3 slab',[[4.775,2.60],[7.82,2.60],[7.82,5.20],[4.775,5.20]],2.85);
ceilingPlane('Retained lowered hallway plaster',HALL_CEILING.outline,HALL_CEILING.bottom,FIXTURES.filter(f=>f.room==='走道'));
// Close the exposed drop at the living entrance; there is no floating sheet.
const hallFascia=new THREE.Mesh(new THREE.BoxGeometry(.035,HALL_CEILING.slab-HALL_CEILING.bottom,1.153),ceilingMat);
hallFascia.name='Existing hallway plaster drop fascia';hallFascia.position.set(3.245,(HALL_CEILING.slab+HALL_CEILING.bottom)/2,-5.7765);hallFascia.castShadow=true;hallFascia.receiveShadow=true;indoorCeiling.add(hallFascia);
for(const [room,x1,x2] of [['Bath 2',3.245,4.775],['Bath 1',7.82,9.57]])ceilingPlane(room+' retained plaster with two openings',[[x1,2.60],[x2,2.60],[x2,5.20],[x1,5.20]],HALL_CEILING.bottom,FIXTURES.filter(f=>f.room===room));
ceilingPlane('Original yard slab',[[4.04,.08],[5.37,.08],[5.37,2.60],[4.04,2.60]],2.85);
// Solid finish samples on actual wall runs, cut down to keep the interior clear.
// Original full-height shell stays translucent behind these in Overview.
const overviewFinishWalls=new THREE.Group();overviewFinishWalls.name='Summer Snow cutaway walls';overviewFinishWalls.visible=false;scene.add(overviewFinishWalls);
const overviewWallMat=new THREE.MeshStandardMaterial({color:0xe5e2d8,roughness:.94});
for(const [name,x,y,w,d,h] of [
 ['Living sofa wall',.09,5.025,.16,8.05,1.10],
 ['Living TV wall',3.245,7.7015,.16,2.697,1.10],
 ['Bedroom 2 / master partition',6.29,7.7015,.16,2.697,1.10],
 ['Bedroom 3 west wall',4.775,3.90,.16,2.60,1.10],
 ['Master outer side wall',9.57,7.125,.16,3.85,1.10],
 ['Living window sill wall',1.6675,9.05,3.155,.16,.70],
 ['Bedroom 2 window sill wall',4.7675,9.05,3.045,.16,.70],
 ['Master window sill wall',7.93,9.05,3.28,.16,.70]
]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),overviewWallMat);m.name=name+' · Summer Snow 1928';m.position.set(x,h/2,-y);m.castShadow=true;m.receiveShadow=true;overviewFinishWalls.add(m);}
const fixturesGroup=new THREE.Group();fixturesGroup.name='Current agreed fixtures';scene.add(fixturesGroup);
const lightCircuits=[];
const fixtureShellMat=new THREE.MeshStandardMaterial({color:0xf3f3ef,roughness:.9});
const diffuserOnMat=new THREE.MeshBasicMaterial({color:LIGHT_3500K});
const diffuser3000Mat=new THREE.MeshBasicMaterial({color:LIGHT_3000K});
const diffuser4000Mat=new THREE.MeshBasicMaterial({color:LIGHT_4000K});
const diffuserMaterials={3000:diffuser3000Mat,3500:diffuserOnMat,4000:diffuser4000Mat};
for(const mat of Object.values(diffuserMaterials))mat.color.multiplyScalar(1.5);
const diffuserOffMat=new THREE.MeshStandardMaterial({color:0xd7d7d2,roughness:.96});
const trackBlack=new THREE.MeshStandardMaterial({color:0x202526,roughness:.72});
const trackWhite=new THREE.MeshStandardMaterial({color:0xf3f2ed,roughness:.9});
const recessedCup=new THREE.MeshStandardMaterial({color:0x292d2e,roughness:1,side:THREE.DoubleSide});
function segmentMesh(a,b,r,mat){
 const direction=b.clone().sub(a),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,direction.length(),10),mat);
 m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return m;
}
function areaLamp(c,x,y,h,width,depth,power){
 const lamp=new THREE.RectAreaLight(LIGHT_3500K,power,width,depth);lamp.position.set(x,h,-y);lamp.rotation.x=-Math.PI/2;lamp.visible=false;c.lights.push(lamp);return lamp;
}
function spotLamp(c,x,y,h,aimX,aimY,aimH,power,angle){
 const lamp=new THREE.SpotLight(LIGHT_3500K,power,5,angle,.9,2);lamp.position.set(x,h,-y);lamp.target.position.set(aimX,aimH,-aimY);lamp.visible=false;c.lights.push(lamp);return lamp;
}
function addLens(c,mesh){c.lenses.push(mesh);c.group.add(mesh);return mesh}
for(const f of FIXTURES){
 const c={...f,on:true,lights:[],lenses:[],group:new THREE.Group()};c.group.name=f.name;c.group.userData={id:f.id,status:f.status};fixturesGroup.add(c.group);lightCircuits.push(c);
 const [x,y]=f.centre,roof=['走道','Bath 1','Bath 2'].includes(f.room)?HALL_CEILING.bottom:2.85;
 const disc=(r,h,mat)=>new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat);
 if(f.kind==='ceiling'){
  const shell=disc(f.diameter/2,.040,fixtureShellMat);shell.position.set(x,roof-.024,-y);c.group.add(shell);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(f.diameter*.45,32),diffuserOffMat);lens.rotation.x=Math.PI/2;lens.position.set(x,roof-.046,-y);addLens(c,lens);
  areaLamp(c,x,y,roof-.054,f.diameter*.90,f.diameter*.90,f.room==='Yard'?550:f.diameter>.4?1100:850);
 }else if(f.kind==='recessed'||f.kind==='mirrorSpot'){
  const trim=new THREE.Mesh(new THREE.RingGeometry(f.diameter*.43,f.diameter*.55,28),fixtureShellMat);trim.rotation.x=Math.PI/2;trim.position.set(x,roof-.001,-y);c.group.add(trim);
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(f.diameter*.43,f.diameter*.29,.058,28,1,true),recessedCup);cup.position.set(x,roof+.025,-y);c.group.add(cup);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(f.diameter*.28,28),diffuserOffMat);lens.rotation.x=Math.PI/2;lens.position.set(x,roof+.045,-y);addLens(c,lens);
  if(f.kind==='mirrorSpot')spotLamp(c,x,y,roof+.040,f.aim[0],f.aim[1],1.25,80,.48);
  else spotLamp(c,x,y,roof+.040,x,y,.20,140,.66);
 }else if(f.kind==='track'){
  const finish=f.white?trackWhite:trackBlack;
  for(let i=1;i<f.route.length;i++){const [ax,ay]=f.route[i-1],[bx,by]=f.route[i],length=Math.hypot(bx-ax,by-ay);const rail=new THREE.Mesh(new THREE.BoxGeometry(.036,.027,length),finish);rail.position.set((ax+bx)/2,roof-.015,-(ay+by)/2);rail.rotation.y=Math.atan2(bx-ax,-(by-ay));c.group.add(rail)}
  for(const [i,p] of f.heads.entries()){
   if(f.id==='B2-TRACK'){
    // Broad opal diffuser modules, not swivel spot heads. Their light exits
    // downwards from the whole face; there is no conical spotlight target.
    const housing=new THREE.Mesh(new RoundedBoxGeometry(.30,.045,.085,2,.008),finish);
    housing.position.set(p[0],roof-.049,-p[1]);c.group.add(housing);
    const lens=new THREE.Mesh(new THREE.PlaneGeometry(.28,.065),diffuserOffMat);
    lens.rotation.x=Math.PI/2;lens.position.set(p[0],roof-.073,-p[1]);addLens(c,lens);
    areaLamp(c,p[0],p[1],roof-.075,.28,.065,2200);
    continue;
   }
   const origin=new THREE.Vector3(p[0],roof-.10,-p[1]);
   const aim=f.id==='L-L1'||f.id==='K-L2'?f.aims[i]:[p[0],7.45,.72];
   const direction=new THREE.Vector3(aim[0],aim[2],-aim[1]).sub(origin).normalize();
   const mount=new THREE.Mesh(new THREE.BoxGeometry(.042,.038,.060),finish);mount.position.set(p[0],roof-.045,-p[1]);c.group.add(mount);
   const head=new THREE.Group();head.position.copy(origin);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),direction);c.group.add(head);
   const body=disc(f.white?.044:.037,.082,finish);head.add(body);
   const baffle=new THREE.Mesh(new THREE.CylinderGeometry(.031,.028,.025,24,1,true),recessedCup);baffle.position.y=-.038;head.add(baffle);
   const lens=new THREE.Mesh(new THREE.CircleGeometry(.028,24),diffuserOffMat);lens.rotation.x=Math.PI/2;lens.position.y=-.036;head.add(lens);c.lenses.push(lens);
   const emitter=origin.clone().addScaledVector(direction,.045);
   spotLamp(c,emitter.x,-emitter.z,emitter.y,...aim,f.white?120:95,f.white?.78:.54);
  }
  if(f.id==='B2-TRACK')c.group.userData.provisional=true;
 }else if(f.kind==='pendant'){
  const [sx,sy]=sourceModel(f.id),shadeY=1.65;
  const canopy=disc(.09,.028,trackBlack);canopy.position.set(sx,roof-.014,-sy);c.group.add(canopy);
  c.group.add(segmentMesh(new THREE.Vector3(sx,roof-.037,-sy),new THREE.Vector3(x,roof-.037,-y),.009,trackBlack));
  const support=disc(.027,.025,trackBlack);support.position.set(x,roof-.03,-y);c.group.add(support);
  c.group.add(segmentMesh(new THREE.Vector3(x,roof-.048,-y),new THREE.Vector3(x,shadeY+.065,-y),.003,trackBlack));
  const shade=disc(f.diameter/2,.095,trackBlack);shade.position.set(x,shadeY,-y);c.group.add(shade);
  const lower=new THREE.Mesh(new THREE.CircleGeometry(f.diameter*.43,32),diffuserOffMat);lower.rotation.x=Math.PI/2;lower.position.set(x,shadeY-.049,-y);addLens(c,lower);
  const upper=new THREE.Mesh(new THREE.CircleGeometry(f.diameter*.41,32),diffuserOffMat);upper.rotation.x=-Math.PI/2;upper.position.set(x,shadeY+.049,-y);addLens(c,upper);
  areaLamp(c,x,y,shadeY-.052,f.diameter*.8,f.diameter*.8,160);
  const uplight=new THREE.RectAreaLight(LIGHT_3500K,220,.31,.31);uplight.position.set(x,shadeY+.06,-y);uplight.rotation.x=Math.PI/2;uplight.visible=false;c.lights.push(uplight);
 }else if(f.kind==='strip'){
  const profile=new THREE.Mesh(new THREE.BoxGeometry(.68,.018,.028),trackWhite);profile.position.set(x,1.442,-y);c.group.add(profile);
  const lens=new THREE.Mesh(new THREE.BoxGeometry(.65,.006,.020),diffuserOffMat);lens.position.set(x,1.430,-y);addLens(c,lens);
  areaLamp(c,x,y,1.425,.65,.07,300);
 }else if(f.kind==='floorLamp'){
  const foot=disc(.15,.025,trackBlack);foot.position.set(x,.035,-y);c.group.add(foot);
  c.group.add(segmentMesh(new THREE.Vector3(x,.045,-y),new THREE.Vector3(x,1.44,-y),.015,trackBlack));
  const fabric=new THREE.Mesh(new THREE.CylinderGeometry(.22,.23,.27,40,1,true),new THREE.MeshStandardMaterial({color:0xbdb9af,roughness:1,side:THREE.DoubleSide}));fabric.position.set(x,1.50,-y);c.group.add(fabric);c.shade=fabric;
  c.shadeOn=new THREE.MeshStandardMaterial({color:0xc8c3b8,roughness:1,side:THREE.DoubleSide,emissive:LIGHT_3500K,emissiveIntensity:.16});c.shadeOff=fabric.material;
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.205,32),diffuserOffMat);lens.rotation.x=Math.PI/2;lens.position.set(x,1.363,-y);addLens(c,lens);
  areaLamp(c,x,y,1.35,.37,.37,100);
  const up=new THREE.RectAreaLight(LIGHT_3500K,100,.37,.37);up.position.set(x,1.64,-y);up.rotation.x=Math.PI/2;c.lights.push(up);
 }
}
for(const c of lightCircuits)for(const lamp of c.lights)lamp.userData.room=c.room;
const fanGroups=[];
for(const f of FANS){
 const group=new THREE.Group();group.name=f.label;group.userData={id:f.id,diameter:f.diameter,status:f.status};group.position.set(f.centre[0],0,-f.centre[1]);scene.add(group);fanGroups.push(group);
 const finish=new THREE.MeshStandardMaterial({color:f.room==='客厅'?0x252b2c:0xf0efea,roughness:.8});
 const canopy=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.034,28),finish);canopy.position.y=2.825;group.add(canopy);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.19,12),finish);stem.position.y=2.715;group.add(stem);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.075,.088,.080,28),finish);hub.position.y=2.600;group.add(hub);
 const radius=f.diameter/2,length=radius-.073;
 for(let i=0;i<3;i++){const arm=new THREE.Group();arm.rotation.y=i*Math.PI*2/3;group.add(arm);const blade=new THREE.Mesh(new RoundedBoxGeometry(length,.018,.10,2,.007),finish);blade.position.set(.073+length/2,2.567,0);arm.add(blade)}
 // Static blades show placement without inventing a running fan / flicker test.
}
// Fixed-size light pools avoid shader recompilation each time a room or
// switch changes. Invisible rooms use no slots; every circuit retains its
// individual state and physical lens. This is an interactive lighting proxy.
const areaPool=Array.from({length:7},()=>{const l=new THREE.RectAreaLight(LIGHT_3500K,0,.1,.1);scene.add(l);return l});
const spotPool=Array.from({length:11},()=>{const l=new THREE.SpotLight(LIGHT_3500K,0,5,.66,.9,2);l.castShadow=true;l.shadow.mapSize.set(512,512);l.shadow.bias=-.00015;l.shadow.normalBias=.018;scene.add(l,l.target);return l});
// Daytime preview dims electric fittings only; source CCT and night output stay fixed.
function electricPreviewScale(){return daylight?.60:1}
function updateLightPool(){
 const areas=lightCircuits.flatMap(c=>c.lights.filter(l=>l.visible&&l.isRectAreaLight)),spots=lightCircuits.flatMap(c=>c.lights.filter(l=>l.visible&&l.isSpotLight));
 areaPool.forEach((l,i)=>{const a=areas[i];l.intensity=inside&&a?a.intensity*.12*electricPreviewScale():0;if(a){l.color.copy(colourForRoom(a.userData.room));l.position.copy(a.position);l.quaternion.copy(a.quaternion);l.width=a.width;l.height=a.height;}});
 spotPool.forEach((l,i)=>{const a=spots[i];l.intensity=inside&&a?a.intensity*.12*electricPreviewScale():0;if(a){l.color.copy(colourForRoom(a.userData.room));l.position.copy(a.position);l.target.position.copy(a.target.position);l.angle=a.angle;l.penumbra=a.penumbra;l.distance=a.distance;l.decay=a.decay;}});
}
function circuitActive(){return true}
function syncLights(){
 const neighbours={common:['客厅','餐厅'],foyer:['玄关'],entry:['玄关','厨房','餐厅'],living:['客厅','餐厅'],dining:['餐厅','客厅','厨房'],kitchen:['厨房','玄关','餐厅'],prep:['厨房','餐厅'],yard:['Yard','厨房'],ledge:['Yard'],hall:['走道'],master:['主人房'],b2:['B2'],b3:['B3'],bath1:['Bath 1'],bath2:['Bath 2']};
 const rooms=new Set(['common','foyer','entry','living','dining','kitchen','prep','hall'].includes(currentInsideRoom)?['玄关','客厅','餐厅','厨房','走道']:neighbours[currentInsideRoom]||['客厅','餐厅']);
 for(const c of lightCircuits){c.group.visible=true;for(const lamp of c.lights)lamp.visible=inside&&c.on&&rooms.has(c.room);for(const lens of c.lenses)lens.material=c.on?(COMMON_LIGHT_ROOMS.has(c.room)?diffuserMaterials[commonKelvin]:diffuserOnMat):diffuserOffMat;if(c.shade){c.shadeOn.emissive.copy(colourForRoom(c.room));c.shade.material=c.on?c.shadeOn:c.shadeOff;}}
 updateLightPool();renderer.shadowMap.needsUpdate=true;
 if(inside)syncEnvironment();
}

const COMMON_LIGHT_ROOMS=new Set(['玄关','客厅','餐厅','厨房','走道']);
const lightScopeFor=room=>COMMON_LIGHT_ROOMS.has(room)||room==='全屋'?'common':room;
const inLightScope=(c,scope)=>scope==='common'?COMMON_LIGHT_ROOMS.has(c.room):c.room===scope;
function renderLightSwitches(){
 const quick=document.querySelector('#quickLightSwitches'),more=document.querySelector('#lightSwitches');
 quick.replaceChildren();more.replaceChildren();
 const selected=document.querySelector('#lightRoomSelect').value||'common';
 const common=selected==='common';
 document.querySelector('#temperatureCompare').hidden=!common;
 document.querySelector('#lightPanel').classList.toggle('common-lights',common);
 document.querySelector('#lightsAllOn').textContent=common?'Area on':'Room on';document.querySelector('#lightsAllOff').textContent=common?'Area off':'Room off';
 const circuits=lightCircuits.filter(c=>inLightScope(c,selected)&&circuitActive(c));
 const makeRow=(c,compact)=>{
  const row=document.createElement('div');row.className='light-row'+(compact?' compact':'');
  const toggle=document.createElement('button');toggle.type='button';toggle.className='light-switch'+(c.on?' on':'');toggle.setAttribute('aria-pressed',String(c.on));
  const label=document.createElement('span');label.className='fixture-name';label.textContent=c.name+(c.id==='B2-TRACK'?' · position pending':'');
  const state=document.createElement('span');state.className='light-state';state.textContent=c.on?'ON':'OFF';
  toggle.append(label,state);toggle.onclick=()=>{c.on=!c.on;syncLights();renderLightSwitches()};
  const pin=document.createElement('button');pin.type='button';pin.className='light-pin'+(quickLightIds.has(c.id)?' pinned':'');pin.textContent=quickLightIds.has(c.id)?'★':'☆';pin.setAttribute('aria-label',`${quickLightIds.has(c.id)?'Remove':'Add'} ${c.name} ${quickLightIds.has(c.id)?'from':'to'} quick controls`);pin.setAttribute('aria-pressed',String(quickLightIds.has(c.id)));
  pin.onclick=()=>{quickLightIds.has(c.id)?quickLightIds.delete(c.id):quickLightIds.add(c.id);try{localStorage.setItem(QUICK_LIGHTS_KEY,JSON.stringify([...quickLightIds]))}catch{}renderLightSwitches()};
  row.append(toggle);if(!common)row.append(pin);
  if(!compact){const meta=fixtureMeta(c),detail=document.createElement('small');detail.className='fixture-meta';detail.textContent=`${c.id} · ${meta?.size||'Size pending'} · ${meta?`X ${Math.round(meta.x*1000)} / Y ${Math.round(meta.y*1000)} mm`:'Position to measure'}`;row.append(detail)}
  return row;
 };
 for(const c of circuits)(common||quickLightIds.has(c.id)?quick:more).append(makeRow(c,common||quickLightIds.has(c.id)));
 if(!quick.children.length){const empty=document.createElement('p');empty.className='light-empty';empty.textContent=circuits.length?'Pin a light from More below.':'No lighting circuit in this space.';quick.append(empty)}
 if(!more.children.length){const empty=document.createElement('p');empty.className='light-empty';empty.textContent='All room lights are in quick controls.';more.append(empty)}
}
const QUICK_LIGHTS_KEY='serina-quick-lights-current-20261012-r2';
const DEFAULT_QUICK_LIGHTS=FIXTURES.map(f=>f.id);
let savedQuickLights;try{savedQuickLights=JSON.parse(localStorage.getItem(QUICK_LIGHTS_KEY))}catch{}
const quickLightIds=new Set(Array.isArray(savedQuickLights)?savedQuickLights:DEFAULT_QUICK_LIGHTS);
const lightPanel=document.querySelector('#lightPanel'),lightPanelToggle=document.querySelector('#lightPanelToggle');
function setLightPanelOpen(open){lightPanel.hidden=!open;lightPanelToggle.setAttribute('aria-expanded',String(open));if(open){closeDrawer();renderLightSwitches()}}
lightPanelToggle.onclick=()=>setLightPanelOpen(lightPanel.hidden);
document.querySelector('#lightPanelClose').onclick=()=>setLightPanelOpen(false);
document.querySelector('#lightsAllOn').onclick=()=>{lightCircuits.filter(c=>circuitActive(c)&&inLightScope(c,lightRoomSelect.value)).forEach(c=>c.on=true);syncLights();renderLightSwitches()};
document.querySelector('#lightsAllOff').onclick=()=>{lightCircuits.filter(c=>circuitActive(c)&&inLightScope(c,lightRoomSelect.value)).forEach(c=>c.on=false);syncLights();renderLightSwitches()};
for(const [id,on] of [['houseLightsOn',true],['houseLightsOff',false]])document.querySelector('#'+id).onclick=()=>{lightCircuits.forEach(c=>c.on=on);syncLights();renderLightSwitches()};
for(const p of points){if(['socket','data','fixed'].includes(p.type))p.status='Plan indication · verify on site'}
for(const p of points){const geo=new THREE.SphereGeometry(p.type==='fan'?.105:.085,20,20); const mat=new THREE.MeshStandardMaterial({color:p.status==='Unused'?0x87978c:TYPES[p.type].color,emissive:p.status==='Unused'?0x87978c:TYPES[p.type].color,emissiveIntensity:p.status==='Unused'?.08:.65,roughness:.65}); const m=new THREE.Mesh(geo,mat); m.position.set(...p.pos); m.userData=p; markerGroup.add(m); markerMeshes.push(m); const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.15,32),new THREE.MeshBasicMaterial({color:TYPES[p.type].color,transparent:true,opacity:.48,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.copy(m.position); ring.position.y-=.002; markerGroup.add(ring); m.userData.ring=ring;}
let activeRoom='全屋';
const roomSelect=document.querySelector('#roomSelect');
const drawerRoomSelect=document.querySelector('#drawerRoomSelect');
const lightRoomSelect=document.querySelector('#lightRoomSelect');
ROOMS.forEach(r=>{for(const select of [roomSelect,drawerRoomSelect]){const option=document.createElement('option');option.value=r;option.textContent=ROOM_LABELS[r]||r;select.append(option)}});
for(const r of ['common',...ROOMS.filter(r=>r!=='全屋'&&!COMMON_LIGHT_ROOMS.has(r))]){const option=document.createElement('option');option.value=r;option.textContent=r==='common'?'Common area':ROOM_LABELS[r]||r;lightRoomSelect.append(option)}
roomSelect.value=drawerRoomSelect.value=activeRoom;lightRoomSelect.value='common';renderLightSwitches();
function selectRoom(room){activeRoom=room;roomSelect.value=drawerRoomSelect.value=room;lightRoomSelect.value=lightScopeFor(room);applyFilters();if(inside){if(room==='全屋')setOverview(true);const key={'玄关':'entry','客厅':'living','餐厅':'dining','厨房':'kitchen','Yard':'yard','走道':'hall','主人房':'master','B2':'b2','B3':'b3','Bath 1':'bath1','Bath 2':'bath2','AC Ledge':'ledge'}[activeRoom];if(key)indoorPlace(key)}else focusRoom(activeRoom);renderPointRegister();renderMeasurements();renderLightSwitches()}
roomSelect.onchange=()=>selectRoom(roomSelect.value);
drawerRoomSelect.onchange=()=>selectRoom(drawerRoomSelect.value);
lightRoomSelect.onchange=()=>{if(lightRoomSelect.value==='common'){renderLightSwitches()}else selectRoom(lightRoomSelect.value)};
const activeTypes=new Set(); const typeFilters=document.querySelector('#typeFilters'); Object.entries(TYPES).forEach(([k,v])=>{const b=document.createElement('button');b.className=activeTypes.has(k)?'active':'';b.setAttribute('aria-pressed',String(activeTypes.has(k)));b.innerHTML=`<i class="mini" style="background:#${v.color.toString(16).padStart(6,'0')}"></i>${v.label}`;b.onclick=()=>{activeTypes.has(k)?activeTypes.delete(k):activeTypes.add(k);b.classList.toggle('active');b.setAttribute('aria-pressed',String(activeTypes.has(k)));applyFilters()};typeFilters.append(b)});
function applyFilters(){for(const m of markerMeshes){const on=(activeRoom==='全屋'||m.userData.room===activeRoom)&&activeTypes.has(m.userData.type);m.visible=on;m.userData.ring.visible=on}}
applyFilters();
function topHeight(width,depth){const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));return Math.max(7,(width+1.0)/(2*tan*camera.aspect),(depth+1.0)/(2*tan))}
function fitWholeHome(){const x=4.83,y=4.57;controls.target.set(x,0,-y);camera.position.set(x,Math.max(24,topHeight(9.48,8.97)),-y);controls.update()}
function focusRoom(r){if(r==='全屋'){fitWholeHome();return}const survey=ROOM_SURVEY[r];if(!survey){fitWholeHome();return}const xs=survey.corners.map(c=>c[0]),ys=survey.corners.map(c=>c[1]),x=(Math.min(...xs)+Math.max(...xs))/2,y=(Math.min(...ys)+Math.max(...ys))/2;controls.target.set(x,0,-y);camera.position.set(x,topHeight(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)),-y);controls.update()}
let pointPress=null;canvas.addEventListener('pointerdown',e=>{pointPress={x:e.clientX,y:e.clientY}});
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();canvas.addEventListener('pointerup',e=>{if(!pointPress||Math.hypot(e.clientX-pointPress.x,e.clientY-pointPress.y)>7)return;mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(markerMeshes.filter(x=>x.visible))[0];if(hit){showDetail(hit.object.userData);openDrawer('points')}});
function modelOffsets(x,y,room){const survey=ROOM_SURVEY[room];if(!survey)return 'Horizontal wall offsets unmeasured';const xs=survey.corners.map(c=>c[0]),ys=survey.corners.map(c=>c[1]);return `Model offset from west/south room bounds: ≈ ${Math.max(0,Math.round((x-Math.min(...xs))*1000))} / ${Math.max(0,Math.round((y-Math.min(...ys))*1000))} mm`}
function pointSource(p){if(p.electricalPixel)return 'Developer fan-coil feed symbol at drawing pixel '+p.electricalPixel.join(' / ')+'; unit centre is approximate';if(p.type==='proposed')return 'Proposed addition · approval and route pending';if(p.id==='AC-1')return 'Equipment planning indication; confirm isolators';if(p.id.startsWith('Y-S'))return 'Developer drawing: three Yard groups; horizontal offsets unmeasured';if(p.type==='light'||p.type==='fan')return 'Developer right-hand Type A electrical drawing, translated to model';return 'Developer outlet schedule/elevation; marker approximate'}
function pointHeight(p){if(['走道','Bath 1','Bath 2'].includes(p.room)&&['light','proposed'].includes(p.type))return 'Existing lowered plaster · model 2720 mm AFFL; actual height to measure';if(['B1-L','B2B-L','B1-SH','B2B-SH'].includes(p.id))return 'Existing bathroom plaster ceiling height to measure; marker rendered lower for visibility';if(p.type==='light'||p.type==='fan')return '≈ 2850 mm ceiling/slab target; marker rendered lower for visibility';if(p.id.endsWith('-AC'))return '2525 mm AFFL (developer legend; site-check)';return `≈ ${Math.round(p.pos[1]*1000)} mm AFFL (drawing legend/model; site-check)`}
function showDetail(p){
 const detail=document.querySelector('#detail'),x=p.pos[0],y=-p.pos[2];
 detail.innerHTML=`<small>${p.id} · ${ROOM_LABELS[p.room]||p.room}</small><h2>${p.title}</h2><div class="meta"><span class="badge">${TYPES[p.type].label}</span><span class="badge">Model position · verify</span></div><p><b>${p.spec}</b> · ${p.note}</p><p><b>Source:</b> ${pointSource(p)}</p><p><b>Model plan centre:</b> X ≈ ${Math.round(x*1000)} / Y ≈ ${Math.round(y*1000)} mm from the south-west model origin.<br><b>Mounting height:</b> ${pointHeight(p)}.<br>${modelOffsets(x,y,p.room)}</p>`;
}
function showUnlocatedPoint(p){document.querySelector('#detail').innerHTML=`<small>${p.id} · ${ROOM_LABELS[p.room]||p.room}</small><h2>${p.name}</h2><div class="meta"><span class="badge">${p.kind}</span><span class="badge">No model marker</span></div><p><b>Source:</b> ${p.source}</p><p><b>Height:</b> ${p.height}. Horizontal offset not measured.</p><p>${p.note}</p>`}
function renderPointRegister(){
 const host=document.querySelector('#pointRegister');host.replaceChildren();
 const chosen=activeRoom==='全屋'?ROOMS.slice(1):[activeRoom];
 document.querySelector('#pointListTitle').textContent=activeRoom==='全屋'?'Point register · all rooms':`${ROOM_LABELS[activeRoom]} · point register`;
 for(const room of chosen){const entries=points.filter(p=>p.room===room),extras=UNLOCATED_POINTS.filter(p=>p.room===room);if(!entries.length&&!extras.length)continue;
  if(activeRoom==='全屋'){const h=document.createElement('div');h.className='register-group';h.textContent=ROOM_LABELS[room];host.append(h)}
  for(const p of entries){const b=document.createElement('button');b.type='button';const x=p.pos[0],y=-p.pos[2];b.innerHTML=`<span class="row-main"><strong>${p.id} · ${p.title}</strong><small>${pointSource(p)} · ${pointHeight(p)}</small></span><span class="row-value">X ${Math.round(x*1000)}<br>Y ${Math.round(y*1000)}</span>`;b.onclick=()=>showDetail(p);host.append(b)}
  for(const p of extras){const b=document.createElement('button');b.type='button';b.innerHTML=`<span class="row-main"><strong>${p.id} · ${p.name}</strong><small>${p.source} · ${p.height}</small></span><span class="row-value">Locate<br>on site</span>`;b.onclick=()=>showUnlocatedPoint(p);host.append(b)}
 }
}
renderPointRegister();
const panel=document.querySelector('.panel'),panelToggle=document.querySelector('#panelToggle'),scrim=document.querySelector('#drawerScrim');
let currentTab='layout';
function openDrawer(tab='layout'){
 setLightPanelOpen(false);
 currentTab=tab;panel.classList.remove('collapsed');panel.setAttribute('aria-hidden','false');scrim.hidden=false;
 document.querySelector('#drawerTitle').textContent={layout:'Layout',points:'Electrical points',measure:'Room dimensions'}[tab];
 document.querySelectorAll('.drawer-tabs button').forEach(b=>{const selected=b.dataset.tab===tab;b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected))});
 document.querySelectorAll('.tab-pane').forEach(p=>p.hidden=p.id!==`tab-${tab}`);
 panelToggle.setAttribute('aria-expanded','true');
 if(tab==='measure')renderMeasurements();if(tab==='points')renderPointRegister();
}
function closeDrawer(){panel.classList.add('collapsed');panel.setAttribute('aria-hidden','true');scrim.hidden=true;panelToggle.setAttribute('aria-expanded','false')}
panelToggle.onclick=()=>panel.classList.contains('collapsed')?openDrawer('points'):closeDrawer();
document.querySelector('#collapse').onclick=closeDrawer;scrim.onclick=closeDrawer;
document.querySelectorAll('.drawer-tabs button').forEach(b=>b.onclick=()=>openDrawer(b.dataset.tab));
let inside=false,daylight=false,interiorMode='walk',wideView=false;
let lookPointer=null;
const heldNavigation=new Set();
function syncEnvironment(){
 tileReflection.invalidate();tileReflection.surface.visible=inside&&interiorMode!=='overview'&&['common','foyer','entry','living','dining','kitchen','prep','hall'].includes(currentInsideRoom);
 viewingWhiteBalance.value.identity();
 document.querySelector('#daylightToggle').textContent=daylight?'Daylight on':'Night mode';
 document.querySelector('#daylightToggle').setAttribute('aria-pressed',String(daylight));
 windowDaylight.set(!inside||daylight);
 updateLightPool();
 const electricScale=electricPreviewScale();
 for(const [kelvin,mat] of Object.entries(diffuserMaterials))mat.color.copy(temperatureColours[kelvin]).multiplyScalar(1.5*electricScale);
 for(const c of lightCircuits)if(c.shadeOn)c.shadeOn.emissiveIntensity=.16*electricScale;
 for(const [mat,power] of daylightFabrics){mat.emissive.set(0xffffff);mat.emissiveIntensity=inside&&daylight?power:0;}
 document.querySelector('#app').classList.toggle('night-mode',inside&&!daylight);
 scene.background.set(inside&&!daylight?0x0b1420:0xdfe5e8);scene.fog.color.copy(scene.background);
 if(!inside){windowDaylight.bounceEnabled.value=0;windowDaylight.strength.value=0;for(const v of windowDaylight.bounceColours.value)v.set(0,0,0);reflectedLight.intensity=0;renderer.toneMapping=THREE.NeutralToneMapping;sun.intensity=1.8;sun.castShadow=true;hemi.color.set(0xffffff);hemi.groundColor.set(0xe0dfd8);hemi.intensity=1.65;renderer.toneMappingExposure=.96;return}
 // Preserve material colour relationships with the same display pipeline in
 // all four daylight / lamp states. The estimated adapting white is separate.
 sun.intensity=0;sun.castShadow=false;renderer.toneMapping=THREE.NeutralToneMapping;
 const lit=lightCircuits.filter(c=>c.on&&c.lights.some(l=>l.visible));
 const zoneFor={'走道':1,'主人房':2,B2:3,B3:4,'Bath 1':5,'Bath 2':6,Yard:7};
 const energies=Array(8).fill(0);
 for(const c of lit){const zone=zoneFor[c.room]??0;energies[zone]+=c.kind==='ceiling'?.72:c.kind==='track'?(c.room==='B2'?.90:.52):c.kind==='pendant'?.42:c.kind==='floorLamp'?.26:c.kind==='strip'?.20:.30;}
 windowDaylight.bounceColours.value.forEach((v,i)=>{const colour=i<2?temperatureColours[commonKelvin]:LIGHT_3500K;v.set(...colour.toArray()).multiplyScalar(Math.min(i===0?1.15:1.0,energies[i])*electricScale);});
 windowDaylight.bounceEnabled.value=lit.length?1:0;
 // Bound total approximate diffuse energy in each zone. Direct fixture lights
 // remain additive; only the non-measured bounce proxy is energy-limited so it
 // cannot fill every surface to near-white when all circuits are switched on.
 const totals=Array(8).fill(0);
 for(const c of lit){const zone=zoneFor[c.room]??0;totals[zone]+=c.kind==='ceiling'?.48:c.kind==='track'?(c.room==='B2'?.65:.38):c.kind==='pendant'?.28:c.kind==='floorLamp'?.18:.22;}
 const scales=totals.map(v=>Math.min(1,1.8/Math.max(v,.0001)));
 bounceBudget={maxIrradiance:3.6,totals,scales};
 // Estimate the adapting white from active room sources plus admitted D65 sky.
 // This is an appearance estimate, not a measured illuminance value. The same
 // calculation is used for every CCT: no fixed 4000 K white or per-CCT filter.
 const roomWindowNames={common:['Living','Kitchen via yard window'],hall:['Living'],master:['Master'],b2:['Bedroom 2'],b3:['Bedroom 3'],bath1:['Bath 1'],bath2:['Bath 2'],yard:['Yard']};
 const names=roomWindowNames[currentInsideRoom]||roomWindowNames.common;
 const skyWeight=daylight?windowDaylight.windows.filter(w=>names.includes(w.name)).reduce((v,w)=>v+w.width*w.height*w.transmission*.55,0):0;
 const mixed=new THREE.Vector3(skyWeight,skyWeight,skyWeight);let weight=skyWeight;
 for(const c of lit){const zone=zoneFor[c.room]??0;const energy=(c.kind==='ceiling'?.72:c.kind==='track'?.52:c.kind==='pendant'?.42:c.kind==='floorLamp'?.26:.30)*scales[zone]*.5*electricScale;mixed.addScaledVector(new THREE.Vector3(...colourForRoom(c.room).toArray()),energy);weight+=energy;}
 viewingIlluminantRGB=weight>0?mixed.divideScalar(weight).toArray():[1,1,1];
 adaptationDegree=daylight?.55:.8;
 viewingWhiteBalance.value.set(...roomViewingMatrix(viewingIlluminantRGB,adaptationDegree));
 const bounceSources=[];
 for(const c of lit){
  const lamps=c.lights.filter(l=>l.visible),zone=zoneFor[c.room]??0;
  const energy=(c.kind==='ceiling'?.48:c.kind==='track'?(c.room==='B2'?.65:.38):c.kind==='pendant'?.28:c.kind==='floorLamp'?.18:.22)/lamps.length;
  for(const lamp of lamps){
   const position=lamp.position.clone();
   if(lamp.isSpotLight)position.lerp(lamp.target.position,.45);else position.y=Math.min(position.y,1.65);
   bounceSources.push({position:position.toArray(),zone,radius:c.kind==='ceiling'?2.0:1.6,colour:colourForRoom(c.room).toArray().map(v=>v*energy*2*scales[zone]*electricScale)});
  }
 }
 windowDaylight.setBounceSources(bounceSources);
 // Window portals provide spatial D65 daylight; this faint hemisphere is only
 // secondary room bounce. Each fixture and its bounce share the selected CCT.
 hemi.color.set(0xffffff);hemi.groundColor.set(0xe0dfd8);
 hemi.intensity=daylight?.075:0;reflectedLight.intensity=0;
 renderer.shadowMap.needsUpdate=true;
 renderer.toneMappingExposure=.85;
}
const insideRoomSelect=document.querySelector('#insideRoom');
let currentInsideRoom='common';
// Each preset is a standing eye-height camera and an in-room movement envelope.
// The movement envelopes keep the arrow controls from walking through walls.
const roomPresets={
 common:{eye:[1.62,2.30],look:[1.60,7.45],bounds:[.28,3.08,1.18,8.75]},
 foyer:{eye:[.50,.50],look:[1.48,.48],lookHeight:1.30,bounds:[.20,1.65,.20,.82]},
 entry:{eye:[1.17,1.58],look:[1.50,2.35],bounds:[.24,1.66,1.14,2.45]},
 living:{eye:[1.58,6.35],look:[1.55,8.72],bounds:[.28,3.08,6.25,8.74]},
 dining:{eye:[1.23,DINING.centre[1]],look:[2.70,DINING.centre[1]],bounds:[.28,3.08,2.74,5.18]},
 kitchen:{eye:[2.15,1.40],look:[3.65,.56],lookHeight:1.22,bounds:[1.94,3.91,.86,1.87]},
 prep:{eye:[2.75,1.05],look:[2.75,2.15],lookHeight:.72,bounds:[1.94,3.91,.99,1.65]},
 yard:{eye:[4.86,1.10],look:[4.63,2.20],bounds:[4.16,5.24,.25,2.42]},
 ledge:{eye:[6.04,1.28],look:[6.69,.45],bounds:[5.49,7.67,.25,2.42]},
 hall:{eye:[5.98,5.77],look:[3.40,5.77],lookHeight:1.96,bounds:[3.42,6.12,5.35,6.17]},
 master:{eye:[9.06,5.85],look:[7.62,7.65],lookHeight:1.20,bounds:[6.47,9.40,5.40,8.77]},
 b2:{eye:[5.10,8.10],look:[4.05,6.733],lookHeight:1.38,bounds:[3.40,6.13,6.50,8.78]},
 b3:{eye:[5.16,3.28],look:[6.72,4.62],lookHeight:1.25,bounds:[4.92,7.65,2.76,5.02]},
 bath1:{eye:[8.60,3.35],look:[9.08,4.22],lookHeight:1.02,bounds:[7.95,9.41,2.76,5.40]},
 bath2:{eye:[4.35,3.35],look:[3.72,4.22],lookHeight:1.02,bounds:[3.40,4.62,2.76,5.40]}
};
const measurementContent=document.querySelector('#measurementContent');
let measureOn=false;
const mm=value=>`${Math.round(value*1000).toLocaleString('en-US')} mm`;
const cornerNames=['A · SW','B · SE','C · NE','D · NW'];
const sideNames=['South','East','North','West'];
function renderMeasurements(){
 measurementContent.replaceChildren();
 const rooms=activeRoom==='全屋'?Object.keys(ROOM_SURVEY):[activeRoom];
 for(const room of rooms){const survey=ROOM_SURVEY[room];if(!survey)continue;
  const card=document.createElement('article');card.className='measurement-card';
  const h=document.createElement('h3');h.textContent=survey.label+' · provisional room outline';card.append(h);
  const intro=document.createElement('p');intro.textContent=survey.notes;card.append(intro);
  const table=document.createElement('div');table.className='measure-table';
  survey.corners.forEach((corner,i)=>{const next=survey.corners[(i+1)%4],distance=Math.hypot(next[0]-corner[0],next[1]-corner[1]);
   const row=document.createElement('div');row.className='measure-row';row.innerHTML=`<span>${sideNames[i]} wall · ${cornerNames[i][0]} → ${cornerNames[(i+1)%4][0]}</span><strong>≈ ${mm(distance)}</strong>`;table.append(row)});
  card.append(table);
  const corners=document.createElement('div');corners.className='measure-table';
  survey.corners.forEach((corner,i)=>{const row=document.createElement('div');row.className='measure-row corner-row';row.innerHTML=`<b>${cornerNames[i]}</b><span class="measure-key">plan-model corner</span><strong>X ${mm(corner[0])} · Y ${mm(corner[1])}</strong>`;corners.append(row)});
  card.append(corners);
  const features=ROOM_FEATURES[room];if(features?.length){const sub=document.createElement('p');sub.innerHTML='<b>Openings and wall changes · model only</b>';card.append(sub);for(const feature of features){const line=document.createElement('p');line.textContent='• '+feature;card.append(line)}}
  const roomPoints=points.filter(p=>p.room===room);
  if(roomPoints.length){const sub=document.createElement('p');sub.innerHTML='<b>Point centres · model X/Y + AFFL</b>';card.append(sub);const list=document.createElement('div');list.className='measure-table';
   for(const p of roomPoints){const row=document.createElement('div');row.className='measure-row';row.innerHTML=`<span>${p.id} · ${p.title}<br><span class="measure-key">${pointHeight(p)}<br>${modelOffsets(p.pos[0],-p.pos[2],room)}</span></span><strong>X/Y ${Math.round(p.pos[0]*1000)} / ${Math.round(-p.pos[2]*1000)} mm</strong>`;list.append(row)}card.append(list)}
  const fixtures=lightCircuits.filter(c=>c.room===room&&circuitActive(c));
  if(fixtures.length){const sub=document.createElement('p');sub.innerHTML='<b>Fixture targets · size and centre</b>';card.append(sub);const list=document.createElement('div');list.className='measure-table';
   for(const c of fixtures){const meta=fixtureMeta(c),row=document.createElement('div');row.className='measure-row';row.innerHTML=`<span>${c.id} · ${c.name}<br><span class="measure-key">${meta?.size||'Size to select'} · ${meta?.mount||'Mounting to confirm'}<br>${meta?modelOffsets(meta.x,meta.y,room):'Offset to measure'}</span></span><strong>${meta?`${Math.round(meta.x*1000)} / ${Math.round(meta.y*1000)} mm`:'Locate on site'}</strong>`;list.append(row)}card.append(list)}
  const foot=document.createElement('p');foot.className='measure-foot';foot.textContent='All X/Y figures are approximate from the model south-west origin. Wall runs include doors/windows as part of the envelope; measure each finished solid section and opening on site. Point centre offsets are not supplied by the electrical drawing.';card.append(foot);
  measurementContent.append(card)
 }
}
function setMeasurementOverlay(on){
 measureOn=on;
 if(measureOn&&activeRoom==='全屋')selectRoom(inside?({'entry':'玄关','foyer':'玄关','living':'客厅','dining':'餐厅','kitchen':'厨房','yard':'Yard','hall':'走道','master':'主人房','b2':'B2','b3':'B3','bath1':'Bath 1','bath2':'Bath 2','ledge':'AC Ledge'}[currentInsideRoom]||'客厅'):'客厅');
 for(const id of ['#measureToggle','#measureQuick'])document.querySelector(id).setAttribute('aria-pressed',String(measureOn));
 document.querySelector('#measureQuick').classList.toggle('active',measureOn);
 document.querySelector('#measureToggle').textContent=measureOn?'Hide dimensions on model':'Show dimensions on model';
 renderMeasurements();if(!measureOn)measureContext.clearRect(0,0,measureCanvas.width,measureCanvas.height)
}
document.querySelector('#measureToggle').onclick=()=>setMeasurementOverlay(!measureOn);
document.querySelector('#measureQuick').onclick=()=>setMeasurementOverlay(!measureOn);
renderMeasurements();
const measureCanvas=document.querySelector('#measureOverlay'),measureContext=measureCanvas.getContext('2d');
function drawInsideMeasurements(ctx,w,h,survey){
 const forward=new THREE.Vector3();camera.getWorldDirection(forward);
 const project=([x,y],height)=>{const v=new THREE.Vector3(x,height,-y),relative=v.clone().sub(camera.position);if(relative.dot(forward)<.1)return null;v.project(camera);if(v.z>1||v.z< -1)return null;return [(v.x+1)*w/2,(1-v.y)*h/2]};
 ctx.lineWidth=1.4;ctx.strokeStyle='rgba(40,85,78,.88)';ctx.font='700 12px system-ui';ctx.textAlign='center';
 for(let i=0;i<4;i++){const a=survey.corners[i],b=survey.corners[(i+1)%4],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],screenMid=project(mid,2.25);if(!screenMid)continue;
  const sa=project(a,2.25),sb=project(b,2.25);if(!sa||!sb)continue;
  ctx.beginPath();ctx.moveTo(...sa);ctx.lineTo(...sb);ctx.stroke();
  const label=`${sideNames[i]} ≈ ${mm(Math.hypot(b[0]-a[0],b[1]-a[1]))}`,tw=ctx.measureText(label).width+15,left=THREE.MathUtils.clamp(screenMid[0]-tw/2,4,w-tw-4),top=THREE.MathUtils.clamp(screenMid[1]-11,54,h-145);
  ctx.fillStyle='rgba(248,250,245,.95)';ctx.fillRect(left,top,tw,22);ctx.fillStyle='#164c40';ctx.fillText(label,left+tw/2,top+15)
 }
 survey.corners.forEach((corner,i)=>{const p=project(corner,.12);if(!p||p[0]<8||p[0]>w-8||p[1]<55||p[1]>h-120)return;ctx.fillStyle='#174e44';ctx.beginPath();ctx.arc(...p,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('ABCD'[i],p[0],p[1]+4)});
 for(const c of lightCircuits.filter(c=>c.room===activeRoom&&circuitActive(c)&&fixtureMeta(c)).slice(0,isMobile?5:12)){const m=fixtureMeta(c),p=project([m.x,m.y],2.65);if(!p||p[0]<8||p[0]>w-50||p[1]<54||p[1]>h-135)continue;ctx.fillStyle='#aa652e';ctx.beginPath();ctx.arc(...p,4,0,Math.PI*2);ctx.fill();ctx.font='700 10px system-ui';ctx.textAlign='left';ctx.fillText(c.id,p[0]+7,p[1]+3)}
}
function drawMeasurements(){
 const dpr=Math.min(devicePixelRatio,1.5),w=innerWidth,h=innerHeight;
 if(measureCanvas.width!==Math.round(w*dpr)||measureCanvas.height!==Math.round(h*dpr)){measureCanvas.width=Math.round(w*dpr);measureCanvas.height=Math.round(h*dpr)}
 const ctx=measureContext;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(!measureOn||!ROOM_SURVEY[activeRoom])return;
 const survey=ROOM_SURVEY[activeRoom],v=new THREE.Vector3();
 if(inside){drawInsideMeasurements(ctx,w,h,survey);return}
 const project=([x,y],z=.09)=>{v.set(x,z,-y).project(camera);return [(v.x+1)*w/2,(1-v.y)*h/2]};
 const corners=survey.corners.map(p=>project(p));
 ctx.lineWidth=1.5;ctx.strokeStyle='rgba(20,53,49,.9)';ctx.fillStyle='#164c40';ctx.font='700 12px system-ui';ctx.textAlign='center';
 for(let i=0;i<corners.length;i++){
  const a=corners[i],b=corners[(i+1)%corners.length],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
  ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
  const len=mm(Math.hypot(survey.corners[(i+1)%4][0]-survey.corners[i][0],survey.corners[(i+1)%4][1]-survey.corners[i][1]));
  const label=`≈ ${len}`;const tw=ctx.measureText(label).width+15,left=THREE.MathUtils.clamp(mx-tw/2,4,w-tw-4),top=THREE.MathUtils.clamp(my-11,48,h-135);
  ctx.fillStyle='rgba(248,250,245,.96)';ctx.fillRect(left,top,tw,22);ctx.fillStyle='#164c40';ctx.fillText(label,left+tw/2,top+15)
 }
 corners.forEach((p,i)=>{ctx.fillStyle='#174e44';ctx.beginPath();ctx.arc(p[0],p[1],12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('ABCD'[i],p[0],p[1]+4)});
 const fixtures=lightCircuits.filter(c=>c.room===activeRoom&&circuitActive(c)&&fixtureMeta(c));
 const maxLabels=isMobile?5:12;for(const c of fixtures.slice(0,maxLabels)){const m=fixtureMeta(c),[x,y]=project([m.x,m.y],2.86);if(x<5||x>w-5||y<5||y>h-5)continue;ctx.fillStyle='rgba(163,92,35,.92)';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.font='700 10px system-ui';ctx.textAlign='left';ctx.fillText(c.id,x+8,y+3)}
}
// Indoor camera owns its orientation; OrbitControls only owns Plan/Overview.
// Conservative obstacle envelopes keep the standing camera out of walls and furniture.
const navigationObstacles=[];
for(const root of [model,interior])root.traverse(m=>{
 if(!m.isMesh||m.userData.cabinetPart||/static batch|seam|pull|handle|rail|frame|mirror face|curtain|blind|glazing|glass|1978 .*leg/i.test(m.name))return;
 m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
 if(b.max.y<.42||b.min.y>1.80||b.max.x-b.min.x<.04||b.max.z-b.min.z<.04)return;
 navigationObstacles.push({minX:b.min.x,maxX:b.max.x,minY:-b.max.z,maxY:-b.min.z,name:m.name});
});
navigationObstacles.push(...cabinetry.footprints());
const navigationRadius=.16;
function blockedAt(x,y){return navigationObstacles.some(b=>x>b.minX-navigationRadius&&x<b.maxX+navigationRadius&&y>b.minY-navigationRadius&&y<b.maxY+navigationRadius)}
function safeMove(dx,dy){
 const b=roomPresets[currentInsideRoom].bounds,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.04));let x=camera.position.x,y=-camera.position.z;
 for(let i=0;i<steps;i++){
  const nx=THREE.MathUtils.clamp(x+dx/steps,b[0],b[1]),ny=THREE.MathUtils.clamp(y+dy/steps,b[2],b[3]);
  if(!blockedAt(nx,y))x=nx;if(!blockedAt(x,ny))y=ny;
 }
 const mx=x-camera.position.x,mz=-y-camera.position.z;camera.position.x=x;camera.position.z=-y;controls.target.x+=mx;controls.target.z+=mz;camera.lookAt(controls.target);
}
const overviewMaterialStates=new Map();model.traverse(m=>{if(m.isMesh){for(const mat of Array.isArray(m.material)?m.material:[m.material])if(!overviewMaterialStates.has(mat))overviewMaterialStates.set(mat,{transparent:mat.transparent,opacity:mat.opacity,depthWrite:mat.depthWrite})}});
function overviewWalls(on){overviewFinishWalls.visible=on;for(const [mat,state] of overviewMaterialStates){mat.transparent=on||state.transparent;mat.opacity=on?Math.min(.16,state.opacity):state.opacity;mat.depthWrite=on?false:state.depthWrite;mat.needsUpdate=true}renderer.shadowMap.needsUpdate=true;}
function updateCameraUI(){
 document.querySelector('#overviewView').setAttribute('aria-pressed',String(inside&&interiorMode==='overview'));
 document.querySelector('#wideView').setAttribute('aria-pressed',String(wideView));document.querySelector('#wideView').disabled=interiorMode==='overview';
 document.querySelector('#walktools').classList.toggle('overview-mode',interiorMode==='overview');
 document.querySelectorAll('[data-walk],[data-look]').forEach(b=>b.disabled=interiorMode==='overview');
 document.querySelector('.walk-hint').textContent=interiorMode==='overview'?isMobile?'Drag to orbit · two fingers to move / zoom':'Drag to orbit · right-drag to move · scroll to zoom':'Drag to look · arrows or WASD to move';
 document.querySelector('#cameraSpaceLabel').textContent=interiorMode==='overview'?'View':'Space';
 document.querySelector('.hint').textContent=inside?(interiorMode==='overview'?'Overview · right-drag / two fingers to move · Reset to fit':'Drag to look · scroll stays in the room · Reset restores view'):'Drag to orbit · pinch or scroll to zoom · tap points for details';
}
function walkingFov(){if(currentInsideRoom==='foyer')return wideView?112:90;return ['bath1','bath2'].includes(currentInsideRoom)?(wideView?104:90):wideView?(isMobile?96:90):(isMobile?76:66)}
function pointWalkingCamera(eye,look){
 controls.enabled=false;controls.enableDamping=false;controls.enablePan=false;controls.enableZoom=false;controls.enableRotate=false;
 camera.clearViewOffset();camera.fov=walkingFov();camera.updateProjectionMatrix();camera.position.set(eye[0],1.57,-eye[1]);controls.target.set(look[0],look[2],-look[1]);camera.lookAt(controls.target);
}
function resetView(){
 heldNavigation.clear();lookPointer=null;
 if(!inside){focusRoom(activeRoom);return}
 if(interiorMode==='overview'){overviewCamera();return}
 const p=roomPresets[currentInsideRoom];pointWalkingCamera(p.eye,[...p.look,p.lookHeight??1.44]);
}
function overviewCamera(){
 // Drain any pending pan/rotation momentum before restoring the fit pose.
 controls.enableDamping=false;controls.update();
 controls.enabled=true;controls.enableRotate=true;controls.enablePan=true;controls.screenSpacePanning=false;controls.enableZoom=true;controls.minPolarAngle=.12;controls.maxPolarAngle=.85;
 camera.fov=isMobile?55:45;camera.setViewOffset(innerWidth,innerHeight,0,innerHeight*.06,innerWidth,innerHeight);camera.updateProjectionMatrix();const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),margin=isMobile?1.15:1.33;
 let distance=Math.max(12,9.5/(2*tan*camera.aspect)*margin,9/(2*tan)*margin);controls.target.set(4.83,.55,-4.57);
 // Fit all shell corners into the real space above the integrated toolbar.
 const toolbarTop=document.querySelector('.controlbar').getBoundingClientRect().top,probe=new THREE.Vector3();
 for(let attempt=0;attempt<18;attempt++){
  camera.position.set(4.83,.55+distance*.98,-4.57+distance*.20);camera.lookAt(controls.target);camera.updateMatrixWorld();let fits=true;
  for(const x of [.01,9.65])for(const y of [0,2.85])for(const z of [-9.13,0]){probe.set(x,y,z).project(camera);const px=(probe.x+1)*innerWidth/2,py=(1-probe.y)*innerHeight/2;if(px<12||px>innerWidth-12||py<70||py>toolbarTop-14)fits=false;}
  if(fits)break;distance*=1.045;
 }
 controls.minDistance=distance*.65;controls.maxDistance=distance*1.85;controls.update();controls.enableDamping=true;
}
function setOverview(on){
 if(!inside)setInside(true);interiorMode=on?'overview':'walk';heldNavigation.clear();lookPointer=null;indoorCeiling.visible=!on;ground.visible=!on;overviewWalls(on);
 if(on){activeRoom='全屋';roomSelect.value=drawerRoomSelect.value='全屋';insideRoomSelect.value='overview';lightRoomSelect.value='common';applyFilters();renderLightSwitches();overviewCamera();}else indoorPlace(currentInsideRoom);updateCameraUI();syncLights();
}
function setInside(on){
 const wasInside=inside;inside=on;heldNavigation.clear();lookPointer=null;interiorMode='walk';ground.visible=true;overviewWalls(false);
 document.querySelector('#app').classList.toggle('inside-mode',on);indoorCeiling.visible=on;document.querySelector('#insideView').classList.toggle('active',on);document.querySelector('#planView').classList.toggle('active',!on);document.querySelector('#walktools').hidden=!on;
 if(on){if(!wasInside){currentInsideRoom='common';insideRoomSelect.value='common'}indoorPlace(currentInsideRoom);}
 else{controls.enabled=true;controls.enableDamping=true;controls.enableRotate=true;controls.enablePan=true;controls.enableZoom=true;controls.minDistance=.4;controls.maxDistance=32;controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI*.68;camera.clearViewOffset();camera.fov=32;camera.updateProjectionMatrix();focusRoom(activeRoom);}
 updateCameraUI();syncLights();syncEnvironment();
}
document.querySelector('#daylightToggle').onclick=()=>{daylight=!daylight;syncEnvironment()};
function setCommonTemperature(kelvin){
 if(![3000,3500,4000].includes(kelvin))return;commonKelvin=kelvin;
 document.querySelectorAll('[data-cct]').forEach(b=>{const selected=Number(b.dataset.cct)===kelvin;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
 const url=new URL(location.href);url.searchParams.set('cct',kelvin);history.replaceState(null,'',url);syncLights();
}
document.querySelectorAll('[data-cct]').forEach(b=>b.onclick=()=>setCommonTemperature(Number(b.dataset.cct)));
function indoorPlace(place){
 if(!inside)setInside(true);const p=roomPresets[place];if(!p)return;
 interiorMode='walk';currentInsideRoom=place;insideRoomSelect.value=place;indoorCeiling.visible=true;ground.visible=true;overviewWalls(false);heldNavigation.clear();lookPointer=null;
 const matchingRoom={'common':'客厅','entry':'玄关','foyer':'玄关','living':'客厅','dining':'餐厅','kitchen':'厨房','prep':'厨房','yard':'Yard','ledge':'AC Ledge','hall':'走道','master':'主人房','b2':'B2','b3':'B3','bath1':'Bath 1','bath2':'Bath 2'}[place];
 if(matchingRoom){activeRoom=matchingRoom;roomSelect.value=drawerRoomSelect.value=matchingRoom;lightRoomSelect.value=lightScopeFor(matchingRoom);applyFilters();renderPointRegister();renderMeasurements();renderLightSwitches()}
 pointWalkingCamera(p.eye,[...p.look,p.lookHeight??1.44]);updateCameraUI();syncLights();
}
insideRoomSelect.onchange=()=>insideRoomSelect.value==='overview'?setOverview(true):indoorPlace(insideRoomSelect.value);
function walkInside(dir,step=.25){
 if(!inside||interiorMode!=='walk')return;const d=controls.target.clone().sub(camera.position);d.y=0;d.normalize();
 const side=new THREE.Vector3(d.z,0,-d.x);if(dir==='back')d.negate();else if(dir==='left')d.copy(side);else if(dir==='right')d.copy(side).negate();safeMove(d.x*step,-d.z*step);
}
function lookInside(dx,dy=0){
 if(!inside||interiorMode!=='walk')return;const direction=controls.target.clone().sub(camera.position).normalize();let yaw=Math.atan2(direction.x,-direction.z),pitch=Math.asin(THREE.MathUtils.clamp(direction.y,-1,1));
 yaw-=dx*.003;pitch=THREE.MathUtils.clamp(pitch-dy*.0025,-1.15,1.20);const c=Math.cos(pitch);controls.target.copy(camera.position).add(new THREE.Vector3(Math.sin(yaw)*c,Math.sin(pitch),-Math.cos(yaw)*c).multiplyScalar(2));camera.lookAt(controls.target);
}
canvas.addEventListener('pointerdown',event=>{
 if(!inside||interiorMode!=='walk'||!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
 lookPointer={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{if(!lookPointer||lookPointer.id!==event.pointerId||!inside||interiorMode!=='walk')return;lookInside(event.clientX-lookPointer.x,event.clientY-lookPointer.y);lookPointer.x=event.clientX;lookPointer.y=event.clientY});
function stopLooking(event){if(lookPointer?.id===event.pointerId){lookPointer=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId)}}
canvas.addEventListener('pointerup',stopLooking);canvas.addEventListener('pointercancel',stopLooking);canvas.addEventListener('lostpointercapture',()=>{lookPointer=null});
canvas.addEventListener('wheel',event=>{if(inside&&interiorMode==='walk'&&!event.ctrlKey)event.preventDefault()},{passive:false});canvas.addEventListener('contextmenu',event=>{if(inside)event.preventDefault()});
document.querySelector('#resetView').onclick=resetView;
document.querySelector('#overviewView').onclick=()=>setOverview(interiorMode!=='overview');
document.querySelector('#wideView').onclick=()=>{wideView=!wideView;camera.fov=walkingFov();camera.updateProjectionMatrix();updateCameraUI()};
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>indoorPlace(b.dataset.place));
for(const button of document.querySelectorAll('[data-walk],[data-look]')){
 const key=button.dataset.walk||'look-'+button.dataset.look;
 button.addEventListener('pointerdown',e=>{if(!inside||interiorMode!=='walk')return;e.preventDefault();if(button.dataset.walk)walkInside(key,.12);else lookInside(key==='look-left'?30:-30);heldNavigation.add(key);button.setPointerCapture(e.pointerId);});
 const stop=()=>heldNavigation.delete(key);button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);button.addEventListener('lostpointercapture',stop);
 // Keyboard/assistive activation remains a single small step.
 button.addEventListener('click',e=>{if(e.detail===0){if(button.dataset.walk)walkInside(key);else lookInside(key==='look-left'?60:-60)}});
}
const keyActions={w:'forward',s:'back',a:'left',d:'right',ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right',q:'look-left',e:'look-right'};
addEventListener('keydown',e=>{if(e.target.closest?.('select,input,textarea')||!inside||interiorMode!=='walk')return;const action=keyActions[e.key];if(action){e.preventDefault();heldNavigation.add(action)}if(e.key==='Escape')resetView()});
addEventListener('keyup',e=>heldNavigation.delete(keyActions[e.key]));
addEventListener('blur',()=>{heldNavigation.clear();lookPointer=null});document.addEventListener('visibilitychange',()=>{if(document.hidden){heldNavigation.clear();lookPointer=null}});
function updateNavigation(dt){
 if(!inside||interiorMode!=='walk')return;
 for(const action of heldNavigation){if(action.startsWith('look-'))lookInside((action==='look-left'?1:-1)*dt*240);else walkInside(action,dt*.80)}
 // Reassert the owned standing pose after any browser/input event.
 camera.position.y=1.57;camera.lookAt(controls.target);camera.updateMatrixWorld();
}
document.querySelector('#insideView').onclick=()=>setInside(true);
document.querySelector('#planView').onclick=()=>setInside(false);
document.querySelector('#homeView').onclick=()=>{setInside(false);selectRoom('全屋')};document.querySelector('#furnitureToggle').addEventListener('click',e=>{interior.visible=!interior.visible;tileReflection.invalidate();e.currentTarget.classList.toggle('active',interior.visible)});document.querySelector('#livingView').onclick=()=>{setInside(false);selectRoom('客厅')};document.querySelector('#kitchenView').addEventListener('click',()=>{setInside(false);selectRoom('厨房')});document.querySelector('#topView').onclick=()=>{setInside(false);focusRoom(activeRoom)};
let faded=false;document.querySelector('#cutaway').onclick=e=>{faded=!faded;tileReflection.invalidate();e.currentTarget.classList.toggle('active',faded);if(model)model.traverse(o=>{if(o.isMesh&&/wall|shell/i.test(o.name)){o.material.transparent=faded;o.material.opacity=faded?.48:1;o.material.depthWrite=!faded}})};
document.querySelector('#schemeQuick').onclick=()=>openDrawer('layout');
const controlbar=document.querySelector('.controlbar');
new ResizeObserver(()=>document.documentElement.style.setProperty('--controls-height',Math.ceil(controlbar.getBoundingClientRect().height)+'px')).observe(controlbar);
const initialParams=new URLSearchParams(location.search);
// Register all PBR surfaces, including materials attached only after toggling.
// Source light stays spectral RGB; a partial eye-adaptation transform is applied
// to completed scene radiance, never to a material swatch or light source.
const viewingMaterials=new Set();scene.traverse(m=>{if(m.isMesh)for(const mat of Array.isArray(m.material)?m.material:[m.material])viewingMaterials.add(mat)});
for(const c of lightCircuits)for(const mat of [c.shadeOn,c.shadeOff])if(mat)viewingMaterials.add(mat);
for(const mat of viewingMaterials){
 const pbr=mat.isMeshStandardMaterial||mat.isMeshPhysicalMaterial;
 if(!pbr&&!Object.values(diffuserMaterials).includes(mat))continue;
 mat.onBeforeCompile=shader=>{
  if(pbr)windowDaylight.attach(shader);
  shader.uniforms.eyeWhiteBalance=viewingWhiteBalance;
  shader.fragmentShader='uniform mat3 eyeWhiteBalance;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=max(vec3(0.0),eyeWhiteBalance*outgoingLight);\n#include <opaque_fragment>');
 };
 mat.customProgramCacheKey=()=> 'serina-bounded-room-colour-v10';mat.needsUpdate=true;
}
daylight=initialParams.get('daylight')!=='0';
// Start in natural daylight with every electric circuit off. Explicit night links retain their lit preview.
for(const circuit of lightCircuits)circuit.on=!daylight;
renderLightSwitches();
commonKelvin=[3000,3500,4000].includes(Number(initialParams.get('cct')))?Number(initialParams.get('cct')):3500;
document.querySelectorAll('[data-cct]').forEach(b=>{const on=Number(b.dataset.cct)===commonKelvin;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
function setCabinetsOpen(open){
 cabinetry.setOpen(open);for(const button of document.querySelectorAll('[data-cabinet-interiors]')){button.setAttribute('aria-pressed',String(open));button.classList.toggle('active',open);}
 document.querySelector('#cabinetViewNote').textContent=open?'Interior cutaway: doors hidden. Drawer travel, item sizes and fitting clearances still follow the 2D drawings.':'Exterior view. Tap Interiors to inspect shelves, rails and drawer allocation.';
 const u=new URL(location.href);if(open)u.searchParams.set('cabinetview','inside');else u.searchParams.delete('cabinetview');history.replaceState(null,'',u);
 renderer.shadowMap.needsUpdate=true;tileReflection.invalidate();return open;
}
for(const button of document.querySelectorAll('[data-cabinet-interiors]'))button.onclick=()=>setCabinetsOpen(!cabinetry.snapshot().open);
if(initialParams.get('cabinetview')==='inside')setCabinetsOpen(true);
const canonicalUrl=new URL(location.href);canonicalUrl.searchParams.delete('scheme');history.replaceState(null,'',canonicalUrl);
document.querySelector('#ceilingNote').textContent=AGREED_SCOPE.ceiling;
const facts=document.querySelector('#designFacts');
const factRows=[['Lighting','15 installation groups + sink strip'],['Fans','Living + Bedroom 3 ceiling fans; Bedroom 2 plug-in standing circulator'],['Air conditioning','Four existing doorway-side provisions; illustrative indoor units'],['Master','One dimmable ceiling light; no fan or curtain box'],['Wardrobes','B2: left adjustable shelves / fin space; right hanging above ONE broad drawer. B3: three external drawers LEFT, double hanging RIGHT. Separate lofts; no niches or cabinet lights.'],['Overview','Selected walls retain Summer Snow 1928 as low solid cutaways; other walls stay translucent.'],['Finishes',AGREED_SCOPE.wallPaint+'. Matt-white ceilings; existing glossy tile and warm pale oak bedroom floor retained.'],['Curtains',AGREED_SCOPE.windowTreatments],['Kitchen',AGREED_SCOPE.kitchen+' Current shell gives about948 mm aisle versus1038 mm in the source-based study; measure the real finished faces before fabrication.'],['Yard',AGREED_SCOPE.yard],['Appliances',AGREED_SCOPE.appliances]];
for(const [label,value] of factRows){const row=document.createElement('div');row.className='design-fact';const title=document.createElement('strong');title.textContent=label;const detail=document.createElement('span');detail.textContent=value;row.append(title,detail);facts.append(row);}
const pending=document.createElement('p');pending.className='note';pending.textContent='Pending: '+AGREED_SCOPE.pending.slice(0,4).join(' · ');facts.append(pending);
syncLights();syncEnvironment();
wideView=initialParams.get('wide')==='1'||(isMobile&&!initialParams.has('wide')&&['b2inside','b2cabinet'].includes(initialParams.get('view')));
if(initialParams.get('compare')==='1'){roomPresets.b2.eye=[5.86,8.45];roomPresets.b2.look=[4.30,6.80];roomPresets.b2.lookHeight=1.40;}
const initialView=initialParams.get('view');
if(initialView==='inside')setInside(true);
const initialPlaces={tv:'living',sofa:'living',dining:'dining',b2inside:'b2',b2cabinet:'b2',b3inside:'b3',b3cabinet:'b3',masterinside:'master',shoe:'foyer',b2:'b2',yard:'yard',kitchen:'kitchen',prep:'prep'};
if(initialPlaces[initialView])indoorPlace(initialPlaces[initialView]);
if(initialView==='overview')setOverview(true);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(inside&&interiorMode==='overview')overviewCamera();else if(!inside)focusRoom(activeRoom)}addEventListener('resize',resize);resize();
// Never cap the loop below 60 Hz. Scale internal resolution only if this device
// cannot sustain the display's cadence; the badge reports observed FPS.
let frameCount=0,frameWindowStart=performance.now(),renderDpr=maxDpr,qualityCooldown=0;
let lastNavigationFrame=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.05,Math.max(0,(now-lastNavigationFrame)/1000));lastNavigationFrame=now;updateNavigation(dt);if(!inside||interiorMode==='overview')controls.update();if(inside&&interiorMode==='overview'){const before=controls.target.clone();controls.target.x=THREE.MathUtils.clamp(controls.target.x,-.8,10.4);controls.target.z=THREE.MathUtils.clamp(controls.target.z,-10.1,.8);controls.target.y=.55;camera.position.add(controls.target.clone().sub(before));camera.lookAt(controls.target);}renderer.render(scene,camera);if(measureOn)drawMeasurements();
 frameCount++;if(now-frameWindowStart>2500){const fps=Math.round(frameCount*1000/(now-frameWindowStart));document.querySelector('#fpsBadge').textContent=`FPS ${fps}`;
  if(now>qualityCooldown){const next=fps<59?Math.max(.70,Math.min(renderDpr-.06,renderDpr*Math.sqrt(fps/60)*.97)):fps>=60?Math.min(maxDpr,renderDpr+.03):renderDpr;
   if(Math.abs(next-renderDpr)>.03){renderDpr=next;renderer.setPixelRatio(renderDpr);renderer.setSize(innerWidth,innerHeight,false);qualityCooldown=now+6000}}
  frameCount=0;frameWindowStart=now}}
requestAnimationFrame(animate);

window.serinaViewer={snapshot:()=>({revision:AGREED_SCOPE.revision,cabinetry:cabinetry.snapshot(),inside,daylight,room:activeRoom,navigation:{mode:interiorMode,place:currentInsideRoom,wide:wideView,fov:camera.fov,bounds:roomPresets[currentInsideRoom].bounds,blocked:blockedAt(camera.position.x,-camera.position.z),orbitEnabled:controls.enabled,panEnabled:controls.enablePan,direction:camera.getWorldDirection(new THREE.Vector3()).toArray(),aspect:camera.aspect,viewOffset:camera.view?.enabled||false},airConditioners:AIR_CONDITIONERS.map(a=>{const g=scene.getObjectByName(a.name+' indoor unit');return {...a,position:g.position.toArray(),visible:g.visible}}),overviewWalls:{visible:overviewFinishWalls.visible,colour:overviewWallMat.color.getHexString(),height:1.10,count:overviewFinishWalls.children.length},hallCeiling:{...HALL_CEILING,visible:indoorCeiling.visible},retainedCeilings:indoorCeiling.children.filter(m=>/retained|lowered|drop/i.test(m.name)).map(m=>({name:m.name,height:m.position.y})),floor:{bedrooms:'Warm pale oak, photo reference inspection pages 12/16/18',base:'#b6a083',reflection:tileReflection.snapshot()},paint:{name:AGREED_SCOPE.wallPaint,baseSRGB:"#"+wallPaintMaterial.color.getHexString(THREE.SRGBColorSpace),baseLinear:wallPaintMaterial.color.toArray(),source:"Jotun official Malaysia interior colour swatch, checked 13 Oct 2026"},windows:{strength:windowDaylight.strength.value,portals:windowDaylight.windows,skyVisible:windowDaylight.group.visible,fabricEmissions:[...daylightFabrics.keys()].map(m=>m.emissiveIntensity)},trims:{colour:doorTrimMat.color.getHexString(),skirtingCount:skirtingPieces.length,height:75,depth:12,sharedWithDoorFrames:skirtingPieces.every(m=>m.material===doorTrimMat)},upholstery:{sofa:"King Living 1978 · Fortitude Linen reference",base:"#e0ddd6",materialTint:mats.linen.color.getHexString(),textureAppliedOnce:true},lighting:{commonKelvin,electricPreviewScale:electricPreviewScale(),localBounce:windowDaylight.bounceColours.value.map(v=>v.toArray()),areas:areaPool.map(l=>l.intensity),spots:spotPool.map(l=>({intensity:l.intensity,position:l.position.toArray(),target:l.target.position.toArray()})),bounce:reflectedLight.intensity,daylightFill:hemi.intensity,colour:LIGHT_COLOUR,sourceLinearRGB:LIGHT_COLOUR.variants[String(commonKelvin)].linearRGB,displayLinearRGB:temperatureColours[commonKelvin].toArray(),viewingIlluminantRGB,adaptationDegree,exposure:renderer.toneMappingExposure,bounceBudget,bounceSourceCount:windowDaylight.bounceSourceCount.value,bounceLinearRGB:reflectedLight.color.toArray(),toneMapping:renderer.toneMapping,viewingWhiteBalance:viewingWhiteBalance.value.toArray()},door:(()=>{const d=scene.getObjectByName('PD yard door outward opening single leaf no cat hole');const b=new THREE.Box3().setFromObject(d);return {direction:'outward to yard',foldJoints:d.children.filter(m=>m.isGroup).length,hinge:[d.position.x,-d.position.z],angle:d.rotation.y*180/Math.PI,bounds:{min:b.min.toArray(),max:b.max.toArray()}}})(),camera:[camera.position.x,camera.position.y,camera.position.z],look:[controls.target.x,controls.target.y,controls.target.z],frameRate:document.querySelector('#fpsBadge').textContent,renderDpr,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,sourcePoints:points.filter(p=>p.sourcePixel).map(p=>({id:p.id,pixel:p.sourcePixel,pos:p.pos})),fixtures:lightCircuits.map(c=>({id:c.id,room:c.room,kind:c.kind,installed:c.installed,centre:c.centre,on:c.on,physicalVisible:c.group.visible,feed:c.feed||c.id,route:c.route,heads:c.heads,aims:c.aims,lights:c.lights.map(l=>({visible:l.visible,intensity:l.intensity}))})),fans:fanGroups.map(g=>({name:g.name,...g.userData,x:g.position.x,y:-g.position.z})),dining:DINING,bedroom2:BEDROOM2,standingCirculators:[{...BEDROOM2.circulator,visible:interior.getObjectByName(BEDROOM2.circulator.name)?.visible}],scope:AGREED_SCOPE,meshes:interior.children.map(m=>({name:m.name,x:m.position.x,y:-m.position.z,height:m.position.y}))}),setCabinetsOpen:setCabinetsOpen,setAllLights:on=>{for(const c of lightCircuits)c.on=on;syncLights();renderLightSwitches();},stand:indoorPlace};
