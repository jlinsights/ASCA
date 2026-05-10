import type { Language, TranslationData } from './types'
import { navigationTranslations } from './translations/navigation'
import { artworksTranslations } from './translations/artworks'

// 통합된 번역 데이터
export const translations: TranslationData = {
  ko: {
    ...navigationTranslations.ko,
    ...artworksTranslations.ko,

    // 공통 UI 요소
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    retry: '다시 시도',
    close: '닫기',
    save: '저장',
    cancel: '취소',
    confirm: '확인',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    remove: '제거',
    submit: '제출',
    reset: '초기화',

    // 홈 페이지
    artGalleryExhibition: '동양서예협회',
    journeyThroughArts: '正法의 계승, 創新의 조화',
    // brand-rollout L1·L2 SSOT (brand-guidelines §1·§8)
    homeHeroL1: '옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어집니다.',
    homeHeroL2:
      '동양서예협회는 옛 법을 깊이 익혀 오늘의 감각으로 새로움을 열고, 글씨와 사람이 함께 깊어지는 서예 문화를 지향합니다.',
    homePhilosophyTitle: '문자에 정신을 담고, 서예로 시대를 잇습니다',
    homePhilosophyBody:
      '서예는 단순히 글자를 아름답게 쓰는 일이 아닙니다. 한 획의 강약, 먹의 농담, 여백의 호흡 속에는 작가의 시간과 마음, 인격과 수양이 함께 담깁니다. 동양서예협회는 法古創新의 정신으로 고전을 깊이 익히고, 人書俱老의 자세로 글씨와 사람이 함께 성숙하는 서예 문화를 만들어갑니다.',
    // brand-rollout D3 What We Do (brand-guidelines §2 Section 3 SSOT)
    homeWhatWeDoTitle: '동양서예협회가 하는 일',
    homeWhatWeDoExhibitionLabel: '전시',
    homeWhatWeDoExhibitionBody: '한문서예, 한글서예, 문인화, 현대서예를 아우르는 전시 개최',
    homeWhatWeDoContestLabel: '공모전',
    homeWhatWeDoContestBody: '대한민국 동양서예대전 등 작가 발굴과 작품 발표의 장 마련',
    homeWhatWeDoEducationLabel: '교육',
    homeWhatWeDoEducationBody: '기초 서예부터 창작, 감상, 전각, 문인화까지 체계적 교육',
    homeWhatWeDoExchangeLabel: '교류',
    homeWhatWeDoExchangeBody: '국내외 문자예술 단체와의 문화 교류 확대',
    homeWhatWeDoResearchLabel: '연구',
    homeWhatWeDoResearchBody: '동양 문자문화와 서예미학의 현대적 해석',
    // brand-rollout D4 Brand Message (brand-guidelines §2 Section 4 SSOT)
    homeBrandMessageTitle: '한글의 리듬, 한문의 깊이, 서예의 정신',
    homeBrandMessageBody:
      '한글은 소리의 질서를 통해 삶의 감각과 정서를 섬세하게 드러내고, 한문은 뜻과 형상을 응축하여 오랜 사유와 철학을 품습니다. 서예는 이 두 문자 세계를 붓끝에서 만나게 하며, 선과 먹, 여백과 기운을 통해 문자를 예술의 경지로 이끕니다.',
    // brand-rollout D5 Closing CTA (brand-guidelines §2 Section 5 SSOT)
    homeClosingCtaTitle: '오늘의 서예, 함께 새롭게 써 내려갑니다',
    homeClosingCtaBody:
      '동양서예협회는 서예가 과거의 유산에 머무르지 않고, 오늘의 삶과 다음 세대의 감각 속에서 다시 살아나는 예술이 되기를 바랍니다.',
    homeClosingCtaButtonAbout: '협회 철학 보기',
    homeClosingCtaButtonExhibitions: '전시·공모전 둘러보기',
    homeClosingCtaButtonCommunity: '함께하는 서예 문화',
    homeClosingCtaButtonEducation: '서예 배우기',
    // brand-rollout community-page D2 Hero (community-marketing-playbook §1.1 SSOT)
    communityHeroL1: '한 획을 함께 긋는 사람들',
    communityHeroBody:
      '동양서예협회는 옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어지는 동도(同道)들의 자리를 엽니다.',
    // D3 DaoArchitecture (community-marketing-playbook §1.1·§1.3 SSOT)
    communityDaoTitle: '三道 — 함께 걷는 길',
    communityDaoBeopgoTitle: '法古 · 옛 법을 익히다',
    communityDaoBeopgoBody: '임서와 명적을 통해 전통의 깊이를 익힙니다.',
    communityDaoChangsinTitle: '創新 · 새로움을 열다',
    communityDaoChangsinBody: '한문서예와 한글서예, 문인화와 현대서예의 경계를 함께 엽니다.',
    communityDaoInseoGunoTitle: '人書俱老 · 함께 깊어지다',
    communityDaoInseoGunoBody: '자기 글씨를 회고하고 100일 임서로 한 호흡씩 쌓아갑니다.',
    // D4 ImseoCard (community-marketing-playbook §7 SSOT, OQ#3 채택)
    communityImseoTitle: '100일 임서 — 한 획의 시간',
    communityImseoBody:
      '매일 한 획 또는 한 자(字)를 임서로 옮기며, 글씨와 사람이 함께 깊어지는 시간을 만듭니다. 빠른 성과보다 호흡 한 번을 더 둡니다.',
    communityImseoMeta: '1기 정원 30명 · 기간 100일',
    communityImseoCtaLabel: '카페에서 1기 모집 안내 보기',
    communityImseoMailLabel: '또는 사무국 문의 · info@orientalcalligraphy.org',
    // OQ#2 deferred — 사무국 결정 대기, 결정 시 1줄 갱신
    communityCafeNaverUrl: '#',
    communityKakaoUrl: '#',
    // D5 CafeEntry (community-marketing-playbook §3 채널 아키텍처 SSOT)
    communityCafeTitle: '동도들의 자리 — 카페와 오픈채팅',
    communityCafeBody: '작품 공유와 합평, 운영 안내가 오가는 자리입니다.',
    communityCafeNaverLabel: '네이버 카페 입장',
    communityCafeKakaoLabel: '카카오톡 오픈채팅',
    // D6 MembershipBranch (OQ#4 채택, BrandMessage 패턴 재사용)
    communityMembershipTitle: '정회원이 되고 싶으시면',
    communityMembershipBody:
      '정회원은 협회 의사결정과 정기 전시 출품 등에 함께하시는 분들입니다. 절차와 정관은 별도 안내를 따릅니다.',
    communityMembershipCtaLabel: '정회원 안내 보기',
    aboutTitle: '소개',
    aboutText:
      '사단법인 동양서예협회는 正法의 계승 발전과 創新의 조화로운 구현을 통해 동양 서예 문화의 발전과 보급에 앞장서고 있습니다.',
    gallerySpace: '갤러리 공간',
    whereArtsBecome: '예술이 현실이 되는 곳',
    ourSpace: '우리의 공간',
    ourSpaceText:
      '서울 성북구에 위치한 동양서예협회는 서예 문화를 체험하고 학습할 수 있는 최적의 환경을 제공합니다.',

    // 작품 페이지
    artCollection: '작품 컬렉션',
    discoverMasterpieces: '명작을 발견하세요',
    artworksDescription: '正法의 계승과 創新의 조화로 탄생한 동양 예술의 아름다움을 경험하세요',
    searchPlaceholder: '작품명, 작가명, 태그로 검색...',

    // 공통 용어
    all: '전체',
    category: '카테고리',
    style: '스타일',
    sort: '정렬',
    featured: '추천순',
    traditional: '전통',
    contemporary: '현대',
    modern: '모던',
    available: '구매가능',
    sold: '판매완료',
    views: '조회',
    likes: '좋아요',
    signOut: '로그아웃',
  },

  en: {
    ...navigationTranslations.en,
    ...artworksTranslations.en,

    // 공통 UI 요소
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

    // 홈 페이지
    artGalleryExhibition: 'Oriental Calligraphy Association',
    journeyThroughArts: 'TRADITION AND MODERNITY, INCLUSION AND COMMUNICATION',
    // brand-rollout L1·L2 SSOT (brand-guidelines §1·§8)
    homeHeroL1: 'Rooted in Tradition, Renewed Through Calligraphy.',
    homeHeroL2:
      'The Asian Society of Calligraphic Arts seeks to renew tradition through contemporary expression, cultivating a culture in which calligraphy and character mature together.',
    homePhilosophyTitle: 'Embodying Spirit in Letters, Bridging Eras Through Calligraphy',
    homePhilosophyBody:
      'Calligraphy is more than the art of beautiful writing. Each stroke carries the time, breath, and character of the artist — held in the weight of a line, the depth of ink, and the breath of empty space. Guided by the spirit of Beopgo Changsin (creating anew through a deep understanding of tradition) and Inseo Guno (calligraphy and character mature together), the Society cultivates a culture in which calligraphy remains a living art for today and tomorrow.',
    // brand-rollout D3 What We Do (brand-guidelines §2 Section 3 SSOT)
    homeWhatWeDoTitle: 'What We Do',
    homeWhatWeDoExhibitionLabel: 'Exhibitions',
    homeWhatWeDoExhibitionBody:
      'Curating exhibitions across classical Chinese-character calligraphy, Korean Hangeul calligraphy, literati painting, and contemporary expression.',
    homeWhatWeDoContestLabel: 'Competitions',
    homeWhatWeDoContestBody:
      'The Korea Oriental Calligraphy Grand Exhibition and other open calls — discovering artists and presenting new work.',
    homeWhatWeDoEducationLabel: 'Education',
    homeWhatWeDoEducationBody:
      'Structured programs from foundational practice to creative work, appreciation, seal carving, and literati painting.',
    homeWhatWeDoExchangeLabel: 'Exchange',
    homeWhatWeDoExchangeBody:
      'Cultural collaboration with calligraphic and lettering communities at home and abroad.',
    homeWhatWeDoResearchLabel: 'Research',
    homeWhatWeDoResearchBody:
      'Contemporary interpretation of East Asian writing culture and calligraphic aesthetics.',
    // brand-rollout D4 Brand Message (brand-guidelines §2 Section 4 SSOT)
    homeBrandMessageTitle: 'The Rhythm of Hangeul, the Depth of Hanja, the Spirit of Calligraphy',
    homeBrandMessageBody:
      'Hangeul reveals the senses and emotions of daily life through the order of sound; Hanja distills meaning and form to hold long-standing thought and philosophy. Calligraphy brings these two writing worlds together at the tip of the brush — through line, ink, empty space, and breath — and lifts the letter to the realm of art.',
    // brand-rollout D5 Closing CTA (brand-guidelines §2 Section 5 SSOT)
    homeClosingCtaTitle: 'Writing Today’s Calligraphy, Together',
    homeClosingCtaBody:
      'The Asian Society of Calligraphic Arts hopes that calligraphy does not remain a relic of the past, but lives anew in the rhythms of today and the sensibilities of generations to come.',
    homeClosingCtaButtonAbout: 'Our Philosophy',
    homeClosingCtaButtonExhibitions: 'Exhibitions',
    homeClosingCtaButtonCommunity: 'Join Our Calligraphy Community',
    homeClosingCtaButtonEducation: 'Learn Calligraphy',
    // brand-rollout community-page D2 Hero (community-marketing-playbook §1.1 SSOT)
    communityHeroL1: 'One Stroke, Together',
    communityHeroBody:
      'The Asian Society of Calligraphic Arts opens a circle of fellow travelers — the 동도 (dongdo) — who learn from tradition, open new ground, and mature alongside their calligraphy.',
    // D3 DaoArchitecture (community-marketing-playbook §1.1·§1.3 SSOT)
    communityDaoTitle: 'The Three Ways',
    communityDaoBeopgoTitle: 'Beopgo · Learning the Old',
    communityDaoBeopgoBody:
      'Through imseo (copying) and the study of classical works, we deepen our grounding in tradition.',
    communityDaoChangsinTitle: 'Changsin · Opening the New',
    communityDaoChangsinBody:
      'We open the borders between classical, Hangeul, literati, and contemporary calligraphy together.',
    communityDaoInseoGunoTitle: 'Inseo Guno · Maturing Together',
    communityDaoInseoGunoBody:
      'We reflect on our own work and build, breath by breath, through the 100-day imseo practice.',
    // D4 ImseoCard (community-marketing-playbook §7 SSOT, OQ#3 채택)
    communityImseoTitle: '100-Day Imseo · The Time of One Stroke',
    communityImseoBody:
      'Each day, copy a single stroke or character through imseo. Build, breath by breath, the time in which calligraphy and character mature together. We hold one breath longer than the rush of result.',
    communityImseoMeta: 'Cohort 1 · 30 dongdo · 100 days',
    communityImseoCtaLabel: 'View Cohort 1 in the Café',
    communityImseoMailLabel: 'Or contact the secretariat · info@orientalcalligraphy.org',
    // OQ#2 deferred — 사무국 결정 대기, 결정 시 1줄 갱신
    communityCafeNaverUrl: '#',
    communityKakaoUrl: '#',
    // D5 CafeEntry (community-marketing-playbook §3 채널 아키텍처 SSOT)
    communityCafeTitle: 'Where the 동도 Gather',
    communityCafeBody: 'A place for sharing work, peer critique, and community announcements.',
    communityCafeNaverLabel: 'Enter the Naver Café',
    communityCafeKakaoLabel: 'Open KakaoTalk Chat',
    // D6 MembershipBranch (OQ#4 채택, BrandMessage 패턴 재사용)
    communityMembershipTitle: 'Becoming a Full Member',
    communityMembershipBody:
      "Full members participate in the Society's governance and regular exhibitions. The application process and bylaws are guided separately.",
    communityMembershipCtaLabel: 'About Full Membership',
    aboutTitle: 'About',
    aboutText:
      'The Asian Society of Calligraphic Arts (ASCA) leads the development and promotion of Oriental calligraphy culture through the harmonious implementation of tradition preservation and creative innovation.',
    gallerySpace: 'Gallery Space',
    whereArtsBecome: 'WHERE ARTS BECOME REALITY',
    ourSpace: 'Our Space',
    ourSpaceText:
      'Located in Seongbuk-gu, Seoul, the Oriental Calligraphy Association provides the optimal environment for experiencing and learning calligraphy culture.',

    // 작품 페이지
    artCollection: 'Art Collection',
    discoverMasterpieces: 'Discover Masterpieces',
    artworksDescription:
      'Experience the beauty of Oriental art born from the harmonious implementation of tradition preservation and creative innovation',
    searchPlaceholder: 'Search by artwork title, artist name, tags...',

    // 공통 용어
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
  },

  ja: {
    ...navigationTranslations.ja,
    ...artworksTranslations.ja,

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
    // brand-rollout D5 Closing CTA (brand-guidelines §2 Section 5 SSOT)
    homeClosingCtaTitle: '今日の書を、ともに新たに書き進めます',
    homeClosingCtaBody:
      '東洋書芸協会は、書が過去の遺産にとどまらず、今日の暮らしと次世代の感性の中で再び息づく芸術となることを願っています。',
    homeClosingCtaButtonAbout: '協会の理念',
    homeClosingCtaButtonExhibitions: '展覧会・公募展',
    homeClosingCtaButtonCommunity: '書芸文化を共に',
    homeClosingCtaButtonEducation: '書を学ぶ',
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
  },

  zh: {
    ...navigationTranslations.zh,
    ...artworksTranslations.zh,

    // 공통 UI 요소
    loading: '加载中...',
    error: '发生错误',
    retry: '重试',
    close: '关闭',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    remove: '移除',
    submit: '提交',
    reset: '重置',

    // 홈 페이지
    artGalleryExhibition: '东方书法协会',
    journeyThroughArts: '正法的传承，创新的和谐',
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
    homeWhatWeDoContestBody: '大韓民國東洋書藝大展等公募展，為作家發掘與作品發表搭建舞台。',
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
    // brand-rollout D5 Closing CTA (brand-guidelines §2 Section 5 SSOT)
    homeClosingCtaTitle: '今日之書藝，與您共筆新章',
    homeClosingCtaBody:
      '東洋書藝協會願使書藝不止於過往遺產，而在當下生活與下一世代的感覺中，重新煥發為當代藝術。',
    homeClosingCtaButtonAbout: '協會理念',
    homeClosingCtaButtonExhibitions: '展覽與公募',
    homeClosingCtaButtonCommunity: '共承書藝文化',
    homeClosingCtaButtonEducation: '書藝學習',
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
    communityImseoCtaLabel: '於社群查看第一期招募指南',
    communityImseoMailLabel: '或聯絡秘書處 · info@orientalcalligraphy.org',
    // OQ#2 deferred — 사무국 결정 대기, 결정 시 1줄 갱신
    communityCafeNaverUrl: '#',
    communityKakaoUrl: '#',
    // D5 CafeEntry (community-marketing-playbook §3 채널 아키텍처 SSOT)
    communityCafeTitle: '同道相聚之處 — 社群與聊天室',
    communityCafeBody: '作品分享、合評與運營訊息交匯之所。',
    communityCafeNaverLabel: '進入Naver社群',
    communityCafeKakaoLabel: 'KakaoTalk公開聊天',
    // D6 MembershipBranch (OQ#4 채택, BrandMessage 패턴 재사용)
    communityMembershipTitle: '加入正式會員',
    communityMembershipBody:
      '正會員為共同參與協會決策、定期展覽出品等事務之成員。申請程序與章程依另行公告辦理。',
    communityMembershipCtaLabel: '正會員介紹',
    aboutTitle: '关于',
    aboutText:
      '社团法人东方书法协会通过正法的传承发展与创新的和谐实现，引领东方书法文化的发展与普及。',
    gallerySpace: '画廊空间',
    whereArtsBecome: '艺术成为现实的地方',
    ourSpace: '我们的空间',
    ourSpaceText: '位于首尔城北区的东方书法协会为体验和学习书法文化提供最佳环境。',

    // 작품 페이지
    artCollection: '艺术收藏',
    discoverMasterpieces: '发现杰作',
    artworksDescription: '体验由正法传承与创新和谐而诞生的东方艺术之美',
    searchPlaceholder: '按作品标题、艺术家姓名、标签搜索...',

    // 공통 용어
    all: '全部',
    category: '分类',
    style: '风格',
    sort: '排序',
    featured: '推荐',
    traditional: '传统',
    contemporary: '当代',
    modern: '现代',
    available: '可购买',
    sold: '已售出',
    views: '浏览',
    likes: '点赞',
    signOut: '退出登录',
  },
}

// 번역 함수
export const getTranslation = (language: Language, key: string): string => {
  const translation = translations[language]?.[key]
  if (translation) {
    return translation
  }

  // 폴백: 한국어로 시도
  const fallback = translations.ko[key]
  if (fallback) {
    return fallback
  }

  // 마지막 폴백: 키 자체 반환
  return key
}

// 번역 타입 (타입 안전성)
export type TranslationKey = keyof typeof translations.ko

// 클라이언트용 동기 번역 함수 (하위 호환성)
export const t = (key: TranslationKey | string, language: Language = 'ko'): string => {
  return getTranslation(language, key)
}

export default translations
