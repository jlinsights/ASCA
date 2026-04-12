export const BRAND_IDENTITY_ITEMS = [
  {
    title: '正法의 계승 발전',
    description:
      '동양 예술의 오랜 정신과 가치를 계승하며, 한·중·일 서예의 풍부한 문화적 유산을 존중합니다.',
  },
  {
    title: '創新의 조화로운 구현',
    description: '전통 서예의 현대적 재해석과 실험적 시도를 통해 새로운 예술 언어를 창조합니다.',
  },
  {
    title: '조화와 균형',
    description: '전통과 현대, 동양과 서양, 정신과 기술의 균형 있는 융합을 추구합니다.',
  },
  {
    title: '예술적 탁월함',
    description:
      '세심한 붓놀림부터 작품의 구성까지, 모든 단계에서 최고의 예술적 완성도를 추구합니다.',
  },
  {
    title: '문화적 유산',
    description:
      '동아시아 서예와 문화예술을 보존하고 계승하며 미래 세대를 위한 문화적 다리를 놓습니다.',
  },
  {
    title: '글로벌 비전',
    description: '국경과 언어를 초월하여 세계와 소통하는 열린 예술 정신을 지향합니다.',
  },
] as const

export interface ColorSwatch {
  name: string
  hex: string
  description: string
  textDark?: boolean
}

export const PRIMARY_COLORS: ColorSwatch[] = [
  {
    name: 'Traditional Ink Black',
    hex: '#1a1a1a',
    description: '먹의 깊이와 전통의 권위를 상징하는 주요 배경색',
  },
  {
    name: 'Rice Paper White',
    hex: '#f5f5f0',
    description: '한지의 따스한 질감과 순수함을 담은 기본 폰트 색상',
    textDark: true,
  },
  {
    name: 'Celadon Green',
    hex: '#88A891',
    description: '동아시아 청자의 고요함과 지혜를 표현하는 포인트 컬러',
    textDark: true,
  },
  { name: 'Terra Red', hex: '#9B4444', description: '전통 도장의 주홍색에서 영감받은 강조색' },
  { name: 'Stone Gray', hex: '#707070', description: '동양 문인석의 고전적 품격을 담은 중성색' },
  {
    name: 'Sage Green',
    hex: '#B7C4B7',
    description: '문인화의 절제된 초록빛을 현대적으로 재해석',
    textDark: true,
  },
  {
    name: 'Spring Green',
    hex: '#09f557',
    description: '자연의 생동감과 새로운 시작을 상징',
    textDark: true,
  },
  {
    name: 'Gold',
    hex: '#ffcc00',
    description: '전통 금박의 격조 높은 화려함을 담은 액센트',
    textDark: true,
  },
  { name: 'Medium Orchid', hex: '#c14af2', description: '동양 난초의 기품과 창의성을 상징' },
  { name: 'Royal Blue', hex: '#275eea', description: '청화백자의 깊고 맑은 청색에서 영감' },
  {
    name: 'Scholar Red',
    hex: '#af2626',
    description: '동아시아 학자들이 사용한 주묵의 강렬한 붉은색',
  },
  { name: 'Menu', hex: '#363636', description: 'UI 메뉴에 최적화된 가독성 높은 어두운 회색' },
]

export const NEUTRAL_COLORS: ColorSwatch[] = [
  {
    name: 'Neutral 100',
    hex: '#ffffff',
    description: '순수한 백색으로 여백과 빛을 표현',
    textDark: true,
  },
  {
    name: 'Neutral 200',
    hex: '#f7f7fb',
    description: '미세한 푸른 기가 있는 부드러운 배경색',
    textDark: true,
  },
  {
    name: 'Neutral 300',
    hex: '#f3f3f3',
    description: '섹션 구분과 카드 배경에 적합한 은은한 회색',
    textDark: true,
  },
  { name: 'Neutral 400', hex: '#9d9d9d', description: '부가 텍스트와 아이콘에 적합한 중간 회색' },
  {
    name: 'Neutral 500',
    hex: '#696969',
    description: '기본 텍스트와 UI 요소에 사용되는 진한 회색',
  },
  { name: 'Neutral 600', hex: '#363636', description: '강조 텍스트와 버튼에 적합한 짙은 회색' },
  { name: 'Neutral 700', hex: '#232323', description: '제목과 중요 요소를 위한 거의 검은색' },
  { name: 'Neutral 800', hex: '#070707', description: '최대 강조와 대비를 위한 심연의 검은색' },
]

export const LOGO_SECTIONS = [
  {
    title: '로고 주요 요소',
    items: [
      {
        label: '자연스러운 붓 획',
        text: '서예가의 붓놀림이 느껴지는 브러시 스트로크 캘리그래피로 전통적 서예의 정수를 표현',
      },
      {
        label: '여백의 미',
        text: "동양 예술의 핵심 철학인 '여백'을 로고에 적용하여 숨쉬는 공간감 창출",
      },
      { label: '대칭적 균형', text: '상하 대칭의 잎사귀 모티프로 자연과 조화, 성장의 상징성 부여' },
      {
        label: '서체의 대비',
        text: '캘리그래피와 현대적 산세리프 서체의 조합으로 전통과 현대의 공존 표현',
      },
    ],
  },
  {
    title: '타이포그래피 계층 구조',
    items: [
      {
        label: '메인 로고타입',
        text: "손글씨 스타일의 'Oriental Calligraphy'는 동양 서예의 유연함과 예술성을 강조",
      },
      {
        label: '서브 태그라인',
        text: "모던한 산세리프체의 'WHERE TRADITION FLOWS CONTEMPORARY'로 현대적 메시지 전달",
      },
      {
        label: '대비와 조화',
        text: '두 서체의 의도적 대비를 통해 전통과 현대가 공존하는 브랜드 가치 표현',
      },
      {
        label: '시각적 리듬감',
        text: '서체 크기와 두께의 다양성으로 시선의 흐름과 계층적 중요도 구현',
      },
    ],
  },
  {
    title: '여백 활용 (Clear Space)',
    items: [
      { label: '최소 여백 확보', text: '로고 높이의 1/3 이상의 여백을 모든 방향에서 확보' },
      {
        label: '시각적 순수성',
        text: '다른 그래픽 요소나 텍스트가 로고의 인식을 방해하지 않도록 보호 영역 설정',
      },
      {
        label: '내부 공간 조절',
        text: "텍스트와 잎사귀 모티프 사이의 간격을 통해 '숨'이 느껴지는 공간 구성",
      },
      { label: '절대 최소 여백', text: '어떤 상황에서도 로고 주변 20px 이상의 여백 유지 필수' },
    ],
  },
  {
    title: '컬러 적용 가이드라인',
    items: [
      {
        label: '주요 색상',
        text: 'Traditional Ink Black(#1a1a1a)와 Rice Paper White(#f5f5f0)를 기본으로 사용',
      },
      { label: '보조 색상', text: '특별한 경우 Celadon Green(#88A891) 사용 가능' },
      { label: '배경별 조정', text: '어두운 배경에는 흰색 로고, 밝은 배경에는 검정 로고를 사용' },
      {
        label: '단일 색상 원칙',
        text: '그라데이션이나 다중 색상 적용은 지양하고 단일 색상 사용을 원칙으로 함',
      },
    ],
  },
  {
    title: '크기 규정 (Size Specifications)',
    items: [
      { label: '디지털 최소 크기', text: '너비 120px / 높이 80px 이상으로 사용하여 가독성 보장' },
      { label: '인쇄물 최소 크기', text: '너비 30mm / 높이 20mm 이상 적용으로 디테일 보존' },
      { label: '대형 출력물', text: '비율을 정확히 유지하며 해상도 저하 없이 확대 사용' },
      {
        label: '응용 매체별 규정',
        text: '웹, 인쇄물, 사인물 등 매체 특성에 맞는 최적화된 크기 가이드라인 준수',
      },
    ],
  },
] as const

export const LOGO_DOS = [
  '원본 비율을 항상 정확히 유지하기',
  '지정된 브랜드 컬러만 사용하기',
  '모든 방향에서 충분한 여백 확보하기',
  '배경과 최적의 대비를 이루는 버전 선택하기',
  '고해상도 원본 파일 형식(SVG, AI) 활용하기',
  '매체별 권장 최소 크기 준수하기',
]

export const LOGO_DONTS = [
  '로고 비율 왜곡하거나 임의로 변경하지 않기',
  '지정되지 않은 컬러나 그라데이션 적용하지 않기',
  '복잡한 이미지나 패턴 위에 직접 배치하지 않기',
  '로고 회전하거나 기울이지 않기',
  '그림자, 윤곽선, 광택 등의 효과 추가하지 않기',
  '로고 구성 요소의 위치나 크기 임의 변경하지 않기',
]

export const SIDEBAR_SECTIONS = [
  { id: 'brand-identity', label: '브랜드 아이덴티티' },
  { id: 'logo-identity', label: '로고 아이덴티티' },
  { id: 'color-palette', label: '컬러 팔레트' },
  { id: 'tagline', label: '태그라인' },
  { id: 'slogan', label: '슬로건' },
] as const
