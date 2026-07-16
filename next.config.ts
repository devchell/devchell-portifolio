import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 requires an explicit allowlist; the project screenshots request quality={100}.
    qualities: [75, 100],
  },
};

export default nextConfig;
