import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Mail, MessageCircle, Phone } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { FairnessToc } from '@/components/fairness/fairness-toc'
import {
  COI_COMMITMENTS,
  COI_ITEMS,
  COI_PLEDGE,
  CORE_PRINCIPLES,
  DISMISSAL_REASONS,
  EFFECTIVE,
  JUDGING_STEPS,
  OBJECTION_DEADLINES,
  OBJECTION_REQUIRED_FIELDS,
  OBJECTION_TYPES,
  SECTIONS,
  SUBMITTER_RIGHTS,
} from '@/components/fairness/fairness-content'
import { CHAT_URL, EMAIL, PHONE, mailto } from '@/lib/content/contact-info'
import { REGULATIONS_BASE_PATH, regulationHref } from '@/lib/regulations/catalog'
import '@/components/home/home.css'
import '@/components/regulations/regulations.css'
import '@/components/fairness/fairness.css'

export const metadata: Metadata = {
  title: '공정·투명성 허브 | 동양서예협회',
  description:
    '(사) 동양서예협회는 공모전·전시 운영의 공정성·투명성 기준을 공개합니다. 운영원칙, 심사단계, 이의제기 절차, 이해상충 확인 등 투명한 운영을 위한 모든 정보를 확인하세요.',
  alternates: { canonical: '/fairness-transparency-hub' },
  openGraph: {
    title: '공정·투명성 허브 | 동양서예협회',
    description:
      '운영을 신뢰받는 단체가 되기 위해 공모전·전시 운영의 공정성·투명성 기준을 공개합니다.',
  },
}

const OBJECTION_MAIL = mailto(
  '[이의제기] 공모전 이의제기 접수',
  OBJECTION_REQUIRED_FIELDS.map(field => `- ${field}: `).join('\n')
)

const { filingDays, receiptBusinessHours, firstReplyBusinessDays, finalReplyBusinessDays } =
  OBJECTION_DEADLINES

function SectionHead({
  num,
  id,
  title,
  lede,
}: {
  num: string
  id: string
  title: string
  lede: string
}) {
  return (
    <header className='asca-fair-sec-head'>
      <span className='asca-fair-sec-head__num' aria-hidden='true'>
        {num}
      </span>
      <h2 id={`${id}-title`}>{title}</h2>
      <p>{lede}</p>
    </header>
  )
}

function Principles() {
  return (
    <section id='principles' className='asca-fair-sec' aria-labelledby='principles-title'>
      <SectionHead
        num='01'
        id='principles'
        title='공정성·투명성 운영 원칙'
        lede='(사) 동양서예협회는 공모전·전시 운영 전 과정에서 공정성(Fairness)과 투명성(Transparency)을 최우선 가치로 선언합니다.'
      />
      <div className='asca-fair-split'>
        <div>
          <h3 className='asca-fair-sub'>핵심 원칙 {CORE_PRINCIPLES.length}가지</h3>
          <ol className='asca-fair-rows'>
            {CORE_PRINCIPLES.map((principle, i) => (
              <li key={principle.label}>
                <span className='asca-fair-rows__num' aria-hidden='true'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{principle.label}</strong>
                  <span className='asca-fair-rows__text'>{principle.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <aside className='asca-fair-panel' aria-labelledby='rights-title'>
          <h3 id='rights-title' className='asca-fair-sub'>
            출품자 권리 {SUBMITTER_RIGHTS.length}가지
          </h3>
          <ul className='asca-fair-checks'>
            {SUBMITTER_RIGHTS.map(right => (
              <li key={right}>
                <Check aria-hidden='true' />
                {right}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}

function Judging() {
  return (
    <section id='judging' className='asca-fair-sec' aria-labelledby='judging-title'>
      <SectionHead
        num='02'
        id='judging'
        title='심사 프로세스 단계 안내'
        lede='접수부터 이의제기까지의 표준 절차를 다음과 같이 운영합니다. 회차별 세부 일정은 해당 공모요강에 따릅니다.'
      />
      {/* 흐름을 한 줄로 먼저 보이고, 단계마다 아래 설명으로 이어진다 */}
      <ol className='asca-fair-rail' aria-label='심사 단계 순서'>
        {JUDGING_STEPS.map((step, i) => (
          <li key={step.id}>
            <a href={`#${step.id}`}>
              <span className='asca-fair-rail__dot' aria-hidden='true'>
                {i + 1}
              </span>
              <span className='asca-fair-rail__name'>{step.title}</span>
            </a>
          </li>
        ))}
      </ol>
      <ol className='asca-fair-steps'>
        {JUDGING_STEPS.map((step, i) => (
          <li key={step.id} id={step.id} className='asca-fair-step'>
            <p className='asca-fair-step__kicker'>
              <span aria-hidden='true'>{String(i + 1).padStart(2, '0')}</span>
              <span lang='en'>{step.titleEn}</span>
            </p>
            <h3>{step.title}</h3>
            <ul>
              {step.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {step.id === 'step-objection' && (
              <a href='#objection' className='asca-btn asca-btn--link'>
                이의제기 절차 자세히 <ArrowRight aria-hidden='true' />
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function ObjectionFiling() {
  return (
    <div className='asca-fair-file'>
      <div>
        <h3 className='asca-fair-sub'>접수 방법</h3>
        <p>
          서면(이메일 <span className='asca-fair-mono'>{EMAIL}</span>) 접수가 원칙입니다. 전화로
          접수한 경우에도 필수 항목을 서면으로 제출해야 합니다.
        </p>
      </div>
      <div className='asca-fair-file__actions'>
        <a href={OBJECTION_MAIL} className='asca-btn asca-btn--primary'>
          <Mail aria-hidden='true' /> 이메일로 접수
        </a>
        <a href={PHONE.href} className='asca-btn asca-btn--ghost'>
          <Phone aria-hidden='true' /> {PHONE.display}
        </a>
        <a
          href={CHAT_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='asca-btn asca-btn--ghost'
        >
          <MessageCircle aria-hidden='true' /> 실시간 상담
        </a>
      </div>
    </div>
  )
}

function ObjectionTimeline() {
  // 이의제기 처리 규정 제3조(접수 기간)·제5조(처리 원칙 및 기한) 그대로
  const steps = [
    {
      when: `공지일부터 ${filingDays}일 이내`,
      what: '이의제기 접수 (공모요강에 별도 기한이 있으면 그 기한)',
    },
    { when: `영업일 ${receiptBusinessHours}시간 이내`, what: '접수 완료 알림' },
    { when: `영업일 ${firstReplyBusinessDays}일 이내`, what: '1차 회신 — 검토 진행 상황 공유' },
    {
      when: `영업일 ${finalReplyBusinessDays}일 이내`,
      what: '최종 회신 — 최종 결정 사항 공식 통보',
    },
  ]
  return (
    <div>
      <h3 className='asca-fair-sub'>처리 원칙 및 기한</h3>
      <ol className='asca-fair-timeline'>
        {steps.map(step => (
          <li key={step.when}>
            <strong>{step.when}</strong>
            <span>{step.what}</span>
          </li>
        ))}
      </ol>
      <p className='asca-fair-note'>
        사실관계 중심으로 검토합니다. 전문적인 재검증이 필요해 기간을 연장하는 경우에는 지연 사유와
        예정 일정을 미리 알립니다.
      </p>
    </div>
  )
}

function Objection() {
  return (
    <section id='objection' className='asca-fair-sec' aria-labelledby='objection-title'>
      <SectionHead
        num='03'
        id='objection'
        title='이의제기 처리 규정'
        lede='본 규정은 (사) 동양서예협회 공모전·전시 공모의 결과 및 절차 관련 이의제기를 공정하고 신속하게 처리하기 위한 기준입니다.'
      />
      <ObjectionFiling />
      <ObjectionTimeline />
      <div className='asca-fair-split asca-fair-split--even'>
        <div>
          <h3 className='asca-fair-sub'>필수 기재사항</h3>
          <ul className='asca-fair-checks'>
            {OBJECTION_REQUIRED_FIELDS.map(field => (
              <li key={field}>
                <Check aria-hidden='true' />
                {field}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className='asca-fair-sub'>접수 가능한 유형</h3>
          <dl className='asca-fair-types'>
            {OBJECTION_TYPES.map(type => (
              <div key={type.label}>
                <dt>{type.label}</dt>
                <dd>{type.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className='asca-fair-dismiss'>
        <h3 className='asca-fair-sub'>각하 사유</h3>
        <p>다음에 해당하면 처리 대상에서 제외될 수 있습니다.</p>
        <ul>
          {DISMISSAL_REASONS.map(reason => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
      <p className='asca-fair-links'>
        <Link href={regulationHref('objections')} className='asca-btn asca-btn--link'>
          이의제기 처리 규정 원문 <ArrowRight aria-hidden='true' />
        </Link>
        <Link href='/contact#objection' className='asca-btn asca-btn--link'>
          문의 페이지의 이의제기 안내 <ArrowRight aria-hidden='true' />
        </Link>
      </p>
    </section>
  )
}

function ConflictOfInterest() {
  return (
    <section id='coi' className='asca-fair-sec' aria-labelledby='coi-title'>
      <SectionHead
        num='04'
        id='coi'
        title='심사위원 이해상충(COI) 확인서'
        lede='본 확인서는 (사) 동양서예협회 공모전·전시 심사 운영의 공정성을 확보하기 위한 필수 절차입니다. 심사위원은 아래 항목을 확인하고, 이해상충이 있는 경우 해당 건 심사에서 회피합니다.'
      />
      <dl className='asca-fair-pillars'>
        {COI_COMMITMENTS.map(item => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
      <h3 className='asca-fair-sub'>이해상충 확인 항목</h3>
      <ol className='asca-fair-rows'>
        {COI_ITEMS.map((item, i) => (
          <li key={item}>
            <span className='asca-fair-rows__num' aria-hidden='true'>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
      <figure className='asca-fair-pledge'>
        <figcaption>비밀유지 및 공정 심사 서약</figcaption>
        <blockquote>{COI_PLEDGE}</blockquote>
      </figure>
    </section>
  )
}

export default function FairnessTransparencyHubPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.fairness}
        title='공정·투명성 허브'
        lede={
          <>
            (사) 동양서예협회는 &ldquo;전시를 잘하는 단체&rdquo;를 넘어,{' '}
            <strong className='text-foreground'>운영을 신뢰받는 단체</strong>가 되기 위해
            공모전·전시 운영의 공정성·투명성 기준을 공개합니다.
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '운영원칙', value: `${CORE_PRINCIPLES.length}개` },
            { label: '심사 단계', value: `${JUDGING_STEPS.length}단계` },
          ]}
        />
      </PageHero>

      <div className='asca-regs asca-fair'>
        {/* 한눈에 요약 — 출품자가 가장 먼저 찾는 숫자(기한)와 시행일을 맨 위에 둔다 */}
        <section className='asca-fair-glance' aria-labelledby='glance-title'>
          <h2 id='glance-title' className='asca-eyebrow'>
            한눈에 보는 약속
          </h2>
          <dl className='asca-regs-stats asca-fair-glance__stats'>
            <div>
              <dt>이의제기 접수</dt>
              <dd>
                {filingDays}
                <small>일 이내</small>
              </dd>
            </div>
            <div>
              <dt>1차 회신</dt>
              <dd>
                {firstReplyBusinessDays}
                <small>영업일</small>
              </dd>
            </div>
            <div>
              <dt>최종 회신</dt>
              <dd>
                {finalReplyBusinessDays}
                <small>영업일</small>
              </dd>
            </div>
            <div>
              <dt>허브 시행</dt>
              <dd className='is-date'>
                {EFFECTIVE.date} <small>{EFFECTIVE.version}</small>
              </dd>
            </div>
          </dl>
          <p className='asca-fair-note'>
            접수 기간은 결과 공지일 기준이며, 회차별 공모요강이 정한 기간이 있으면 그것을 따릅니다.
          </p>
        </section>

        <div className='asca-fair-layout'>
          <aside className='asca-fair-aside'>
            <FairnessToc sections={SECTIONS} />
            <div className='asca-fair-aside__cta'>
              <p className='asca-fair-toc__label'>이의제기 접수</p>
              <a href={OBJECTION_MAIL}>
                <Mail aria-hidden='true' /> 이메일 (서면 원칙)
              </a>
              <a href={PHONE.href}>
                <Phone aria-hidden='true' /> {PHONE.display}
              </a>
              <a href={CHAT_URL} target='_blank' rel='noopener noreferrer'>
                <MessageCircle aria-hidden='true' /> 실시간 상담
              </a>
              <Link href={REGULATIONS_BASE_PATH} className='asca-fair-aside__regs'>
                정관 및 관련규정 <ArrowUpRight aria-hidden='true' />
              </Link>
            </div>
          </aside>

          <div className='asca-fair-body'>
            <Principles />
            <Judging />
            <Objection />
            <ConflictOfInterest />
          </div>
        </div>
      </div>

      <LayoutFooter />
    </div>
  )
}
