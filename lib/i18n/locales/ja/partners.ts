// partners 화면 번역 (ja) — /partners 유관단체. 네 언어를 모으는 곳은 lib/i18n/translations/partners.ts 다.
// 분류 제목(partnersCat_<id>)의 ko 값은 app/partners/_components/partners-data.ts 의 title 과 같아야 한다(테스트). 기관 이름은 번역하지 않는다.
const partners: Record<string, string> = {
  partnersTitle: '関係団体',
  partnersLede:
    '社団法人 東洋書芸協会と直接または間接に関わりがある、あるいはパートナーシップを結んでいる協会・団体をご紹介します。',
  partnersFactCategories: '分類',
  partnersCategoryCount: '{n}分類',
  partnersFactListed: '掲載機関・団体',
  partnersOrgCount: '{n}か所',
  partnersMarqueeLabel: '名称の帯',
  partnersChapterTitle: 'ともに歩む機関',
  partnersChapterNote:
    '名称を押すと、その機関のウェブサイトが新しいウィンドウで開きます。名称は原語のまま表示しています。',
  partnersNewWindow: '(新しいウィンドウ)',
  partnersCat_organizations: '関係機関・団体',
  partnersCat_museums: '美術館・博物館',
  partnersCat_publications: '書道・美術専門誌',
  partnersCat_galleries: '画廊・ギャラリー',
  partnersCat_partners: 'パートナー',
}

export default partners
