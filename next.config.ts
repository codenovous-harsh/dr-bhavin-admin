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
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'pub-52cbdbc329ee4722947acc85ef683c6a.r2.dev',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        port: ''
      }
    ],
    // Disable optimization for Cloudflare
    unoptimized: true,
  },

  transpilePackages: ['geist'],

  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
};

export default nextConfig;
