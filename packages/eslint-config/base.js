import js from "@eslint/js";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "@typescript-eslint/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 */
export const config = {
  ...js.configs.recommended,
  ...eslintConfigPrettier,
  rules: {
    ...tseslint.configs.recommended.rules,
    "turbo/no-undeclared-env-vars": "warn",
  },
  plugins: {
    turbo: turboPlugin,
    onlyWarn,
  },
  ignores: ["dist/**"],
};