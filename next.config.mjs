/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression (Next.js compresses by default in production)
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },
  
  // Output configuration for Docker
  output: 'standalone',
  
  // Experimental features for better performance
  experimental: {
    // Enable server components
    serverComponents: true,
  },
};

export default nextConfig;

