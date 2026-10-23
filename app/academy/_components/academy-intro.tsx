import { ArrowDown } from 'lucide-react'
import { INSTITUTIONS, SRC } from './academy-data'
import { AcademySectionHead } from './academy-section-head'
import { RegCite } from './reg-cite'

/** 협회가 잇는 교육 — 왼쪽에 취지, 오른쪽에 두 교육기관을 장부 행으로 */
export function AcademyIntro() {
  return (
    <section className='asca-ac__section' aria-labelledby='ac-intro'>
      <AcademySectionHead
        id='ac-intro'
        eyebrow='동양서화 아카데미'
        title='협회가 잇는 서예 교육'
        lede='협회 상임이사진이 공식 승인한 교육기관에 한해, 엄선한 서예 강좌를 연결해 드립니다.'
      />

      <div className='asca-ac__intro'>
        <div className='asca-ac__prose'>
          <p>
            동양서예협회는 정관이 정한 <strong>‘한국적 서체개발 육성’</strong>과{' '}
            <strong>‘예술교육 및 서예정신 함양’</strong>을 위해 교육기관과 손잡고 있습니다.
          </p>
          <p>
            서예에 처음 입문하는 분부터 전시회 응모를 준비하는 회원까지, 기초부터 중상급 실력자를
            위한 단계별 강좌를 계속 넓혀 갈 계획입니다.
          </p>
          <RegCite sources={[SRC.articles3, SRC.articles4]} />
        </div>

        <ol className='asca-ac__institutions'>
          {INSTITUTIONS.map((institution, index) => (
            <li key={institution.name}>
              <a href={institution.href} className='asca-ac__institution'>
                <span className='asca-ac__index'>{String(index + 1).padStart(2, '0')}</span>
                <span className='asca-ac__institution-name'>{institution.name}</span>
                <span className='asca-ac__institution-role'>{institution.role}</span>
                <span className='asca-ac__institution-body'>{institution.body}</span>
                <ArrowDown className='asca-ac__institution-icon' aria-hidden='true' />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
