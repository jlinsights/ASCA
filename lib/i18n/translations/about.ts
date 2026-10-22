import type { TranslationData } from '../types'

// 소개(/introductions)·연혁(/history) 페이지 문구. 'intro'·'history' 접두어로 다른 표와 키가 겹치지 않게 한다.
// 이사장 인사말 본문은 길어서 app/introductions/_components/chairman-message.ts 에 따로 둔다.
// 중국어는 번체(사이트 표기 통일, 2026-10-11 결정).
export const aboutTranslations: TranslationData = {
  ko: {
    introEyebrow: 'Introduction',
    introTitle: '소 개',
    introLede: '사단법인 동양서예협회의 비전과 활동을 소개합니다',
    introMotto: '“正法의 계승 발전과 創新의 조화로운 구현”',
    introDownloadTitle: '소개 자료 다운로드',
    introBrochureKo: '협회 소개 브로셔 (한국어)',
    introBrochureMulti: '소개 브로셔 (한·영·중·일)',
    historyEyebrow: 'History',
    historyTitle: '연 혁',
    historyLede:
      '1997년 韓·中·日 書藝文化交流聯合會展을 시작으로, 동양서예의 전통을 계승하고 발전시켜 온 협회의 발자취를 소개합니다.',
    historyClosing: '1997년부터 이어온 동양서예의 전통과 역사',
    historyTypeExhibition: '전시',
    historyTypeEvent: '행사',
    historyTypeMilestone: '이정표',
    historyTypeAppointment: '취임',
  },
  en: {
    introEyebrow: 'Introduction',
    introTitle: 'About',
    introLede: 'The vision and work of the Asian Society of Calligraphic Arts',
    introMotto:
      '“Carrying the orthodox way (正法) forward in harmony with creative innovation (創新)”',
    introDownloadTitle: 'Download Brochures',
    introBrochureKo: 'ASCA Brochure (Korean)',
    introBrochureMulti: 'Brochure (Korean · English · Chinese · Japanese)',
    historyEyebrow: 'History',
    historyTitle: 'History',
    historyLede:
      'Since the 1997 Korea–China–Japan Calligraphy Culture Exchange Exhibition (韓·中·日 書藝文化交流聯合會展), the record of how the Society has carried East Asian calligraphy forward.',
    historyClosing: 'The tradition and history of East Asian calligraphy since 1997',
    historyTypeExhibition: 'Exhibition',
    historyTypeEvent: 'Event',
    historyTypeMilestone: 'Milestone',
    historyTypeAppointment: 'Appointment',
  },
  ja: {
    introEyebrow: 'Introduction',
    introTitle: '協会紹介',
    introLede: '社団法人東洋書芸協会のビジョンと活動をご紹介します',
    introMotto: '「正法の継承発展と創新の調和ある実現」',
    introDownloadTitle: '紹介資料ダウンロード',
    introBrochureKo: '協会紹介パンフレット(韓国語)',
    introBrochureMulti: '紹介パンフレット(韓・英・中・日)',
    historyEyebrow: 'History',
    historyTitle: '沿革',
    historyLede:
      '1997年の韓・中・日 書藝文化交流聯合會展に始まり、東洋書芸の伝統を受け継ぎ発展させてきた協会の歩みをご紹介します。',
    historyClosing: '1997年から続く東洋書芸の伝統と歴史',
    historyTypeExhibition: '展示',
    historyTypeEvent: '行事',
    historyTypeMilestone: '節目',
    historyTypeAppointment: '就任',
  },
  zh: {
    introEyebrow: 'Introduction',
    introTitle: '協會簡介',
    introLede: '介紹社團法人東洋書藝協會的願景與活動',
    introMotto: '「正法之傳承發展與創新之和諧實現」',
    introDownloadTitle: '簡介資料下載',
    introBrochureKo: '協會簡介手冊(韓文)',
    introBrochureMulti: '簡介手冊(韓·英·中·日)',
    historyEyebrow: 'History',
    historyTitle: '沿革',
    historyLede: '自1997年韓·中·日書藝文化交流聯合會展起，介紹本會傳承並發展東洋書藝傳統的歷程。',
    historyClosing: '自1997年延續至今的東洋書藝傳統與歷史',
    historyTypeExhibition: '展覽',
    historyTypeEvent: '活動',
    historyTypeMilestone: '里程碑',
    historyTypeAppointment: '就任',
  },
}
