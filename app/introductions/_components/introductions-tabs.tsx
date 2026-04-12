'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { FileDown } from 'lucide-react'

const koreanIntro = `동양서예협회에 참여하신 여러분, 환영합니다!

사단법인 동양서예협회(ASCA)는 한국, 중국, 일본을 잇는 동양 서예의 전통을 존중하고 계승하면서, 동시에 현대적 표현의 가능성을 열어가는 전문 예술문화기관입니다.

우리 협회는 동아시아 각국의 고유한 서예 전통에 대한 깊은 이해를 바탕으로, 서예 예술가와 애호가를 연결하는 가교 역할을 수행합니다. 한국의 서예(書藝), 중국의 서법(書法), 일본의 서도(書道)가 지닌 각기 다른 미학과 철학을 존중하면서도, 이를 관통하는 동양 문자예술의 보편적 아름다움을 탐구합니다.

협회는 정기적인 전시회 개최, 학술 세미나, 워크숍, 그리고 국제 교류 프로그램을 통해 서예 문화의 대중화와 전문화를 동시에 추구합니다. 전통의 우아함과 현대의 도전을 결합하여, 동양 서예가 새로운 시대에도 그 생명력을 유지하고 발전할 수 있도록 노력하고 있습니다.

正法의 계승 발전과 創新의 조화로운 구현 — 이것이 우리 동양서예협회가 추구하는 핵심 가치입니다.

여러분의 참여와 관심이 동양 서예 문화의 미래를 밝히는 소중한 빛이 됩니다.

2025년 2월 5일

사단법인 동양서예협회 명예이사장 성곡 임 현 기 拜`

const englishIntro = `Welcome to the Asian Society of Calligraphic Arts (ASCA)!

ASCA is a professional art and cultural organization dedicated to respecting and inheriting the traditions of East Asian calligraphy spanning Korea, China, and Japan, while simultaneously opening new possibilities for contemporary expression.

Our association serves as a bridge connecting calligraphic artists and enthusiasts, built upon a deep understanding of each East Asian country's unique calligraphic traditions. We respect the distinct aesthetics and philosophies of Korean Seoyae (書藝), Chinese Shufa (書法), and Japanese Shodō (書道), while exploring the universal beauty of Eastern character art that flows through them all.

Through regular exhibitions, academic seminars, workshops, and international exchange programs, ASCA pursues both the popularization and professionalization of calligraphic culture. By combining the elegance of tradition with the challenges of contemporary times, we strive to ensure that Oriental calligraphy maintains its vitality and continues to develop in a new era.

"Inheriting and advancing the Orthodox Way (正法) while harmoniously realizing Creative Innovation (創新)" — this is the core value that ASCA pursues.

Your participation and interest become a precious light illuminating the future of East Asian calligraphic culture.

February 5, 2025

Lim Hyun-gi (Seong-gok), Honorary Chairman of the Asian Society of Calligraphic Arts (ASCA)`

const BROCHURE_KO =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/소개자료/동양서예협회%20-%20The%20Asian%20Society%20of%20Calligraphic%20Arts%20(ASCA).pdf'
const BROCHURE_MULTI =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/소개자료/동양서예협회%20소개_한국어%20영어%20중국어%20일본어_PDF.pdf'

export function IntroductionsTabs() {
  return (
    <div className='space-y-10'>
      <Tabs defaultValue='ko' className='w-full'>
        <TabsList className='mb-8'>
          <TabsTrigger value='ko'>한국어</TabsTrigger>
          <TabsTrigger value='en'>English</TabsTrigger>
        </TabsList>

        <TabsContent value='ko'>
          <article className='prose prose-lg dark:prose-invert max-w-none'>
            <h2 className='text-2xl font-bold mb-6'>명예이사장 소개글</h2>
            {koreanIntro.split('\n\n').map((paragraph, index) => (
              <p key={index} className='leading-relaxed text-foreground/90'>
                {paragraph}
              </p>
            ))}
          </article>
        </TabsContent>

        <TabsContent value='en'>
          <article className='prose prose-lg dark:prose-invert max-w-none'>
            <h2 className='text-2xl font-bold mb-6'>Message from the Honorary Chairman</h2>
            {englishIntro.split('\n\n').map((paragraph, index) => (
              <p key={index} className='leading-relaxed text-foreground/90'>
                {paragraph}
              </p>
            ))}
          </article>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className='pt-6'>
          <h3 className='text-lg font-semibold mb-4'>소개 자료 다운로드</h3>
          <div className='flex flex-col sm:flex-row gap-4'>
            <a
              href={BROCHURE_KO}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-md bg-scholar-red px-4 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
            >
              <FileDown className='h-4 w-4' />
              협회 소개 브로셔 (한국어)
            </a>
            <a
              href={BROCHURE_MULTI}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-md border border-scholar-red px-4 py-2.5 text-sm font-medium text-scholar-red hover:bg-scholar-red/10 transition-colors'
            >
              <FileDown className='h-4 w-4' />
              소개 브로셔 (한·영·중·일)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
