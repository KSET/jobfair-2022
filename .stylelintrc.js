module.exports = {
  "root": true,
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue/scss",
  ],
  "plugins": [
    "stylelint-scss",
  ],
  "ignoreFiles": [
    "assets/styles/theme/**/*",
  ],
  "rules": {
    "selector-class-pattern": null,
    "declaration-block-no-redundant-longhand-properties": null,
    "no-invalid-position-at-import-rule": null,
    "no-descending-specificity": null,
    "rule-empty-line-before": [
      "always",
      {
        "except": [
          "after-single-line-comment",
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
    "color-hex-length": "long",
  },
};
