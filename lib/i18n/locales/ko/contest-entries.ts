// contest-entries 화면 번역 (ko). 네 언어를 모으는 곳은 lib/i18n/translations/contest-entries.ts 다.
const contestEntries: Record<string, string> = {
  entriesTitle: '내 출품',
  entriesLoading: '출품 내역을 불러오는 중…',
  entriesError: '출품 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  entriesEmpty: '이 계정으로 확인된 출품이 아직 없습니다.',
  entriesEmptyHint:
    '다른 이메일로 출품하셨다면 사무국에 알려 주세요. 본인 확인 후 이 계정에 이어 드립니다.',
  entriesUntitled: '작품명 미기재',
  entriesFeeConfirmed: '출품비 확인',
  entriesFeePending: '출품비 확인 중',
  entriesFeeWithdrawn: '출품 취소',
  entriesResultAwarded: '수상',
  entriesResultPending: '심사 중',
  entriesResultNotSelected: '미선정',
  entriesResultWithdrawn: '출품 취소',
}

export default contestEntries
