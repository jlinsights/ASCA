// artist-detail 화면 번역 (ko) — /artists/[id] 작가 상세. 네 언어를 모으는 곳은 lib/i18n/translations/artist-detail.ts 다.
// {year}·{count} 는 화면에서 숫자로 바꾼다. 빈 문자열은 쓰지 않는다 — t() 가 빈 값이면 키 이름을 돌려준다.
const artistDetail: Record<string, string> = {
  adCrumbList: '작가 목록',
  adFactLife: '생몰',
  adFactNationality: '국적',
  adBorn: '{year}년생',
  adDied: '{year}년 별세',
  adLedgerWorks: '공개 작품',
  adUnitWorks: '점',
  adLedgerYears: '작품 연도',
  adLedgerCareer: '경력',
  adUnitCareer: '건',
  adWorksTitle: '작품',
  adWorksNote: '{count}점 · 최근 작품부터',
  adAboutTitle: '작가 소개',
  adCareerTitle: '경력',
  adEmptyLabel: '안내',
  adEmptyNoWorks: '공개된 작품이 아직 없습니다.',
  adEmptyPreparing: '작가 소개와 작품을 준비하고 있습니다.',
  adOtherArtists: '다른 작가 보기',
  adViewWorks: '작품 보기',
  adShare: '공유',
  adShareCopied: '주소를 복사했습니다',
  adFilterLabel: '서체·분야로 거르기',
  adFilterAll: '전체',
  adWallHint: '옆으로 넘겨 보세요',
}

export default artistDetail
