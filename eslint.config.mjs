import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Static export: next/image would render an unoptimised <img> anyway, and the
      // stylesheets style these images directly (object-fit, aspect-ratio, transforms).
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored scroll engine, kept close to upstream.
    "lib/scrollcraft.js",
    // Standalone static pages and local tools, not part of the Next.js app.
    "public/**",
    "studio/**",
    "sandbox/**",
  ]),
]);

export default eslintConfig;
