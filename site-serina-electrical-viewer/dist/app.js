import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {ROOM_SURVEY,ROOM_FEATURES,UNLOCATED_POINTS} from './planning-data.js?v=20261012-r2';
import {AGREED_SCOPE,SOURCE_REGISTER,registeredSource,planToModel,sourceModel,DINING,FANS,FIXTURES,fixtureMeta} from './agreed-design.js?v=20261012-r2';

RectAreaLightUniformsLib.init();

const TYPES={light:{label:'Light point',color:0xffd166},fan:{label:'Fan point',color:0x6aa9ff},socket:{label:'Socket / power',color:0x56d68b},data:{label:'TV / fibre',color:0xb18cff},fixed:{label:'Air-con / water heater',color:0x4dd7e7},proposed:{label:'Proposed',color:0xff835c}};
const ROOMS=['全屋','玄关','客厅','餐厅','厨房','Yard','走道','主人房','B2','B3','Bath 1','Bath 2','AC Ledge'];
const ROOM_LABELS={'全屋':'Whole home','玄关':'Entry','客厅':'Living room','餐厅':'Dining','厨房':'Kitchen','Yard':'Yard','走道':'Hall','主人房':'Master bedroom','B2':'Bedroom 2','B3':'Bedroom 3','Bath 1':'Bath 1','Bath 2':'Bath 2','AC Ledge':'AC ledge'};
const points=SOURCE_REGISTER.map(([id,room,ex,ey,type,title])=>{
 const [x,y]=planToModel(...registeredSource(ex,ey),room);
 const unused=['M-L1','M-L3','M-FAN','B2-L2'].includes(id);
 const fixture=FIXTURES.find(f=>f.id===id||f.feed===id),fan=FANS.find(f=>f.id===id);
 return {id,room,type,pos:[x,2.73,-y],title,spec:type==='fan'?'Original fan supply':'Original light supply',note:unused?'Unused: retain and safely cover. No fitting planned.':fixture?.status||fan?.status||(id==='B2-F'?'Retain feed; new structural hook position pending.':id==='B2-L1'?'Feed the proposed transverse track at this original point; verify circuit on site.':'Existing supply retained; new fitting centres are in the current 2D drawing.'),status:unused?'Unused':'Drawing-derived · verify on site',sourcePixel:[ex,ey]};
});
// Outlet locations are inherited approximations, hidden by default. Do not
// introduce a new wardrobe-niche supply or a powered mirror cabinet.
const outletRows=[
 ['L-S1','客厅','socket',.24,6.65,.30,'Sofa-wall socket 1'],['L-S2','客厅','socket',.24,8.25,.30,'Sofa-wall socket 2'],
 ['L-S3','客厅','socket',3.11,6.65,.30,'TV-wall single socket'],['L-S4','客厅','socket',3.11,7.68,.30,'TV-wall double socket'],
 ['L-D1','客厅','data',3.10,7.42,.35,'TV / fibre point'],['L-AC','客厅','fixed',3.08,6.05,2.525,'Living air-con feed'],
 ['K-S1','厨房','socket',2.42,.22,1.00,'Kitchen counter power A'],['K-S2','厨房','socket',3.43,.22,1.00,'Kitchen counter power B'],['K-FR','厨房','socket',3.91,2.18,1.00,'Fridge power'],
 ['Y-S1','Yard','socket',4.32,.25,1.00,'Yard socket 1'],['Y-S2','Yard','socket',4.86,.25,1.00,'Yard socket 2'],['Y-S3','Yard','socket',5.22,2.36,1.00,'Yard socket 3'],
 ['M-S1','主人房','socket',6.53,8.35,.30,'Master socket A'],['M-S2','主人房','socket',9.42,7.15,.30,'Master socket B'],['M-S3','主人房','socket',6.53,6.35,.30,'Master socket C'],['M-AC','主人房','fixed',7.55,5.55,2.525,'Master air-con feed'],
 ['B2-AC','B2','fixed',5.78,6.56,2.525,'Bedroom 2 air-con feed'],['B3-S1','B3','socket',5,4.62,.30,'Bedroom 3 socket 1'],['B3-S2','B3','socket',7.72,3.52,.30,'Bedroom 3 socket 2'],['B3-AC','B3','fixed',5.38,5.18,2.525,'Bedroom 3 air-con feed'],
 ['B1-WH','Bath 1','fixed',9.45,4.72,1.85,'Bathroom 1 water-heater feed'],['B2B-WH','Bath 2','fixed',3.62,4.72,1.85,'Bathroom 2 water-heater feed']
];
for(const [id,room,type,x,y,z,title] of outletRows)points.push({id,room,type,pos:[x,z,-y],title,spec:'Existing service indication',note:'Horizontal offset is unmeasured. Trace the actual outlet and circuit on site.',status:'Approximate model marker'});
for(const f of FIXTURES.filter(f=>f.installed&&!SOURCE_REGISTER.some(p=>p[0]===f.id))){points.push({id:f.id,room:f.room,type:'proposed',pos:[f.centre[0],2.70,-f.centre[1]],title:f.name,spec:'Current fitting target',note:f.status,status:'Proposed · set-out pending'});}
points.push({id:'B2-F-NEW',room:'B2',type:'proposed',pos:[FANS[1].centre[0],2.73,-FANS[1].centre[1]],title:'Bedroom 2 new fan hook',spec:'33-inch visual target',note:FANS[1].status,status:'Proposed · set-out pending'});

const canvas=document.querySelector('#scene'); const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
const isMobile=matchMedia('(max-width: 720px)').matches;
const maxDpr=Math.min(devicePixelRatio,isMobile?1.35:1.8);
renderer.setPixelRatio(maxDpr);renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.96;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xdfe3e5); scene.fog=new THREE.Fog(0xdfe3e5,28,52); const camera=new THREE.PerspectiveCamera(32,1,.1,100); camera.position.set(14.5,15.5,13.5);
const controls=new OrbitControls(camera,canvas); controls.enableDamping=true; controls.target.set(5,0,-4.8); controls.minDistance=.4; controls.maxDistance=32; controls.maxPolarAngle=Math.PI*.68;
const hemi=new THREE.HemisphereLight(0xeaf5ff,0xa79d8e,1.65);scene.add(hemi); const sun=new THREE.DirectionalLight(0xffe7c8,1.8); sun.position.set(-5,15,8);sun.castShadow=true;sun.shadow.mapSize.set(isMobile?1024:2048,isMobile?1024:2048);scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0xc8cdd0,roughness:.96})); ground.rotation.x=-Math.PI/2; ground.position.y=-.04; ground.receiveShadow=true;scene.add(ground);
let model; const markerGroup=new THREE.Group(); scene.add(markerGroup); const markerMeshes=[];

function buildShell(){
 // Jotun 1928 Summer Snow is a greyish white (NCS 1102-Y10R). The sRGB swatch
 // here is only a screen approximation; the paint recipe must come from Jotun.
 // Jotun's on-screen 1928 Summer Snow swatch is RGB(229,226,216).
 // Keep the base material anchored to that actual swatch; scene lights change its appearance.
 const wallMat=new THREE.MeshStandardMaterial({color:0xe5e2d8,roughness:.94});
 const frameMat=new THREE.MeshStandardMaterial({color:0x24282b,roughness:.43});
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xa5c5d3,roughness:.08,transparent:true,opacity:.43,side:THREE.DoubleSide});
 const doorMat=new THREE.MeshStandardMaterial({color:0x333d43,roughness:.62});
 const serviceMat=new THREE.MeshStandardMaterial({color:0xaeb3b4,roughness:.69});
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
 function doorX(a,b,y,mat=serviceMat){part('door',(a+b)/2,y,b-a-.09,.055,.01,2.14,mat);part('door header',(a+b)/2,y,b-a,.16,2.19,.66)}
 function doorY(x,a,b,mat=serviceMat){part('door',x,(a+b)/2,.055,b-a-.09,.01,2.14,mat);part('door header',x,(a+b)/2,.16,b-a,2.19,.66)}
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

 // B2 and corridor; the master entry is in its west partition.
 wy(3.245,6.353,9.05);wx(3.245,5.225,6.353);doorX(5.225,6.025,6.353);wx(6.025,6.29,6.353);
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
function woodTexture(){const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.fillStyle='#c3c2ba';x.fillRect(0,0,1024,1024);for(let i=0;i<12;i++){x.fillStyle=i%2?'rgba(82,83,77,.019)':'rgba(255,255,255,.026)';x.fillRect(i*86,0,82,1024);x.strokeStyle='rgba(82,83,77,.040)';x.beginPath();x.moveTo(i*86,0);x.bezierCurveTo(i*86+16,320,i*86-10,690,i*86+9,1024);x.stroke()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function floorPlane(x,y,w,d,kind='tile'){const tex=kind==='wood'?woodTexture():tileTexture(kind==='bath'?'bath':'public');tex.repeat.set(kind==='wood'?w/.18:w/.60,kind==='wood'?d/1.2:d/.60);const mat=kind==='wood'?new THREE.MeshStandardMaterial({map:tex,roughness:.60}):new THREE.MeshPhysicalMaterial({map:tex,roughness:kind==='bath'?.7:.085,metalness:0,clearcoat:kind==='bath'?0:.82,clearcoatRoughness:.065});const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);p.rotation.x=-Math.PI/2;p.position.set(x,.018,-y);p.receiveShadow=true;scene.add(p)}
function buildSurfaces(){
 // Same room extents as the plan-calibrated Blender structural script. The
 // bedroom wood finish and public 600×600 glossy tiles match actual photos.
 floorPlane(1.7125,4.60,3.065,8.84,'tile');
 floorPlane(3.6425,1.375,.795,2.45,'tile');
 floorPlane(.9725,.575,1.645,.85,'tile');
 floorPlane(4.8575,5.9415,3.225,1.183,'tile');
 floorPlane(4.8575,7.7915,2.865,2.517,'wood');
 floorPlane(7.975,7.20,3.01,3.70,'wood');
 floorPlane(4.10,3.975,1.35,2.45,'bath');
 floorPlane(6.3875,3.975,2.865,2.45,'wood');
 floorPlane(8.74,3.975,1.48,2.45,'bath');
 floorPlane(4.795,1.375,1.15,2.45,'tile');
 floorPlane(5.90,1.375,.70,2.45,'tile');
}

const mats={
 linen:new THREE.MeshPhysicalMaterial({color:0xe0d7c9,map:linenTexture(),roughness:.93,sheen:.55,sheenColor:0xe9e1d5}),
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
const interior=new THREE.Group();interior.visible=true;scene.add(interior);
function linenTexture(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#e5ddd0';g.fillRect(0,0,256,256);let seed=1978;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<13000;i++){const v=130+Math.floor(rand()*85);g.fillStyle=`rgba(${v},${v-4},${v-10},${.035+rand()*.075})`;g.fillRect(rand()*256,rand()*256,rand()*2+.4,rand()*5+.6)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,5);return t}
function box(name,x,y,z,w,d,h,mat,r=.04){const g=r>.012?new RoundedBoxGeometry(w,h,d,name.startsWith('1978')?4:2,Math.min(r,w/2,d/2,h/2)):new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(g,mat);m.name=name;m.position.set(x,z+h/2,-y);m.castShadow=true;m.receiveShadow=true;interior.add(m);return m}
function romanBlind(name,a,b,planY){
 // One full-width dimout Roman shade, 100 mm past each jamb. Subtle sewn
 // horizontal folds replace the earlier featureless roller screen.
 a-=.10;b+=.10;
 const width=b-a,geom=new THREE.PlaneGeometry(width,1.72,1,32),v=geom.attributes.position;
 for(let i=0;i<v.count;i++){
  const y=v.getY(i),fold=(y+.86)/.215;
  v.setZ(i,.022*Math.cos(fold*Math.PI*2));
 }
 geom.computeVertexNormals();
 const fabric=new THREE.Mesh(geom,new THREE.MeshPhysicalMaterial({color:0xc4c1ba,roughness:.98,side:THREE.DoubleSide,transparent:true,opacity:.94,depthWrite:false}));
 fabric.name=name+' full-width dimout Roman fabric';fabric.position.set((a+b)/2,1.60,-planY);fabric.receiveShadow=true;interior.add(fabric);
 box(name+' soft top valance',(a+b)/2,planY,2.45,width,.075,.095,mats.lightCab,.012);
 const seamMat=new THREE.MeshStandardMaterial({color:0xb2afa8,roughness:1});
 for(let i=1;i<8;i++)box(name+' sewn fold '+i,(a+b)/2,planY-.025,.74+i*.215,width-.025,.006,.008,seamMat,.002);
 box(name+' weighted fabric hem',(a+b)/2,planY-.012,.73,width,.018,.035,mats.lightCab,.005);
}
function fabricCurtain(name,cx,width,planY,material,depth=.035){
 const geom=new THREE.PlaneGeometry(width,2.70,32,1),v=geom.attributes.position;
 for(let i=0;i<v.count;i++)v.setZ(i,Math.sin((v.getX(i)/width+.5)*Math.PI*10)*depth);
 geom.computeVertexNormals();const mesh=new THREE.Mesh(geom,material);mesh.name=name;mesh.position.set(cx,1.405,-planY);mesh.castShadow=true;interior.add(mesh);
}
function windowTreatments(){
 romanBlind('living full-width blind',.57,2.82,8.91);
 romanBlind('B2 full-width blind',3.75,5.95,8.91);
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
 const seam=new THREE.MeshStandardMaterial({color:0xc9c0b3,roughness:.98});
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
 box('low floor-standing TV cabinet 2134W target',2.977,7.62,.02,.36,2.134,.30,mats.graphite,.012);
 box('TV cabinet recessed floor plinth',3.00,7.62,.015,.29,2.08,.055,mats.black,.004);
 for(const y of [7.087,7.62,8.153])box('TV cabinet front seam',2.792,y,.08,.006,.006,.215,mats.black,.001);
 box('Samsung The Frame Pro provisional 65 inch bezel',3.12,7.62,.82,.050,1.46,.82,mats.black,.008);
 const art=new THREE.Mesh(new THREE.PlaneGeometry(1.422,.782),new THREE.MeshStandardMaterial({map:frameArtTexture(),roughness:.96}));art.name='The Frame Pro Art Mode size pending';art.rotation.y=-Math.PI/2;art.position.set(3.088,1.23,-7.62);interior.add(art);
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
 // Kitchen: two parallel runs, no island. The dry counter stays open above.
 box('wet run base carcass 2065',3.0075,.46,.02,2.065,.62,.86,mats.cabinet,.012);
 let wetX=1.975;
 for(const [name,width] of [['left filler',.05],['hob drawers',.60],['prep drawers',.60],['large sink doors',.75],['right filler',.065]]){
  if(width>.10){box('wet '+name+' face',wetX+width/2,.777,.08,width-.008,.018,.76,mats.cabinet,.004);
   if(name.includes('drawers'))for(const z of [.31,.55])box('wet '+name+' drawer reveal',wetX+width/2,.791,z,width-.02,.007,.006,mats.black,.001);
   if(name.includes('sink'))box('wet sink double-door reveal',wetX+width/2,.791,.08,.006,.007,.76,mats.black,.001);
  }
  wetX+=width;
 }
 box('kitchen sintered stone backsplash',3.0075,.145,.925,2.065,.016,.51,mats.counter,.001);
 box('wet run sintered stone top',3.0075,.46,.88,2.065,.66,.045,mats.counter,.01);
 box('wet run upper carcass',3.0075,.33,1.46,2.065,.40,.74,mats.lightCab,.012);
 box('wet upper ceiling scribe',3.0075,.33,2.82,2.065,.40,.03,mats.lightCab,.001);
 box('wet run loft carcass',3.0075,.33,2.20,2.065,.40,.62,mats.lightCab,.012);
 let upperX=2.025;
 for(const [i,width] of [.60,.60,.75].entries()){
  const x=upperX+width/2;
  box('wet '+Math.round(width*1000)+' daily upper door '+(i+1),x,.538,1.47,width-.015,.016,.72,mats.lightCab,.004);
  box('wet '+Math.round(width*1000)+' loft door '+(i+1),x,.538,2.21,width-.015,.016,.60,mats.lightCab,.004);
  upperX+=width;
 }
 box('recirculating hood placeholder model pending',2.425,.57,1.43,.90,.40,.11,mats.graphite,.012);
 // Original Plan: Bath 2's dining-side face (x=3.165) continues into the
 // fridge tall-unit cheek. Keep the fixed bathroom wall; align cabinetry to it.
 // The fridge opening is provisional until the selected appliance is measured.
 box('fridge cabinet dining-facing grey ash side panel',3.175,2.23,.02,.025,.762,2.80,greyAshMat,.004);
 box('fridge cabinet kitchen side panel',3.927,2.23,.02,.025,.762,2.80,greyAshMat,.004);
 box('fridge grey wood ceiling scribe',3.556,2.23,2.82,.762,.762,.03,greyAshMat,.001);
 box('fridge cabinet bridge top',3.556,2.23,2.79,.762,.762,.03,greyAshMat,.006);
 box('fridge cabinet overhead door',3.556,1.839,2.02,.722,.025,.76,greyAshMat,.006);
 box('fridge cabinet plinth',3.556,2.23,.02,.762,.762,.08,mats.graphite,.005);
 box('fridge appliance body provisional 650W',3.595,2.19,.10,.59,.61,1.88,mats.metal,.025);
 box('fridge upper door',3.595,1.87,.94,.56,.022,1.04,mats.graphite,.018);
 box('fridge freezer drawer',3.595,1.87,.12,.56,.022,.82,mats.graphite,.018);
 box('fridge door split line',3.595,1.852,.93,.55,.005,.008,mats.black,.001);
 box('fridge upper recessed handle',3.355,1.842,1.73,.015,.009,.20,mats.black,.002);
 // Finish the open preparation run at the aligned cheek, avoiding overlap.
 box('dry preparation base 1372 by 762',2.481,2.23,.02,1.372,.762,.86,mats.islandCabinet,.012);
 let dryX=1.795;
 for(const [i,width] of [.40,.50,.47].entries()){
  box('dry prep '+Math.round(width*1000)+' front',dryX+width/2,1.839,.08,width-.008,.018,.76,mats.islandCabinet,.004);
  for(const z of [.31,.55])box('dry prep drawer seam '+i,dryX+width/2,1.827,z,width-.02,.007,.006,mats.graphite,.001);
  dryX+=width;
 }
 box('open dry preparation counter',2.481,2.23,.88,1.372,.802,.045,mats.counter,.012);
 box('induction hob visual placeholder final model pending',2.425,.45,.925,.65,.43,.012,mats.black,.012);
 box('600 mm sink rim',3.60,.45,.925,.60,.47,.013,mats.metal,.014);
 box('sink bowl',3.60,.45,.939,.53,.40,.012,mats.graphite,.014);
 // Entry shoe cabinet beside the inner main door, not beside the outer grill.
 // Owner target: a 2700 mm cabinet BODY floated 120 mm above the finished
 // floor. Its nominal top is 2820 mm under the 2850 mm slab; the remaining
 // 30 mm is a site-cut scribe. Width/depth are visual targets pending Ace's
 // final measurement and a check of the inward-opening main-door swing.
 box('foyer floating shoe cabinet 610W target',1.48,.48,.12,.38,.610,2.70,mats.lightCab,.008);
 // Four practical door leaves, rather than a single 2700 mm hinged leaf.
 for(const y of [.325,.635]){
  box('entry lower handleless shoe door',1.279,y,.132,.018,.294,1.32,mats.lightCab,.003);
  box('entry upper handleless shoe door',1.279,y,1.468,.018,.294,1.34,mats.lightCab,.003);
  box('entry lower shadow pull',1.267,y,1.448,.004,.284,.012,mats.graphite,.001);
 }
 box('entry cabinet horizontal shadow reveal',1.267,.48,1.461,.004,.595,.012,mats.graphite,.001);
 // Master: king headboard at the west partition. The inward room door opens
 // through y=5.35..6.25, so keep the lower bedside wholly north of y=6.35.
 bed(7.50,7.60,1.88,2.05,'master king');rotateNamed('master king',7.50,7.60,-Math.PI/2);
 box('master slim bedside near entry',6.72,6.50,.02,.40,.30,.45,mats.graphite,.045);
 box('master slim bedside near window',6.72,8.72,.02,.40,.30,.45,mats.graphite,.045);
 // B2: 1400 desktop by the west window side, two 24-inch monitors and an
 // ergonomic chair. Cabinet doors face north into the room, not the corridor.
 box('B2 1400 desk top',3.70,8.27,.71,.70,1.40,.045,mats.wood,.016);
 for(const y of [7.67,8.87])for(const x of [3.43,3.95])box('B2 desk slim leg',x,y,.02,.025,.025,.69,mats.metal,.004);
 for(const y of [7.93,8.61]){
  box('B2 24 inch monitor display',3.49,y,.96,.032,.54,.33,mats.screen,.008);
  box('B2 monitor neck',3.55,y,.76,.018,.018,.20,mats.metal,.004);
  box('B2 monitor foot',3.55,y,.745,.20,.20,.012,mats.metal,.006);
 }
 box('B2 office chair seat',4.40,8.24,.43,.48,.48,.08,mats.graphite,.06);
 box('B2 office chair back',4.63,8.24,.52,.07,.47,.56,mats.graphite,.04);
 box('B2 chair centre column',4.40,8.24,.10,.045,.045,.34,mats.metal,.012);
 for(const d of [-.18,.18])box('B2 chair star base',4.40+d,8.24,.025,.28,.025,.035,mats.metal,.006);
 // Use the complete solid run of B2's south wall (3.245..5.225 m) up to its
 // door. The door-side bay has an open mid-height niche so the original wall
 // switch stays accessible. The unlit mirror occupies the niche back.
 box('B2 wardrobe ceiling scribe',4.2495,6.77,2.82,1.829,.60,.03,mats.wardrobeCab,.001);
 box('B2 three-door wardrobe 1440W plus niche',4.055,6.77,.02,1.44,.60,2.80,mats.wardrobeCab,.012);
 for(let i=0;i<3;i++){
  const x=3.575+i*.480;
  box('B2 wardrobe door '+(i+1),x,7.079,.10,.464,.018,2.70,mats.wardrobeCab,.005);
  box('B2 wardrobe slim pull '+(i+1),x+.18,7.091,1.10,.009,.008,.14,mats.metal,.003);
 }
 box('B2 door-side small niche lower cabinet',4.9695,6.77,.02,.389,.60,.93,mats.wardrobeCab,.045);
 box('B2 door-side small niche upper cabinet',4.9695,6.77,1.55,.389,.60,1.27,mats.wardrobeCab,.045);
 // Only the inner divider is continuous; the door-facing end is open at
 // niche height, so the display cavity can be accessed from two sides.
 box('B2 niche inner divider',4.76,6.77,.02,.018,.60,2.80,mats.wardrobeCab,.003);
 box('B2 niche warm wood lower shelf',4.97,6.78,.95,.40,.56,.025,mats.nicheWood,.003);
 box('B2 niche warm wood upper soffit',4.97,6.78,1.53,.40,.56,.025,mats.nicheWood,.003);
 box('B2 niche warm wood inner reveal',4.775,6.77,.975,.015,.58,.555,mats.nicheWood,.002);
 box('B2 niche wood-lined back with switch cutout',4.97,6.465,.975,.40,.012,.555,mats.nicheWood,.002);
 // A pale mirror proxy stays legible in WebGL even without a reflection probe.
 const b2NicheMirrorMat=new THREE.MeshBasicMaterial({color:0xbdd2d5,side:THREE.DoubleSide});
 box('B2 niche unlit mirror, clear of accessible switch',4.88,6.488,1.015,.28,.008,.49,b2NicheMirrorMat,.002);
 box('B2 niche mirror soft edge highlight',4.755,6.497,1.025,.014,.004,.47,new THREE.MeshBasicMaterial({color:0xeaf3f3}),.001);
 box('B2 relocated switch visual placeholder in niche',5.11,6.479,1.12,.075,.012,.11,mats.ceramic,.002);
 box('B2 wardrobe recessed plinth',4.2495,7.075,.02,1.829,.025,.075,mats.graphite,.002);
 // B3 is a complete four-door wardrobe with no open bay, mirror, power or light.
 box('B3 wardrobe ceiling scribe',6.8255,4.82,2.82,1.829,.60,.03,mats.wardrobeCab,.001);
 box('B3 full four-door wardrobe 1829W rounded exposed edge',6.8255,4.82,.02,1.829,.60,2.80,mats.wardrobeCab,.040);
 for(const x of [6.1396,6.5969,7.0541,7.5114]){
  box('B3 wardrobe full-height door',x,4.509,.09,.440,.018,2.70,mats.wardrobeCab,.004);
  box('B3 wardrobe slim pull',x+.17,4.495,1.10,.009,.008,.14,mats.metal,.003);
 }
 box('B3 guest bed frame',6.75,3.22,.02,1.92,.95,.28,mats.wood,.08);
 box('B3 guest mattress',6.75,3.22,.30,1.84,.87,.20,mats.bed,.08);
 box('B3 guest headboard',7.64,3.22,.02,.12,.95,.88,mats.graphite,.05);
 box('B3 guest pillow',7.32,3.22,.51,.34,.52,.10,mats.bed,.06);
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
function batchStatic(root){
 root.updateMatrixWorld(true);const batches=new Map();
 root.traverse(m=>{if(!m.isMesh||!m.visible||Array.isArray(m.material)||m.material.transparent)return;
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
buildShell();buildSurfaces();buildInterior();batchStatic(model);batchStatic(interior);fitWholeHome();
// A single accepted design. No alternative ceilings or hidden legacy circuits.
const LIGHT_3500K=0xffead6;
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
ceilingPlane('Retained hallway plaster',[[3.245,5.20],[6.29,5.20],[6.29,6.353],[3.245,6.353]],2.72,FIXTURES.filter(f=>f.room==='走道'));
for(const [room,x1,x2] of [['Bath 2',3.245,4.775],['Bath 1',7.82,9.57]])ceilingPlane(room+' retained plaster with two openings',[[x1,2.60],[x2,2.60],[x2,5.20],[x1,5.20]],2.72,FIXTURES.filter(f=>f.room===room));
ceilingPlane('Original yard slab',[[4.04,.08],[5.37,.08],[5.37,2.60],[4.04,2.60]],2.85);
const fixturesGroup=new THREE.Group();fixturesGroup.name='Current agreed fixtures';scene.add(fixturesGroup);
const lightCircuits=[];
const fixtureShellMat=new THREE.MeshStandardMaterial({color:0xf3f3ef,roughness:.9});
const diffuserOnMat=new THREE.MeshBasicMaterial({color:0xfff2e1});
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
 const [x,y]=f.centre,roof=['走道','Bath 1','Bath 2'].includes(f.room)?2.72:2.85;
 const disc=(r,h,mat)=>new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat);
 if(f.kind==='ceiling'){
  const shell=disc(f.diameter/2,.040,fixtureShellMat);shell.position.set(x,roof-.024,-y);c.group.add(shell);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(f.diameter*.45,32),diffuserOffMat);lens.rotation.x=Math.PI/2;lens.position.set(x,roof-.046,-y);addLens(c,lens);
  areaLamp(c,x,y,roof-.049,f.diameter*.82,f.diameter*.82,f.room==='Yard'?32:55);
  spotLamp(c,x,y,roof-.054,x,y,0,f.room==='Yard'?90:f.diameter>.4?260:170,Math.PI*.40);
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
   const origin=new THREE.Vector3(p[0],roof-.10,-p[1]);
   const aim=f.id==='L-L1'?(i<2?[p[0],p[1]-.80,.70]:[3.14,p[1],1.25]):f.id==='K-L2'?[p[0],.63,.88]:[p[0],7.45,.72];
   const direction=new THREE.Vector3(aim[0],aim[2],-aim[1]).sub(origin).normalize();
   const mount=new THREE.Mesh(new THREE.BoxGeometry(.042,.038,.060),finish);mount.position.set(p[0],roof-.045,-p[1]);c.group.add(mount);
   const head=new THREE.Group();head.position.copy(origin);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),direction);c.group.add(head);
   const body=disc(f.white?.044:.037,.082,finish);head.add(body);
   const baffle=new THREE.Mesh(new THREE.CylinderGeometry(.031,.028,.025,24,1,true),recessedCup);baffle.position.y=-.038;head.add(baffle);
   const lens=new THREE.Mesh(new THREE.CircleGeometry(.028,24),diffuserOffMat);lens.rotation.x=Math.PI/2;lens.position.y=-.036;head.add(lens);c.lenses.push(lens);
   const emitter=origin.clone().addScaledVector(direction,.045);
   spotLamp(c,emitter.x,-emitter.z,emitter.y,...aim,f.white?120:95,f.white?.78:.54);
  }
  if(f.id==='B2-TRACK'){
   c.group.userData.provisional=true;
   for(const p of f.route){const ring=new THREE.Mesh(new THREE.RingGeometry(.055,.063,20),new THREE.MeshBasicMaterial({color:0xc59352,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(p[0],roof-.18,-p[1]);c.group.add(ring)}
  }
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
const areaPool=Array.from({length:6},()=>{const l=new THREE.RectAreaLight(LIGHT_3500K,0,.1,.1);scene.add(l);return l});
const spotPool=Array.from({length:8},()=>{const l=new THREE.SpotLight(LIGHT_3500K,0,5,.66,.9,2);l.castShadow=true;l.shadow.mapSize.set(512,512);l.shadow.bias=-.00015;l.shadow.normalBias=.018;scene.add(l,l.target);return l});
function updateLightPool(){
 const areas=lightCircuits.flatMap(c=>c.lights.filter(l=>l.visible&&l.isRectAreaLight)),spots=lightCircuits.flatMap(c=>c.lights.filter(l=>l.visible&&l.isSpotLight));
 areaPool.forEach((l,i)=>{const a=areas[i];l.intensity=inside&&a?a.intensity*.16:0;if(a){l.position.copy(a.position);l.quaternion.copy(a.quaternion);l.width=a.width;l.height=a.height;}});
 spotPool.forEach((l,i)=>{const a=spots[i];l.intensity=inside&&a?a.intensity*.16:0;if(a){l.position.copy(a.position);l.target.position.copy(a.target.position);l.angle=a.angle;l.penumbra=a.penumbra;l.distance=a.distance;l.decay=a.decay;}});
}
function circuitActive(){return true}
function syncLights(){
 const neighbours={common:['客厅','餐厅'],foyer:['玄关'],entry:['玄关','厨房','餐厅'],living:['客厅','餐厅'],dining:['餐厅','客厅','厨房'],kitchen:['厨房','玄关','餐厅'],prep:['厨房','餐厅'],yard:['Yard','厨房'],ledge:['Yard'],hall:['走道'],master:['主人房'],b2:['B2'],b3:['B3'],bath1:['Bath 1'],bath2:['Bath 2']};
 const rooms=new Set(neighbours[currentInsideRoom]||['客厅','餐厅']);
 for(const c of lightCircuits){c.group.visible=true;for(const lamp of c.lights)lamp.visible=inside&&c.on&&rooms.has(c.room);for(const lens of c.lenses)lens.material=c.on?diffuserOnMat:diffuserOffMat;if(c.shade)c.shade.material=c.on?c.shadeOn:c.shadeOff;}
 updateLightPool();renderer.shadowMap.needsUpdate=true;
 if(inside)syncEnvironment();
}

function renderLightSwitches(){
 const quick=document.querySelector('#quickLightSwitches'),more=document.querySelector('#lightSwitches');
 quick.replaceChildren();more.replaceChildren();
 const selected=document.querySelector('#lightRoomSelect').value||'客厅';
 const circuits=lightCircuits.filter(c=>c.room===selected&&circuitActive(c));
 const makeRow=(c,compact)=>{
  const row=document.createElement('div');row.className='light-row'+(compact?' compact':'');
  const toggle=document.createElement('button');toggle.type='button';toggle.className='light-switch'+(c.on?' on':'');toggle.setAttribute('aria-pressed',String(c.on));
  const label=document.createElement('span');label.className='fixture-name';label.textContent=c.name+(c.id==='B2-TRACK'?' · position pending':'');
  const state=document.createElement('span');state.className='light-state';state.textContent=c.on?'ON':'OFF';
  toggle.append(label,state);toggle.onclick=()=>{c.on=!c.on;syncLights();renderLightSwitches()};
  const pin=document.createElement('button');pin.type='button';pin.className='light-pin'+(quickLightIds.has(c.id)?' pinned':'');pin.textContent=quickLightIds.has(c.id)?'★':'☆';pin.setAttribute('aria-label',`${quickLightIds.has(c.id)?'Remove':'Add'} ${c.name} ${quickLightIds.has(c.id)?'from':'to'} quick controls`);pin.setAttribute('aria-pressed',String(quickLightIds.has(c.id)));
  pin.onclick=()=>{quickLightIds.has(c.id)?quickLightIds.delete(c.id):quickLightIds.add(c.id);try{localStorage.setItem(QUICK_LIGHTS_KEY,JSON.stringify([...quickLightIds]))}catch{}renderLightSwitches()};
  row.append(toggle,pin);
  if(!compact){const meta=fixtureMeta(c),detail=document.createElement('small');detail.className='fixture-meta';detail.textContent=`${c.id} · ${meta?.size||'Size pending'} · ${meta?`X ${Math.round(meta.x*1000)} / Y ${Math.round(meta.y*1000)} mm`:'Position to measure'}`;row.append(detail)}
  return row;
 };
 for(const c of circuits)(quickLightIds.has(c.id)?quick:more).append(makeRow(c,quickLightIds.has(c.id)));
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
document.querySelector('#lightsAllOn').onclick=()=>{lightCircuits.filter(c=>circuitActive(c)&&c.room===lightRoomSelect.value).forEach(c=>c.on=true);syncLights();renderLightSwitches()};
document.querySelector('#lightsAllOff').onclick=()=>{lightCircuits.filter(c=>circuitActive(c)&&c.room===lightRoomSelect.value).forEach(c=>c.on=false);syncLights();renderLightSwitches()};
for(const [id,on] of [['houseLightsOn',true],['houseLightsOff',false]])document.querySelector('#'+id).onclick=()=>{lightCircuits.forEach(c=>c.on=on);syncLights();renderLightSwitches()};
for(const p of points){if(['socket','data','fixed'].includes(p.type))p.status='Plan indication · verify on site'}
for(const p of points){const geo=new THREE.SphereGeometry(p.type==='fan'?.105:.085,20,20); const mat=new THREE.MeshStandardMaterial({color:p.status==='Unused'?0x87978c:TYPES[p.type].color,emissive:p.status==='Unused'?0x87978c:TYPES[p.type].color,emissiveIntensity:p.status==='Unused'?.08:.65,roughness:.65}); const m=new THREE.Mesh(geo,mat); m.position.set(...p.pos); m.userData=p; markerGroup.add(m); markerMeshes.push(m); const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.15,32),new THREE.MeshBasicMaterial({color:TYPES[p.type].color,transparent:true,opacity:.48,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.copy(m.position); ring.position.y-=.002; markerGroup.add(ring); m.userData.ring=ring;}
let activeRoom='全屋';
const roomSelect=document.querySelector('#roomSelect');
const drawerRoomSelect=document.querySelector('#drawerRoomSelect');
const lightRoomSelect=document.querySelector('#lightRoomSelect');
ROOMS.forEach(r=>{for(const select of [roomSelect,drawerRoomSelect,...(r==='全屋'?[]:[lightRoomSelect])]){const option=document.createElement('option');option.value=r;option.textContent=ROOM_LABELS[r]||r;select.append(option)}});
roomSelect.value=drawerRoomSelect.value=activeRoom;lightRoomSelect.value='客厅';renderLightSwitches();
function selectRoom(room){activeRoom=room;roomSelect.value=drawerRoomSelect.value=room;if(room!=='全屋')lightRoomSelect.value=room;applyFilters();if(inside){const key={'玄关':'entry','客厅':'living','餐厅':'dining','厨房':'kitchen','Yard':'yard','走道':'hall','主人房':'master','B2':'b2','B3':'b3','Bath 1':'bath1','Bath 2':'bath2','AC Ledge':'ledge'}[activeRoom];if(key)indoorPlace(key)}else focusRoom(activeRoom);renderPointRegister();renderMeasurements();renderLightSwitches()}
roomSelect.onchange=()=>selectRoom(roomSelect.value);
drawerRoomSelect.onchange=()=>selectRoom(drawerRoomSelect.value);
lightRoomSelect.onchange=()=>selectRoom(lightRoomSelect.value);
const activeTypes=new Set(); const typeFilters=document.querySelector('#typeFilters'); Object.entries(TYPES).forEach(([k,v])=>{const b=document.createElement('button');b.className=activeTypes.has(k)?'active':'';b.setAttribute('aria-pressed',String(activeTypes.has(k)));b.innerHTML=`<i class="mini" style="background:#${v.color.toString(16).padStart(6,'0')}"></i>${v.label}`;b.onclick=()=>{activeTypes.has(k)?activeTypes.delete(k):activeTypes.add(k);b.classList.toggle('active');b.setAttribute('aria-pressed',String(activeTypes.has(k)));applyFilters()};typeFilters.append(b)});
function applyFilters(){for(const m of markerMeshes){const on=(activeRoom==='全屋'||m.userData.room===activeRoom)&&activeTypes.has(m.userData.type);m.visible=on;m.userData.ring.visible=on}}
applyFilters();
function topHeight(width,depth){const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));return Math.max(7,(width+1.0)/(2*tan*camera.aspect),(depth+1.0)/(2*tan))}
function fitWholeHome(){const x=4.83,y=4.57;controls.target.set(x,0,-y);camera.position.set(x,Math.max(24,topHeight(9.48,8.97)),-y);controls.update()}
function focusRoom(r){if(r==='全屋'){fitWholeHome();return}const survey=ROOM_SURVEY[r];if(!survey){fitWholeHome();return}const xs=survey.corners.map(c=>c[0]),ys=survey.corners.map(c=>c[1]),x=(Math.min(...xs)+Math.max(...xs))/2,y=(Math.min(...ys)+Math.max(...ys))/2;controls.target.set(x,0,-y);camera.position.set(x,topHeight(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)),-y);controls.update()}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();canvas.addEventListener('pointerup',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(markerMeshes.filter(x=>x.visible))[0];if(hit){showDetail(hit.object.userData);openDrawer('points')}});
function modelOffsets(x,y,room){const survey=ROOM_SURVEY[room];if(!survey)return 'Horizontal wall offsets unmeasured';const xs=survey.corners.map(c=>c[0]),ys=survey.corners.map(c=>c[1]);return `Model offset from west/south room bounds: ≈ ${Math.max(0,Math.round((x-Math.min(...xs))*1000))} / ${Math.max(0,Math.round((y-Math.min(...ys))*1000))} mm`}
function pointSource(p){if(p.type==='proposed')return 'Proposed addition · approval and route pending';if(p.id==='AC-1')return 'Equipment planning indication; confirm isolators';if(p.id.startsWith('Y-S'))return 'Developer drawing: three Yard groups; horizontal offsets unmeasured';if(p.type==='light'||p.type==='fan')return 'Developer right-hand Type A electrical drawing, translated to model';return 'Developer outlet schedule/elevation; marker approximate'}
function pointHeight(p){if(['B1-L','B2B-L','B1-SH','B2B-SH'].includes(p.id))return 'Existing bathroom plaster ceiling height to measure; marker rendered lower for visibility';if(p.type==='light'||p.type==='fan')return '≈ 2850 mm ceiling/slab target; marker rendered lower for visibility';if(p.id.endsWith('-AC'))return '2525 mm AFFL (developer legend; site-check)';return `≈ ${Math.round(p.pos[1]*1000)} mm AFFL (drawing legend/model; site-check)`}
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
let inside=false,daylight=false;
function syncEnvironment(){
 if(!inside){sun.intensity=1.8;sun.castShadow=true;hemi.color.set(0xeaf5ff);hemi.groundColor.set(0xa79d8e);hemi.intensity=1.65;renderer.toneMappingExposure=.96;return}
 sun.intensity=0;sun.castShadow=false;
 const lit=lightCircuits.filter(c=>c.on&&c.lights.some(l=>l.visible)),fill=Math.min(.42,.24+lit.reduce((n,c)=>n+(c.kind==='track'?.045:c.kind==='ceiling'?.050:c.kind==='strip'?.012:.025),0));
 hemi.color.set(daylight?0xeaf5ff:0xfaf8f4);hemi.groundColor.set(daylight?0xe0dfd8:0xd7d5cc);
 hemi.intensity=(daylight?.65:0)+(lit.length?fill:.006);
 renderer.shadowMap.needsUpdate=true;
 renderer.toneMappingExposure=daylight?1:1.04;
 document.querySelector('#daylightToggle').textContent=daylight?'Daylight on':'Night mode';
 document.querySelector('#daylightToggle').setAttribute('aria-pressed',String(daylight));
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
 prep:{eye:[3.03,4.00],look:[2.35,1.60],lookHeight:1.22,bounds:[2.72,3.08,3.20,4.40]},
 yard:{eye:[4.86,1.10],look:[4.63,2.20],bounds:[4.16,5.24,.25,2.42]},
 ledge:{eye:[6.04,1.28],look:[6.69,.45],bounds:[5.49,7.67,.25,2.42]},
 hall:{eye:[5.98,5.77],look:[3.40,5.77],lookHeight:1.96,bounds:[3.42,6.12,5.35,6.17]},
 master:{eye:[9.06,5.85],look:[7.62,7.65],lookHeight:1.20,bounds:[6.47,9.40,5.40,8.77]},
 b2:{eye:[5.68,8.45],look:[4.20,7.12],lookHeight:1.30,bounds:[3.40,6.13,6.50,8.78]},
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
function setInside(on){inside=on;document.querySelector('#app').classList.toggle('inside-mode',on);indoorCeiling.visible=on;syncLights();document.querySelector('#insideView').classList.toggle('active',on);document.querySelector('#planView').classList.toggle('active',!on);document.querySelector('#walktools').hidden=!on;camera.fov=on?(isMobile?85:75):32;camera.updateProjectionMatrix();syncEnvironment();if(on){currentInsideRoom='common';insideRoomSelect.value='common';controls.target.set(1.60,1.47,-7.45);camera.position.set(1.62,1.57,-2.30)}else focusRoom(activeRoom);controls.enableDamping=!(on&&isMobile);controls.enabled=!(on&&isMobile);controls.update();syncLights()}
document.querySelector('#daylightToggle').onclick=()=>{daylight=!daylight;syncEnvironment()};
function indoorPlace(place){if(!inside)setInside(true);const p=roomPresets[place];if(!p)return;currentInsideRoom=place;insideRoomSelect.value=place;const matchingRoom={'entry':'玄关','foyer':'玄关','living':'客厅','dining':'餐厅','kitchen':'厨房','prep':'厨房','yard':'Yard','ledge':'AC Ledge','hall':'走道','master':'主人房','b2':'B2','b3':'B3','bath1':'Bath 1','bath2':'Bath 2'}[place];if(matchingRoom){activeRoom=matchingRoom;roomSelect.value=drawerRoomSelect.value=lightRoomSelect.value=matchingRoom;applyFilters();renderPointRegister();renderMeasurements();renderLightSwitches()}camera.fov=(place==='bath1'||place==='bath2')?106:(isMobile?85:75);camera.updateProjectionMatrix();camera.position.set(p.eye[0],1.57,-p.eye[1]);controls.target.set(p.look[0],p.lookHeight??1.44,-p.look[1]);controls.update();syncLights()}
insideRoomSelect.onchange=()=>indoorPlace(insideRoomSelect.value);
function walkInside(dir,step=.38){if(!inside)return;let dx=controls.target.x-camera.position.x,dz=controls.target.z-camera.position.z;const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;let mx=0,mz=0;if(dir==='forward'){mx=dx;mz=dz}else if(dir==='back'){mx=-dx;mz=-dz}else if(dir==='left'){mx=dz;mz=-dx}else if(dir==='right'){mx=-dz;mz=dx}const [minX,maxX,minY,maxY]=roomPresets[currentInsideRoom].bounds,nx=THREE.MathUtils.clamp(camera.position.x+mx*step,minX,maxX),nz=THREE.MathUtils.clamp(camera.position.z+mz*step,-maxY,-minY);controls.target.x+=nx-camera.position.x;controls.target.z+=nz-camera.position.z;camera.position.x=nx;camera.position.z=nz;controls.update()}
function lookInside(dx,dy=0){if(!inside)return;const direction=controls.target.clone().sub(camera.position).normalize();let yaw=Math.atan2(direction.x,-direction.z),pitch=Math.asin(THREE.MathUtils.clamp(direction.y,-1,1));yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.003,-.92,.92);const cos=Math.cos(pitch);controls.target.copy(camera.position).add(new THREE.Vector3(Math.sin(yaw)*cos,Math.sin(pitch),-Math.cos(yaw)*cos).multiplyScalar(2));controls.update()}
let lookPointer=null;
canvas.addEventListener('pointerdown',event=>{if(!inside||!isMobile||!event.isPrimary)return;lookPointer={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId)});
canvas.addEventListener('pointermove',event=>{if(!lookPointer||lookPointer.id!==event.pointerId||!inside||!isMobile)return;lookInside(event.clientX-lookPointer.x,event.clientY-lookPointer.y);lookPointer.x=event.clientX;lookPointer.y=event.clientY});
function stopLooking(event){if(lookPointer?.id===event.pointerId)lookPointer=null}
canvas.addEventListener('pointerup',stopLooking);canvas.addEventListener('pointercancel',stopLooking);
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>indoorPlace(b.dataset.place));
for(const button of document.querySelectorAll('[data-walk],[data-look]')){
 const act=(held=false)=>{if(button.dataset.walk)walkInside(button.dataset.walk,held?0.13:0.38);else lookInside((button.dataset.look==='left'?1:-1)*(held?18:52))};
 let delay,repeat,wasHeld=false;
 button.addEventListener('pointerdown',()=>{wasHeld=false;delay=setTimeout(()=>{wasHeld=true;act(true);repeat=setInterval(()=>act(true),90)},280)});
 const stop=()=>{clearTimeout(delay);clearInterval(repeat)};button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);button.addEventListener('pointerleave',stop);
 button.onclick=()=>{if(wasHeld){wasHeld=false;return}act(false)};
}
addEventListener('keydown',e=>{if(e.target.closest?.('select,input,textarea'))return;const key={w:'forward',s:'back',a:'left',d:'right',ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(inside&&key){e.preventDefault();walkInside(key)}if(inside&&(e.key==='q'||e.key==='e')){e.preventDefault();lookInside(e.key==='q'?52:-52)}});
document.querySelector('#insideView').onclick=()=>setInside(!inside);
document.querySelector('#planView').onclick=()=>setInside(false);
document.querySelector('#homeView').onclick=()=>{setInside(false);selectRoom('全屋')};document.querySelector('#furnitureToggle').addEventListener('click',e=>{interior.visible=!interior.visible;e.currentTarget.classList.toggle('active',interior.visible)});document.querySelector('#livingView').onclick=()=>{setInside(false);selectRoom('客厅')};document.querySelector('#kitchenView').addEventListener('click',()=>{setInside(false);selectRoom('厨房')});document.querySelector('#topView').onclick=()=>{setInside(false);focusRoom(activeRoom)};
let faded=false;document.querySelector('#cutaway').onclick=e=>{faded=!faded;e.currentTarget.classList.toggle('active',faded);if(model)model.traverse(o=>{if(o.isMesh&&/wall|shell/i.test(o.name)){o.material.transparent=faded;o.material.opacity=faded?.48:1;o.material.depthWrite=!faded}})};
document.querySelector('#schemeQuick').onclick=()=>openDrawer('layout');
const initialParams=new URLSearchParams(location.search);
daylight=initialParams.get('daylight')!=='0';
const canonicalUrl=new URL(location.href);canonicalUrl.searchParams.delete('scheme');history.replaceState(null,'',canonicalUrl);
document.querySelector('#ceilingNote').textContent=AGREED_SCOPE.ceiling;
const facts=document.querySelector('#designFacts');
const factRows=[['Lighting','15 installation groups + sink strip'],['Fans','Living + Bedroom 2 + Bedroom 3'],['Master','One dimmable ceiling light; no fan or curtain box'],['Wardrobes','Bedroom 2: unlit niche + mirror. Bedroom 3: full cabinet, no niche.'],['Finishes',AGREED_SCOPE.wallPaint+'. Matt-white ceilings; existing glossy tile and bedroom floor retained.'],['Kitchen',AGREED_SCOPE.kitchen],['Yard',AGREED_SCOPE.yard],['Appliances',AGREED_SCOPE.appliances]];
for(const [label,value] of factRows){const row=document.createElement('div');row.className='design-fact';const title=document.createElement('strong');title.textContent=label;const detail=document.createElement('span');detail.textContent=value;row.append(title,detail);facts.append(row);}
const pending=document.createElement('p');pending.className='note';pending.textContent='Pending: '+AGREED_SCOPE.pending.slice(0,4).join(' · ');facts.append(pending);
syncLights();syncEnvironment();
const initialView=initialParams.get('view');
if(initialView==='inside')setInside(true);
if(initialView==='tv'){indoorPlace('living');controls.target.set(3.10,1.03,-7.62);camera.position.set(1.34,1.58,-7.60);controls.update()}
if(initialView==='sofa'){indoorPlace('living');controls.target.set(.91,.72,-7.66);camera.position.set(2.71,1.54,-5.83);controls.update()}
if(initialView==='dining'){indoorPlace('dining');controls.target.set(DINING.centre[0],.95,-DINING.centre[1]);camera.position.set(.65,1.57,-(DINING.centre[1]-1.30));controls.update()}
if(initialView==='b2inside')indoorPlace('b2');
if(initialView==='b2cabinet'){indoorPlace('b2');controls.target.set(4.88,1.35,-6.77);camera.position.set(5.18,1.57,-8.24);controls.update()}
if(initialView==='b3inside')indoorPlace('b3');
if(initialView==='b3cabinet'){indoorPlace('b3');controls.target.set(6.30,1.30,-4.82);camera.position.set(5.33,1.57,-3.35);controls.update()}
if(initialView==='masterinside')indoorPlace('master');
if(initialView==='shoe'){setInside(true);controls.target.set(1.47,1.43,-.47);camera.position.set(-1.10,1.65,2.00);controls.update()}
if(initialView==='b2')selectRoom('B2');
if(initialView==='yard')selectRoom('Yard');
if(initialView==='kitchen')indoorPlace('kitchen');
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(!inside)focusRoom(activeRoom)}addEventListener('resize',resize);resize();
// Never cap the loop below 60 Hz. Scale internal resolution only if this device
// cannot sustain the display's cadence; the badge reports observed FPS.
let frameCount=0,frameWindowStart=performance.now(),renderDpr=maxDpr,qualityCooldown=0;
function animate(now){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);if(measureOn)drawMeasurements();
 frameCount++;if(now-frameWindowStart>2500){const fps=Math.round(frameCount*1000/(now-frameWindowStart));document.querySelector('#fpsBadge').textContent=`FPS ${fps}`;
  if(now>qualityCooldown){const next=fps<59?Math.max(.90,renderDpr-.10):fps>=60?Math.min(maxDpr,renderDpr+.03):renderDpr;
   if(Math.abs(next-renderDpr)>.03){renderDpr=next;renderer.setPixelRatio(renderDpr);renderer.setSize(innerWidth,innerHeight,false);qualityCooldown=now+6000}}
  frameCount=0;frameWindowStart=now}}
requestAnimationFrame(animate);

window.serinaViewer={snapshot:()=>({revision:AGREED_SCOPE.revision,inside,daylight,room:activeRoom,lighting:{areas:areaPool.map(l=>l.intensity),spots:spotPool.map(l=>({intensity:l.intensity,position:l.position.toArray(),target:l.target.position.toArray()})),bounce:hemi.intensity},door:(()=>{const d=scene.getObjectByName('PD yard door outward opening single leaf no cat hole');const b=new THREE.Box3().setFromObject(d);return {direction:'outward to yard',foldJoints:d.children.filter(m=>m.isGroup).length,hinge:[d.position.x,-d.position.z],angle:d.rotation.y*180/Math.PI,bounds:{min:b.min.toArray(),max:b.max.toArray()}}})(),camera:[camera.position.x,camera.position.y,camera.position.z],look:[controls.target.x,controls.target.y,controls.target.z],frameRate:document.querySelector('#fpsBadge').textContent,renderDpr,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,sourcePoints:points.filter(p=>p.sourcePixel).map(p=>({id:p.id,pixel:p.sourcePixel,pos:p.pos})),fixtures:lightCircuits.map(c=>({id:c.id,room:c.room,kind:c.kind,installed:c.installed,centre:c.centre,on:c.on,physicalVisible:c.group.visible,feed:c.feed||c.id,route:c.route,heads:c.heads,lights:c.lights.map(l=>({visible:l.visible,intensity:l.intensity}))})),fans:fanGroups.map(g=>({name:g.name,...g.userData,x:g.position.x,y:-g.position.z})),dining:DINING,scope:AGREED_SCOPE,meshes:interior.children.map(m=>({name:m.name,x:m.position.x,y:-m.position.z,height:m.position.y}))}),setAllLights:on=>{for(const c of lightCircuits)c.on=on;syncLights();renderLightSwitches();},stand:indoorPlace};
