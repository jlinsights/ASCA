import { artistRoleLabel } from '../artist-filter-options'

// 작가 상세의 역할 줄(membership_type·title)도 DB 의 한국어 값 그대로였다
describe('artistRoleLabel', () => {
  it.each([
    ['초대작가', 'en', 'Invited artist'],
    ['회원작가', 'en', 'General artist'],
    ['회원작가', 'ko', '일반작가'],
    ['운영위원', 'ja', '運営委員'],
    ['고 문', 'zh', '顧問'],
    ['심사위원장', 'en', 'Jury chair'],
  ] as const)('%s → (%s) %s', (role, language, label) => {
    expect(artistRoleLabel(role, language)).toBe(label)
  })

  it('표에 없는 역할은 공백만 지운 원래 값', () => {
    expect(artistRoleLabel('명예 회장', 'en')).toBe('명예회장')
  })
})
