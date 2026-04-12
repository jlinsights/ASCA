'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const koreanGreeting = `존경하는 사단법인 동양서예협회 회원 여러분,

2026년 병오년(丙午年) 새해 벽두, 차가운 겨울바람 속에서도 묵향에 대한 열정으로 심신을 갈고닦으시는 회원 여러분께 깊은 존경과 감사의 인사를 올립니다.

한겨울의 추위 속에서 매화가 향기를 준비하듯, 우리 협회 또한 새로운 도약을 위한 힘찬 발걸음을 내딛고자 합니다.

지난해 우리는 전통과 현대라는 이원화된 초대작가 제도를 안착시키며 온고지신(溫故知新)의 길을 확고히 다졌습니다. 올해는 이를 발판 삼아 우리 협회의 위상을 국내외에 더욱 널리 알리는 한편, 내실 있고 투명한 운영 시스템을 구축하는 원년으로 삼고자 합니다.

그 첫 여정으로, 다가오는 2월 27일부터 3월 2일까지 3박 4일간 중국 소흥과 항주로 '서예 인문학 탐방'을 떠납니다. 특히 중국 서예 교육의 본산인 중국미술학원(남산 교구)에서 "한묵전정·중한화명(翰墨传情·中韩和鸣)"이라는 주제 아래 양국 작가들이 필묵으로 소통하는 특별한 자리를 마련했습니다.
한·중 서예의 미래를 밝히는 이 소중한 교류는 우리 협회의 국제적 지평을 넓히는 계기가 될 것입니다.

이어지는 4월 15일부터 28일까지는 예술의전당 서울서예박물관에서 '書境(서경) 새로운 지평 - 동양서예의 현재와 미래' 특별 기획전이 개최됩니다. 이번 전시는 개인전과 소규모 단체의 연합전이 어우러지는 통합의 장입니다. 협회 회원 여부를 떠나 누구나 참여 가능한 전시회이오니 설 연휴 이전까지 서둘러 출품하여 주시기 바랍니다.

새롭게 공표된 '운영 및 심사 규정'과 '전시 관리 및 운영 규정'을 바탕으로, 회원 작가뿐만 아니라 외부의 역량 있는 작가들을 적극 영입하여 협회의 예술적 스펙트럼을 확장하겠습니다.

또한 전시의 혜택과 경제성을 투명하게 보장하는 시스템을 통해 매년 예술의전당에서 실험적이면서도 품격 있는 전시 경험을 제공할 것입니다.
무엇보다 올해부터는 새롭게 개정된 '회원 및 회비 규정'에 따라 '평생회원' 제도를 전격 시행합니다. 이는 협회 운영의 기초를 더욱 단단히 다지는 계기가 될 것입니다.

아울러 연회비 제도의 합리적 현실화를 통해 그동안 협회에 헌신해 오신 초대작가님들과 임원진의 부담을 덜어드리고, 진정으로 예술에만 전념할 수 있는 환경을 조성해 나가겠습니다.

마지막으로, 대한민국 동양서예대전(공모전)과 초대작가전은 더욱 깊이 있는 준비를 위해 올해부터 10월에서 11월 이후로 일정을 조정하였습니다.

만추의 결실처럼 회원 여러분의 성취가 가장 빛나는 시기에 최고의 축제를 열 수 있도록 만반의 준비를 다하겠습니다.

법고창신(法古創新)의 정신으로 우리 서예의 전통을 지키되, 투명하고 합리적인 혁신으로 동양 문자예술의 새로운 지평을 함께 열어갑시다.

회원 여러분의 가정에 늘 평안과 행복이 깃들고, 묵향 가득한 창작의 기쁨이 1년 내내 이어지기를 진심으로 기원합니다.

2026년 1월 9일

사단법인 동양서예협회 이사장 임재홍`

const englishGreeting = `Dear Members of the Asian Society of Calligraphic Arts (ASCA),

At the dawn of 2026, the Year of the Fire Horse (Byeongo, 丙午年), I extend my deepest respect and gratitude to all of you who continue to sharpen your craft with passion for the art of ink, even amidst the cold winter winds.

Just as the plum blossom prepares its fragrance in the depths of winter, our association is also taking bold steps toward a new leap forward.

Last year, we successfully established a dual invited artist system that embraces both tradition and modernity, firmly paving the way of Ongojishin (溫故知新) — learning from the old to create the new. This year, building on that foundation, we aim to elevate ASCA's stature both domestically and internationally, while establishing a substantive and transparent operational framework.

As our first journey of the year, from February 27 to March 2, we will embark on a four-day "Calligraphy Humanities Exploration" trip to Shaoxing and Hangzhou, China. At the China Academy of Art (Nanshan Campus), we have arranged a special gathering under the theme "Hanmok Jeonjeong · Junghan Hwamyeong (翰墨传情·中韩和鸣)," where artists from both nations will communicate through brush and ink.

From April 15 to 28, a special exhibition titled "Seogyeong (書境): New Horizons — The Present and Future of Oriental Calligraphy" will be held at the Seoul Calligraphy Museum in the Seoul Arts Center. This exhibition is an integrated platform where solo exhibitions and small-group collaborative exhibitions come together. We welcome participation from all, regardless of ASCA membership.

This year, we are fully implementing the newly revised "Lifetime Membership" system, which will further strengthen the foundation of our association's operations. We have also adjusted the schedule for the Korea Oriental Calligraphy Exhibition (Competition) and Invited Artists' Exhibition from October to November onwards, to allow for more thorough preparation.

In the spirit of Beopgochang-shin (法古創新) — preserving tradition while creating innovation — let us together open new horizons for the art of Eastern calligraphy through transparent and rational reform.

I sincerely wish that peace and happiness always dwell in the homes of all our members, and that the joy of creation, filled with the fragrance of ink, continues throughout the year.

January 9, 2026

Lim Jae-hong, Chairman of the Asian Society of Calligraphic Arts (ASCA)`

export function GreetingsTabs() {
  return (
    <Tabs defaultValue='ko' className='w-full'>
      <TabsList className='mb-8'>
        <TabsTrigger value='ko'>한국어</TabsTrigger>
        <TabsTrigger value='en'>English</TabsTrigger>
      </TabsList>

      <TabsContent value='ko'>
        <article className='prose prose-lg dark:prose-invert max-w-none'>
          <h2 className='text-2xl font-bold mb-6'>이사장 인사말씀</h2>
          {koreanGreeting.split('\n\n').map((paragraph, index) => (
            <p key={index} className='leading-relaxed text-foreground/90'>
              {paragraph}
            </p>
          ))}
        </article>
      </TabsContent>

      <TabsContent value='en'>
        <article className='prose prose-lg dark:prose-invert max-w-none'>
          <h2 className='text-2xl font-bold mb-6'>Greetings from the Chairman</h2>
          {englishGreeting.split('\n\n').map((paragraph, index) => (
            <p key={index} className='leading-relaxed text-foreground/90'>
              {paragraph}
            </p>
          ))}
        </article>
      </TabsContent>

      <p className='mt-12 text-sm text-muted-foreground text-center italic'>
        다른 언어 버전은 준비 중입니다.
      </p>
    </Tabs>
  )
}
