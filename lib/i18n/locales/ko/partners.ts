// partners 화면 번역 (ko) — /partners 유관단체. 네 언어를 모으는 곳은 lib/i18n/translations/partners.ts 다.
// 분류 제목(partnersCat_<id>)의 ko 값은 app/partners/_components/partners-data.ts 의 title 과 같아야 한다(테스트). 기관 이름은 번역하지 않는다.
const partners: Record<string, string> = {
  partnersTitle: '유관단체',
  partnersLede:
    '사단법인 동양서예협회와 직접 혹은 간접적으로 관련이 있거나 파트너십 관계를 맺고 있는 협회 및 단체들을 소개합니다.',
  partnersFactCategories: '분류',
  partnersCategoryCount: '{n}개',
  partnersFactListed: '등재 기관·단체',
  partnersOrgCount: '{n}곳',
  partnersMarqueeLabel: '이름 띠',
  partnersChapterTitle: '함께하는 기관',
  partnersChapterNote: '이름을 누르면 해당 기관 누리집이 새 창으로 열립니다.',
  partnersNewWindow: '(새 창)',
  partnersCat_organizations: '관련 기관 및 단체',
  partnersCat_museums: '미술관 및 박물관',
  partnersCat_publications: '서예 및 미술 전문지',
  partnersCat_galleries: '화랑 및 갤러리',
  partnersCat_partners: '파트너',
}

export default partners
