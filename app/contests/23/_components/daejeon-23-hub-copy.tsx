/**
 * 제23회 대전 허브(/contests/23)의 언어별 문구. 한국어는 daejeon-23-hub-data 원본을 그대로 쓰고,
 * 다른 언어는 원본과 같은 순서·같은 링크 주소로 문장만 옮긴다(주소는 원본에서 읽는다).
 */

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Language } from '@/lib/i18n/types'
import { CONTEST_23, koDate } from '@/app/contests/_components/contest-23-data'
import {
  contestDate,
  contestVenue,
  editionLabel,
  type Foreign,
} from '@/app/contests/_components/contest-i18n'
import { ENTRY_PATHS, HALLS, type EntryPath, type HallItem } from './daejeon-23-hub-data'

export interface HubCopy {
  crumb: string
  lede: string
  facts: { deadline: string; exhibition: string; ceremony: string; admission: string; free: string }
  actions: { apply: string; flipbook: string; guidelines: string }
  calendar: (closes: string, time: string) => string
  calendarLink: string
  halls: { eyebrow: string; title: string; lede: string; items: readonly HallItem[] }
  hallsNote: ReactNode
  paths: { eyebrow: string; title: string; lede: string; items: readonly EntryPath[] }
  dates: { eyebrow: string; title: string; lede: string }
  faq: { eyebrow: string; title: string }
  contact: { eyebrow: string; title: string; lede: ReactNode }
}

interface ForeignPath {
  title: string
  who: string
  body: string
  links: readonly string[]
}

/** 원본 순서대로 번역 문장을 붙이고 주소는 원본을 쓴다 — 개수가 다르면 바로 실패 */
function withLinks(paths: readonly ForeignPath[]): readonly EntryPath[] {
  if (paths.length !== ENTRY_PATHS.length) throw new Error('출품 경로 번역 개수가 원본과 다릅니다')
  return paths.map((path, index) => {
    const source = ENTRY_PATHS[index]!
    if (path.links.length !== source.links.length) {
      throw new Error(`출품 경로 링크 번역 개수가 원본과 다릅니다: ${source.title}`)
    }
    return {
      ...path,
      links: source.links.map((link, linkIndex) => ({
        href: link.href,
        label: path.links[linkIndex] ?? link.label,
      })),
    }
  })
}

function withHalls(halls: readonly HallItem[]): readonly HallItem[] {
  if (halls.length !== HALLS.length) throw new Error('전시실 번역 개수가 원본과 다릅니다')
  return halls
}

const KO: HubCopy = {
  crumb: '공모전',
  lede: '서울서예박물관 두 전시실에서, 공모전과 書境 초대작가전을 한 흐름으로 엽니다.',
  facts: {
    deadline: '출품 마감',
    exhibition: '전시',
    ceremony: '시상식',
    admission: '관람',
    free: '무료',
  },
  actions: {
    apply: '출품원서 작성하기 →',
    flipbook: '공모요강 플립북 ↗',
    guidelines: '공모요강 전문 →',
  },
  calendar: (closes, time) =>
    `${closes} ${time}까지 출품신청서와 출품료를 내면 2027 동양서예 캘린더 증정 대상입니다 ·`,
  calendarLink: '증정 행사 안내 →',
  halls: {
    eyebrow: '전시 구성',
    title: '같은 기간, 두 전시실에서',
    lede: `${CONTEST_23.venue} 제1·2전시실을 함께 씁니다. 신진 작가의 출품작과 초대작가의 필묵이 같은 기간, 같은 공간에서 만납니다.`,
    items: HALLS,
  },
  hallsNote: (
    <>
      2026년 4월의 書境 전시 기록은 <Link href='/exhibitions/past'>지난 전시</Link>에서 볼 수
      있습니다.
    </>
  ),
  paths: {
    eyebrow: '출품 경로',
    title: '어디로 출품하나',
    lede: '자격과 출품료, 규격은 공모요강 전문에 있습니다. 아래에서 내 경로를 찾아 해당 절로 이동하세요.',
    items: ENTRY_PATHS,
  },
  dates: {
    eyebrow: '일정',
    title: '접수부터 시상까지',
    lede: `출품은 ${koDate(CONTEST_23.deadline)} ${CONTEST_23.deadlineTime}까지 받습니다. 보낸 날이 아니라 도착한 날이 기준입니다.`,
  },
  faq: { eyebrow: '자주 묻는 질문', title: '출품 전에 확인하세요' },
  contact: {
    eyebrow: '문의',
    title: '사무국',
    lede: '카카오톡 채널 「동양서예협회」로도 문의할 수 있습니다.',
  },
}

const Kakao = () => <span lang='ko'>동양서예협회</span>

const DEADLINE_TIME = /\d{2}:\d{2}/.exec(CONTEST_23.deadlineTime)?.[0] ?? CONTEST_23.deadlineTime
const d = (iso: string, lang: Foreign) => contestDate(iso, lang)

const EN: HubCopy = {
  crumb: 'Open Call',
  lede: 'In the two galleries of the Seoul Calligraphy Art Museum, the open call and the Seogyeong (書境) Invited Artists Exhibition run as one.',
  facts: {
    deadline: 'Entry deadline',
    exhibition: 'Exhibition',
    ceremony: 'Award ceremony',
    admission: 'Admission',
    free: 'Free',
  },
  actions: {
    apply: 'Fill in the entry form →',
    flipbook: 'Guidelines flipbook ↗',
    guidelines: 'Full guidelines →',
  },
  calendar: (closes, time) =>
    `Submit your entry application and fee by ${closes} ${time} to receive the 2027 Oriental Calligraphy calendar ·`,
  calendarLink: 'About the calendar gift →',
  halls: {
    eyebrow: 'The exhibition',
    title: 'Two galleries, the same dates',
    lede: `Galleries 1 and 2 of the ${contestVenue('en')} are used together. New artists’ entries and invited artists’ brushwork meet in the same space at the same time.`,
    items: withHalls([
      {
        hall: 'Gallery 2',
        title: 'Open Call',
        body: 'Entries in the five sections are judged, and those selected or higher are exhibited and included in the catalogue. It is where new artists are first introduced.',
      },
      {
        hall: 'Gallery 1',
        title: 'Seogyeong (書境) Invited Artists · Solo · Booth Exhibitions',
        body: 'Mature brushwork by invited artists is shown alongside solo exhibitions of 10 or more works and booth exhibitions by calligraphy groups, in one gallery.',
      },
    ]),
  },
  hallsNote: (
    <>
      Records of the April 2026 Seogyeong exhibition are in{' '}
      <Link href='/exhibitions/past'>past exhibitions</Link>.
    </>
  ),
  paths: {
    eyebrow: 'Entry routes',
    title: 'Where to enter',
    lede: 'Eligibility, fees and sizes are in the full guidelines. Find your route below and jump to the relevant section.',
    items: withLinks([
      {
        title: 'General entry',
        who: 'Korean citizens · overseas Koreans · foreign residents of Korea',
        body: 'Choose from five sections: Hangeul, Chinese characters, contemporary calligraphy and calligraphy art, seal and wood engraving, and literati and East Asian painting. No limits on age, education or experience.',
        links: ['Eligibility & sections', 'Size & mounting', 'Entry fees'],
      },
      {
        title: 'Youth section',
        who: 'University calligraphy majors · young artists who are or were members of the National University Calligraphy Federation',
        body: 'The youth section has its own judging criteria and its own young-artist entry fee. Entries from university calligraphy students are encouraged.',
        links: ['Eligibility & sections', 'Entry fees'],
      },
      {
        title: 'Seogyeong (書境) Invited Artists Exhibition',
        who: 'Invited artists of the association · non-member artists under the special provision',
        body: 'Invited artists enter the Invited Artists Exhibition rather than the open-call sections. Under this edition’s special provision, skilled artists who are not full members may also take part.',
        links: ['Entry form', 'Special appointment (Article 11, appointment regulations)'],
      },
    ]),
  },
  dates: {
    eyebrow: 'Schedule',
    title: 'From entry to awards',
    lede: `Entries are accepted until ${d(CONTEST_23.deadline, 'en')} at ${DEADLINE_TIME}, counted by the date they arrive, not the date sent.`,
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Check before entering',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Secretariat',
    lede: (
      <>
        You can also reach us on the KakaoTalk channel 「<Kakao />
        」.
      </>
    ),
  },
}

const JA: HubCopy = {
  crumb: '公募展',
  lede: 'ソウル書芸博物館の2つの展示室で、公募展と書境招待作家展をひとつの流れとして開催します。',
  facts: {
    deadline: '出品締切',
    exhibition: '展示',
    ceremony: '授賞式',
    admission: '観覧',
    free: '無料',
  },
  actions: {
    apply: '出品願書を作成する →',
    flipbook: '公募要項フリップブック ↗',
    guidelines: '公募要項の全文 →',
  },
  calendar: (closes, time) =>
    `${closes} ${time}までに出品申請書と出品料を納めると、2027 東洋書芸カレンダーの贈呈対象になります ·`,
  calendarLink: '贈呈のご案内 →',
  halls: {
    eyebrow: '展示構成',
    title: '同じ期間、2つの展示室で',
    lede: `${contestVenue('ja')}の第1・第2展示室を合わせて使います。新進作家の出品作と招待作家の筆墨が、同じ期間、同じ空間で出会います。`,
    items: withHalls([
      {
        hall: '第2展示室',
        title: '公募展',
        body: '5部門の公募作品を審査し、特選・入選以上を展示して図録に掲載します。新しい作家を初めて紹介する場です。',
      },
      {
        hall: '第1展示室',
        title: '書境 招待作家展 · 個展 · ブース展',
        body: '招待作家の円熟した筆墨とともに、10点以上の個展、書芸団体のブース展をひとつの展示室で紹介します。',
      },
    ]),
  },
  hallsNote: (
    <>
      2026年4月の書境展の記録は<Link href='/exhibitions/past'>過去の展覧会</Link>
      でご覧いただけます。
    </>
  ),
  paths: {
    eyebrow: '出品ルート',
    title: 'どこに出品するか',
    lede: '資格・出品料・規格は公募要項の全文にあります。下から自分のルートを見つけ、該当の節へ移動してください。',
    items: withLinks([
      {
        title: '一般出品',
        who: '大韓民国国民 · 在外同胞 · 韓国在住の外国人',
        body: 'ハングル、漢文、現代書芸・カリグラフィー、篆刻・書刻、文人画・東洋画の5部門から選んで出品します。年齢・学歴・経歴の制限はありません。',
        links: ['資格・部門', '規格・表装', '出品料'],
      },
      {
        title: '青年部',
        who: '大学の書芸専攻者 · 全国大学書芸連合に所属・出身の青年作家',
        body: '青年部は別の審査基準を適用し、青年作家の出品料を別に設けています。大学で書芸を学ぶ方の出品を推奨します。',
        links: ['資格・部門', '出品料'],
      },
      {
        title: '書境 招待作家展',
        who: '協会の招待作家 · 特別規定による非会員作家',
        body: '協会の招待作家は公募部門ではなく招待作家展に出品します。今回の特別規定により、正会員でなくても実力のある作家が参加できます。',
        links: ['出品願書', '特別選任(選任規程第11条)'],
      },
    ]),
  },
  dates: {
    eyebrow: '日程',
    title: '受付から授賞まで',
    lede: `出品は${d(CONTEST_23.deadline, 'ja')} ${DEADLINE_TIME}まで受け付けます。発送日ではなく到着日が基準です。`,
  },
  faq: {
    eyebrow: 'よくある質問',
    title: '出品前にご確認ください',
  },
  contact: {
    eyebrow: 'お問い合わせ',
    title: '事務局',
    lede: (
      <>
        カカオトークチャンネル「
        <Kakao />
        」からもお問い合わせいただけます。
      </>
    ),
  },
}

const ZH: HubCopy = {
  crumb: '公募展',
  lede: '於首爾書藝博物館兩間展覽室，公募展與書境邀請作家展一脈相承、同時展出。',
  facts: {
    deadline: '收件截止',
    exhibition: '展覽',
    ceremony: '頒獎典禮',
    admission: '參觀',
    free: '免費',
  },
  actions: {
    apply: '填寫出品申請 →',
    flipbook: '公募簡章翻頁電子書 ↗',
    guidelines: '公募簡章全文 →',
  },
  calendar: (closes, time) =>
    `於${closes} ${time}前繳交出品申請書與出品費者，可獲贈2027東洋書藝月曆 ·`,
  calendarLink: '贈品活動說明 →',
  halls: {
    eyebrow: '展覽配置',
    title: '同一期間，兩間展覽室',
    lede: `同時使用${contestVenue('zh')}第1、第2展覽室。新進作家的出品作與邀請作家的筆墨，於同一期間、同一空間相遇。`,
    items: withHalls([
      {
        hall: '第2展覽室',
        title: '公募展',
        body: '審查五個部門的公募作品，展出特選、入選以上作品並刊登於圖錄。這是首次介紹新作家的場合。',
      },
      {
        hall: '第1展覽室',
        title: '書境 邀請作家展 · 個展 · 攤位展',
        body: '於同一展覽室展出邀請作家圓熟的筆墨，以及10件以上的個展與書藝團體的攤位展。',
      },
    ]),
  },
  hallsNote: (
    <>
      2026年4月書境展覽紀錄，請見<Link href='/exhibitions/past'>過往展覽</Link>。
    </>
  ),
  paths: {
    eyebrow: '出品途徑',
    title: '要往哪裡出品',
    lede: '資格、出品費與規格請見公募簡章全文。請於下方找到您的途徑，再前往相應段落。',
    items: withLinks([
      {
        title: '一般出品',
        who: '大韓民國國民 · 海外僑胞 · 居住韓國的外國人',
        body: '可於韓文、漢文、現代書藝・手寫字藝術、篆刻・書刻、文人畫・東洋畫五個部門中擇一出品。不限年齡、學歷與經歷。',
        links: ['資格・部門', '規格・裝裱', '出品費'],
      },
      {
        title: '青年組',
        who: '大學書藝主修者 · 全國大學書藝聯合所屬或出身的青年作家',
        body: '青年組採用另訂的審查標準，並另設青年作家出品費。鼓勵在大學修習書藝者出品。',
        links: ['資格・部門', '出品費'],
      },
      {
        title: '書境 邀請作家展',
        who: '協會邀請作家 · 依特別規定參與的非會員作家',
        body: '協會邀請作家不參加公募部門，而是出品邀請作家展。依本屆特別規定，非正式會員但具實力的作家亦可參加。',
        links: ['出品申請', '特別選任(選任規程第11條)'],
      },
    ]),
  },
  dates: {
    eyebrow: '日程',
    title: '從收件到頒獎',
    lede: `收件至${d(CONTEST_23.deadline, 'zh')} ${DEADLINE_TIME}為止，以寄達日而非寄出日為準。`,
  },
  faq: { eyebrow: '常見問題', title: '出品前請先確認' },
  contact: {
    eyebrow: '聯絡我們',
    title: '事務局',
    lede: (
      <>
        亦可透過KakaoTalk頻道「
        <Kakao />
        」洽詢。
      </>
    ),
  },
}

export const HUB_COPY: Record<Language, HubCopy> = { ko: KO, en: EN, ja: JA, zh: ZH }

/** 빵부스러기의 회차 표기 */
export const hubCrumbEdition = (lang: Language): string => editionLabel(CONTEST_23.edition, lang)
