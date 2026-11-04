import type { Language } from '@/lib/i18n/types'
import type { NoticeCategory, NoticeFieldKey, NoticePhase } from '@/lib/notices/notice-view'

/**
 * 공지 화면의 언어별 문구 — 공지 제목·본문은 한국어 원문 그대로 두고(번역본이 없다), 화면 틀만 네 언어로 바꾼다.
 * 메타데이터는 page.tsx(서버)에서 한국어로 둔다 — 공모전 화면과 같은 방식.
 */

export interface NoticeCopy {
  hero: { title: string; lede: string }
  facts: { total: string; pinned: string; since: string; latest: string }
  count: (n: number) => string
  /** 장부 위 건수 줄 — 영어는 숫자만 두면 무엇의 수인지 모른다 */
  listed: (n: number) => string
  year: (y: number) => string
  pinned: { eyebrow: string; title: string }
  archive: { eyebrow: string; title: (since: number | undefined) => string; lede: string }
  categories: Record<NoticeCategory | 'all', string>
  categoryGroup: string
  phases: Record<NoticePhase, string>
  fields: Record<NoticeFieldKey, string>
  search: { label: string; placeholder: string }
  filtered: (total: number, shown: number) => string
  empty: { body: string; reset: string }
  detail: {
    crumb: string
    published: string
    period: string
    place: string
    bodyTitle: string
    factsEyebrow: string
    factsTitle: string
    factsCaption: (title: string) => string
    columns: readonly [string, string]
    contactEyebrow: string
    contactTitle: string
    contactLede: string
    relatedTitle: (category: string) => string
    relatedFallback: string
    back: string
    share: string
    copy: string
    copied: string
    copyFailed: string
    shareLabel: string
  }
}

export const NOTICE_COPY: Record<Language, NoticeCopy> = {
  ko: {
    hero: {
      title: '공지사항',
      lede: '협회 소식과 행사 안내, 공모·전시 일정을 게시일 순으로 알립니다.',
    },
    facts: { total: '게시된 공지', pinned: '고정 공지', since: '기록 시작', latest: '최근 게시' },
    count: n => `${n}건`,
    listed: n => `${n}건`,
    year: y => `${y}년`,
    pinned: { eyebrow: '먼저 보실 공지', title: '고정 공지' },
    archive: {
      eyebrow: '모든 공지',
      title: since => (since ? `${since}년부터의 공지` : '공지 기록'),
      lede: '제목을 누르면 기간·장소·주최와 안내문 전체를 볼 수 있습니다.',
    },
    categories: {
      all: '전체',
      announcement: '공지',
      event: '행사',
      general: '일반',
      urgent: '긴급',
    },
    categoryGroup: '공지 분류',
    phases: { upcoming: '예정', ongoing: '진행 중', past: '지난 일정' },
    fields: {
      구분: '구분',
      기간: '기간',
      장례기간: '장례 기간',
      장소: '장소',
      주최: '주최',
      주관: '주관',
      후원: '후원',
      협찬: '협찬',
    },
    search: { label: '공지 검색', placeholder: '제목·장소·내용으로 찾기' },
    filtered: (total, shown) => `${total}건 가운데 ${shown}건`,
    empty: { body: '조건에 맞는 공지가 없습니다.', reset: '조건 지우기' },
    detail: {
      crumb: '공지사항',
      published: '게시일',
      period: '기간',
      place: '장소',
      bodyTitle: '공지 내용',
      factsEyebrow: '안내',
      factsTitle: '한눈에 보기',
      factsCaption: title => `${title} 안내 항목`,
      columns: ['항목', '내용'],
      contactEyebrow: '문의',
      contactTitle: '사무국 문의',
      contactLede: '공지 내용에 관한 문의는 사무국에서 안내합니다.',
      relatedTitle: category => `다른 ${category} 공지`,
      relatedFallback: '공지 기록',
      back: '← 공지 목록으로',
      share: '공유하기',
      copy: '주소 복사',
      copied: '공지 주소를 복사했습니다.',
      copyFailed: '주소를 복사하지 못했습니다. 주소창의 주소를 직접 복사해 주세요.',
      shareLabel: '이 공지 공유',
    },
  },
  en: {
    hero: {
      title: 'Notices',
      lede: 'Society news, event announcements and competition and exhibition schedules, newest first. Notices are published in Korean.',
    },
    facts: { total: 'Notices', pinned: 'Pinned', since: 'Since', latest: 'Latest' },
    count: n => `${n}`,
    listed: n => `${n} ${n === 1 ? 'notice' : 'notices'}`,
    year: y => `${y}`,
    pinned: { eyebrow: 'Read first', title: 'Pinned notices' },
    archive: {
      eyebrow: 'All notices',
      title: since => (since ? `Notices since ${since}` : 'Notice archive'),
      lede: 'Select a title to see the dates, venue, organizer and the full notice.',
    },
    categories: {
      all: 'All',
      announcement: 'Announcement',
      event: 'Event',
      general: 'General',
      urgent: 'Urgent',
    },
    categoryGroup: 'Notice category',
    phases: { upcoming: 'Upcoming', ongoing: 'Ongoing', past: 'Ended' },
    fields: {
      구분: 'Type',
      기간: 'Dates',
      장례기간: 'Funeral period',
      장소: 'Venue',
      주최: 'Organizer',
      주관: 'Host',
      후원: 'Sponsors',
      협찬: 'Supporters',
    },
    search: { label: 'Search notices', placeholder: 'Search by title, venue or text' },
    filtered: (total, shown) => `${shown} of ${total}`,
    empty: { body: 'No notices match these filters.', reset: 'Clear filters' },
    detail: {
      crumb: 'Notices',
      published: 'Published',
      period: 'Dates',
      place: 'Venue',
      bodyTitle: 'Notice',
      factsEyebrow: 'Details',
      factsTitle: 'At a glance',
      factsCaption: title => `Details for ${title}`,
      columns: ['Item', 'Detail'],
      contactEyebrow: 'Contact',
      contactTitle: 'Contact the office',
      contactLede: 'The society office answers questions about this notice.',
      relatedTitle: category => `More ${category.toLowerCase()} notices`,
      relatedFallback: 'Notice archive',
      back: '← Back to notices',
      share: 'Share',
      copy: 'Copy link',
      copied: 'Link copied.',
      copyFailed: 'Could not copy the link. Please copy it from the address bar.',
      shareLabel: 'Share this notice',
    },
  },
  ja: {
    hero: {
      title: 'お知らせ',
      lede: '協会のニュース、行事のご案内、公募・展示の日程を掲載日順にお知らせします。本文は韓国語です。',
    },
    facts: { total: '掲載中', pinned: '固定', since: '記録開始', latest: '最新掲載' },
    count: n => `${n}件`,
    listed: n => `${n}件`,
    year: y => `${y}年`,
    pinned: { eyebrow: 'まずご覧ください', title: '固定のお知らせ' },
    archive: {
      eyebrow: 'すべてのお知らせ',
      title: since => (since ? `${since}年からのお知らせ` : 'お知らせの記録'),
      lede: 'タイトルを選ぶと、期間・会場・主催と本文をご覧いただけます。',
    },
    categories: {
      all: 'すべて',
      announcement: '告知',
      event: '行事',
      general: '一般',
      urgent: '緊急',
    },
    categoryGroup: 'お知らせの分類',
    phases: { upcoming: '予定', ongoing: '開催中', past: '終了' },
    fields: {
      구분: '区分',
      기간: '期間',
      장례기간: '葬儀期間',
      장소: '会場',
      주최: '主催',
      주관: '主管',
      후원: '後援',
      협찬: '協賛',
    },
    search: { label: 'お知らせを検索', placeholder: 'タイトル・会場・本文で検索' },
    filtered: (total, shown) => `${total}件中 ${shown}件`,
    empty: { body: '条件に合うお知らせはありません。', reset: '条件をクリア' },
    detail: {
      crumb: 'お知らせ',
      published: '掲載日',
      period: '期間',
      place: '会場',
      bodyTitle: 'お知らせ本文',
      factsEyebrow: 'ご案内',
      factsTitle: 'ひと目で',
      factsCaption: title => `${title}の案内項目`,
      columns: ['項目', '内容'],
      contactEyebrow: 'お問い合わせ',
      contactTitle: '事務局へのお問い合わせ',
      contactLede: 'お知らせの内容については事務局がご案内します。',
      relatedTitle: category => `ほかの${category}のお知らせ`,
      relatedFallback: 'お知らせの記録',
      back: '← お知らせ一覧へ',
      share: '共有',
      copy: 'リンクをコピー',
      copied: 'リンクをコピーしました。',
      copyFailed: 'リンクをコピーできませんでした。アドレスバーから直接コピーしてください。',
      shareLabel: 'このお知らせを共有',
    },
  },
  zh: {
    hero: {
      title: '公告',
      lede: '依發布日期公告協會消息、活動通知及公募・展覽日程。公告內文為韓文。',
    },
    facts: { total: '已發布', pinned: '置頂', since: '紀錄起始', latest: '最新發布' },
    count: n => `${n}則`,
    listed: n => `${n}則`,
    year: y => `${y}年`,
    pinned: { eyebrow: '請先閱讀', title: '置頂公告' },
    archive: {
      eyebrow: '全部公告',
      title: since => (since ? `${since}年以來的公告` : '公告紀錄'),
      lede: '點選標題即可查看期間、地點、主辦單位及公告全文。',
    },
    categories: {
      all: '全部',
      announcement: '公告',
      event: '活動',
      general: '一般',
      urgent: '緊急',
    },
    categoryGroup: '公告分類',
    phases: { upcoming: '即將舉行', ongoing: '進行中', past: '已結束' },
    fields: {
      구분: '類別',
      기간: '期間',
      장례기간: '治喪期間',
      장소: '地點',
      주최: '主辦',
      주관: '承辦',
      후원: '贊助',
      협찬: '協贊',
    },
    search: { label: '搜尋公告', placeholder: '以標題・地點・內文搜尋' },
    filtered: (total, shown) => `${total}則中的${shown}則`,
    empty: { body: '沒有符合條件的公告。', reset: '清除條件' },
    detail: {
      crumb: '公告',
      published: '發布日期',
      period: '期間',
      place: '地點',
      bodyTitle: '公告內容',
      factsEyebrow: '說明',
      factsTitle: '一覽',
      factsCaption: title => `${title}說明項目`,
      columns: ['項目', '內容'],
      contactEyebrow: '諮詢',
      contactTitle: '洽詢事務局',
      contactLede: '有關公告內容的問題，請洽事務局。',
      relatedTitle: category => `其他${category}公告`,
      relatedFallback: '公告紀錄',
      back: '← 返回公告列表',
      share: '分享',
      copy: '複製連結',
      copied: '已複製連結。',
      copyFailed: '無法複製連結，請直接從網址列複製。',
      shareLabel: '分享此公告',
    },
  },
}
