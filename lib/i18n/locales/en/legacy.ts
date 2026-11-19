// 예전 컨텍스트에 내장돼 있던 번역 (en). 같은 키가 정적 표에 있으면 정적 표가 이긴다.
const legacy: Record<string, string> = {
  // Navigation
  exhibition: 'Exhibition',
  artworks: 'Artworks',
  artists: 'Artists',
  events: 'Events',
  catalog: 'Catalog',
  about: 'About',
  organization: 'Organization',
  support: 'Support',
  brand: 'Brand',
  language: 'Language',
  news: 'News',
  search: 'Search',
  signIn: 'Sign In',
  signUp: 'Sign Up',
  menu: 'Menu',

  // Exhibition submenu
  currentExhibitions: 'Current Exhibitions',
  upcomingExhibitions: 'Upcoming Exhibitions',
  pastExhibitions: 'Past Exhibitions',
  onlineExhibitions: 'Online Exhibitions',

  // Artworks submenu
  hangeulCalligraphy: 'Hangeul Calligraphy',
  hanjaCalligraphy: 'Hanja Calligraphy',
  literatiPainting: 'Literati Painting',
  inkPainting: 'Ink Painting',
  orientalPainting: 'Oriental Painting',
  folkPainting: 'Folk Painting',
  modernCalligraphy: 'Modern Calligraphy',
  calligraphyArt: 'Calligraphy Art',
  sealEngraving: 'Seal Engraving',
  woodEngraving: 'Wood Engraving',
  photography: 'Photography',
  video: 'Video',

  // Artists submenu
  openCallArtists: 'Open Call Artists',
  youngArtists: 'Young Artists',
  recommendedArtists: 'Recommended Artists',
  invitedArtists: 'Invited Artists',

  // Common
  all: 'All',
  category: 'Category',
  style: 'Style',
  sort: 'Sort',
  featured: 'Featured',
  traditional: 'Traditional',
  contemporary: 'Contemporary',
  modern: 'Modern',
  available: 'Available',
  sold: 'Sold',
  views: 'Views',
  likes: 'Likes',
  signOut: 'Sign Out',

  // Home page
  artGalleryExhibition: 'Oriental Calligraphy Association',
  journeyThroughArts: 'TRADITION AND MODERNITY, INCLUSION AND COMMUNICATION',
  aboutTitle: 'About',
  aboutText:
    'The Asian Society of Calligraphic Arts (ASCA) leads the development and promotion of Oriental calligraphy culture through the harmonious implementation of tradition preservation and creative innovation.',
  gallerySpace: 'Gallery Space',
  whereArtsBecome: 'WHERE ARTS BECOME REALITY',
  ourSpace: 'Our Space',
  ourSpaceText:
    'Located in Seongbuk-gu, Seoul, the Oriental Calligraphy Association provides the optimal environment for experiencing and learning calligraphy culture.',

  // Artworks page
  artCollection: 'Art Collection',
  discoverMasterpieces: 'Discover Masterpieces',
  artworksDescription:
    'Experience the beauty of Oriental art born from the harmonious implementation of tradition preservation and creative innovation',
  searchPlaceholder: 'Search by artwork title, artist name, tags...',

  // Common UI
  loading: 'Loading...',
  error: 'An error occurred',
  retry: 'Retry',
  close: 'Close',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  remove: 'Remove',
  submit: 'Submit',
  reset: 'Reset',

  // Notices (app/notice)
  notice: 'Notices',
  importantNotice: 'Important',
  generalNotice: 'General Notices',
  noticeInquiry: 'Questions about notices',
  noticeInquiryText: 'For questions about a notice, please contact the association office.',
  previous: 'Previous',
  next: 'Next',
}

export default legacy
