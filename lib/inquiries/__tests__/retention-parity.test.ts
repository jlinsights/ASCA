import { readFileSync } from 'node:fs'
import path from 'node:path'
import { inquiryTranslations } from '@/lib/i18n/translations/inquiry'

/**
 * 문의서의 개인정보 동의 문구와 개인정보처리방침이 같은 보유 기간을 말해야 한다 (2026-11-01 결정: 처리 완료 후 1년).
 * 한쪽만 바꾸면 방문자가 동의한 기간과 공개된 방침이 어긋난다.
 */
const RETENTION = '문의 처리 완료 후 1년'

describe('문의 보유 기간', () => {
  it('동의 문구와 개인정보처리방침 제7조가 같은 기간을 말한다', () => {
    const policy = readFileSync(path.join(process.cwd(), 'app/privacy-policy/page.tsx'), 'utf8')
    expect(policy).toContain(`<strong>문의 답변:</strong> ${RETENTION}`)
    expect(inquiryTranslations.ko.inqConsentDetail).toContain(RETENTION)
  })

  it('다른 언어 동의 문구도 1년을 말한다', () => {
    expect(inquiryTranslations.en.inqConsentDetail).toContain('1 year after the inquiry is handled')
    expect(inquiryTranslations.ja.inqConsentDetail).toContain('対応完了後1年')
    expect(inquiryTranslations.zh.inqConsentDetail).toContain('處理完畢後 1 年')
  })
})
