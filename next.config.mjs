/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression (Next.js compresses by default in production)
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
  
  // Webpack configuration to handle Node.js built-in modules
  webpack: (config, { isServer, webpack }) => {
    // Handle node: protocol imports
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Externalize Node.js built-in modules for client-side and edge runtime
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        net: false,
        tls: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
        util: false,
      };
    }

    // Ignore node: protocol for webpack
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );

    return config;
  },
};

export default nextConfig;

