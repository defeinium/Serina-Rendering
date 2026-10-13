// Planck spectrum integrated with CIE 1931 2° observer, 360–830 nm / 1 nm.
// CIE 2019 DOI 10.25039/CIE.DS.xvudnb9b, MD5 17cca777db64b17170f06f67ce9d3ab7.
// Source RGB is LINEAR-sRGB with Y=1, not an sRGB colour swatch.
// A separate Bradford viewing transform adapts a fixed 3700 K night camera
// white to display D65. It transforms the full linear image before tone mapping;
// it never changes the source. Mixed daylight interpolates with D65 using
// the estimated active-source contribution; daylight alone uses D65.
// 3000/3500/4000 K previews share the same viewing white, exposure and lamp power.
// Illustrative human/camera adaptation, not a measured LED spectrum or lux result.
export const LIGHT_COLOUR = {
  "kelvin": 3500,
  "xy": [
    0.40530353164225885,
    0.3907156710078436
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
        0.40530353164225885,
        0.3907156710078436
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
  "nightViewingWhiteBalanceKelvin": 3700,
  "nightViewingTransform": [
    0.8462151960105778,
    0.012840541631926577,
    0.022807080032531103,
    -0.2708682888924054,
    1.0910785955208133,
    0.08220468927036656,
    -0.04912842025173886,
    -0.018130966949788305,
    1.947364483706806
  ]
};
