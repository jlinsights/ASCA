'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react'

type ExhibitionType = '개인전' | '공모전' | '회원전' | '추천작가전' | '초대작가전' | '온라인전시'

interface Exhibition {
  id: number
  title: string
  subtitle: string
  type: ExhibitionType
  venue: string
  startDate: string
  endDate: string
  image: string
  featured?: boolean
}

const typeColors: Record<ExhibitionType, string> = {
  개인전: '#88A891',
  공모전: '#af2626',
  회원전: '#d4af37',
  추천작가전: '#fdb462',
  초대작가전: '#8e4585',
  온라인전시: '#4f46e5',
}

const featuredExhibitions: Exhibition[] = [
  {
    id: 1,
    title: '2024 동양서예협회 정기전',
    subtitle: '전통과 현대의 만남',
    type: '회원전',
    venue: '서울시립미술관 본관',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    image: '/placeholder.svg',
    featured: true,
  },
  {
    id: 2,
    title: '한글의 아름다움',
    subtitle: '세종대왕 탄신 626주년 기념전',
    type: '추천작가전',
    venue: '국립한글박물관 기획전시실',
    startDate: '2024-05-15',
    endDate: '2024-07-15',
    image: '/placeholder.svg',
    featured: true,
  },
  {
    id: 3,
    title: '청년 서예가의 시선',
    subtitle: '새로운 세대, 새로운 해석',
    type: '공모전',
    venue: '인사동 갤러리',
    startDate: '2024-04-01',
    endDate: '2024-05-01',
    image: '/placeholder.svg',
    featured: true,
  },
]

/* Framer-style exhibition card (surface-1) */
function ExhibitionCard({ exhibition, delay }: { exhibition: Exhibition; delay: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/exhibitions/${exhibition.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        className={`card-framer framer-fade-up framer-fade-up-delay-${delay}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: 'pointer',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease',
          boxShadow: hovered
            ? 'rgba(255,255,255,0.08) 0px 0.5px 0px 0px, rgba(0,0,0,0.5) 0px 16px 40px 0px'
            : 'none',
        }}
      >
        {/* Image area */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '16px',
            backgroundColor: 'var(--framer-surface-2)',
          }}
        >
          <Image
            src={exhibition.image}
            alt={exhibition.title}
            fill
            className='object-cover'
            style={{
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(20,20,20,0.8) 0%, transparent 60%)',
            }}
          />
          {/* Type badge */}
          <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: typeColors[exhibition.type],
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {exhibition.type}
            </span>
          </div>
        </div>

        {/* Card content */}
        <div style={{ padding: '0 4px' }}>
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.5px',
              color: 'var(--framer-ink)',
              lineHeight: 1.25,
              marginBottom: '6px',
            }}
          >
            {exhibition.title}
          </h3>
          <p className='framer-body-sm' style={{ color: 'var(--framer-ink-muted)', marginBottom: '16px' }}>
            {exhibition.subtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              className='framer-caption'
            >
              <MapPin size={12} style={{ color: 'var(--framer-ink-muted)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {exhibition.venue}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className='framer-caption'>
              <Calendar size={12} style={{ color: 'var(--framer-ink-muted)', flexShrink: 0 }} />
              <span>
                {exhibition.startDate} ~ {exhibition.endDate}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--framer-accent-blue)',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            전시 상세보기
            <ArrowRight
              size={13}
              style={{
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* Gradient Spotlight Card — Framer signature element */
function SpotlightCard({
  variant,
  title,
  subtitle,
  href,
  delay,
}: {
  variant: 'violet' | 'magenta' | 'orange'
  title: string
  subtitle: string
  href: string
  delay: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className={`card-framer-spotlight card-framer-spotlight-${variant} framer-fade-up framer-fade-up-delay-${delay}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: 'pointer',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Noise/texture overlay */}
        <div
          aria-hidden='true'
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
            }}
          >
            {variant === 'violet' ? '갤러리' : variant === 'magenta' ? '공모전' : '강좌'}
          </div>

          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '-1.2px',
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '12px',
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
              lineHeight: 1.4,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            {subtitle}
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '100px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#fff',
              gap: '6px',
              transition: 'background-color 0.15s',
            }}
          >
            더 알아보기
            <ArrowUpRight
              size={13}
              style={{
                transform: hovered ? 'translate(2px, -2px)' : 'translate(0,0)',
                transition: 'transform 0.2s ease',
              }}
            />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function FeaturedExhibitionsSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      className='framer-section'
      style={{ backgroundColor: 'var(--framer-canvas)' }}
    >
      <div className='framer-container'>
        {/* Section header */}
        <div
          className={`framer-fade-up ${mounted ? '' : 'opacity-0'}`}
          style={{ marginBottom: '64px' }}
        >
          <span className='framer-eyebrow' style={{ marginBottom: '20px', display: 'inline-flex' }}>
            주요 활동
          </span>
          <h2
            className='framer-display-lg'
            style={{ marginTop: '16px', maxWidth: '600px' }}
          >
            전통의 예술,
            <br />
            현대의 무대
          </h2>
          <p className='framer-body-lg' style={{ marginTop: '20px', maxWidth: '480px' }}>
            동양서예협회가 엄선한 현재 진행 중인 주요 전시와 프로그램을 만나보세요
          </p>
        </div>

        {/* Card grid — 2 columns with spotlight cards interspersed */}
        <div className='framer-card-grid'>
          {/* Row 1: Exhibition card + Spotlight (violet) */}
          <ExhibitionCard exhibition={featuredExhibitions[0]} delay={1} />
          <SpotlightCard
            variant='violet'
            title='협회 갤러리'
            subtitle='수백 점의 서예 작품을 온라인에서 감상하고 작가와 소통하세요'
            href='/gallery'
            delay={2}
          />

          {/* Row 2: Spotlight (magenta) + Exhibition card */}
          <SpotlightCard
            variant='magenta'
            title='2024 서예 공모전'
            subtitle='전국 규모의 서예 공모전에 참가하고 실력을 겨루어 보세요'
            href='/contests'
            delay={3}
          />
          <ExhibitionCard exhibition={featuredExhibitions[1]} delay={4} />

          {/* Row 3: Exhibition card + Spotlight (orange) */}
          <ExhibitionCard exhibition={featuredExhibitions[2]} delay={5} />
          <SpotlightCard
            variant='orange'
            title='서예 아카데미'
            subtitle='전문 서예가에게 배우는 체계적인 온·오프라인 강좌 프로그램'
            href='/academy'
            delay={5}
          />
        </div>

        {/* View all CTA */}
        <div
          className='framer-fade-up'
          style={{ textAlign: 'center', marginTop: '64px' }}
        >
          <Link href='/exhibitions' className='btn-framer-primary' style={{ fontSize: '15px', padding: '13px 28px' }}>
            모든 전시 보기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
