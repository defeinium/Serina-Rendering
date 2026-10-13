// Planck spectrum integrated with CIE 1931 2° observer, 360–830 nm / 1 nm.
// CIE 2019 DOI 10.25039/CIE.DS.xvudnb9b, MD5 17cca777db64b17170f06f67ce9d3ab7.
// Source RGB is LINEAR-sRGB with Y=1, not an sRGB colour swatch.
// A separate Bradford viewing transform adapts a fixed 4500 K night camera
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
  "nightViewingWhiteBalanceKelvin": 4500,
  "nightViewingTransform": [
    0.9019914339649688,
    0.007939654421903626,
    0.011265245408215063,
    -0.16578583506282077,
    1.052396014418505,
    0.039253742163521205,
    -0.025222276489399717,
    -0.008392578752927867,
    1.4524069160530784
  ]
};
