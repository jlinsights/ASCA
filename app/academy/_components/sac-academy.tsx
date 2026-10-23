import { ArrowUpRight } from 'lucide-react'
import {
  ACADEMY_LINKS,
  ASCA_BENEFIT,
  SAC_CLASSES,
  SAC_DISCOUNTS,
  SAC_FEES,
  SAC_INSTRUCTOR_COUNT,
  SAC_LINKS,
  SAC_TERM,
} from './academy-data'
import { AcademySectionHead } from './academy-section-head'
import { SacTimetable } from './sac-timetable'

/**
 * 예술의전당 서화아카데미 — 학기 띠, 협회 수강생 혜택, 주간 시간표, 수강료·안내.
 * 학기 상태(모집 중·진행 중)는 빌드 시점에 굳으므로 계산하지 않고 학기 기간만 적는다.
 */
export function SacAcademy() {
  return (
    <section id='sac' className='asca-ac__section asca-ac__anchor' aria-labelledby='ac-sac'>
      <AcademySectionHead
        id='ac-sac'
        eyebrow='출품료 할인 협력 · 예술의전당 서예박물관'
        title='예술의전당 서화아카데미'
        lede={`한글·한문·문인화·캘리그라피·민화·전각까지, 강사 ${SAC_INSTRUCTOR_COUNT}명이 여는 정규강좌 ${SAC_CLASSES.length}개. 협회의 대표 전시공간에서 배웁니다.`}
      />

      <dl className='asca-ac__term'>
        <div>
          <dt>학기</dt>
          <dd className='asca-ac__term-strong'>{SAC_TERM.name}</dd>
        </div>
        <div>
          <dt>수강 기간</dt>
          <dd>{SAC_TERM.period}</dd>
        </div>
        <div>
          <dt>수업</dt>
          <dd>{SAC_TERM.length}</dd>
        </div>
        <div>
          <dt>휴강</dt>
          <dd>{SAC_TERM.recess}</dd>
        </div>
      </dl>

      <aside className='asca-ac__benefit' aria-labelledby='ac-benefit'>
        <p className='asca-ac__eyebrow'>협회 수강생 혜택</p>
        <h3 id='ac-benefit' className='asca-ac__benefit-title'>
          {ASCA_BENEFIT.headline}
        </h3>
        <dl className='asca-ac__benefit-list'>
          {ASCA_BENEFIT.items.map(item => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <h3 className='asca-ac__subhead'>주간 수업시간표</h3>
      <SacTimetable />
      <p className='asca-ac__source'>
        출처: 예술의전당 「[서화] 2026 &lt;가을정규&gt; 수강생 모집」 — 시간은 기본 시간대와 다를
        때만 따로 적었습니다.{' '}
        <a href={SAC_LINKS.post} target='_blank' rel='noopener noreferrer'>
          원문 보기
          <span className='sr-only'> (새 창)</span>
        </a>
      </p>

      <div className='asca-ac__sac-info'>
        <div>
          <h3 className='asca-ac__subhead'>수강료 (15주)</h3>
          <table className='asca-ac__fees'>
            <caption className='sr-only'>{SAC_TERM.name} 강좌 유형별 수강료</caption>
            <tbody>
              {SAC_FEES.map(fee => (
                <tr key={fee.label}>
                  <th scope='row'>{fee.label}</th>
                  <td>{fee.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className='asca-ac__dash-list asca-ac__dash-list--small'>
            {SAC_DISCOUNTS.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className='asca-ac__subhead'>수강 안내</h3>
          <dl className='asca-ac__facts'>
            <div className='asca-ac__fact'>
              <dt>장소</dt>
              <dd>
                <span className='asca-ac__fact-value'>{SAC_TERM.place}</span>
              </dd>
            </div>
            <div className='asca-ac__fact'>
              <dt>수업 방식</dt>
              <dd>
                <span className='asca-ac__fact-value'>{SAC_TERM.format}</span>
              </dd>
            </div>
            <div className='asca-ac__fact'>
              <dt>신청</dt>
              <dd>
                <span className='asca-ac__fact-value'>예술의전당 홈페이지 선착순 접수</span>
                <span className='asca-ac__fact-note'>
                  아카데미 → 수강신청 → 서화아카데미 (신용카드 결제)
                </span>
              </dd>
            </div>
            <div className='asca-ac__fact'>
              <dt>문의</dt>
              <dd>
                <a href={`tel:${SAC_TERM.tel}`} className='asca-ac__fact-link'>
                  {SAC_TERM.contact}
                </a>
                <span className='asca-ac__fact-note'>
                  예술의전당 서예박물관 · {SAC_TERM.contactHours}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ul className='asca-ac__channels asca-ac__channels--pair'>
        <li>
          <a
            href={SAC_LINKS.recruiting}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-ac__channel'
          >
            <span className='asca-ac__channel-title'>다음 학기 모집 소식</span>
            <span className='asca-ac__channel-detail'>예술의전당 아카데미 모집현황에서 확인</span>
            <ArrowUpRight className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
        <li>
          <a
            href={ACADEMY_LINKS.booking}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-ac__channel'
          >
            <span className='asca-ac__channel-title'>출품료 할인 상담</span>
            <span className='asca-ac__channel-detail'>동양서예협회 사무국 상담 예약</span>
            <ArrowUpRight className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
      </ul>
    </section>
  )
}
