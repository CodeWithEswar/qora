import { defineConfig, globalIgnores } from "eslint/config";

export const baseConfig = defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/.wrangler/**",
    "**/next-env.d.ts",
    "**/node_modules/**",
  ]),
]);

export default baseConfig;
