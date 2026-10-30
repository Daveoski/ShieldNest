import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Python API (../backend): local uvicorn in dev, the shieldnest-api Vercel project in production
  async rewrites() {
    const apiUrl =
      process.env.SHIELDNEST_API_URL ??
      (process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8000"
        : "https://shieldnest-api.vercel.app");
    return [
      {
        source: "/api/py/:path*",
        destination: `${apiUrl}/api/py/:path*`,
      },
    ];
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
