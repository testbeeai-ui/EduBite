import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  webpack: (config, { dev }) => {
    if (dev) {
      // SQLite WAL writes must not trigger Fast Refresh (infinite compile loop).
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/data/**",
          "**/*.sqlite",
          "**/*.sqlite-*",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
