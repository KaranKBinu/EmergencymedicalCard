import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@neondatabase/serverless", "@prisma/adapter-neon", "ws"],
};

export default nextConfig;
