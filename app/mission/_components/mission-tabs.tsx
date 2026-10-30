'use client'

import { useState } from 'react'
import { AboutChapter, AboutHero, AboutRows } from '@/components/about/about-layout'
import { AboutNav } from '@/components/about/about-nav'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

// 협회 슬로건 法古創新 · 人書俱老 를 축으로 다시 쓴 사명(2026-10-30). 한국어가 원문이고 영어·일본어·중국어(번체)는 번역.
// 한·중·일 교류(1997~)·이원화된 초대작가 제도는 연혁과 규정을 따른다.

interface MissionItem {
  title: string
  description: string
}

interface MissionContent {
  missionStatement: string
  coreValues: readonly MissionItem[]
  objectives: readonly MissionItem[]
}

const koreanContent: MissionContent = {
  missionStatement:
    '동양서예협회는 法古創新의 정신으로 옛 법을 깊이 익혀 오늘의 새로움을 열고, 人書俱老의 자세로 글씨와 사람이 함께 깊어지는 서예 문화를 만들어 갑니다. 한·중·일을 잇는 교류의 전통 위에서, 동양 문자예술이 이 시대의 예술로 살아 숨 쉬도록 합니다.',
  coreValues: [
    {
      title: '法古 · 옛 법을 익히다',
      description:
        '수천 년 이어 온 고전과 정법(正法)을 깊이 배우고 존중합니다. 임서와 수련으로 다진 바탕이 모든 창작의 출발점입니다.',
    },
    {
      title: '創新 · 새로움을 열다',
      description:
        '익힌 법 위에서 오늘의 감각과 새로운 매체를 받아들입니다. 전통부문과 현대부문의 이원화된 초대작가 제도로 전통과 현대가 함께 서는 자리를 만듭니다.',
    },
    {
      title: '人書俱老 · 함께 깊어지다',
      description:
        '글씨는 사람을 닮습니다. 빠른 성과보다 오랜 수양을 귀히 여기며, 글씨와 함께 사람이 성숙하는 문화를 지향합니다.',
    },
    {
      title: '열린 교류 · 함께 나누다',
      description:
        '한·중·일의 서예 전통을 아우르고, 회원 여부와 세대를 넘어 누구에게나 열린 무대를 마련합니다.',
    },
  ],
  objectives: [
    {
      title: '전시와 공모',
      description:
        '대한민국 동양서예대전과 초대작가전을 통해 새로운 작가를 발굴하고, 원숙한 작품을 품격 있는 공간에서 선보입니다.',
    },
    {
      title: '차세대 육성',
      description:
        '청년작가의 참여를 넓히고, 교육 프로그램과 강좌로 서예를 이어 갈 다음 세대를 기릅니다.',
    },
    {
      title: '한·중·일 교류',
      description:
        '1997년부터 이어 온 교류의 역사를 국제 교류전과 서예 인문학 탐방으로 이어 갑니다.',
    },
    {
      title: '디지털과 온라인 활동',
      description:
        '다국어 홈페이지, 작가 소개와 작품 아카이브, 온라인 출품으로 작가의 온라인 활동(Online Presence)을 넓히고, 이를 뒷받침할 정책을 꾸준히 개발합니다.',
    },
  ],
}

const englishContent: MissionContent = {
  missionStatement:
    'In the spirit of 法古創新, the Asian Society of Calligraphic Arts learns the old methods deeply to open what is new today, and in the spirit of 人書俱老, it builds a calligraphic culture in which calligraphy and the person deepen together. Standing on a tradition of exchange that links Korea, China and Japan, we keep Eastern character art alive as an art of our time.',
  coreValues: [
    {
      title: '法古 · Learning the Old Methods',
      description:
        'We study and respect the classics and the orthodox way (正法) handed down over thousands of years. A foundation built through copying the masters and steady practice is the starting point of all creation.',
    },
    {
      title: '創新 · Opening the New',
      description:
        'On the methods we have learned, we embrace the sensibility and new media of today. Our invited artist system, with its traditional and contemporary tracks, gives tradition and the contemporary a place to stand side by side.',
    },
    {
      title: '人書俱老 · Deepening Together',
      description:
        'Calligraphy resembles the person who writes it. We value long cultivation over quick results, and pursue a culture in which the person matures along with the brush.',
    },
    {
      title: 'Open Exchange · Sharing Together',
      description:
        'Embracing the calligraphic traditions of Korea, China and Japan, we provide a stage open to everyone, regardless of membership or generation.',
    },
  ],
  objectives: [
    {
      title: 'Exhibitions and Competitions',
      description:
        'Through the Korea Oriental Calligraphy Exhibition and the invited artists’ exhibition, we discover new artists and present mature works in a dignified setting.',
    },
    {
      title: 'Nurturing the Next Generation',
      description:
        'We widen the participation of young artists and raise the next generation of calligraphers through education programs and courses.',
    },
    {
      title: 'Korea–China–Japan Exchange',
      description:
        'We carry forward a history of exchange that began in 1997 through international exchange exhibitions and calligraphy humanities tours.',
    },
    {
      title: 'Digital and Online Presence',
      description:
        'Through our multilingual website, artist profiles, artwork archives and online entry, we expand the online presence of our artists and continue to develop policies that support it.',
    },
  ],
}

const japaneseContent: MissionContent = {
  missionStatement:
    '東洋書芸協会は、法古創新の精神のもと古法に深く学んで今日の新しきを拓き、人書俱老の姿勢をもって、書と人がともに深まる書芸文化を築いてまいります。韓・中・日を結ぶ交流の伝統の上に、東洋の文字芸術がこの時代の芸術として息づくよう努めます。',
  coreValues: [
    {
      title: '法古 · 古法に学ぶ',
      description:
        '数千年にわたり受け継がれてきた古典と正法を深く学び、尊びます。臨書と修練によって培った基礎こそが、あらゆる創作の出発点です。',
    },
    {
      title: '創新 · 新しきを拓く',
      description:
        '学んだ法の上に、今日の感性と新たな媒体を取り入れます。伝統部門と現代部門に分けた招待作家制度により、伝統と現代がともに立つ場を設けます。',
    },
    {
      title: '人書俱老 · ともに深まる',
      description:
        '書は人に似ます。速やかな成果よりも長い修養を尊び、書とともに人が成熟する文化を目指します。',
    },
    {
      title: '開かれた交流 · ともに分かち合う',
      description:
        '韓・中・日の書の伝統を包み込み、会員であるか否か、世代を問わず、誰にでも開かれた舞台を設けます。',
    },
  ],
  objectives: [
    {
      title: '展示と公募',
      description:
        '大韓民国 東洋書芸大展と招待作家展を通じて新たな作家を発掘し、円熟した作品を品格ある空間で披露します。',
    },
    {
      title: '次世代の育成',
      description:
        '青年作家の参加を広げ、教育プログラムと講座によって書芸を受け継ぐ次の世代を育てます。',
    },
    {
      title: '韓・中・日の交流',
      description:
        '1997年から続く交流の歴史を、国際交流展と書芸人文学の探訪によって受け継いでいきます。',
    },
    {
      title: 'デジタルとオンライン活動',
      description:
        '多言語ホームページ、作家紹介と作品アーカイブ、オンライン出品によって作家のオンライン上での活動(Online Presence)を広げ、それを支える政策を継続して開発します。',
    },
  ],
}

const chineseContent: MissionContent = {
  missionStatement:
    '東洋書藝協會秉持法古創新的精神，深學古法以開啟今日之新境；並以人書俱老的態度，營造書與人一同深化的書藝文化。立足於連結韓、中、日的交流傳統，使東方文字藝術成為這個時代鮮活的藝術。',
  coreValues: [
    {
      title: '法古 · 師法古人',
      description:
        '深入學習並尊重傳承數千年的經典與正法。以臨帖與修練奠定的根基，是一切創作的起點。',
    },
    {
      title: '創新 · 開創新境',
      description:
        '在所學之法的基礎上，接納當代的感性與新媒材。透過分為傳統部門與現代部門的邀請作家制度，讓傳統與現代並立共存。',
    },
    {
      title: '人書俱老 · 一同深化',
      description: '書如其人。我們重視長久的修養勝於速成，追求人隨書藝一同成熟的文化。',
    },
    {
      title: '開放交流 · 共同分享',
      description: '涵納韓、中、日的書藝傳統，不分會員與否、不論世代，為所有人提供開放的舞台。',
    },
  ],
  objectives: [
    {
      title: '展覽與公募',
      description: '透過大韓民國東洋書藝大展與邀請作家展發掘新秀，並在高雅的空間中呈現成熟的作品。',
    },
    {
      title: '培育新世代',
      description: '擴大青年作家的參與，並以教育課程與講座培養傳承書藝的下一代。',
    },
    {
      title: '韓·中·日交流',
      description: '以國際交流展與書藝人文探訪，延續自1997年以來的交流歷史。',
    },
    {
      title: '數位與線上活動',
      description:
        '透過多語言網站、作家介紹與作品典藏、線上參展，擴展作家的線上影響力(Online Presence)，並持續研擬支持此一目標的政策。',
    },
  ],
}

type MissionLang = 'ko' | 'en' | 'ja' | 'zh'

const CONTENT: Record<MissionLang, MissionContent> = {
  ko: koreanContent,
  en: englishContent,
  ja: japaneseContent,
  zh: chineseContent,
}

const LANGS: readonly { code: MissionLang; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
]

const LABELS: Record<MissionLang, { statement: string; values: string; objectives: string }> = {
  ko: { statement: '사명 선언', values: '핵심 가치', objectives: '주요 목표' },
  en: { statement: 'Mission Statement', values: 'Core Values', objectives: 'Key Objectives' },
  ja: { statement: '使命宣言', values: '核心価値', objectives: '主要目標' },
  zh: { statement: '使命宣言', values: '核心價值', objectives: '主要目標' },
}

const toRows = (items: readonly MissionItem[]) =>
  items.map(item => ({ label: item.title, body: <p>{item.description}</p> }))

/** 사명 페이지 본문 — 머리의 언어 단추가 세 장 모두의 언어를 바꾼다 */
export function MissionTabs() {
  const [lang, setLang] = useState<MissionLang>('ko')
  const content = CONTENT[lang]
  const labels = LABELS[lang]

  return (
    <>
      <AboutHero
        tc={PAGE_HERO_MARKS.mission.tc}
        title='사명'
        lede='옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어집니다'
        actions={
          <div className='ab-langs' role='group' aria-label='본문 언어'>
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                type='button'
                lang={code}
                className='ab-lang'
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <p lang='zh-Hant'>&ldquo;法古創新 · 人書俱老&rdquo;</p>
      </AboutHero>
      <AboutNav />

      <div lang={lang}>
        <AboutChapter
          id='statement'
          tone='navy'
          tc='宣言'
          eyebrow='Mission'
          title={labels.statement}
        >
          <p className='ab-quote' data-reveal>
            {content.missionStatement}
          </p>
        </AboutChapter>
        <AboutChapter id='values' tc='價値' eyebrow='Values' title={labels.values}>
          <AboutRows numbered items={toRows(content.coreValues)} />
        </AboutChapter>
        <AboutChapter
          id='objectives'
          tone='gold'
          tc='目標'
          eyebrow='Objectives'
          title={labels.objectives}
        >
          <AboutRows numbered items={toRows(content.objectives)} />
        </AboutChapter>
      </div>
    </>
  )
}
