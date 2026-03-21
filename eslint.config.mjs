import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { ignores: ["**/node_modules/**", "**/generated/**", "prisma.config.ts"] },
  {
    files: ["**/*.js"],
    languageOptions: { 
      sourceType: "commonjs", 
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];