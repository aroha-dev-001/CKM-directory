import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is known at build time, so ship plain static files to `out/`.
  // That keeps Cloudflare Pages (`wrangler pages deploy out`) and Vercel both working.
  output: "export",
  // Static export has no image optimisation server. The photographs are
  // already cover-cropped to 1800×1200 by scripts/, so they are served as-is.
  images: { unoptimized: true },
  experimental: {
    // Two root layouts ((site) and (walk)) need a standalone 404 page.
    globalNotFound: true,
  },
};

export default nextConfig;
