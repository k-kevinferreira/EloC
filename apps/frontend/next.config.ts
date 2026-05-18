import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
