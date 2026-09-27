import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats where the browser supports them (smaller LCP images).
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
