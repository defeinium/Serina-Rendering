import * as THREE from 'three';
// Visual approximations from Jason's photographed samples, not calibrated swatches.
import {CABINET_FINISHES} from './cabinet-palette.js?v=20261017-retained-louvre-r1';
export {CABINET_FINISHES};
export function createCabinetFinishes(renderer){
 const texture=c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
 let seed=309;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const wood=document.createElement('canvas');wood.width=512;wood.height=1024;const g=wood.getContext('2d');g.fillStyle='#f5f5f5';g.fillRect(0,0,512,1024);
 // Long straight fibres with restrained, gently wavering grain. No orange tint or large cathedral knots.
 for(let i=0;i<1400;i++){const x=rand()*512,phase=rand()*Math.PI*2,amp=1+rand()*5;g.beginPath();g.lineWidth=.3+rand()*1.7;g.strokeStyle=`rgba(35,35,35,${.008+rand()*.055})`;for(let y=0;y<=1024;y+=16){const px=x+Math.sin(y/1024*Math.PI*2+phase)*amp;if(!y)g.moveTo(px,y);else g.lineTo(px,y);}g.stroke();}
 const stone=document.createElement('canvas');stone.width=stone.height=512;const c=stone.getContext('2d');c.fillStyle='#fafafa';c.fillRect(0,0,512,512);
 for(let i=0;i<28000;i++){const v=rand()>.5?35:255;c.fillStyle=`rgba(${v},${v},${v},${.015+rand()*.04})`;const r=.25+rand()*.7;c.beginPath();c.arc(rand()*512,rand()*512,r,0,Math.PI*2);c.fill();}
 const sahara=new THREE.MeshStandardMaterial({name:'Sahara Stone 37P002',color:CABINET_FINISHES.light.colour,map:texture(stone),roughness:.88});
 const phantom=new THREE.MeshStandardMaterial({name:'Phantom 37P309 vertical woodgrain',color:CABINET_FINISHES.fridge.colour,map:texture(wood),roughness:.84});
 sahara.bumpMap=sahara.map;sahara.bumpScale=.00018;phantom.bumpMap=phantom.map;phantom.bumpScale=.00035;
 sahara.userData.metreTexture=[.25,.25];phantom.userData.metreTexture=[.60,1.20];
 return {sahara,phantom};
}
// Physical texture scale stays consistent across narrow fillers, tall sides and doors.
export function mapCabinetFinish(mesh,material,offset=[0,0,0]){
 const scale=material.userData.metreTexture;if(!scale)return;
 const geo=mesh.geometry,p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+offset[0],y=p.getY(i)+offset[1],z=p.getZ(i)+offset[2];const horizontal=Math.abs(n.getY(i))>.7;uv.setXY(i,(Math.abs(n.getX(i))>.7?-z:x)/scale[0],(horizontal?-z:y)/scale[1]);}uv.needsUpdate=true;
}
