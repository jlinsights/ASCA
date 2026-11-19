// 예전 컨텍스트에 내장돼 있던 번역 (ja). 같은 키가 정적 표에 있으면 정적 표가 이긴다.
const legacy: Record<string, string> = {
  // Navigation
  exhibition: '展示',
  artworks: '作品',
  artists: '作家',
  events: '行事',
  catalog: '図録',
  about: '紹介',
  organization: '組織',
  support: '支援',
  brand: 'ブランド',
  language: '言語',
  news: 'ニュース',
  search: '検索',
  signIn: 'ログイン',
  signUp: '会員登録',
  menu: 'メニュー',

  // Exhibition submenu
  currentExhibitions: '現在の展示',
  upcomingExhibitions: '予定展示',
  pastExhibitions: '過去の展示',
  onlineExhibitions: 'オンライン展示',

  // Artworks submenu
  hangeulCalligraphy: 'ハングル書道',
  hanjaCalligraphy: '漢字書道',
  literatiPainting: '文人画',
  inkPainting: '水墨画',
  orientalPainting: '東洋画',
  folkPainting: '民画',
  modernCalligraphy: '現代書道',
  calligraphyArt: 'カリグラフィー',
  sealEngraving: '篆刻',
  woodEngraving: '書刻',
  photography: '写真',
  video: '映像',

  // Artists submenu
  openCallArtists: '公募作家',
  youngArtists: '青年作家',
  recommendedArtists: '推薦作家',
  invitedArtists: '招待作家',

  // Common
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

  // Home page
  artGalleryExhibition: '東洋書道協会',
  journeyThroughArts: '正法の継承、創新の調和',
  aboutTitle: '紹介',
  aboutText:
    '社団法人東洋書道協会は正法の継承発展と創新の調和ある実現を通じて東洋書道文化の発展と普及に先頭に立っています。',
  gallerySpace: 'ギャラリー空間',
  whereArtsBecome: '芸術が現実になる場所',
  ourSpace: '私たちの空間',
  ourSpaceText:
    'ソウル城北区に位置する東洋書道協会は書道文化を体験し学習できる最適な環境を提供します。',

  // Artworks page
  artCollection: '作品コレクション',
  discoverMasterpieces: '名作を発見しましょう',
  artworksDescription: '正法の継承と創新の調和で誕生した東洋芸術の美しさを体験してください',
  searchPlaceholder: '作品名、作家名、タグで検索...',

  // Common UI
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

  // お知らせ (app/notice)
  notice: 'お知らせ',
  importantNotice: '重要なお知らせ',
  generalNotice: '一般のお知らせ',
  noticeInquiry: 'お知らせに関するお問い合わせ',
  noticeInquiryText: 'お知らせについてのご質問は、協会事務局までご連絡ください。',
  previous: '前へ',
  next: '次へ',
}

export default legacy
