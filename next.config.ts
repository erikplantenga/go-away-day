import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Alleen voor GitHub Pages-build: static export (geen API). Normale build (Vercel) blijft server.
  ...(process.env.GITHUB_PAGES === "true" && {
    output: "export",
    basePath: process.env.BASE_PATH ?? "",
    assetPrefix: process.env.BASE_PATH ? `${process.env.BASE_PATH}/` : undefined,
  }),
};

export default nextConfig;
