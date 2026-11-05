import type { Language } from '@/lib/i18n/types'

/** 카카오 공유 대상. 대상마다 메시지 단추 문구와 설명 대체 문구가 다르다 */
export type KakaoShareType = 'artist' | 'contest' | 'exhibition' | 'artwork' | 'general'

interface ShareTarget {
  /** 카카오 메시지 안의 단추 */
  button: string
  /** 설명이 비었을 때 메시지에 넣는 문구 */
  description: string
}

interface KakaoShareCopy {
  targets: Record<KakaoShareType, ShareTarget>
  share: string
  sharing: string
  iconTitle: string
  shared: string
  failed: string
  /** 작가 카드가 만드는 공유 제목 — {name} 자리에 작가 이름 */
  artistTitle: string
  /** 전문분야가 없을 때 */
  artistFallbackSpecialty: string
  /** 소개글이 없을 때 */
  artistFallbackBio: string
}

const ko: KakaoShareCopy = {
  targets: {
    artist: { button: '작가 프로필 보기', description: '동양서예협회의 뛰어난 작가를 만나보세요' },
    contest: { button: '공모전 참가하기', description: '지금 바로 공모전에 참가해보세요' },
    exhibition: { button: '전시회 정보 보기', description: '특별한 전시회를 확인해보세요' },
    artwork: { button: '작품 자세히 보기', description: '아름다운 작품을 감상해보세요' },
    general: { button: '자세히 보기', description: 'ASCA 동양서예협회에서 확인해보세요' },
  },
  share: '카카오톡 공유',
  sharing: '공유 중...',
  iconTitle: '카카오톡으로 공유하기',
  shared: '카카오톡으로 공유되었습니다! 📤',
  failed: '공유 중 오류가 발생했습니다. 다시 시도해주세요.',
  artistTitle: '{name} 작가',
  artistFallbackSpecialty: '서예 작가',
  artistFallbackBio: '동양서예협회 소속 작가입니다.',
}

export const kakaoShareCopy: Record<Language, KakaoShareCopy> = {
  ko,
  en: {
    targets: {
      artist: {
        button: 'View artist profile',
        description: 'Meet outstanding artists of the Asian Society of Calligraphic Arts',
      },
      contest: { button: 'Enter the competition', description: 'Enter the competition today' },
      exhibition: { button: 'View exhibition', description: 'Discover a special exhibition' },
      artwork: { button: 'View artwork details', description: 'Enjoy beautiful works of art' },
      general: { button: 'Learn more', description: 'See more at ASCA' },
    },
    share: 'Share on KakaoTalk',
    sharing: 'Sharing…',
    iconTitle: 'Share on KakaoTalk',
    shared: 'Shared to KakaoTalk 📤',
    failed: 'Could not share. Please try again.',
    artistTitle: '{name} · ASCA artist',
    artistFallbackSpecialty: 'Calligrapher',
    artistFallbackBio: 'An artist of the Asian Society of Calligraphic Arts.',
  },
  ja: {
    targets: {
      artist: {
        button: '作家プロフィールを見る',
        description: '東洋書道協会の優れた作家をご覧ください',
      },
      contest: { button: '公募展に参加する', description: '今すぐ公募展にご参加ください' },
      exhibition: { button: '展覧会情報を見る', description: '特別な展覧会をご覧ください' },
      artwork: { button: '作品の詳細を見る', description: '美しい作品をご鑑賞ください' },
      general: { button: '詳しく見る', description: 'ASCA 東洋書道協会でご覧ください' },
    },
    share: 'カカオトークで共有',
    sharing: '共有中…',
    iconTitle: 'カカオトークで共有',
    shared: 'カカオトークで共有しました 📤',
    failed: '共有できませんでした。もう一度お試しください。',
    artistTitle: '{name} 作家',
    artistFallbackSpecialty: '書道作家',
    artistFallbackBio: '東洋書道協会所属の作家です。',
  },
  zh: {
    targets: {
      artist: { button: '查看作家簡介', description: '認識東洋書藝協會的傑出作家' },
      contest: { button: '參加公募展', description: '立即參加公募展' },
      exhibition: { button: '查看展覽資訊', description: '探索特別展覽' },
      artwork: { button: '查看作品詳情', description: '欣賞精美作品' },
      general: { button: '了解更多', description: '在 ASCA 東洋書藝協會查看' },
    },
    share: '分享至 KakaoTalk',
    sharing: '分享中…',
    iconTitle: '分享至 KakaoTalk',
    shared: '已分享至 KakaoTalk 📤',
    failed: '分享失敗，請再試一次。',
    artistTitle: '{name} 作家',
    artistFallbackSpecialty: '書法作家',
    artistFallbackBio: '東洋書藝協會所屬作家。',
  },
}
