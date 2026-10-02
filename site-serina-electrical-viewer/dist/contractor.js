document.querySelector('#print').addEventListener('click',()=>window.print());
const boxes=[...document.querySelectorAll('.check-grid input')];
try {
  const saved=JSON.parse(localStorage.getItem('serina-contractor-checks')||'[]');
  boxes.forEach((box,i)=>{box.checked=Boolean(saved[i]);box.addEventListener('change',()=>localStorage.setItem('serina-contractor-checks',JSON.stringify(boxes.map(x=>x.checked))))});
} catch {}
