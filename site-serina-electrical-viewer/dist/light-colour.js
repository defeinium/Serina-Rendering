// Planck spectrum integrated with CIE 1931 2° observer, 360–830 nm / 1 nm.
// CIE 2019 DOI 10.25039/CIE.DS.xvudnb9b, MD5 17cca777db64b17170f06f67ce9d3ab7.
// Source RGB is LINEAR-sRGB with Y=1, not an sRGB colour swatch.
// A separate Bradford viewing transform adapts a fixed 3700 K night camera
// white to display D65. It transforms the full linear image before tone mapping;
// it never changes the actual 3500 K source. Daylight uses D65 without adaptation.
// Illustrative human/camera adaptation, not a measured LED spectrum or lux result.
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
  "whiteReference": "D65 / sRGB output",
  "basis": "Planck spectrum + CIE 1931 2-degree observer",
  "nightViewingWhiteBalanceKelvin": 3700,
  "nightViewingTransform": [
    0.846215196010578,
    0.012840541631926577,
    0.022807080032531103,
    -0.2708682888924054,
    1.0910785955208133,
    0.08220468927036656,
    -0.049128420251738775,
    -0.0181309669497883,
    1.947364483706806
  ]
};
