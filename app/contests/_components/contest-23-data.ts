/**
 * 제23회 대한민국 동양서예대전 공모요강 — 협회가 낸 공모요강(플립북, 2026-10)에서 옮긴 회차별 값.
 * 부문·규격·출품료·시상처럼 규정에 근거한 값은 출품원서 페이지 데이터(application-data)를 그대로 쓰고,
 * 여기에는 이번 회차에만 해당하는 날짜·장소·접수처·계좌·유의사항만 둔다.
 */

import { koDate } from '@/lib/utils/ko-date'

export { koDate }

export const CONTEST_23 = {
  edition: 23,
  deadline: '2027-01-31',
  deadlineTime: '18:00 도착분',
  firstJudging: '2027-02-13',
  secondJudging: '2027-03-13',
  exhibitionStart: '2027-04-21',
  exhibitionEnd: '2027-04-30',
  closedDay: '2027-04-26',
  ceremony: '2027-04-24',
  ceremonyTime: '14:00 ~ 16:00',
  venue: '예술의전당 서울서예박물관',
  halls: '제1전시실 초대작가전·개인전 / 제2전시실 공모전 (동시 상설)',
  host: '사단법인 동양서예협회',
  sponsors: '문화체육관광부 · 서울특별시 · 예술의전당 · 대한검정회 (예정)',
  account: { bank: '신한은행', number: '100-028-611714', holder: '(사)동양서예협회' },
  /** 우편 접수처 — 요강에 공개된 사무국 주소 */
  mailTo: '경기도 고양시 덕양구 호국로 860, 래미안휴레스트 207-1403 (사단법인 동양서예협회 사무국)',
} as const

export interface ScheduleRow {
  label: string
  value: string
  lead?: boolean
}

export const SCHEDULE: readonly ScheduleRow[] = [
  {
    label: '출품 접수 마감',
    value: `${koDate(CONTEST_23.deadline)} ${CONTEST_23.deadlineTime} — 우편은 마감일 도착분까지`,
    lead: true,
  },
  { label: '1차 작품 심사', value: `${koDate(CONTEST_23.firstJudging)} · 입선 및 수상예정자 확정` },
  {
    label: '2차 휘호 심사대회',
    value: `${koDate(CONTEST_23.secondJudging)} · 수상예정자 현장 휘호로 대상 등 최종 확정`,
  },
  { label: '결과 발표', value: '심사 종료 후 협회 홈페이지 게시 및 개별 통지' },
  {
    label: '전시',
    value: `${koDate(CONTEST_23.exhibitionStart)} ~ ${koDate(CONTEST_23.exhibitionEnd, false)} · 관람 무료 · ${koDate(CONTEST_23.closedDay, false)} 정기 휴관`,
  },
  {
    label: '개막·시상식',
    value: `${koDate(CONTEST_23.ceremony)} ${CONTEST_23.ceremonyTime} · 수상자 본인 참석 원칙`,
  },
  { label: '장소', value: `${CONTEST_23.venue} 제1·제2전시실` },
  { label: '작품 반출', value: `${koDate(CONTEST_23.exhibitionEnd)} 철수 시간, 전시장 현장` },
]

export interface RuleItem {
  title: string
  body: string
}

export const ELIGIBILITY: readonly RuleItem[] = [
  {
    title: '누구나',
    body: '서예·문인화·전각을 수련하는 대한민국 국민, 재외동포, 국내 거주 외국인. 연령·학력·경력 제한은 없습니다.',
  },
  {
    title: '청년작가',
    body: '대학 서예 전공자와 전국대학서예연합 소속·출신 청년작가의 출품을 권장하며, 청년부는 별도 심사 기준을 적용합니다.',
  },
  {
    title: '초대작가',
    body: '협회 초대작가는 공모 부문에 출품할 수 없고, 제1전시실 초대작가전 부문으로 출품합니다.',
  },
  {
    title: '특별규정',
    body: '이번 회차에 신설한 특별규정에 따라, 협회 정회원이 아니어도 실력을 갖춘 작가는 초대작가전에 참여할 수 있습니다. 추천·초대작가 자격을 얻으려면 추천·초대작가 선임 규정 제11조의 특별선임을 신청합니다(비회원은 심사료·등록비·첫해 연회비를 합해 추천작가 18만원, 초대작가 25만원).',
  },
  {
    title: '출품할 수 없는 작품',
    body: '다른 공모전에서 입선·수상한 작품, 이미 발표한 작품, 대작(代作), 임서를 창작으로 표기한 작품.',
  },
]

export const SPECS: readonly ScheduleRow[] = [
  {
    label: '출품 점수',
    value: '1인 1점 이상 최대 9점 · 2점 이상이면 부문을 달리할 수 있고, 심사는 점마다 따로 합니다',
  },
  {
    label: '표장',
    value:
      '배접(褙接) 후 미표구 상태로 제출 · 액자·족자·병풍 등 완성 표구나 유리를 쓴 작품은 받지 않습니다',
  },
  { label: '낙관·서명', value: '낙관과 서명 필수 · 인장 사용 권장' },
  {
    label: '작품 표기',
    value:
      '작품 뒷면 오른쪽 아래에 표기지(별지 제2호)를 붙입니다 — 부문·성명·작품명·서체·규격·연락처',
  },
]

export const HOW_TO_ENTER: readonly RuleItem[] = [
  {
    title: '온라인 사전 등록',
    body: '협회 홈페이지 출품원서로 먼저 등록한 뒤 작품을 보냅니다.',
  },
  {
    title: '제출 서류',
    body: '① 출품신청서(별지 제1호) ② 작품 뒷면 표기지(별지 제2호) ③ 출품료 입금 확인증 ④ 현대서예·캘리그라피 부문은 작가노트(권장)',
  },
  {
    title: '접수처',
    body: CONTEST_23.mailTo,
  },
  {
    title: '운송',
    body: '운송 비용과 위험은 출품자가 부담하며, 접수된 작품과 서류는 돌려드리지 않습니다.',
  },
]

export const NOTICES: readonly string[] = [
  `작품 반출은 전시 종료일(${koDate(CONTEST_23.exhibitionEnd)}) 철수 시간에 현장에서 하며, 찾아가지 않은 작품의 보관 책임은 협회가 지지 않습니다.`,
  '협회는 출품작을 도록·홍보물·온라인 아카이브에 실을 수 있으며, 저작권은 작가에게 있습니다.',
  '규정 위반이 확인되면 입선·수상을 취소하고 결과를 공개할 수 있습니다.',
  '작품 판매를 원하면 협회 위탁 판매 계약(작가 70% 정산)으로 진행할 수 있습니다.',
  '심사 기준(법도·조형·창의·완성도)은 협회 심사 규정을 따르며, 결과에 대한 이의는 받지 않습니다. 수준에 못 미치면 등급·인원을 조정합니다.',
  '입선 이상 작품에는 표구비가 부과됩니다(손배접 원칙, 회원가 적용). 상금은 제세 공제 후 지급합니다.',
  '적지 않은 사항은 협회 이사회와 운영위원회의 결정을 따릅니다.',
]
