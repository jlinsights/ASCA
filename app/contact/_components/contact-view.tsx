'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Headphones, Mail, Phone } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import { ApplySectionHead, ApplyToc, LedgerTable, RegCite } from '@/components/apply/apply-parts'
import { useLanguage } from '@/contexts/language-context'
import { KAKAO_CHAT_URL, EMAIL, HEADQUARTERS, OFFICE, PHONE } from '@/lib/content/contact-info'
import { EventCalendar } from './event-calendar'
import { InquirySection } from './inquiry-composer'
import {
  CHANNELS,
  OBJECTION_DEADLINES,
  OBJECTION_MAILTO,
  OBJECTION_SOURCES,
  OFFICE_SOURCES,
  TOPICS,
} from './contact-data'
import { CONTACT_COPY, channelValue, type ContactCopy } from './contact-locale'

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

/** 규정 근거 링크는 그대로 두고 이름만 선택한 언어로 */
const withLabels = <T extends { label: string }>(sources: readonly T[], labels: string[]) =>
  sources.map((source, index) => ({ ...source, label: labels[index] ?? source.label }))

function ContactHero({ copy }: { copy: ContactCopy }) {
  return (
    <PageHero
      {...PAGE_HERO_MARKS.contact}
      title={copy.hero.title}
      lede={copy.hero.lede}
      actions={
        <>
          <a
            href={KAKAO_CHAT_URL}
            target='_blank'
            rel='noopener noreferrer'
            className={`${heroAction} bg-foreground text-background hover:opacity-90`}
          >
            <Headphones className='h-4 w-4' aria-hidden='true' />
            {copy.hero.liveChat}
            <span className='sr-only'> {copy.newWindow}</span>
          </a>
          <a href={PHONE.href} className={`${heroAction} border hover:bg-muted`}>
            <Phone className='h-4 w-4' aria-hidden='true' />
            {PHONE.display}
          </a>
        </>
      }
    >
      <HeroFacts facts={copy.hero.facts.map(([label, value]) => ({ label, value }))} />
    </PageHero>
  )
}

function TopicsSection({ copy }: { copy: ContactCopy }) {
  return (
    <section id='topics' aria-labelledby='topics-title' className='asca-apply__anchor'>
      <ApplySectionHead id='topics-title' {...copy.topics} />
      <ul className='asca-apply__routes'>
        {TOPICS.map((topic, index) => {
          const text = copy.topics.items[index] ?? topic
          return (
            <li key={topic.href}>
              <Link href={topic.href} className='asca-apply__route'>
                <span className='asca-apply__route-title'>{text.title}</span>
                <span className='asca-apply__route-body'>{text.body}</span>
                <span className='asca-apply__route-cta'>
                  {text.cta}
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className='asca-apply__note'>{copy.topics.note}</p>
    </section>
  )
}

function ChannelsSection({ copy }: { copy: ContactCopy }) {
  return (
    <section id='channels' aria-labelledby='channels-title' className='asca-apply__anchor'>
      <ApplySectionHead id='channels-title' {...copy.channels} />
      <ul className='asca-apply__channels'>
        {CHANNELS.map((channel, index) => {
          const text = copy.channels.items[index] ?? channel
          const inner = (
            <>
              <span className='asca-apply__channel-title'>
                {text.title}
                {channel.recommended && (
                  <span className='asca-apply__channel-badge'>{copy.channels.fastest}</span>
                )}
              </span>
              <span className='asca-apply__channel-value'>{channelValue(copy, index)}</span>
              <span className='asca-apply__channel-best'>{text.bestFor}</span>
              {channel.external && <span className='sr-only'> {copy.newWindow}</span>}
            </>
          )
          return (
            <li key={channel.title}>
              {channel.href ? (
                <a
                  href={channel.href}
                  className={`asca-apply__channel${channel.recommended ? ' is-primary' : ''}`}
                  {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
  )
}

function ObjectionSection({
  copy,
  citeLabel,
}: {
  copy: ContactCopy['objection']
  citeLabel: string
}) {
  return (
    <section id='objection' aria-labelledby='objection-title' className='asca-apply__anchor'>
      <ApplySectionHead id='objection-title' {...copy} />
      <div className='asca-apply__split'>
        <div>
          <h3 className='asca-apply__subhead'>{copy.fieldsHead}</h3>
          <dl className='asca-apply__fields'>
            {copy.fields.map(field => (
              <div key={field.term} className='asca-apply__field'>
                <dt>{field.term}</dt>
                <dd>{field.detail}</dd>
              </div>
            ))}
          </dl>
          <a href={OBJECTION_MAILTO} className='asca-apply__way-link mt-6'>
            <Mail className='h-4 w-4' aria-hidden='true' />
            {copy.mailCta}
          </a>
          <p className='asca-apply__note'>{copy.writtenNote(EMAIL, PHONE.display)}</p>
        </div>
        <div className='asca-apply__stack'>
          <LedgerTable
            caption={copy.deadlineCaption}
            columns={copy.deadlineColumns.map(label => ({ label }))}
            rows={OBJECTION_DEADLINES.map((row, index) => ({
              ...row,
              cells: copy.deadlines[index] ?? row.cells,
            }))}
          />
          <p className='asca-apply__note'>{copy.extensionNote}</p>
        </div>
      </div>
      <div className='asca-apply__split'>
        <div>
          <h3 className='asca-apply__subhead'>{copy.typesHead}</h3>
          <ol className='asca-apply__numbered'>
            {copy.types.map(type => (
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
          <h3 className='asca-apply__subhead'>{copy.dismissalsHead}</h3>
          <ul className='asca-apply__dash-list'>
            {copy.dismissals.map(reason => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>
      <RegCite sources={withLabels(OBJECTION_SOURCES, copy.sources)} label={citeLabel} />
    </section>
  )
}

function AddressSection({
  copy,
  citeLabel,
  newWindow,
}: {
  copy: ContactCopy['address']
  citeLabel: string
  newWindow: string
}) {
  const addresses = [
    { address: OFFICE, label: copy.officeLabel, primary: true },
    { address: HEADQUARTERS, label: copy.headquartersLabel, primary: false },
  ]
  return (
    <section id='address' aria-labelledby='address-title' className='asca-apply__anchor'>
      <ApplySectionHead id='address-title' {...copy} />
      <div className='asca-apply__addresses'>
        {addresses.map(({ address, label, primary }) => (
          <address
            key={address.postalCode}
            className={`asca-apply__address${primary ? ' is-primary' : ''}`}
          >
            <p className='asca-apply__address-label'>
              {label}
              {primary && <span className='asca-apply__address-role'>{copy.officeRole}</span>}
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
              {copy.map}
              <ArrowUpRight className='h-3.5 w-3.5' aria-hidden='true' />
              <span className='sr-only'> {newWindow}</span>
            </a>
          </address>
        ))}
      </div>
      <RegCite sources={withLabels(OFFICE_SOURCES, copy.sources)} label={citeLabel} />
    </section>
  )
}

/** /contact 본문 — 선택한 언어로 (페이지는 서버 컴포넌트라 메타데이터만 맡는다) */
export function ContactView() {
  const { language } = useLanguage()
  const copy = CONTACT_COPY[language] ?? CONTACT_COPY.ko
  const toc: { href: `#${string}`; label: string }[] = [
    { href: '#inquiry', label: copy.toc.inquiry },
    { href: '#topics', label: copy.toc.topics },
    { href: '#channels', label: copy.toc.channels },
    { href: '#objection', label: copy.toc.objection },
    { href: '#address', label: copy.toc.address },
    { href: '#events', label: copy.toc.events },
    { href: '#faq', label: copy.toc.faq },
  ]
  return (
    <>
      <ContactHero copy={copy} />
      <div className='asca-apply__body'>
        <ApplyToc items={toc} label={copy.tocLabel} />
        <InquirySection />
        <TopicsSection copy={copy} />
        <ChannelsSection copy={copy} />
        <ObjectionSection copy={copy.objection} citeLabel={copy.citeLabel} />
        <AddressSection copy={copy.address} citeLabel={copy.citeLabel} newWindow={copy.newWindow} />
        <section id='events' aria-labelledby='events-title' className='asca-apply__anchor'>
          <ApplySectionHead id='events-title' {...copy.events} />
          <EventCalendar />
        </section>
        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead id='faq-title' {...copy.faq} />
          <SiteFaqList />
        </section>
      </div>
    </>
  )
}
