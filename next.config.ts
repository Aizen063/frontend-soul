import type { NextConfig } from "next";

const uploadsOrigin = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://backend-soul.onrender.com';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${uploadsOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
