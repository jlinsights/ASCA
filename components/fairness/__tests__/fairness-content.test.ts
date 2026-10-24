/**
 * @jest-environment node
 */
import { readFileSync } from 'fs'
import path from 'path'
import { DISMISSAL_REASONS, OBJECTION_DEADLINES } from '../fairness-content'

// 허브가 숫자를 크게 내건다 — 규정 원문과 어긋나면 출품자에게 틀린 기한을 약속하게 된다
const regulation = readFileSync(path.join(process.cwd(), 'regulations', '07-objections.md'), 'utf8')
const article = (num: number): string => {
  const start = regulation.indexOf(`### 제${num}조`)
  const end = regulation.indexOf('### 제', start + 1)
  expect(start).toBeGreaterThanOrEqual(0)
  return regulation.slice(start, end === -1 ? undefined : end)
}

describe('공정·투명성 허브의 이의제기 기한은 이의제기 처리 규정과 같다', () => {
  test('접수 기간 — 제3조', () => {
    expect(article(3)).toContain(
      `공식 결과 공지일로부터 **${OBJECTION_DEADLINES.filingDays}일 이내**`
    )
  })

  test('접수 확인 · 1차 회신 · 최종 회신 — 제5조', () => {
    const text = article(5)
    expect(text).toContain(`영업일 기준 ${OBJECTION_DEADLINES.receiptBusinessHours}시간 이내`)
    expect(text).toContain(`**영업일 ${OBJECTION_DEADLINES.firstReplyBusinessDays}일 이내**`)
    expect(text).toContain(`**영업일 ${OBJECTION_DEADLINES.finalReplyBusinessDays}일 이내**`)
  })

  test('각하 사유는 제7조 목록과 개수가 같다', () => {
    const items = article(7).match(/^- /gm) ?? []
    expect(DISMISSAL_REASONS).toHaveLength(items.length)
  })
})
