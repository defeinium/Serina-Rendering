// Day and night own independent, persistent circuit selections. Visiting a new
// night scope seeds only its primary lights, once; an explicit off stays off.
export function createLightingState({circuits,inScope,storage,key='serina-light-scenes-v1'}){
 const scopes=[...new Set(circuits.map(c=>['玄关','厨房','餐厅','客厅','走道'].includes(c.room)?'common':c.room))];
 let data={day:{values:{},visited:[]},night:{values:{},visited:[]}},mode='day',undo=null,persistent=false;
 try{const saved=JSON.parse(storage?.getItem(key));for(const m of ['day','night'])if(saved?.[m]?.values&&Array.isArray(saved[m].visited)){data[m].values=Object.fromEntries(circuits.filter(c=>typeof saved[m].values[c.id]==='boolean').map(c=>[c.id,saved[m].values[c.id]]));data[m].visited=saved[m].visited.filter(s=>scopes.includes(s));}}catch{}
 const persist=()=>{try{if(storage){storage.setItem(key,JSON.stringify(data));persistent=true}}catch{persistent=false}};
 const capture=()=>{data[mode].values=Object.fromEntries(circuits.map(c=>[c.id,c.on]));persist()};
 const checkpoint=()=>{undo={mode,data:JSON.parse(JSON.stringify(data)),values:Object.fromEntries(circuits.map(c=>[c.id,c.on]))}};
 const primary=c=>c.kind!=='strip'&&c.kind!=='floorLamp';
 // Seed newly introduced fittings in an already-visited night room, preserving saved OFF states.
 for(const c of circuits){const scope=['玄关','厨房','餐厅','客厅','走道'].includes(c.room)?'common':c.room;if(data.night.visited.includes(scope)&&typeof data.night.values[c.id]!=='boolean')data.night.values[c.id]=primary(c);}
 function visit(scope){const s=data[mode];if(!s.visited.includes(scope)){s.visited.push(scope);if(mode==='night')for(const c of circuits)if(inScope(c,scope))c.on=primary(c);capture();}}
 function start(day,scope){mode=day?'day':'night';for(const c of circuits)c.on=data[mode].values[c.id]??false;visit(scope);capture();}
 function change(day,scope){const next=day?'day':'night';if(next===mode)return false;capture();checkpoint();start(day,scope);return true;}
 function edit(fn,scope){capture();checkpoint();fn(circuits);const touched=scope==='all'?scopes:[scope];for(const s of touched)if(!data[mode].visited.includes(s))data[mode].visited.push(s);capture();}
 function defaults(scope){edit(cs=>cs.filter(c=>inScope(c,scope)).forEach(c=>c.on=mode==='night'&&primary(c)),scope)}
 function revert(){if(!undo)return null;const previous=undo;undo=null;mode=previous.mode;data=previous.data;for(const c of circuits)c.on=previous.values[c.id]??false;capture();return mode==='day';}
 return{start,change,visit,edit,defaults,revert,get canUndo(){return!!undo},get mode(){return mode},get persistent(){return persistent}};
}
