// Shared by the 2D drawings and 3D materials. Colours approximate supplied photographs.
export const CABINET_FINISHES={
 light:{name:'Sahara Stone',code:'37P002',colour:'#c7c3b7',grain:'fine mineral texture'},
 fridge:{name:'Phantom',code:'37P309',colour:'#5c5b56',grain:'restrained vertical woodgrain'},
 lower:{name:'Plain charcoal grey',colour:'#60615d',grain:'none'},
 status:'Photo-based colour / texture preview; confirm physical samples on site.'
};
// External finish assignments. Stone tops, recessed plinths and hardware remain separate.
export const CABINET_FINISH_ASSIGNMENTS={
 wet:{upper:'light',lower:'lower'},prep:'light',fridge:'fridge',
 b2:'light',b3:'light',tv:'lower',shoe:'light',yardNiche:'light'
};
