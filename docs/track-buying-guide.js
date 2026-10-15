import {FIXTURES, FANS, BEDROOM2, sourceModel} from './agreed-design.js?v=20261015-controls-r1';
const $=id=>document.getElementById(id);
const state={room:'living',system:'low',b2:'published'};
const rooms={
 living:{name:'客厅 · Living',title:'1 m 到电视侧，再转 2 m 向餐厅',intent:'原灯位是起点，不是轨道中间。端部进电后，电经导电 L 接头进入另一段轨道。',purpose:'4 盏可调角度柔光射灯：照墙与活动区，避免直接打电视屏幕。另有原灯位吸顶灯补充整体亮度。',watts:'7–10 W × 4',lumens:'每盏 500–750 lm',body:'灯体 Ø45–65 mm，长约 80–140 mm；50–60° 柔光配光为筛选目标。',colour:'黑色',track:'1000 mm + 2000 mm',feed:'端部进电',length:3,heads:4,load:[28,40],end:true,l:1,target:'客厅 1 m 横段向电视侧，转角后 2 m 向餐厅；沿用原灯位供电。'},
 kitchen:{name:'厨房 · Kitchen',title:'约 1.6 m，原灯位在中间',intent:'由原灯位向两边供电。采购必须写「双向中间进电」，不能只写中间进线。',purpose:'3 盏：2 盏照橱柜工作台，1 盏转向备餐台／中岛。水槽位置另有 Jason 报价内的柜底灯带。',watts:'10–12 W × 3',lumens:'每盏 800–1000 lm',body:'灯体 Ø55–75 mm，长约 90–150 mm；约 60° 柔光配光为筛选目标。',colour:'黑色',track:'约 1600 mm 总成',feed:'双向中间进电',length:1.6,heads:3,load:[30,36],end:false,l:0,target:'厨房直轨总长约 1600 mm，原灯位在轨道中间，3 盏灯。'},
 b2:{name:'书房 B2 · Study',title:'窗边横向 1.6 m',intent:'原窗边灯位保持不动，左右延伸。需要双向中间进电。门边的另一个灯位暂不装灯。',purpose:'2 个向下的乳白扩散柔光模块，给窗前 1400 × 600 mm 书桌及房间基础照明。书桌近距离工作可另配可调台灯。',watts:'15–18 W × 2',lumens:'每个 1200–1600 lm',body:'柔光模块目标长 250–350 mm、宽 70–100 mm；实际薄轨模块可能更窄、流明更低，须重新配数量。',colour:'白色',track:'约 1600 mm 总成',feed:'双向中间进电',length:1.6,heads:2,load:[30,36],end:false,l:0,target:'B2 已发布方案：窗边横向直轨总长约 1600 mm，穿过原窗边灯位，2 个柔光模块。'}
};
function current(){const r={...rooms[state.room]};if(state.room==='b2'&&state.b2==='proposal')Object.assign(r,{title:'比较提案 · 向室内 1 m',intent:'由原窗边灯位往房内延伸，不挪电线出口。这一走向改用端部进电；尚未替换已发布模型。',track:'1000 mm 目标总成',feed:'端部进电',length:1,end:true,target:'B2 比较提案（未替换已发布方案）：从原窗边灯位向房内延伸 1000 mm，2 个柔光模块。'});return r;}
const svgText=(x,y,t,cls='label',extra='')=>`<text x="${x}" y="${y}" class="${cls}" ${extra}>${t}</text>`;
function drawPlan(r){
 let X,Y,w,h,rail,heads,base='',labels='',special='',feed;
 if(state.room==='living'){
  [X,Y,w,h]=[.17,8.96,2.995,3.76];const f=FIXTURES.find(f=>f.id==='L-L1');rail=f.route;heads=f.heads;feed=f.centre;
 }else if(state.room==='kitchen'){
  [X,Y,w,h]=[.09,2.60,4.12,2.52];const f=FIXTURES.find(f=>f.id==='K-L2');rail=f.route;heads=f.heads;feed=f.centre;
 }else{
  [X,Y,w,h]=[3.335,8.96,2.865,2.517];const f=FIXTURES.find(f=>f.id==='B2-TRACK');feed=f.centre;
  rail=state.b2==='published'?f.route:[feed,[feed[0],feed[1]-1]];
  heads=state.b2==='published'?f.heads:[[feed[0],8.96-.5],[feed[0],8.96-1.05]];
 }
 const s=Math.min(350/w,370/h),ox=75,oy=60;
 const p=([x,y])=>[ox+(x-X)*s,oy+(Y-y)*s];
 const rect=(x,y,ww,hh,label)=>{const [px,py]=p([x,y]);return `<rect x="${px}" y="${py}" width="${ww*s}" height="${hh*s}" rx="4" class="furniture"/>${label?svgText(px+ww*s/2,py+hh*s/2+5,label,'label','text-anchor="middle"'):''}`;};
 const segment=(a,b,cls='power',extra='')=>`<path d="M ${a.join(' ')} L ${b.join(' ')}" class="${cls}" ${extra}/>`;
 const arrow=(a,b,off=15)=>{const pa=p(a),pb=p(b),dx=pb[0]-pa[0],dy=pb[1]-pa[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;const a1=[pa[0]+dx*.2+nx*off,pa[1]+dy*.2+ny*off],b1=[pa[0]+dx*.78+nx*off,pa[1]+dy*.78+ny*off];return segment(a1,b1,'power','marker-end="url(#arrow)"');};
 base=`<rect x="${ox}" y="${oy}" width="${w*s}" height="${h*s}" class="room"/>`;
 if(state.room==='living'){
  base+=rect(.25,8.12,.85,2.20,'SOFA')+rect(2.80,7.93,.30,1.65,'');
  const f=FANS.find(f=>f.id==='L-FAN'),[fx,fy]=p(f.centre);
  base+=`<circle cx="${fx}" cy="${fy}" r="${f.diameter*s/2}" fill="none" stroke="#b7beb1" stroke-dasharray="6 5"/>`+svgText(fx,fy+5,'48″ FAN','label','text-anchor="middle"');
  labels+=svgText(ox+w*s-7,oy+h*s/2,'TV','label','text-anchor="end"')+svgText(ox+w*s/2,oy-16,'WINDOW / 双层布帘','label','text-anchor="middle"');
  labels+=svgText(ox+w*s/2,oy+h*s+30,'↓ DINING / 餐厅','label','text-anchor="middle"');
  const a=p(rail[0]),b=p(rail[1]),c=p(rail[2]);
  labels+=svgText((a[0]+b[0])/2,Math.max(22,a[1]-33),'1000 mm','dim','text-anchor="middle"');
  labels+=svgText(b[0]+20,(b[1]+c[1])/2,'2000 mm','dim');
  special+=`<rect x="${b[0]-7}" y="${b[1]-7}" width="14" height="14" rx="3" fill="#b85d30"/>`;
 }else if(state.room==='kitchen'){
  base+=rect(1.975,.77,2.065,.62,'WET CABINET')+rect(1.795,2.611,1.372,.762,'PREP')+rect(3.175,2.611,.762,.762,'FRIDGE');
  labels+=svgText(ox+w*s/2,oy-16,'厨房接线示意 · 家具位置从模型提取','label','text-anchor="middle"');
  const a=p(rail[0]),b=p(rail[1]);labels+=svgText((a[0]+b[0])/2,a[1]-38,'≈1600 mm 总成','dim','text-anchor="middle"');
 }else{
  base+=rect(BEDROOM2.desk.centre[0]-.7,BEDROOM2.desk.centre[1]+.3,1.4,.6,'1400 × 600 DESK');
  base+=rect(3.335,7.033,1.44,.6,'3-DOOR WARDROBE');
  const fc=p(BEDROOM2.circulator.centre);base+=`<circle cx="${fc[0]}" cy="${fc[1]}" r="18" fill="#e6e7df" stroke="#a7b3a0"/>`+svgText(fc[0]+26,fc[1]+4,'FLOOR FAN');
  const unused=p(sourceModel('B2-L2'));base+=`<circle cx="${unused[0]}" cy="${unused[1]}" r="5" fill="#c0c6bc"/>`+svgText(unused[0]+10,unused[1]-8,'不用 / Unused');
  for(let i=0;i<3;i++){const [a,b]=p([3.335+i*.48,7.033]);base+=`<path d="M ${a+.48*s} ${b} A ${.48*s} ${.48*s} 0 0 0 ${a} ${b-.48*s}" fill="none" stroke="#c2c9ba" stroke-dasharray="3 3"/>`;}
  labels+=svgText(ox+w*s/2,oy-19,'NW WINDOW / 西北窗','label','text-anchor="middle"');
  labels+=svgText(ox+w*s/2,oy+h*s+31,'2865 mm · 图纸估算宽度','dim','text-anchor="middle"');
  if(state.b2==='published'){const a=p(rail[0]),b=p(rail[1]);labels+=svgText((a[0]+b[0])/2,a[1]+45,'1600 mm 横向','dim','text-anchor="middle"');}
  else{const a=p(rail[0]),b=p(rail[1]);labels+=svgText(a[0]+21,(a[1]+b[1])/2,'1000 mm','dim');}
 }
 const railPath=`<polyline points="${rail.map(v=>p(v).join(',')).join(' ')}" class="rail"/>`;
 let power='';if(r.end){for(let i=1;i<rail.length;i++)power+=arrow(rail[i-1],rail[i]);}else{power+=arrow(feed,rail[0],-18)+arrow(feed,rail[1],18);}
 const [fx,fy]=p(feed);special+=`<circle cx="${fx}" cy="${fy}" r="9" class="feed"/><path d="M ${fx-4} ${fy}h8 M ${fx} ${fy-4}v8" stroke="#b85d30" stroke-width="1.5"/>`;
 const lights=heads.map(h=>{const [x,y]=p(h);return state.room==='b2'?`<rect x="${x-12}" y="${y-5}" width="24" height="10" rx="3" class="head"/>`:`<path d="M ${x} ${y}v10" stroke="#657b68" stroke-width="3"/><circle cx="${x}" cy="${y+12}" r="7" class="head"/>`;}).join('');
 $('plan').innerHTML=`<svg viewBox="0 0 500 ${Math.max(420,oy+h*s+65)}" role="img" aria-label="${r.name}轨道和原灯位接法"><defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#43846a"/></marker></defs>${base}${railPath}${power}${lights}${special}${labels}</svg>`;
}
function parts(r){const low=state.system==='low';return [
 ['明装轨道条','Surface-mounted track rail',r.track,`${r.colour}；不用开天花槽。${state.room==='living'?'询价先列 1 条 1000 mm＋1 条 2000 mm 原料，含接件后按目标完成长度排料。':r.end?'询价列 1 条 1000 mm 原料，含进电器后确认完成长度。':'询价可列 2 条 1000 mm 原料，由卖家裁切并配双向中间进电组件，做成约 1600 mm 总成。'}`,r.end?'所写长度为目标；最终含进电器、转角的完成尺寸由卖家排料确认。':'如果厂家有整根轨道中部双向进电方案，也可改为 1 条 2000 mm 裁切。两种配法择一，不是两套都买。'],
 [r.end?'端部进电器':'双向中间进电器',r.end?'End power feed':'Bidirectional centre power feed','1 套',r.end?'把供电接入轨道起点，再经轨道母线送到各盏灯。':'把原灯位电源接到直轨中段，并送往左右两边。中间进电必须明确双向导通。',low?'必须是该系列低压进电件，接在匹配电源的输出端。':'市电轨须符合本地电源及接地要求，由电工确认。'],
 ...(r.l?[[ '90° 导电转角','Conductive L connector','1 套','让轨道转弯，也让电接着走。不是只有外壳的装饰转角。','确认左右转向、接地／极性方向及配件本身占用长度。']]:[]),
 ['轨道灯头／柔光模块','Track spotlight / diffused light module',r.heads+' 个',state.room==='b2'?'乳白扩散面、宽配光，向下提供基础照明；不是窄角射灯。':'可调整方向，按上图照向工作面及墙面。灯头含匹配轨道适配器。',`${r.watts}；${r.lumens}。3500K、CRI≥90 为购买目标；若选调色温款，须覆盖 3000/3500/4000K。`],
 ['端盖／封口件','End cap / terminal closure',r.end?'2 端封闭':'2 个外端盖','封闭轨道外露端口。不能留下裸露的导电端。',r.end?'起点通常由端部进电器自带封口，另一端加端盖；请卖家整套配齐，勿重复算两个独立端盖。':'两端各一；如果轨道包装已含，不要重复购买。'],
 ['原灯位接线盖／吸顶接线盒','Ceiling canopy / junction enclosure','1 套','盖住原来的天花出线孔，并容纳合规接线。轨道很窄也未必盖得住原孔。','给卖家孔径／接线情况照片后确认盖子的长、宽、厚；可与进电器或电源外壳整合，不一定另买。'],
 ...(low?[[ '48V 恒压电源及外壳','48V constant-voltage power supply + enclosure','1 套',`将 220–240V AC 转成该轨道所需的 48V DC。此空间灯具目标负载 ${r.load[0]}–${r.load[1]} W；选厂家允许容量并按其降额要求留余量。`,'不是随便买一只恒流 LED 驱动。可用厂家明装电源模块／可检修盒；尺寸与位置先确认。']]:[]),
 ['明装固定配件包','Surface-mount fixing kit','1 套','固定轨道在原天花上；包含匹配安装片、螺丝及适用基层的固定件。','固定件型号与数量按厂家安装孔距、实际混凝土／基层由安装人员确定。'],
 ['智能控制器／网关（选配）','Smart controller / gateway (optional)','按选定型号','要调光／调色温，就需要相应灯具驱动和控制协议。要 Apple Home，须核对具体 SKU 的接入方式。','不要先盲买网关。进电器不是控制器；HomePod 也不能直接取代 Zigbee 网关。']
 ];}
function seller(r){const low=state.system==='low';return `你好，我在马来西亚使用，原天花不做新吊顶，要${r.colour}${low?'超薄明装 48V 恒压':'薄款明装 220–240V'}轨道整套。\n\n${r.target}\n原灯位接法：${r.feed}。${r.end?'原灯位在轨道起点。':'从中间进线，必须确认左右两侧都导通，不能只通一边。'}\n灯具：${r.heads} 个${state.room==='b2'?'宽配光乳白柔光模块':'柔光可调角度射灯'}，每个目标 ${r.lumens}，${r.watts.replace(/ × \d/,'')}。3500K、CRI≥90；如果调色温需覆盖3000/3500/4000K。请给整灯实际流明，不是灯珠流明。\n\n请整套列出：\n${parts(r).filter(v=>!v[0].includes('选配')).map(v=>`• ${v[0]} / ${v[1]}：${v[2]}`).join('\n')}\n\n请回覆：\n1. 具体轨道系列、电压、安装截面及全部配件图，${r.end?'确认端部供电接法':'在图上画出中间进电左右导通路径'}。\n2. ${r.l?'L转角须导电并匹配转向。':'需要一字导电接件吗？请明确中间进电组件是否已包含连接功能。'}\n3. ${low?'48V电源放哪里？请给明装电源盒和进线盖装好后的照片及尺寸；不要提供必须藏吊顶的电源方案。':'原灯位接线盖装好后的照片及尺寸；明确是否仍有外置盒子。'}\n4. 轨道、灯头、接头和电源装好后各自下吊多少mm？原出线孔能不能盖住？\n5. 轨道是否可按目标总成尺寸裁切？含接头后的完成长度是多少？请配齐端盖。\n6. 每盏型号、尺寸、实际整灯lm、W、配光角度、调光方式和低亮度频闪数据。${state.room==='b2'?'若单个柔光模块达不到目标lm，请另给配法，不要用瓦数代替流明。':''}\n7. 如果要Apple Home：哪个具体型号，原生HomeKit或Matter还是通过网关？需要哪款网关及什么地区账号？Home App能否逐盏调光和调色温？\n\n请分开报价轨道、全部接件、电源、灯头及可选智能配件。`;}
function render(){const r=current(),low=state.system==='low';
 document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.room===state.room));document.querySelectorAll('[data-system]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.system===state.system));
 $('b2-variants').hidden=state.room!=='b2';$('room-title').textContent=r.name;$('feed-type').textContent=r.feed;$('route-note').textContent=r.intent;$('achieve').textContent=r.title;$('intent').innerHTML=`<p>${r.purpose}</p>`;
 $('light-target').innerHTML=`<strong>${r.watts}</strong><small>${r.lumens}</small><p>${r.body}</p>`;drawPlan(r);
 $('system-heading').textContent=low?'薄轨＋低压灯具＋可见的电源位置':'轨道直接接市电，灯头内处理驱动';
 $('system-description').textContent=low?'这里以 48V 恒压系统解释。天花的市电先进入匹配电源，再由进电器进入低压轨道；电源盒留在原灯位附近，采用厂家允许的明装外壳。另有24V等系统，不能混用。':'选明确支持 220–240V 的完整薄款明装轨道，省掉独立降压电源盒。灯头有自己的驱动；仍需容纳原灯位接线的盖子，薄不代表没有接线盒。';
 const steps=low?['原灯位 220–240V','可检修明装 48V 电源',r.feed,'48V 轨道','匹配灯具']:['原灯位 220–240V','接线盖＋'+r.feed,'230V 轨道','匹配灯头（内置驱动）'];$('power-path').innerHTML=steps.map(v=>`<span>${v}</span>`).join('<i>→</i>');
 $('profile').innerHTML=`<svg viewBox="0 0 380 180" role="img" aria-label="${low?'电源盒与轨道并排明装':'市电接线盖与薄轨道明装'}侧面示意"><rect x="10" y="16" width="360" height="12" fill="#aab3a3"/><text x="15" y="12" font-size="12" fill="#64716d">原天花 / Existing ceiling</text><rect x="45" y="28" width="${low?175:105}" height="${low?36:24}" rx="4" fill="#657b68"/><path d="M 100 21v16" stroke="#b85d30" stroke-width="3"/><text x="${low?132:97}" y="${low?54:45}" text-anchor="middle" fill="white" font-size="12">${low?'明装电源盒 / Driver':'接线盖 / Feed'}</text><path d="M ${low?220:150} 48 H 250 V 32 H 270" fill="none" stroke="#43846a" stroke-width="2"/><rect x="270" y="28" width="75" height="8" fill="#263533"/><rect x="285" y="36" width="40" height="${state.room==='b2'?25:48}" rx="4" fill="#657b68"/><text x="40" y="115" font-size="12" fill="#64716d">${low?'电源盒在轨道旁，接到匹配进电器':'接线盖通过匹配进电器连接轨道'}</text><text x="40" y="146" font-size="12" fill="#64716d">分别看下吊：轨道、接头、电源盒、灯体</text><text x="40" y="165" font-size="12" fill="#64716d">相对位置示意；实际间距以配套安装图为准</text></svg>`;
 $('profile-note').textContent=low?'若电源放在柜内，必须另外确认可见电线走法、散热及检修口。本图展示原灯位附近明装电源的方案，不假设天花能藏电源。':'“230V 三线单回路”通常指 L / N / PE，不等于三回路轨道。不能仅凭三线、四线或磁吸等字样判断兼容性。';
 $('bom-heading').textContent=r.name+' · '+r.feed;$('bom-subtitle').textContent=`${r.colour} · ${r.track} · ${r.heads} 个灯头／模块 · ${low?'48V 低压':'220–240V 市电'} · 请卖家按最终总成长度排料。`;
 $('bom').innerHTML=parts(r).map(([cn,en,qty,why,spec])=>`<article class="part"><div class="part-top"><h3>${cn}</h3><span class="num">${qty}</span></div><span class="en">${en}</span><p>${why}</p><p class="spec">${spec}</p></article>`).join('');
 $('totals').innerHTML=`<p><b>轨道完成长度目标：</b>客厅 3 m ＋厨房约 1.6 m ＋ B2 ${state.b2==='published'?'约 1.6 m ＝约 6.2 m':'提案 1 m ＝约 5.6 m'}。原料条长及数量由同系列接件占长决定；不是照总米数随便下单。</p><p><b>灯头／模块：</b>4 ＋ 3 ＋ 2 ＝ 9 个。</p><p><b>供电组件：</b>${state.b2==='published'?'端部 1 套＋双向中间 2 套':'端部 2 套＋双向中间 1 套'}；导电 L 转角 1 套；3 个区域各自保持原供电回路。</p><p><b>封口：</b>6 个外端均需封闭；端部进电器自带的封口算在内，余下开放端配端盖。</p><p><b>接线盖：</b>3 处，可能与进电器／电源盒整合。${low?'48V 系统另需 3 套匹配电源，各接各自原灯位；不把三个独立开关回路并成一个电源。':'市电系统无独立降压盒；具体所选灯头须有匹配驱动。'}</p><p>一字导电连接件：仅在整套配法确实需要时增加，中间进电器已含导电连接功能则不要重复购买。固定包按 3 个区域配。智能网关按品牌系统共享，不按每条轨道各买一个。</p>`;
 $('seller-message').value=seller(r);window.trackGuide={state:{...state},room:r,parts:parts(r)};
}
document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>{state.room=b.dataset.room;render();document.querySelector('.coordination').scrollIntoView({block:'start',behavior:'instant'});}));
document.querySelectorAll('[data-system]').forEach(b=>b.addEventListener('click',()=>{state.system=b.dataset.system;render();}));
$('b2-layout').addEventListener('change',e=>{state.b2=e.target.value;render();document.querySelector('.coordination').scrollIntoView({block:'start',behavior:'instant'});});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('seller-message').value);$('toast').textContent='已复制当前空间的询价清单';}catch{$('seller-message').focus();$('seller-message').select();$('toast').textContent='已选中文字，可长按复制';}$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200);});
render();
