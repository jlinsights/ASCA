'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ValueItem {
  title: string
  description: string
}

interface ObjectiveItem {
  title: string
  description: string
}

const koreanContent = {
  missionStatement:
    '동양서예협회는 동아시아 서예(한국 書藝, 중국 書法, 일본 書道)의 전통을 계승하고 현대적 가치를 창출하는 전문 예술문화기관입니다. 정법(正法)의 계승과 창신(創新)의 조화를 통해 동양 문자예술의 새로운 지평을 열어갑니다.',
  coreValues: [
    {
      title: '통합과 혁신',
      description:
        '전통 서예의 정수를 보존하면서도, 현대적 기법과 매체를 적극 수용하여 서예 예술의 외연을 확장합니다. 이원화된 초대작가 제도를 통해 전통과 현대의 조화로운 공존을 추구합니다.',
    },
    {
      title: '전통과 창조',
      description:
        '법고창신(法古創新)의 정신으로 수천 년 이어져 온 동양 서예의 정법을 존중하되, 새 시대에 맞는 창의적 표현과 혁신적 접근을 장려합니다.',
    },
    {
      title: '포용과 소통',
      description:
        '한국, 중국, 일본의 서예 전통을 아우르며, 국경과 세대를 초월한 예술적 교류와 소통의 장을 만들어갑니다. 회원 자격에 관계없이 열린 참여를 지향합니다.',
    },
  ] as ValueItem[],
  objectives: [
    {
      title: '교육 발전',
      description:
        '체계적인 서예 교육 프로그램 운영, 아카데미 강좌 제공, 차세대 서예 인재 양성을 통해 서예 문화의 지속 가능한 발전을 도모합니다.',
    },
    {
      title: '문화 확산',
      description:
        '정기 전시회, 국제 교류전, 서예 인문학 탐방 등 다양한 문화 행사를 통해 동양 서예의 아름다움과 가치를 널리 알립니다.',
    },
    {
      title: '디지털 혁신',
      description:
        '온라인 갤러리, 디지털 아카이브, 웹 기반 소통 플랫폼을 구축하여 서예 예술의 접근성을 높이고 글로벌 교류를 촉진합니다.',
    },
    {
      title: '학술 연구',
      description:
        '동양 서예의 역사, 미학, 기법에 대한 학술 연구를 지원하고, 세미나·학술 대회를 통해 서예 분야의 지적 담론을 활성화합니다.',
    },
  ] as ObjectiveItem[],
}

const englishContent = {
  missionStatement:
    'The Asian Society of Calligraphic Arts (ASCA) is a professional art and cultural organization dedicated to inheriting the traditions of East Asian calligraphy — Korean Seoyae (書藝), Chinese Shufa (書法), and Japanese Shodō (書道) — while creating contemporary value. Through the harmony of inheriting the Orthodox Way (正法) and realizing Creative Innovation (創新), we open new horizons for the art of Eastern calligraphy.',
  coreValues: [
    {
      title: 'Integration & Innovation',
      description:
        'While preserving the essence of traditional calligraphy, we actively embrace modern techniques and media to expand the scope of calligraphic art. Through a dual invited artist system, we pursue harmonious coexistence of tradition and modernity.',
    },
    {
      title: 'Tradition & Creation',
      description:
        'In the spirit of Beopgochang-shin (法古創新), we respect the orthodox methods of East Asian calligraphy that have been passed down for thousands of years, while encouraging creative expression and innovative approaches suited to the new era.',
    },
    {
      title: 'Inclusivity & Communication',
      description:
        'Encompassing the calligraphic traditions of Korea, China, and Japan, we create spaces for artistic exchange and communication that transcend borders and generations. We aim for open participation regardless of membership status.',
    },
  ] as ValueItem[],
  objectives: [
    {
      title: 'Education Development',
      description:
        'We promote the sustainable development of calligraphic culture through systematic calligraphy education programs, academy courses, and nurturing next-generation calligraphy talent.',
    },
    {
      title: 'Cultural Dissemination',
      description:
        'Through various cultural events including regular exhibitions, international exchange exhibitions, and calligraphy humanities explorations, we widely promote the beauty and value of Oriental calligraphy.',
    },
    {
      title: 'Digital Innovation',
      description:
        'By building online galleries, digital archives, and web-based communication platforms, we enhance accessibility to calligraphic art and promote global exchange.',
    },
    {
      title: 'Academic Research',
      description:
        'We support academic research on the history, aesthetics, and techniques of Oriental calligraphy, and revitalize intellectual discourse in the calligraphy field through seminars and academic conferences.',
    },
  ] as ObjectiveItem[],
}

function ValuesGrid({ values }: { values: ValueItem[] }) {
  return (
    <div className='grid gap-6 md:grid-cols-3'>
      {values.map(value => (
        <Card key={value.title}>
          <CardHeader>
            <CardTitle className='text-lg'>{value.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground leading-relaxed'>{value.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ObjectivesGrid({ objectives }: { objectives: ObjectiveItem[] }) {
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      {objectives.map(objective => (
        <Card key={objective.title}>
          <CardHeader>
            <CardTitle className='text-lg'>{objective.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground leading-relaxed'>{objective.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function MissionTabs() {
  return (
    <Tabs defaultValue='ko' className='w-full'>
      <TabsList className='mb-8'>
        <TabsTrigger value='ko'>한국어</TabsTrigger>
        <TabsTrigger value='en'>English</TabsTrigger>
      </TabsList>

      <TabsContent value='ko' className='space-y-12'>
        <section>
          <h2 className='text-2xl font-bold mb-4'>사명 선언</h2>
          <p className='text-lg leading-relaxed text-foreground/90'>
            {koreanContent.missionStatement}
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-bold mb-6'>핵심 가치</h2>
          <ValuesGrid values={koreanContent.coreValues} />
        </section>

        <section>
          <h2 className='text-2xl font-bold mb-6'>주요 목표</h2>
          <ObjectivesGrid objectives={koreanContent.objectives} />
        </section>
      </TabsContent>

      <TabsContent value='en' className='space-y-12'>
        <section>
          <h2 className='text-2xl font-bold mb-4'>Mission Statement</h2>
          <p className='text-lg leading-relaxed text-foreground/90'>
            {englishContent.missionStatement}
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-bold mb-6'>Core Values</h2>
          <ValuesGrid values={englishContent.coreValues} />
        </section>

        <section>
          <h2 className='text-2xl font-bold mb-6'>Key Objectives</h2>
          <ObjectivesGrid objectives={englishContent.objectives} />
        </section>
      </TabsContent>
    </Tabs>
  )
}
