import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  allowedDevOrigins: [
    "192.168.1.2",
    "localhost",
    "127.0.0.1",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
