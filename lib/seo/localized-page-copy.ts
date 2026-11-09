import type { PrefixedLanguage } from '@/lib/i18n/locale-routing'

/**
 * 언어 주소(/en·/ja·/zh)의 <title>·description. 한국어 값은 각 page.tsx 의 metadata 가 원본이고,
 * 여기는 그 번역이다 — 사실(연도·마감일·장소)을 더하지 않는다. 서버에서만 읽는다(클라이언트 번들에 싣지 않는다).
 * 용어는 화면 번역표(lib/i18n/locales)와 같게: 대전 = Korea Oriental Calligraphy Exhibition / 大韓民国 東洋書芸大展 /
 * 大韓民國東洋書藝大展, 심사위원 = juror / 審査委員 / 評審委員. 중국어는 번체.
 * lib/seo/__tests__/localized-metadata.test.ts 가 번역된 페이지(LOCALIZED_PATHS)마다 세 언어가 다 있는지 본다.
 */

export interface PageCopy {
  title: string
  description: string
}

export type LocalizedPageCopy = Record<PrefixedLanguage, PageCopy>

export const LOCALIZED_PAGE_COPY: Readonly<Record<string, LocalizedPageCopy>> = {
  '/': {
    en: {
      title: 'Asian Society of Calligraphic Arts | Korea Oriental Calligraphy Exhibition',
      description:
        'The Asian Society of Calligraphic Arts (ASCA) is an arts organization carrying on the calligraphy tradition that links Korea, China and Japan. Entries and exhibitions of the Korea Oriental Calligraphy Exhibition, recommended and invited artists, and calligraphy courses.',
    },
    ja: {
      title: '社団法人 東洋書道協会 | 大韓民国 東洋書芸大展',
      description:
        '社団法人 東洋書道協会(ASCA)は、韓国・中国・日本を結ぶ東洋書道の伝統を受け継ぐ芸術文化団体です。大韓民国 東洋書芸大展の公募と展示、推薦・招待作家の選定、書道講座をご案内します。',
    },
    zh: {
      title: '社團法人 東洋書藝協會 | 大韓民國東洋書藝大展',
      description:
        '社團法人東洋書藝協會(ASCA)是承續連結韓國、中國、日本之東洋書藝傳統的藝術文化團體。介紹大韓民國東洋書藝大展的徵件與展覽、推薦・招待作家的選定，以及書藝課程。',
    },
  },
  '/introductions': {
    en: {
      title: 'About',
      description:
        'The Asian Society of Calligraphic Arts (ASCA) carries the calligraphy tradition linking Korea, China and Japan into the art of today. Starting from a 1997 Korea–China–Japan exchange exhibition, it now holds the Korea Oriental Calligraphy Exhibition.',
    },
    ja: {
      title: '協会紹介',
      description:
        '社団法人 東洋書道協会(ASCA)は、韓国・中国・日本を結ぶ東洋書道の伝統を今日の芸術へと広げる専門芸術文化団体です。1997年の日中韓交流展に始まり、大韓民国 東洋書芸大展を開催しています。',
    },
    zh: {
      title: '協會簡介',
      description:
        '社團法人東洋書藝協會(ASCA)是將連結韓國、中國、日本的東洋書藝傳統延續為當代藝術的專業藝術文化團體。始於1997年韓中日交流展，現舉辦大韓民國東洋書藝大展。',
    },
  },
  '/history': {
    en: {
      title: 'History',
      description:
        'The history of the Asian Society of Calligraphic Arts — its main activities and exhibitions from the 1997 Korea–China–Japan calligraphy exchange exhibition to today.',
    },
    ja: {
      title: '沿革',
      description:
        '社団法人 東洋書道協会の沿革。1997年の日中韓書道文化交流連合会展に始まる、現在までの主な活動と展示の歩みをご覧いただけます。',
    },
    zh: {
      title: '沿革',
      description:
        '社團法人東洋書藝協會的沿革。自1997年韓中日書藝文化交流聯合會展起，至今的主要活動與展覽紀錄。',
    },
  },
  '/mission': {
    en: {
      title: 'Mission',
      description:
        'The mission, core values and goals of the Asian Society of Calligraphic Arts. 法古創新 · 人書俱老 — learning the old methods to open the new, a calligraphy culture in which the writing and the writer grow deeper together.',
    },
    ja: {
      title: '使命',
      description:
        '東洋書道協会の使命、核となる価値、主な目標をご紹介します。法古創新 · 人書俱老 — 古法を学んで新しさを開き、書と人がともに深まる書道文化をつくります。',
    },
    zh: {
      title: '使命',
      description:
        '介紹東洋書藝協會的使命、核心價值與主要目標。法古創新 · 人書俱老 — 習古法以開新境，營造書與人共同深化的書藝文化。',
    },
  },
  '/greetings': {
    en: {
      title: "Chairman's Greeting",
      description:
        'A greeting from the Chairman of the Asian Society of Calligraphic Arts, introducing the 23rd Korea Oriental Calligraphy Exhibition and the 書境 invited artists exhibition across Galleries 1 and 2 of the Seoul Arts Center Calligraphy Museum.',
    },
    ja: {
      title: '理事長ご挨拶',
      description:
        '社団法人 東洋書道協会 理事長のご挨拶。芸術の殿堂 書芸博物館 第1・第2展示室の全館で開かれる第23回 大韓民国 東洋書芸大展と書境 招待作家展をご案内します。',
    },
    zh: {
      title: '理事長致辭',
      description:
        '社團法人東洋書藝協會理事長致辭。介紹於藝術殿堂書藝博物館第1、第2展覽室全館舉辦的第23屆大韓民國東洋書藝大展與書境招待作家展。',
    },
  },
  '/brand': {
    en: {
      title: 'Brand & Style Guide',
      description:
        'ASCA Ink System, the visual language of the Asian Society of Calligraphic Arts (東洋書藝協會) — official names, logo, navy and gold palette, typefaces, voice, form elements, components and photography rules.',
    },
    ja: {
      title: 'ブランド・スタイルガイド',
      description:
        '社団法人 東洋書道協会(東洋書藝協會)の視覚言語 ASCA Ink System — 公式名称、ロゴ、紺と金のパレット、書体、語り口、形の要素、コンポーネント、写真の扱いをご案内します。',
    },
    zh: {
      title: '品牌・風格指南',
      description:
        '社團法人東洋書藝協會的視覺語言 ASCA Ink System — 正式名稱、標誌、藏青與金色色盤、字體、語氣、形式元素、元件與照片處理規範。',
    },
  },
  '/membership': {
    en: {
      title: 'Membership',
      description:
        'Membership grades of the Asian Society of Calligraphic Arts — requirements, annual dues and benefits for young artists, general artists, recommended artists, invited artists and officers, and how to join.',
    },
    ja: {
      title: '会員案内',
      description:
        '東洋書道協会の会員等級ごとの資格要件、年会費、特典のご案内。青年作家、一般作家、推薦作家、招待作家、役員の等級別特典と入会方法をご確認ください。',
    },
    zh: {
      title: '會員指南',
      description:
        '東洋書藝協會各會員等級的資格要件、年費與權益。請確認青年作家、一般作家、推薦作家、招待作家、幹部各等級的權益與入會方式。',
    },
  },
  '/fundraising': {
    en: {
      title: 'Dues & Support',
      description:
        'Pay annual dues, registration fees and development contributions to the Asian Society of Calligraphic Arts online, by bank transfer or by automatic debit. Dues by grade, deadlines, the programs dues fund, and budget, settlement and audit procedures, with the original regulations.',
    },
    ja: {
      title: '会費・ご支援',
      description:
        '東洋書道協会の年会費・登録費・発展基金を、オンライン決済、銀行振込、自動引き落としでお納めください。等級別会費と納付期限、会費が使われる協会事業、予算・決算・会計監査の手続きを定款と規定の原文とともにご案内します。',
    },
    zh: {
      title: '會費・贊助',
      description:
        '以線上付款、銀行匯款或自動扣款繳納東洋書藝協會年費、登錄費與發展基金。依等級的會費與繳納期限、會費所用的協會事業，以及預算・決算・會計查核程序，連同章程與規定原文說明。',
    },
  },
  '/academy': {
    en: {
      title: 'Courses',
      description:
        'Calligraphy courses connected with the Asian Society of Calligraphic Arts — the Saturday regular course at Munwon Hanmun Calligraphy Academy, the 2026 autumn timetable of the Seoul Arts Center Calligraphy Academy, tuition, and the entry-fee discount for students.',
    },
    ja: {
      title: '講座',
      description:
        '東洋書道協会がつなぐ書道講座のご案内。Munwon Hanmun Calligraphy Academy の土曜定期課程と芸術の殿堂 書画アカデミー 2026年秋の定期時間割、受講料、協会受講生の出品料割引をご確認ください。',
    },
    zh: {
      title: '課程',
      description:
        '東洋書藝協會所連結的書藝課程。Munwon Hanmun Calligraphy Academy 週六正規課程與藝術殿堂書畫學院2026秋季正規課表、學費，以及協會學員的參展費折扣。',
    },
  },
  '/contests': {
    en: {
      title: 'Open Call',
      description:
        'Guidelines for the 23rd Korea Oriental Calligraphy Exhibition — entries close 31 January 2027. Categories, eligibility, sizes, entry fees and awards, with records of past exhibitions.',
    },
    ja: {
      title: '公募展',
      description:
        '第23回 大韓民国 東洋書芸大展 公募要項 — 受付締切 2027年1月31日。出品部門・資格・規格・出品料・表彰と歴代大展の記録をご案内します。',
    },
    zh: {
      title: '徵件',
      description:
        '第23屆大韓民國東洋書藝大展徵件簡章 — 收件截止2027年1月31日。介紹參展類別、資格、規格、參展費、獎項與歷屆大展紀錄。',
    },
  },
  '/contests/23': {
    en: {
      title: 'The 23rd Korea Oriental Calligraphy Exhibition',
      description:
        'The 23rd Korea Oriental Calligraphy Exhibition, held by the Asian Society of Calligraphic Arts — the open call, schedule and how to enter.',
    },
    ja: {
      title: '第23回 大韓民国 東洋書芸大展',
      description:
        '東洋書道協会が主催する第23回 大韓民国 東洋書芸大展 — 公募、日程、出品方法をご案内します。',
    },
    zh: {
      title: '第23屆大韓民國東洋書藝大展',
      description: '東洋書藝協會主辦的第23屆大韓民國東洋書藝大展 — 徵件、日程與參展方式。',
    },
  },
  '/awards': {
    en: {
      title: 'Awards',
      description:
        'Award grades and prize money of the Korea Oriental Calligraphy Exhibition, and the dates and venues of every exhibition since the first, with the original regulations and the society’s history.',
    },
    ja: {
      title: '表彰',
      description:
        '大韓民国 東洋書芸大展の賞の等級と賞金、そして第1回から続く歴代大展の開催期間と会場を、規定の原文・協会の沿革とともにご案内します。',
    },
    zh: {
      title: '獎項',
      description:
        '大韓民國東洋書藝大展的獎項等級與獎金，以及自第1屆以來歷屆大展的舉辦期間與場地，連同規定原文與協會沿革說明。',
    },
  },
  '/application': {
    en: {
      title: 'Entry Form',
      description:
        'Fill in the entry form for the Korea Oriental Calligraphy Exhibition online, or submit the Word or PDF form. Categories, work sizes, entry fees, judging and awards, with the original regulations.',
    },
    ja: {
      title: '出品申込書',
      description:
        '大韓民国 東洋書芸大展の出品申込書をオンラインで作成するか、Word・PDF様式で提出してください。公募部門と作品規格、出品料、審査方式、表彰内容を規定の原文とともにご案内します。',
    },
    zh: {
      title: '參展申請表',
      description:
        '線上填寫大韓民國東洋書藝大展參展申請表，或以 Word・PDF 表單提交。連同規定原文說明徵件類別、作品規格、參展費、評審方式與獎項。',
    },
  },
  '/application-for-recommended-invited-calligrapher': {
    en: {
      title: 'Recommended & Invited Artist Application',
      description:
        'Apply online for promotion to recommended or invited artist, or for special appointment. Points for awards at the Korea Oriental Calligraphy Exhibition, the requirements beyond points, the qualification review, and the fee for non-member appointment, with the original regulations.',
    },
    ja: {
      title: '推薦・招待作家 申請',
      description:
        '推薦作家・招待作家への昇格と特別選任をオンラインで申請してください。大韓民国 東洋書芸大展の入賞配点、点数とは別に必要な要件、資格審査委員会の審査手続き、非会員の特別選任費用を規定の原文とともにご案内します。',
    },
    zh: {
      title: '推薦・招待作家申請',
      description:
        '線上申請晉升推薦作家・招待作家或特別選任。連同規定原文說明大韓民國東洋書藝大展的得獎配分、分數以外的必要條件、資格審查委員會的審查程序，以及非會員特別選任費用。',
    },
  },
  '/commissioning-application': {
    en: {
      title: 'Committee Appointment Application',
      description:
        'Apply to serve as a juror, steering committee member or recruiting committee member of the Korea Oriental Calligraphy Exhibition, online or with the HWP or PDF form. Qualifications, appointment procedure, allowances and fairness principles, with the original regulations.',
    },
    ja: {
      title: '委員委嘱 申請',
      description:
        '大韓民国 東洋書芸大展の審査委員・運営委員・募集委員の委嘱申請書をオンラインで作成するか、HWP・PDF様式で提出してください。委員ごとの資格、委嘱手続き、手当、公正性の原則を規定の原文とともにご案内します。',
    },
    zh: {
      title: '委員委任申請',
      description:
        '線上填寫或以 HWP・PDF 表單提交大韓民國東洋書藝大展評審委員・營運委員・招募委員委任申請書。連同規定原文說明各委員資格、委任程序、津貼與公正原則。',
    },
  },
  '/exhibitions': {
    en: {
      title: 'Exhibitions',
      description:
        'Exhibitions held by the Asian Society of Calligraphic Arts, including the Korea Oriental Calligraphy Exhibition and invited artists exhibitions — current, upcoming, past and online.',
    },
    ja: {
      title: '展示',
      description:
        '大韓民国 東洋書芸大展や招待作家展など、東洋書道協会が開いてきた展示を、開催中・予定・過去の展示とオンライン展示に分けてご案内します。',
    },
    zh: {
      title: '展覽',
      description:
        '將大韓民國東洋書藝大展與招待作家展等東洋書藝協會所舉辦的展覽，分為現正展出、即將展出、過往展覽與線上展覽介紹。',
    },
  },
  '/exhibitions/current': {
    en: {
      title: 'Current Exhibitions',
      description:
        'Exhibitions now on, held by the Asian Society of Calligraphic Arts — dates and venues gathered from the society’s history records.',
    },
    ja: {
      title: '開催中の展示',
      description:
        '東洋書道協会が主催する、現在開催中の展示をご覧ください。会期と会場を協会の沿革記録からまとめてお見せします。',
    },
    zh: {
      title: '現正展出',
      description: '東洋書藝協會主辦、現正展出的展覽。展期與場地彙整自協會沿革紀錄。',
    },
  },
  '/exhibitions/upcoming': {
    en: {
      title: 'Upcoming Exhibitions',
      description:
        'Upcoming exhibitions of the Asian Society of Calligraphic Arts — dates and venues gathered from the society’s history records.',
    },
    ja: {
      title: '今後の展示',
      description:
        'これから開かれる東洋書道協会の展示をご覧ください。予定されている展示の会期と会場を協会の沿革記録からまとめてご案内します。',
    },
    zh: {
      title: '即將展出',
      description: '東洋書藝協會即將舉辦的展覽。預定展覽的展期與場地彙整自協會沿革紀錄。',
    },
  },
  '/exhibitions/past': {
    en: {
      title: 'Past Exhibitions',
      description:
        'A record of the exhibitions the Asian Society of Calligraphic Arts has held since 1997 — dates and venues of the Korea Oriental Calligraphy Exhibition and other exhibitions, gathered from the society’s history.',
    },
    ja: {
      title: '過去の展示',
      description:
        '1997年から東洋書道協会が開いてきた展示の記録です。大韓民国 東洋書芸大展をはじめとする協会展示の会期と会場を沿革からまとめてお見せします。',
    },
    zh: {
      title: '過往展覽',
      description:
        '自1997年以來東洋書藝協會所舉辦展覽的紀錄。大韓民國東洋書藝大展等協會展覽的展期與場地彙整自沿革。',
    },
  },
  '/exhibitions/online': {
    en: {
      title: 'Online Exhibitions',
      description:
        'A record of the online exhibitions of the Asian Society of Calligraphic Arts — dates and contents gathered from the society’s history records.',
    },
    ja: {
      title: 'オンライン展示',
      description:
        'オンラインで開かれた東洋書道協会の展示の記録です。ウェブで開かれた展示の会期と内容を協会の沿革記録からまとめてお見せします。',
    },
    zh: {
      title: '線上展覽',
      description: '東洋書藝協會線上展覽的紀錄。網路展覽的展期與內容彙整自協會沿革紀錄。',
    },
  },
  '/contact': {
    en: {
      title: 'Contact',
      description:
        'How to reach the Asian Society of Calligraphic Arts — guidance pages by topic (entries, membership, dues, promotion, committee applications, courses), live chat, KakaoTalk, phone and email, the procedure for objections to contest and exhibition results, and the addresses of the head office and offices.',
    },
    ja: {
      title: 'お問い合わせ',
      description:
        '東洋書道協会へのお問い合わせ。出品・会員・会費・昇格・委員申請・講座など用件別の案内ページと、リアルタイム相談、カカオトーク、電話、メールの窓口、公募・展示結果への異議申し立て手続き、本部と事務所の住所をご確認ください。',
    },
    zh: {
      title: '聯絡我們',
      description:
        '東洋書藝協會聯絡方式。參展・會員・會費・晉升・委員申請・課程等各類說明頁面，以及即時諮詢、KakaoTalk、電話、電子郵件窗口、徵件與展覽結果異議程序、總部與辦事處地址。',
    },
  },
  '/artists/homepages': {
    en: {
      title: 'Artist Homepages',
      description:
        'Artists of the Asian Society of Calligraphic Arts who keep their works and exhibition records on their own homepages — artist homepages built and run by the secretariat, with 書境 solo and booth exhibitions.',
    },
    ja: {
      title: '作家のホームページ',
      description:
        '個人のホームページで作品と展示の記録を重ねていく東洋書道協会の作家たちです。協会事務局が構築・運営する作家ホームページと書境 個展・ブース展のご案内をあわせてご覧ください。',
    },
    zh: {
      title: '作家網站',
      description:
        '在個人網站延續作品與展覽紀錄的東洋書藝協會作家。一併介紹協會祕書處建置與營運的作家網站，以及書境個展・展位展。',
    },
  },
  '/notice': {
    en: {
      title: 'Notices',
      description:
        'Notices from the Asian Society of Calligraphic Arts — society news, events, and contest and exhibition schedules, in order of posting.',
    },
    ja: {
      title: 'お知らせ',
      description:
        '東洋書道協会のお知らせ — 協会のニュースと行事案内、公募・展示の日程を掲載順にお知らせします。',
    },
    zh: {
      title: '公告',
      description: '東洋書藝協會公告 — 依刊登順序發布協會消息、活動資訊與徵件・展覽日程。',
    },
  },
  '/faq': {
    en: {
      title: 'Frequently Asked Questions',
      description:
        'Questions and answers on membership and dues, contest entries and judging, solo and booth exhibitions and catalogues, artist homepages, courses, accounts and support.',
    },
    ja: {
      title: 'よくある質問',
      description:
        '会員登録・会費、公募展の出品・審査、個展・ブース展・図録、作家ホームページ、講座、アカウント・ご支援について、質問と回答でご案内します。',
    },
    zh: {
      title: '常見問題',
      description:
        '以問答形式說明會員加入・會費、徵件參展・評審、個展・展位展・圖錄、作家網站、課程、帳號與贊助。',
    },
  },
  '/community': {
    en: {
      title: 'A Place for Fellow Calligraphers',
      description:
        'A place for fellow travellers (同道) who draw the stroke together. The Asian Society of Calligraphic Arts learns the old methods to open the new, and fosters a calligraphy culture in which the writing and the writer grow deeper together.',
    },
    ja: {
      title: '同道の場',
      description:
        'ひと筆をともに引く同道たちの場。東洋書道協会は古法を学んで新しさを開き、書と人がともに深まる書道文化をひらきます。',
    },
    zh: {
      title: '同道之所',
      description: '共同揮毫的同道之所。東洋書藝協會習古法以開新境，開啟書與人共同深化的書藝文化。',
    },
  },
  '/regulations': {
    en: {
      title: 'Articles & Regulations',
      description:
        'The articles of incorporation of the Asian Society of Calligraphic Arts and its regulations on membership and dues, operation and judging, exhibitions, recommended and invited artists, appraisal, branches and objections, and the qualifications for artists, members and officers, article by article.',
    },
    ja: {
      title: '定款・規定',
      description:
        '社団法人 東洋書道協会の定款と、会員・会費、運営・審査、展示、推薦・招待作家選任、作品鑑定、支部・支会、異議申し立ての規定、作家・会員・役員の資格と要件を、条文単位でご案内します。',
    },
    zh: {
      title: '章程與規定',
      description:
        '社團法人東洋書藝協會的章程，以及會員・會費、營運・評審、展覽、推薦・招待作家選任、作品鑑定、分會・支會、異議處理等規定與作家・會員・幹部資格要件，逐條說明。',
    },
  },
}
