module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    requireConfigFile: false,
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
    ],
    extraFileExtensions: [
      ".vue",
    ],
  },
  ignorePatterns: [
    ".eslintrc.js",
    "./graphql/client/**/*",
  ],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "@nuxtjs/eslint-config-typescript",
  ],
  // add your custom rules here
  rules: {
    // <Very slow>
    //    "@typescript-eslint/no-misused-promises": "off",
    //    "@typescript-eslint/no-unsafe-argument": "off",
    //    "@typescript-eslint/no-unsafe-return": "off",
    // </Very slow>
    "import/named": "off",
    "import/namespace": "off",
    "import/default": "off",
    "import/no-named-as-default-member": "off",
    "import/no-named-as-default": "off",
    "import/no-cycle": "off",
    "import/no-unused-modules": "off",
    "import/no-deprecated": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/consistent-type-definitions": [ "error", "type" ],
    "@typescript-eslint/await-thenable": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/prefer-return-this-type": [ "warn" ],
    "@typescript-eslint/prefer-optional-chain": [ "warn" ],
    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        "multiline": {
          "delimiter": "comma",
          "requireLast": true,
        },
        "singleline": {
          "delimiter": "comma",
          "requireLast": true,
        },
      },
    ],
    "no-lone-blocks": "off",
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": [ "error" ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "off",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        caughtErrors: "none",
      },
    ],
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-var-requires": "off",
    "no-void": "off",
    "vue/comment-directive": "off",
    "vue/no-v-model-argument": "off",
    "vue/no-multiple-template-root": "off",
    "nuxt/no-cjs-in-config": "off",
    "space-before-function-paren": [
      "error", {
        anonymous: "never",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "vue/html-indent": [
      "error", 2,
    ],
    "vue/script-indent": [
      "error", 2,
      {
        baseIndent: 1,
        switchCase: 1,
      },
    ],
    indent: "off",
    "@typescript-eslint/indent": "off",
    "array-bracket-spacing": [ "error", "always" ],
    "arrow-parens": [ "error", "always" ],
    "arrow-spacing": "error",
    camelcase: [
      "error",
      {
        ignoreDestructuring: true,
      },
    ],
    "comma-dangle": [ "error", "always-multiline" ],
    "comma-spacing": [
      "error",
      {
        before: false,
        after: true,
      },
    ],
    "comma-style": [ "error", "last" ],
    "computed-property-spacing": [ "error", "never" ],
    "dot-notation": "error",
    eqeqeq: [ "error", "always" ],
    "guard-for-in": "error",
    "linebreak-style": [ "error", "unix" ],
    "lines-between-class-members": [ "error", "always" ],
    "no-array-constructor": "error",
    "no-bitwise": "error",
    "no-mixed-operators": "error",
    "no-multi-assign": "error",
    "no-multiple-empty-lines": [
      "error",
      {
        max: 2,
        maxEOF: 1,
        maxBOF: 1,
      },
    ],
    "no-console": [
        "warn",
        {
            "allow": ["warn", "error", "info"],
        },
    ],
    "no-nested-ternary": "error",
    "no-new-object": "error",
    "no-tabs": "warn",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-return-assign": "off",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": [ "error" ],
    "object-curly-newline": [
      "error", {
        ImportDeclaration: "always",
      },
    ],
    "object-shorthand": [ "error", "always" ],
    "operator-linebreak": [
      "error",
      "before",
      {
        "overrides": {
          "=": "after",
        },
      },
    ],
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "prefer-destructuring": [
      "warn",
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    "prefer-numeric-literals": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "warn",
    "prefer-template": "warn",
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
    "semi": "off",
    "@typescript-eslint/semi": [ "error", "always" ],
    "space-before-blocks": [ "warn", "always" ],
    "space-infix-ops": "error",
    "template-curly-spacing": [ "error", "always" ],
    "template-tag-spacing": [ "error", "never" ],
    "wrap-iife": [ "error", "inside" ],
    yoda: [ "error", "always", { exceptRange: true } ],
  },
};
