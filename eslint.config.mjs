import globals from "globals";
import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: { globals: globals.browser }
  },
  pluginJs.configs.recommended,
  {
    ignores: ["**/socket.io.js", "**/debugger.js"]
  },
  {
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "no-unused-vars": "error",
      "no-unreachable": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }
      ]
    }
  }
];