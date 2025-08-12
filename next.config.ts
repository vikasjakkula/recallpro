import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // important for capacitor
  images: {
    unoptimized: true,
  },
  // You can add other config options here later
};

export default nextConfig;
