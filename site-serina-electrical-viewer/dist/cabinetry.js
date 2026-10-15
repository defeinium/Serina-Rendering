import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CABINETS as S,CABINET_REVISION} from './cabinet-data.js?v=20261015-controls-r1';

export function createCabinetry({parent,mats,greyAshMat}){
 const root=new THREE.Group();root.name='Current coordinated cabinetry';parent.add(root);
 const records=[],f=new THREE.MeshStandardMaterial({color:0xd8d9d0,roughness:.9});
 const rack=new THREE.MeshStandardMaterial({color:0xb2bcb8,metalness:.65,roughness:.38});
 const dark=new THREE.MeshStandardMaterial({color:0x26302c,roughness:.85});
 const fabric=new THREE.MeshStandardMaterial({color:0x899a96,roughness:1,side:THREE.DoubleSide});
 const finMat=new THREE.MeshStandardMaterial({color:0x485a57,roughness:.83});
 let opened=false;
 // Box geometry is batched per material, cabinet and visibility state. No new lights.
 function cabinet(id,label,origin,rotation){const group=new THREE.Group();group.name=label;group.position.set(origin[0],0,-origin[1]);group.rotation.y=rotation;root.add(group);const groups={};for(const key of ['shell','fronts','inside','always']){const g=new THREE.Group();g.name=label+' '+key;group.add(g);groups[key]=g;}const rec={id,label,group,groups,spec:S[id],pieces:[],drawers:[]};records.push(rec);return rec;}
 function piece(r,state,name,x,d,z,w,depth,h,material=f){
  const mesh=new THREE.Mesh(r.id==='b3'&&name==='left side'?new RoundedBoxGeometry(w/1000,h/1000,depth/1000,3,.008):new THREE.BoxGeometry(w/1000,h/1000,depth/1000),material);mesh.name=name;mesh.position.set((x+w/2)/1000,(z+h/2)/1000,-(d+depth/2)/1000);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.cabinetPart=true;r.groups[state].add(mesh);r.pieces.push({name,state,box:[x,d,z,w,depth,h],finish:material.color.getHexString(THREE.SRGBColorSpace)});return mesh;
 }
 function shell(r,x,w,depth,bottom,top,mat=f){piece(r,'shell','left side',x,0,bottom,18,depth,top-bottom,mat);piece(r,'shell','right side',x+w-18,0,bottom,18,depth,top-bottom,mat);piece(r,'shell','back',x+18,depth-9,bottom,w-36,9,top-bottom,mat);piece(r,'shell','bottom',x+18,0,bottom,w-36,depth-9,18,mat);piece(r,'shell','top',x+18,0,top-18,w-36,depth-9,18,mat);}
 function shelf(r,x,w,z,depth,mat=f){piece(r,'inside','adjustable / fixed shelf',x,50,z-18,w,depth-59,18,mat);}
 function door(r,x,w,bottom,top,mat,handle=true,name='hinged door',depth=0){const inset=x===0?(r.spec.exposedEndRadius||0):0;piece(r,'fronts',name,x+inset+2,depth,bottom+2,w-inset-4,18,top-bottom-4,mat);if(handle)piece(r,'fronts','slim door pull',x+w-54,depth-10,Math.max(bottom+70,Math.min(1070,top-200)),8,10,160,mats.metal);}
 function drawer(r,x,w,bottom,height,runner,label,frontMat=f,external=false,externalSpan=null){
  r.drawers.push({label,x,width:w,bottom,height,runner,external});
  piece(r,external?'fronts':'inside',label+' drawer front',external?(externalSpan?.x??x-16):x,external?0:35,bottom,external?(externalSpan?.width??w+32):w,18,height-3,frontMat);
  piece(r,'inside',label+' drawer base',x+12,55,bottom+24,w-24,runner-12,12,f);
  for(const xx of [x+12,x+w-24])piece(r,'inside',label+' drawer side',xx,55,bottom+36,12,runner-12,Math.max(45,height-60),f);
  piece(r,'inside',label+' drawer back',x+24,55+runner-24,bottom+36,w-48,12,Math.max(45,height-60),f);
  if(external)piece(r,'inside',label+' drawer box front',x+24,55,bottom+36,w-48,12,Math.max(45,height-60),f);
  piece(r,external?'fronts':'inside',label+' drawer pull',x+w*.25,external?-5:29,bottom+height-28,w*.5,6,5,mats.metal);
 }
 function rail(r,x,w,z){piece(r,'inside','hanging rail',x,295,z-11,w,22,22,rack);}
 function clothes(r,x,w,z,drop=760){rail(r,x,w,z);for(let i=0;i<4;i++){const cx=x+110+i*(w-220)/3;piece(r,'inside','illustrative hanger hook',cx-2,290,z-55,4,8,55,rack);piece(r,'inside','illustrative folded clothes',cx-55,260,z-drop,110,80,drop-100,fabric);piece(r,'inside','illustrative clothes shoulder',cx-88,260,z-145,176,80,45,fabric);}}
 function scribe(r,w,depth,top,mat){piece(r,'shell','ceiling scribe',0,0,top,w,depth,30,mat);}
 // Integrated 18 mm end return with a true R40 quarter-round, inside the original footprint.
 function curvedEnd(r,mat){
  const R=r.spec.exposedEndRadius/1000,t=.018,w=r.spec.modules[0]/1000,d=r.spec.depth/1000;
  for(const name of ['left side','bottom','top','ceiling scribe']){
   const mesh=r.groups.shell.children.find(m=>m.name===name);if(mesh){mesh.removeFromParent();mesh.geometry.dispose();}
   const index=r.pieces.findIndex(p=>p.name===name);if(index>=0)r.pieces.splice(index,1);
  }
  function extruded(name,shape,bottom,height,box){
   const geo=new THREE.ExtrudeGeometry(shape,{depth:height/1000,bevelEnabled:false,curveSegments:32});geo.rotateX(-Math.PI/2);
   const mesh=new THREE.Mesh(geo,mat);mesh.name=name;mesh.position.y=bottom/1000;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.cabinetPart=true;r.groups.shell.add(mesh);
   r.pieces.push({name,state:'shell',box,geometry:'quarter-round',radius:r.spec.exposedEndRadius,finish:mat.color.getHexString(THREE.SRGBColorSpace)});
  }
  function outline(){const s=new THREE.Shape();s.moveTo(R,0);s.lineTo(w,0);s.lineTo(w,d);s.lineTo(0,d);s.lineTo(0,R);s.absarc(R,R,R,Math.PI,1.5*Math.PI,false);s.closePath();return s;}
  piece(r,'shell','exposed end flat side',0,R*1000,118,18,(d-R)*1000,r.spec.top-136,mat);
  const edge=new THREE.Shape();edge.moveTo(0,R);edge.absarc(R,R,R,Math.PI,1.5*Math.PI,false);edge.lineTo(R,t);edge.absarc(R,R,R-t,1.5*Math.PI,Math.PI,true);edge.closePath();
  extruded('small curved exposed end return',edge,118,r.spec.top-136,[0,0,118,R*1000,R*1000,r.spec.top-136]);
  extruded('rounded first-bay base',outline(),100,18,[0,0,100,w*1000,d*1000,18]);
  extruded('rounded first-bay top',outline(),r.spec.top-18,18,[0,0,r.spec.top-18,w*1000,d*1000,18]);
  extruded('rounded first-bay ceiling scribe',outline(),r.spec.top,r.spec.scribe,[0,0,r.spec.top,w*1000,d*1000,r.spec.scribe]);
  piece(r,'shell','remaining ceiling scribe',w*1000,0,r.spec.top,r.spec.width-w*1000,d*1000,r.spec.scribe,mat);
 }
 function loft(r,modules,depth,split,top,mat){let x=0;for(const w of modules){shelf(r,x+18,w-36,split,depth);x+=w;}for(let i=0;i<r.spec.doors;i++){const w=r.spec.width/r.spec.doors;door(r,i*w,w,split,top,mat,false,'hinged loft door');}}
 // B2: front-facing left is at the entry-side end. Local x increases westward.
 {const r=cabinet('b2','B2 1440 three-door multipurpose cabinet',[4.775,7.033],Math.PI),s=S.b2;
  shell(r,0,480,600,100,2820,mats.wardrobeCab);shell(r,480,960,600,100,2820,mats.wardrobeCab);scribe(r,s.width,600,2820,mats.wardrobeCab);curvedEnd(r,mats.wardrobeCab);
  piece(r,'shell','B2 recessed plinth',20,35,20,1400,540,80,mats.graphite);
  for(let i=0;i<3;i++)door(r,i*480,480,100,2260,mats.wardrobeCab);
  loft(r,s.modules,600,2260,2820,mats.wardrobeCab);
  for(const z of s.shelves)shelf(r,18,444,z,600);
  shelf(r,498,924,368,600);clothes(r,518,884,2050);clothes(r,518,884,1200);
  drawer(r,523,874,100,250,450,'B2 one broad accessory',mats.wardrobeCab);
  // The fins are only a 1000 mm display envelope, not the owner's measured pair.
  for(const x of [90,285]){piece(r,'inside','illustrative fin blade',x,300,160,100,24,850,finMat);piece(r,'inside','illustrative fin foot pocket',x+15,260,1010,70,100,150,finMat);}
  // Mirror attached to the hidden inside face of the narrow door, no power.
  piece(r,'fronts','B2 unlit inside-door mirror',65,18,750,350,5,1400,rack);
 }
 {const r=cabinet('b3','B3 1829 four-door wardrobe',[5.911,4.52],0),s=S.b3;
  shell(r,0,914.5,600,100,2820,mats.wardrobeCab);shell(r,914.5,914.5,600,100,2820,mats.wardrobeCab);scribe(r,s.width,600,2820,mats.wardrobeCab);curvedEnd(r,mats.wardrobeCab);
  piece(r,'shell','B3 recessed plinth',20,35,20,1789,540,80,mats.graphite);
  for(let i=0;i<4;i++)door(r,i*457.25,457.25,i<2?s.leftDoorBottom:100,2260,mats.wardrobeCab);
  loft(r,s.modules,600,2260,2820,mats.wardrobeCab);clothes(r,38,838.5,2050);clothes(r,952.5,838.5,2050);clothes(r,952.5,838.5,1050);
  shelf(r,18,878.5,968,600);let z=100;for(const [height,label]of [[350,'B3 bed linen'],[280,'B3 towels'],[220,'B3 underwear / socks']]){drawer(r,43,828.5,z,height,450,label,mats.wardrobeCab,true,{x:42,width:870.5});z+=height;}
  piece(r,'inside','illustrative suitcase stored flat',65,80,2278,700,450,280,mats.graphite);
 }
 {const r=cabinet('wet','Kitchen wet run 2065',[3.954,.81],Math.PI),s=S.wet;
  let x=50;for(const w of [775,230,960]){shell(r,x,w,650,100,880,mats.cabinet);x+=w;}
  for(const xx of [0,2015]){piece(r,'fronts','base end filler',xx,0,100,50,18,780,mats.cabinet);piece(r,'fronts','upper end filler',xx,300,1450,50,18,1370,mats.lightCab);}
  piece(r,'shell','kitchen recessed plinth',50,50,0,1965,560,100,mats.graphite);
  for(const [x,w]of [[50,387.5],[437.5,387.5]])door(r,x,w,100,880,mats.cabinet);
  // A pull-out wire rack, not a 780 mm-tall solid drawer box with fixed shelves.
  r.drawers.push({label:'230 sauce pull-out',x:843,width:194,bottom:100,height:780,runner:500,external:true});
  piece(r,'fronts','sauce rack external front',827,0,102,226,18,776,mats.cabinet);
  piece(r,'fronts','sauce rack pull',997,-10,590,8,10,160,mats.metal);
  for(const z of [138,370,602]){
   piece(r,'inside','sauce rack removable tray',851,55,z,178,495,8,rack);
   for(const xx of [851,1025])piece(r,'inside','sauce rack tray guard',xx,55,z+8,4,495,48,rack);
   for(const dd of [55,546])piece(r,'inside','sauce rack tray guard',851,dd,z+8,178,4,48,rack);
  }
  for(const xx of [851,1025])piece(r,'inside','sauce rack upright',xx,535,146,4,4,510,rack);
  piece(r,'fronts','hob top ventilation / service panel',1057,-18,760,956,18,118,mats.cabinet);
  drawer(r,1073,924,100,330,450,'hob cookware lower',mats.cabinet,true);drawer(r,1073,924,430,330,450,'hob cookware upper',mats.cabinet,true);
  // Stone surrounds a real opening at the sink, rather than covering its bowl.
  const [sl,sr,df,db]=[137.5,737.5,75,525];
  for(const [x,d,w,dep]of [[0,0,sl,650],[sr,0,2065-sr,650],[sl,0,600,df],[sl,db,600,650-db]])piece(r,'shell','wet stone top around sink opening',x,d,880,w,dep,20,mats.counter);
  piece(r,'always','sink basin bottom',sl+18,df+18,680,564,414,12,mats.metal);
  for(const xx of [sl,sr-12])piece(r,'always','sink basin side',xx,df,692,12,450,208,mats.metal);
  for(const dd of [df,db-12])piece(r,'always','sink basin side',sl,dd,692,600,12,208,mats.metal);
  piece(r,'always','sink tap stem',420,570,900,18,18,180,rack);piece(r,'always','sink tap spout',420,480,1062,18,108,18,rack);
  piece(r,'always','induction hob model pending',1235,110,900,600,430,12,mats.black);
  piece(r,'shell','sintered backsplash',0,634,900,2065,16,550,mats.counter);
  for(const [start,w,bottom]of [[50,600,1450],[650,405,1450],[1055,960,1621]]){
   shell(r,start,w,350,bottom,2820,mats.lightCab);
   // Shift complete uppers back 300 mm relative to the 650 mm base front.
   for(const m of r.groups.shell.children.slice(-5))m.position.z-=.30;for(const info of r.pieces.slice(-5))info.box[1]+=300;
   piece(r,'shell','upper loft shelf',start+18,300,2182,w-36,341,18,mats.lightCab);
   if(start===1055){door(r,start,480,1621,2200,mats.lightCab,true,'hinged upper door',300);door(r,start+480,480,1621,2200,mats.lightCab,true,'hinged upper door',300);}
   else door(r,start,w,1450,2200,mats.lightCab,true,'hinged upper door',300);
   door(r,start,w,2200,2820,mats.lightCab,false,'hinged upper loft door',300);
  }
  piece(r,'shell','wet upper ceiling scribe',0,300,2820,2065,350,30,mats.lightCab);
  for(const z of [1620,1900]){piece(r,'inside','dish drainer removable rack',80,320,z,540,275,8,rack);for(let i=0;i<7;i++)piece(r,'inside','drainer divider',100+i*65,320,z+8,4,250,70,rack);}
  piece(r,'inside','dish drainer removable drip tray',80,320,1470,540,275,20,rack);
  piece(r,'inside','pantry adjustable shelf',668,350,1762,369,291,18,f);
  const hoodX=1087;
  piece(r,'always','VATTI V997 896W x421H lower body',hoodX,290,1200,896,360,421,mats.graphite);
  const glass=piece(r,'always','V997 sloping intake glass',hoodX+43,277,1300,810,20,220,dark);glass.rotation.x=-.15;
  piece(r,'inside','V997 420W chimney',1325,420,1621,420,210,487,mats.graphite);
  for(let i=0;i<3;i++)piece(r,'always','recirculation return grille indication',1095,280,2155+i*12,880,8,5,dark);
  piece(r,'inside','sink schematic waste tailpipe',425,285,570,30,30,110,mats.ceramic);
  piece(r,'inside','sink schematic trap vertical',425,285,450,30,30,120,mats.ceramic);
  piece(r,'inside','sink schematic waste trap return',425,285,450,160,30,30,mats.ceramic);
  piece(r,'inside','sink schematic wall waste connection',555,315,450,30,319,30,mats.ceramic);
  piece(r,'inside','LG ATOM-U reference envelope',110,150,118,170,410,420,mats.ceramic);
 }
 {const r=cabinet('prep','Preparation base 1372 half-open',[1.820,1.758],0),s=S.prep;
  shell(r,0,600,753,100,880,mats.islandCabinet);shell(r,600,772,753,100,880,greyAshMat);
  // The dining-facing rear is one warm-grey finish; woodgrain belongs inside the appliance recess.
  for(const mesh of [...r.groups.shell.children])if(mesh.name==='back'){mesh.removeFromParent();mesh.geometry.dispose();}
  r.pieces=r.pieces.filter(p=>p.name!=='back');
  piece(r,'shell','continuous light warm-grey dining-facing rear panel',0,753,100,1372,9,780,mats.islandCabinet);
  piece(r,'shell','appliance recess inner wood lining',618,744,118,736,9,744,greyAshMat);
  piece(r,'shell','prep recessed plinth',20,45,0,1332,700,100,mats.graphite);
  piece(r,'shell','prep stone worktop',0,0,880,1372,762,20,mats.counter);
  let z=100;for(const [height,label]of [[350,'prep containers'],[270,'prep plates / bowls'],[160,'prep cutlery']]){drawer(r,18,564,z,height,450,label,mats.islandCabinet,true);z+=height;}
  piece(r,'shell','appliance bay removable divider',618,0,438,736,753,18,greyAshMat);
  piece(r,'inside','oven position marker shelf (empty)',618,20,456,736,713,4,f);
  // Closed cooker only, parked in lower bay. No appliance is shown operating.
  const cooker=new THREE.Mesh(new THREE.CylinderGeometry(.15,.145,.25,28),mats.ceramic);cooker.name='Stored rice cooker illustrative 300W x300H';cooker.position.set(.815,.268,-.23);cooker.castShadow=true;cooker.receiveShadow=true;cooker.userData.cabinetPart=true;r.groups.always.add(cooker);
  piece(r,'always','stored cooker base',685,90,118,260,280,25,mats.ceramic);
  piece(r,'always','stored cooker closed lid',670,70,393,290,320,25,mats.ceramic);
 }
 {const r=cabinet('fridge','Fridge 762 full-height surround',[3.192,1.758],0),s=S.fridge;
  shell(r,0,762,762,0,2820,greyAshMat);scribe(r,762,762,2820,greyAshMat);
  // Keep bottom clear for the fridge; remove its generic floor panel.
  const floor=r.groups.shell.children.find(m=>m.name==='bottom');if(floor){floor.removeFromParent();r.pieces=r.pieces.filter(p=>p.name!=='bottom');}
  shelf(r,18,726,2000,762,greyAshMat);door(r,0,381,2000,2820,greyAshMat,false);door(r,381,381,2000,2820,greyAshMat,false);
  piece(r,'always','fridge model pending reference 650W',56,32,0,650,680,1850,mats.graphite);piece(r,'always','fridge freezer split',58,25,600,646,8,4,mats.black);
 }
 {const r=cabinet('tv','TV console 2134 low floor-standing',[2.797,8.687],-Math.PI/2),s=S.tv;
  shell(r,0,2134,360,60,320,mats.graphite);piece(r,'shell','TV plinth',20,30,0,2094,300,60,mats.black);
  for(let i=1;i<4;i++)piece(r,'shell','TV vertical divider',i*533.5-9,0,78,18,351,224,mats.graphite);
  for(const i of [0,2,3])drawer(r,i*533.5+18,497.5,78,224,300,'TV storage '+i,mats.graphite,true);
  door(r,533.5,533.5,60,302,mats.graphite,false);
  for(let i=0;i<6;i++)piece(r,'fronts','TV equipment front ventilation slot',598,-1,100+i*23,405,6,5,mats.black);
  piece(r,'inside','TV 50mm accessible rear service zone',551.5,310,78,497.5,41,224,dark);
 }
 {const r=cabinet('shoe','Shoe cabinet 610 floating2700 body',[1.29,.785],-Math.PI/2),s=S.shoe;
  shell(r,0,610,380,120,2820,mats.lightCab);scribe(r,610,380,2820,mats.lightCab);
  for(const [lo,hi]of [[120,1000],[1160,2820]])for(let i=0;i<2;i++)door(r,i*305,305,lo,hi,mats.lightCab,false);
  for(const z of s.shelves)shelf(r,18,574,z,380);
  drawer(r,18,574,1000,160,300,'Shoe key',mats.lightCab,true);
  // Fine door pulls at the 1000/1160 split; no open external niche.
  piece(r,'fronts','shoe drawer recessed pull',100,-5,1138,410,6,5,mats.graphite);
 }
 function batch(g){g.updateMatrix();const bins=new Map();for(const m of [...g.children]){if(!m.isMesh||m.material.transparent)continue;m.updateMatrix();const geo=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrix);const id=m.material.uuid;if(!bins.has(id))bins.set(id,{material:m.material,geos:[]});bins.get(id).geos.push(geo);m.removeFromParent();m.geometry.dispose();}for(const bin of bins.values()){const geo=mergeGeometries(bin.geos,false);const m=new THREE.Mesh(geo,bin.material);m.name=g.name+' material batch';m.userData.cabinetPart=true;m.castShadow=true;m.receiveShadow=true;g.add(m);for(const x of bin.geos)x.dispose();}}
 for(const r of records)for(const g of Object.values(r.groups))batch(g);
 function setOpen(on){opened=!!on;for(const r of records){r.groups.fronts.visible=!opened;r.groups.inside.visible=opened;}return opened;}
 function snapshot(){root.updateMatrixWorld(true);return {revision:CABINET_REVISION,open:opened,kitchenPlacement:{wetEnd:3.954,wetFront:.810,prepFront:1.758,backWallFace:2.520,modelAisle:948,sourcePlanAisle:1038,status:'Current model wall faces differ from the drawing-derived depth by90 mm; site reconciliation required.'},cabinets:records.map(r=>({id:r.id,label:r.label,spec:r.spec,origin:[r.group.position.x,-r.group.position.z],rotation:r.group.rotation.y,frontsVisible:r.groups.fronts.visible,insideVisible:r.groups.inside.visible,drawers:r.drawers,pieces:r.pieces,bounds:(()=>{const b=new THREE.Box3().setFromObject(r.group);return {min:b.min.toArray(),max:b.max.toArray()}})(),notes:r.spec.notes}))};}
 setOpen(false);return {root,setOpen,snapshot,footprints:()=>records.map(r=>{const old=r.groups.inside.visible;r.groups.inside.visible=false;const b=new THREE.Box3().setFromObject(r.group);r.groups.inside.visible=old;return {minX:b.min.x,maxX:b.max.x,minY:-b.max.z,maxY:-b.min.z,name:r.label};})};
}
