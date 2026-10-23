import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { JOIN_CHANNELS, JOIN_STEPS } from './membership-data'
import { RegCite } from './reg-cite'

/** 가입 방법 — 왼쪽에 세 단계(Step 01–03), 오른쪽에 바로 갈 수 있는 창구를 먹선 행으로 */
export function MembershipJoin() {
  return (
    <section className='asca-mb__section asca-mb__join' aria-labelledby='mb-join'>
      <div className='asca-mb__join-head'>
        <h2 id='mb-join' className='asca-mb__title'>
          가입 방법
        </h2>
        <ol className='asca-mb__steps'>
          {JOIN_STEPS.map((step, index) => (
            <li key={step.title} className='asca-mb__step'>
              <span className='asca-mb__step-no'>Step {String(index + 1).padStart(2, '0')}</span>
              <h3 className='asca-mb__step-title'>{step.title}</h3>
              <p className='asca-mb__step-body'>{step.body}</p>
              {step.source && <RegCite sources={[step.source]} />}
            </li>
          ))}
        </ol>
      </div>

      <ul className='asca-mb__channels'>
        {JOIN_CHANNELS.map(channel => {
          const Icon = channel.external ? ArrowUpRight : ArrowRight
          return (
            <li key={channel.title}>
              <Link
                href={channel.href}
                className='asca-mb__channel'
                {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className='asca-mb__channel-title'>{channel.title}</span>
                <span className='asca-mb__channel-detail'>{channel.detail}</span>
                <Icon className='asca-mb__channel-icon' aria-hidden='true' />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
