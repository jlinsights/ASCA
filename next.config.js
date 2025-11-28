const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로덕션 빌드에서 console 제거
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,

  // 성능 최적화
  compress: true,

  // Basic TypeScript and ESLint settings
  typescript: {
    // ignoreBuildErrors removed to enforce type checking
  },

  eslint: {
    // ignoreDuringBuilds removed to enforce linting
  },

  // 최고 화질 이미지 최적화 - 갤러리 특화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640, 768, 1024, 1280, 1536, 1920],
    minimumCacheTTL: 86400, // 24시간 캐시 (고화질 이미지)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 고화질 갤러리 이미지 최적화
    loader: 'default',
    path: '/_next/image',
    domains: [],
    unoptimized: false,
  },

  // Webpack configuration to fix RSC issues
  webpack: (config, { isServer }) => {
    // Fix for react-server-dom-webpack issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  // 실험적 기능으로 성능 향상
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'recharts',
      'date-fns',
    ],
    optimizeCss: false, // Temporarily disable for deployment
    gzipSize: true,
  },

  // Server external packages
  serverExternalPackages: ['@clerk/nextjs'],
}

module.exports = withBundleAnalyzer(nextConfig)
