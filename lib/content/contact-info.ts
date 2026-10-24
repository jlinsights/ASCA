/**
 * 협회 연락처·주소 — 단일 출처.
 * 이전한 옛 본부 주소가 약관·정책·SEO 등 여섯 곳에 사본으로 퍼져 있다가 함께 낡았다(2026-10-24 정정).
 * 주소·번호를 쓰는 곳은 여기서 가져간다. (푸터는 4개 언어 표기가 있어 footer-copy.ts 가 따로 든다)
 */

export interface PostalAddress {
  /** 화면 머리 — 본부 / 사무소 */
  label: string
  postalCode: string
  /** 도로명까지 한 줄 */
  line1: string
  /** 동·호수와 건물명 */
  line2: string
  /** schema.org PostalAddress 용 */
  region: string
  locality: string
  street: string
}

export const HEADQUARTERS: PostalAddress = {
  label: '본부',
  postalCode: '02873',
  line1: '서울특별시 성북구 보문로 57-1, 6층',
  line2: '보문동7가, 중앙빌딩',
  region: '서울특별시',
  locality: '성북구',
  street: '보문로 57-1, 6층 (보문동7가, 중앙빌딩)',
}

/** 사무소 — 출품원서 접수와 모든 행정업무를 처리하는 곳 (정관 제38조의 사무국) */
export const OFFICE: PostalAddress = {
  label: '사무소',
  postalCode: '10467',
  line1: '경기도 고양시 덕양구 호국로 860, 207-1403',
  line2: '성사동, 래미안휴레스트',
  region: '경기도',
  locality: '고양시 덕양구',
  street: '호국로 860, 207-1403 (성사동, 래미안휴레스트)',
}

export const formatAddress = (address: PostalAddress): string =>
  `〒${address.postalCode} ${address.line1} (${address.line2})`

export const PHONE = { display: '0502-5550-8700', href: 'tel:+8250255508700' } as const
export const FAX = '0504-256-6600'
export const EMAIL = 'info@orientalcalligraphy.org'
export const OFFICE_HOURS = '월–금 오전 10시 – 오후 5시'

export const CHAT_URL = 'https://orientalcalligraphy.channel.io'
export const KAKAO_CHAT_URL = 'https://pf.kakao.com/_xkchGj/chat'
export const BOOKING_URL = 'https://cal.com/orientalcalligraphy'

/** mailto: 링크 — 제목·본문의 한글은 인코딩한다 */
export const mailto = (subject: string, body?: string): string =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ''
  }`
