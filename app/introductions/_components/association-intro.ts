import type { Language } from '@/lib/i18n/types'

// 협회 소개 본문. 이사장 인사말은 /greetings 에 따로 있으므로, 여기는 서명 없는 협회 소개로 쓴다(2026-10-30).
// 한국어가 원문이고, 영어·일본어·중국어(번체)는 원문에서 옮긴 번역임을 화면에 밝힌다(translationNote).
// 연도·부문·제도는 연혁(app/history/_data)과 운영 및 심사 규정 제5조(공모 5개 부문)를 따른다.

export interface AssociationIntro {
  tabLabel: string
  heading: string
  body: string
  translationNote?: string
}

export const associationIntros: Record<Language, AssociationIntro> = {
  ko: {
    tabLabel: '한국어',
    heading: '협회 소개',
    body: `사단법인 동양서예협회(ASCA)는 한국·중국·일본을 잇는 동양 서예의 전통을 이어 오늘의 예술로 펼쳐 가는 전문 예술문화단체입니다.

협회의 뿌리는 1997년 한·중·일 서예문화교류연합회전에 닿아 있습니다. 세 나라 서예가들이 필묵으로 나눈 교류는 2001년 제1회 대한민국 동양서예대전으로 이어졌고, 2012년 10월 문화체육관광부의 법인 설립 허가를 받아 사단법인 동양서예협회로 새롭게 출발하였습니다. 대한민국 동양서예대전은 2027년 제23회를 맞습니다.

협회는 한글, 한문, 현대서예·캘리그라피, 전각·서각, 문인화·동양화의 다섯 부문을 아우릅니다. 한국의 서예(書藝), 중국의 서법(書法), 일본의 서도(書道)가 지닌 저마다의 미학을 존중하며, 그 모두를 관통하는 동양 문자예술의 아름다움을 탐구합니다. 전통부문과 현대부문으로 나눈 초대작가 제도는 옛 법을 지키는 작가와 새 길을 여는 작가가 함께 설 자리를 마련합니다.

협회가 품은 두 마디가 있습니다. 法古創新, 옛 법을 깊이 익혀 새로움을 엽니다. 人書俱老, 글씨와 사람이 함께 깊어집니다. 한 획의 강약과 먹의 농담, 여백의 호흡에는 쓰는 이의 시간과 마음이 담깁니다. 기교를 넘어 사람이 함께 자라는 서예, 그것이 협회가 지향하는 길입니다.

협회는 공모전과 초대작가전, 국제 교류전, 교육과 학술 활동을 통해 서예 문화를 넓히고, 새로 단장한 다국어 홈페이지와 온라인 활동 지원으로 국경과 세대를 넘어 작가와 애호가를 잇고 있습니다.`,
  },
  en: {
    tabLabel: 'English',
    heading: 'About ASCA',
    translationNote: '※ Translated from the Korean original.',
    body: `The Asian Society of Calligraphic Arts (ASCA) is a professional arts and cultural organization that carries forward the calligraphic traditions linking Korea, China and Japan and unfolds them as an art of today.

The association's roots go back to the 1997 Korea–China–Japan Calligraphy Culture Exchange Exhibition. The exchange that calligraphers of the three countries shared through brush and ink led to the first Korea Oriental Calligraphy Exhibition in 2001, and in October 2012 the association made a new start as an incorporated society, licensed by the Ministry of Culture, Sports and Tourism. The Korea Oriental Calligraphy Exhibition reaches its 23rd edition in 2027.

ASCA embraces five divisions: Hangeul, Hanmun (Chinese characters), contemporary calligraphy and lettering, seal and wood carving, and literati and Oriental painting. Respecting the distinct aesthetics of Korean Seoye (書藝), Chinese Shufa (書法) and Japanese Shodō (書道), we explore the beauty of Eastern character art that runs through them all. Our invited artist system, divided into traditional and contemporary tracks, gives a place both to artists who keep the old methods and to artists who open new paths.

Two phrases lie at the heart of the association. 法古創新: learn the old methods deeply, and open the new. 人書俱老: calligraphy and the person deepen together. The strength of a stroke, the shading of ink and the breathing of empty space carry the time and heart of the one who writes. Calligraphy in which the person grows along with the craft, beyond mere technique: that is the path we pursue.

Through open competitions, invited artists' exhibitions, international exchange exhibitions, and education and scholarship, ASCA broadens calligraphic culture, and with its newly renovated multilingual website and support for artists' online presence, it connects artists and admirers across borders and generations.`,
  },
  ja: {
    tabLabel: '日本語',
    heading: '協会について',
    translationNote: '※ 韓国語原文からの翻訳です。',
    body: `社団法人東洋書芸協会(ASCA)は、韓国・中国・日本を結ぶ東洋書芸の伝統を受け継ぎ、今日の芸術として繰り広げていく専門の芸術文化団体です。

協会の源は、1997年の韓・中・日 書藝文化交流聯合會展にさかのぼります。三か国の書家が筆墨で交わした交流は、2001年の第1回 大韓民国 東洋書芸大展へとつながり、2012年10月には文化体育観光部の法人設立許可を受け、社団法人東洋書芸協会として新たな出発を遂げました。大韓民国 東洋書芸大展は、2027年に第23回を迎えます。

協会は、ハングル、漢文、現代書芸・カリグラフィー、篆刻・書刻、文人画・東洋画の五部門を擁しています。韓国の書芸(書藝)、中国の書法(書法)、日本の書道(書道)がそれぞれに持つ美学を尊重し、そのすべてを貫く東洋の文字芸術の美を探究します。伝統部門と現代部門に分けた招待作家制度は、古法を守る作家と新たな道を拓く作家がともに立てる場を設けています。

協会が胸に抱く二つの言葉があります。法古創新――古法に深く学び、新しきを拓く。人書俱老――書と人がともに深まる。一画の強弱、墨の濃淡、余白の呼吸には、書く人の時間と心が込められます。技巧を越え、人がともに成長する書芸、それこそが協会の目指す道です。

協会は、公募展と招待作家展、国際交流展、教育と学術活動を通じて書芸文化を広げるとともに、新たに刷新した多言語ホームページとオンライン活動の支援によって、国境と世代を越えて作家と愛好家を結んでいます。`,
  },
  zh: {
    tabLabel: '中文',
    heading: '關於本會',
    translationNote: '※ 本文譯自韓文原文。',
    body: `社團法人東洋書藝協會(ASCA)是一個傳承連結韓國、中國、日本之東洋書藝傳統，並將其開展為當代藝術的專業藝術文化團體。

本會的根源可追溯至1997年的韓·中·日書藝文化交流聯合會展。三國書藝家以筆墨相交的情誼，延續為2001年的第1屆大韓民國東洋書藝大展；2012年10月，本會獲文化體育觀光部核准設立法人，以社團法人東洋書藝協會重新出發。大韓民國東洋書藝大展將於2027年迎來第23屆。

本會涵蓋韓文書藝、漢文書藝、現代書藝·字體設計、篆刻·書刻、文人畫·東洋畫五大部門。我們尊重韓國書藝、中國書法、日本書道各自的美學，並探究貫穿其中的東方文字藝術之美。分為傳統部門與現代部門的邀請作家制度，讓堅守古法的作家與開拓新路的作家都能有一席之地。

本會心中懷有兩句話：法古創新——深學古法，開創新境；人書俱老——書與人一同深化、一同成熟。一筆之輕重、墨色之濃淡、空白之呼吸，都蘊含著書寫者的時間與心性。超越技巧、使人與書一同成長的書藝，正是本會所追求的道路。

本會透過公募展與邀請作家展、國際交流展、教育與學術活動推廣書藝文化，並以全新改版的多語言網站與線上活動支援，跨越國界與世代，連結書藝家與愛好者。`,
  },
}
