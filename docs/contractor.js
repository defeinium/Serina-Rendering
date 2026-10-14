import {AGREED_SCOPE,BEDROOM2,FIXTURES,FANS} from './agreed-design.js?v=20261014-b2-final';
const labels={'玄关':'Entry','客厅':'Living','餐厅':'Dining','厨房':'Kitchen','走道':'Hall','主人房':'Master','B2':'Bedroom 2','B3':'Bedroom 3','Bath 1':'Bathroom 1','Bath 2':'Bathroom 2'};
function row(parent,values){const tr=document.createElement('tr');for(const value of values){const td=document.createElement('td');td.textContent=value;tr.append(td)}document.querySelector(parent).append(tr)}
for(const [room,label] of Object.entries(labels)){row('#fittings',[label,FIXTURES.filter(f=>f.room===room&&f.installed).map(f=>f.name+' — '+f.status).join('; '),room==='B2'?BEDROOM2.circulator.model+'; plug into existing socket. No ceiling fan or hook relocation.':FANS.find(f=>f.room===room)?.status||'None'])}
for(const cabinet of AGREED_SCOPE.cabinetry)row('#cabinets',cabinet);
document.querySelector('#finishes').textContent=AGREED_SCOPE.wallPaint+'. '+AGREED_SCOPE.ceilingPaint+'. '+AGREED_SCOPE.kitchen+'. '+AGREED_SCOPE.windowTreatments;
document.querySelector('#yard').textContent=AGREED_SCOPE.yard;
for(const note of AGREED_SCOPE.pending){const p=document.createElement('p');p.textContent='• '+note;document.querySelector('#pending').append(p)}
document.querySelector('#print').onclick=()=>window.print();
