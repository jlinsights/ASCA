// artist-claim 화면 번역 (ko). 네 언어를 모으는 곳은 lib/i18n/translations/artist-claim.ts 다.
const artistClaim: Record<string, string> = {
  claimTitle: '작가 페이지 연결',
  claimIntro:
    '협회 작가 목록에서 내 페이지를 찾아 연결을 요청해 주세요. 사무국이 본인 확인 후 승인하면 이 계정으로 작가 정보와 작품을 관리할 수 있습니다.',
  claimSearchLabel: '작가 이름 검색',
  claimSearchPlaceholder: '이름 · 한자 · 아호',
  claimSearch: '찾기',
  claimSearching: '찾는 중…',
  claimNoResults: '검색 결과가 없습니다.',
  claimPick: '이 페이지가 저입니다',
  claimSelected: '선택한 페이지',
  claimChange: '다시 고르기',
  claimUnlisted: '목록에서 내 페이지를 찾을 수 없습니다',
  claimUnlistedHint: '이름을 남겨 주시면 사무국이 직접 찾아 연결합니다.',
  claimName: '성명',
  claimNameHanja: '한자 성명 (선택)',
  claimArtName: '아호 (선택)',
  claimNote: '사무국에 남길 말 (선택)',
  claimNoteHint: '수상·전시 이력이나 연락받을 방법처럼 본인 확인에 도움이 되는 내용을 적어 주세요.',
  claimSubmit: '연결 요청',
  claimPending: '연결 요청을 검토하고 있습니다. 승인되면 이 화면에서 바로 이용하실 수 있습니다.',
  claimRequested: '요청한 이름',
  claimWithdraw: '요청 철회',
  claimRejected: '지난 연결 요청이 반려되었습니다. 내용을 확인하고 다시 요청해 주세요.',
  claimDecisionNote: '사무국 메모',
  claimError: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  claimErrorLinked: '이 작가 페이지는 이미 다른 계정과 연결되어 있습니다. 사무국에 문의해 주세요.',
}

export default artistClaim
