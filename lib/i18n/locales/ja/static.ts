// 화면 번역을 합친 정적 표 (ja). 펼치는 순서가 곧 우선순위다 — 뒤에 오는 키가 앞을 덮는다.
import navigation from './navigation'
import artworks from './artworks'
import home from './home'
import siteChrome from './site-chrome'
import about from './about'
import exhibitions from './exhibitions'
import brand from './brand'
import archive from './archive'
import auth from './auth'
import nativeAuth from './native-auth'
import artistClaim from './artist-claim'
import communityBoard from './community-board'
import faq from './faq'
import inquiry from './inquiry'
import contestEntries from './contest-entries'
import profileEditor from './profile-editor'
import flipbooks from './flipbooks'
import regulations from './regulations'
import kakaoShare from './kakao-share'
import notFound from './not-found'
import discovery from './discovery'
import homepagePrograms from './homepage-programs'
import events from './events'
import artistDetail from './artist-detail'
import greetings from './greetings'
import blog from './blog'
import membership from './membership'
import fundraising from './fundraising'

const staticTable: Record<string, string> = {
  ...navigation,
  ...artworks,
  ...home,
  ...siteChrome,
  ...about,
  ...exhibitions,
  ...brand,
  ...archive,
  ...auth,
  ...nativeAuth,
  ...artistClaim,
  ...communityBoard,
  ...faq,
  ...inquiry,
  ...contestEntries,
  ...profileEditor,
  ...flipbooks,
  ...regulations,
  ...kakaoShare,
  ...notFound,
  ...discovery,
  ...homepagePrograms,
  ...events,
  ...artistDetail,
  ...greetings,
  ...blog,
  ...membership,
  ...fundraising,

  // 공통 UI 요소
  loading: '読み込み中...',
  error: 'エラーが発生しました',
  retry: '再試行',
  close: '閉じる',
  save: '保存',
  cancel: 'キャンセル',
  confirm: '確認',
  delete: '削除',
  edit: '編集',
  add: '追加',
  remove: '削除',
  submit: '送信',
  reset: 'リセット',

  // 홈 페이지
  artGalleryExhibition: '東洋書道協会',
  journeyThroughArts: '正法の継承、創新の調和',
  // brand-rollout L1·L2 SSOT (brand-guidelines §1·§8)
  homeHeroL1: '古典に学び、新たな書の美をひらく。',
  homeHeroL2:
    '東洋書芸協会は、古典に深く学びながら現代の感性を取り入れ、書と人がともに深まる文化を目指してまいります。',
  homePhilosophyTitle: '文字に精神を、書に時代を',
  homePhilosophyBody:
    '書は、単に美しい文字を書く技術ではありません。一筆の強弱、墨の濃淡、余白の呼吸の中には、書き手の時間と心、人格と修養が共に映し出されます。東洋書芸協会は、法古創新の精神に基づき古典に深く学び、人書俱老の姿勢をもって、書と人がともに深まる文化を育んでまいります。',
  // brand-rollout D3 What We Do (brand-guidelines §2 Section 3 SSOT)
  homeWhatWeDoTitle: '協会の活動',
  homeWhatWeDoExhibitionLabel: '展覧会',
  homeWhatWeDoExhibitionBody: '漢文書芸、ハングル書芸、文人画、現代書芸を網羅する展覧会の開催。',
  homeWhatWeDoContestLabel: '公募展',
  homeWhatWeDoContestBody: '大韓民國東洋書藝大展などにより、作家発掘と作品発表の場を提供。',
  homeWhatWeDoEducationLabel: '教育',
  homeWhatWeDoEducationBody: '基礎書芸から創作、鑑賞、篆刻、文人画まで体系的な教育。',
  homeWhatWeDoExchangeLabel: '交流',
  homeWhatWeDoExchangeBody: '国内外の文字芸術団体との文化交流の拡大。',
  homeWhatWeDoResearchLabel: '研究',
  homeWhatWeDoResearchBody: '東洋文字文化と書芸美学の現代的解釈。',
  // brand-rollout D4 Brand Message (brand-guidelines §2 Section 4 SSOT)
  homeBrandMessageTitle: 'ハングルのリズム、漢文の深み、書の精神',
  homeBrandMessageBody:
    'ハングルは音の秩序を通して、生の感性と情感を繊細に映し出し、漢文は意と形を凝縮させ、長きにわたる思索と哲学を内に湛えています。書はこの二つの文字世界を筆先で出会わせ、線と墨、余白と気韻を通して、文字を芸術の境地へと導きます。',
  // brand-rollout community-page D2 Hero (community-marketing-playbook §1.1 SSOT)
  communityHeroL1: '一筆を共にひく人々',
  communityHeroBody:
    '東洋書芸協会は、古典に学び新たをひらき、書と人がともに深まる同道(どうどう)の集まりをひらきます。',
  // D3 DaoArchitecture (community-marketing-playbook §1.1·§1.3 SSOT)
  communityDaoTitle: '三道 — ともに歩む道',
  communityDaoBeopgoTitle: '法古 · 古典に学ぶ',
  communityDaoBeopgoBody: '臨書と名跡の研究を通して、伝統の深みを身につけます。',
  communityDaoChangsinTitle: '創新 · 新たをひらく',
  communityDaoChangsinBody: '漢文書芸とハングル書芸、文人画と現代書芸の境界をともにひらきます。',
  communityDaoInseoGunoTitle: '人書俱老 · ともに深まる',
  communityDaoInseoGunoBody: '自らの書を顧み、100日臨書で一息ずつを重ねます。',
  // D4 ImseoCard (community-marketing-playbook §7 SSOT, OQ#3 채택)
  communityImseoTitle: '100日臨書 · 一筆の時間',
  communityImseoBody:
    '毎日一筆あるいは一字を臨書に移しながら、書と人がともに深まる時間を重ねます。早い成果より、もう一呼吸を置きます。',
  communityImseoMeta: '第1期 · 定員30名 · 100日',
  communityImseoCtaLabel: '第1期募集案内をカフェで見る',
  communityImseoMailLabel: 'または事務局までお問い合わせ · info@orientalcalligraphy.org',
  // OQ#2 deferred — 사무국 결정 대기, 결정 시 1줄 갱신
  communityCafeNaverUrl: '#',
  communityKakaoUrl: '#',
  // D5 CafeEntry (community-marketing-playbook §3 채널 아키텍처 SSOT)
  communityCafeTitle: '同道の集う場 — カフェとオープンチャット',
  communityCafeBody: '作品の共有や合評、運営の案内が交わされる場です。',
  communityCafeNaverLabel: 'Naverカフェへ入る',
  communityCafeKakaoLabel: 'KakaoTalkオープンチャット',
  // D6 MembershipBranch (OQ#4 채택, BrandMessage 패턴 재사용)
  communityMembershipTitle: '正会員になるには',
  communityMembershipBody:
    '正会員は、協会の意思決定や定期展への出品などに共に携わる方々です。手続きと定款は別途のご案内に従います。',
  communityMembershipCtaLabel: '正会員のご案内',
  aboutTitle: '紹介',
  aboutText:
    '社団法人東洋書道協会は正法の継承発展と創新の調和ある実現を通じて東洋書道文化の発展と普及に先頭に立っています。',
  gallerySpace: 'ギャラリー空間',
  whereArtsBecome: '芸術が現実になる場所',
  ourSpace: '私たちの空間',
  ourSpaceText:
    'ソウル城北区に位置する東洋書道協会は書道文化を体験し学習できる最適な環境を提供します。',

  // 작품 페이지
  artCollection: '作品コレクション',
  discoverMasterpieces: '名作を発見しましょう',
  artworksDescription: '正法の継承と創新の調和で誕生した東洋芸術の美しさを体験してください',
  searchPlaceholder: '作品名、作家名、タグで検索...',

  // 공통 용어
  all: '全体',
  category: 'カテゴリー',
  style: 'スタイル',
  sort: '並び替え',
  featured: 'おすすめ順',
  traditional: '伝統',
  contemporary: '現代',
  modern: 'モダン',
  available: '購入可能',
  sold: '販売完了',
  views: '閲覧',
  likes: 'いいね',
  signOut: 'ログアウト',
}

export default staticTable
