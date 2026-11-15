import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { canViewCatalogQuotePreview } from '@/lib/catalog-quote/preview-access'
import { CATALOG_QUOTE_POLICY } from '@/lib/catalog-quote/policy'
import { CatalogQuoteCalculator } from './_components/catalog-quote-calculator'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '종이 도록 가견적 (미리보기) | 동양서예협회',
  robots: { index: false, follow: false },
}

// 비공개 미리보기 — CATALOG_QUOTE_PREVIEW=on 이고 MFA 관리자일 때만 열린다. 접수·결제·견적 문의는 하지 않는다.
export default async function CatalogQuotePage() {
  if (!(await canViewCatalogQuotePreview())) notFound()
  return (
    <div className='container max-w-3xl py-12'>
      <p className='mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
        미리보기 · 검토안
      </p>
      <h1 className='font-serif text-3xl font-bold text-foreground'>종이 도록 가견적</h1>
      <p className='mt-3 text-sm text-muted-foreground'>
        개인전·서예단체 부스전의 출품비와 종이 도록 대금을 대략 계산합니다. 금액은 이사회 의결과
        제작업체 견적 전의 가견적이며, 신청·결제·견적 문의로 이어지지 않습니다.
      </p>
      <CatalogQuoteCalculator
        paidOptions={[...CATALOG_QUOTE_POLICY.catalog.paidOptions]}
        policyVersion={CATALOG_QUOTE_POLICY.version}
        approved={CATALOG_QUOTE_POLICY.approved}
      />
    </div>
  )
}
