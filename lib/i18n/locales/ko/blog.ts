// blog 화면 번역 (ko) — /blog 목록·글 화면 틀(글 제목·요약·본문은 원문 그대로). 네 언어를 모으는 곳은 lib/i18n/translations/blog.ts 다.
// 빈 문자열은 쓰지 않는다 — t() 가 빈 값이면 키 이름을 돌려준다.
const blog: Record<string, string> = {
  blogHeroTitle: '동양서예 블로그',
  blogHeroLede: '동양서예협회의 다양한 소식과 이야기를 만나보세요',
  blogFactPosts: '게시물',
  blogKakaoTitle: '카카오톡 채널',
  blogKakaoLine1: '동양서예협회 카카오톡 채널에서',
  blogKakaoLine2: '가장 빠른 소식을 받아보세요.',
  blogTistoryTitle: '티스토리 블로그',
  blogTistoryLine1: '공식 블로그에서 더 깊이 있는',
  blogTistoryLine2: '서예 이야기를 확인하세요.',
  blogSearchPlaceholder: '제목, 내용으로 검색...',
  blogRead: '읽기',
  blogVisit: '이동',
  blogNoResults: '검색 결과가 없습니다.',
  blogPrev: '이전',
  blogNext: '다음',
  blogBack: '블로그',
}

export default blog
