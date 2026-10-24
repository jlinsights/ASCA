import { Metadata } from 'next'
import { PenLine, Users } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
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
  COMMISSION_DOWNLOADS,
  COMMISSION_TALLY_FORM_ID,
  COMMITTEE_PAY,
  FAIRNESS_SOURCES,
  JUROR_PAY,
  PAY_SOURCES,
  RECRUITER_PAY,
  RECUSAL_GROUNDS,
  ROLES,
  STEPS,
  STEP_SOURCES,
} from './_components/commissioning-data'
import '@/components/apply/apply.css'

const DESCRIPTION =
  '대한민국 동양서예대전 심사위원·운영위원·모집위원 위촉 지원서를 온라인으로 작성하거나 한글·PDF 양식으로 제출하세요. 위원별 자격, 위촉 절차, 수당, 공정성 원칙을 규정 원문과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '위원 위촉 지원 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '위원 위촉 지원 | 동양서예협회', description: DESCRIPTION },
}

const TOC = [
  { href: '#roles', label: '위원 구분·자격' },
  { href: '#process', label: '위촉 절차' },
  { href: '#pay', label: '수당' },
  { href: '#fairness', label: '공정성' },
  { href: '#apply', label: '지원서 작성' },
  { href: '#contact', label: '문의' },
] as const

const PAY_COLUMNS = [
  { label: '구분' },
  { label: '책정 기준 (1인당 제안 금액)' },
  { label: '지급 원칙' },
]

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

export default function CommissioningApplicationPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.commissioning}
        title='동양서예대전 위원 위촉 지원'
        lede='대한민국 동양서예대전을 함께 꾸릴 심사위원·운영위원·모집위원을 모십니다. 자격을 확인하신 뒤 온라인으로 지원서를 보내 주세요.'
        actions={
          <>
            <a
              href='#apply'
              className={`${heroAction} bg-foreground text-background hover:opacity-90`}
            >
              <PenLine className='h-4 w-4' aria-hidden='true' />
              온라인 지원서 작성
            </a>
            <a href='#roles' className={`${heroAction} border hover:bg-muted`}>
              <Users className='h-4 w-4' aria-hidden='true' />
              위원 자격 보기
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '위원 구분', value: `${ROLES.length}종` },
            { label: '위촉 결정', value: '이사회 의결' },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <section id='roles' aria-labelledby='roles-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='roles-title'
            eyebrow='위원 구분과 자격'
            title='세 갈래의 위원'
            lede='심사·운영·모집위원은 근로관계가 아닌 위촉직입니다. 겸직할 수 있으며, 역할마다 자격이 다릅니다.'
          />
          <div className='asca-apply__roles'>
            {ROLES.map(role => (
              <article key={role.title} aria-labelledby={`role-${role.mark}`}>
                <header className='asca-apply__role-head'>
                  <span className='asca-apply__role-mark' aria-hidden='true'>
                    {role.mark}
                  </span>
                  <h3 id={`role-${role.mark}`} className='asca-apply__role-title'>
                    {role.title}
                  </h3>
                  <p className='asca-apply__role-duty'>{role.duty}</p>
                </header>
                <h4 className='asca-apply__subhead'>자격</h4>
                <ul className='asca-apply__dash-list'>
                  {role.qualifications.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <RegCite sources={role.sources} />
              </article>
            ))}
          </div>
        </section>

        <section id='process' aria-labelledby='process-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='process-title'
            eyebrow='위촉 절차와 임기'
            title='지원에서 위촉까지'
            lede='위원은 대전마다 위촉하며, 임기는 그 대전이 끝나는 날까지입니다.'
          />
          <ol className='asca-apply__numbered'>
            {STEPS.map(step => (
              <li key={step.title}>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </div>
              </li>
            ))}
          </ol>
          <RegCite sources={STEP_SOURCES} />
        </section>

        <section id='pay' aria-labelledby='pay-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='pay-title'
            eyebrow='위원 수당과 보수'
            title='수당'
            lede='보수는 활동의 성격에 따라 수당·여비·실적 인센티브로 나눕니다. 아래 금액은 1인당 제안 금액이며, 협회 재정 상황과 내부 규정에 따라 책정합니다.'
          />
          <div className='grid gap-12'>
            <LedgerTable caption='심사위원' columns={PAY_COLUMNS} rows={JUROR_PAY} />
            <LedgerTable caption='운영위원' columns={PAY_COLUMNS} rows={COMMITTEE_PAY} />
            <div>
              <LedgerTable
                caption='모집위원 실적 인센티브'
                columns={[
                  { label: '구분' },
                  { label: '모집 인원', numeric: true },
                  { label: '지급 기준' },
                  { label: '지급액 (누적)', numeric: true },
                ]}
                rows={RECRUITER_PAY}
              />
              <p className='asca-apply__note'>
                모집 인원이 30명에 이르면 1번째부터 30번째까지를 1인당 10,000원으로 계산하고,
                31번째부터는 해당 구간의 단가를 더합니다. 회의 참석 등 기본 활동 수당과는 별도로
                합산합니다.
              </p>
            </div>
          </div>
          <RegCite sources={PAY_SOURCES} />
        </section>

        <section id='fairness' aria-labelledby='fairness-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='fairness-title'
            eyebrow='공정성 원칙'
            title='제척·회피·기피'
            lede='심사의 공정을 해칠 수 있는 관계가 있으면 해당 작품의 심사에서 빠집니다.'
          />
          <div className='asca-apply__split'>
            <div>
              <h3 className='asca-apply__subhead'>해당 작품 심사에서 제척되는 경우</h3>
              <ul className='asca-apply__dash-list'>
                {RECUSAL_GROUNDS.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className='asca-apply__note'>
                위 사유가 있거나 스스로 공정한 심사가 어렵다고 판단되면 심사위원장의 허가를 받아
                회피할 수 있고, 출품자는 심사 개시 전까지 서면으로 기피를 신청할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className='asca-apply__subhead'>심사위원이 모집을 겸할 때</h3>
              <p className='asca-apply__lede'>
                본인이 모집한 출품자가 그 공모전의 심사 대상에 포함되어 있다면, 모집 인센티브 지급
                대상에서 제외하거나 해당 출품작 심사에서 반드시 제척됩니다.
              </p>
            </div>
          </div>
          <RegCite sources={FAIRNESS_SOURCES} />
        </section>

        <section id='apply' aria-labelledby='apply-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='apply-title'
            eyebrow='작성 방법 세 가지'
            title='지원서 작성'
            lede='온라인 지원서는 단계별 질문에 답한 뒤 마지막에 전송 버튼을 누르면 접수됩니다. 문서로 내시려면 한글·PDF 양식을 내려받으세요.'
          />
          <div className='asca-apply__form'>
            <div className='asca-apply__form-head'>
              <h3 className='asca-apply__form-title'>
                온라인 위원 위촉 지원서<small>권장</small>
              </h3>
            </div>
            <TallyEmbed
              formId={COMMISSION_TALLY_FORM_ID}
              title='대한민국 동양서예대전 위원 위촉 지원서'
              initialHeight={720}
            />
          </div>
          <DownloadList items={COMMISSION_DOWNLOADS} />
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의·상담'
            title='궁금한 점이 있으면'
            lede='자격 해당 여부나 겸직, 수당이 궁금하시면 사무국으로 바로 연락해 주세요.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}
