import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { RegulationReader } from '@/components/regulations/regulation-reader'
import { REGULATIONS, findRegulation, regulationHref } from '@/lib/regulations/catalog'
import { loadRegulation } from '@/lib/regulations/load'
import '@/components/home/home.css'
import '@/components/regulations/regulations.css'

// 규정 원문(regulations/*.md)은 빌드 때만 읽는다. 목록에 없는 주소는 404
export const dynamicParams = false

export function generateStaticParams(): { slug: string }[] {
  return REGULATIONS.map(entry => ({ slug: entry.slug }))
}

interface RegulationPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: RegulationPageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = findRegulation(slug)
  if (!entry) return {}
  const doc = loadRegulation(entry)
  const description = `사단법인 동양서예협회 ${doc.title}${
    doc.effectiveNote ? ` ${doc.effectiveNote}` : ''
  } — ${doc.articleCount > 0 ? `${doc.articleCount}개 조문 ` : ''}원문`
  return {
    title: `${doc.title} | 정관 및 규정`,
    description,
    alternates: { canonical: regulationHref(slug) },
    openGraph: { title: `${doc.title} | 동양서예협회`, description },
  }
}

export default async function RegulationPage({ params }: RegulationPageProps) {
  const { slug } = await params
  const position = REGULATIONS.findIndex(entry => entry.slug === slug)
  const entry = REGULATIONS[position]
  if (!entry) notFound()

  const neighbor = (index: number) => {
    const item = REGULATIONS[index]
    return item ? { slug: item.slug, nameKey: item.nameKey } : null
  }

  return (
    <>
      <RegulationReader
        doc={loadRegulation(entry)}
        nameKey={entry.nameKey}
        hanja={entry.hanja}
        position={position}
        total={REGULATIONS.length}
        prev={neighbor(position - 1)}
        next={neighbor(position + 1)}
      />
      <LayoutFooter />
    </>
  )
}
