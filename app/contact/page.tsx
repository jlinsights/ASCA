import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Headphones, Mail, Phone } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import { ApplySectionHead, ApplyToc, LedgerTable, RegCite } from '@/components/apply/apply-parts'
import { KAKAO_CHAT_URL, EMAIL, HEADQUARTERS, OFFICE, PHONE } from '@/lib/content/contact-info'
import { EventCalendar } from './_components/event-calendar'
import { InquiryComposer } from './_components/inquiry-composer'
import {
  CHANNELS,
  OBJECTION_DEADLINES,
  OBJECTION_DISMISSALS,
  OBJECTION_FIELDS,
  OBJECTION_MAILTO,
  OBJECTION_SOURCES,
  OBJECTION_TYPES,
  OFFICE_SOURCES,
  TOPICS,
} from './_components/contact-data'
import '@/components/apply/apply.css'
import '@/components/apply/support.css'

const DESCRIPTION =
  '동양서예협회 문의 안내. 출품·회원·회비·승급·위원 지원·강좌 등 용건별 안내 페이지와 실시간 상담, 카카오톡, 전화, 이메일 창구, 공모·전시 결과 이의제기 절차, 본부와 사무소 주소를 확인하세요.'

export const metadata: Metadata = {
  title: '문의 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: {
    title: '문의 | 동양서예협회',
    description: DESCRIPTION,
    images: [
      'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
    ],
  },
}

const TOC = [
  { href: '#inquiry', label: '문의서 쓰기' },
  { href: '#topics', label: '용건별 안내' },
  { href: '#channels', label: '연락 창구' },
  { href: '#objection', label: '이의제기' },
  { href: '#address', label: '주소' },
  { href: '#events', label: '행사 일정' },
  { href: '#faq', label: '자주 묻는 질문' },
] as const

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

export default function ContactPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.contact}
        title='문의'
        lede='무엇을 도와드릴까요? 용건을 고르시면 답이 있는 곳으로 바로 안내해 드립니다. 직접 묻고 싶으시면 실시간 상담이 가장 빠릅니다.'
        actions={
          <>
            <a
              href={KAKAO_CHAT_URL}
              target='_blank'
              rel='noopener noreferrer'
              className={`${heroAction} bg-foreground text-background hover:opacity-90`}
            >
              <Headphones className='h-4 w-4' aria-hidden='true' />
              실시간 상담
              <span className='sr-only'> (새 창)</span>
            </a>
            <a href={PHONE.href} className={`${heroAction} border hover:bg-muted`}>
              <Phone className='h-4 w-4' aria-hidden='true' />
              {PHONE.display}
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '전화 상담', value: '평일 10–17시' },
            { label: '이의제기 접수', value: '결과 공지 후 7일' },
            { label: '최종 회신', value: '영업일 14일 이내' },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <section id='inquiry' aria-labelledby='inquiry-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='inquiry-title'
            eyebrow='문의서'
            title='작품·의뢰·전시 문의'
            lede='작품 구입, 휘호 의뢰, 전시 협업처럼 견적이 필요한 일은 여기서 바로 시작하세요.'
          />
          <InquiryComposer />
        </section>

        <section id='topics' aria-labelledby='topics-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='topics-title'
            eyebrow='용건별 안내'
            title='무엇을 도와드릴까요'
            lede='자주 들어오는 문의는 아래 페이지에 규정 원문과 함께 정리해 두었습니다.'
          />
          <ul className='asca-apply__routes'>
            {TOPICS.map(topic => (
              <li key={topic.title}>
                <Link href={topic.href} className='asca-apply__route'>
                  <span className='asca-apply__route-title'>{topic.title}</span>
                  <span className='asca-apply__route-body'>{topic.body}</span>
                  <span className='asca-apply__route-cta'>
                    {topic.cta}
                    <ArrowRight className='h-4 w-4' aria-hidden='true' />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className='asca-apply__note'>
            협업·제휴 제안은 이메일로 보내 주세요. 협회는 동양예술의 전통과 정신을 이어 현대예술로
            넓히는 범위 안에서 브랜드·개인 프로젝트 등 여러 분야의 창작자와 협업합니다.
          </p>
        </section>

        <section id='channels' aria-labelledby='channels-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='channels-title'
            eyebrow='연락 창구'
            title='어디로 연락할까요'
            lede='창구마다 잘 맞는 일이 다릅니다. 서류와 공식 문의는 기록이 남는 이메일로 보내 주세요.'
          />
          <ul className='asca-apply__channels'>
            {CHANNELS.map(channel => {
              const inner = (
                <>
                  <span className='asca-apply__channel-title'>
                    {channel.title}
                    {channel.recommended && (
                      <span className='asca-apply__channel-badge'>가장 빠름</span>
                    )}
                  </span>
                  <span className='asca-apply__channel-value'>{channel.value}</span>
                  <span className='asca-apply__channel-best'>{channel.bestFor}</span>
                  {channel.external && <span className='sr-only'> (새 창)</span>}
                </>
              )
              return (
                <li key={channel.title}>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className={`asca-apply__channel${channel.recommended ? ' is-primary' : ''}`}
                      {...(channel.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className='asca-apply__channel'>{inner}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section id='objection' aria-labelledby='objection-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='objection-title'
            eyebrow='공모·전시 결과 이의제기'
            title='이의제기 절차'
            lede='협회가 주최·주관하거나 위탁 운영하는 모든 공모전과 전시 사업에 적용합니다. 접수는 공식 결과 공지일로부터 7일 이내이며, 개별 공모요강에 다른 기한이 있으면 그 기한을 따릅니다.'
          />
          <div className='asca-apply__split'>
            <div>
              <h3 className='asca-apply__subhead'>서면에 꼭 넣을 네 가지</h3>
              <dl className='asca-apply__fields'>
                {OBJECTION_FIELDS.map(field => (
                  <div key={field.term} className='asca-apply__field'>
                    <dt>{field.term}</dt>
                    <dd>{field.detail}</dd>
                  </div>
                ))}
              </dl>
              <a href={OBJECTION_MAILTO} className='asca-apply__way-link mt-6'>
                <Mail className='h-4 w-4' aria-hidden='true' />
                양식이 채워진 이메일 쓰기
              </a>
              <p className='asca-apply__note'>
                서면(이메일) 접수가 원칙입니다. 받는 곳은 {EMAIL}입니다. 전화({PHONE.display})로
                접수한 경우에도 위 네 가지를 서면으로 제출해야 합니다.
              </p>
            </div>
            <div className='asca-apply__stack'>
              <LedgerTable
                caption='처리 기한'
                columns={[{ label: '단계' }, { label: '기한' }, { label: '내용' }]}
                rows={OBJECTION_DEADLINES}
              />
              <p className='asca-apply__note'>
                전문적인 재검증이 필요하면 기간을 연장할 수 있으며, 이때는 지연 사유를 미리
                알립니다.
              </p>
            </div>
          </div>
          <div className='asca-apply__split'>
            <div>
              <h3 className='asca-apply__subhead'>유형별 처리 기준</h3>
              <ol className='asca-apply__numbered'>
                {OBJECTION_TYPES.map(type => (
                  <li key={type.title}>
                    <div>
                      <strong>{type.title}</strong>
                      <span>{type.body}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className='asca-apply__subhead'>받아들이지 않을 수 있는 경우</h3>
              <ul className='asca-apply__dash-list'>
                {OBJECTION_DISMISSALS.map(reason => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
          <RegCite sources={OBJECTION_SOURCES} />
        </section>

        <section id='address' aria-labelledby='address-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='address-title'
            eyebrow='주소'
            title='본부와 사무소'
            lede='출품원서 접수와 모든 행정업무는 사무소에서 처리합니다. 서류를 보내실 때는 사무소 주소를 써 주세요.'
          />
          <div className='asca-apply__addresses'>
            {[OFFICE, HEADQUARTERS].map(address => (
              <address
                key={address.label}
                className={`asca-apply__address${address === OFFICE ? ' is-primary' : ''}`}
              >
                <p className='asca-apply__address-label'>
                  {address.label}
                  {address === OFFICE && (
                    <span className='asca-apply__address-role'>출품원서 · 행정업무</span>
                  )}
                </p>
                <p className='asca-apply__address-postal'>〒{address.postalCode}</p>
                <p className='asca-apply__address-line'>{address.line1}</p>
                <p className='asca-apply__address-sub'>({address.line2})</p>
                <a
                  href={`https://map.kakao.com/?q=${encodeURIComponent(address.line1.split(',')[0] ?? address.line1)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='asca-apply__address-map'
                >
                  카카오맵에서 보기
                  <ArrowUpRight className='h-3.5 w-3.5' aria-hidden='true' />
                  <span className='sr-only'> (새 창)</span>
                </a>
              </address>
            ))}
          </div>
          <RegCite sources={OFFICE_SOURCES} />
        </section>

        <section id='events' aria-labelledby='events-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='events-title'
            eyebrow='행사 일정'
            title='행사와 전시회'
            lede='협회가 진행할 행사와 전시회를 살펴보시고, 참석하실 일정은 직접 예약 등록해 주세요.'
          />
          <EventCalendar />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='faq-title'
            eyebrow='자주 묻는 질문'
            title='문의 전에 확인해 보세요'
          />
          <SiteFaqList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}
