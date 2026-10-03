import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {ROOM_SURVEY,ROOM_FEATURES,UNLOCATED_POINTS,fixtureMeta} from './planning-data.js';

RectAreaLightUniformsLib.init();

const TYPES={light:{label:'Light point',color:0xffd166},fan:{label:'Fan point',color:0x6aa9ff},socket:{label:'Socket / power',color:0x56d68b},data:{label:'TV / fibre',color:0xb18cff},fixed:{label:'Air-con / water heater',color:0x4dd7e7},proposed:{label:'Proposed',color:0xff835c}};
const ROOMS=['全屋','玄关','客厅','餐厅','厨房','Yard','走道','主人房','B2','B3','Bath 1','Bath 2','AC Ledge'];
const ROOM_LABELS={'全屋':'Whole home','玄关':'Entry','客厅':'Living room','餐厅':'Dining','厨房':'Kitchen','Yard':'Yard','走道':'Hall','主人房':'Master bedroom','B2':'Bedroom 2','B3':'Bedroom 3','Bath 1':'Bath 1','Bath 2':'Bath 2','AC Ledge':'AC ledge'};
const P=(id,room,type,x,y,z,title,spec,note,status='现有')=>({id,room,type,pos:[x,z,-y],title,spec,note,status});
let points=[
 P('F-L1','玄关','light',.82,.58,2.72,'玄关灯位','1 × ceiling light point','装低矮广角吸顶灯；保留现有点位。'),
 P('F-S1','玄关','socket',1.48,.72,.30,'玄关 13A 插座','1 × single 13A','供吸尘器或鞋柜设备；柜体下单前现场确认。'),
 P('L-L1','客厅','light',1.60,7.95,2.72,'客厅灯位 L1','1 × ceiling light point','建议广角防眩吸顶灯，与 L2 成对。'),
 P('L-L2','客厅','light',1.60,6.50,2.72,'客厅灯位 L2','1 × ceiling light point','避免窄角射灯直射亮面地砖。'),
 P('L-FAN','客厅','fan',1.60,7.22,2.75,'客厅风扇钩位','1 × fan point / hook','建议 48 英寸 DC 吊扇；灯具需避开扇叶扫掠。'),
 P('L-S1','客厅','socket',.24,6.65,.30,'沙发墙插座 1','1 × single 13A','保留；供边几、循环扇或充电。'),
 P('L-S2','客厅','socket',.24,8.25,.30,'沙发墙插座 2','1 × single 13A','保留；沙发落位后确认不被完全遮挡。'),
 P('L-S3','客厅','socket',3.11,6.65,.30,'电视墙单插座','1 × single 13A','靠走道一侧。'),
 P('L-S4','客厅','socket',3.11,7.68,.30,'电视墙双插座','1 × double 13A','电视柜媒体设备主电源。'),
 P('L-D1','客厅','data',3.10,7.42,.35,'电视与光纤点','TV + fibre point','电视柜继续放在此墙，避免重新拉明线。'),
 P('L-AC','客厅','fixed',3.08,6.05,2.52,'客厅冷气电源','1.5HP AC point','冷气在走道侧高位；管路按管理处许可处理。'),
 P('D-L1','餐厅','light',1.45,4.32,2.72,'餐厅主灯位','1 × ceiling light point','1600mm 餐桌最终落位后才定吊灯中心。'),
 P('K-L1','厨房','light',2.95,1.25,2.72,'厨房主灯位','1 × ceiling light point','线性广角吸顶灯；台面另加柜底工作灯。'),
 P('K-S1','厨房','socket',2.42,.22,1.00,'厨房台面组 A','1 × 13A + 1 × 15A','小电器与高负载电器分开；现场确认回路。'),
 P('K-S2','厨房','socket',3.43,.22,1.00,'厨房台面组 B','1 × 13A + 1 × 15A','不得被上柜或 backsplash 覆盖。'),
 P('K-FR','厨房','socket',1.94,2.18,1.00,'冰箱电源','1 × dedicated power point','冰箱柜必须预留插头、散热与检修位。'),
 P('Y-L1','Yard','light',4.80,1.30,2.72,'Yard 灯位','1 × ceiling light point','防潮广角吸顶灯。'),
 P('Y-S1','Yard','socket',4.32,.25,1.00,'Yard 插座 1','1 × power point','洗衣机 / 烘干机位置按设备规格复核。'),
 P('Y-S2','Yard','socket',4.86,.25,1.00,'Yard 插座 2','1 × power point','洗衣机与烘干机叠放；避免插座落在机身正后方。'),
 P('Y-S3','Yard','socket',5.22,2.36,1.00,'Yard 插座 3','1 × power point','可供清洁电器；位置以现场为准。'),
 P('H-L1','走道','light',4.85,5.92,2.72,'房间外走道灯','1 × ceiling light point','小型广角吸顶灯即可。'),
 P('M-L1','主人房','light',8.70,8.28,2.72,'主人房灯位 1','1 × ceiling light point','三点位中选照度均匀的组合；不装风扇。'),
 P('M-L2','主人房','light',8.70,7.20,2.72,'主人房灯位 2','1 × ceiling light point','使用低眩光吸顶灯，床上不见裸光源。'),
 P('M-L3','主人房','light',8.70,6.02,2.72,'主人房灯位 3','1 × ceiling light point','可作为入口补光，分回路更实用。'),
 P('M-FAN','主人房','fan',8.66,7.20,2.75,'主人房原风扇点','1 × fan point / hook','目前决定不装风扇；保留并封盖，不破坏日后选择。'),
 P('M-S1','主人房','socket',6.53,8.35,.30,'主人房双插座 A','1 × double 13A','床头墙一侧；具体面板位置现场复量。'),
 P('M-S2','主人房','socket',9.42,7.15,.30,'主人房双插座 B','1 × double 13A','对面实墙；具体面板位置现场复量。'),
 P('M-S3','主人房','socket',6.53,6.35,.30,'主人房单插座','1 × single 13A','床头墙门侧；具体面板位置现场复量。'),
 P('M-AC','主人房','fixed',7.55,5.55,2.52,'主人房冷气电源','1.0HP AC point','Panasonic X-Premium 方案；排水坡度现场确认。'),
 P('B2-L1','B2','light',4.85,8.48,2.72,'B2 灯位 1','1 × ceiling light point','方形广角吸顶灯，避开扇叶扫掠。'),
 P('B2-L2','B2','light',4.85,7.12,2.72,'B2 灯位 2','1 × ceiling light point','与 L1 前后分布，避免风扇中心落入直接光束。'),
 P('B2-F','B2','fan',4.85,7.80,2.75,'B2 风扇钩位','1 × fan point / hook','建议 33 英寸低矮 DC 吊扇；必须复核衣柜门开启。'),
 P('B2-S1','B2','socket',3.48,8.42,.30,'B2 插座 1','1 × single 13A','书桌设备使用；若不足采用家具后明装线槽。'),
 P('B2-S2','B2','socket',6.25,7.68,.30,'B2 插座 2','1 × single 13A','柜体开口的小循环扇需要电源；不可从照明开关直接取电，可由此插座经柜内可检修明装线槽供电，现场确认。'),
 P('B2-AC','B2','fixed',5.78,6.56,2.52,'B2 冷气电源','1.0HP AC point','门上高位；不改墙内线路。'),
 P('B3-L1','B3','light',5.82,3.98,2.72,'B3 灯位 1','1 × ceiling light point','广角吸顶灯，兼顾衣柜正面照度。'),
 P('B3-L2','B3','light',6.95,3.98,2.72,'B3 灯位 2','1 × ceiling light point','避免灯在睡眠者视线正上方。'),
 P('B3-F','B3','fan',6.39,3.98,2.75,'B3 风扇钩位','1 × fan point / hook','建议 33 英寸低矮 DC 吊扇。'),
 P('B3-S1','B3','socket',5.00,4.62,.30,'B3 插座 1','1 × single 13A','客床或清洁使用。'),
 P('B3-S2','B3','socket',7.72,3.52,.30,'B3 插座 2','1 × single 13A','衣柜下单前核对是否被侧板遮挡。'),
 P('B3-AC','B3','fixed',5.38,5.18,2.52,'B3 冷气电源','1.0HP AC point','低使用频率房，Standard PU 可满足。'),
 P('B1-L','Bath 1','light',8.90,4.05,2.72,'Bath 1 灯位','1 × ceiling light point','IP44 或以上广角防潮灯。'),
 P('B1-WH','Bath 1','fixed',9.45,4.72,1.85,'Bath 1 热水器位','1 × water-heater outlet','由合格电工确认隔离开关和接地。'),
 P('B1-M','Bath 1','proposed',8.26,4.55,1.75,'Bath 1 镜柜电源','建议预留电源','若管理处不准开槽，采用柜内隐蔽表面线槽。','建议新增'),
 P('B2B-L','Bath 2','light',4.08,4.02,2.72,'Bath 2 灯位','1 × ceiling light point','IP44 或以上广角防潮灯。'),
 P('B2B-WH','Bath 2','fixed',3.62,4.72,1.85,'Bath 2 热水器位','1 × water-heater outlet','隔离开关须位于安全区。'),
 P('B2B-M','Bath 2','proposed',4.54,3.45,1.75,'Bath 2 镜柜电源','建议预留电源','优先从现有回路表面走线，不凿结构墙。','建议新增'),
 P('AC-1','AC Ledge','fixed',5.82,.55,1.10,'冷气机位组','4 台 compressor 对应电源/隔离','最终电源与管径由冷气承包商逐台标注；发展商图未列普通插座。')
 ];
// Lighting/fan points below are rebuilt from the RIGHT-HAND Type A unit in
// Electrical Detail Unit.pdf (foyer west/left, yard and ledge central).
// Socket/data points remain hidden by default until elevation-by-elevation audit.
points=points.filter(p=>!['light','fan'].includes(p.type)&&!['F-S1','B2-S1','B2-S2','AC-1'].includes(p.id));
points.push(
 P('L-L1','客厅','light',1.62,8.62,2.72,'客厅窗侧灯位','Developer ceiling light point','右侧 Type A 电气图原始灯点；坐标为按图转译，须现场复量。','图纸转译'),
 P('L-L2','客厅','light',1.62,6.72,2.72,'客厅餐厅侧灯位','Developer ceiling light point','右侧 Type A 电气图原始灯点；须现场复量。','图纸转译'),
 P('L-FAN','客厅','fan',1.62,7.68,2.75,'客厅风扇钩位','Developer fan point / hook','位于两颗原始灯点之间；须现场复量。','图纸转译'),
 P('D-L1','餐厅','light',1.62,4.35,2.72,'餐厅原灯点','Developer ceiling light point','按右侧 Type A 电图，原灯点接近餐厅区域中心；与 Bath 2 墙侧方案的餐桌中心有约 400mm 横向偏差。坐标仍须现场复量。','图纸转译'),
 P('F-L1','玄关','light',1.05,1.35,2.72,'玄关与厨房前段共用原灯点','Developer ceiling light point','原灯点紧邻玄关内门；平面图没有第三颗独立的玄关灯。','图纸转译'),
 P('K-L2','厨房','light',3.02,1.35,2.72,'厨房灯位 2','Developer ceiling light point','靠湿区台面一侧的原始点。','图纸核实'),
 P('Y-L1','Yard','light',4.78,1.30,2.72,'Yard 灯位','Developer ceiling light point','右侧 Type A yard 原始点。','图纸核实'),
 P('H-L1','走道','light',4.85,5.78,2.72,'房间外走道灯位','Developer ceiling light point','浴室与卧室之间走道原始点；须现场复量。','图纸转译'),
 P('M-L1','主人房','light',8.10,8.45,2.72,'主人房窗侧灯位','Developer ceiling light point','方案供窗帘盒隐藏向下灯带；实际走线需在窗帘盒内可检修。','图纸核实'),
 P('M-L2','主人房','light',8.10,6.72,2.72,'主人房门侧灯位','Developer ceiling light point','右侧 Type A 原始点；现场复量。','图纸转译'),
 P('M-L3','主人房','light',8.10,5.78,2.72,'主人房入门前段灯位','Developer ceiling light point','第三颗原灯点在主人房入口与套卫动线附近；现场复量。','图纸转译'),
 P('M-FAN','主人房','fan',8.10,7.62,2.75,'主人房中央原风扇钩位','Developer fan point / hook','方案改为中央薄吸顶灯；原风扇钩处理及接线须电工现场确认。','图纸转译'),
 P('B2-L1','B2','light',4.85,8.62,2.72,'B2 窗侧灯位','Developer ceiling light point','右侧 Type A 原始点；须现场复量。','图纸转译'),
 P('B2-L2','B2','light',4.85,6.73,2.72,'B2 门侧灯位','Developer ceiling light point','右侧 Type A 图还有这颗原始灯点；旧网页遗漏。','图纸转译'),
 P('B2-F','B2','fan',4.85,7.68,2.75,'B2 原风扇钩位','Developer fan point / hook','方案改为中央薄吸顶灯；原风扇钩处理及接线须电工现场确认。','图纸转译'),
 P('B3-L1','B3','light',5.20,3.98,2.72,'B3 靠 Bath 2 原灯位','Developer ceiling light point','方案安装小型可调角度壁扇并吊装在天花；核对吊装额定固定、供电、摆头范围。','图纸核实'),
 P('B3-L2','B3','light',7.55,3.98,2.72,'B3 右侧灯位','Developer ceiling light point','右侧 Type A 原始点。','图纸核实'),
 P('B3-F','B3','fan',6.38,3.98,2.75,'B3 中央原风扇钩位','Developer fan point / hook','方案改为中央薄吸顶灯；原风扇钩处理及接线须电工现场确认。','图纸核实'),
 P('B1-L','Bath 1','light',8.72,4.18,2.72,'Bath 1 天花灯位','Developer ceiling light point','防潮灯具，现场再量出线口。','图纸核实'),
 P('B2B-L','Bath 2','light',4.05,4.18,2.72,'Bath 2 天花灯位','Developer ceiling light point','防潮灯具，现场再量出线口。','图纸核实')
);
// The source drawing uses Chinese annotations, but the user-facing viewer is
// English throughout. Keep the original IDs and coordinates for audit.
const englishPointDetails={
 'F-S1':['Entry 13A socket','Check that the shoe cabinet leaves this outlet accessible.'],
 'L-S1':['Sofa-wall socket 1','Keep accessible for a side lamp, circulator or charging.'],
 'L-S2':['Sofa-wall socket 2','Confirm that the final sofa does not cover the faceplate.'],
 'L-S3':['TV-wall single socket','Single 13A outlet toward the hall end.'],
 'L-S4':['TV-wall double socket','Main power for the TV and media equipment.'],
 'L-D1':['TV and fibre point','Keep the TV on this wall to avoid exposed new wiring.'],
 'L-AC':['Living air-con power','Verify the 1.5 HP unit route and drainage on site.'],
 'K-S1':['Kitchen counter power A','Verify the 13A/15A circuit and keep clear of the backsplash.'],
 'K-S2':['Kitchen counter power B','Verify the 13A/15A circuit and keep clear of upper cabinets.'],
 'K-FR':['Fridge power point','Leave plug, ventilation and maintenance access behind the fridge cabinet.'],
 'Y-S1':['Yard socket 1','Marker location is provisional; confirm power reaches the washer at the Bath 2 service end.'],
 'Y-S2':['Yard socket 2','Marker location is provisional; confirm dryer power and safe cable routing at the service end.'],
 'Y-S3':['Yard socket 3','Confirm the outlet and AC-ledge-door clearance before ordering storage.'],
 'M-S1':['Master double socket A','Check the bedside location after bed placement.'],
 'M-S2':['Master double socket B','Check the opposite wall location on site.'],
 'M-S3':['Master single socket','Check the door-side location on site.'],
 'M-AC':['Master air-con power','Confirm the 1.0 HP unit, condensate fall and pipe route.'],
 'B2-S1':['Bedroom 2 desk socket','Confirm the desk can reach this outlet without exposed cables.'],
 'B2-S2':['Bedroom 2 wardrobe-side socket','A niche circulator needs accessible socket power; do not use a switched light feed.'],
 'B2-AC':['Bedroom 2 air-con power','Confirm the 1.0 HP unit route above the entry.'],
 'B3-S1':['Bedroom 3 socket 1','Check against the guest bed and cabinet.'],
 'B3-S2':['Bedroom 3 socket 2','Ensure the four-door wardrobe does not block this outlet.'],
 'B3-AC':['Bedroom 3 air-con power','Confirm the occasional-use 1.0 HP unit route.'],
 'B1-WH':['Bath 1 water-heater outlet','Electrician to check isolation and earthing.'],
 'B1-M':['Bath 1 mirror-cabinet power · proposed','Route visibly within cabinetry if wall chasing is prohibited.'],
 'B2B-WH':['Bath 2 water-heater outlet','Electrician to check the isolator and wet-area clearance.'],
 'B2B-M':['Bath 2 mirror-cabinet power · proposed','Use an accessible surface route if wall chasing is prohibited.'],
 'AC-1':['AC ledge equipment power','Confirm each condenser isolator and route with the air-con contractor.'],
 'L-L1':['Living window-side original light point','Developer Type A drawing translation; verify on site.'],
 'L-L2':['Living dining-side original light point','Developer Type A drawing translation; verify on site.'],
 'L-FAN':['Living original fan hook','Structural anchor required for the 48-inch fan; check clearances.'],
 'D-L1':['Dining original light point','The flat-ceiling table pendant is centred on furniture, not on this original outlet.'],
 'F-L1':['Entry original light point','Developer Type A drawing translation; verify on site.'],
 'K-L2':['Kitchen original light point','Developer Type A drawing translation; verify on site.'],
 'Y-L1':['Yard original light point','Developer Type A drawing translation; verify on site.'],
 'H-L1':['Hall original light point','Developer Type A drawing translation; verify on site.'],
 'M-L1':['Master window-side original light point','Developer Type A drawing translation; verify on site.'],
 'M-L2':['Master door-side original light point','Developer Type A drawing translation; verify on site.'],
 'M-L3':['Master entrance original light point','Developer Type A drawing translation; verify on site.'],
 'M-FAN':['Master original fan hook','No master fan is planned; keep this point safely capped.'],
 'B2-L1':['Bedroom 2 window-side original light point','Developer Type A drawing translation; verify on site.'],
 'B2-L2':['Bedroom 2 door-side original light point','Developer Type A drawing translation; verify on site.'],
 'B2-F':['Bedroom 2 original fan hook','The current scheme uses a slim ceiling light and a niche circulator.'],
 'B3-L1':['Bedroom 3 Bath-2-side original light point','Proposed compact ceiling-mounted wall fan needs rated fixing and wiring checks.'],
 'B3-L2':['Bedroom 3 second original light point','Developer Type A drawing translation; verify on site.'],
 'B3-F':['Bedroom 3 original fan hook','The retained first scheme uses a central slim ceiling light here.'],
 'B1-L':['Bath 1 original light point','Use a suitably rated wet-area fitting.'],
 'B2B-L':['Bath 2 original light point','Use a suitably rated wet-area fitting.']
};
for(const p of points){
 const details=englishPointDetails[p.id];
 if(details){p.title=details[0];p.note=details[1]}
 if(['B1-M','B2B-M'].includes(p.id))p.spec='Proposed mirror-cabinet power';
 if(p.id==='AC-1')p.spec='Power and isolation for four condensers';
 p.status=p.type==='proposed'?'Proposed · not approved':'Plan indication · verify on site';
}

const canvas=document.querySelector('#scene'); const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
const isMobile=matchMedia('(max-width: 720px)').matches;
const maxDpr=Math.min(devicePixelRatio,isMobile?1.35:1.8);
renderer.setPixelRatio(maxDpr);renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.96;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
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
 wx(1.795,5.37,.08);wx(7.82,8.08,2.60);openingX(8.08,8.63,2.60,1.55,2.15);wx(8.63,9.57,2.60);
 // The outer foyer threshold is the grill. The actual inward-opening main
 // door is on the inner transverse wall at y=1.00 beside the shoe cabinet.
 wx(.09,.15,1.00);inwardEntry(.15,1.07,1.00);wx(1.07,1.795,1.00);
 wy(1.795,.08,1.00);wy(.09,.08,1.00,1.0);
 // B2 and corridor; the master entry is in its west partition.
 wy(3.245,6.353,9.05);wx(3.245,5.225,6.353);doorX(5.225,6.025,6.353);wx(6.025,6.29,6.353);
 wy(6.29,6.25,9.05);doorY(6.29,5.35,6.25);wy(6.29,5.20,5.35);
 // Bathrooms and B3 block, with plan-correct entries.
 wy(3.245,2.60,5.20);wy(4.775,2.60,5.20);wy(7.82,2.60,5.20);
 wx(3.245,4.025,5.20);doorX(4.025,4.775,5.20);
 wx(4.775,4.955,5.20);doorX(4.955,5.855,5.20);wx(5.855,8.02,5.20);doorX(8.02,8.82,5.20);wx(8.82,9.57,5.20);
 wx(3.245,4.15,2.60);openingX(4.15,4.70,2.60,1.55,2.15);wx(4.70,4.775,2.60);
 wx(4.775,6.605,2.60);twoBayWindow(6.605,7.705,2.60);wx(7.705,7.82,2.60);
 // Actual unit photo: on the kitchen wall the door is north/left and the
 // retained louvre window south/right, separated by a solid 180 mm mullion.
 wy(4.04,.08,.32);openingY(4.04,.32,.92,.90,2.145);wy(4.04,.92,1.10);
 doorY(4.04,1.10,1.80);wy(4.04,1.80,2.60);
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
 lightCab:new THREE.MeshStandardMaterial({color:0xb9b8b3,roughness:.72}),
 counter:new THREE.MeshStandardMaterial({color:0xdcd7cc,roughness:.48}),
 bed:new THREE.MeshPhysicalMaterial({color:0xd7d4cd,roughness:.88}),
 wood:new THREE.MeshStandardMaterial({color:0x756e66,roughness:.76}),
 metal:new THREE.MeshStandardMaterial({color:0x30343a,roughness:.35,metalness:.7}),
 glass:new THREE.MeshPhysicalMaterial({color:0x91b3bf,roughness:.12,transmission:.55,transparent:true,opacity:.55}),
 screen:new THREE.MeshStandardMaterial({color:0x101215,roughness:.35}),
 ceramic:new THREE.MeshPhysicalMaterial({color:0xf3f3ef,roughness:.16,clearcoat:.45})
};
function travertineTexture(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#d9d3c7';g.fillRect(0,0,512,512);let seed=314159;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<32;i++){const y=rand()*512;g.strokeStyle=`rgba(124,116,99,${.025+rand()*.075})`;g.lineWidth=1+rand()*5;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(100,y-9+rand()*18,320,y-9+rand()*18,512,y-5+rand()*10);g.stroke()}for(let i=0;i<2800;i++){g.fillStyle=`rgba(105,98,82,${.018+rand()*.052})`;g.fillRect(rand()*512,rand()*512,1+rand()*13,.3+rand()*2)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const travertineMat=new THREE.MeshPhysicalMaterial({map:travertineTexture(),roughness:.62,clearcoat:.07,clearcoatRoughness:.55});
function greyAshTexture(){const c=document.createElement('canvas');c.width=256;c.height=768;const g=c.getContext('2d');g.fillStyle='#a8aaa6';g.fillRect(0,0,c.width,c.height);let seed=3184;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<1100;i++){const x=rand()*256,w=.2+rand()*1.7;g.strokeStyle=`rgba(65,70,68,${.010+rand()*.035})`;g.lineWidth=w;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x-3+rand()*6,220,x-4+rand()*8,520,x-3+rand()*6,768);g.stroke()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const greyAshMat=new THREE.MeshStandardMaterial({map:greyAshTexture(),roughness:.86});
// Repeat the light upper/fridge door finish on the open prep base. Bedroom
// wardrobes are a slightly cooler matte mineral grey; niches keep one quiet
// grey-ash grain rather than the former orange-brown lining.
mats.islandCabinet=mats.lightCab;
mats.wardrobeCab=new THREE.MeshStandardMaterial({color:0xc5c5c1,roughness:.88});
mats.nicheWood=greyAshMat;
const interior=new THREE.Group();interior.visible=true;scene.add(interior);
function linenTexture(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#e5ddd0';g.fillRect(0,0,256,256);let seed=1978;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<13000;i++){const v=130+Math.floor(rand()*85);g.fillStyle=`rgba(${v},${v-4},${v-10},${.035+rand()*.075})`;g.fillRect(rand()*256,rand()*256,rand()*2+.4,rand()*5+.6)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,5);return t}
function box(name,x,y,z,w,d,h,mat,r=.04){const g=r?new RoundedBoxGeometry(w,h,d,4,r):new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(g,mat);m.name=name;m.position.set(x,z+h/2,-y);m.castShadow=true;m.receiveShadow=true;interior.add(m);return m}
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
 const geom=new THREE.PlaneGeometry(width,2.52,32,1),v=geom.attributes.position;
 for(let i=0;i<v.count;i++)v.setZ(i,Math.sin((v.getX(i)/width+.5)*Math.PI*10)*depth);
 geom.computeVertexNormals();const mesh=new THREE.Mesh(geom,material);mesh.name=name;mesh.position.set(cx,1.32,-planY);mesh.castShadow=true;interior.add(mesh);
}
function windowTreatments(){
 romanBlind('living full-width blind',.57,2.82,8.91);
 romanBlind('B2 full-width blind',3.75,5.95,8.91);
 const sheer=new THREE.MeshPhysicalMaterial({color:0xefeee9,roughness:1,transparent:true,opacity:.56,side:THREE.DoubleSide,depthWrite:false});
 const drape=new THREE.MeshPhysicalMaterial({color:0xbdbbb5,roughness:1,side:THREE.DoubleSide});
 box('master full-wall double curtain ceiling rail',7.93,8.82,2.58,3.22,.08,.055,mats.lightCab,.009);
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
function coverMaterial(color,title,accent){const c=document.createElement('canvas');c.width=256;c.height=352;const g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,256,352);g.fillStyle=accent;g.fillRect(18,72,220,210);g.fillStyle='rgba(255,255,255,.82)';g.font='bold 38px sans-serif';g.fillText(title,18,52);g.font='18px sans-serif';g.fillText('HOME  •  DESIGN',18,325);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:t,roughness:.83,side:THREE.DoubleSide})}
function magazineRack(){
 // Slim wall-mounted display ledge from the supplied reference, replacing
 // the old floor-standing TV cabinet. The TV itself stays wall mounted.
 box('magazine rack slim black tray',3.055,7.62,.24,.18,2.36,.028,mats.black,.006);
 box('magazine rack low front lip',2.971,7.62,.268,.012,2.36,.042,mats.black,.003);
 for(const y of [6.48,8.76])box('magazine rack wall bracket',3.128,y,.25,.018,.025,.26,mats.metal,.004);
 box('magazine rack fine retaining rail',2.955,7.62,.53,.012,2.36,.012,mats.metal,.004);
 for(const y of [6.48,8.76])box('magazine rack connected rail return',3.04,y,.524,.19,.012,.012,mats.metal,.003);
 for(const [y,mat] of [[7.10,coverMaterial('#346887','FORM','#80a8b5')],[7.57,coverMaterial('#383b41','SPACE','#a88c70')],[8.04,coverMaterial('#aa8d73','LIVING','#d2bd9e')]]){
  const cover=box('magazine displayed cover',3.118,y,.28,.018,.34,.34,mat,.005);cover.rotation.y=.08;
 }
}
function buildInterior(){
 windowTreatments();
 // Living: standalone King Living 1978 planning geometry and a single table.
 sofa();
 // A low oval table keeps clear of the chaise and still leaves the TV-side aisle.
 const coffeeTop=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.048,48),mats.black);
 coffeeTop.name='low oval black coffee table top';coffeeTop.scale.set(.72,1,.98);coffeeTop.position.set(1.92,.365,-7.05);coffeeTop.castShadow=true;interior.add(coffeeTop);
 box('coffee table slim central pedestal',1.92,7.05,.035,.18,.42,.305,mats.black,.04);
 box('coffee table recessed oval foot',1.92,7.05,.018,.46,.66,.026,mats.black,.08);
 magazineRack();
 box('wall mounted provisional 65in TV screen lower seated-eye height',3.120,7.62,.82,.050,1.46,.82,mats.screen,.012);
 // Dining: bench sits beside the Bath 2 wall; table and two chairs face it.
 // Keep 150 mm between the wall and bench back, about 245 mm between bench
 // and tabletop, and room for chairs to pull out toward the sofa-wall side.
 box('dining table 1600 travertine top',2.20,4.35,.71,.80,1.60,.055,travertineMat,.032);
 for(const y of [3.84,4.86]){
  box('dining table sculpted black blade pedestal',2.20,y,.035,.34,.075,.665,mats.metal,.018);
  box('dining table black pedestal foot',2.20,y,.018,.53,.24,.035,mats.metal,.015);
  box('dining table underside support',2.20,y,.675,.55,.13,.035,mats.metal,.012);
 }
 box('dining bench light greige upholstered cushion',2.88,4.35,.43,.43,1.55,.095,mats.linen,.048);
 box('dining bench black inset underframe',2.88,4.35,.385,.34,1.44,.040,mats.metal,.014);
 for(const y of [3.74,4.96])for(const x of [2.72,3.04])box('dining bench slim black leg',x,y,.02,.025,.025,.39,mats.metal,.006);
 diningChair('dining chair 1',1.72,3.98,-1);
 diningChair('dining chair 2',1.72,4.72,-1);
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
 box('wet run quartz top',3.0075,.46,.88,2.065,.66,.045,mats.counter,.01);
 box('wet run upper carcass',3.0075,.33,1.46,2.065,.40,.74,mats.lightCab,.012);
 box('wet run loft carcass',3.0075,.33,2.20,2.065,.40,.47,mats.lightCab,.012);
 let upperX=2.025;
 for(const [i,width] of [.60,.60,.75].entries()){
  const x=upperX+width/2;
  box('wet '+Math.round(width*1000)+' daily upper door '+(i+1),x,.538,1.47,width-.015,.016,.72,mats.lightCab,.004);
  box('wet '+Math.round(width*1000)+' loft door '+(i+1),x,.538,2.21,width-.015,.016,.45,mats.lightCab,.004);
  upperX+=width;
 }
 box('integrated hood below hob upper',2.325,.60,1.43,.55,.38,.11,mats.graphite,.012);
 // Original Plan: Bath 2's dining-side face (x=3.165) continues into the
 // fridge tall-unit cheek. Keep the fixed bathroom wall; align cabinetry to it.
 // The fridge opening is provisional until the selected appliance is measured.
 box('fridge cabinet dining-facing grey ash side panel',3.175,2.23,.02,.025,.72,2.67,greyAshMat,.004);
 box('fridge cabinet kitchen side panel',4.015,2.23,.02,.025,.72,2.67,mats.lightCab,.004);
 box('fridge cabinet bridge top',3.595,2.23,2.55,.86,.72,.12,mats.lightCab,.006);
 box('fridge cabinet overhead door',3.595,1.86,2.02,.82,.025,.53,mats.lightCab,.006);
 box('fridge cabinet plinth',3.595,2.23,.02,.86,.72,.08,mats.graphite,.005);
 box('fridge appliance body provisional 650W',3.595,2.19,.10,.59,.61,1.88,mats.metal,.025);
 box('fridge upper door',3.595,1.87,.94,.56,.022,1.04,mats.graphite,.018);
 box('fridge freezer drawer',3.595,1.87,.12,.56,.022,.82,mats.graphite,.018);
 box('fridge door split line',3.595,1.852,.93,.55,.005,.008,mats.black,.001);
 box('fridge upper recessed handle',3.355,1.842,1.73,.015,.009,.20,mats.black,.002);
 // Finish the open preparation run at the aligned cheek, avoiding overlap.
 box('dry preparation base 1370',2.48,2.27,.02,1.37,.60,.86,mats.islandCabinet,.012);
 let dryX=1.795;
 for(const [i,width] of [.40,.50,.47].entries()){
  box('dry prep '+Math.round(width*1000)+' front',dryX+width/2,1.958,.08,width-.008,.018,.76,mats.islandCabinet,.004);
  for(const z of [.31,.55])box('dry prep drawer seam '+i,dryX+width/2,1.946,z,width-.02,.007,.006,mats.graphite,.001);
  dryX+=width;
 }
 box('open dry preparation counter',2.48,2.27,.88,1.37,.64,.045,mats.counter,.012);
 box('hob inset',2.325,.45,.925,.56,.44,.012,mats.black,.012);
 box('sink rim',3.60,.45,.925,.67,.49,.013,mats.metal,.014);
 box('sink bowl',3.60,.45,.939,.60,.42,.012,mats.graphite,.014);
 // Entry shoe cabinet beside the inner main door, not beside the outer grill.
 // Owner target: a 2700 mm cabinet BODY floated 120 mm above the finished
 // floor. Its nominal top is 2820 mm under the 2850 mm slab; the remaining
 // 30 mm is a site-cut scribe. Width/depth are visual targets pending Ace's
 // final measurement and a check of the inward-opening main-door swing.
 box('entry floating shoe cabinet carcass 820W 380D 2700H',1.48,.48,.12,.38,.82,2.70,mats.lightCab,.008);
 // Four practical door leaves, rather than a single 2700 mm hinged leaf.
 for(const y of [.275,.685]){
  box('entry lower handleless shoe door',1.279,y,.132,.018,.398,1.32,mats.lightCab,.003);
  box('entry upper handleless shoe door',1.279,y,1.468,.018,.398,1.34,mats.lightCab,.003);
  box('entry lower shadow pull',1.267,y,1.448,.004,.384,.012,mats.graphite,.001);
 }
 box('entry cabinet horizontal shadow reveal',1.267,.48,1.461,.004,.805,.012,mats.graphite,.001);
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
 // switch stays accessible and a small desktop circulator can sit on a shelf.
 box('B2 three-door gear wardrobe carcass',4.02,6.77,.02,1.48,.60,2.71,mats.wardrobeCab,.012);
 for(let i=0;i<3;i++){
  const x=3.526+i*.494;
  box('B2 wardrobe door '+(i+1),x,7.079,.10,.477,.018,2.58,mats.wardrobeCab,.005);
  box('B2 wardrobe slim pull '+(i+1),x+.18,7.091,1.10,.009,.008,.14,mats.metal,.003);
 }
 box('B2 door-side small niche lower cabinet',4.97,6.77,.02,.42,.60,.93,mats.wardrobeCab,.009);
 box('B2 door-side small niche upper cabinet',4.97,6.77,1.55,.42,.60,1.18,mats.wardrobeCab,.009);
 // Only the inner divider is continuous; the door-facing end is open at
 // niche height, so the display cavity can be accessed from two sides.
 box('B2 niche inner divider',4.76,6.77,.02,.018,.60,2.71,mats.wardrobeCab,.003);
 box('B2 niche warm wood lower shelf',4.97,6.78,.95,.40,.56,.025,mats.nicheWood,.003);
 box('B2 niche warm wood upper soffit',4.97,6.78,1.53,.40,.56,.025,mats.nicheWood,.003);
 box('B2 niche warm wood inner reveal',4.775,6.77,.975,.015,.58,.555,mats.nicheWood,.002);
 box('B2 niche wood-lined back with switch cutout',4.97,6.465,.975,.40,.012,.555,mats.nicheWood,.002);
 box('B2 existing switch exposed in niche back',5.11,6.479,1.12,.075,.012,.11,mats.ceramic,.002);
 box('B2 wardrobe recessed plinth',4.225,7.075,.02,1.90,.025,.075,mats.graphite,.002);
 const b2Circulator=new THREE.Group();b2Circulator.name='B2 small circulator in open wardrobe niche';b2Circulator.position.set(4.92,.98,-6.81);interior.add(b2Circulator);
 const b2FanMat=new THREE.MeshStandardMaterial({color:0x34383a,roughness:.58});
 const b2FanBase=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.035,24),b2FanMat);b2FanBase.position.y=.018;b2Circulator.add(b2FanBase);
 const b2FanStand=new THREE.Mesh(new THREE.CylinderGeometry(.013,.013,.13,12),b2FanMat);b2FanStand.position.y=.09;b2Circulator.add(b2FanStand);
 const b2FanCage=new THREE.Mesh(new THREE.TorusGeometry(.115,.009,8,32),b2FanMat);b2FanCage.position.y=.175;b2Circulator.add(b2FanCage);
 for(let i=0;i<3;i++){const blade=new THREE.Mesh(new RoundedBoxGeometry(.075,.011,.028,2,.007),b2FanMat);blade.position.set(.042*Math.cos(i*2*Math.PI/3),.175,.042*Math.sin(i*2*Math.PI/3));blade.rotation.y=i*2*Math.PI/3;b2Circulator.add(blade)}
 // B3 stays a four-bay wardrobe. Only the first 450 mm bay beside the door
 // has a modest two-sided cutout; the other three doors stay full height.
 box('B3 wardrobe three full-door carcass',7.045,4.82,.02,1.35,.60,2.62,mats.wardrobeCab,.012);
 for(const x of [6.595,7.045,7.495])box('B3 wardrobe full-height door',x,4.509,.09,.435,.018,2.49,mats.wardrobeCab,.004);
 box('B3 first-door lower section',6.145,4.82,.02,.45,.60,.93,mats.wardrobeCab,.009);
 box('B3 first-door upper section',6.145,4.82,1.55,.45,.60,1.09,mats.wardrobeCab,.009);
 box('B3 small niche inner divider',6.37,4.82,.02,.018,.60,2.62,mats.wardrobeCab,.003);
 box('B3 small niche warm wood lower shelf',6.145,4.82,.95,.43,.57,.025,mats.nicheWood,.003);
 box('B3 small niche warm wood upper soffit',6.145,4.82,1.53,.43,.57,.025,mats.nicheWood,.003);
 box('B3 small niche warm wood inner reveal',6.355,4.82,.975,.015,.58,.555,mats.nicheWood,.002);
 box('B3 small niche warm wood back',6.145,5.115,.975,.43,.012,.555,mats.nicheWood,.002);
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
 // Actual unit photos show grey bathroom tiles, a toilet midway down each
 // outer wall and an open shower at the window end of both bathrooms.
 box('bath1 vanity cabinet',9.24,4.895,.02,.50,.45,.78,mats.lightCab,.02);
 box('bath2 vanity cabinet',3.66,4.895,.02,.50,.45,.78,mats.lightCab,.02);
 box('bath1 basin',9.24,4.895,.80,.46,.39,.10,mats.ceramic,.065);
 box('bath2 basin',3.66,4.895,.80,.46,.39,.10,mats.ceramic,.065);
 box('bath1 mirror cabinet',9.24,5.03,1.05,.48,.11,.85,mats.graphite,.012);
 box('bath2 mirror cabinet',3.66,5.03,1.05,.48,.11,.85,mats.graphite,.012);
 box('bath1 WC tank',9.27,4.02,.02,.23,.42,.72,mats.ceramic,.055);
 box('bath1 WC pan',8.96,4.02,.02,.55,.43,.42,mats.ceramic,.16);
 box('bath2 WC tank',3.53,4.02,.02,.23,.42,.72,mats.ceramic,.055);
 box('bath2 WC pan',3.84,4.02,.02,.55,.43,.42,mats.ceramic,.16);
}
buildShell();buildSurfaces();buildInterior();fitWholeHome();
// Concept geometry only: the existing L-L1 is ~430 mm from the model's
// window-wall centreline. The developer drawing does not dimension that point.
// Both light channels are shown as one visual proposal, not a lux simulation.
const ceilingConcept=new THREE.Group();ceilingConcept.name='Living curtain pelmet + west-wall uplight concept';scene.add(ceilingConcept);
const pelmetMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0,roughness:.95,side:THREE.DoubleSide});
// Approximate 3500 K after visual white balance; avoid an orange cast that
// incorrectly turns Jotun Summer Snow into tan in the night preview.
const LIGHT_3500K=0xffead6;
const stripMat=new THREE.MeshStandardMaterial({color:0xffe1bd,emissive:LIGHT_3500K,emissiveIntensity:1.5,roughness:.45});
function ceilingPiece(name,x,planY,w,d,bottom,h,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,bottom+h/2,-planY);ceilingConcept.add(m);return m}
// Slim curtain pelmet: the room-side lip and LED sit below the original
// 2.85 m slab, while the existing glazed opening and window remain visible.
ceilingPiece('living window full-wall pelmet upper return',1.6675,8.845,2.995,.28,2.825,.025,pelmetMat);
ceilingPiece('living window full-wall pelmet room-side lip 300mm drop',1.6675,8.705,2.995,.035,2.550,.300,pelmetMat);
const windowStrip=ceilingPiece('living window concealed downward 3500K strip',1.6675,8.805,2.90,.018,2.555,.010,stripMat);
// The LED itself sits behind the pelmet lip: from the room only the curtain
// wash should be visible, never a luminous line of LED pixels.
windowStrip.visible=false;
// The single-eyelid shelf follows the continuous west/sofa wall and ends just
// inside the actual inward-opening main door, without a wall plaster cornice.
ceilingPiece('west wall single eyelid 300mm drop fascia',.178,4.93,.022,7.56,2.550,.300,pelmetMat);
ceilingPiece('west wall single eyelid upward lip',.205,4.93,.095,7.56,2.550,.026,pelmetMat);
const westStrip=ceilingPiece('west wall concealed upward 3500K strip',.212,4.93,.012,7.48,2.577,.009,stripMat);
function softWashTexture(horizontal=true){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const grad=horizontal?g.createLinearGradient(0,0,256,0):g.createLinearGradient(0,0,0,256);grad.addColorStop(0,'rgba(255,228,181,.56)');grad.addColorStop(.26,'rgba(255,231,194,.29)');grad.addColorStop(1,'rgba(255,235,208,0)');g.fillStyle=grad;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const washMat=horizontal=>new THREE.MeshBasicMaterial({map:softWashTexture(horizontal),transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,toneMapped:false});
const westWash=new THREE.Mesh(new THREE.PlaneGeometry(.78,7.56),washMat(true));westWash.rotation.x=-Math.PI/2;westWash.position.set(.55,2.795,-4.93);westWash.renderOrder=2;ceilingConcept.add(westWash);
// The upward strip also catches the inner vertical face of the shallow cove.
// Keep it one continuous wash along the wall, not individual LED hot spots.
const coveFaceCanvas=document.createElement('canvas');coveFaceCanvas.width=32;coveFaceCanvas.height=256;
const coveFaceCtx=coveFaceCanvas.getContext('2d');const coveFaceGradient=coveFaceCtx.createLinearGradient(0,0,0,256);
coveFaceGradient.addColorStop(0,'rgba(255,239,212,.12)');coveFaceGradient.addColorStop(.55,'rgba(255,232,195,.28)');coveFaceGradient.addColorStop(1,'rgba(255,220,170,.50)');
coveFaceCtx.fillStyle=coveFaceGradient;coveFaceCtx.fillRect(0,0,32,256);
const coveFaceTexture=new THREE.CanvasTexture(coveFaceCanvas);coveFaceTexture.colorSpace=THREE.SRGBColorSpace;
const coveFaceWash=new THREE.Mesh(new THREE.PlaneGeometry(7.50,.28),new THREE.MeshBasicMaterial({map:coveFaceTexture,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
coveFaceWash.rotation.y=Math.PI/2;coveFaceWash.position.set(.193,2.705,-4.93);coveFaceWash.renderOrder=2;ceilingConcept.add(coveFaceWash);
const curtainWash=new THREE.Mesh(new THREE.PlaneGeometry(2.90,2.34),new THREE.MeshBasicMaterial({map:softWashTexture(false),transparent:true,opacity:.72,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));curtainWash.position.set(1.6675,1.39,-8.86);curtainWash.renderOrder=2;ceilingConcept.add(curtainWash);
// Master: a restrained full-window pelmet fed from the existing window-side
// light point. The actual LED remains hidden behind the room-side lip.
const masterPelmetReturn=ceilingPiece('master full-wall curtain pelmet upper return',7.93,8.84,3.25,.24,2.825,.025,pelmetMat);
const masterPelmetLip=ceilingPiece('master full-wall curtain pelmet room side lip',7.93,8.705,3.25,.035,2.66,.19,pelmetMat);
const masterCurtainWash=new THREE.Mesh(new THREE.PlaneGeometry(3.18,2.19),new THREE.MeshBasicMaterial({map:softWashTexture(false),transparent:true,opacity:.58,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));masterCurtainWash.position.set(7.93,1.50,-8.715);masterCurtainWash.renderOrder=2;ceilingConcept.add(masterCurtainWash);
const flatCeiling=new THREE.Group();flatCeiling.name='Common, master and B2 flat ceiling scheme';scene.add(flatCeiling);
const flatMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.16,roughness:.96,side:THREE.DoubleSide});
function flatSlab(name,x,planY,w,d){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,.045,d),flatMat);mesh.name=name;mesh.position.set(x,2.775,-planY);mesh.userData.footprint={x,planY,w,d};mesh.receiveShadow=true;flatCeiling.add(mesh);return mesh}
function flatPolygon(name,outline){
 const xs=outline.map(p=>p[0]),ys=outline.map(p=>p[1]);
 const x=(Math.min(...xs)+Math.max(...xs))/2,planY=(Math.min(...ys)+Math.max(...ys))/2;
 const mesh=new THREE.Mesh(new THREE.BufferGeometry(),flatMat);
 mesh.name=name;mesh.userData.footprint={x,planY,w:Math.max(...xs)-Math.min(...xs),d:Math.max(...ys)-Math.min(...ys)};
 mesh.userData.outline=outline;mesh.receiveShadow=true;flatCeiling.add(mesh);return mesh;
}
// Finished underside = 2.7525 m, approximately 100 mm below the 2.85 m slab.
// One polygon follows the kitchen, entry, living and hall footprints. This
// removes the false transverse joints previously visible in the hall.
flatPolygon('seamless common and hall ceiling',[
 [.17,1.08],[1.88,1.08],[1.88,.17],[3.95,.17],[3.95,2.60],
 [3.16,2.60],[3.16,5.28],[6.21,5.28],[6.21,6.273],
 [3.16,6.273],[3.16,8.80],[.17,8.80]
]);
flatSlab('master full-room plane',7.935,7.04,3.09,3.52); // y 5.28–8.80
flatSlab('bedroom 2 full-room plane',4.77,7.615,2.88,2.37); // y 6.43–8.80
// B3 keeps the original ceiling and original-point lighting/fan arrangement.
ceilingConcept.visible=true;flatCeiling.visible=false;
// An opaque slab is enabled only for the first-person preview. Keeping it
// separate makes the normal plan inspectable without pretending it is a cutaway.
const indoorCeiling=new THREE.Group();indoorCeiling.visible=false;scene.add(indoorCeiling);
const ceilingMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0,roughness:.96,side:THREE.DoubleSide});
// The dry interior has one continuous white ceiling. Separate slabs at each
// room boundary left visible seams above the dining/Bath 2 and TV/B2 walls.
for(const [x,planY,w,d] of [[4.83,5.825,9.48,6.45],[2.065,1.34,3.95,2.52],[4.705,1.34,1.33,2.52]]){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,.04,d),ceilingMat);m.position.set(x,2.87,-planY);m.receiveShadow=true;indoorCeiling.add(m);
}
const lightCircuits=[];
let lightingScheme='local';
const fixtureNames={'L-L2':'Living room globe pendant','D-L1':'Dining slim ceiling light','F-L1':'Entry slim ceiling light','K-L2':'Kitchen slim ceiling light','Y-L1':'Yard light','H-L1':'Hall light','M-FAN':'Master bedroom slim ceiling light','B2-F':'Bedroom 2 slim ceiling light','B3-F':'Bedroom 3 slim ceiling light','B1-L':'Bath 1 light','B2B-L':'Bath 2 light'};
const defaultLights=new Set(['L-L1','L-L2','D-L1','F-L1','K-L2','SOFA-COVE','M-L1','B2-F','B3-F']);
// Broad, continuous luminous washes are visual placeholders for the concealed
// linear strips. Do not fake them with separate point lights: those create
// scallops and make the strip look like a row of spotlights.
// The concealed strips use continuous visual washes only. Separate point
// lights would create false bright spots on the ceiling and window wall.
lightCircuits.push({id:'L-L1',room:'客厅',name:'Window pelmet downlight strip',scheme:'local',on:true,objects:[curtainWash]});
lightCircuits.push({id:'SOFA-COVE',room:'客厅',name:'Sofa-wall uplight strip · concept',scheme:'local',on:true,objects:[westStrip,westWash,coveFaceWash]});
lightCircuits.push({id:'M-L1',room:'主人房',name:'Master window pelmet hidden strip',scheme:'local',on:true,objects:[masterCurtainWash]});
// Bedside sources sit below eye height and are controlled separately from the
// ceiling. The bedroom can be used at night without looking into a ceiling LED.
for(const [id,planY] of [['M-BEDSIDE-ENTRY',6.50],['M-BEDSIDE-WINDOW',8.72]]){
 const x=6.72;
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.082,.09,.028,32),new THREE.MeshStandardMaterial({color:0x555958,roughness:.77}));base.position.set(x,.477,-planY);interior.add(base);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.19,16),new THREE.MeshStandardMaterial({color:0x555958,roughness:.77}));stem.position.set(x,.58,-planY);interior.add(stem);
 const shadeOff=new THREE.MeshStandardMaterial({color:0xc5c6c1,roughness:.94,side:THREE.DoubleSide});
 const shadeOn=new THREE.MeshStandardMaterial({color:0xd0ccc2,emissive:LIGHT_3500K,emissiveIntensity:.12,roughness:.94,side:THREE.DoubleSide});
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(.095,.125,.145,32,1,true),shadeOff);shade.position.set(x,.725,-planY);interior.add(shade);
 const lamp=new THREE.PointLight(LIGHT_3500K,.38,1.65,2);lamp.position.set(x,.68,-planY);lamp.visible=false;scene.add(lamp);
 lightCircuits.push({id,room:'主人房',name:planY<7?'Entry-side shielded bedside lamp':'Window-side shielded bedside lamp',scheme:'both',on:true,light:lamp,lens:shade,onMat:shadeOn,offMat:shadeOff,objects:[base,stem,shade],keepObjects:true});
}
// Scheme 3 keeps B2's existing ceiling and adds a plug-in task light at the
// desk. This lets the broad room light be turned down/off for monitor work.
const b2DeskLamp=new THREE.Group();b2DeskLamp.name='Bedroom 2 adjustable desk lamp';b2DeskLamp.visible=false;interior.add(b2DeskLamp);
const deskMetal=new THREE.MeshStandardMaterial({color:0x292c2c,roughness:.68});
const taskBase=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.018,28),deskMetal);taskBase.position.set(3.52,.77,-7.82);b2DeskLamp.add(taskBase);
const taskStem=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.32,12),deskMetal);taskStem.position.set(3.52,.93,-7.82);b2DeskLamp.add(taskStem);
const taskArm=new THREE.Mesh(new THREE.CylinderGeometry(.007,.007,.27,12),deskMetal);taskArm.rotation.z=Math.PI/2;taskArm.position.set(3.65,1.08,-7.82);b2DeskLamp.add(taskArm);
const taskShade=new THREE.Mesh(new THREE.CylinderGeometry(.038,.085,.085,28,1,true),deskMetal);taskShade.position.set(3.78,1.045,-7.82);b2DeskLamp.add(taskShade);
const taskDiffuserOff=new THREE.MeshStandardMaterial({color:0xe5e2d9,roughness:.9,side:THREE.DoubleSide});
const taskDiffuserOn=new THREE.MeshBasicMaterial({color:0xfff0dd,side:THREE.DoubleSide});
const taskDiffuser=new THREE.Mesh(new THREE.CircleGeometry(.070,28),taskDiffuserOff);taskDiffuser.rotation.x=-Math.PI/2;taskDiffuser.position.set(3.78,1.000,-7.82);b2DeskLamp.add(taskDiffuser);
const b2TaskLight=new THREE.SpotLight(LIGHT_3500K,1.1,1.3,.55,1,1.3);b2TaskLight.position.set(3.78,.99,-7.82);b2TaskLight.target.position.set(3.77,.73,-8.11);b2TaskLight.visible=false;scene.add(b2TaskLight,b2TaskLight.target);
lightCircuits.push({id:'HY-B2-DESK',room:'B2',name:'Plug-in adjustable desk task lamp',scheme:'hybrid',on:true,light:b2TaskLight,lens:taskDiffuser,onMat:taskDiffuserOn,offMat:taskDiffuserOff,group:b2DeskLamp});
const fixtureShellMat=new THREE.MeshStandardMaterial({color:0xf5f5f2,roughness:.78});
const diffuserOnMat=new THREE.MeshBasicMaterial({color:0xfff0d9});
const diffuserOffMat=new THREE.MeshStandardMaterial({color:0xe6e6e2,roughness:.9});
for(const [id,room,x,planY] of [['B2-NICHE','B2',4.97,6.78],['B3-NICHE','B3',6.145,4.82]]){
 const lens=new THREE.Mesh(new THREE.CylinderGeometry(.029,.029,.006,24),diffuserOffMat);lens.name=room+' wood niche recessed puck';lens.position.set(x,1.515,-planY);interior.add(lens);
 const lamp=new THREE.PointLight(LIGHT_3500K,.62,1.05,2);lamp.position.set(x,1.47,-planY);lamp.visible=false;scene.add(lamp);
 lightCircuits.push({id,room,name:'Wood niche display light · concept',scheme:'both',on:true,light:lamp,lens});
}
const unusedRoomLightPoints=new Set(['L-L1','M-L1','M-L2','M-L3','B2-L1','B2-L2','B3-L1','B3-L2']);
for(const p of points.filter(p=>(p.type==='light'&&!unusedRoomLightPoints.has(p.id))||['M-FAN','B2-F','B3-F'].includes(p.id))){
 const [x,,z]=p.pos,planY=-z,shape=p.id==='K-L2'?'linear':p.id.startsWith('B2-')?'square':'round';
 if(p.id==='L-L2'){
  // Keep the developer's outlet fixed. A visible swag cable runs from its
  // canopy to a surface-mounted hook 450 mm toward the dining room.
  const pendantZ=planY-.45, globeY=2.31;
  const canopy=new THREE.Mesh(new THREE.CylinderGeometry(.082,.082,.028,32),fixtureShellMat.clone());canopy.position.set(x,2.804,-planY);canopy.name='living original ceiling point canopy';indoorCeiling.add(canopy);
  const hook=new THREE.Mesh(new THREE.TorusGeometry(.023,.006,8,24),new THREE.MeshStandardMaterial({color:0x303031,roughness:.62}));hook.rotation.x=Math.PI/2;hook.position.set(x,2.796,-pendantZ);hook.name='surface hook toward dining';indoorCeiling.add(hook);
  const cableMat=new THREE.MeshStandardMaterial({color:0x292a2a,roughness:.8});
  function cord(a,b,r){const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),cableMat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());indoorCeiling.add(m);return m}
  const lead=cord(new THREE.Vector3(x,2.789,-planY),new THREE.Vector3(x,2.785,-pendantZ),.006);
  const drop=cord(new THREE.Vector3(x,2.785,-pendantZ),new THREE.Vector3(x,globeY+.18,-pendantZ),.006);
  const globeOff=new THREE.MeshStandardMaterial({color:0xeae8e2,roughness:.72,emissive:0xffffff,emissiveIntensity:0});
  const globeOn=new THREE.MeshStandardMaterial({color:0xe4ddd2,roughness:.58,emissive:LIGHT_3500K,emissiveIntensity:.25});
  const globe=new THREE.Mesh(new THREE.SphereGeometry(.18,32,20),globeOff);globe.position.set(x,globeY,-pendantZ);globe.name='opal globe pendant 360mm concept';indoorCeiling.add(globe);
  const lamp=new THREE.PointLight(LIGHT_3500K,2.1,4.5,1.75);lamp.position.set(x,globeY,-pendantZ);lamp.visible=false;scene.add(lamp);
  lightCircuits.push({id:p.id,room:p.room,name:fixtureNames[p.id],scheme:'local',on:defaultLights.has(p.id),light:lamp,lens:globe,onMat:globeOn,offMat:globeOff,keepObjects:true,objects:[canopy,hook,lead,drop,globe]});
  continue;
 }

 const power=p.room==='客厅'?1.7:p.room==='餐厅'?1.3:p.room==='厨房'?1.5:p.room==='玄关'?.9:p.room.startsWith('Bath')?.7:1;
 // Broad diffuser: a surface-mounted fixture sits below the slab and lights
 // a wide area. Its shell remains visible when switched off.
 const light=new THREE.SpotLight(LIGHT_3500K,power*5.7,7.0,1.30,1,1.3);
 light.position.set(x,2.705,-planY);light.target.position.set(x,.15,-planY);light.visible=false;scene.add(light,light.target);
 const small=p.room==='玄关'||p.room.startsWith('Bath');
 const radius=small?.17:p.room==='客厅'?.285:.235;
 const ultraThin=['D-L1','F-L1','K-L2','M-FAN','B2-F','B3-F'].includes(p.id),housingHeight=ultraThin?.030:.075;
 const shellGeom=shape==='linear'?new THREE.BoxGeometry(.88,housingHeight,.32):shape==='square'?new THREE.BoxGeometry(.48,housingHeight,.48):new THREE.CylinderGeometry(radius,radius,housingHeight,48);
 const shell=new THREE.Mesh(shellGeom,fixtureShellMat.clone());shell.material.emissive.set(0xffffff);shell.name=(fixtureNames[p.id]||p.title)+' surface-mount housing';shell.position.set(x,ultraThin?2.79:2.77,-planY);indoorCeiling.add(shell);
 const geom=shape==='linear'?new THREE.BoxGeometry(.82,.012,.27):shape==='square'?new THREE.BoxGeometry(.43,.012,.43):new THREE.CylinderGeometry(radius-.025,radius-.025,.012,48);
 const lens=new THREE.Mesh(geom,diffuserOffMat);lens.name=(fixtureNames[p.id]||p.title)+' broad diffuser';lens.position.set(x,ultraThin?2.766:2.726,-planY);indoorCeiling.add(lens);
 lightCircuits.push({id:p.id,room:p.room,name:fixtureNames[p.id]||p.title,scheme:['Y-L1','B1-L','B2B-L','B3-F'].includes(p.id)?'both':'local',on:defaultLights.has(p.id),light,lens,shell});
}
const flatFixtures=new THREE.Group();flatFixtures.name='Flat scheme fixtures';scene.add(flatFixtures);
const flatShell=new THREE.MeshStandardMaterial({color:0xf3f3f0,roughness:.85});
const flatBlack=new THREE.MeshStandardMaterial({color:0x252829,roughness:.55});
const deepCupMat=new THREE.MeshStandardMaterial({color:0x171919,roughness:.93,side:THREE.BackSide});
const flatApertures=[];
function flatLight(id,room,name,x,planY,{kind='downlight',scheme='full',on=true,power=1.25,aimX=x,aimPlanY=planY,beamAngle=.80}={}){
 const group=new THREE.Group();group.name=name;flatFixtures.add(group);
 let lens;
 if(kind==='pendant'){
  // 1200 mm linear up/down fitting, centred over the 1600 mm dining table.
  for(const offset of [-.46,.46]){
   const canopy=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.015,24),flatBlack);canopy.position.set(x,2.735,-planY-offset);group.add(canopy);
   const cable=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.93,8),flatBlack);cable.position.set(x,2.26,-planY-offset);group.add(cable);
  }
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.075,.065,1.20),flatBlack);bar.position.set(x,1.76,-planY);group.add(bar);
  lens=new THREE.Mesh(new THREE.BoxGeometry(.052,.008,1.14),diffuserOffMat);lens.position.set(x,1.724,-planY);group.add(lens);
  const uplens=new THREE.Mesh(new THREE.BoxGeometry(.035,.004,1.08),diffuserOffMat);uplens.position.set(x,1.795,-planY);group.add(uplens);
  group.userData.uplens=uplens;
 }else if(kind==='islandPendant'||kind==='miniIslandPendant'){
  // Scheme 3 preserves the requested three pendants, but uses 120 mm shades
  // and a higher, lighter silhouette over the compact 1370 mm counter.
  const mini=kind==='miniIslandPendant';
  const shadeTop=mini?2.02:1.87;
  const shadeY=mini?1.97:1.80;
  const lensY=mini?1.918:1.727;
  group.userData.extraLights=[];group.userData.extraLenses=[];
  for(const offset of mini?[-.38,0,.38]:[-.42,0,.42]){
   const px=x+offset;
   const canopy=new THREE.Mesh(new THREE.CylinderGeometry(mini?.028:.036,mini?.028:.036,.015,24),flatBlack);canopy.position.set(px,2.735,-planY);group.add(canopy);
   const cable=new THREE.Mesh(new THREE.CylinderGeometry(.0025,.0025,2.73-shadeTop,8),flatBlack);cable.position.set(px,(2.73+shadeTop)/2,-planY);group.add(cable);
   const shade=new THREE.Mesh(new THREE.CylinderGeometry(mini?.032:.045,mini?.060:.105,mini?.10:.14,32,1,true),flatBlack);shade.position.set(px,shadeY,-planY);group.add(shade);
   const pendantLens=new THREE.Mesh(new THREE.CircleGeometry(mini?.051:.088,32),diffuserOffMat);pendantLens.rotation.x=-Math.PI/2;pendantLens.position.set(px,lensY,-planY);group.add(pendantLens);
   if(offset===0)lens=pendantLens;
   else{
    group.userData.extraLenses.push(pendantLens);
    const extra=new THREE.SpotLight(LIGHT_3500K,mini?1.85:2.35,2.0,mini?.43:.49,1,1.35);
    extra.position.set(px,mini?1.91:1.72,-planY);extra.target.position.set(px,.88,-planY);
    scene.add(extra,extra.target);group.userData.extraLights.push(extra);
   }
  }
  // Approximate soft bounce from the lit counter and light floor onto its
  // dining-facing base; direct-only WebGL would render the pale grey as black.
  const bounce=new THREE.RectAreaLight(LIGHT_3500K,mini?.90:1.15,1.28,.82);
  bounce.position.set(x,1.55,-planY-.91);bounce.lookAt(x,.45,-planY-.26);
  scene.add(bounce);group.userData.bounce=bounce;
 }else if(kind==='downlight'){
  // 120 mm cut-out with a matte black 56 mm-deep baffle. The diffuser sits
  // behind the cut-off edge, inside the 100 mm ceiling void.
  flatApertures.push({x,planY,r:.060});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.046,.060,40),new THREE.MeshStandardMaterial({color:0x191c1d,roughness:.88,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(x,2.749,-planY);group.add(ring);
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(.046,.046,.056,40,1,true),deepCupMat);cup.position.set(x,2.779,-planY);group.add(cup);
  lens=new THREE.Mesh(new THREE.CylinderGeometry(.043,.043,.004,40),diffuserOffMat);lens.position.set(x,2.806,-planY);group.add(lens);
 }else{
  const shape=kind==='linear'?new THREE.BoxGeometry(.95,.016,.22):new THREE.CylinderGeometry(.23,.23,.028,48);
  const bezel=new THREE.Mesh(shape,flatShell);bezel.position.set(x,2.745,-planY);group.add(bezel);
  const aperture=kind==='linear'?new THREE.BoxGeometry(.90,.007,.17):new THREE.CylinderGeometry(.205,.205,.006,48);
  lens=new THREE.Mesh(aperture,diffuserOffMat);lens.position.set(x,2.728,-planY);group.add(lens);
 }
 const lamp=kind==='pendant'?new THREE.SpotLight(LIGHT_3500K,8.0,4.0,1.03,1,1.3):kind==='islandPendant'||kind==='miniIslandPendant'?new THREE.SpotLight(LIGHT_3500K,kind==='miniIslandPendant'?1.85:2.35,2.0,kind==='miniIslandPendant'?.43:.49,1,1.35):new THREE.SpotLight(LIGHT_3500K,power*(kind==='downlight'?3.7:5.5),5.0,kind==='downlight'?beamAngle:1.20,1,1.35);
 lamp.position.set(x,kind==='pendant'?1.72:kind==='miniIslandPendant'?1.91:kind==='islandPendant'?1.72:kind==='downlight'?2.805:2.70,-planY);
 lamp.target.position.set(aimX,kind==='pendant'?.70:kind==='islandPendant'||kind==='miniIslandPendant'?.88:.20,-aimPlanY);scene.add(lamp.target);
 scene.add(lamp);
 lightCircuits.push({id,room,name,scheme,on,light:lamp,lens,group,kind});
}
function flatStrip(id,room,name,x,planY,w,windowSide='north'){
 const group=new THREE.Group();group.name=name;flatFixtures.add(group);
 const sign=windowSide==='north'?1:-1;
 // The recess lip is flush with the 2.75 m ceiling underside. Light is
 // concealed inside the 100 mm void; only the continuous reflected wash shows.
 const lip=new THREE.Mesh(new THREE.BoxGeometry(w,.035,.035),flatMat);lip.position.set(x,2.77,-planY+sign*.012);group.add(lip);
 const returnFace=new THREE.Mesh(new THREE.BoxGeometry(w,.078,.012),flatMat);returnFace.position.set(x,2.805,-planY+sign*.112);group.add(returnFace);
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(w-.08,.22),new THREE.MeshBasicMaterial({map:softWashTexture(false),transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));glow.rotation.x=-Math.PI/2;glow.position.set(x,2.842,-planY+sign*.12);glow.renderOrder=3;group.add(glow);group.userData.glow=glow;
 const wash=new THREE.Mesh(new THREE.PlaneGeometry(w-.08,1.02),new THREE.MeshBasicMaterial({map:softWashTexture(false),transparent:true,opacity:.51,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));wash.position.set(x,2.27,-planY-sign*.075);wash.renderOrder=2;group.add(wash);
 // One continuous area emitter, not a point source or row of spotlights.
 const lamp=new THREE.RectAreaLight(LIGHT_3500K,1.65,w-.08,.08);
 lamp.position.set(x,2.785,-planY-sign*.10);
 lamp.lookAt(x,1.35,-planY-sign*.25);
 scene.add(lamp);
 lightCircuits.push({id,room,name,scheme:'full',on:true,light:lamp,group,wash});
}
flatStrip('FL-L-W','客厅','Living concealed window strip',1.665,8.80,2.75);
// No ceiling fixture is over the two-seat module or chaise. The front light
// is beyond the sofa's leading edge; two others serve the TV-side circulation.
for(const [id,x,y,name] of [['FL-L-F',.48,5.87,'Living wall-side circulation downlight'],['FL-L-T1',2.66,6.55,'Living TV-side downlight A'],['FL-L-T2',2.66,8.20,'Living TV-side downlight B']])
 flatLight(id,'客厅',name,x,y,{power:x<1?.68:1.00,aimX:x<1?.91:2.40,beamAngle:x<1?.64:.72});
flatLight('FL-D-P','餐厅','Dining linear up/down pendant',2.20,4.35,{kind:'pendant'});
flatLight('FL-E','玄关','Entry anti-glare downlight',.88,1.71,{power:.85});
flatLight('FL-K-1','厨房','Wet-counter anti-glare downlight A',2.40,.98,{power:.96,aimX:2.40,aimPlanY:.71,beamAngle:.62});
flatLight('FL-K-2','厨房','Wet-counter anti-glare downlight B',3.20,.98,{power:.96,aimX:3.20,aimPlanY:.71,beamAngle:.62});
flatLight('FL-K-FR','厨房','Fridge-front anti-glare downlight',3.65,1.55,{power:.74,aimX:3.59,aimPlanY:1.78,beamAngle:.60});
flatLight('FL-K-ISLAND','厨房','Three prep-counter down-facing pendants',2.48,2.27,{kind:'islandPendant',scheme:'fullOnly',power:1.05});
flatLight('HY-K-ISLAND','厨房','Three compact prep-counter pendants',2.48,2.27,{kind:'miniIslandPendant',scheme:'hybrid',power:.85});
flatLight('FL-H-1','走道','Hall anti-glare deep-cup downlight A',3.98,5.77,{power:.72,beamAngle:.70});
flatLight('FL-H-2','走道','Hall anti-glare deep-cup downlight B',5.52,5.77,{power:.72,beamAngle:.70});
flatStrip('FL-M-W','主人房','Master concealed window strip',7.93,8.80,2.98);
flatLight('FL-M-A','主人房','Master foot-side deep-cup downlight',8.91,6.33,{power:.58,aimX:8.91,aimPlanY:6.20,beamAngle:.60});
flatLight('FL-M-B','主人房','Master entrance deep-cup downlight',7.15,5.75,{power:.55,aimX:7.05,aimPlanY:5.70,beamAngle:.60});
flatStrip('FL-B2-W','B2','Bedroom 2 concealed window strip',4.77,8.80,2.73);
flatLight('FL-B2-D','B2','Bedroom 2 desk-aisle 60° deep-cup downlight',4.13,7.50,{power:.66,aimX:4.34,aimPlanY:7.42,beamAngle:Math.PI/6});
flatLight('FL-B2-C','B2','Bedroom 2 wardrobe 60° deep-cup downlight',5.43,7.36,{power:.64,aimX:5.48,aimPlanY:6.98,beamAngle:Math.PI/6});
const taskGroup=new THREE.Group();taskGroup.name='Kitchen concealed under-cabinet task strip';flatFixtures.add(taskGroup);
const taskProfile=new THREE.Mesh(new THREE.BoxGeometry(1.70,.018,.024),flatShell);taskProfile.position.set(3.02,1.447,-.54);taskGroup.add(taskProfile);
const taskLens=new THREE.Mesh(new THREE.BoxGeometry(1.66,.006,.016),diffuserOffMat);taskLens.position.set(3.02,1.433,-.54);taskGroup.add(taskLens);
const taskLight=new THREE.SpotLight(LIGHT_3500K,3.0,2.0,.88,1,1.5);taskLight.position.set(3.02,1.42,-.54);taskLight.target.position.set(3.02,.89,-.46);scene.add(taskLight,taskLight.target);
lightCircuits.push({id:'FL-K-TASK',room:'厨房',name:'Kitchen continuous under-cabinet task strip',scheme:'full',on:true,light:taskLight,lens:taskLens,group:taskGroup});
// Replace each plain slab by the same slab with real circular recessed holes.
// The local 2D Y coordinate maps to plan Y after the -90° rotation about X.
function insideOutline(x,y,outline){
 let hit=false;
 for(let i=0,j=outline.length-1;i<outline.length;j=i++){
  const a=outline[i],b=outline[j];
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
 }
 return hit;
}
for(const slab of flatCeiling.children){
 const {x,planY,w,d}=slab.userData.footprint;
 const outline=slab.userData.outline;
 const holes=flatApertures.filter(h=>outline?insideOutline(h.x,h.planY,outline):Math.abs(h.x-x)+h.r<w/2&&Math.abs(h.planY-planY)+h.r<d/2);
 if(!holes.length&&!outline)continue;
 const shape=new THREE.Shape();
 if(outline){shape.moveTo(outline[0][0]-x,outline[0][1]-planY);for(const point of outline.slice(1))shape.lineTo(point[0]-x,point[1]-planY);shape.closePath()}
 else{shape.moveTo(-w/2,-d/2);shape.lineTo(w/2,-d/2);shape.lineTo(w/2,d/2);shape.lineTo(-w/2,d/2);shape.closePath()}
 for(const hole of holes){const path=new THREE.Path();path.absarc(hole.x-x,hole.planY-planY,hole.r,0,Math.PI*2,true);shape.holes.push(path)}
 slab.geometry.dispose();slab.geometry=new THREE.ExtrudeGeometry(shape,{depth:.045,steps:1,bevelEnabled:false,curveSegments:40});
 slab.position.set(x,2.7525,-planY);slab.rotation.x=-Math.PI/2;
}
const commonRooms=new Set(['客厅','餐厅','玄关','厨房','走道']);
function circuitActive(c){
 if(c.scheme==='both')return true;
 if(lightingScheme==='hybrid'){
  if(c.scheme==='hybrid')return true;
  if(c.scheme==='fullOnly')return false;
  return commonRooms.has(c.room)?c.scheme==='full':c.scheme==='local';
 }
 return c.scheme===lightingScheme||(lightingScheme==='full'&&c.scheme==='fullOnly');
}
function syncLights(){
 const commonFlat=inside&&lightingScheme!=='local';
 flatCeiling.visible=commonFlat;flatFixtures.visible=commonFlat;
 for(const slab of flatCeiling.children)slab.visible=lightingScheme==='full'||slab.name==='seamless common and hall ceiling';
 ceilingConcept.visible=lightingScheme!=='full';
 for(const piece of ceilingConcept.children){
  if(piece===windowStrip){piece.visible=false;continue}
  if([curtainWash,westStrip,westWash,coveFaceWash,masterCurtainWash].includes(piece))continue;
  piece.visible=lightingScheme==='local'||piece.name.startsWith('master');
 }
 syncFanHeights();
 for(const c of lightCircuits){
  const active=inside&&circuitActive(c);
  if(c.light)c.light.visible=active&&c.on;
  if(c.lens){c.lens.visible=active;c.lens.material=c.on?(c.onMat||diffuserOnMat):(c.offMat||diffuserOffMat)}
  if(c.shell){c.shell.visible=active;c.shell.material.emissiveIntensity=c.on?.17:0}
  if(c.group){c.group.visible=active;if(c.group.userData.glow)c.group.userData.glow.visible=c.on;if(c.group.userData.bounce)c.group.userData.bounce.visible=active&&c.on;if(c.group.userData.uplens)c.group.userData.uplens.material=c.on?diffuserOnMat:diffuserOffMat;if(c.group.userData.extraLights)for(const lamp of c.group.userData.extraLights)lamp.visible=active&&c.on;if(c.group.userData.extraLenses)for(const lens of c.group.userData.extraLenses)lens.material=c.on?diffuserOnMat:diffuserOffMat}
  if(c.wash)c.wash.visible=c.on;
  if(c.objects)for(const object of c.objects)object.visible=active&&(c.keepObjects||c.on);
 }
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
  const label=document.createElement('span');label.className='fixture-name';label.textContent=c.name;
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
const QUICK_LIGHTS_KEY='serina-quick-lights-v1';
const DEFAULT_QUICK_LIGHTS=['L-L1','L-L2','FL-L-W','FL-L-F','D-L1','FL-D-P','F-L1','FL-E','K-L2','FL-K-TASK','FL-K-1','M-L1','M-FAN','FL-M-W','FL-M-A','B2-F','FL-B2-D','HY-B2-DESK','B3-F','Y-L1','B1-L','B2B-L'];
let savedQuickLights;try{savedQuickLights=JSON.parse(localStorage.getItem(QUICK_LIGHTS_KEY))}catch{}
const quickLightIds=new Set(Array.isArray(savedQuickLights)?savedQuickLights:DEFAULT_QUICK_LIGHTS);
const lightPanel=document.querySelector('#lightPanel'),lightPanelToggle=document.querySelector('#lightPanelToggle');
function setLightPanelOpen(open){lightPanel.hidden=!open;lightPanelToggle.setAttribute('aria-expanded',String(open));if(open){closeDrawer();renderLightSwitches()}}
lightPanelToggle.onclick=()=>setLightPanelOpen(lightPanel.hidden);
document.querySelector('#lightPanelClose').onclick=()=>setLightPanelOpen(false);
document.querySelector('#lightsAllOn').onclick=()=>{lightCircuits.filter(c=>circuitActive(c)&&c.room===lightRoomSelect.value).forEach(c=>c.on=true);syncLights();renderLightSwitches()};
document.querySelector('#lightsAllOff').onclick=()=>{lightCircuits.filter(c=>circuitActive(c)&&c.room===lightRoomSelect.value).forEach(c=>c.on=false);syncLights();renderLightSwitches()};
// The 48-inch sweep is centred on the developer fan hook. The flat scheme
// lowers the visible fan by 100 mm so its canopy meets the new ceiling plane.
// Both schemes still require a structural-slab anchor, never gypsum alone.
const livingFan=new THREE.Group();livingFan.name='Living 48in ceiling fan';livingFan.position.set(1.62,0,-7.68);scene.add(livingFan);
const fanFinish=new THREE.MeshStandardMaterial({color:0x373b3d,roughness:.58});
function fanPart(name,w,h,d,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),fanFinish);m.name=name;m.position.set(x,y,z);livingFan.add(m);return m}
fanPart('structural fan downrod',.028,.21,.028,0,2.725,0);
const hub=new THREE.Mesh(new THREE.CylinderGeometry(.105,.12,.11,32),fanFinish);hub.position.y=2.575;livingFan.add(hub);
for(let i=0;i<3;i++){const arm=new THREE.Group();arm.rotation.y=i*2*Math.PI/3;livingFan.add(arm);const blade=new THREE.Mesh(new RoundedBoxGeometry(.49,.020,.14,3,.009),fanFinish);blade.name='48in fan blade';blade.position.set(.36,2.555,0);arm.add(blade)}
// A compact 16-inch wall-fan head is fixed to a rated ceiling bracket at the
// existing B3 point nearest Bath 2. The separate central fan hook carries the
// room's thin ceiling light in this concept. Final bracket/point suitability
// needs an electrician's site check before installation.
const b3CeilingWallFan=new THREE.Group();b3CeilingWallFan.name='B3 16in ceiling mounted wall fan concept';b3CeilingWallFan.position.set(5.20,2.50,-3.98);scene.add(b3CeilingWallFan);
const b3FanBracket=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.17,20),fanFinish);b3FanBracket.position.y=.215;b3CeilingWallFan.add(b3FanBracket);
const b3FanHead=new THREE.Group();b3FanHead.rotation.y=Math.PI/2;b3CeilingWallFan.add(b3FanHead);
const b3FanRing=new THREE.Mesh(new THREE.TorusGeometry(.203,.013,10,48),fanFinish);b3FanRing.name='B3 wall fan 16in front guard';b3FanHead.add(b3FanRing);
const b3FanInnerRing=new THREE.Mesh(new THREE.TorusGeometry(.105,.006,8,40),fanFinish);b3FanHead.add(b3FanInnerRing);
for(let i=0;i<3;i++){const blade=new THREE.Mesh(new RoundedBoxGeometry(.145,.045,.018,3,.012),fanFinish);blade.position.set(.073*Math.cos(i*2*Math.PI/3),.073*Math.sin(i*2*Math.PI/3),0);blade.rotation.z=i*2*Math.PI/3;b3FanHead.add(blade)}
const b3FanHub=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.06,20),fanFinish);b3FanHub.rotation.x=Math.PI/2;b3FanHead.add(b3FanHub);
function syncFanHeights(){
 livingFan.position.y=lightingScheme==='local'?0:-.10;
 b3CeilingWallFan.position.y=2.50;
}
for(const p of points){if(['socket','data','fixed'].includes(p.type))p.status='Plan indication · verify on site'}
for(const p of points){const geo=new THREE.SphereGeometry(p.type==='fan'?.105:.085,20,20); const mat=new THREE.MeshStandardMaterial({color:TYPES[p.type].color,emissive:TYPES[p.type].color,emissiveIntensity:.65,roughness:.25}); const m=new THREE.Mesh(geo,mat); m.position.set(...p.pos); m.userData=p; markerGroup.add(m); markerMeshes.push(m); const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.15,32),new THREE.MeshBasicMaterial({color:TYPES[p.type].color,transparent:true,opacity:.48,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.copy(m.position); ring.position.y-=.002; markerGroup.add(ring); m.userData.ring=ring;}
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
function pointHeight(p){if(p.type==='light'||p.type==='fan')return '≈ 2850 mm ceiling/slab target; marker rendered lower for visibility';if(p.id.endsWith('-AC'))return '2525 mm AFFL (developer legend; site-check)';return `≈ ${Math.round(p.pos[1]*1000)} mm AFFL (drawing legend/model; site-check)`}
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
 // Daylight inside the unit is softened by glazing/blinds and reflected by the
 // light floor and walls. Avoid the hard direct-sun shadows of the exterior view.
 sun.intensity=daylight?.35:0;sun.castShadow=false;
 const anyLampOn=lightCircuits.some(c=>circuitActive(c)&&c.on);
 const stripsOn=lightCircuits.some(c=>circuitActive(c)&&c.on&&(c.id==='L-L1'||c.id==='SOFA-COVE'||c.id.endsWith('-W')));
 // Three.js has no path-traced bounce in this viewer. Give the lit room a
 // restrained warm fill when the concealed strips are on, without adding
 // point-source blobs along the ceiling. An all-off room stays dark.
 hemi.color.set(daylight?0xeaf5ff:0xfaf8f4);
 hemi.groundColor.set(daylight?0xb8b2a9:0xa8a6a0);
 hemi.intensity=daylight?.82:stripsOn?.61:anyLampOn?.50:.012;
 ceilingMat.emissiveIntensity=daylight?0:stripsOn?.075:anyLampOn?.035:0;
 // The flat white surface receives bounced room light. Keep that fill tied
 // to the actual day/lamp state so switching everything off still goes dark.
 flatMat.emissiveIntensity=daylight?.40:stripsOn?.35:anyLampOn?.28:.012;
 pelmetMat.emissiveIntensity=daylight?0:stripsOn?.075:0;
 renderer.toneMappingExposure=daylight?1.00:1.08;
 document.querySelector('#daylightToggle').textContent=daylight?'☀ Daylight: on':'☾ Night mode';
 document.querySelector('#daylightToggle').setAttribute('aria-pressed',String(daylight));
}
const insideRoomSelect=document.querySelector('#insideRoom');
let currentInsideRoom='common';
// Each preset is a standing eye-height camera and an in-room movement envelope.
// The movement envelopes keep the arrow controls from walking through walls.
const roomPresets={
 common:{eye:[1.62,2.30],look:[1.60,7.45],bounds:[.28,3.08,1.18,8.75]},
 entry:{eye:[1.17,1.58],look:[1.50,2.35],bounds:[.24,1.66,1.14,2.45]},
 living:{eye:[1.58,6.35],look:[1.55,8.72],bounds:[.28,3.08,6.25,8.74]},
 dining:{eye:[1.23,4.28],look:[2.70,4.36],bounds:[.28,3.08,2.74,5.18]},
 kitchen:{eye:[2.13,1.61],look:[3.42,.72],lookHeight:1.72,bounds:[1.94,3.91,.86,1.87]},
 prep:{eye:[3.03,4.00],look:[2.35,1.60],lookHeight:1.22,bounds:[2.72,3.08,3.20,4.40]},
 yard:{eye:[4.70,1.39],look:[4.67,.36],bounds:[4.16,5.24,.25,2.42]},
 ledge:{eye:[6.04,1.28],look:[6.69,.45],bounds:[5.49,7.67,.25,2.42]},
 hall:{eye:[5.98,5.77],look:[3.40,5.77],lookHeight:1.96,bounds:[3.42,6.12,5.35,6.17]},
 master:{eye:[9.04,6.83],look:[7.75,8.73],bounds:[6.47,9.40,6.50,8.77]},
 b2:{eye:[4.77,8.65],look:[4.78,6.54],lookHeight:2.55,bounds:[3.40,6.13,6.50,8.78]},
 b3:{eye:[7.24,3.22],look:[5.66,4.04],lookHeight:2.10,bounds:[4.92,7.65,2.76,5.02]},
 bath1:{eye:[8.47,3.22],look:[8.80,4.67],bounds:[7.95,9.41,2.76,5.02]},
 bath2:{eye:[3.72,3.22],look:[4.23,4.67],bounds:[3.40,4.62,2.76,5.02]}
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
 if(measureOn&&activeRoom==='全屋')selectRoom(inside?({'entry':'玄关','living':'客厅','dining':'餐厅','kitchen':'厨房','yard':'Yard','hall':'走道','master':'主人房','b2':'B2','b3':'B3','bath1':'Bath 1','bath2':'Bath 2','ledge':'AC Ledge'}[currentInsideRoom]||'客厅'):'客厅');
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
function setInside(on){inside=on;document.querySelector('#app').classList.toggle('inside-mode',on);indoorCeiling.visible=on;syncLights();document.querySelector('#insideView').classList.toggle('active',on);document.querySelector('#planView').classList.toggle('active',!on);document.querySelector('#walktools').hidden=!on;camera.fov=on?(isMobile?85:65):32;camera.updateProjectionMatrix();syncEnvironment();if(on){currentInsideRoom='common';insideRoomSelect.value='common';controls.target.set(1.60,1.47,-7.45);camera.position.set(1.62,1.57,-2.30)}else focusRoom(activeRoom);controls.enableDamping=!(on&&isMobile);controls.enabled=!(on&&isMobile);controls.update()}
document.querySelector('#daylightToggle').onclick=()=>{daylight=!daylight;syncEnvironment()};
function indoorPlace(place){if(!inside)setInside(true);const p=roomPresets[place];if(!p)return;currentInsideRoom=place;insideRoomSelect.value=place;camera.position.set(p.eye[0],1.57,-p.eye[1]);controls.target.set(p.look[0],p.lookHeight??1.44,-p.look[1]);controls.update()}
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
const schemeNotes={
 local:'Scheme 1: original ceiling with the living window pelmet and sofa-wall cove; master window pelmet. Existing light and fan positions remain indicative.',
 full:'Scheme 2: 100 mm flat ceiling in the common area, master and B2; B3 keeps its original ceiling. Recessed window strips and relocated lights are proposed. Confirm structural fan anchors and every point on site.',
 hybrid:'Scheme 3 · recommended: 100 mm flat ceiling in the common area and hall only; master, B2 and B3 keep their 2.85 m original ceilings. The living window strip, dining pendant and kitchen task lights remain. B2 adds a plug-in desk lamp; three compact pendants serve the prep counter. Fan anchors and wiring still require site checks.'
};
function selectLightingScheme(mode,updateUrl=true){
 if(!Object.hasOwn(schemeNotes,mode))return;
 lightingScheme=mode;
 document.querySelectorAll('#ceilingMode button').forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));
 document.querySelector('#schemeQuick').textContent=`Ceiling ${mode==='local'?'1':mode==='full'?'2':'3'}`;
 document.querySelector('#ceilingNote').textContent=schemeNotes[mode];
 if(updateUrl){const url=new URL(location.href);url.searchParams.set('scheme',mode);history.replaceState(null,'',url)}
 syncLights();renderLightSwitches();
}
document.querySelector('#schemeQuick').onclick=()=>openDrawer('layout');
document.querySelectorAll('#ceilingMode button').forEach(button=>button.onclick=()=>{selectLightingScheme(button.dataset.mode);if(isMobile)closeDrawer()});
const initialParams=new URLSearchParams(location.search);
daylight=initialParams.get('daylight')==='1';
selectLightingScheme(initialParams.get('scheme')||'local',false);
const initialView=initialParams.get('view');
if(initialView==='inside')setInside(true);
if(initialView==='tv'){indoorPlace('living');controls.target.set(3.10,1.03,-7.62);camera.position.set(1.34,1.58,-7.60);controls.update()}
if(initialView==='sofa'){indoorPlace('living');controls.target.set(.91,.72,-7.66);camera.position.set(2.71,1.54,-5.83);controls.update()}
if(initialView==='dining'){indoorPlace('dining');controls.target.set(1.14,.74,-4.35);camera.position.set(2.77,1.55,-5.76);controls.update()}
if(initialView==='b2inside'){indoorPlace('b2');controls.target.set(4.20,1.35,-6.72);camera.position.set(5.42,1.57,-8.54);controls.update()}
if(initialView==='b2cabinet'){indoorPlace('b2');controls.target.set(4.88,1.35,-6.77);camera.position.set(5.18,1.57,-8.24);controls.update()}
if(initialView==='b3inside'){indoorPlace('b3');controls.target.set(5.65,2.46,-4.00);camera.position.set(7.42,1.57,-3.15);controls.update()}
if(initialView==='b3cabinet'){indoorPlace('b3');controls.target.set(6.30,1.30,-4.82);camera.position.set(5.33,1.57,-3.35);controls.update()}
if(initialView==='masterinside'){indoorPlace('master');controls.target.set(7.98,1.40,-8.93);camera.position.set(7.98,1.57,-5.62);controls.update()}
if(initialView==='shoe'){setInside(true);controls.target.set(1.47,1.43,-.47);camera.position.set(-1.10,1.65,2.00);controls.update()}
if(initialView==='b2')focusRoom('B2');
if(initialView==='yard')focusRoom('Yard');
if(initialView==='kitchen')focusRoom('厨房');
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(!inside)focusRoom(activeRoom)}addEventListener('resize',resize);resize();
// Never cap the loop below 60 Hz. Scale internal resolution only if this device
// cannot sustain the display's cadence; the badge reports observed FPS.
let frameCount=0,frameWindowStart=performance.now(),renderDpr=maxDpr,qualityCooldown=0;
function animate(now){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);if(measureOn)drawMeasurements();
 frameCount++;if(now-frameWindowStart>2500){const fps=Math.round(frameCount*1000/(now-frameWindowStart));document.querySelector('#fpsBadge').textContent=`FPS ${fps}`;
  if(now>qualityCooldown){const next=fps<59?Math.max(.90,renderDpr-.10):fps>=68?Math.min(maxDpr,renderDpr+.06):renderDpr;
   if(Math.abs(next-renderDpr)>.03){renderDpr=next;renderer.setPixelRatio(renderDpr);renderer.setSize(innerWidth,innerHeight,false);qualityCooldown=now+6000}}
  frameCount=0;frameWindowStart=now}}
requestAnimationFrame(animate);
