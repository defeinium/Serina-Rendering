import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';

// Actual-unit photos show a glossy window reflection. One low-resolution
// planar capture covers the connected tile floor; timber/bath floors stay out.
// The capture is cached until the camera, scene or lighting changes.
export function createTileReflection(scene,mobile){
 const outline=[[.18,.18],[4.04,.18],[4.04,2.60],[3.245,2.60],[3.245,9.02],[.18,9.02]];
 const shape=new THREE.Shape();outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const size=256;
 const shader={name:'Gloss tile Fresnel reflection',uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},texel:{value:new THREE.Vector2(1/size,1/size)}},
 vertexShader:`uniform mat4 textureMatrix; varying vec4 reflectionUV; varying vec3 reflectionWorld;
 void main(){reflectionUV=textureMatrix*vec4(position,1.0);reflectionWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
 fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 texel; varying vec4 reflectionUV; varying vec3 reflectionWorld;
 void main(){
  vec2 uv=reflectionUV.xy/reflectionUV.w;
  vec3 reflection=texture2D(tDiffuse,uv).rgb;
  float facing=clamp(normalize(cameraPosition-reflectionWorld).y,0.0,1.0);
  float fresnel=.04+.80*pow(1.0-facing,5.0);
  gl_FragColor=vec4(reflection,fresnel);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`};
 const surface=new Reflector(new THREE.ShapeGeometry(shape),{textureWidth:size,textureHeight:size,multisample:0,clipBias:.0005,shader});
 surface.name='Glossy public tile floor reflection';surface.rotation.x=-Math.PI/2;surface.position.y=.020;surface.material.transparent=true;surface.material.depthWrite=false;surface.visible=false;surface.renderOrder=1;scene.add(surface);
 let dirty=true,captures=0,ready=false;
 const pose=new THREE.Matrix4(),projection=new THREE.Matrix4(),capture=surface.onBeforeRender;
 surface.onBeforeRender=function(renderer,world,camera,...args){
  if(!ready||dirty||!pose.equals(camera.matrixWorld)||!projection.equals(camera.projectionMatrix)){
   capture.call(this,renderer,world,camera,...args);pose.copy(camera.matrixWorld);projection.copy(camera.projectionMatrix);ready=true;dirty=false;captures++;
  }
 };
 return {surface,invalidate(){dirty=true},snapshot:()=>({visible:surface.visible,size,captures,cached:true})};
}
