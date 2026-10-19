'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import styles from './home-promotions.module.css'

// 각 안내서의 기존 번역과 전용 페이지를 재사용한다. 접수 상태는 추정하지 않는다.
const promotions = [
  { id: 'contest', prefix: 'contestFlipbook', href: '/contests#contest-flipbook' },
  {
    id: 'taiwan',
    prefix: 'taiwanTripFlipbook',
    href: '/programs/cultural-exchange#taiwan-trip-flipbook',
  },
] as const

const copy = {
  ko: { title: '주요 소식', contest: '공모요강 보기', taiwan: '기행 안내서 보기' },
  en: {
    title: 'In the spotlight',
    contest: 'View the entry guide',
    taiwan: 'Explore the trip guide',
  },
  ja: { title: '注目のお知らせ', contest: '募集要項を見る', taiwan: '紀行案内を見る' },
  zh: { title: '焦點消息', contest: '查看徵稿簡章', taiwan: '查看紀行指南' },
} as const

export function HomePromotions() {
  const { t, language } = useLanguage()
  return (
    <aside className={`asca-hero__feature ${styles.panel}`} aria-labelledby='home-promotions-title'>
      <h2 id='home-promotions-title' className={styles.heading}>
        {copy[language].title}
      </h2>
      {promotions.map((promotion, index) => (
        <Link
          key={promotion.id}
          href={promotion.href}
          className={`${styles.card} ${index === 0 ? styles.primary : styles.secondary}`}
        >
          <span className={styles.category}>{t(`${promotion.prefix}Eyebrow`)}</span>
          <h3 className={styles.title}>{t(`${promotion.prefix}Title`)}</h3>
          <p className={styles.description}>{t(`${promotion.prefix}Lede`)}</p>
          <span className={styles.action}>
            {copy[language][promotion.id]} <ArrowUpRight aria-hidden='true' />
          </span>
        </Link>
      ))}
    </aside>
  )
}
