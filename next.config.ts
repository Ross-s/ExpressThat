import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    nodeMiddleware: true,
  },
};

export default nextConfig;
