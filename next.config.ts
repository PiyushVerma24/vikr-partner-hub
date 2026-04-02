import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rqbnsffbqthxckzifefk.supabase.co",
      },
    ],
  },
};

export default nextConfig;
