
import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa");

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rqbnsffbqthxckzifefk.supabase.co",
      },
    ],
  },
  // next-pwa@2.x reads PWA options from the top-level 'pwa' key
  // @ts-expect-error - next-pwa adds pwa config to NextConfig
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
  },
};

export default withPWA(nextConfig);
