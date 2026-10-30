/**
 * 2027년도 사업계획 — 사이트에 이미 확정·공개된 값만 쓴다(2026-10-30 작성).
 * 일정은 제23회 공모요강(contest-23-data)과 2027 캘린더 행사 안내(calendar-2027-data)를 그대로 가져온다.
 * 예산 액수는 총회 의결 전이라 싣지 않는다 — 원칙만 적고, 의결 뒤 이 장에 더한다.
 */

import { CONTEST_23 } from '@/app/contests/_components/contest-23-data'
import { CALENDAR_2027 } from '@/app/events/calendar-2027/_components/calendar-2027-data'
import { koDate } from '@/lib/utils/ko-date'

export interface PlanItem {
  title: string
  body: string
}

export interface PlanProgram {
  title: string
  body: string
  points: readonly string[]
  href?: string
  linkLabel?: string
}

export interface PlanDate {
  when: string
  what: string
  lead?: boolean
}

export const PLAN_YEAR = 2027

/** 기조 — 한 문장 선언과 풀이 */
export const KEYNOTE = {
  quote: '느리게 쓰고, 깊게 보고, 오래 남긴다.',
  paragraphs: [
    '한 번 스치고 잊히는 자극이 문화의 속도를 정하는 시대입니다. 서예는 그 반대편에 서 있습니다. 먹을 갈고 호흡을 고르고, 한 획을 긋기까지 쌓인 시간이 작품이 됩니다.',
    '2027년 동양서예협회는 이 느림을 약점이 아니라 품격으로 삼습니다. 法古創新, 옛 법을 깊이 익혀 새로움을 열고, 人書俱老, 글씨와 사람이 함께 깊어지는 길 위에서, 한국적이고 전통적인 예술을 오늘의 세련된 동양문화로 선보이는 모범적인 서예·전시 문화를 이끌겠습니다.',
  ],
} as const

/** 운영 방향 네 갈래 */
export const DIRECTIONS: readonly PlanItem[] = [
  {
    title: '깊이 — 수준 높은 전시',
    body: '해마다 하나의 대전에 역량을 모읍니다. 예술의전당 서울서예박물관 두 전시실을 함께 쓰고, 공모전과 초대작가전을 한 흐름으로 기획해 관람의 밀도를 높입니다.',
  },
  {
    title: '공정 — 규정으로 움직이는 협회',
    body: '출품·심사·선임·회비를 모두 공개된 규정에 따라 처리합니다. 2단계 심사(작품 심사와 현장 휘호 심사)와 결과 공개로 수상의 신뢰를 지킵니다.',
  },
  {
    title: '열림 — 다음 세대와 바깥의 작가',
    body: '청년부 별도 심사와 대학 서예 전공자의 출품 권장, 비회원 작가의 초대작가전 참여(특별규정)로 협회의 문을 넓힙니다.',
  },
  {
    title: '이음 — 한·중·일 교류와 온라인',
    body: '1997년부터 이어 온 교류를 기행과 교류전으로 잇고, 4개 언어 홈페이지와 작가 페이지로 작가의 온라인 활동(Online Presence)을 꾸준히 넓힙니다.',
  },
]

/** 2027 주요 일정 — 확정된 것만 */
export const SCHEDULE: readonly PlanDate[] = [
  {
    when: `${koDate(CALENDAR_2027.opens)} – ${koDate(CALENDAR_2027.closes, false)}`,
    what: '2027 동양서예 캘린더 증정 행사 신청 (연회비·후원·조기 출품·기행 참여자)',
  },
  {
    when: koDate(CONTEST_23.deadline),
    what: `제23회 대한민국 동양서예대전 출품 마감 (${CONTEST_23.deadlineTime})`,
    lead: true,
  },
  { when: koDate(CONTEST_23.firstJudging), what: '1차 작품 심사 — 입선·수상예정자 확정' },
  { when: koDate(CONTEST_23.secondJudging), what: '2차 휘호 심사대회 — 대상 등 최종 확정' },
  { when: '2027년 4월 7일(수) – 11일(일)', what: '2027 대만 서예·문화 기행 (4박 5일)' },
  {
    when: `${koDate(CONTEST_23.exhibitionStart)} – ${koDate(CONTEST_23.exhibitionEnd, false)}`,
    what: '제23회 대한민국 동양서예대전 · 書境 초대작가전 — 예술의전당 서울서예박물관 제1·2전시실',
    lead: true,
  },
  { when: koDate(CONTEST_23.ceremony), what: `개막·시상식 (${CONTEST_23.ceremonyTime})` },
]

/** 핵심 사업 */
export const PROGRAMS: readonly PlanProgram[] = [
  {
    title: '제23회 대한민국 동양서예대전',
    body: '협회의 한 해를 대표하는 공모전입니다. 한글, 한문, 현대서예·캘리그라피, 전각·서각, 문인화·동양화의 다섯 부문에서 새로운 작가를 찾습니다.',
    points: [
      '제2전시실 공모전 · 1차 작품 심사와 2차 휘호 심사',
      '청년부 별도 심사 기준, 대학 서예 전공자 출품 권장',
      '관람 무료 · 수상작과 전시를 홈페이지에 기록',
    ],
    href: '/contests',
    linkLabel: '공모요강',
  },
  {
    title: '書境(서경) 초대작가전 · 개인전 · 부스전',
    body: '제1전시실에서 초대작가의 원숙한 필묵과 작가 개인의 세계, 단체의 연구 성과를 함께 보여 줍니다.',
    points: [
      '전통부문·현대부문으로 나눈 초대작가 제도',
      '특별규정으로 비회원 작가도 초대작가전 참여',
      '10점 이상 개인전·단체 부스전을 대전 안에 수용',
    ],
    href: '/application',
    linkLabel: '출품원서',
  },
  {
    title: '한·중·일 교류와 서예 기행',
    body: '교류의 현장을 직접 걷고 보는 기행으로 협회의 국제적 지평을 이어 갑니다.',
    points: [
      '2027 대만 서예·문화 기행 (4월 7일 – 11일, 선착순 20명)',
      '해외 교류전시와 연합전 기록의 정리·공개',
    ],
    href: '/programs/cultural-exchange',
    linkLabel: '문화교류',
  },
  {
    title: '교육과 차세대',
    body: '좋은 글씨는 좋은 배움에서 나옵니다. 협회가 연결하는 정규 강좌로 수련의 길을 엽니다.',
    points: [
      '문원한문서예학원 토요 정규 과정, 예술의전당 서화아카데미 정규 강좌 안내',
      '협회 수강생 출품료 할인',
      '청년작가 등급과 청년부 심사로 다음 세대 육성',
    ],
    href: '/academy',
    linkLabel: '강좌 안내',
  },
  {
    title: '작가의 온라인 활동',
    body: '전시가 끝나도 작품과 작가가 계속 보이도록 합니다.',
    points: [
      '4개 언어(한·영·일·중) 홈페이지',
      '작가 페이지와 작품 아카이브, 온라인 출품·출품 내역 조회',
      '지난 대전과 교류 기록의 디지털 아카이브',
    ],
    href: '/artists',
    linkLabel: '작가',
  },
  {
    title: '회원과 후원',
    body: '협회를 지키는 힘은 회원과 후원자입니다. 부담은 합리적으로, 혜택은 분명하게 합니다.',
    points: [
      '등급별 연회비: 청년 3만 원 · 일반 5만 원 · 추천작가 8만 원 · 초대작가 10만 원 · 임원 20만 원',
      '평생회원 제도, 온라인 결제·CMS 자동이체',
      '2027 동양서예 캘린더(소산 박대성 화백) 증정으로 참여에 감사',
    ],
    href: '/fundraising',
    linkLabel: '회비·후원',
  },
]

/** 예술경영 원칙 */
export const MANAGEMENT: readonly PlanItem[] = [
  {
    title: '재정',
    body: '수입은 회비·출품료·후원금으로 이루어지며, 전시와 작가 지원에 먼저 씁니다. 예산과 결산은 정관과 규정에 따라 총회 의결과 회계감사를 거쳐 공개합니다. 2027년 예산은 의결 뒤 이 자리에 싣습니다.',
  },
  {
    title: '규정',
    body: '정관과 운영 및 심사, 전시 관리, 회원 및 회비, 추천·초대작가 선임 규정을 홈페이지에 원문으로 공개하고, 바뀐 내용은 개정 이력과 함께 알립니다.',
  },
  {
    title: '기록',
    body: '모든 전시를 포스터·도록·작품 기록으로 남겨 연혁과 아카이브에 쌓습니다. 기록이 쌓일수록 협회의 신뢰도 쌓입니다.',
  },
  {
    title: '관계',
    body: '예술의전당을 비롯한 유관기관, 학원·대학과의 협력을 오래 가는 관계로 가꿉니다.',
  },
]

/** 한 해를 돌아볼 때 볼 것 — 목표 수치는 정하지 않고 해마다 같은 잣대로 기록한다 */
export const INDICATORS: readonly string[] = [
  '대전 출품 작가 수와 부문별 분포',
  '청년작가·비회원 작가의 출품과 초대작가전 참여',
  '전시 관람객 수와 온라인 아카이브 방문',
  '회원 연회비 납부와 평생회원·정기 후원 약정',
  '교류 행사 참가자와 해외 작가 참여',
]
