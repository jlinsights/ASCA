/** /contests 화면의 공모요강 밖 문구 — 머리말·목차·역대 대전·문의. 요강 본문은 contest-23-copy */

import type { Language } from '@/lib/i18n/types'
import { ordinal } from './contest-i18n'

export interface ContestsPageCopy {
  hero: { title: string; lede: string; apply: string; commission: string }
  facts: { editions: (count: number) => string; next: string; deadline: string; exhibition: string }
  nextEdition: (edition: number) => string
  toc: readonly [string, string, string, string, string, string, string, string, string]
  hubLead: string
  hubLink: (edition: number) => string
  editions: {
    eyebrow: string
    title: (latest: number) => string
    lede: string
    caption: string
    columns: readonly [string, string, string, string]
    online: string
  }
  contact: { eyebrow: string; title: string; lede: string }
}

export const CONTESTS_PAGE_COPY: Record<Language, ContestsPageCopy> = {
  ko: {
    hero: {
      title: '공모전',
      lede: '협회가 주최하는 대한민국 동양서예대전의 공모 안내와 출품·수상 정보를 한곳에 모았습니다.',
      apply: '출품원서 작성',
      commission: '위원 위촉 지원',
    },
    facts: {
      editions: count => `${count}회`,
      next: '다음 대전',
      deadline: '접수 마감',
      exhibition: '전시',
    },
    nextEdition: edition => `제${edition}회`,
    toc: [
      '일정',
      '자격·부문',
      '규격·표장',
      '출품료',
      '출품 방법',
      '시상',
      '유의사항',
      '역대 대전',
      '문의',
    ],
    hubLead: '두 전시실 구성과 출품 경로를 한 화면에 모았습니다 ·',
    hubLink: edition => `제${edition}회 대전 한눈에 보기 →`,
    editions: {
      eyebrow: '역대 대전',
      title: latest => `제1회부터 제${latest}회까지`,
      lede: '개최 기간과 장소는 협회 연혁의 기록입니다.',
      caption: '역대 대한민국 동양서예대전',
      columns: ['회차', '연도', '기간', '장소'],
      online: '(온라인)',
    },
    contact: {
      eyebrow: '문의·상담',
      title: '출품이 궁금하면',
      lede: '출품 자격과 부문, 접수 방법은 사무국으로 문의해 주세요.',
    },
  },
  en: {
    hero: {
      title: 'Open Call',
      lede: 'Guidelines, entry and award information for the Korea Oriental Calligraphy Grand Exhibition, organized by the association, all in one place.',
      apply: 'Entry form',
      commission: 'Apply for committee appointment',
    },
    facts: {
      editions: count => `${count}`,
      next: 'Next exhibition',
      deadline: 'Entry deadline',
      exhibition: 'Exhibition',
    },
    nextEdition: edition => ordinal(edition),
    toc: [
      'Schedule',
      'Eligibility',
      'Size & mounting',
      'Entry fees',
      'How to enter',
      'Awards',
      'Notes',
      'Past editions',
      'Contact',
    ],
    hubLead: 'Both galleries and every entry route on one page ·',
    hubLink: edition => `The ${ordinal(edition)} exhibition at a glance →`,
    editions: {
      eyebrow: 'Past editions',
      title: latest => `From the 1st to the ${ordinal(latest)}`,
      lede: 'Dates and venues are taken from the association’s history records.',
      caption: 'Past Korea Oriental Calligraphy Grand Exhibitions',
      columns: ['Edition', 'Year', 'Dates', 'Venue'],
      online: '(online)',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Questions about entering',
      lede: 'Ask the secretariat about eligibility, sections and how to submit.',
    },
  },
  ja: {
    hero: {
      title: '公募展',
      lede: '協会が主催する大韓民國 東洋書藝大展の公募案内と、出品・受賞の情報をひとつにまとめました。',
      apply: '出品願書の作成',
      commission: '委員委嘱の申請',
    },
    facts: {
      editions: count => `${count}回`,
      next: '次回大展',
      deadline: '受付締切',
      exhibition: '展示',
    },
    nextEdition: edition => `第${edition}回`,
    toc: [
      '日程',
      '資格・部門',
      '規格・表装',
      '出品料',
      '出品方法',
      '授賞',
      '注意事項',
      '歴代大展',
      'お問い合わせ',
    ],
    hubLead: '2つの展示室の構成と出品ルートを1画面にまとめました ·',
    hubLink: edition => `第${edition}回大展をひと目で →`,
    editions: {
      eyebrow: '歴代大展',
      title: latest => `第1回から第${latest}回まで`,
      lede: '開催期間と会場は協会沿革の記録です。',
      caption: '歴代 大韓民國 東洋書藝大展',
      columns: ['回次', '年', '期間', '会場'],
      online: '(オンライン)',
    },
    contact: {
      eyebrow: 'お問い合わせ・相談',
      title: '出品についてのご質問',
      lede: '出品資格や部門、受付方法は事務局までお問い合わせください。',
    },
  },
  zh: {
    hero: {
      title: '公募展',
      lede: '協會主辦之大韓民國 東洋書藝大展的公募簡介，以及出品與得獎資訊，彙整於此。',
      apply: '填寫出品申請',
      commission: '申請委員委任',
    },
    facts: {
      editions: count => `${count}屆`,
      next: '下屆大展',
      deadline: '收件截止',
      exhibition: '展覽',
    },
    nextEdition: edition => `第${edition}回`,
    toc: [
      '日程',
      '資格・部門',
      '規格・裝裱',
      '出品費',
      '出品方式',
      '頒獎',
      '注意事項',
      '歷屆大展',
      '聯絡我們',
    ],
    hubLead: '兩間展覽室的配置與出品途徑，一頁看完 ·',
    hubLink: edition => `第${edition}回大展一覽 →`,
    editions: {
      eyebrow: '歷屆大展',
      title: latest => `第1回至第${latest}回`,
      lede: '舉辦期間與地點取自協會沿革紀錄。',
      caption: '歷屆 大韓民國 東洋書藝大展',
      columns: ['屆次', '年度', '期間', '地點'],
      online: '(線上)',
    },
    contact: {
      eyebrow: '諮詢',
      title: '出品相關問題',
      lede: '出品資格、部門與收件方式，請洽協會事務局。',
    },
  },
}
