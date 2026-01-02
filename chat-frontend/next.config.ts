import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allows other devices on the LAN (like your iPhone) to connect to the dev server
    // @ts-ignore - property exists in runtime but missing in type definitions
    allowedDevOrigins: ['localhost:3000', '192.168.0.175:3000', 'galaxyb.online', 'galaxyb.online:443', 'https://galaxyb.online']
  }
};

export default nextConfig;
