// contest-entries 화면 번역 (ja). 네 언어를 모으는 곳은 lib/i18n/translations/contest-entries.ts 다.
const contestEntries: Record<string, string> = {
  entriesTitle: 'わたしの出品',
  entriesLoading: '出品履歴を読み込んでいます…',
  entriesError: '出品履歴を読み込めませんでした。しばらくしてからもう一度お試しください。',
  entriesEmpty: 'このアカウントで確認された出品はまだありません。',
  entriesEmptyHint:
    '別のメールアドレスで出品された場合は事務局にお知らせください。本人確認の後、このアカウントにおつなぎします。',
  entriesUntitled: '作品名未記入',
  entriesFeeConfirmed: '出品料確認済み',
  entriesFeePending: '出品料確認中',
  entriesFeeWithdrawn: '出品取り消し',
  entriesResultAwarded: '受賞',
  entriesResultPending: '審査中',
  entriesResultNotSelected: '選外',
  entriesResultWithdrawn: '出品取り消し',
}

export default contestEntries
