import { Metadata } from 'next'
import { ArrowUpRight, CreditCard, ListChecks } from 'lucide-react'
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
import { CopyButton } from '@/components/apply/copy-button'
import {
  ACCOUNTABILITY,
  ACCOUNTABILITY_SOURCES,
  ARREARS,
  BANK_ACCOUNT,
  CMS_PDF_URL,
  DONUS_MYPAGE_URL,
  DONUS_PAYMENT_URL,
  DUES,
  DUES_SOURCES,
  FUNDRAISING_FAQ_IDS,
  PAYMENT_SOURCES,
  PROGRAMS,
  PROGRAM_SOURCES,
} from './_components/fundraising-data'
import '@/components/apply/apply.css'
import '@/components/apply/support.css'

const DESCRIPTION =
  '동양서예협회 연회비·등록비·발전기금을 온라인 결제, 무통장입금, CMS 자동이체로 납부하세요. 등급별 회비와 납부 기한, 회비가 쓰이는 협회 사업, 예산·결산·회계감사 절차를 정관과 규정 원문과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '회비·후원 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: {
    title: '회비·후원 | 동양서예협회',
    description: DESCRIPTION,
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

const TOC = [
  { href: '#pay', label: '납부 방법' },
  { href: '#dues', label: '회비 기준' },
  { href: '#use', label: '쓰이는 곳' },
  { href: '#accountability', label: '예산·결산' },
  { href: '#faq', label: '자주 묻는 질문' },
  { href: '#contact', label: '문의' },
] as const

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const

export default function FundraisingPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.fundraising}
        title='회비와 후원'
        lede='회원이 내는 회비가 협회 수입의 바탕입니다. 온라인 결제, 무통장입금, CMS 자동이체 가운데 편한 방법으로 납부하실 수 있습니다.'
        actions={
          <>
            <a
              href={DONUS_PAYMENT_URL}
              {...external}
              className={`${heroAction} bg-foreground text-background hover:opacity-90`}
            >
              <CreditCard className='h-4 w-4' aria-hidden='true' />
              온라인 납부
              <span className='sr-only'> (새 창)</span>
            </a>
            <a href='#dues' className={`${heroAction} border hover:bg-muted`}>
              <ListChecks className='h-4 w-4' aria-hidden='true' />
              등급별 회비 보기
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '연회비', value: '3만원부터' },
            { label: '납부 기한', value: '매년 1월 31일' },
            { label: '발전기금 분할', value: '최대 20개월' },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <section id='pay' aria-labelledby='pay-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='pay-title'
            eyebrow='납부 방법 세 가지'
            title='납부 방법'
            lede='모든 비용은 온라인 납부(계좌이체, CMS 출금 등)를 원칙으로 합니다. 온라인 결제는 원하시면 전자 영수증을 받을 수 있습니다.'
          />
          <ol className='asca-apply__ways'>
            <li className='asca-apply__way is-primary'>
              <p className='asca-apply__way-tag'>권장</p>
              <h3 className='asca-apply__way-title'>온라인 결제</h3>
              <p className='asca-apply__way-body'>
                결제 페이지에서 구분과 항목(연회비, 등록비, 출품비 등)을 고른 뒤 납부합니다. 납부
                내역은 마이페이지에서 확인합니다. 처음 오셨다면 마이페이지 계정을 만들고 회원 인증을
                먼저 진행해 주세요.
              </p>
              <div className='asca-apply__way-actions'>
                <a href={DONUS_PAYMENT_URL} {...external} className='asca-apply__way-link'>
                  결제 페이지
                  <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                  <span className='sr-only'> (새 창)</span>
                </a>
                <a href={DONUS_MYPAGE_URL} {...external} className='asca-apply__way-link is-quiet'>
                  마이페이지 · 납부 내역
                  <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                  <span className='sr-only'> (새 창)</span>
                </a>
              </div>
            </li>
            <li className='asca-apply__way'>
              <p className='asca-apply__way-tag'>계좌이체</p>
              <h3 className='asca-apply__way-title'>무통장입금</h3>
              <p className='asca-apply__account'>
                <span>{BANK_ACCOUNT.bank}</span>
                <strong>{BANK_ACCOUNT.number}</strong>
                <span>예금주 {BANK_ACCOUNT.holder}</span>
              </p>
              <div className='asca-apply__way-actions'>
                <CopyButton value={BANK_ACCOUNT.number} label='계좌번호 복사' />
              </div>
            </li>
            <li className='asca-apply__way'>
              <p className='asca-apply__way-tag'>자동이체</p>
              <h3 className='asca-apply__way-title'>CMS 출금이체</h3>
              <p className='asca-apply__way-body'>
                매년 내는 연회비, 그리고 임원 발전기금 200만원의 분할 납부(최대 20개월)에 씁니다.
                신청서를 내려받아 작성하고 본인 인감 또는 서명을 날인해 협회에 제출해 주세요.
              </p>
              <div className='asca-apply__way-actions'>
                <a href={CMS_PDF_URL} {...external} className='asca-apply__way-link'>
                  CMS 출금이체 신청서 (PDF)
                  <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                  <span className='sr-only'> (새 창)</span>
                </a>
              </div>
            </li>
          </ol>
          <RegCite sources={PAYMENT_SOURCES} />
        </section>

        <section id='dues' aria-labelledby='dues-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='dues-title'
            eyebrow='등급별 회비'
            title='회비 기준'
            lede='등급은 활동 경력과 성과에 따라 정해지고, 청년작가와 일반작가는 해당 연도 1월 1일 나이(만 40세 이하 / 만 41세 이상)로 나눕니다.'
          />
          <div className='asca-apply__split'>
            <div>
              <LedgerTable
                caption='연회비와 등록비'
                columns={[
                  { label: '구분' },
                  { label: '연회비', numeric: true },
                  { label: '등록비', numeric: true },
                  { label: '등록비를 내는 때' },
                ]}
                rows={DUES}
              />
              <p className='asca-apply__note'>
                연회비는 매년 1월 31일까지 납부합니다. 특별한 사유가 있으면 이사회 승인으로 납부를
                유예하거나 나누어 낼 수 있습니다.
              </p>
            </div>
            <div className='asca-apply__stack'>
              <div>
                <h3 className='asca-apply__subhead'>평생회원</h3>
                <ul className='asca-apply__dash-list'>
                  <li>
                    초대작가 이상의 정회원은 연회비의 10배를 평생회비로 납부하고 평생회원을 신청할
                    수 있습니다.
                  </li>
                  <li>평생회원은 이후 연회비 납부 의무를 영구히 면제받습니다.</li>
                </ul>
              </div>
              <div>
                <h3 className='asca-apply__subhead'>임원 발전기금</h3>
                <ul className='asca-apply__dash-list'>
                  <li>임원으로 취임하는 회원은 발전기금 200만원을 납부합니다.</li>
                  <li>최대 20개월까지 CMS로 나누어 낼 수 있습니다.</li>
                  <li>완납하면 평생회원 자격을 자동으로 얻습니다.</li>
                  <li>이미 평생회원이라면 낸 평생회비를 뺀 차액만 납부합니다.</li>
                </ul>
              </div>
            </div>
          </div>
          <h3 className='asca-apply__subhead'>연회비를 내지 못하면</h3>
          <LedgerTable
            caption='연회비 미납에 따른 조치'
            columns={[{ label: '미납 기간' }, { label: '조치' }]}
            rows={ARREARS}
          />
          <p className='asca-apply__note'>
            제한되거나 정지된 자격은 미납 연회비를 완납하면 복원됩니다. 제명된 회원은 다시 입회해야
            합니다.
          </p>
          <RegCite sources={DUES_SOURCES} />
        </section>

        <section id='use' aria-labelledby='use-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='use-title'
            eyebrow='회비가 쓰이는 곳'
            title='정관이 정한 네 가지 사업'
            lede='협회의 수입은 회원의 회비와 그 밖의 수입으로 충당하며, 정관 제4조가 정한 사업과 협회 운영에 씁니다.'
          />
          <ol className='asca-apply__programs'>
            {PROGRAMS.map(program => (
              <li key={program.title} className='asca-apply__program'>
                <span className='asca-apply__program-mark' aria-hidden='true'>
                  {program.han}
                </span>
                <p className='asca-apply__program-title'>{program.title}</p>
              </li>
            ))}
          </ol>
          <p className='asca-apply__note'>
            이 밖에 협회의 목적을 이루는 데 필요한 사업을 합니다. 사업 운영을 전담하는 상임이사를
            제외한 임원에게는 보수를 지급하지 않으며, 업무에 필요한 실비만 지급할 수 있습니다.
          </p>
          <RegCite sources={PROGRAM_SOURCES} />
        </section>

        <section
          id='accountability'
          aria-labelledby='accountability-title'
          className='asca-apply__anchor'
        >
          <ApplySectionHead
            id='accountability-title'
            eyebrow='예산과 결산'
            title='누가, 언제 확인하는가'
            lede='예산과 결산은 이사회 의결과 총회 승인을 모두 거칩니다. 총회에 올릴 안건은 미리 공개해 회원 누구나 의견을 낼 수 있습니다.'
          />
          <ol className='asca-apply__timeline'>
            {ACCOUNTABILITY.map(step => (
              <li key={step.title} className='asca-apply__timeline-step'>
                <p className='asca-apply__timeline-when'>{step.when}</p>
                <h3 className='asca-apply__timeline-title'>{step.title}</h3>
                <p className='asca-apply__timeline-body'>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className='asca-apply__note'>
            협회가 해산하면 남은 재산은 총회 의결을 거쳐 국가, 지방자치단체 또는 비슷한 목적을 가진
            다른 비영리법인에 귀속합니다.
          </p>
          <RegCite sources={ACCOUNTABILITY_SOURCES} />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='faq-title'
            eyebrow='자주 묻는 질문'
            title='납부 전에 많이 묻는 것'
          />
          <SiteFaqList ids={FUNDRAISING_FAQ_IDS} />
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의·상담'
            title='납부가 확인되지 않으면'
            lede='회비·발전기금·출품비 납부 확인이나 분할 납부 상담은 사무국으로 연락해 주세요.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}
