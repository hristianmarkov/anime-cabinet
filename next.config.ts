import type { NextConfig } from "next";
import contentRedirects from "./src/data/content-redirects.json";

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(contentRedirects).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
