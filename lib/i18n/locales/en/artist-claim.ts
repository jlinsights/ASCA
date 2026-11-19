// artist-claim 화면 번역 (en). 네 언어를 모으는 곳은 lib/i18n/translations/artist-claim.ts 다.
const artistClaim: Record<string, string> = {
  claimTitle: 'Link your artist page',
  claimIntro:
    'Find your page in the association’s artist list and request a link. Once the office confirms it is you, you can manage your profile and works from this account.',
  claimSearchLabel: 'Search artist name',
  claimSearchPlaceholder: 'Name · Chinese characters · pen name',
  claimSearch: 'Search',
  claimSearching: 'Searching…',
  claimNoResults: 'No artists found.',
  claimPick: 'This is me',
  claimSelected: 'Selected page',
  claimChange: 'Choose again',
  claimUnlisted: 'I can’t find my page in the list',
  claimUnlistedHint: 'Leave your name and the office will find and link your page.',
  claimName: 'Name',
  claimNameHanja: 'Name in Chinese characters (optional)',
  claimArtName: 'Pen name (optional)',
  claimNote: 'Note to the office (optional)',
  claimNoteHint:
    'Anything that helps confirm your identity, such as awards, exhibitions or how to reach you.',
  claimSubmit: 'Request link',
  claimPending: 'Your request is under review. Once approved, you can use it right here.',
  claimRequested: 'Requested name',
  claimWithdraw: 'Withdraw request',
  claimRejected: 'Your last request was declined. Please check the note and try again.',
  claimDecisionNote: 'Note from the office',
  claimError: 'We couldn’t process the request. Please try again shortly.',
  claimErrorLinked:
    'This artist page is already linked to another account. Please contact the office.',
}

export default artistClaim
