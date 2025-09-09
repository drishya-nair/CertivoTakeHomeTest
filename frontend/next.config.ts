import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
