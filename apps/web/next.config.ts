import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@cyber-school/ui",
    "@cyber-school/animations",
    "@cyber-school/exercises",
    "@cyber-school/lesson-runtime",
  ],
};

export default nextConfig;
