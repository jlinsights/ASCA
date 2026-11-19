import CopyrightPolicyContent from './content'

// 본문을 서버에서 그린다. 예전엔 next/dynamic(ssr: false)로 감싸 서버 HTML 이 "로딩 중..."뿐이었고,
// 검색엔진은 h1 도 본문도 없는 빈 페이지로 읽었다(2026-11-08 SEO 점검)
export default function CopyrightPolicyPage() {
  return <CopyrightPolicyContent />
}
