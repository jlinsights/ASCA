import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CAREER = [
  '동양철학박사',
  '원광대 서예문화학과 동양학대학원 강사 및 초빙교수 역임',
  '조선대학교 철학과 강사 역임',
  '송제인문학연구소 수석연구원',
  '세종한글큰뜻모임 이사',
  '아남서예심리치료연구소 소장',
  '전주시 평생교육원 인문학 강사',
  '대한검정회 한자한문교사 중앙연수원 전임교수',
  '개인전 및 초대전 6회',
  '프랑스 앙지엥데뱅 미술관 / 캐나다 온타리오 미술관 초대전',
]

const ARTWORKS = [
  {
    src: '/images/artworks/nakjiron-baeogyeong.avif',
    alt: '낙지론 - 아남 배옥영',
  },
  {
    src: '/images/artworks/cheoktang-baeogyeong.avif',
    alt: '척탕 - 아남 배옥영',
  },
  {
    src: '/images/artworks/cheonjibubudo-baeogyeong.jpg',
    alt: '천지부부도덕가 - 아남 배옥영',
  },
  {
    src: '/images/artworks/hoenggan-baeogyeong.jpg',
    alt: '횡간 - 아남 배옥영',
  },
  {
    src: '/images/artworks/toepilyeosan-baeogyeong.jpg',
    alt: '퇴필여산 - 아남 배옥영',
  },
]

const VIDEOS = [
  {
    id: 'Ii1Ui2UL8m4',
    title: '콜로키움 25회 서예 4부 1강 배옥영',
  },
  {
    id: 'YZIbtwOHU8k',
    title: 'STB콜로키움 19회 문자와 커뮤니케이션1 배옥영 교수',
  },
]

export function InstructorAnam() {
  return (
    <div className='space-y-6'>
      {/* Profile Header */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row items-start gap-4'>
            <div className='shrink-0'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src='/images/artists/baeogyeong.png'
                alt='아남 배옥영'
                className='w-24 h-24 rounded-lg object-cover border'
                loading='lazy'
              />
            </div>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <h3 className='text-xl font-bold'>아남 배 옥 영</h3>
                <Badge variant='outline' className='text-xs'>
                  심사위원장
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                동양서예대전 심사위원장 / 대한검정회 전임교수
              </p>
              <ul className='space-y-1'>
                {CAREER.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-scholar-red"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artworks */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
        {ARTWORKS.map(artwork => (
          <Card key={artwork.alt} className='overflow-hidden'>
            <CardContent className='p-0'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.src}
                alt={artwork.alt}
                className='w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-500'
                loading='lazy'
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Videos */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {VIDEOS.map(video => (
          <Card key={video.id} className='overflow-hidden'>
            <CardContent className='p-0'>
              <div className='relative w-full' style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                  className='absolute inset-0 w-full h-full'
                  allow='autoplay; encrypted-media'
                  allowFullScreen
                  title={video.title}
                  loading='lazy'
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
