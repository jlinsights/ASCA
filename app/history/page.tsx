import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Award, Users, Building2, Landmark } from 'lucide-react'

export const metadata: Metadata = {
  title: '연혁 | 동양서예협회',
  description:
    '사단법인 동양서예협회의 연혁을 소개합니다. 1997년 한·중·일 서예문화교류연합회전을 시작으로 현재까지의 주요 활동과 전시 이력을 확인하실 수 있습니다.',
  openGraph: {
    title: '연혁 | 동양서예협회',
    description: '1997년부터 이어온 동양서예협회의 역사와 주요 활동을 소개합니다.',
  },
}

type HistoryEvent = {
  id: string
  year: number
  month: number
  title: string
  subtitle?: string
  venue?: string
  date?: string
  type: 'exhibition' | 'event' | 'milestone' | 'appointment'
}

const historyEvents: HistoryEvent[] = [
  {
    id: '2025-11',
    year: 2025,
    month: 11,
    title: '2025 임시총회',
    venue: '예술가의집 | Artist House (Arts Council Korea)',
    date: '2025년 11월 27일(토) 오후 1시 ~ 7시',
    type: 'event',
  },
  {
    id: '2025-6',
    year: 2025,
    month: 6,
    title: '第22回 大韓民國 東洋書藝大展',
    subtitle: '第22回 韓·中 東洋書藝招待作家展',
    venue: '인사동 한국미술관',
    date: '2025년 6월 18일(수) ~ 6월 24일(화)',
    type: 'exhibition',
  },
  {
    id: '2025-4',
    year: 2025,
    month: 4,
    title: '大韓民國 東洋書藝大展 現場揮毫 審査大會',
    subtitle: '大韓民國 東洋書藝大展 審査・運營 委員會',
    venue: '예술가의집 | Artist House (Arts Council Korea)',
    date: '2025년 4월 19일(토) | 2025년 4월 26일(토)',
    type: 'event',
  },
  {
    id: '2025-2a',
    year: 2025,
    month: 2,
    title: '2025 신임 임원 위촉식 및 초대작가증 수여식',
    venue: '예술가의집 | Artist House (Arts Council Korea)',
    date: '2025년 2월 8일(토) 오후 1시 ~ 4시',
    type: 'event',
  },
  {
    id: '2025-2b',
    year: 2025,
    month: 2,
    title: '2025 정기이사회',
    venue: '예술가의집 | Artist House (Arts Council Korea)',
    date: '2025년 2월 8일(토) 오후 1시 ~ 4시',
    type: 'event',
  },
  {
    id: '2024-10a',
    year: 2024,
    month: 10,
    title: '2024 신임 임원 위촉식 및 초대작가증 수여식',
    venue: '예술가의집 | Artist House (Arts Council Korea)',
    date: '2024년 10월 18일(금) 오후 1시 ~ 4시',
    type: 'event',
  },
  {
    id: '2024-10b',
    year: 2024,
    month: 10,
    title: '2024 임시총회',
    venue: '예술가의집 | Artist House (Arts Council Korea)',
    date: '2024년 10월 18일(금) 오후 1시 ~ 4시',
    type: 'event',
  },
  {
    id: '2024-9',
    year: 2024,
    month: 9,
    title: '第21回 大韓民國 東洋書藝大展',
    subtitle: '第21回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2024년 8월 31일(일) ~ 2024년 9월 8일(일)',
    type: 'exhibition',
  },
  {
    id: '2024-8',
    year: 2024,
    month: 8,
    title: '2024 대한민국 동양서예대전 휘호대회',
    subtitle: '사단법인 동양서예협회 임원위촉 수여식',
    date: '2024년 8월 3일',
    type: 'event',
  },
  {
    id: '2024-1',
    year: 2024,
    month: 1,
    title: '2024 정기총회',
    date: '2024년 1월 13일',
    type: 'event',
  },
  {
    id: '2023-10',
    year: 2023,
    month: 10,
    title: '第3期 社團法人 東洋書藝協會',
    subtitle: '임재홍 이사장 취임',
    date: '2023년 10월 1일',
    type: 'appointment',
  },
  {
    id: '2023-5',
    year: 2023,
    month: 5,
    title: '第20回 大韓民國 東洋書藝大展',
    subtitle: '第20回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2023년 5월 31일(금) ~ 2023년 6월 10일(토)',
    type: 'exhibition',
  },
  {
    id: '2022-7',
    year: 2022,
    month: 7,
    title: '第19回 大韓民國 東洋書藝大展',
    subtitle: '第19回 韓·中·日 東洋書藝招待作家展',
    venue: '인사동 한국미술관 3층 전관',
    date: '2022년 7월 20일 ~ 2022년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2021-7',
    year: 2021,
    month: 7,
    title: '第18回 大韓民國 東洋書藝大展',
    subtitle: '第18回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2021년 7월 30일 ~ 2021년 8월 8일',
    type: 'exhibition',
  },
  {
    id: '2020-10',
    year: 2020,
    month: 10,
    title: '第17回 大韓民國 東洋書藝大展',
    subtitle:
      '第17回 韓·中·日 東洋書藝招待作家展 / 韓·中·日 共通漢字 808字 出版 紀念展 / 惺谷 林炫圻 傘壽展',
    venue: '예술의전당 서울서예박물관',
    date: '2020년 10월 10일 ~ 10월 20일 (코로나19로 인터넷 전시 대체)',
    type: 'exhibition',
  },
  {
    id: '2019-7',
    year: 2019,
    month: 7,
    title: '第16回 大韓民國 東洋書藝大展',
    subtitle: '第16回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2019년 7월 3일 ~ 2019년 7월 10일',
    type: 'exhibition',
  },
  {
    id: '2018-7',
    year: 2018,
    month: 7,
    title: '第15回 大韓民國 東洋書藝大展',
    subtitle: '第15回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2018년 7월 20일 ~ 2018년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2017-7',
    year: 2017,
    month: 7,
    title: '第14回 大韓民國 東洋書藝大展',
    subtitle: '第14回 韓·中·日 東洋書藝招待作家展',
    venue: '인사동 한국미술관 3층 전관',
    date: '2017년 7월 20일 ~ 2017년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2017-2',
    year: 2017,
    month: 2,
    title: '第2期 社團法人 東洋書藝協會',
    subtitle: '惺谷 林炫圻 理事長 就任',
    date: '2017년 2월 22일',
    type: 'appointment',
  },
  {
    id: '2016-12',
    year: 2016,
    month: 12,
    title: '韓·中·日 臺灣國際書藝展',
    venue: '진천군립생거판화미술관',
    date: '2016년 12월 6일 ~ 2016년 12월 18일',
    type: 'exhibition',
  },
  {
    id: '2016-7',
    year: 2016,
    month: 7,
    title: '第13回 大韓民國 東洋書藝大展',
    subtitle: '第13回 韓·中·日 東洋書藝招待作家展',
    venue: '인사동 한국미술관 3층 전관',
    date: '2016년 7월 20일 ~ 2016년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2015-7',
    year: 2015,
    month: 7,
    title: '第12回 大韓民國 東洋書藝大展',
    subtitle: '第12回 韓·中·日 東洋書藝招待作家展',
    venue: '인사동 한국미술관 3층 전관',
    date: '2015년 7월 20일 ~ 2015년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2014-7',
    year: 2014,
    month: 7,
    title: '第11回 大韓民國 東洋書藝大展',
    subtitle: '第11回 韓·中·日 東洋書藝招待作家展',
    venue: '인사동 한국미술관 3층 전관',
    date: '2014년 7월 20일 ~ 2014년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2013-7',
    year: 2013,
    month: 7,
    title: '第10回 大韓民國 東洋書藝大展',
    subtitle: '第10回 韓·中·日 東洋書藝招待作家展',
    venue: '인사동 한국미술관 3층 전관',
    date: '2013년 7월 20일 ~ 2013년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2012-10',
    year: 2012,
    month: 10,
    title: '社團法人 東洋書藝協會 法人 設立 許可',
    subtitle: '惺谷 林炫圻 初代 理事長 就任',
    venue: '문화체육관광부',
    date: '2012년 10월 29일',
    type: 'milestone',
  },
  {
    id: '2012-7',
    year: 2012,
    month: 7,
    title: '第9回 大韓民國 東洋書藝大展',
    subtitle: '第9回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2012년 7월 20일 ~ 2012년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2012-4',
    year: 2012,
    month: 4,
    title: '韓·日 書藝二人展',
    venue: '일본 오사카 시립미술관',
    date: '2012년 4월 9일',
    type: 'exhibition',
  },
  {
    id: '2011-7',
    year: 2011,
    month: 7,
    title: '第8回 大韓民國 東洋書藝大展',
    subtitle: '第8回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2011년 7월 20일 ~ 2011년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2010-11',
    year: 2010,
    month: 11,
    title: '韓·日 書藝 兩人展',
    venue: '예술의전당 서울서예박물관',
    date: '2010년 11월 22일 ~ 2010년 11월 30일',
    type: 'exhibition',
  },
  {
    id: '2010-7',
    year: 2010,
    month: 7,
    title: '第7回 大韓民國 東洋書藝大展',
    subtitle: '第7回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2010년 7월 20일 ~ 2010년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2009-7',
    year: 2009,
    month: 7,
    title: '第6回 大韓民國 東洋書藝大展',
    subtitle: '第6回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2009년 7월 20일 ~ 2009년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2008-7',
    year: 2008,
    month: 7,
    title: '第5回 大韓民國 東洋書藝大展',
    subtitle: '第5回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2008년 7월 20일 ~ 2008년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2007-7',
    year: 2007,
    month: 7,
    title: '第4回 大韓民國 東洋書藝大展',
    subtitle: '第4回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2007년 7월 20일 ~ 2007년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2006-7',
    year: 2006,
    month: 7,
    title: '第3回 大韓民國 東洋書藝大展',
    subtitle: '第3回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2006년 7월 20일 ~ 2006년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2005-7',
    year: 2005,
    month: 7,
    title: '第2回 大韓民國 東洋書藝大展',
    subtitle: '第2回 韓·中·日 東洋書藝招待作家展',
    venue: '예술의전당 서울서예박물관',
    date: '2005년 7월 20일 ~ 2005년 7월 26일',
    type: 'exhibition',
  },
  {
    id: '2001-4',
    year: 2001,
    month: 4,
    title: '第1回 大韓民國 東洋書藝大展',
    subtitle: '第1回 韓·中·日 東洋書藝招待作家展 / 惺谷 林炫圻 回甲紀念展',
    venue: '예술의전당 서울서예박물관',
    date: '2001년 4월 17일 ~ 2001년 4월 23일',
    type: 'exhibition',
  },
  {
    id: '2000-7',
    year: 2000,
    month: 7,
    title: '韓·中·日 書藝文化交流協會',
    subtitle: '惺谷 林炫圻 運營委員長 被命',
    date: '2000년 7월 30일',
    type: 'appointment',
  },
  {
    id: '1998-10',
    year: 1998,
    month: 10,
    title: '韓·中·日 書藝文化交流展',
    venue: '일본 동경 문화센터',
    date: '1998년 10월 20일 ~ 1998년 10월 22일',
    type: 'exhibition',
  },
  {
    id: '1998-5',
    year: 1998,
    month: 5,
    title: '韓·中·日 東洋國際書藝展',
    venue: '세종문화회관',
    date: '1998년 5월 30일 ~ 1998년 6월 2일',
    type: 'exhibition',
  },
  {
    id: '1997-9',
    year: 1997,
    month: 9,
    title: '韓·中·日 書藝文化交流聯合會展',
    venue: '서울, 북경, 서안 역사 박물관',
    date: '1997년 9월',
    type: 'exhibition',
  },
]

const typeConfig = {
  exhibition: {
    label: '전시',
    icon: Award,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  event: {
    label: '행사',
    icon: Calendar,
    color: 'bg-green-500/10 text-green-600 border-green-200',
  },
  milestone: {
    label: '이정표',
    icon: Landmark,
    color: 'bg-scholar-red/10 text-scholar-red border-scholar-red/20',
  },
  appointment: {
    label: '취임',
    icon: Users,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
  },
} as const

function groupByYear(events: HistoryEvent[]) {
  const groups: Record<number, HistoryEvent[]> = {}
  for (const event of events) {
    const yearEvents = groups[event.year]
    if (!yearEvents) {
      groups[event.year] = [event]
    } else {
      yearEvents.push(event)
    }
  }
  return Object.entries(groups)
    .map(([year, events]) => ({ year: Number(year), events }))
    .sort((a, b) => b.year - a.year)
}

export default function HistoryPage() {
  const yearGroups = groupByYear(historyEvents)

  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            History
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>연 혁</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            1997년 韓·中·日 書藝文化交流聯合會展을 시작으로, 동양서예의 전통을 계승하고 발전시켜 온
            협회의 발자취를 소개합니다.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-4xl mx-auto'>
          {yearGroups.map(({ year, events }) => (
            <div key={year} className='mb-12'>
              <div className='sticky top-4 z-10 mb-6'>
                <Badge
                  variant='outline'
                  className='text-lg font-bold px-4 py-1.5 bg-background border-scholar-red/30 text-scholar-red'
                >
                  {year}
                </Badge>
              </div>

              <div className='relative pl-8 border-l-2 border-muted-foreground/20 space-y-4'>
                {events.map(event => {
                  const config = typeConfig[event.type]
                  const Icon = config.icon

                  return (
                    <div key={event.id} className='relative'>
                      <div className='absolute -left-[calc(2rem+5px)] top-4 w-3 h-3 rounded-full bg-scholar-red border-2 border-background' />

                      <Card className='transition-shadow hover:shadow-md'>
                        <CardContent className='p-5'>
                          <div className='flex flex-wrap items-center gap-2 mb-2'>
                            <Badge variant='outline' className={`text-xs ${config.color}`}>
                              <Icon className='w-3 h-3 mr-1' />
                              {config.label}
                            </Badge>
                          </div>

                          <h3 className='text-base font-semibold mb-1'>{event.title}</h3>
                          {event.subtitle && (
                            <p className='text-sm text-muted-foreground mb-2'>{event.subtitle}</p>
                          )}

                          <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                            {event.venue && (
                              <span className='flex items-center gap-1'>
                                <MapPin className='w-3 h-3' />
                                {event.venue}
                              </span>
                            )}
                            {event.date && (
                              <span className='flex items-center gap-1'>
                                <Calendar className='w-3 h-3' />
                                {event.date}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className='text-center py-8'>
            <div className='inline-flex items-center gap-2 text-muted-foreground'>
              <Building2 className='w-5 h-5' />
              <span className='text-sm'>1997년부터 이어온 동양서예의 전통과 역사</span>
            </div>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
