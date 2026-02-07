import type { NextConfig } from 'next';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
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
    ]
  },
  transpilePackages: ['geist'],
  // Turbopack configuration for Next.js 16+
  turbopack: {},
  experimental: {
    // Disable OG image generation to reduce bundle size for Cloudflare Workers
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    serverComponentsExternalPackages: ['@vercel/og', 'sharp'],
  },
};

// Sentry disabled for Cloudflare Workers build to reduce bundle size
// Re-enable by importing withSentryConfig and wrapping baseConfig if needed
const nextConfig = baseConfig;
export default nextConfig;
