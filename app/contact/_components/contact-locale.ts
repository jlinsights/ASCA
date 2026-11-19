import type { Language } from '@/lib/i18n'
import type { ContactCopy } from './contact-locale-types'
import { en } from './contact-locale-en'
import { ja } from './contact-locale-ja'
import { zh } from './contact-locale-zh'
import { HEADQUARTERS, OFFICE } from '@/lib/content/contact-info'
import {
  CHANNELS,
  OBJECTION_DEADLINES,
  OBJECTION_DISMISSALS,
  OBJECTION_FIELDS,
  OBJECTION_SOURCES,
  OBJECTION_TYPES,
  OFFICE_SOURCES,
  TOPICS,
} from './contact-data'

/**
 * /contact 화면 문구 — 4개 언어 (2026-11-01).
 * 한국어는 contact-data.ts 상수에서 만든다(규정 07 과 대조하는 원본). 다른 언어의 목록은
 * 한국어 목록과 같은 순서·같은 길이여야 한다 — __tests__/contact-locale.test.ts 가 지킨다.
 * 주소(도로명)·전화·이메일은 고유 표기라 번역하지 않는다.
 */

const ko: ContactCopy = {
  hero: {
    title: '문의',
    lede: '무엇을 도와드릴까요? 용건을 고르시면 답이 있는 곳으로 바로 안내해 드립니다. 직접 묻고 싶으시면 실시간 상담이 가장 빠릅니다.',
    liveChat: '실시간 상담',
    facts: [
      ['전화 상담', '평일 10–17시'],
      ['이의제기 접수', '결과 공지 후 7일'],
      ['최종 회신', '영업일 14일 이내'],
    ],
  },
  newWindow: '(새 창)',
  tocLabel: '이 페이지 바로가기',
  toc: {
    inquiry: '문의서 쓰기',
    topics: '용건별 안내',
    channels: '연락 창구',
    objection: '이의제기',
    address: '주소',
    events: '행사 일정',
    faq: '자주 묻는 질문',
  },
  topics: {
    eyebrow: '용건별 안내',
    title: '무엇을 도와드릴까요',
    lede: '자주 들어오는 문의는 아래 페이지에 규정 원문과 함께 정리해 두었습니다.',
    items: TOPICS.map(({ title, body, cta }) => ({ title, body, cta })),
    note: '협업·제휴 제안은 이메일로 보내 주세요. 협회는 동양예술의 전통과 정신을 이어 현대예술로 넓히는 범위 안에서 브랜드·개인 프로젝트 등 여러 분야의 창작자와 협업합니다.',
  },
  channels: {
    eyebrow: '연락 창구',
    title: '어디로 연락할까요',
    lede: '창구마다 잘 맞는 일이 다릅니다. 서류와 공식 문의는 기록이 남는 이메일로 보내 주세요.',
    fastest: '가장 빠름',
    items: CHANNELS.map(({ title, value, bestFor }) => ({ title, value, bestFor })),
  },
  objection: {
    eyebrow: '공모·전시 결과 이의제기',
    title: '이의제기 절차',
    lede: '협회가 주최·주관하거나 위탁 운영하는 모든 공모전과 전시 사업에 적용합니다. 접수는 공식 결과 공지일로부터 7일 이내이며, 개별 공모요강에 다른 기한이 있으면 그 기한을 따릅니다.',
    fieldsHead: '서면에 꼭 넣을 네 가지',
    fields: OBJECTION_FIELDS.map(field => ({ ...field })),
    mailCta: '양식이 채워진 이메일 쓰기',
    writtenNote: (email, phone) =>
      `서면(이메일) 접수가 원칙입니다. 받는 곳은 ${email}입니다. 전화(${phone})로 접수한 경우에도 위 네 가지를 서면으로 제출해야 합니다.`,
    deadlineCaption: '처리 기한',
    deadlineColumns: ['단계', '기한', '내용'],
    deadlines: OBJECTION_DEADLINES.map(({ cells }): [string, string, string] => [
      cells[0] ?? '',
      cells[1] ?? '',
      cells[2] ?? '',
    ]),
    extensionNote:
      '전문적인 재검증이 필요하면 기간을 연장할 수 있으며, 이때는 지연 사유를 미리 알립니다.',
    typesHead: '유형별 처리 기준',
    types: OBJECTION_TYPES.map(type => ({ ...type })),
    dismissalsHead: '받아들이지 않을 수 있는 경우',
    dismissals: [...OBJECTION_DISMISSALS],
    sources: OBJECTION_SOURCES.map(source => source.label),
  },
  address: {
    eyebrow: '주소',
    title: '본부와 사무소',
    lede: '출품원서 접수와 모든 행정업무는 사무소에서 처리합니다. 서류를 보내실 때는 사무소 주소를 써 주세요.',
    officeLabel: OFFICE.label,
    headquartersLabel: HEADQUARTERS.label,
    officeRole: '출품원서 · 행정업무',
    map: '카카오맵에서 보기',
    sources: OFFICE_SOURCES.map(source => source.label),
  },
  events: {
    eyebrow: '행사 일정',
    title: '행사와 전시회',
    lede: '협회가 진행할 행사와 전시회를 살펴보시고, 참석하실 일정은 직접 예약 등록해 주세요.',
  },
  faq: { eyebrow: '자주 묻는 질문', title: '문의 전에 확인해 보세요' },
  citeLabel: '근거',
}

export type { ContactCopy }

export const CONTACT_COPY: Record<Language, ContactCopy> = { ko, en, ja, zh }

/** 번역에서 값이 null 이면 원래 값(번호·이메일·팩스)을 쓴다 */
export function channelValue(copy: ContactCopy, index: number): string {
  return copy.channels.items[index]?.value ?? CHANNELS[index]?.value ?? ''
}
