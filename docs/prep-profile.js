// Millimetres. Free end is local x=0; x=width adjoins the fridge and stays square.
export function freeEndProfile(width,depth,radius,overhang=0,inset=0){
 const p={x0:-overhang+inset,d0:-overhang+inset,x1:width-inset,d1:depth+overhang-inset,radius:radius-inset};
 if(p.radius<=0||2*p.radius>p.d1-p.d0||p.radius>p.x1-p.x0)throw new RangeError('Invalid preparation-counter profile');
 return p;
}
export function profileSVG(p,X=v=>v,Y=v=>v,scale=1){
 const {x0,d0,x1,d1,radius:r}=p,R=r*scale;
 return `M ${X(x0+r)} ${Y(d0)} L ${X(x1)} ${Y(d0)} L ${X(x1)} ${Y(d1)} L ${X(x0+r)} ${Y(d1)} A ${R} ${R} 0 0 1 ${X(x0)} ${Y(d1-r)} L ${X(x0)} ${Y(d0+r)} A ${R} ${R} 0 0 1 ${X(x0+r)} ${Y(d0)} Z`;
}
