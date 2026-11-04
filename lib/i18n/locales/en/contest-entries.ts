// contest-entries 화면 번역 (en). 네 언어를 모으는 곳은 lib/i18n/translations/contest-entries.ts 다.
const contestEntries: Record<string, string> = {
  entriesTitle: 'My entries',
  entriesLoading: 'Loading your entries…',
  entriesError: 'We could not load your entries. Please try again shortly.',
  entriesEmpty: 'No entries have been confirmed for this account yet.',
  entriesEmptyHint:
    'If you entered with a different email, let the office know. Once they confirm it is you, they will link it to this account.',
  entriesUntitled: 'Untitled',
  entriesFeeConfirmed: 'Fee received',
  entriesFeePending: 'Fee being checked',
  entriesFeeWithdrawn: 'Withdrawn',
  entriesResultAwarded: 'Awarded',
  entriesResultPending: 'Under review',
  entriesResultNotSelected: 'Not selected',
  entriesResultWithdrawn: 'Withdrawn',
}

export default contestEntries
