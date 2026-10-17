// Non-modal left drawer: direct space selection and common viewer actions.
// Only its edge grip / header owns horizontal gestures; content keeps native scrolling.
export function createQuickControls(api){
 const root=document.querySelector('#quickDrawer'),panel=root.querySelector('aside'),grip=document.querySelector('#quickGrip');
 const openers=[grip,...document.querySelectorAll('[data-open-quick]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let opened=false,x=0,target=0,velocity=0,frame=0,last=0,drag=null,swallowedClick=false,returnFocus=grip,resumeLighting=false;
 const closedX=()=>-root.offsetWidth-parseFloat(getComputedStyle(root).left)-12;
 x=target=closedX();
 function paint(){root.style.transform=`translate3d(${x}px,0,0)`}
 function tick(now){
  const dt=Math.min(.025,(now-last)/1000||.016);last=now;
  const acceleration=420*(target-x)-41*velocity;
  velocity+=acceleration*dt;x+=velocity*dt;paint();
  if(Math.abs(target-x)<.25&&Math.abs(velocity)<3){x=target;velocity=0;frame=0;paint();return}
  frame=requestAnimationFrame(tick);
 }
 function animate(){cancelAnimationFrame(frame);if(reduced.matches){x=target;velocity=0;frame=0;paint();return}last=performance.now();frame=requestAnimationFrame(tick)}
 function setOpen(on,{keyboard=false,source=grip,restore=true}={}){
  const restoreLights=!on&&opened&&resumeLighting&&restore;
  if(on&&!opened&&panel.inert)resumeLighting=!!api.state().lightingOpen;
  opened=on;target=on?0:closedX();panel.inert=!on;panel.setAttribute('aria-hidden',String(!on));
  root.classList.toggle('is-open',on);openers.forEach(b=>b.setAttribute('aria-expanded',String(on)));
  grip.setAttribute('aria-label',on?'Close quick controls':'Open quick controls');
  if(on){returnFocus=source;api.beforeOpen();if(keyboard)panel.querySelector('button').focus({preventScroll:true})}
  else if(panel.contains(document.activeElement))(returnFocus.getClientRects().length?returnFocus:grip).focus({preventScroll:true});
  animate();
  if(restoreLights){resumeLighting=false;api.openLights()}
 }
 for(const b of openers)b.addEventListener('click',e=>{if(swallowedClick){swallowedClick=false;return}setOpen(!opened,{keyboard:e.detail===0,source:b})});
 root.querySelector('[data-quick-close]').onclick=()=>setOpen(false);
 for(const el of [grip,root.querySelector('.quick-heading')]){
  el.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||e.target.closest('[data-quick-close]'))return;
   cancelAnimationFrame(frame);frame=0;drag={id:e.pointerId,start:e.clientX,origin:x,lastX:e.clientX,lastT:e.timeStamp,moved:false,wasOpen:opened};el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;const dx=e.clientX-drag.start;
   if(!drag.moved&&Math.abs(dx)<6)return;
   if(!drag.moved){if(!opened)resumeLighting=!!api.state().lightingOpen;drag.moved=true;panel.inert=false;panel.setAttribute('aria-hidden','false');api.beforeOpen()}
   const dt=e.timeStamp-drag.lastT;if(dt>0)velocity=(e.clientX-drag.lastX)/dt*1000;
   drag.lastX=e.clientX;drag.lastT=e.timeStamp;x=Math.max(closedX(),Math.min(0,drag.origin+dx));paint();e.preventDefault();
  });
  const stop=e=>{if(drag?.id!==e.pointerId)return;const d=drag;drag=null;
   if(e.timeStamp-d.lastT>90)velocity=0;
   if(d.moved){swallowedClick=true;setOpen(e.type==='pointercancel'?d.wasOpen:x+velocity*.16>closedX()/2);setTimeout(()=>{swallowedClick=false},0)}
   else{velocity=0;target=opened?0:closedX();animate()}
   if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
  };
  el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);
  el.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId){drag=null;velocity=0;target=opened?0:closedX();animate()}});
 }
 document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();setOpen(false)}},true);
 document.addEventListener('pointerdown',e=>{if(opened&&!root.contains(e.target)&&!openers.some(b=>b.contains(e.target)))setOpen(false,{restore:!e.target.closest('#lightPanelToggle')})},true);
 // Ignore movement shortcuts while using a control, even when the drawer is non-modal.
 root.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.stopPropagation()});
 const roomHost=root.querySelector('#quickSpaces');
 const spaces=[['common','Common area'],['entry','Entry'],['kitchen','Kitchen'],['dining','Dining'],['living','Living room'],['hall','Hall'],['master','Master bedroom'],['b2','Bedroom 2'],['b3','Bedroom 3'],['bath1','Bath 1'],['bath2','Bath 2'],['yard','Yard']];
 const viewpoints=[['prep','Prep counter'],['foyer','Outer foyer'],['ledge','AC ledge']];
 function choosePlace(key){api.place(key);sync();setOpen(false)}
 for(const [key,label]of spaces){const b=document.createElement('button');b.type='button';b.dataset.quickPlace=key;b.textContent=label;b.onclick=()=>choosePlace(key);roomHost.append(b)}
 for(const [key,label]of viewpoints){const b=document.createElement('button');b.type='button';b.dataset.quickPlace=key;b.textContent=label;b.onclick=()=>choosePlace(key);root.querySelector('#quickViewpoints').append(b)}
 for(const b of root.querySelectorAll('[data-quick-action]'))b.onclick=()=>{api.action(b.dataset.quickAction);sync()};
 function sync(){
  const s=api.state(),name=s.overview?'Whole home':s.label;
  document.querySelector('#quickCurrentSpace').textContent=name;
  const launcher=document.querySelector('.side-launchers [data-open-quick]');launcher.setAttribute('aria-label',(opened?'Hide':'Show')+' spaces · '+name);
  document.querySelector('#quickLightingSpace').textContent=s.lightLabel;
  document.querySelector('#quickDetailsSpace').textContent=s.label;
  root.querySelector('#quickCurrent').textContent=name;
  const temperature=root.querySelector('#quickTemperature');if(temperature)temperature.hidden=s.lightScope!=='common';
  root.querySelectorAll('[data-quick-place]').forEach(b=>b.setAttribute('aria-pressed',String(!s.overview&&b.dataset.quickPlace===s.place)));
  const pressed={day:s.daylight,night:!s.daylight,plan:!s.inside,inside:s.inside&&!s.overview,overview:s.overview,cabinets:s.cabinets,dimensions:s.dimensions};
  root.querySelectorAll('[data-quick-action]').forEach(b=>{if(b.dataset.quickAction in pressed)b.setAttribute('aria-pressed',String(pressed[b.dataset.quickAction]))});
 }
 new ResizeObserver(()=>{if(drag)return;target=opened?0:closedX();if(!opened){cancelAnimationFrame(frame);frame=0;x=target;paint()}}).observe(root);
 reduced.addEventListener('change',()=>{if(frame)animate()});
 panel.inert=true;paint();sync();return{sync,close:()=>setOpen(false,{restore:false})};
}
