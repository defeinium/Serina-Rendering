import * as THREE from 'three';

// Room-bounded diffuse window portals. This is a real-time irradiance proxy,
// not a measured daylight/lux calculation. No hard sun patches or fake cones.
// Widths/heights follow the existing shell; transmission includes its curtains.
export const WINDOWS = [
 {name:'Living',centre:[1.695,1.515,-9.065],width:2.195,height:1.54,bounds:[.01,4.13,-9.14,.08],axis:0,inward:1,transmission:.62},
 // Light-filtering roller-blind preview; actual fabric transmission is unmeasured.
 {name:'Bedroom 2',centre:[4.85,1.515,-9.065],width:2.145,height:1.54,bounds:[3.245,6.29,-9.06,-6.353],axis:0,inward:1,transmission:.48},
 {name:'Master',centre:[7.975,1.515,-9.065],width:2.245,height:1.54,bounds:[6.29,9.65,-9.06,-5.20],axis:0,inward:1,transmission:.57},
 // Owner confirms this is the weakest-daylight room; shaded-window preview gain is illustrative.
 {name:'Bedroom 3',previewGain:.40,centre:[7.155,1.695,-2.585],width:1.05,height:1.14,bounds:[4.775,7.82,-5.20,-2.59],axis:0,inward:-1,transmission:.90},
 {name:'Bath 1',centre:[8.355,1.85,-2.585],width:.49,height:.54,bounds:[7.82,9.65,-5.20,-2.59],axis:0,inward:-1,transmission:.52},
 {name:'Bath 2',centre:[4.425,1.85,-2.585],width:.49,height:.54,bounds:[3.245,4.775,-5.20,-2.59],axis:0,inward:-1,transmission:.52},
 {name:'Yard',centre:[5.395,1.42,-1.80],width:1.52,height:2.40,bounds:[4.04,5.37,-2.60,-.08],axis:1,inward:-1,transmission:.50},
 {name:'Kitchen via yard window',centre:[4.055,1.52,-.62],width:.54,height:1.17,bounds:[1.715,4.13,-2.68,.08],axis:1,inward:-1,transmission:.35,exterior:false}
];

export const BOUNCE_ZONES = [
 {name:'Common area',bounds:[.01,4.13,-9.14,.08]},
 {name:'Hall',bounds:[3.165,6.37,-6.433,-5.12]},
 {name:'Master',bounds:[6.21,9.65,-9.14,-5.12]},
 {name:'Bedroom 2',bounds:[3.165,6.37,-9.14,-6.273]},
 {name:'Bedroom 3',bounds:[4.695,7.90,-5.28,-2.52]},
 {name:'Bath 1',bounds:[7.74,9.65,-5.28,-2.52]},
 {name:'Bath 2',bounds:[3.165,4.855,-5.28,-2.52]},
 {name:'Yard',bounds:[3.96,5.45,-2.68,.08]}
];

export function createWindowDaylight(scene){
 const strength={value:0},skyDay={value:1};
 const centres={value:WINDOWS.map(w=>new THREE.Vector4(...w.centre,w.width))};
 const extents={value:WINDOWS.map(w=>new THREE.Vector4(...w.bounds))};
 const specs={value:WINDOWS.map(w=>new THREE.Vector4(w.height,w.axis,w.inward,w.transmission*(w.previewGain??1)))};
 const bounceBounds={value:BOUNCE_ZONES.map(z=>new THREE.Vector4(...z.bounds))};
 const bounceColours={value:BOUNCE_ZONES.map(()=>new THREE.Vector3())};
 const bounceEnabled={value:0};
 const bounceSources={value:Array.from({length:18},()=>new THREE.Vector4())};
 const bounceSourceColours={value:Array.from({length:18},()=>new THREE.Vector4())};
 const bounceSourceCount={value:0};
 const group=new THREE.Group();group.name='Exterior window sky';scene.add(group);
 const skyMaterial=new THREE.ShaderMaterial({uniforms:{skyDay},side:THREE.DoubleSide,depthWrite:false,toneMapped:false,
  vertexShader:'varying vec2 skyUV; void main(){skyUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform float skyDay; varying vec2 skyUV;
   void main(){vec3 day=mix(vec3(.86,.90,.91),vec3(.63,.77,.86),smoothstep(.10,1.0,skyUV.y));
    vec3 night=mix(vec3(.025,.042,.064),vec3(.010,.019,.035),skyUV.y);
    gl_FragColor=vec4(mix(night,day,skyDay),1.0);}`});
 for(const w of WINDOWS){if(w.exterior===false)continue;const m=new THREE.Mesh(new THREE.PlaneGeometry(w.width,w.height),skyMaterial);m.name=w.name+' exterior sky';m.position.set(...w.centre);if(w.axis===1)m.rotation.y=-Math.PI/2;group.add(m);}
 const fragment=`
 uniform float windowDaylightStrength;
 uniform vec4 windowCentres[${WINDOWS.length}];
 uniform vec4 windowExtents[${WINDOWS.length}];
 uniform vec4 windowSpecs[${WINDOWS.length}];
 uniform vec4 bounceBounds[${BOUNCE_ZONES.length}];
 uniform vec3 bounceColours[${BOUNCE_ZONES.length}];
 uniform float fixtureBounceEnabled;
 uniform vec4 bounceSources[18];
 uniform vec4 bounceSourceColours[18];
 uniform int bounceSourceCount;
 varying vec3 daylightWorldPosition;
 varying vec3 daylightWorldNormal;
 float boundsWeight(vec3 p,vec4 b){
  return smoothstep(b.x,b.x+.08,p.x)*(1.0-smoothstep(b.y-.08,b.y,p.x))*
   smoothstep(b.z,b.z+.08,p.z)*(1.0-smoothstep(b.w-.08,b.w,p.z));
 }
 float commonAreaWeight(vec3 p){
  // One connected L-shaped public space, not a rectangle clipped at x=3.245.
  float main=boundsWeight(p,vec4(.01,3.325,-9.14,.08));
  float kitchen=boundsWeight(p,vec4(1.715,4.13,-2.68,.08));
  return max(main,kitchen);
 }
 vec3 diffuseWindowIrradiance(){
  if(windowDaylightStrength<=0.0)return vec3(0.0);
  vec3 p=daylightWorldPosition,n=normalize(daylightWorldNormal)*(gl_FrontFacing?1.0:-1.0);float energy=0.0;
  for(int i=0;i<${WINDOWS.length};i++){
   vec4 b=windowExtents[i],w=windowCentres[i],s=windowSpecs[i];
   if(i>0&&(p.x<b.x||p.x>b.y||p.z<b.z||p.z>b.w))continue;
   float region=i==0?commonAreaWeight(p):boundsWeight(p,b);
   if(i==0)region=max(region,.25*boundsWeight(p,vec4(3.165,6.37,-6.433,-5.12)));
   if(region<=0.0)continue;
   vec3 toWindow=w.xyz-p;float d2=max(dot(toWindow,toWindow),.04);vec3 direction=toWindow*inversesqrt(d2);
   float depth=max(0.0,s.y<.5?(p.z-w.z)*s.z:(p.x-w.x)*s.z);
   float projected=max(0.0,s.y<.5?-direction.z*s.z:-direction.x*s.z);
   float area=w.w*s.x,solidAngle=area/(d2+area);
   float direct=max(dot(n,direction),0.0)*projected*solidAngle;
   // Multiple diffuse bounces fill the connected public area; rooms behind
   // solid partitions keep their own portals. Kitchen still has a local source.
   float bounce=i==0?.035+.11*exp(-depth/4.5):.08*exp(-depth/4.5);
   // B2 / B3 pale walls provide diffuse return onto surfaces facing away from the window.
   // This room-local daylight proxy prevents the cabinet end from reading as a dark finish.
   if(i==1||i==3){float away=1.0-smoothstep(.05,.35,max(dot(n,direction),0.0));bounce+=(.12+.04*exp(-depth/4.5))*away;}
   energy+=region*s.w*(direct+bounce);
  }
  return vec3(energy*windowDaylightStrength);
 }
 vec3 diffuseFixtureBounce(){
  if(fixtureBounceEnabled<=0.0)return vec3(0.0);
  vec3 p=daylightWorldPosition,result=vec3(0.0);
  float commonRegion=commonAreaWeight(p);
  vec3 normal=normalize(daylightWorldNormal)*(gl_FrontFacing?1.0:-1.0);
  float orientation=.65+.35*clamp(normal.y*.5+.5,0.0,1.0);
  for(int i=0;i<18;i++){
   if(i>=bounceSourceCount)break;
   vec4 source=bounceSources[i],colour=bounceSourceColours[i];
   int zone=int(source.w);vec4 b=bounceBounds[zone];
   if(p.x<b.x||p.x>b.y||p.z<b.z||p.z>b.w)continue;
   float region=zone==0?commonRegion:boundsWeight(p,b);
   vec3 delta=p-source.xyz;
   float radius2=colour.w*colour.w;
   float falloff=radius2/(radius2+dot(delta.xz,delta.xz)+.3*delta.y*delta.y);
   result+=colour.rgb*region*falloff*orientation;
  }
  return result;
 }
 `;
 return {windows:WINDOWS,group,strength,bounceColours,bounceEnabled,bounceSourceCount,
  setBounceSources(sources){
   bounceSourceCount.value=Math.min(sources.length,18);
   for(let i=0;i<bounceSourceCount.value;i++){
    const s=sources[i];bounceSources.value[i].set(...s.position,s.zone);
    bounceSourceColours.value[i].set(...s.colour,s.radius);
   }
  },
  set(on){strength.value=on?26:0;skyDay.value=on?1:0;},
  attach(shader){
   Object.assign(shader.uniforms,{windowDaylightStrength:strength,windowCentres:centres,windowExtents:extents,windowSpecs:specs,bounceBounds,bounceColours,bounceSources,bounceSourceColours,bounceSourceCount,fixtureBounceEnabled:bounceEnabled});
   shader.vertexShader='varying vec3 daylightWorldPosition;\nvarying vec3 daylightWorldNormal;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    daylightWorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;
    daylightWorldNormal=normalize(mat3(modelMatrix)*objectNormal);`);
   shader.fragmentShader=fragment+shader.fragmentShader;
   // Keep a stable light pool for instant switches, but skip the expensive
   // area BRDF and shadow sampling for a pool slot whose source is off.
   let direct=THREE.ShaderChunk.lights_fragment_begin;
   direct=direct.replace(/RE_Direct_RectArea\( rectAreaLight,[^;]+;/g,call=>'if(dot(rectAreaLight.color,vec3(1.0))>0.0001){'+call+'}');
   direct=direct.replace('getSpotLightInfo( spotLight, geometryPosition, directLight );','getSpotLightInfo( spotLight, geometryPosition, directLight );\n directLight.visible = directLight.visible && dot(spotLight.color,vec3(1.0))>0.0001;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',direct);
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>','irradiance += diffuseWindowIrradiance() + diffuseFixtureBounce();\n#include <lights_fragment_end>');
  }
 };
}
