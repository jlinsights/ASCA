import type { TallyPayload } from '../tally'

/**
 * 추천·초대작가 신청서(tally.so/r/w59jeo, 2026-10-30 판)의 질문 제목으로 만든 가짜 응답.
 * 값은 모두 지어낸 것이다. 전화·생년월일·주소·납부정보·첨부파일 칸은 "옮기지 않음"을 확인하려고 넣어 둔다.
 * 이름 칸은 신청서에서 제목 없이 자리표시자만 있어, Tally 가 라벨로 자리표시자를 준다고 가정한다
 * (묶음 제목을 주는 경우는 테스트에서 따로 확인한다).
 */
export const OPT = {
  recommended: 'a1111111-1111-4111-8111-111111111111',
  invited: 'a2222222-2222-4222-8222-222222222222',
  hangul: 'b1111111-1111-4111-8111-111111111111',
  modern: 'b4444444-4444-4444-8444-444444444444',
  regular: 'c1111111-1111-4111-8111-111111111111',
  special: 'c2222222-2222-4222-8222-222222222222',
  traditional: 'd1111111-1111-4111-8111-111111111111',
  contemporary: 'd2222222-2222-4222-8222-222222222222',
  nonMember: 'e5555555-5555-4555-8555-555555555555',
  yes: 'f1111111-1111-4111-8111-111111111111',
} as const

const NOT_APPLICABLE = '해당 없음'

export function tallyPayload(overrides: Partial<TallyPayload['data']> = {}): TallyPayload {
  return {
    eventId: 'e0000000-0000-4000-8000-000000000000',
    eventType: 'FORM_RESPONSE',
    data: {
      responseId: 'resp01',
      formId: 'w59jeo',
      createdAt: '2026-10-30T09:00:00.000Z',
      fields: [
        {
          key: 'question_grade',
          label: '신청하시는 작가 자격을 선택하여 주십시오.',
          type: 'DROPDOWN',
          value: [OPT.invited],
          options: [
            { id: OPT.recommended, text: '추천작가' },
            { id: OPT.invited, text: '초대작가' },
          ],
        },
        {
          key: 'question_genres',
          label: '세부 분야',
          type: 'MULTI_SELECT',
          value: [OPT.hangul, OPT.modern],
          options: [
            { id: OPT.hangul, text: '한글서예' },
            { id: 'b2222222-2222-4222-8222-222222222222', text: '한문서예' },
            { id: OPT.modern, text: '현대서예ㆍ캘리그라피' },
          ],
        },
        {
          key: 'question_route',
          label: '신청 유형',
          type: 'MULTIPLE_CHOICE',
          value: [OPT.special],
          options: [
            { id: OPT.regular, text: '일반선임 (점수·활동 경력 요건 심사)' },
            { id: OPT.special, text: '특별선임 (선임 규정 제11조)' },
          ],
        },
        { key: 'question_name', label: '한글 이름', type: 'INPUT_TEXT', value: ' 홍길동 ' },
        { key: 'question_hanja', label: '한자 이름', type: 'INPUT_TEXT', value: '洪吉童' },
        { key: 'question_en', label: '영문 이름', type: 'INPUT_TEXT', value: 'Hong Gildong' },
        { key: 'question_ho', label: '아호', type: 'INPUT_TEXT', value: '' },
        {
          key: 'question_email',
          label: '이메일 주소',
          type: 'INPUT_EMAIL',
          value: 'Hong@Example.com',
        },
        {
          key: 'question_phone',
          label: '휴대전화번호',
          type: 'INPUT_PHONE_NUMBER',
          value: '+821000000000',
        },
        { key: 'question_birth', label: '생년월일', type: 'INPUT_DATE', value: '1960-01-01' },
        {
          key: 'question_addr',
          label: '우편물 수령 도로명 주소',
          type: 'INPUT_TEXT',
          value: '가짜로 1',
        },
        {
          key: 'question_addr2',
          label: '상세 주소 (예: OO아파트 OO동 OO호)',
          type: 'INPUT_TEXT',
          value: '가짜동 101호',
        },
        {
          key: 'question_track',
          label: '신청 부문 (증서 발급 기준)',
          type: 'MULTIPLE_CHOICE',
          value: [OPT.traditional],
          options: [
            { id: OPT.traditional, text: '전통부문' },
            { id: OPT.contemporary, text: '현대부문' },
          ],
        },
        {
          key: 'question_membership',
          label: '현재 동양서예협회 회원 현황',
          type: 'MULTIPLE_CHOICE',
          value: [OPT.nonMember],
          options: [
            { id: 'e1111111-1111-4111-8111-111111111111', text: '청년작가 정회원' },
            { id: OPT.nonMember, text: '정회원 아님 (미가입·준회원·특별회원·명예회원 등)' },
          ],
        },
        {
          key: 'question_awards',
          label: '수상·출품 실적 및 점수 산정 근거',
          type: 'TEXTAREA',
          value: NOT_APPLICABLE,
        },
        {
          key: 'question_required',
          label: '일반선임 필수 실적 확인 (특별선임은 “적용 제외”)',
          type: 'TEXTAREA',
          value: '적용 제외',
        },
        {
          key: 'question_basis',
          label: '특별선임 신청 사유 (일반선임은 “해당 없음”)',
          type: 'TEXTAREA',
          value: '국내외 서예교육 25년',
        },
        {
          key: 'question_payment',
          label: '납부 확인정보 (이미 납부한 경우에만)',
          type: 'TEXTAREA',
          value: '심사료 / 가짜입금자 / 2026-10-30 / 50,000',
        },
        {
          key: 'question_portfolio',
          label: '대표작 3점 포트폴리오 (PDF 1개 10MB 이하)',
          type: 'FILE_UPLOAD',
          value: [{ id: 'file1', name: 'portfolio.pdf', url: 'https://storage.tally.so/fake' }],
        },
        {
          key: 'question_consent',
          label: null,
          type: 'DROPDOWN',
          value: [OPT.yes],
          options: [{ id: OPT.yes, text: '예, 동의합니다.' }],
        },
      ],
      ...overrides,
    },
  }
}
