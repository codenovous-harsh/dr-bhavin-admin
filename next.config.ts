import type { NextConfig } from 'next';

// Configuration for Cloudflare Pages deployment
const nextConfig: NextConfig = {
  // Use standalone output for Cloudflare Pages
  output: 'standalone',

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
    // Disable optimization for Cloudflare Pages
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
