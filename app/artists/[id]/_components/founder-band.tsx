import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { FOUNDER } from '@/lib/content/founder'
import type { Language } from '@/lib/i18n/types'

/**
 * 창립자 띠 — 작가 상세 히어로 바로 아래, 작품보다 먼저.
 * 작업실 사진 한 장과 협회에서의 자리, 개인 홈페이지(seonggok.com) 하나만 둔다.
 * 다른 작가와 같은 圖錄 판형을 쓰되 금색 선·創 표지로 한 단계 높인다.
 */
export function FounderBand({ language }: { language: Language }) {
  return (
    <section className='ap-section ap-founder' aria-labelledby='ap-founder-title'>
      <div className='ap-founder__layout'>
        <figure className='ap-founder__photo'>
          <span className='ap-founder__mat'>
            <Image
              src={FOUNDER.photo.src}
              alt={FOUNDER.photo.alt[language]}
              width={FOUNDER.photo.width}
              height={FOUNDER.photo.height}
              sizes='(max-width: 767px) 80vw, 340px'
              className='ap-founder__img'
            />
          </span>
        </figure>
        <div className='ap-founder__text'>
          <p className='ap-founder__badge'>
            <span className='ap-founder__seal' lang='zh-Hant' aria-hidden='true'>
              創
            </span>
            {FOUNDER.badge[language]}
          </p>
          <h2 id='ap-founder-title' className='ap-founder__title'>
            {FOUNDER.heading[language]}
          </h2>
          <p className='ap-founder__role'>{FOUNDER.role[language]}</p>
          <p className='ap-founder__body'>{FOUNDER.body[language]}</p>
          <a
            href={FOUNDER.homepage.url}
            target='_blank'
            rel='noopener noreferrer'
            className='ap-founder__link'
          >
            {FOUNDER.homepage.label[language]}
            <ArrowUpRight className='ap-founder__link-icon' aria-hidden='true' />
            <span className='sr-only'>{FOUNDER.homepage.newTab[language]}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
