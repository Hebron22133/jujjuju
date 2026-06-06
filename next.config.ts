import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    bundlePagesRouterDependencies: true,
  },
};

export default nextConfig;
