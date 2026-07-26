import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/listings', destination: '/vehicles', permanent: true },
      { source: '/listings/new', destination: '/vehicles/new', permanent: true },
      { source: '/listings/:id', destination: '/vehicles/:id', permanent: true },
      { source: '/listings/:id/edit', destination: '/vehicles/:id/edit', permanent: true },
    ];
  },
};

export default nextConfig;
