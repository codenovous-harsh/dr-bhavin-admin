import type { NextConfig } from 'next';

// Configuration for Cloudflare Pages with OpenNext
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'clerk.com',
        port: ''
      }
    ],
    // Disable optimization for Cloudflare
    unoptimized: true,
  },

  transpilePackages: ['geist'],

  // Turbopack configuration for Next.js 16+
  turbopack: {},

  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
};

export default nextConfig;
