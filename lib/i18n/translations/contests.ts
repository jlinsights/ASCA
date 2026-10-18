import type { TranslationData } from '../types'

// 공모전 페이지 상단 플립북(FlipHTML5) 블록.
// 대회명 한자 표기는 사이트 기존 표기(第N回 大韓民國 東洋書藝大展)를, 영문은 공모 요강 표지 표기를 따른다.
export const contestsTranslations: TranslationData = {
  ko: {
    contestFlipbookEyebrow: '공모 요강',
    contestFlipbookTitle: '제23회 대한민국 동양서예대전',
    contestFlipbookLede: '공모 요강과 전시 안내를 책장을 넘기듯 살펴보세요.',
    contestFlipbookOpen: '새 창에서 크게 보기',
    contestFlipbookFrameTitle: '제23회 대한민국 동양서예대전 공모 요강 플립북',
  },
  en: {
    contestFlipbookEyebrow: 'Call for entries',
    contestFlipbookTitle: 'The 23rd Korea Oriental Calligraphy Exhibition',
    contestFlipbookLede: 'Leaf through the call for entries and exhibition guide page by page.',
    contestFlipbookOpen: 'Open full screen in a new tab',
    contestFlipbookFrameTitle:
      'Flipbook: call for entries for the 23rd Korea Oriental Calligraphy Exhibition',
  },
  ja: {
    contestFlipbookEyebrow: '募集要項',
    contestFlipbookTitle: '第23回 大韓民國 東洋書藝大展',
    contestFlipbookLede: '募集要項と展示案内を、ページをめくるようにご覧ください。',
    contestFlipbookOpen: '新しいタブで大きく見る',
    contestFlipbookFrameTitle: '第23回 大韓民國 東洋書藝大展 募集要項フリップブック',
  },
  zh: {
    contestFlipbookEyebrow: '徵稿簡章',
    contestFlipbookTitle: '第23回 大韓民國 東洋書藝大展',
    contestFlipbookLede: '像翻書一樣瀏覽徵稿簡章與展覽介紹。',
    contestFlipbookOpen: '在新分頁中全螢幕檢視',
    contestFlipbookFrameTitle: '第23回 大韓民國 東洋書藝大展 徵稿簡章翻頁冊',
  },
}
