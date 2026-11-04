// artist-claim 화면 번역 (ja). 네 언어를 모으는 곳은 lib/i18n/translations/artist-claim.ts 다.
const artistClaim: Record<string, string> = {
  claimTitle: '作家ページの連携',
  claimIntro:
    '協会の作家一覧からご自身のページを探し、連携を申請してください。事務局が本人確認のうえ承認すると、このアカウントで作家情報と作品を管理できます。',
  claimSearchLabel: '作家名で検索',
  claimSearchPlaceholder: '氏名・漢字・雅号',
  claimSearch: '検索',
  claimSearching: '検索中…',
  claimNoResults: '該当する作家がいません。',
  claimPick: 'これが私のページです',
  claimSelected: '選択したページ',
  claimChange: '選び直す',
  claimUnlisted: '一覧に自分のページが見つかりません',
  claimUnlistedHint: 'お名前を残していただければ、事務局が探して連携します。',
  claimName: '氏名',
  claimNameHanja: '漢字氏名（任意）',
  claimArtName: '雅号（任意）',
  claimNote: '事務局への連絡事項（任意）',
  claimNoteHint: '受賞・展示歴や連絡先など、本人確認に役立つ内容をご記入ください。',
  claimSubmit: '連携を申請',
  claimPending: '連携申請を確認しています。承認後、この画面からすぐにご利用いただけます。',
  claimRequested: '申請した氏名',
  claimWithdraw: '申請を取り下げる',
  claimRejected: '前回の連携申請は承認されませんでした。内容をご確認のうえ再度申請してください。',
  claimDecisionNote: '事務局メモ',
  claimError: '申請を処理できませんでした。しばらくしてから再度お試しください。',
  claimErrorLinked:
    'この作家ページはすでに別のアカウントと連携されています。事務局にお問い合わせください。',
}

export default artistClaim
