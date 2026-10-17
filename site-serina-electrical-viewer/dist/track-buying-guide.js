import {FIXTURES,FANS} from './agreed-design.js?v=20261017-retained-louvre-r1';
const lights=FIXTURES.filter(f=>f.room==='客厅'&&f.kind==='ceiling'),fan=FANS.find(f=>f.id==='L-FAN');
const x0=.17,y0=8.96,w=2.995,h=3.76,s=100,ox=90,oy=65;
const p=([x,y])=>[ox+(x-x0)*s,oy+(y0-y)*s];
const [fx,fy]=p(fan.centre);
let svg=`<rect x="${ox}" y="${oy}" width="${w*s}" height="${h*s}" fill="#fafaf7" stroke="#7f8b80"/><text x="240" y="35" text-anchor="middle" fill="#506253">窗口 / 双层布帘</text><rect x="99" y="130" width="70" height="215" rx="8" fill="#e3e3d9"/><text x="134" y="245" text-anchor="middle" fill="#506253">沙发</text><circle cx="${fx}" cy="${fy}" r="${fan.diameter*s/2}" fill="none" stroke="#879a8c" stroke-dasharray="5 4"/><text x="${fx}" y="${fy+5}" text-anchor="middle" fill="#506253">48″ 吊扇</text>`;
for(const [i,f] of lights.entries()){const [x,y]=p(f.centre);svg+=`<circle cx="${x}" cy="${y}" r="15" fill="white" stroke="#657b68" stroke-width="2"/><path d="M ${x-5} ${y}h10 M ${x} ${y-5}v10" stroke="#657b68"/><text x="${x+25}" y="${y+5}" fill="#344b3c">300C · ${i===0?'窗侧':'餐厅侧'}</text>`;const d=Math.round(Math.hypot(f.centre[0]-fan.centre[0],f.centre[1]-fan.centre[1])*1000);svg+=`<text x="${fx-10}" y="${(fy+y)/2}" text-anchor="end" font-size="12" fill="#69766c">中心距 ${d}</text>`;}
svg+='<text x="240" y="480" text-anchor="middle" fill="#506253">↓ 餐厅 / 吊灯保留</text>';
document.querySelector('#plan').innerHTML=`<svg viewBox="0 0 500 510" role="img" aria-label="客厅两个原灯位的Yeelight300C与原风扇位">${svg}</svg>`;
const rows=[['玄关','原灯位柔光吸顶灯',1],['厨房','原灯位柔光吸顶灯＋洗手盆灯带','1＋1'],['餐厅','移位吊灯',1],['B2','原风扇位柔光吸顶灯',1],['主人房','原中间灯位可调光吸顶灯',1],['B3','两盏吸顶灯＋吊扇','2＋1'],['走廊','已购买',2],['两间厕所','已购买：每间2盏',4]];
document.querySelector('#remaining').innerHTML=rows.map(r=>'<tr>'+r.map(v=>`<td>${v}</td>`).join('')+'</tr>').join('');
window.lightingGuide={living:lights.map(f=>({id:f.id,product:f.product,diameter:f.diameter,watts:f.watts,lumens:f.lumens})),trackRequired:false};
