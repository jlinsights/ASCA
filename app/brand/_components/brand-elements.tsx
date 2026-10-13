'use client'

import Image from 'next/image'
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Feather,
  Globe,
  MapPin,
  Menu,
  Moon,
  Search,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandSection } from './brand-section'
import { MOTION, MOTION_EASE, PHOTO_SAMPLE, PHOTO_TREATMENTS, RADII, SHADOWS } from './brand-data'

const ICONS = [Menu, Search, Globe, Moon, ArrowUpRight, Calendar, MapPin, Users, BookOpen, Feather]

/** 07 형태 요소 — 헤어라인, 모서리, 그림자, 움직임, 낙관, 아이콘 */
export function BrandElements({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='elements'
      index={index}
      eyebrow='Form'
      title={t('brandElementsTitle')}
      lede={t('brandElementsLede')}
    >
      <div className='brand-elements'>
        <div className='brand-tile'>
          <p className='brand-tile__label'>{t('brandHairline')}</p>
          <div className='brand-rule' />
          <p className='brand-tile__note brand-mono'>
            linear-gradient(90deg, transparent, gold-500, transparent)
          </p>
        </div>

        <div className='brand-tile'>
          <p className='brand-tile__label'>{t('brandRadius')}</p>
          <ul className='brand-radii'>
            {RADII.map(radius => (
              <li key={radius.name} className='brand-radius'>
                <span className='brand-radius__box' style={{ borderRadius: `${radius.px}px` }} />
                {radius.px}px
              </li>
            ))}
          </ul>
        </div>

        <div className='brand-tile'>
          <p className='brand-tile__label'>{t('brandShadow')}</p>
          <ul className='brand-shadows'>
            {SHADOWS.map(shadow => (
              <li
                key={shadow}
                className='brand-shadow'
                style={{ boxShadow: `var(--shadow-${shadow})` }}
              >
                {shadow}
              </li>
            ))}
          </ul>
        </div>

        <div className='brand-tile'>
          <p className='brand-tile__label'>{t('brandMotion')}</p>
          <div className='brand-motion' tabIndex={0} aria-label={t('brandMotionHover')}>
            {MOTION.map(step => (
              <div key={step.name} className='brand-motion__row'>
                <span>{step.ms}ms</span>
                <span className='brand-motion__track'>
                  <span
                    className='brand-motion__dot'
                    style={{ transitionDuration: `${step.ms}ms` }}
                  />
                </span>
              </div>
            ))}
          </div>
          <p className='brand-tile__note'>
            {t('brandMotionHover')} · <span className='brand-mono'>{MOTION_EASE}</span>
          </p>
        </div>

        <div className='brand-tile'>
          <p className='brand-tile__label'>{t('brandSeal')}</p>
          <div className='brand-seal-demo'>
            <span className='brand-seal' lang='zh-Hant' aria-hidden='true'>
              印
            </span>
            <p className='brand-tile__note'>{t('brandSealNote')}</p>
          </div>
        </div>

        <div className='brand-tile'>
          <p className='brand-tile__label'>{t('brandIcons')}</p>
          <div className='brand-icons' aria-hidden='true'>
            {ICONS.map((Icon, i) => (
              <Icon key={i} />
            ))}
          </div>
          <p className='brand-tile__note'>{t('brandIconsNote')}</p>
        </div>
      </div>
    </BrandSection>
  )
}

/** 08 컴포넌트 — 사이트에서 실제로 쓰는 shadcn 컴포넌트를 그대로 보여 준다 */
export function BrandComponents({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='components'
      index={index}
      eyebrow='Components'
      title={t('brandComponentsTitle')}
      lede={t('brandComponentsLede')}
    >
      <h3 className='brand-subhead' style={{ marginTop: 0 }}>
        {t('brandButtons')}
      </h3>
      <div className='brand-row'>
        <Button>{t('brandBtnPrimary')}</Button>
        <Button variant='secondary'>{t('brandBtnSecondary')}</Button>
        <Button variant='outline'>{t('brandBtnOutline')}</Button>
        <Button variant='ghost'>
          {t('brandBtnGhost')} <ArrowUpRight aria-hidden='true' strokeWidth={1.5} />
        </Button>
      </div>

      <h3 className='brand-subhead'>{t('brandBadges')}</h3>
      <div className='brand-row'>
        <Badge>{t('brandBadgeExhibition')}</Badge>
        <Badge variant='secondary'>{t('brandBadgeEvent')}</Badge>
        <Badge variant='outline'>{t('brandBadgeNotice')}</Badge>
      </div>

      <h3 className='brand-subhead'>{t('brandInputs')}</h3>
      <div className='brand-field'>
        <Label htmlFor='brand-demo-email'>{t('brandInputLabel')}</Label>
        <Input id='brand-demo-email' type='email' placeholder='name@example.com' />
      </div>

      <h3 className='brand-subhead'>{t('brandCards')}</h3>
      <div className='brand-cards'>
        <article className='brand-card brand-card--paper'>
          <p className='brand-card__eyebrow' lang='en'>
            Open Call
          </p>
          <h4 className='brand-card__title'>{t('brandCardPaperTitle')}</h4>
          <p className='brand-card__body'>{t('brandCardPaperBody')}</p>
        </article>
        <article className='brand-card brand-card--ink'>
          <p className='brand-card__eyebrow' lang='en'>
            Exchange
          </p>
          <h4 className='brand-card__title'>{t('brandCardInkTitle')}</h4>
          <p className='brand-card__body'>{t('brandCardInkBody')}</p>
        </article>
        <article className='brand-card brand-card--artwork'>
          <div className='brand-card__panel'>
            <span className='brand-card__glyph' lang='zh-Hant'>
              行雲流水
            </span>
            <span className='brand-seal' lang='zh-Hant' aria-hidden='true'>
              印
            </span>
          </div>
          <p className='brand-card__meta'>
            <span lang='en'>No. 01</span>
            <span>{t('brandCardArtwork')}</span>
          </p>
        </article>
      </div>
    </BrandSection>
  )
}

/** 09 이미지 — 세 가지 사진 처리 */
export function BrandImagery({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='imagery'
      index={index}
      eyebrow='Imagery'
      title={t('brandImageryTitle')}
      lede={t('brandImageryLede')}
    >
      <ul className='brand-photos'>
        {PHOTO_TREATMENTS.map(treatment => (
          <li key={treatment.modifier} className='brand-photo'>
            <div className={cn('brand-photo__frame', `brand-photo__frame--${treatment.modifier}`)}>
              <Image
                src={PHOTO_SAMPLE}
                alt=''
                fill
                sizes='(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw'
              />
              {treatment.modifier === 'ink' && (
                <span className='brand-photo__caption' lang='zh-Hant'>
                  東洋書藝
                </span>
              )}
            </div>
            <p className='brand-photo__label'>{t(treatment.labelKey)}</p>
          </li>
        ))}
      </ul>
    </BrandSection>
  )
}
