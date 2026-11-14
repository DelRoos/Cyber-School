import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate author previews from another local session's build artifacts.
  distDir:
    process.env.CYBER_SCHOOL_PREVIEW === "1"
      ? "../../node_modules/.cache/cyber-school-next-studio"
      : ".next",
  transpilePackages: [
    "@cyber-school/ui",
    "@cyber-school/animations",
    "@cyber-school/exercises",
    "@cyber-school/lesson-runtime",
  ],
};

export default nextConfig;
