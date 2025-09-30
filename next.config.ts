import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow cross-origin requests from local network
  allowedDevOrigins: [
    '192.168.0.124:3000',
    '10.254.66.166:3000',
    'localhost:3000',
    '127.0.0.1:3000'
  ],
};

export default nextConfig;
