import type { NextConfig } from "next";

const configuredApiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
const uploadsOrigin = !configuredApiUrl || configuredApiUrl.includes('backend-soul.vercel.app')
  ? 'https://backend-soul.onrender.com'
  : configuredApiUrl;

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
