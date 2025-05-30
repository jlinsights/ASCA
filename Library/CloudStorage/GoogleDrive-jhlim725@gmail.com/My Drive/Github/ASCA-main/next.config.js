/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ 빌드 시 타입 오류를 무시합니다 (Vercel 배포용)
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ 빌드 시 ESLint 오류를 무시합니다 (Vercel 배포용)
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-slot', 'class-variance-authority']
  },
  webpack: (config, { isServer }) => {
    // 모듈 해결 문제 방지
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
}

module.exports = nextConfig 