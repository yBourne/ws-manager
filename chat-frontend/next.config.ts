import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allows other devices on the LAN (like your iPhone) to connect to the dev server
    allowedDevOrigins: ['localhost:3000', '192.168.0.175:3000']
  }
};

export default nextConfig;
