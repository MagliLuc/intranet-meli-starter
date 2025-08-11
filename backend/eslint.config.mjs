// Config mínima para ESLint v9 (flat config)
export default [
  // Cosas a ignorar
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"]
  },
  // Reglas para JS del backend (CommonJS)
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
      "no-console": "off"
    }
  }
];
