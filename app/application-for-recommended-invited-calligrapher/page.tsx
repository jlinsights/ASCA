import { Metadata } from 'next'
import { ListChecks, PenLine } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
  RegCite,
} from '@/components/apply/apply-parts'
import { TallyEmbed } from '@/components/apply/tally-embed'
import {
  REQUIRED_CONDITIONS,
  REVIEW_STEPS,
  SCORE_BANDS,
  SCORE_NOTE,
  SCORING_RULES,
  SCORING_TABLE,
  SRC,
} from '@/app/membership/_components/membership-data'
import '@/components/apply/apply.css'

/**
 * 추천·초대작가 신청. 배점·요건·심사 절차는 /membership 과 같은 데이터(membership-data.ts)를 쓴다 —
 * 예전엔 이 페이지만 "10~14점 → 추천작가" 처럼 점수로 자동 승급되는 듯 적고, 규정에 없는 '공모작가' 등급과
 * '재심 청구' 절차를 따로 들고 있었다.
 */

const DESCRIPTION =
  '추천작가·초대작가 승급을 온라인으로 신청하세요. 대한민국 동양서예대전 입상 배점, 점수와 별개로 갖춰야 하는 필수 요건, 자격심사위원회 심사 절차를 규정 원문과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '추천·초대작가 신청 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '추천·초대작가 신청 | 동양서예협회', description: DESCRIPTION },
}

const TALLY_FORM_ID = 'w59jeo'

const TOC = [
  { href: '#apply', label: '신청서 작성' },
  { href: '#criteria', label: '선정 기준' },
  { href: '#review', label: '심사 절차' },
  { href: '#faq', label: '자주 묻는 질문' },
  { href: '#contact', label: '문의' },
] as const

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

export default function RecommendedInvitedCalligrapherPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.recommendedApplication}
        title='추천·초대작가 신청'
        lede='대한민국 동양서예대전 입상 점수와 필수 요건을 갖춘 정회원은 추천작가·초대작가 자격심사를 신청할 수 있습니다.'
        actions={
          <>
            <a
              href='#apply'
              className={`${heroAction} bg-foreground text-background hover:opacity-90`}
            >
              <PenLine className='h-4 w-4' aria-hidden='true' />
              온라인 신청서 작성
            </a>
            <a href='#criteria' className={`${heroAction} border hover:bg-muted`}>
              <ListChecks className='h-4 w-4' aria-hidden='true' />
              선정 기준 보기
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '추천작가', value: '10점 이상' },
            { label: '초대작가', value: '15점 이상' },
            { label: '자격심사', value: '연 2회' },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <section id='apply' aria-labelledby='apply-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='apply-title'
            eyebrow='온라인 신청'
            title='신청서 작성'
            lede='단계별 질문에 답한 뒤 마지막에 전송 버튼을 누르면 접수됩니다. 종이 양식은 서식 페이지에서 내려받을 수 있습니다.'
          />
          <div className='asca-apply__form'>
            <div className='asca-apply__form-head'>
              <h3 className='asca-apply__form-title'>추천·초대작가 온라인 신청서</h3>
            </div>
            <TallyEmbed
              formId={TALLY_FORM_ID}
              title='동양서예협회 추천·초대작가 신청'
              initialHeight={699}
            />
          </div>
        </section>

        <section id='criteria' aria-labelledby='criteria-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='criteria-title'
            eyebrow='선정 기준'
            title='점수와 필수 요건'
            lede={SCORE_NOTE}
          />
          <div className='asca-apply__split'>
            <div>
              <LedgerTable
                caption='대한민국 동양서예대전 입상 배점'
                columns={[{ label: '입상 등급' }, { label: '배점', numeric: true }]}
                rows={SCORING_TABLE.map(row => ({ cells: [row.award, `${row.points}점`] }))}
              />
              <ul className='asca-apply__dash-list mt-6'>
                {SCORING_RULES.map(rule => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <LedgerTable
                caption='누적 점수'
                columns={[{ label: '누적 점수' }, { label: '구분' }]}
                rows={SCORE_BANDS.map(band => ({
                  cells: [band.range, band.level],
                  lead: band.emphasis,
                }))}
              />
              <h3 className='asca-apply__subhead mt-8'>점수와 별개로 모두 갖춰야 하는 요건</h3>
              <ul className='asca-apply__dash-list'>
                {REQUIRED_CONDITIONS.map(condition => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
              <p className='asca-apply__note'>
                추천작가는 정회원으로 3년 이상 활동하고 협회가 인정하는 전국 규모 공모전 입상 실적이
                있어야 하며, 초대작가는 추천작가로 5년 이상 활동한 경력이 있어야 합니다.
              </p>
            </div>
          </div>
          <RegCite sources={[SRC.select2, SRC.select3, SRC.select4, SRC.select9]} />
        </section>

        <section id='review' aria-labelledby='review-title' className='asca-apply__anchor'>
          <ApplySectionHead id='review-title' eyebrow='심사 절차' title='자격심사위원회 심사' />
          <ol className='asca-apply__numbered'>
            {REVIEW_STEPS.map(step => (
              <li key={step}>
                <div>
                  <span>{step}</span>
                </div>
              </li>
            ))}
          </ol>
          <RegCite sources={[SRC.select8]} />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='faq-title'
            eyebrow='자주 묻는 질문'
            title='신청 전에 많이 묻는 것'
          />
          <SiteFaqList ids={['artist-selection']} />
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의·상담'
            title='신청 자격이 궁금하면'
            lede='내 점수와 요건 충족 여부가 헷갈리시면 사무국으로 먼저 확인해 주세요.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}
