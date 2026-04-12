import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CURRICULUM_CARDS, SUBJECTS } from './academy-data'

export function AcademyIntro() {
  return (
    <div id='academy-intro' className='scroll-mt-24 space-y-12'>
      {/* Intro */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-3 mb-6'>
          <span className='inline-flex h-14 w-14 items-center justify-center rounded bg-scholar-red text-white text-2xl font-bold shadow-lg'>
            書
          </span>
          <span className='inline-flex h-14 w-14 items-center justify-center rounded bg-scholar-red text-white text-2xl font-bold shadow-lg'>
            畫
          </span>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>동양서화 아카데미</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          전통의 깊이와 현대의 감각을 잇는 체계적인 서예 교육
        </p>
      </div>

      {/* About */}
      <Card>
        <CardContent className='p-6 md:p-8 space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed'>
          <p>
            동양서예협회는{' '}
            <strong className='text-foreground'>&ldquo;한국적 서체개발 육성&rdquo;</strong> 및{' '}
            <strong className='text-foreground'>&ldquo;예술교육 및 서예정신 함양&rdquo;</strong>을
            위하여 협회 상임이사진의 공식 승인된 교육기관들에 한하여 엄선된 서예 강좌를 연결해
            드리고 있습니다.
          </p>
          <p>
            서예에 입문하시는 분들부터 전시회 응모를 준비하는 기존 회원님들까지,{' '}
            <strong className='text-foreground'>기초부터 중상급 실력자</strong>를 위한 단계별 강좌를
            지속적으로 확대해 나갈 계획입니다.
          </p>
          <p>
            현재 저희 협회는{' '}
            <span className='text-scholar-red font-medium'>
              사단법인 대한민국한자교육연구회 대한검정회
            </span>
            의 후원 하에{' '}
            <strong className='text-foreground'>한국한문한자교사중앙연수원 문원한문서예학원</strong>
            에서 서예 및 동양화 등의 교육을 위탁 운영하고 있습니다.
          </p>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div>
        <h3 className='text-xl font-bold mb-2 text-center'>
          古代法帖을 基準하여 書法理論 및 實技指導
        </h3>
        <p className='text-sm text-muted-foreground text-center mb-6'>
          입문부터 작가 양성까지 체계적인 교육과정을 제공합니다.
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {SUBJECTS.map(subject => (
            <Card key={subject.title} className='hover:border-scholar-red/30 transition-colors'>
              <CardContent className='p-4'>
                <h4 className='font-bold text-sm mb-1'>{subject.title}</h4>
                <p className='text-xs text-muted-foreground'>{subject.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Curriculum Cards */}
      <div>
        <h3 className='text-xl font-bold mb-6 text-center'>정규 커리큘럼</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {CURRICULUM_CARDS.map(card => (
            <Card
              key={card.title}
              className='hover:shadow-lg hover:border-scholar-red/30 transition-all'
            >
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-lg'>
                  {card.title}
                  <span className='text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded'>
                    {card.titleEn}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {card.levels.map(level => (
                  <div key={level.label}>
                    <h4 className='text-sm font-semibold text-scholar-red mb-2'>{level.label}</h4>
                    <ul className='space-y-1'>
                      {level.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground/50"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
