// partners 화면 번역 (en) — /partners 유관단체. 네 언어를 모으는 곳은 lib/i18n/translations/partners.ts 다.
// 분류 제목(partnersCat_<id>)의 ko 값은 app/partners/_components/partners-data.ts 의 title 과 같아야 한다(테스트). 기관 이름은 번역하지 않는다.
const partners: Record<string, string> = {
  partnersTitle: 'Partners',
  partnersLede:
    'Associations and organisations connected with the Asian Society of Calligraphic Arts, directly or indirectly, or in partnership with it.',
  partnersFactCategories: 'Categories',
  partnersCategoryCount: '{n}',
  partnersFactListed: 'Listed organisations',
  partnersOrgCount: '{n}',
  partnersMarqueeLabel: 'Names',
  partnersChapterTitle: 'Organisations we work with',
  partnersChapterNote:
    "Select a name to open that organisation's website in a new window. Names are shown in their original language.",
  partnersNewWindow: '(opens in a new window)',
  partnersCat_organizations: 'Related institutions and organisations',
  partnersCat_museums: 'Art museums and museums',
  partnersCat_publications: 'Calligraphy and art journals',
  partnersCat_galleries: 'Galleries',
  partnersCat_partners: 'Partners',
}

export default partners
