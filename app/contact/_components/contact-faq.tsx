'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ_ITEMS = [
  {
    q: '추천작가와 초대작가 선정 기준이 궁금합니다.',
    a: `대한민국 동양서예대전 입상작 배점 기준:
• 입선 1점 / 특선 3점 / 삼체상 5점 / 오체상 7점
• 우수상 7점 / 최우수상 8점 / 대상 9점

작가별 수상작의 배점을 합산하여 선정합니다.
• 1~9점: 공모작가, 청년작가, 일반작가
• 10~14점: 추천작가
• 15점 이상: 초대작가

자격심사위원회에서 서류심사와 작품심사를 거쳐 유자격 심사위원 전원의 3분의 2이상 찬성으로 자격을 부여합니다. 추천작가는 3년 이상의 정회원 경력과 수상실적이, 초대작가는 5년 이상의 추천작가 경력이 필요합니다.`,
  },
  {
    q: '연회비의 사용처는 어떻게 되나요?',
    a: `연회비는 다음과 같은 목적으로 사용됩니다:

1. 주요 사업 수행: 한·중·일 연합전 개최, 전국단위 공모전, 국내외 교류전시 및 학술발표, 한국적 서체개발 육성
2. 협회 운영 및 관리: 사무국 운영, 각종 행사 및 전시회 운영비
3. 회원 지원: 자료 및 출판물 제공, 작품 전시 및 홍보, 온라인 전시공간 운영
4. 교육 및 연구 활동

모든 재정 사용은 매년 예산편성과 결산을 통해 이사회 의결과 총회 승인을 받으며, 연 2회 이상의 회계감사를 통해 투명성을 확보합니다.`,
  },
  {
    q: '로그인 하기 위해서 기존 회원들도 다시 홈페이지에서 회원 가입해야 하나요?',
    a: '아니요, 필요 없습니다. 현재 소셜 로그인 기능을 준비 중에 있습니다. 현재 모든 콘텐츠는 공개되고 있으며 추후에 로그인 기능이 복원되면 온라인 회원 가입 가능할 수 있도록 조치할 예정입니다.',
  },
  {
    q: '동양서예협회 정회원으로 가입하면 어떠한 특장점이 있나요?',
    a: `[회원 특전]
1. 전시 활동: 출품료 할인, 지부/지회 전시회 참가, 초대작가 승급 기회, 한·중·일 연합전시 참가
2. 교육 혜택: 학술세미나 참여, 명가 초청 특강, 전문 교육프로그램 할인
3. 디지털 서비스: 작가 홈페이지 제작비 할인, 온라인 작품 갤러리, SNS 홍보 지원
4. 네트워크: 서예가 커뮤니티, 지역 작가 교류, 국제 교류전, 협회 공식행사 초청
5. 삼성금융네트웍스 제휴·후원 혜택: 연회비·출품료·수강료 50~100% 할인`,
  },
  {
    q: '영문이름을 요청하는 사유가 무엇인가요?',
    a: `모든 정회원에게 아래 형식의 개인 URL을 만들어 드리기 위함입니다:
https://orientalcalligraphy.org/calligrapher/name

작가님만의 글로벌 링크로, 온/오프라인에서 경력 및 작품을 전세계에 소개하실 수 있습니다. 원하시는 이름이나 아호를 영문으로 알려주시면 연회비 납부 및 정회원 여부 확인 후 무료로 웹페이지를 만들어 드립니다.`,
  },
  {
    q: '서예 강좌를 운영하고 있나요?',
    a: '네, 협회 상임이사진의 공식 승인된 교육기관들에 한하여 서예강좌를 연결하여 드리고 있습니다. 기초부터 중상급 실력자들을 위한 서예강좌를 지속적으로 늘려나갈 계획입니다. 현재 한국한문한자교사중앙연수원 문원한문서예학원에서 서예 및 동양화 등의 교육을 위탁 개시하였습니다.',
  },
  {
    q: '연회비가 별도로 있나요?',
    a: `회원 종류별 연회비와 입회비:
• 청년작가: 연회비 3만원 + 입회비 1만원
• 일반작가: 연회비 5만원 + 입회비 2만원
• 추천작가: 연회비 8만원 + 승급 등록비 3만원
• 초대작가: 연회비 10만원 + 승급 등록비 5만원
• 임원: 연회비 20만원 + 발전기금 200만원`,
  },
  {
    q: "'평생회원'이 연회비 납부 면제되던데 어떤 요건을 충족해야 하나요?",
    a: `임원으로 취임하는 정회원은 발전기금 2백만원을 납부하면 '평생회원' 자격을 자동 취득하며, 이후 연회비 납부 의무가 영구히 면제됩니다. 발전기금은 최대 20개월까지 CMS를 통해 분할 납부가 가능합니다.

초대작가 등급의 일반회원은 평생회비 1백만원(연회비 10만원 × 10년)을 일시 납부하여 평생회원 자격을 얻을 수 있습니다.`,
  },
  {
    q: '대한민국 동양서예대전 출품 가능한 작품 수량과 출품료는 어떻게 되나요?',
    a: `출품비 기준 (표구비 제외):
• 공모작가: 작품 1점당 6만원 (2점 이상 5만원)
• 추천작가: 작품 1점당 10만원 (2점 이상 9만원)
• 초대작가: 작품 1점당 20만원 (2점 이상 19만원)
• 청년작가: 작품 1점당 5만원 (수량 제한 없음)

표구비: 반절지 8만원(회원 6만원), 전지 10만원(회원 8만원), 국전지 12만원(회원 10만원)`,
  },
  {
    q: '심사위원 운영위원 자격과 수당은 어떻게 되나요?',
    a: `운영위원 및 심사위원 자격:
① 본회 초대작가 (자문위원, 고문 포함)
② 다른 서예 단체 초대작가
③ 본회 고문이나 자문위원이 추천한 인사

보수는 운영 및 심사 규정 제4조의 2항에 따라 활동의 성격에 따라 수당 및 여비, 실적 인센티브로 구분 지급합니다. 지원하시려면 "위원 위촉 지원서"를 사무국에 제출해 주시기 바랍니다.`,
  },
  {
    q: '대한민국 동양서예대전 공모전 시상내역과 상금은 어떻게 되나요?',
    a: `본상: 대상 1명(상금 200만원), 최우수상 1명(100만원), 우수상 2명(30만원)
특별상: 오체상 3명(20만원), 삼체상 4명(10만원)
기타: 특선 30명(상장), 입선 50명(상장)

시상 인원은 당해 연도 출품작의 수와 수준에 따라 이사회 의결로 조정될 수 있습니다.`,
  },
  {
    q: '작가들을 위한 홈페이지 제작과 유지보수를 지원해 주나요?',
    a: `네, 동양서예협회는 프리미엄 웹사이트 제작 및 유지보수 서비스를 제공합니다.
• 초기 구축비: 70만원 (정회원 60만원)
• 연간 유지보수비: 30만원 (정회원 20만원)

유지보수비를 납부한 정회원은 해당 연도의 연회비가 면제됩니다. 전시 40점 이상 출품 시 제작비 및 1차 연도 유지보수비 전액 면제 혜택도 있습니다.`,
  },
]

export function ContactFaq() {
  return (
    <section className='container mx-auto px-4 py-12 md:py-16'>
      <div className='text-center mb-10'>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>자주 문의하시는 질문</h2>
        <div className='flex items-center justify-center gap-3 mt-6'>
          <a
            href='https://orientalcalligraphy.channel.io'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center rounded-md bg-scholar-red px-5 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
          >
            상담 문의
          </a>
          <a
            href='https://cal.com/orientalcalligraphy'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors'
          >
            상담 예약
          </a>
        </div>
      </div>

      <div className='max-w-4xl mx-auto'>
        <Accordion type='single' collapsible className='space-y-3'>
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className='rounded-lg border bg-card px-4 md:px-6'
            >
              <AccordionTrigger className='text-left text-sm md:text-base font-medium py-4 hover:no-underline'>
                {item.q}
              </AccordionTrigger>
              <AccordionContent className='text-sm text-muted-foreground pb-4 whitespace-pre-line'>
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
