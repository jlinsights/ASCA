'use client'

import { AcademySectionHead } from './academy-section-head'
import { useAcademyText } from './use-academy-copy'

/** 과목과 정규 커리큘럼 — 여덟 과목은 색인처럼, 세 갈래 커리큘럼은 두 단계 사다리로 */
export function AcademySubjects() {
  const { copy, ui, language } = useAcademyText()

  return (
    <section className='asca-ac__section' aria-labelledby='ac-subjects'>
      <AcademySectionHead
        id='ac-subjects'
        eyebrow={ui('subjectsEyebrow')}
        title={ui('subjectsTitle')}
        lede={ui('subjectsLede')}
      />

      <ul className='asca-ac__subjects'>
        {copy.subjects.map(subject => (
          <li key={subject.mark} className='asca-ac__subject'>
            <span className='asca-ac__subject-mark' aria-hidden='true'>
              {subject.mark}
            </span>
            <h3 className='asca-ac__subject-title'>{subject.title}</h3>
            <p className='asca-ac__subject-body'>{subject.description}</p>
          </li>
        ))}
      </ul>

      <h3 className='asca-ac__subhead'>{ui('curriculum')}</h3>
      <div className='asca-ac__tracks'>
        {copy.curriculum.map(track => (
          <article key={track.titleEn} className='asca-ac__track'>
            <header className='asca-ac__track-head'>
              <h4 className='asca-ac__track-title'>{track.title}</h4>
              {/* 영어 화면에서는 제목이 이미 영어라 겹쳐 달지 않는다 */}
              {language !== 'en' && <p className='asca-ac__track-en'>{track.titleEn}</p>}
            </header>
            {track.levels.map((level, index) => (
              <div key={index} className='asca-ac__level'>
                <p className='asca-ac__level-stage'>
                  <span className='asca-ac__level-node' data-step={index} aria-hidden='true' />
                  {level.stage}
                </p>
                <p className='asca-ac__level-label'>{level.label}</p>
                <ul className='asca-ac__dash-list'>
                  {level.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}
