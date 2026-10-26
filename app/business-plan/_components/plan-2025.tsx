import { AboutRows } from '@/components/about/about-layout'

const VISION_ITEMS = [
  '서예의 정신을 계승하되, 현대미술과의 융합을 통한 새로운 미학 창조',
  '동양적 정신성과 현대적 감각의 조화를 추구하는 예술가들의 플랫폼 구축',
  '전통과 현대의 조화로운 융합을 통한 새로운 예술 가치 창출',
]

const STRATEGY_ITEMS = [
  'Contemporary Asian Art 플랫폼 구축',
  '디지털 전환을 통한 온라인 전시/판매 활성화',
  '국제 교류 확대 및 글로벌 네트워크 구축',
  '신진 작가 발굴 및 육성 프로그램 강화',
]

const EXHIBITIONS = [
  {
    period: '상반기 (6월)',
    title: '제22회 대한민국 동양서예대전 및 동양서예초대작가전',
    items: [
      'Contemporary Asian Art 섹션 신설',
      '디지털 캘리그래피 특별전',
      'AR 기반 인터랙티브 전시',
      '국제 심포지엄 개최',
    ],
  },
  {
    period: '하반기 (10월)',
    title: '초대작가 회원연합전 - "전통과 현대의 대화"',
    items: [
      '미디어아트 융합 전시',
      '설치미술 프로젝트',
      '국제 아티스트 콜라보레이션',
      'VR 갤러리 동시 운영',
    ],
  },
]

const INCOME = [
  { label: '회비수입', amount: '₩7,589,496' },
  { label: '출품료수입', amount: '₩29,377,110' },
  { label: '등록비수입', amount: '₩264,000' },
  { label: '후원 및 기타수입', amount: '₩21,000,000' },
]

const EXPENSES = [
  { label: '전시사업비', amount: '₩28,800,797' },
  { label: '운영비', amount: '₩21,165,961' },
  { label: '회원지원비', amount: '₩5,000,000' },
  { label: '예비비', amount: '₩2,500,000' },
]

const EXPECTED_EFFECTS = [
  '동양 예술의 현대적 재해석과 새로운 가치 창출',
  '글로벌 아트 시장에서의 입지 강화',
  '디지털 전환을 통한 새로운 수익 모델 창출',
  '신진 작가 육성을 통한 예술 생태계 활성화',
  '전통과 현대의 조화를 통한 문화적 가치 확산',
]

const LAB = [
  {
    title: 'Artist Residency',
    items: ['국내외 작가 교류 프로그램 운영', '실험적 프로젝트 제작 지원', '융합 작품 제작 지원'],
  },
  {
    title: 'Art Lab 운영',
    items: ['디지털 기술 접목 연구 공간', '신소재 실험 작업실 운영', '협업 프로젝트 공간 제공'],
  },
]

const DIGITAL = [
  '온라인 갤러리 플랫폼 개편',
  'NFT 아트 마켓플레이스 구축',
  'AR/VR 전시 시스템 도입',
  '작가 포트폴리오 플랫폼 확대',
]

const List = ({ items }: { items: readonly string[] }) => (
  <ul>
    {items.map(item => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

function Ledger({ title, rows }: { title: string; rows: { label: string; amount: string }[] }) {
  return (
    <div>
      <p>
        <strong>{title}</strong>
      </p>
      <dl className='ab-ledger'>
        {rows.map(row => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.amount}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** 2025년도 사업계획서 — 네 갈래를 이름표·본문 행으로 */
export function Plan2025() {
  return (
    <AboutRows
      items={[
        {
          label: 'I. 비전 및 전략 목표',
          body: (
            <>
              <p>
                <strong>핵심 비전</strong>
              </p>
              <List items={VISION_ITEMS} />
              <p>
                <strong>전략적 목표</strong>
              </p>
              <List items={STRATEGY_ITEMS} />
            </>
          ),
        },
        {
          label: 'II. 주요 사업 계획',
          body: (
            <>
              <p>
                <strong>1. 전시 프로그램</strong>
              </p>
              {EXHIBITIONS.map(ex => (
                <div key={ex.period}>
                  <p>
                    {ex.period} — {ex.title}
                  </p>
                  <List items={ex.items} />
                </div>
              ))}
              <p>
                <strong>2. Art Lab &amp; 레지던시 프로그램</strong>
              </p>
              {LAB.map(lab => (
                <div key={lab.title}>
                  <p>{lab.title}</p>
                  <List items={lab.items} />
                </div>
              ))}
              <p>
                <strong>3. 디지털 플랫폼 구축</strong>
              </p>
              <List items={DIGITAL} />
            </>
          ),
        },
        {
          label: 'III. 예산 계획',
          body: (
            <>
              <Ledger title='수입 계획 (₩58,230,606)' rows={INCOME} />
              <Ledger title='지출 계획 (₩57,466,758)' rows={EXPENSES} />
              <p className='ab-ledger__total'>예상 순수지: ₩763,848</p>
            </>
          ),
        },
        { label: 'IV. 기대 효과', body: <List items={EXPECTED_EFFECTS} /> },
      ]}
    />
  )
}
