import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Esta regla intercepta a quien entre a localhost:3000 y lo manda al dashboard
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;