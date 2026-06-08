import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "graph.microsoft.com" },
    ],
  },
  // Performance optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: false },
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 1,
  },
  experimental: {
    optimizePackageImports: ["@ant-design/icons", "antd", "lucide-react"],
  },
};

export default nextConfig;
