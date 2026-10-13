import * as THREE from 'three';

// Room-bounded diffuse window portals. This is a real-time irradiance proxy,
// not a measured daylight/lux calculation. No hard sun patches or fake cones.
// Widths/heights follow the existing shell; transmission includes its curtains.
export const WINDOWS = [
 {name:'Living',centre:[1.695,1.515,-9.065],width:2.195,height:1.54,bounds:[.01,3.245,-9.06,-.08],axis:0,inward:1,transmission:.62},
 {name:'Bedroom 2',centre:[4.85,1.515,-9.065],width:2.145,height:1.54,bounds:[3.245,6.29,-9.06,-6.353],axis:0,inward:1,transmission:.28},
 {name:'Master',centre:[7.975,1.515,-9.065],width:2.245,height:1.54,bounds:[6.29,9.65,-9.06,-5.20],axis:0,inward:1,transmission:.57},
 {name:'Bedroom 3',centre:[7.155,1.695,-2.585],width:1.05,height:1.14,bounds:[4.775,7.82,-5.20,-2.59],axis:0,inward:-1,transmission:.90},
 {name:'Bath 1',centre:[8.355,1.85,-2.585],width:.49,height:.54,bounds:[7.82,9.65,-5.20,-2.59],axis:0,inward:-1,transmission:.52},
 {name:'Bath 2',centre:[4.425,1.85,-2.585],width:.49,height:.54,bounds:[3.245,4.775,-5.20,-2.59],axis:0,inward:-1,transmission:.52},
 {name:'Yard',centre:[5.395,1.42,-1.80],width:1.52,height:2.40,bounds:[4.04,5.37,-2.60,-.08],axis:1,inward:-1,transmission:.50}
];

export function createWindowDaylight(scene){
 const strength={value:0},skyDay={value:1};
 const centres={value:WINDOWS.map(w=>new THREE.Vector4(...w.centre,w.width))};
 const extents={value:WINDOWS.map(w=>new THREE.Vector4(...w.bounds))};
 const specs={value:WINDOWS.map(w=>new THREE.Vector4(w.height,w.axis,w.inward,w.transmission))};
 const group=new THREE.Group();group.name='Exterior window sky';scene.add(group);
 const skyMaterial=new THREE.ShaderMaterial({uniforms:{skyDay},side:THREE.DoubleSide,depthWrite:false,toneMapped:false,
  vertexShader:'varying vec2 skyUV; void main(){skyUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform float skyDay; varying vec2 skyUV;
   void main(){vec3 day=mix(vec3(.86,.90,.91),vec3(.63,.77,.86),smoothstep(.10,1.0,skyUV.y));
    vec3 night=mix(vec3(.025,.042,.064),vec3(.010,.019,.035),skyUV.y);
    gl_FragColor=vec4(mix(night,day,skyDay),1.0);}`});
 for(const w of WINDOWS){const m=new THREE.Mesh(new THREE.PlaneGeometry(w.width,w.height),skyMaterial);m.name=w.name+' exterior sky';m.position.set(...w.centre);if(w.axis===1)m.rotation.y=-Math.PI/2;group.add(m);}
 const fragment=`
 uniform float windowDaylightStrength;
 uniform vec4 windowCentres[${WINDOWS.length}];
 uniform vec4 windowExtents[${WINDOWS.length}];
 uniform vec4 windowSpecs[${WINDOWS.length}];
 varying vec3 daylightWorldPosition;
 varying vec3 daylightWorldNormal;
 vec3 diffuseWindowIrradiance(){
  if(windowDaylightStrength<=0.0)return vec3(0.0);
  vec3 p=daylightWorldPosition,n=normalize(daylightWorldNormal);float energy=0.0;
  for(int i=0;i<${WINDOWS.length};i++){
   vec4 b=windowExtents[i],w=windowCentres[i],s=windowSpecs[i];
   if(p.x<b.x||p.x>b.y||p.z<b.z||p.z>b.w)continue;
   vec3 toWindow=w.xyz-p;float d2=max(dot(toWindow,toWindow),.04);vec3 direction=toWindow*inversesqrt(d2);
   float depth=max(0.0,s.y<.5?(p.z-w.z)*s.z:(p.x-w.x)*s.z);
   float projected=max(0.0,s.y<.5?-direction.z*s.z:-direction.x*s.z);
   float area=w.w*s.x,solidAngle=area/(d2+area);
   float direct=max(dot(n,direction),0.0)*projected*solidAngle;
   // A small local diffuse bounce reaches the window wall and ceiling too.
   // It decays into this room instead of brightening every room equally.
   float bounce=.105*exp(-depth/4.5);
   energy+=s.w*(direct+bounce);
  }
  return vec3(energy*windowDaylightStrength);
 }
 `;
 return {windows:WINDOWS,group,strength,
  set(on){strength.value=on?22.5:0;skyDay.value=on?1:0;},
  attach(shader){
   Object.assign(shader.uniforms,{windowDaylightStrength:strength,windowCentres:centres,windowExtents:extents,windowSpecs:specs});
   shader.vertexShader='varying vec3 daylightWorldPosition;\nvarying vec3 daylightWorldNormal;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    daylightWorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;
    daylightWorldNormal=normalize(mat3(modelMatrix)*objectNormal);`);
   shader.fragmentShader=fragment+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>','irradiance += diffuseWindowIrradiance();\n#include <lights_fragment_end>');
  }
 };
}
