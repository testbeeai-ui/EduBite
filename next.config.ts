import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: [],
  webpack: (config) => {
    // Hide Webpack cache performance warnings in terminal logs
    config.infrastructureLogging = { level: "error" };
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Serializing big strings/,
      /PackFileCacheStrategy/,
    ];
    return config;
  },
};

export default nextConfig;
