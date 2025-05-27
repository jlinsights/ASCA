/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint와 TypeScript 에러를 빌드 시 체크하도록 설정
  eslint: {
    // 개발 환경에서만 무시하고, 프로덕션에서는 체크
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript 에러를 빌드 시 체크하도록 설정
    ignoreBuildErrors: false,
  },
  images: {
    // 이미지 최적화를 활성화 (성능 향상)
    unoptimized: false,
    domains: [], // 필요시 외부 이미지 도메인 추가
  },
  // 성능 최적화 설정
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // 번들 분석기 설정 (개발 시 사용)
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
}

export default nextConfig