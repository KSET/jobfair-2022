module.exports = {
  "root": true,
  "extends": [
    "stylelint-config-standard-scss",
  ],
  "plugins": [
    "stylelint-scss",
  ],
  "ignoreFiles": [
    "assets/styles/theme/**/*",
  ],
  "rules": {
    "number-leading-zero": "never",
    "rule-empty-line-before": [
      "always",
      {
        "except": [
          "after-single-line-comment",
        ],
      },
    ],
    "block-closing-brace-empty-line-before": [
      "never",
      {
        "except": [
          "after-closing-brace",
        ],
      },
    ],
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        "ignorePseudoClasses": [
          "global",
        ],
      },
    ],
    "color-hex-case": "lower",
    "color-hex-length": "long",
  },
};
