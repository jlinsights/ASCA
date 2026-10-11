import type { Language } from '@/lib/i18n/types'

// 명예이사장 인사말(2025-02-05). 한국어가 원문, 영어는 기존 공식 번역.
// 일본어·중국어(번체)는 2026-10-11 초안 — 원문에서 옮긴 번역임을 화면에 밝힌다(translationNote).
// 서명의 한자 이름(惺谷 林炫圻)은 연혁 기록(app/history/_data/history-events.ts)의 표기를 따른다.

export interface ChairmanMessage {
  tabLabel: string
  body: string
  translationNote?: string
}

export const chairmanMessages: Record<Language, ChairmanMessage> = {
  ko: {
    tabLabel: '한국어',
    body: `동양서예협회에 참여하신 여러분, 환영합니다!

사단법인 동양서예협회(ASCA)는 한국, 중국, 일본을 잇는 동양 서예의 전통을 존중하고 계승하면서, 동시에 현대적 표현의 가능성을 열어가는 전문 예술문화기관입니다.

우리 협회는 동아시아 각국의 고유한 서예 전통에 대한 깊은 이해를 바탕으로, 서예 예술가와 애호가를 연결하는 가교 역할을 수행합니다. 한국의 서예(書藝), 중국의 서법(書法), 일본의 서도(書道)가 지닌 각기 다른 미학과 철학을 존중하면서도, 이를 관통하는 동양 문자예술의 보편적 아름다움을 탐구합니다.

협회는 정기적인 전시회 개최, 학술 세미나, 워크숍, 그리고 국제 교류 프로그램을 통해 서예 문화의 대중화와 전문화를 동시에 추구합니다. 전통의 우아함과 현대의 도전을 결합하여, 동양 서예가 새로운 시대에도 그 생명력을 유지하고 발전할 수 있도록 노력하고 있습니다.

正法의 계승 발전과 創新의 조화로운 구현 — 이것이 우리 동양서예협회가 추구하는 핵심 가치입니다.

여러분의 참여와 관심이 동양 서예 문화의 미래를 밝히는 소중한 빛이 됩니다.

2025년 2월 5일

사단법인 동양서예협회 명예이사장 성곡 임 현 기 拜`,
  },
  en: {
    tabLabel: 'English',
    body: `Welcome to the Asian Society of Calligraphic Arts (ASCA)!

ASCA is a professional art and cultural organization dedicated to respecting and inheriting the traditions of East Asian calligraphy spanning Korea, China, and Japan, while simultaneously opening new possibilities for contemporary expression.

Our association serves as a bridge connecting calligraphic artists and enthusiasts, built upon a deep understanding of each East Asian country's unique calligraphic traditions. We respect the distinct aesthetics and philosophies of Korean Seoyae (書藝), Chinese Shufa (書法), and Japanese Shodō (書道), while exploring the universal beauty of Eastern character art that flows through them all.

Through regular exhibitions, academic seminars, workshops, and international exchange programs, ASCA pursues both the popularization and professionalization of calligraphic culture. By combining the elegance of tradition with the challenges of contemporary times, we strive to ensure that Oriental calligraphy maintains its vitality and continues to develop in a new era.

"Inheriting and advancing the Orthodox Way (正法) while harmoniously realizing Creative Innovation (創新)" — this is the core value that ASCA pursues.

Your participation and interest become a precious light illuminating the future of East Asian calligraphic culture.

February 5, 2025

Lim Hyun-gi (Seong-gok), Honorary Chairman of the Asian Society of Calligraphic Arts (ASCA)`,
  },
  ja: {
    tabLabel: '日本語',
    translationNote: '※ 韓国語原文からの翻訳です。',
    body: `東洋書芸協会にご参加くださった皆様、ようこそ。

社団法人東洋書芸協会(ASCA)は、韓国・中国・日本を結ぶ東洋書芸の伝統を尊び受け継ぎながら、同時に現代的表現の可能性を切り拓く専門の芸術文化機関です。

当協会は、東アジア各国固有の書の伝統への深い理解を基盤に、書の芸術家と愛好家をつなぐ架け橋の役割を担っています。韓国の書芸(書藝)、中国の書法(書法)、日本の書道(書道)がそれぞれに持つ美学と哲学を尊重しつつ、それらを貫く東洋の文字芸術の普遍的な美を探究します。

協会は、定期的な展覧会の開催、学術セミナー、ワークショップ、そして国際交流プログラムを通じて、書芸文化の大衆化と専門化を同時に追求しています。伝統の優雅さと現代の挑戦を結びつけ、東洋書芸が新しい時代にもその生命力を保ち、発展し続けられるよう努めております。

正法の継承発展と創新の調和ある実現 — これこそが、私ども東洋書芸協会の追求する核心的価値です。

皆様のご参加とご関心が、東洋書芸文化の未来を照らす尊い光となります。

2025年2月5日

社団法人東洋書芸協会 名誉理事長 惺谷 林炫圻 拝`,
  },
  zh: {
    tabLabel: '中文',
    translationNote: '※ 本文譯自韓文原文。',
    body: `歡迎各位參與東洋書藝協會！

社團法人東洋書藝協會(ASCA)是一個尊重並傳承連結韓國、中國、日本之東洋書藝傳統，同時開拓當代表現可能性的專業藝術文化機構。

本會以對東亞各國獨特書藝傳統的深刻理解為基礎，擔任連結書藝家與愛好者的橋樑。我們尊重韓國書藝、中國書法、日本書道各自不同的美學與哲學，同時探究貫穿其中的東方文字藝術之普遍之美。

本會透過定期舉辦展覽、學術研討會、工作坊以及國際交流計畫，同時追求書藝文化的大眾化與專業化。我們結合傳統的典雅與當代的挑戰，致力使東洋書藝在新時代中仍能保持生命力並持續發展。

正法之傳承發展與創新之和諧實現 — 這正是東洋書藝協會所追求的核心價值。

各位的參與和關注，將成為照亮東洋書藝文化未來的珍貴之光。

2025年2月5日

社團法人東洋書藝協會 名譽理事長 惺谷 林炫圻 拜`,
  },
}
