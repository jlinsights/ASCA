import { ANAM } from './academy-data'

/** 지도 교수 — 초상과 직함을 세우고, 약력·전시·활동을 세 칸 장부로. 아래에 작품 띠와 강의 영상 */
export function InstructorAnam() {
  return (
    <article className='asca-ac__teacher' aria-labelledby='ac-teacher'>
      <header className='asca-ac__teacher-head'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ANAM.portrait}
          alt=''
          width={112}
          height={112}
          className='asca-ac__teacher-portrait'
          loading='lazy'
          decoding='async'
        />
        <div>
          <p className='asca-ac__eyebrow'>지도 교수</p>
          <h3 id='ac-teacher' className='asca-ac__teacher-name'>
            {ANAM.name}
          </h3>
          <p className='asca-ac__teacher-role'>
            {ANAM.title}
            <span aria-hidden='true'> · </span>
            {ANAM.role}
          </p>
        </div>
      </header>

      <div className='asca-ac__teacher-grid'>
        <div>
          <h4 className='asca-ac__subhead'>약력</h4>
          <ul className='asca-ac__dash-list'>
            {ANAM.career.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='asca-ac__subhead'>전시</h4>
          <ul className='asca-ac__dash-list'>
            {ANAM.exhibitions.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='asca-ac__subhead'>활동</h4>
          <ul className='asca-ac__tags'>
            {ANAM.activities.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <ul className='asca-ac__works' aria-label={`${ANAM.name} 작품`}>
        {ANAM.artworks.map(work => (
          <li key={work.src}>
            <figure className='asca-ac__work'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={work.src}
                alt={`${work.title} — ${ANAM.name}`}
                loading='lazy'
                decoding='async'
              />
              <figcaption>{work.title}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className='asca-ac__videos'>
        {ANAM.videos.map(video => (
          <figure key={video.id} className='asca-ac__video'>
            <div className='asca-ac__video-frame'>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
                title={`${video.title} — ${ANAM.name}`}
                allow='encrypted-media; picture-in-picture'
                allowFullScreen
                loading='lazy'
              />
            </div>
            <figcaption>{video.title}</figcaption>
          </figure>
        ))}
      </div>
    </article>
  )
}
