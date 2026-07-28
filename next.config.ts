import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/KermitTW-OS',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
