// Source spectrum: CIE 1931 2-degree observer, 360–830 nm / 1 nm.
// CIE 2019 DOI 10.25039/CIE.DS.xvudnb9b, MD5 17cca777db64b17170f06f67ce9d3ab7.
// All source RGB is LINEAR-sRGB with Y=1. 4000 K is not forced to RGB white.
// Viewing adaptation is separate from source CCT and material reflectance.
export const LIGHT_COLOUR = {
  "kelvin": 3500,
  "xy": [
    0.4053035316422588,
    0.39071567100784355
  ],
  "linearRGB": [
    1.5640340119280034,
    0.8922511624747954,
    0.40564021652033255
  ],
  "variants": {
    "3000": {
      "kelvin": 3000,
      "xy": [
        0.43693104549050454,
        0.404073968579428
      ],
      "linearRGB": [
        1.7706495597959595,
        0.8442808606308886,
        0.27213898488972865
      ]
    },
    "3500": {
      "kelvin": 3500,
      "xy": [
        0.4053035316422588,
        0.39071567100784355
      ],
      "linearRGB": [
        1.5640340119280034,
        0.8922511624747954,
        0.40564021652033255
      ]
    },
    "4000": {
      "kelvin": 4000,
      "xy": [
        0.3804395325571836,
        0.3767468236222512
      ],
      "linearRGB": [
        1.413773320938663,
        0.9240273519840606,
        0.5335454206156578
      ]
    }
  },
  "whiteReference": "D65 / sRGB output",
  "basis": "Planck spectrum + CIE 1931 2-degree observer",
  "appearance": "Partial Bradford adaptation to the estimated mixed room illuminant; night degree 0.8, daylight degree 0.55. RGB preview, not measured LED or paint spectra."
};
// Partial chromatic adaptation of *radiance*, before tone mapping. The input is
// the estimated mixed room white. No camera/exposure changes with light count.
// A neutral D65 room returns identity; partial adaptation retains warmth.
const RGB_TO_XYZ=[[.4124564,.3575761,.1804375],[.2126729,.7151522,.072175],[.0193339,.119192,.9503041]];
const XYZ_TO_RGB=[[3.2404542,-1.5371385,-.4985314],[-.969266,1.8760108,.041556],[.0556434,-.2040259,1.0572252]];
const BRADFORD=[[.8951,.2664,-.1614],[-.7502,1.7135,.0367],[.0389,-.0685,1.0296]];
const BRADFORD_INVERSE=[[.9869929,-.1470543,.1599627],[.4323053,.5183603,.0492912],[-.0085287,.0400428,.9684867]];
const multiply=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((v,x,k)=>v+x*b[k][j],0)));
const transform=(a,b)=>a.map(row=>row.reduce((v,x,k)=>v+x*b[k],0));
export function roomViewingMatrix(whiteRGB,degree=.8){
 if(whiteRGB.every(v=>Math.abs(v-1)<1e-5)||degree===0)return [1,0,0,0,1,0,0,0,1];
 const xyz=transform(RGB_TO_XYZ,whiteRGB),source=transform(BRADFORD,xyz.map(v=>v/xyz[1])),target=transform(BRADFORD,[.95047,1,1.08883]);
 const diagonal=source.map((s,i)=>source.map((_,j)=>i===j?Math.pow(target[i]/s,degree):0));
 return multiply(multiply(multiply(multiply(XYZ_TO_RGB,BRADFORD_INVERSE),diagonal),BRADFORD),RGB_TO_XYZ).flat();
}
