// 화면 번역을 합친 정적 표 (zh). 펼치는 순서가 곧 우선순위다 — 뒤에 오는 키가 앞을 덮는다.
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

  // 공통 UI 요소
  loading: '加載中...',
  error: '發生錯誤',
  retry: '重試',
  close: '關閉',
  save: '保存',
  cancel: '取消',
  confirm: '確認',
  delete: '刪除',
  edit: '編輯',
  add: '添加',
  remove: '移除',
  submit: '提交',
  reset: '重置',

  // 홈 페이지
  artGalleryExhibition: '東洋書藝協會',
  journeyThroughArts: '正法的傳承，創新的和諧',
  // brand-rollout L1·L2 SSOT (brand-guidelines §1·§8)
  homeHeroL1: '法古創新，人書俱老。',
  homeHeroL2: '法古開新，人書俱老。以筆承道，以書養心。',
  homePhilosophyTitle: '以文承神，以書通時',
  homePhilosophyBody:
    '書藝不僅是書寫之技，更是修心養性的藝術。每一筆之輕重、墨色之濃淡、結體之平衡、空白之呼吸，皆蘊含著書者的時間、氣韻與精神。本協會秉持法古創新之精神，深學古法而開啟新境；亦以人書俱老為志，追求書與人共同成熟之境界。',
  // brand-rollout D3 What We Do (brand-guidelines §2 Section 3 SSOT)
  homeWhatWeDoTitle: '本協會之活動',
  homeWhatWeDoExhibitionLabel: '展覽',
  homeWhatWeDoExhibitionBody: '涵蓋漢文書藝、韓文書藝、文人畫與現代書藝之多元展覽。',
  homeWhatWeDoContestLabel: '公募',
  homeWhatWeDoContestBody: '大韓民國東洋書藝大展等公募展，為作家發掘與作品發表搭建舞臺。',
  homeWhatWeDoEducationLabel: '教育',
  homeWhatWeDoEducationBody: '自基礎書藝至創作、鑑賞、篆刻、文人畫，循序漸進之系統教育。',
  homeWhatWeDoExchangeLabel: '交流',
  homeWhatWeDoExchangeBody: '與國內外文字藝術團體推動文化交流。',
  homeWhatWeDoResearchLabel: '研究',
  homeWhatWeDoResearchBody: '東方文字文化與書藝美學之當代詮釋。',
  // brand-rollout D4 Brand Message (brand-guidelines §2 Section 4 SSOT)
  homeBrandMessageTitle: '韓文之律，漢文之深，書藝之神',
  homeBrandMessageBody:
    '韓文以聲音之序，細膩呈現生命的感性與情感；漢文以意與象之凝，承載悠遠之思辨與哲學。書藝令此二文字世界於筆端相遇，以線、墨、空白與氣韻，將文字引向藝術之境。',
  // brand-rollout community-page D2 Hero (community-marketing-playbook §1.1 SSOT)
  communityHeroL1: '共執一筆者',
  communityHeroBody: '東洋書藝協會開啟同道之聚 — 法古而開新，書與人共同深熟。',
  // D3 DaoArchitecture (community-marketing-playbook §1.1·§1.3 SSOT)
  communityDaoTitle: '三道 — 共行之道',
  communityDaoBeopgoTitle: '法古 · 學古之法',
  communityDaoBeopgoBody: '透過臨書與名跡之研讀，深植傳統之根。',
  communityDaoChangsinTitle: '創新 · 開啟新境',
  communityDaoChangsinBody: '共同開啟漢文書藝、韓文書藝、文人畫與現代書藝之疆界。',
  communityDaoInseoGunoTitle: '人書俱老 · 書與人共老',
  communityDaoInseoGunoBody: '顧己之書，以百日臨書積累一呼一吸。',
  // D4 ImseoCard (community-marketing-playbook §7 SSOT, OQ#3 채택)
  communityImseoTitle: '百日臨書 · 一筆之時',
  communityImseoBody: '每日臨寫一筆或一字，積累書與人共同深熟之時間。寧多一息，不貪速成。',
  communityImseoMeta: '第一期 · 名額30人 · 100日',
  communityImseoCtaLabel: '於社羣查看第一期招募指南',
  communityImseoMailLabel: '或聯絡祕書處 · info@orientalcalligraphy.org',
  // OQ#2 deferred — 사무국 결정 대기, 결정 시 1줄 갱신
  communityCafeNaverUrl: '#',
  communityKakaoUrl: '#',
  // D5 CafeEntry (community-marketing-playbook §3 채널 아키텍처 SSOT)
  communityCafeTitle: '同道相聚之處 — 社羣與聊天室',
  communityCafeBody: '作品分享、合評與運營訊息交匯之所。',
  communityCafeNaverLabel: '進入Naver社羣',
  communityCafeKakaoLabel: 'KakaoTalk公開聊天',
  // D6 MembershipBranch (OQ#4 채택, BrandMessage 패턴 재사용)
  communityMembershipTitle: '加入正式會員',
  communityMembershipBody:
    '正會員為共同參與協會決策、定期展覽出品等事務之成員。申請程序與章程依另行公告辦理。',
  communityMembershipCtaLabel: '正會員介紹',
  aboutTitle: '關於',
  aboutText:
    '社團法人東洋書藝協會通過正法的傳承發展與創新的和諧實現，引領東洋書藝文化的發展與普及。',
  gallerySpace: '畫廊空間',
  whereArtsBecome: '藝術成爲現實的地方',
  ourSpace: '我們的空間',
  ourSpaceText: '位於首爾城北區的東洋書藝協會爲體驗和學習書法文化提供最佳環境。',

  // 작품 페이지
  artCollection: '藝術收藏',
  discoverMasterpieces: '發現傑作',
  artworksDescription: '體驗由正法傳承與創新和諧而誕生的東方藝術之美',
  searchPlaceholder: '按作品標題、藝術家姓名、標籤搜索...',

  // 공통 용어
  all: '全部',
  category: '分類',
  style: '風格',
  sort: '排序',
  featured: '推薦',
  traditional: '傳統',
  contemporary: '當代',
  modern: '現代',
  available: '可購買',
  sold: '已售出',
  views: '瀏覽',
  likes: '點贊',
  signOut: '退出登錄',
}

export default staticTable
