import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["transbank-sdk"],
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
