// Planck spectrum integrated with CIE 1931 2° observer, 360–830 nm / 1 nm.
// CIE 2019 DOI 10.25039/CIE.DS.xvudnb9b, MD5 17cca777db64b17170f06f67ce9d3ab7.
// Source RGB is LINEAR-sRGB with Y=1, not an sRGB colour swatch.
// Display comparison uses one fixed 4000 K neutral-source reference for all
// lamps, in both day and night. The Bradford transform is applied only to the
// illuminant preview; material RGB is never transformed by a mode/camera filter.
// Source spectrum values remain separately available as linearRGB / xy.
// All previews have Y=1 and identical lamp power. This is an RGB appearance
// approximation, not measured LED spectral rendering or lux calculation.
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
      ],
      "previewLinearRGB": [
        1.3604990267479973,
        0.9371052779530186,
        0.5609397350136908
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
      ],
      "previewLinearRGB": [
        1.1513022697682063,
        0.9765435761298794,
        0.7865870543354696
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
      ],
      "previewLinearRGB": [
        0.9999996067849991,
        1.000000012340952,
        0.9999996508557736
      ]
    }
  },
  "whiteReference": "D65 / sRGB output",
  "basis": "Planck spectrum + CIE 1931 2-degree observer",
  "previewNeutralKelvin": 4000,
  "previewSourceTransform": [
    0.8693099651431183,
    0.01074429582274808,
    0.017537398561518425,
    -0.22572232030833048,
    1.0736533403489679,
    0.062474975847408354,
    -0.03829815755440963,
    -0.013634854943465911,
    1.719586276564231
  ]
};
