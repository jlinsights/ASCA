/** @jest-environment node */
import { createHmac } from 'crypto'
import { mapTallyApplication, tallyPayloadSchema, verifyTallySignature } from '../tally'
import { OPT, tallyPayload } from '../__fixtures__/tally-payload'

const secret = 'test-secret'
const sign = (body: string) => createHmac('sha256', secret).update(body).digest('base64')

describe('verifyTallySignature', () => {
  const body = JSON.stringify(tallyPayload())

  it('맞는 서명을 받는다', () => {
    expect(verifyTallySignature(body, sign(body), secret)).toBe(true)
  })

  it('들여쓰기된 원문도 다시 직렬화한 본문의 서명이면 받는다(Tally 예제 방식)', () => {
    const pretty = JSON.stringify(tallyPayload(), null, 2)
    expect(verifyTallySignature(pretty, sign(body), secret)).toBe(true)
  })

  it.each([
    ['서명 없음', null],
    ['다른 비밀', createHmac('sha256', 'other').update(body).digest('base64')],
    ['길이가 다른 값', 'abc'],
  ])('%s 은 거절한다', (_name, signature) => {
    expect(verifyTallySignature(body, signature, secret)).toBe(false)
  })

  it('본문이 바뀌면 거절한다', () => {
    expect(verifyTallySignature(body.replace('홍길동', '임꺽정'), sign(body), secret)).toBe(false)
  })
})

describe('mapTallyApplication', () => {
  const map = (payload = tallyPayload()) => {
    const result = mapTallyApplication(tallyPayloadSchema.parse(payload))
    if (!result.ok) throw new Error(result.reason)
    return result.row
  }

  it('허용 칸을 옮기고 다듬는다', () => {
    expect(map()).toEqual({
      tally_response_id: 'resp01',
      tally_form_id: 'w59jeo',
      submitted_at: '2026-10-30T09:00:00.000Z',
      applicant_name: '홍길동',
      applicant_name_hanja: '洪吉童',
      applicant_name_en: 'Hong Gildong',
      pen_name: null,
      applicant_email: 'hong@example.com',
      requested_grade: 'invited',
      requested_grade_raw: '초대작가',
      track: 'traditional',
      track_raw: '전통부문',
      genres: ['한글서예', '현대서예ㆍ캘리그라피'],
      route: 'special',
      route_raw: '특별선임 (선임 규정 제11조)',
      membership_raw: '정회원 아님 (미가입·준회원·특별회원·명예회원 등)',
      special_basis_raw: '국내외 서예교육 25년',
      awards_text: '해당 없음',
    })
  })

  it('전화·생년월일·주소·납부정보·첨부파일은 어느 칸에도 들어가지 않는다', () => {
    const stored = JSON.stringify(map())
    for (const value of [
      '+821000000000',
      '1960-01-01',
      '가짜로 1',
      '가짜동 101호',
      '가짜입금자',
      'storage.tally.so',
      'portfolio.pdf',
    ]) {
      expect(stored).not.toContain(value)
    }
  })

  it("세부 분야 '현대서예ㆍ캘리그라피'를 신청 부문(전통·현대)으로 읽지 않는다", () => {
    const base = tallyPayload()
    const fields = base.data.fields.filter(f => f.key !== 'question_track')
    expect(map(tallyPayload({ fields })).track).toBe('unknown')
  })

  it('일반선임 · 추천작가를 고르면 regular · recommended', () => {
    const base = tallyPayload()
    const fields = base.data.fields.map(f => {
      if (f.key === 'question_grade') return { ...f, value: [OPT.recommended] }
      if (f.key === 'question_route') return { ...f, value: [OPT.regular] }
      return f
    })
    expect(map(tallyPayload({ fields }))).toMatchObject({
      requested_grade: 'recommended',
      route: 'regular',
    })
  })

  it("예전 보기 '초청작가'로 들어온 응답도 invited", () => {
    const base = tallyPayload()
    const fields = base.data.fields.map(f =>
      f.key === 'question_grade' ? { ...f, options: [{ id: OPT.invited, text: '초청작가' }] } : f
    )
    expect(map(tallyPayload({ fields })).requested_grade).toBe('invited')
  })

  it('이름 칸 라벨이 묶음 제목으로 오면 순서로 찾고 주소 칸은 버린다', () => {
    const base = tallyPayload()
    const fields = base.data.fields.map(f =>
      f.type === 'INPUT_TEXT' ? { ...f, label: '신청인 기본정보' } : f
    )
    const row = map(tallyPayload({ fields }))
    expect(row).toMatchObject({
      applicant_name: '홍길동',
      applicant_name_hanja: '洪吉童',
      applicant_name_en: 'Hong Gildong',
      pen_name: null,
    })
    expect(JSON.stringify(row)).not.toContain('가짜로 1')
  })

  it('개인정보 수집에 동의하지 않으면 옮기지 않는다', () => {
    const base = tallyPayload()
    const fields = base.data.fields.map(f =>
      f.key === 'question_consent'
        ? { ...f, value: ['no'], options: [{ id: 'no', text: '아니오, 동의하지 않습니다.' }] }
        : f
    )
    expect(mapTallyApplication(tallyPayload({ fields }))).toEqual({
      ok: false,
      reason: 'NO_CONSENT',
    })
  })

  it('동의 칸이 없으면(질문이 바뀜) 옮기지 않고 이유를 알린다', () => {
    const base = tallyPayload()
    const fields = base.data.fields.filter(f => f.key !== 'question_consent')
    expect(mapTallyApplication(tallyPayload({ fields }))).toEqual({
      ok: false,
      reason: 'CONSENT_FIELD_MISSING',
    })
  })

  it('긴 글은 잘라 넣는다', () => {
    const base = tallyPayload()
    const fields = base.data.fields.map(f =>
      f.key === 'question_name' ? { ...f, value: '가'.repeat(500) } : f
    )
    expect(map(tallyPayload({ fields })).applicant_name).toHaveLength(200)
  })
})
