import js from "@eslint/js";
import astroPlugin from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["node_modules/**", "dist/**", ".astro/**", "tests/**", "**/__mocks__/**", "vitest.config.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs", "**/*.cjs"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto", singleQuote: false }],
      "linebreak-style": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.astro"],
    ...astroPlugin.configs.recommended,
  },
  prettierConfig,
];
