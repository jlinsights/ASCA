// 예전 컨텍스트에 내장돼 있던 번역 (zh). 같은 키가 정적 표에 있으면 정적 표가 이긴다.
const legacy: Record<string, string> = {
  // Navigation
  exhibition: '展覽',
  artworks: '藝術品',
  artists: '藝術家',
  events: '活動',
  catalog: '目錄',
  about: '關於',
  organization: '組織',
  support: '支持',
  brand: '品牌',
  language: '語言',
  news: '新聞',
  search: '搜索',
  signIn: '登錄',
  signUp: '註冊',
  menu: '菜單',

  // Exhibition submenu
  currentExhibitions: '當前展覽',
  upcomingExhibitions: '即將舉辦的展覽',
  pastExhibitions: '過去的展覽',
  onlineExhibitions: '在線展覽',

  // Artworks submenu
  hangeulCalligraphy: '韓文書法',
  hanjaCalligraphy: '漢字書法',
  literatiPainting: '文人畫',
  inkPainting: '水墨畫',
  orientalPainting: '東方畫',
  folkPainting: '民畫',
  modernCalligraphy: '現代書法',
  calligraphyArt: '書法藝術',
  sealEngraving: '篆刻',
  woodEngraving: '書刻',
  photography: '攝影',
  video: '視頻',

  // Artists submenu
  openCallArtists: '公開徵集藝術家',
  youngArtists: '青年藝術家',
  recommendedArtists: '推薦藝術家',
  invitedArtists: '邀請藝術家',

  // Common
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

  // Home page
  artGalleryExhibition: '東方書法協會',
  journeyThroughArts: '正法的傳承，創新的和諧',
  aboutTitle: '關於',
  aboutText:
    '社團法人東方書法協會通過正法的傳承發展與創新的和諧實現，引領東方書法文化的發展與普及。',
  gallerySpace: '畫廊空間',
  whereArtsBecome: '藝術成爲現實的地方',
  ourSpace: '我們的空間',
  ourSpaceText: '位於首爾城北區的東方書法協會爲體驗和學習書法文化提供最佳環境。',

  // Artworks page
  artCollection: '藝術收藏',
  discoverMasterpieces: '發現傑作',
  artworksDescription: '體驗由正法傳承與創新和諧而誕生的東方藝術之美',
  searchPlaceholder: '按作品標題、藝術家姓名、標籤搜索...',

  // Common UI
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

  // 公告 (app/notice)
  notice: '公告',
  importantNotice: '重要公告',
  generalNotice: '一般公告',
  noticeInquiry: '公告諮詢',
  noticeInquiryText: '如對公告有疑問，請聯繫協會祕書處。',
  previous: '上一頁',
  next: '下一頁',
}

export default legacy
