import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowRight,
  Camera,
  Palette,
  Sparkles,
  Calendar,
  Users,
  Award,
  BookOpen,
} from 'lucide-react'
import galleryData from '@/lib/data/gallery-data.json'
import { GalleryData } from '@/lib/types/gallery/gallery-legacy'
import { LayoutFooter } from '@/components/layout/layout-footer'

// GalleryClient 동적 임포트 (code-splitting)
const GalleryClient = dynamic(() => import('@/components/gallery/GalleryClient'), {
  loading: () => <GalleryLoadingSkeleton />,
})

/* ─── Loading Skeleton — Framer surface-1 tiles ─────────── */
function GalleryLoadingSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        padding: '0 30px',
      }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: i % 3 === 0 ? '4/5' : i % 2 === 0 ? '3/4' : '1/1',
            backgroundColor: 'var(--framer-surface-1)',
            borderRadius: '20px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Stats Row — Framer hairline-divided inline stats ──── */
function GalleryStats({ data }: { data: GalleryData }) {
  const stats = [
    { icon: Camera, value: data.metadata.totalImages.toLocaleString(), label: '활동사진' },
    { icon: Palette, value: data.categories.length, label: '카테고리' },
    { icon: Sparkles, value: 'HD', label: '최고화질' },
  ]
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1px',
        marginTop: '48px',
      }}
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--framer-hairline-soft)',
            }}
          >
            <Icon
              size={14}
              style={{ color: 'var(--framer-ink-muted)', flexShrink: 0 }}
              aria-hidden='true'
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.5px',
                color: 'var(--framer-ink)',
              }}
            >
              {stat.value}
            </span>
            <span className='framer-caption' style={{ color: 'var(--framer-ink-muted)' }}>
              {stat.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Service Cards — Framer surface-1 card-framer ─────── */
interface ServiceItem {
  icon: React.ElementType
  title: string
  desc: string
  href: string
}

function ServiceCard({ item }: { item: ServiceItem }) {
  const Icon = item.icon
  return (
    <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className='card-framer gallery-service-card'
        style={{ padding: '24px', minHeight: '168px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      >
        <div>
          <Icon
            size={20}
            style={{ color: 'var(--framer-ink-muted)', marginBottom: '16px' }}
            aria-hidden='true'
          />
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '-0.5px',
              color: 'var(--framer-ink)',
              marginBottom: '8px',
            }}
          >
            {item.title}
          </h3>
          <p className='framer-caption' style={{ color: 'var(--framer-ink-muted)', lineHeight: '1.5' }}>
            {item.desc}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '20px',
            color: 'var(--framer-accent-blue)',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          자세히 보기
          <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function Page() {
  const data = galleryData as unknown as GalleryData

  const services: ServiceItem[] = [
    { icon: Calendar, title: '전시회', desc: '현재, 예정, 과거 전시회 정보를 확인하세요', href: '/exhibitions' },
    { icon: Users, title: '작가 소개', desc: '협회 소속 작가들의 프로필을 확인하세요', href: '/artists' },
    { icon: Award, title: '공모전', desc: '서예 공모전 정보와 참가 방법을 확인하세요', href: '/contests' },
    { icon: BookOpen, title: '뉴스', desc: '동양서예협회의 최신 소식을 확인하세요', href: '/news' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--framer-canvas)' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--framer-canvas)',
          borderBottom: '1px solid var(--framer-hairline-soft)',
          paddingTop: '120px', /* 56px header + 64px breathing room */
          paddingBottom: '80px',
        }}
      >
        <div className='framer-container' style={{ textAlign: 'center' }}>
          {/* Eyebrow */}
          <span className='framer-eyebrow' style={{ marginBottom: '28px', display: 'inline-flex' }}>
            사단법인 동양서예협회
          </span>

          {/* Page title — display-lg */}
          <h1
            className='framer-display-lg framer-fade-up'
            style={{ marginTop: '16px' }}
          >
            협회 갤러리
          </h1>

          {/* Subhead */}
          <p
            className='framer-body-lg framer-fade-up framer-fade-up-delay-1'
            style={{ marginTop: '20px', maxWidth: '520px', margin: '20px auto 0' }}
          >
            正法의 계승, 創新의 조화
            <br />
            전통 서예의 정법을 계승하고 현대적 창신을 통해 동양서예의 새로운 미래를 열어갑니다
          </p>

          {/* CTA Buttons */}
          <div
            className='framer-fade-up framer-fade-up-delay-2'
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginTop: '40px',
            }}
          >
            <a href='#gallery' className='btn-framer-primary' style={{ padding: '11px 22px' }}>
              <Camera size={15} />
              갤러리 보기
            </a>
            <Link href='/events' className='btn-framer-secondary' style={{ padding: '11px 22px' }}>
              행사 안내
            </Link>
          </div>

          {/* Stats */}
          <GalleryStats data={data} />
        </div>
      </section>

      {/* ── Gallery Grid ──────────────────────────────────── */}
      <section
        id='gallery'
        className='framer-section'
        style={{ backgroundColor: 'var(--framer-canvas)' }}
      >
        <Suspense fallback={<GalleryLoadingSkeleton />}>
          <GalleryClient data={data} />
        </Suspense>
      </section>

      {/* ── Services ──────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--framer-canvas)',
          borderTop: '1px solid var(--framer-hairline-soft)',
          padding: '80px 0',
        }}
      >
        <div className='framer-container'>
          {/* Section header */}
          <div style={{ marginBottom: '48px' }}>
            <span className='framer-eyebrow' style={{ marginBottom: '16px', display: 'inline-flex' }}>
              추가 서비스
            </span>
            <h2
              className='framer-display-md'
              style={{ marginTop: '16px', maxWidth: '400px' }}
            >
              협회의 모든 것을
              <br />
              한눈에
            </h2>
          </div>

          {/* 4-column grid → 2-up → 1-up */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {services.map(item => (
              <ServiceCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--framer-canvas)',
          borderTop: '1px solid var(--framer-hairline-soft)',
          padding: '80px 0',
        }}
      >
        <div className='framer-container'>
          <div style={{ marginBottom: '48px' }}>
            <span className='framer-eyebrow' style={{ marginBottom: '16px', display: 'inline-flex' }}>
              연락처
            </span>
            <h2
              className='framer-display-md'
              style={{ marginTop: '16px' }}
            >
              문의 및 연락처
            </h2>
            <p className='framer-body-lg' style={{ marginTop: '12px' }}>
              동양서예협회에 대한 문의사항이 있으시면 언제든 연락주세요
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
              maxWidth: '960px',
            }}
          >
            {[
              { label: '주소', value: '〒02872 서울시 성북구 보문로 105\n보림빌딩' },
              { label: '전화', value: '☎ 0502-5550-8700\nFAX: 0504-256-6600' },
              { label: '이메일', value: 'info@orientalcalligraphy.org' },
              { label: '고유번호', value: '209-82-11380' },
            ].map(item => (
              <div
                key={item.label}
                className='card-framer'
                style={{ padding: '24px' }}
              >
                <div className='framer-caption' style={{ color: 'var(--framer-ink-muted)', marginBottom: '10px' }}>
                  {item.label}
                </div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 400,
                    letterSpacing: '-0.15px',
                    color: 'var(--framer-ink)',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ImageGallery',
            name: '동양서예협회 갤러리',
            description:
              '동양서예협회의 전시회, 심사위원회, 휘호대회, 시상식 등 다양한 협회 활동을 담은 종합 갤러리.',
            url: 'https://orientalcalligraphy.org/gallery',
            numberOfItems: data.metadata.totalImages,
            dateModified: data.metadata.lastUpdated,
            publisher: {
              '@type': 'Organization',
              name: '동양서예협회',
            },
          }),
        }}
      />

      <LayoutFooter />
    </div>
  )
}

export const metadata = {
  title: '동양서예 갤러리 | 사단법인 동양서예협회',
  description: `동양서예협회의 종합 활동 갤러리. ${galleryData.metadata.totalImages}장의 전시회, 심사위원회, 휘호대회, 시상식 등 다양한 협회 활동 사진을 감상하세요.`,
  keywords: [
    '동양서예', '서예갤러리', '협회활동', '전시회', '휘호대회',
    '심사위원회', '시상식', '전통서예', '서예협회', '한국서예',
  ],
  openGraph: {
    title: '동양서예 갤러리 | 사단법인 동양서예협회',
    description: `${galleryData.metadata.totalImages}개의 서예 작품, 전시회, 협회 활동 기록.`,
    type: 'website',
  },
}
