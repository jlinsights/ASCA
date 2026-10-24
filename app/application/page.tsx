import { Metadata } from 'next'
import { BookOpen, PenLine } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { ContestFlipbook } from '@/components/contests/contest-flipbook'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  DownloadList,
  LedgerTable,
  RegCite,
} from '@/components/apply/apply-parts'
import { TallyEmbed } from '@/components/apply/tally-embed'
import {
  AWARDS,
  AWARD_SOURCES,
  CRITERIA,
  DIVISIONS,
  DIVISION_SOURCES,
  ENTRY_DOWNLOADS,
  ENTRY_FAQ_IDS,
  ENTRY_FEES,
  ENTRY_TALLY_FORM_ID,
  FEE_SOURCES,
  FRAMING_FEES,
  GRADE_THRESHOLDS,
  JUDGING_SOURCES,
  PODCAST_EMBED,
  SIZES,
} from './_components/application-data'
import '@/components/apply/apply.css'

const DESCRIPTION =
  '대한민국 동양서예대전 출품원서를 온라인으로 작성하거나 Word·PDF 양식으로 제출하세요. 공모 부문과 작품 규격, 출품비, 심사 방식, 시상 내역을 규정 원문과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '출품원서 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '출품원서 | 동양서예협회', description: DESCRIPTION },
}

const TOC = [
  { href: '#apply', label: '출품원서 작성' },
  { href: '#guide', label: '공모요강' },
  { href: '#divisions', label: '부문·규격' },
  { href: '#fees', label: '출품비' },
  { href: '#judging', label: '심사' },
  { href: '#awards', label: '시상' },
  { href: '#faq', label: '자주 묻는 질문' },
  { href: '#contact', label: '문의' },
] as const

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

export default function ApplicationPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.application}
        title='출품원서'
        lede='대한민국 동양서예대전 출품원서를 온라인으로 바로 작성하거나, Word·PDF 양식을 내려받아 제출하실 수 있습니다.'
        actions={
          <>
            <a
              href='#apply'
              className={`${heroAction} bg-foreground text-background hover:opacity-90`}
            >
              <PenLine className='h-4 w-4' aria-hidden='true' />
              온라인 출품원서 작성
            </a>
            <a href='#guide' className={`${heroAction} border hover:bg-muted`}>
              <BookOpen className='h-4 w-4' aria-hidden='true' />
              공모요강 보기
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '공모 부문', value: `${DIVISIONS.length}개` },
            { label: '작품 규격', value: `${SIZES.length}종` },
            { label: '대상 상금', value: AWARDS[0]?.prize.replace('상장 및 상금 ', '') ?? '—' },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <section id='apply' aria-labelledby='apply-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='apply-title'
            eyebrow='작성 방법 세 가지'
            title='출품원서 작성'
            lede='온라인 양식은 단계별 질문에 답한 뒤 마지막에 전송 버튼을 누르면 접수됩니다. 인쇄해 쓰시려면 아래 Word·PDF 양식을 내려받으세요.'
          />
          <div className='asca-apply__form'>
            <div className='asca-apply__form-head'>
              <h3 className='asca-apply__form-title'>
                온라인 출품원서<small>권장</small>
              </h3>
              <p className='asca-apply__form-hint'>한국어 · 中文 · 日本語 · English</p>
            </div>
            <TallyEmbed
              formId={ENTRY_TALLY_FORM_ID}
              title='東洋書藝 出品願書 — 온라인 출품원서'
              initialHeight={720}
            />
          </div>
          <DownloadList items={ENTRY_DOWNLOADS} />
        </section>

        <section id='guide' aria-label='공모요강' className='asca-apply__anchor'>
          <ContestFlipbook />
        </section>

        <section id='divisions' aria-labelledby='divisions-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='divisions-title'
            eyebrow='공모 부문과 작품 규격'
            title='다섯 부문, 세 규격'
            lede='필요한 경우 이사회 의결을 거쳐 심사부문을 추가할 수 있습니다.'
          />
          <ul className='asca-apply__divisions'>
            {DIVISIONS.map(division => (
              <li key={division.title} className='asca-apply__division'>
                <span className='asca-apply__division-mark' aria-hidden='true'>
                  {division.mark}
                </span>
                <h3 className='asca-apply__division-title'>{division.title}</h3>
                <p className='asca-apply__division-body'>{division.body}</p>
              </li>
            ))}
          </ul>
          <dl className='asca-apply__sizes'>
            {SIZES.map(size => (
              <div key={size.name} className='asca-apply__size'>
                <dt>{size.name}</dt>
                <dd>{size.size}</dd>
              </div>
            ))}
          </dl>
          <RegCite sources={DIVISION_SOURCES} />
        </section>

        <section id='fees' aria-labelledby='fees-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='fees-title'
            eyebrow='출품비와 표구비'
            title='출품비'
            lede='회원 등급별 출품비입니다. 표구비는 입선 이상 작품에만 따로 부과합니다.'
          />
          <div className='asca-apply__split'>
            <div>
              <LedgerTable
                caption='출품비 (표구비 별도)'
                columns={[
                  { label: '구분' },
                  { label: '작품 1점', numeric: true },
                  { label: '2~9번째 작품', numeric: true },
                ]}
                rows={ENTRY_FEES}
              />
              <p className='asca-apply__note'>
                청년작가와 일반작가는 출품하는 해의 1월 1일 나이로 구분합니다. 비회원의 출품비와
                10번째 이후 작품의 출품비는 해당 공모의 공모요강으로 정합니다.
              </p>
            </div>
            <div>
              <LedgerTable
                caption='표구비 (입선 이상 작품)'
                columns={[
                  { label: '규격' },
                  { label: '비회원', numeric: true },
                  { label: '정회원', numeric: true },
                ]}
                rows={FRAMING_FEES}
              />
              <p className='asca-apply__note'>
                기계배접이 아닌 손배접을 원칙으로 하며, 실제 표구 원가를 기준으로 책정합니다.
              </p>
            </div>
          </div>
          <RegCite sources={FEE_SOURCES} />
        </section>

        <section id='judging' aria-labelledby='judging-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='judging-title'
            eyebrow='심사 방식'
            title='네 항목, 100점'
            lede='옛 법첩을 기준으로 서체별 구성, 여백, 조화, 묵색에 중점을 두고 작품성의 우열을 가립니다.'
          />
          <ul className='asca-apply__criteria'>
            {CRITERIA.map(criterion => (
              <li key={criterion.name} className='asca-apply__criterion'>
                <h3 className='asca-apply__criterion-name'>
                  {criterion.name}
                  <span className='asca-apply__criterion-han'>{criterion.han}</span>
                </h3>
                <p className='asca-apply__criterion-score'>{criterion.score}</p>
                <p className='asca-apply__criterion-body'>{criterion.elements}</p>
              </li>
            ))}
          </ul>
          <div className='asca-apply__split'>
            <ol className='asca-apply__numbered'>
              <li>
                <div>
                  <strong>익명 심사</strong>
                  <span>접수된 작품마다 심사번호를 부여하고 작가 정보를 봉인합니다.</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>5점 단위 채점</strong>
                  <span>심사위원마다 네 항목을 채점하고 항목별 평가 근거를 적습니다.</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>최고·최저점 제외 평균</strong>
                  <span>심사위원별 총점에서 최고점과 최저점을 뺀 평균이 최종점수입니다.</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>심사위원 기피 신청</strong>
                  <span>
                    심사위원이 출품자의 배우자·직계 존비속이거나 스승·제자 관계인 등 제척 사유가
                    있으면, 심사 개시 전까지 서면으로 기피를 신청할 수 있습니다.
                  </span>
                </div>
              </li>
            </ol>
            <LedgerTable
              caption='등급 결정 기준'
              columns={[{ label: '최종점수' }, { label: '등급 후보' }]}
              rows={GRADE_THRESHOLDS}
            />
          </div>
          <RegCite sources={JUDGING_SOURCES} />
        </section>

        <section id='awards' aria-labelledby='awards-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='awards-title'
            eyebrow='시상 내역과 상금'
            title='시상'
            lede='본상은 작품의 예술성을, 특별상은 여러 서체에 걸친 균형 있는 연구를 기준으로 선정합니다.'
          />
          <LedgerTable
            caption='입상 등급별 인원과 상금'
            columns={[
              { label: '상' },
              { label: '구분' },
              { label: '인원', numeric: true },
              { label: '시상', numeric: true },
            ]}
            rows={AWARDS.map((award, index) => ({
              cells: [award.name, award.tier, award.count, award.prize],
              lead: index === 0,
            }))}
          />
          <p className='asca-apply__note'>
            특선·입선 인원은 출품작 총수와 수준에 따라 이사회 의결로 조정할 수 있습니다. 상금에
            부과되는 제세공과금은 수상자 본인 부담이 원칙입니다.
          </p>
          <RegCite sources={AWARD_SOURCES} />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='faq-title'
            eyebrow='자주 묻는 질문'
            title='출품 전에 많이 묻는 것'
          />
          <SiteFaqList ids={ENTRY_FAQ_IDS} />
          <div className='mt-12'>
            <h3 className='asca-apply__subhead'>함께 듣기 — 관련 팟캐스트</h3>
            <iframe
              src={PODCAST_EMBED}
              width='100%'
              height='152'
              loading='lazy'
              allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
              title='동양서예협회 팟캐스트 에피소드'
              style={{ borderRadius: 12, border: 0 }}
            />
          </div>
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의·상담'
            title='작성하다 막히면'
            lede='출품원서 작성이나 출품 자격이 궁금하시면 사무국으로 바로 연락해 주세요.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}
