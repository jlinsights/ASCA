'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export function HeroSection() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={containerRef}
      className='relative flex items-center justify-center overflow-hidden'
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--framer-canvas)',
        paddingTop: '56px', /* header 높이만큼 오프셋 */
      }}
    >
      {/* Subtle ambient glow — Framer 분위기 연출 */}
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background:
            'radial-gradient(ellipse at center, rgba(106,76,245,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      {/* Hero Content */}
      <div
        className='relative framer-container framer-fade-up'
        style={{
          zIndex: 1,
          textAlign: 'center',
          paddingTop: '80px',
          paddingBottom: '100px',
        }}
      >
        {/* Eyebrow label */}
        <div
          className='framer-fade-up framer-fade-up-delay-1'
          style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}
        >
          <span className='framer-eyebrow'>
            사단법인 동양서예협회 · ASCA
          </span>
        </div>

        {/* Main headline — display-xxl */}
        <h1
          className='framer-display-xxl framer-fade-up framer-fade-up-delay-2'
          style={{
            margin: '0 auto',
            maxWidth: '960px',
          }}
        >
          正法의 계승
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #6a4cf5 0%, #d44df0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            創新의 조화
          </span>
        </h1>

        {/* Subhead */}
        <p
          className='framer-body-lg framer-fade-up framer-fade-up-delay-3'
          style={{
            margin: '32px auto 0',
            maxWidth: '560px',
            color: 'var(--framer-ink-muted)',
          }}
        >
          전통 서예의 정법을 계승하고 현대적 창신을 통해
          <br />
          동양서예의 새로운 미래를 열어갑니다
        </p>

        {/* CTA Buttons — White pill + Dark pill */}
        <div
          className='framer-fade-up framer-fade-up-delay-4'
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginTop: '48px',
          }}
        >
          <Link href='/exhibitions' className='btn-framer-primary' style={{ fontSize: '15px', padding: '12px 22px' }}>
            전시회 둘러보기
            <ArrowRight size={16} />
          </Link>
          <Link href='/artworks' className='btn-framer-secondary' style={{ fontSize: '15px', padding: '12px 22px' }}>
            작품 감상하기
          </Link>
        </div>

        {/* Stats row */}
        <div
          className='framer-fade-up framer-fade-up-delay-5'
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1px',
            justifyContent: 'center',
            marginTop: '80px',
          }}
        >
          {[
            { value: '창립 1962', label: '역사와 전통' },
            { value: '3,000+', label: '회원 서예가' },
            { value: '500+', label: '연간 전시 작품' },
            { value: '전국 지부', label: '전국 네트워크' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '20px 32px',
                borderLeft: i === 0 ? 'none' : '1px solid var(--framer-hairline-soft)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '-1px',
                  color: 'var(--framer-ink)',
                  lineHeight: 1.1,
                }}
              >
                {stat.value}
              </div>
              <div className='framer-caption' style={{ marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--framer-ink-muted)',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: '24px',
              height: '40px',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '6px',
            }}
          >
            <div
              style={{
                width: '3px',
                height: '10px',
                backgroundColor: 'rgba(255,255,255,0.4)',
                borderRadius: '2px',
                animation: 'framer-bounce 1.4s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
