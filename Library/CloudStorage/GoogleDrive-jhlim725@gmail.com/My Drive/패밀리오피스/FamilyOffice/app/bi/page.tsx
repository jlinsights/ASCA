/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

// BI 가이드라인 소개 페이지 (리뉴얼)
// 브랜드 컬러, 다크/라이트 모드, 타이포그래피, 버튼, 색상 팔레트, 컴포넌트 샘플, 코드 예시 등 실제 BI 문서의 주요 내용을 시각적으로 풍부하게 보여줍니다.
// 각 섹션별로 주니어 개발자가 이해할 수 있도록 상세 주석과 설명을 포함합니다.

import { Button } from "@/components/ui/button";

export default function BIGuidePage() {
  return (
    <main className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary font-body px-4 py-12">
      {/* 1. BI 대표 섹션 */}
      <section className="max-w-2xl mx-auto mb-12 p-8 rounded-lg shadow-medium bg-navy-primary text-light-text-primary dark:bg-dark-bg-primary dark:text-dark-text-primary">
        <h1 className="text-3xl font-heading border-b-2 border-gold-primary pb-2 mb-4">패밀리오피스</h1>
        <p className="text-navy-light dark:text-dark-text-secondary mb-6">전문적인 자산관리 서비스</p>
        {/* 브랜드 버튼 예시 */}
        <Button className="bg-burgundy-primary hover:bg-burgundy-light text-white px-6 py-2 rounded-sm shadow-medium">
          상담 신청
        </Button>
      </section>

      {/* 2. 색상 팔레트 섹션 */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-heading font-bold mb-4 border-b-2 border-gold-primary pb-2">색상 팔레트</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          {/* 브랜드 컬러 박스 */}
          <div className="w-16 h-16 rounded bg-navy-primary border border-light-border" title="Navy Primary" />
          <div className="w-16 h-16 rounded bg-gold-primary border border-light-border" title="Gold Primary" />
          <div className="w-16 h-16 rounded bg-burgundy-primary border border-light-border" title="Burgundy Primary" />
          <div className="w-16 h-16 rounded bg-light-bg-primary border border-light-border" title="Light BG" />
          <div className="w-16 h-16 rounded bg-dark-bg-primary border border-light-border" title="Dark BG" />
        </div>
        <ul className="text-sm text-light-text-secondary dark:text-dark-text-secondary list-disc pl-5">
          <li>라이트 모드: 흰색 배경 + 네이비 텍스트</li>
          <li>다크 모드: 딥 네이비 배경 + 밝은 텍스트</li>
          <li>포인트 컬러: 골드, 버건디</li>
        </ul>
      </section>

      {/* 3. 다크 모드 예시 */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-heading font-bold mb-4 border-b-2 border-gold-primary pb-2">다크 모드 예시</h2>
        <div className="rounded p-6 mb-2 bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border">
          <p className="text-light-text-primary dark:text-dark-text-primary">
            패밀리오피스는 고객의 자산을 소중히 관리합니다.
          </p>
        </div>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Tailwind의 <code>dark:</code> 접두사를 활용해 라이트/다크 모드에 따라 색상이 자동 전환됩니다.
        </p>
      </section>

      {/* 4. 타이포그래피 예시 */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-heading font-bold mb-4 border-b-2 border-gold-primary pb-2">타이포그래피 시스템</h2>
        <h1 className="font-heading text-4xl font-bold text-navy-primary dark:text-dark-text-primary mb-2">패밀리오피스 서비스</h1>
        <h2 className="font-heading text-2xl font-semibold text-navy-primary dark:text-dark-text-primary mb-2">고객 중심의 자산관리</h2>
        <p className="font-body text-base text-light-text-secondary dark:text-dark-text-secondary mb-2">
          저희 패밀리오피스는 고액자산가와 기업 오너를 위한 종합적인 자산관리 솔루션을 제공합니다.
        </p>
        <p className="font-body text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          (Tailwind 설정에서 font-family를 일관되게 적용합니다)
        </p>
      </section>

      {/* 5. 버튼/컴포넌트 샘플 */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-heading font-bold mb-4 border-b-2 border-gold-primary pb-2">버튼 컴포넌트</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button variant="primary">상담 신청</Button>
          <Button variant="secondary">서비스 안내</Button>
          <Button variant="tertiary">사례 보기</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Shadcn UI 기반의 버튼 컴포넌트. variant, size 등 다양한 스타일을 지원합니다.
        </p>
      </section>

      {/* 6. 코드 예시(실제 가이드라인 코드) */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-heading font-bold mb-4 border-b-2 border-gold-primary pb-2">코드 예시</h2>
        <div className="bg-dark-bg-secondary text-xs rounded p-4 font-mono overflow-x-auto mb-2">
{`// 다크 모드 자동 전환 예시
<div className="bg-light-bg-primary dark:bg-dark-bg-primary">
  <p className="text-light-text-primary dark:text-dark-text-primary">
    패밀리오피스는 고객의 자산을 소중히 관리합니다.
  </p>
</div>`}
        </div>
        <div className="bg-dark-bg-secondary text-xs rounded p-4 font-mono overflow-x-auto">
{`// 버튼 사용 예시
import { Button } from "@/components/ui/button"

<Button variant="primary">상담 신청</Button>`}
        </div>
      </section>

      {/* 7. 기타 안내 */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-heading font-bold mb-4 border-b-2 border-gold-primary pb-2">기타 안내</h2>
        <ul className="list-disc pl-5 text-light-text-secondary dark:text-dark-text-secondary text-sm">
          <li>Tailwind, Shadcn UI, next-themes 등 현대 웹 기술을 적극 활용합니다.</li>
          <li>컴포넌트/색상/타이포그래피/애니메이션/반응형 등 일관된 시스템을 유지합니다.</li>
          <li>코드 예시와 실제 UI를 함께 제공하여 개발자가 쉽게 이해할 수 있도록 합니다.</li>
        </ul>
      </section>
    </main>
  );
} 