// partners 화면 번역 (zh) — /partners 유관단체. 네 언어를 모으는 곳은 lib/i18n/translations/partners.ts 다.
// 분류 제목(partnersCat_<id>)의 ko 값은 app/partners/_components/partners-data.ts 의 title 과 같아야 한다(테스트). 기관 이름은 번역하지 않는다.
const partners: Record<string, string> = {
  partnersTitle: '相關團體',
  partnersLede: '介紹與社團法人 東洋書藝協會直接或間接相關，或建立夥伴關係的協會及團體。',
  partnersFactCategories: '分類',
  partnersCategoryCount: '{n}類',
  partnersFactListed: '收錄機關・團體',
  partnersOrgCount: '{n}處',
  partnersMarqueeLabel: '名稱橫幅',
  partnersMarqueePause: '暫停名稱橫幅',
  partnersMarqueePlay: '繼續播放名稱橫幅',
  partnersChapterTitle: '攜手同行的機關',
  partnersChapterNote: '點選名稱即以新視窗開啟該機關網站。名稱維持原文。',
  partnersNewWindow: '(新視窗)',
  partnersCat_organizations: '相關機關及團體',
  partnersCat_museums: '美術館及博物館',
  partnersCat_publications: '書法及美術專業期刊',
  partnersCat_galleries: '畫廊',
  partnersCat_collaborators: '夥伴',
}

export default partners
