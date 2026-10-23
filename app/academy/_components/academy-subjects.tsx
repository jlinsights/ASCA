import { CURRICULUM, SUBJECTS } from './academy-data'
import { AcademySectionHead } from './academy-section-head'

/** 과목과 정규 커리큘럼 — 여덟 과목은 색인처럼, 세 갈래 커리큘럼은 두 단계 사다리로 */
export function AcademySubjects() {
  return (
    <section className='asca-ac__section' aria-labelledby='ac-subjects'>
      <AcademySectionHead
        id='ac-subjects'
        eyebrow='古代法帖을 基準하여 書法理論 및 實技指導'
        title='배우는 과목과 커리큘럼'
        lede='옛 법첩을 기준으로 서법 이론과 실기를 함께 지도합니다. 입문에서 작가 양성까지 같은 길 위에서 단계를 밟습니다.'
      />

      <ul className='asca-ac__subjects'>
        {SUBJECTS.map(subject => (
          <li key={subject.title} className='asca-ac__subject'>
            <span className='asca-ac__subject-mark' aria-hidden='true'>
              {subject.mark}
            </span>
            <h3 className='asca-ac__subject-title'>{subject.title}</h3>
            <p className='asca-ac__subject-body'>{subject.description}</p>
          </li>
        ))}
      </ul>

      <h3 className='asca-ac__subhead'>정규 커리큘럼</h3>
      <div className='asca-ac__tracks'>
        {CURRICULUM.map(track => (
          <article key={track.title} className='asca-ac__track'>
            <header className='asca-ac__track-head'>
              <h4 className='asca-ac__track-title'>{track.title}</h4>
              <p className='asca-ac__track-en'>{track.titleEn}</p>
            </header>
            {track.levels.map((level, index) => (
              <div key={level.label} className='asca-ac__level'>
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
