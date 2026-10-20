// Shadow samplers remain allocated even when a pooled light has zero output.
// Reserve slots for cabinet colour/bump maps, area-light LTC maps, daylight
// shadows and other material maps. Every spot remains lit; only shadow maps
// are pooled within the device's fragment-texture budget.
export function spotShadowBudget(maxTextures,spotCount){
 const available=Number.isFinite(maxTextures)?Math.floor(maxTextures):16;
 return Math.min(Math.max(0,Math.floor(spotCount)),8,Math.max(0,available-8));
}
