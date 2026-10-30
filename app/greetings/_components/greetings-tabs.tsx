'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { AboutChapter } from '@/components/about/about-layout'

const koreanGreeting = `존경하는 사단법인 동양서예협회 회원 여러분, 그리고 묵향을 사랑하시는 모든 작가 여러분,

깊어 가는 가을, 한 해의 결실을 거두는 이 계절에 협회가 오랫동안 준비해 온 소식을 전해 드리게 되어 기쁜 마음으로 인사를 올립니다.

제23회 대한민국 동양서예대전은 2027년 4월 21일부터 30일까지 예술의전당 서울서예박물관에서 열립니다. 이번 대전은 협회 역사에서 뜻깊은 전환점입니다. 서울서예박물관 제1전시실과 제2전시실을 모두 대관하여, 하나의 대전 안에 공모전과 '書境(서경)' 초대작가전·개인전·부스전을 함께 펼치게 되었기 때문입니다.

제2전시실에서는 공모전이 열려 새로운 작가를 발굴하는 무대가 되고, 제1전시실에서는 '서경' 초대작가전과 개인전, 단체 부스전이 어우러져 동양서예의 현재와 미래를 한자리에서 보여 드립니다. 신진 작가의 첫 출품작과 원로·중진 작가의 원숙한 필묵이 같은 기간, 같은 공간에서 마주하는 것, 이것이 이번 대전이 지향하는 '새로운 지평'입니다.

이번 대전을 준비하며 무엇보다 공을 들인 것은 문을 넓히는 일이었습니다.

먼저 청년작가의 참여 기회를 넓혔습니다. 대학 서예 전공자와 전국대학서예연합 소속·출신 청년작가의 출품을 적극 권장하고, 청년부에는 별도의 심사 기준을 두어 젊은 작가들이 자신의 목소리로 평가받을 수 있도록 하였습니다. 서예의 내일은 오늘 붓을 잡는 젊은 손에 달려 있다고 믿기 때문입니다.

다음으로 외부 작가에게도 초대작가전의 문을 열었습니다. 이번 회차에 신설한 특별규정에 따라, 협회 정회원이 아니더라도 실력을 갖춘 작가라면 '서경' 초대작가전에 참여할 수 있습니다. 추천·초대작가 선임 규정의 특별선임 절차도 함께 마련하였습니다. 역량 있는 작가들이 소속을 넘어 한자리에 모일 때 협회의 예술적 스펙트럼은 더욱 넓고 깊어질 것입니다.

아울러 개인전과 소규모 단체의 부스전을 대전 안에 품어, 작가 개인의 세계와 단체의 연구 성과를 품격 있는 공간에서 선보일 수 있게 하였습니다. 출품 접수부터 심사, 전시와 시상에 이르는 모든 과정은 새로 정비한 운영 및 심사 규정에 따라 투명하고 공정하게 진행하겠습니다.

출품 접수는 2027년 1월 31일에 마감합니다. 자세한 내용은 협회 홈페이지의 공모요강과 출품원서에서 확인하실 수 있습니다. 회원 여러분은 물론, 서예·문인화·전각을 수련하는 모든 분의 많은 관심과 참여를 부탁드립니다.

이와 함께 협회 홈페이지를 대대적으로 새롭게 단장하였습니다. 무엇보다 한국어뿐 아니라 영어, 일본어, 중국어로 언제든 전환해 보실 수 있도록 다국어 환경을 갖추었습니다. 우리 협회가 오랜 세월 이어 온 한·중·일 서예 교류의 역사를 온라인에서도 이어 가며, 국경을 넘어 더 많은 작가와 애호가가 협회의 활동을 함께 나눌 수 있도록 하겠습니다.

새 홈페이지는 협회 커뮤니티를 활성화하는 터전이 될 것입니다. 작가 소개와 작품 아카이브, 온라인 출품과 같은 다양한 기술을 적용하여 작가 한 분 한 분의 온라인 활동(Online Presence)을 넓히고, 이를 뒷받침하는 정책 지원을 꾸준히 개발해 나가겠습니다. 전시장에서 맺은 인연이 온라인에서도 이어져, 작가와 관람객, 작가와 작가가 더 가까이 만나는 협회를 만들어 가겠습니다.

법고창신(法古創新)의 정신으로 전통을 지키되, 더 많은 작가에게 열린 무대를 마련하는 일에 협회가 앞장서겠습니다. 내년 봄, 예술의전당에서 여러분을 반갑게 맞이하겠습니다.

회원 여러분의 가정에 늘 평안과 건강이 함께하시기를 진심으로 기원합니다.

2026년 10월 30일

사단법인 동양서예협회 이사장 임재홍`

const englishGreeting = `Dear Members of the Asian Society of Calligraphic Arts (ASCA), and all artists who love the fragrance of ink,

As autumn deepens and the year's work comes to fruition, I am delighted to share news that our association has long been preparing.

The 23rd Korea Oriental Calligraphy Exhibition will be held from April 21 to 30, 2027, at the Seoul Calligraphy Museum in the Seoul Arts Center. This exhibition marks a meaningful turning point in our history: we have reserved both Gallery 1 and Gallery 2 of the museum, bringing the open competition and the "Seogyeong (書境)" exhibition of invited artists, solo shows and booth exhibitions together under one roof.

Gallery 2 will host the open competition, a stage for discovering new artists. Gallery 1 will bring together the Seogyeong invited artists' exhibition, solo shows and group booth exhibitions, presenting the present and future of Oriental calligraphy in one place. A newcomer's first entry and the mature brushwork of senior artists, facing each other in the same space at the same time: this is the "new horizon" this exhibition aims for.

Above all, our preparations have focused on opening the doors wider.

First, we have expanded opportunities for young artists. We warmly encourage entries from university calligraphy majors and from current and former members of the National University Calligraphy Association, and the youth division will be judged by its own criteria so that young artists are evaluated in their own voice. We believe the future of calligraphy rests in the young hands that take up the brush today.

Second, we have opened the invited artists' exhibition to artists from outside the association. Under a special provision introduced for this edition, accomplished artists may take part in the Seogyeong invited artists' exhibition even if they are not full members of ASCA, and a special appointment procedure for recommended and invited artists has been prepared as well. When capable artists gather beyond their affiliations, the artistic range of our association grows wider and deeper.

We have also made room within the exhibition for solo shows and booth exhibitions by small groups, so that individual artistic worlds and the research of each group can be shown in a dignified space. Every step, from entry and judging to exhibition and awards, will be conducted transparently and fairly under our newly revised operating and judging regulations.

Entries close on January 31, 2027. Full details are available in the competition guidelines and entry form on our website. We warmly invite not only our members but everyone who practices calligraphy, literati painting or seal carving to take part.

We have also carried out a major renovation of the association's website. Above all, it now offers a multilingual environment: visitors can switch at any time between Korean, English, Japanese and Chinese. Through it we will carry the long history of calligraphic exchange among Korea, China and Japan into the online world, so that more artists and admirers across borders can share in the association's activities.

The new website will be a home for our community. By applying a range of technologies, such as artist profiles, artwork archives and online entry, we will expand the online presence of each of our artists, and we will continue to develop policies that support it. We hope the connections made in the exhibition hall will carry on online, bringing artists and visitors, and artists and one another, closer together.

In the spirit of Beopgochangsin (法古創新), preserving tradition while creating anew, our association will lead the way in building an open stage for more artists. We look forward to welcoming you at the Seoul Arts Center next spring.

I sincerely wish peace and good health to all our members and their families.

October 30, 2026

Lim Jae-hong, Chairman of the Asian Society of Calligraphic Arts (ASCA)`

/** 편지 본문 — 끝의 날짜·서명 두 문단은 오른쪽 아래로 뗀다 */
function Letter({ text, lang }: { text: string; lang: 'ko' | 'en' }) {
  const paragraphs = text.split('\n\n')
  const body = paragraphs.slice(0, -2)
  const [date, signature] = paragraphs.slice(-2)
  return (
    <article className='ab-letter' lang={lang}>
      {body.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      <div className='ab-letter__sign'>
        <p className='ab-letter__note'>{date}</p>
        <p>{signature}</p>
      </div>
    </article>
  )
}

export function GreetingsTabs() {
  return (
    <AboutChapter
      id='greeting'
      tc='書境'
      eyebrow='제23회 대한민국 동양서예대전'
      title='이사장 인사말씀'
      note='다른 언어 버전은 준비 중입니다.'
    >
      <TabsPrimitive.Root defaultValue='ko'>
        <TabsPrimitive.List className='ab-langs'>
          <TabsPrimitive.Trigger value='ko' className='ab-lang'>
            한국어
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger value='en' className='ab-lang'>
            English
          </TabsPrimitive.Trigger>
        </TabsPrimitive.List>
        <TabsPrimitive.Content value='ko'>
          <Letter text={koreanGreeting} lang='ko' />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value='en'>
          <Letter text={englishGreeting} lang='en' />
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>
    </AboutChapter>
  )
}
