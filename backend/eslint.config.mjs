// backend/eslint.config.mjs
export default [
  { ignores: ["node_modules/**", "dist/**", "coverage/**"] },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "error",
      "no-console": "off"
    }
  }
];
