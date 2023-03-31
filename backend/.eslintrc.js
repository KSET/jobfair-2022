module.exports = {
  extends: "../.eslintrc.js",
  rules: {
    // <Very slow>
    //    "@typescript-eslint/consistent-type-imports": "off",
    // </Very slow>
    "@typescript-eslint/indent": [ "error", 2 ],
    "@typescript-eslint/no-inferrable-types": "off",
  },
};
