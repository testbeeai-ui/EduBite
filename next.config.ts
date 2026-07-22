import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js "N" badge — not part of the student product UI.
  devIndicators: false,
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
          "**/*.txt",
          "**/*.sqlite",
          "**/*.sqlite-*",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
