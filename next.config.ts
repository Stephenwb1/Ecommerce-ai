import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["chromadb", "@chroma-core/default-embed"],
};

export default nextConfig;
