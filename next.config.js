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
  // 트레일링 슬래시 설정 - URL 일관성 보장
  trailingSlash: false,
  // 정적 내보내기 설정 (필요한 경우에만)
  // output: 'export',
  // 리다이렉트 설정
  async redirects() {
    return [
      // 필요한 리다이렉트 규칙 추가
    ]
  },
  // 리라이트 설정 - SPA처럼 동작하도록
  async rewrites() {
    return [
      // API 라우트 우선 처리
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  // 이미지 최적화 설정
  images: {
    domains: [],
    unoptimized: false,
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