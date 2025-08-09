const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // TypeScript와 ESLint 설정
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 성능 최적화 설정
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 압축 최적화
  compress: true,
  
  // 실험적 기능
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@/components/ui',
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // webpack 설정 추가
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 클라이언트 사이드 polyfill 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // 프로덕션 최적화
    if (!dev) {
      // Tree shaking 최적화
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
        providedExports: true,
      };

      // 청크 분할 최적화
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };

      // 번들 크기 분석
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html',
          })
        );
      }
    }

    // SVG 처리
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },

  // 헤더 설정 (보안 및 캐싱)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000', // 30일
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/page',
        permanent: false,
      },
    ];
  },
}

module.exports = withBundleAnalyzer(nextConfig)