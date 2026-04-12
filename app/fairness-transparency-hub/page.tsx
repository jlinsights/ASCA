import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import {
  Shield,
  Scale,
  ClipboardCheck,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  Phone,
  MessageCircle,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '공정·투명성 허브 | 동양서예협회',
  description:
    '(사) 동양서예협회는 공모전·전시 운영의 공정성·투명성 기준을 공개합니다. 운영원칙, 심사단계, 이의제기 절차, 이해상충 확인 등 투명한 운영을 위한 모든 정보를 확인하세요.',
  openGraph: {
    title: '공정·투명성 허브 | 동양서예협회',
    description:
      '운영을 신뢰받는 단체가 되기 위해 공모전·전시 운영의 공정성·투명성 기준을 공개합니다.',
  },
}

const CORE_PRINCIPLES = [
  '기준의 공개: 심사 기준, 진행 단계, 주요 일정은 가능한 범위에서 사전에 안내합니다.',
  '이해상충의 회피: 심사위원은 이해상충 여부를 사전에 확인하고, 해당 건 심사에서 회피합니다.',
  '동일 기준의 적용: 동일 조건에는 동일 절차를 적용하며, 예외는 최소화합니다.',
  '검증을 통한 신뢰 확보: 필요 시 현장휘호·원작확인 등 검증 절차를 운영합니다.',
  '절차적 권리 보장: 출품자의 이의제기 권리를 보장하고, 정해진 절차에 따라 처리합니다.',
  '기록과 책임성: 심사·검증·결정의 핵심 기록을 내부 기준에 따라 보관하고 책임선을 명확히 합니다.',
  '개인정보·저작권 보호: 출품작과 개인정보는 목적 범위 내에서만 처리하며 무단 공개·2차 활용을 제한합니다.',
]

const SUBMITTER_RIGHTS = [
  '동일 기준으로 평가받을 권리',
  '심사 절차 및 일정 안내를 받을 권리',
  '개인정보 및 출품작 정보 보호를 받을 권리',
  '이의제기를 신청하고 답변을 받을 권리',
  '결과 발표 이후 필요한 전시/반입·반출/안내를 받을 권리',
]

const JUDGING_STEPS = [
  {
    step: '1',
    title: '접수 (Submission)',
    items: [
      '출품작 및 서류의 규격·기재사항 확인',
      '접수번호 부여 및 접수 완료 안내',
      '결격/누락 발생 시 보완 요청 또는 접수 불가 안내',
    ],
  },
  {
    step: '2',
    title: '예심 (Pre-screening)',
    items: [
      '부문별 기준에 따른 1차 평가',
      '규정 준수 여부 및 최소 기준 충족 여부 확인',
      '본심 대상 작품 확정(내부 기록)',
    ],
  },
  {
    step: '3',
    title: '본심 (Main Review)',
    items: [
      '작품성·완성도·부문 적합성 중심의 본 평가',
      '점수/등급 또는 선정 기준 적용(회차별 요강 기준)',
      '결과(검증 대상 포함) 잠정 산정',
    ],
  },
  {
    step: '4',
    title: '검증 (Verification)',
    items: [
      '필요 시 현장휘호 요청 및 진행(회차별 공지)',
      '원작 확인 또는 원본 제출 요청(필요 시)',
      '표절·대작 의심 등 이슈 발생 시 사실 확인 절차 진행',
    ],
  },
  {
    step: '5',
    title: '최종확정 (Final Decision)',
    items: ['검증 결과 반영 및 최종 결과 확정', '전시/도록/시상 운영을 위한 확정 리스트 생성'],
  },
  {
    step: '6',
    title: '결과공지 (Announcement)',
    items: [
      '홈페이지 공지 및 필요 시 개별 안내',
      '전시 일정·반입/반출·도록/시상 안내를 함께 공지',
      '이의제기 접수 기간 및 방법을 동시에 안내',
    ],
  },
  {
    step: '7',
    title: '이의제기 (Objection)',
    items: [
      '정해진 기간·채널·필수 기재사항에 따라 접수',
      '사실관계 중심으로 검토 및 회신',
      '근거 없는 비방/인신공격/기한 경과 등은 처리 대상에서 제외될 수 있음',
    ],
  },
]

const OBJECTION_TYPES = [
  { title: '절차 관련', desc: '접수/검증/결과 공지 과정의 절차적 문제 제기' },
  { title: '사실관계 관련', desc: '본인 정보·출품 정보의 오류 정정 요청' },
  { title: '검증 관련', desc: '현장휘호·원작확인 요청 및 결과 관련 사실 확인 요청' },
]

const DISMISSAL_REASONS = [
  '접수 기간 경과',
  '필수 정보(성명/연락처/접수번호 등) 누락',
  '인신공격·비방·허위 사실 유포 목적',
  '심사위원 개인 신상 공개 요구 등 운영 원칙 위반',
]

const COI_ITEMS = [
  '최근 3년 내 본인이 직접 지도/사사한 출품자가 포함되어 있다.',
  '본인 또는 가족/동거인이 출품자와 경제적 이해관계(고용, 계약, 공동사업 등)가 있다.',
  '본인이 출품자와 공동 전시/공동 프로젝트 등 이해관계가 있는 활동을 최근 3년 내 수행했다.',
  '본인이 출품자 또는 특정 기관/지회/단체와 심사 공정성에 영향을 줄 수 있는 관계가 있다.',
  '심사 과정에서 다룰 정보(점수/결과/검증 등)를 외부로 공유 요청받았거나 공유한 사실이 있다.',
]

const NAV_ITEMS = [
  { id: 'principles', label: '운영원칙', icon: Shield },
  { id: 'judging', label: '심사단계', icon: Scale },
  { id: 'objection', label: '이의제기', icon: AlertTriangle },
  { id: 'coi', label: '이해상충', icon: UserCheck },
]

export default function FairnessTransparencyHubPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Fairness &amp; Transparency Hub
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>공정·투명성 허브</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            (사) 동양서예협회는 &ldquo;전시를 잘하는 단체&rdquo;를 넘어,{' '}
            <strong className='text-foreground'>운영을 신뢰받는 단체</strong>가 되기 위해
            공모전·전시 운영의 공정성·투명성 기준을 공개합니다.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <aside className='lg:w-64 shrink-0'>
            <div className='sticky top-24 space-y-6'>
              <div>
                <h3 className='text-sm font-semibold mb-3'>목차</h3>
                <nav className='space-y-1'>
                  {NAV_ITEMS.map(item => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className='flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                    >
                      <item.icon className='h-4 w-4' />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className='space-y-2'>
                <h3 className='text-sm font-semibold mb-3'>이의제기 접수</h3>
                <Link
                  href='tel:+8250255508700'
                  className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
                >
                  <Phone className='h-4 w-4' />
                  0502-5550-8700
                </Link>
                <Link
                  href='https://orientalcalligraphy.channel.io'
                  target='_blank'
                  className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
                >
                  <MessageCircle className='h-4 w-4' />
                  실시간 상담/문의
                </Link>
              </div>

              <Link
                href='/articles-of-incorporation-and-bylaws'
                className='flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity w-full justify-center'
              >
                <FileText className='h-4 w-4' />
                정관 및 관련규정
              </Link>
            </div>
          </aside>

          <main className='flex-1 min-w-0 space-y-16'>
            <Card className='border-scholar-red/20 bg-muted/30'>
              <CardContent className='pt-6'>
                <h3 className='font-semibold mb-3'>한눈에 요약</h3>
                <ul className='space-y-2 text-sm'>
                  <li className='flex gap-2'>
                    <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                    <span>
                      <strong>운영 원칙</strong>으로 기준을 고정하고,
                    </span>
                  </li>
                  <li className='flex gap-2'>
                    <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                    <span>
                      <strong>심사 단계(접수→예심→본심→검증→최종확정→결과공지→이의제기)</strong>를
                      공개하며,
                    </span>
                  </li>
                  <li className='flex gap-2'>
                    <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                    <span>
                      <strong>이의제기 절차</strong>와 <strong>심사위원 이해상충 회피</strong>를
                      문서로 명확히 합니다.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <section id='principles'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='h-5 w-5 text-scholar-red' />
                    공정성·투명성 운영 원칙
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    (사) 동양서예협회는 공모전·전시 운영 전 과정에서 공정성(Fairness)과
                    투명성(Transparency)을 최우선 가치로 선언합니다.
                  </p>
                </CardHeader>
                <CardContent className='space-y-8'>
                  <div>
                    <h4 className='font-semibold mb-4'>핵심 원칙 7가지</h4>
                    <ol className='space-y-3'>
                      {CORE_PRINCIPLES.map((principle, i) => (
                        <li key={i} className='flex gap-3 text-sm'>
                          <Badge
                            variant='outline'
                            className='shrink-0 h-6 w-6 rounded-full p-0 justify-center'
                          >
                            {i + 1}
                          </Badge>
                          <span>{principle}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className='font-semibold mb-4'>출품자 권리 5가지</h4>
                    <ul className='space-y-2'>
                      {SUBMITTER_RIGHTS.map((right, i) => (
                        <li key={i} className='flex gap-2 text-sm'>
                          <ClipboardCheck className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                          <span>{right}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id='judging'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Scale className='h-5 w-5 text-scholar-red' />
                    심사 프로세스 단계 안내
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    접수부터 이의제기까지의 표준 절차를 다음과 같이 운영합니다. 회차별 세부 일정은
                    해당 공모요강에 따릅니다.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    {JUDGING_STEPS.map(step => (
                      <div key={step.step} className='flex gap-4'>
                        <div className='flex flex-col items-center'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-scholar-red text-white text-sm font-bold'>
                            {step.step}
                          </div>
                          {step.step !== '7' && <div className='w-px flex-1 bg-border mt-2' />}
                        </div>
                        <div className='pb-6'>
                          <h4 className='font-semibold text-sm mb-2'>{step.title}</h4>
                          <ul className='space-y-1'>
                            {step.items.map((item, i) => (
                              <li key={i} className='text-sm text-muted-foreground flex gap-2'>
                                <span className='shrink-0'>•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id='objection'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AlertTriangle className='h-5 w-5 text-scholar-red' />
                    이의제기 처리 규정
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    본 규정은 (사) 동양서예협회 공모전·전시 공모의 결과 및 절차 관련 이의제기를
                    공정하고 신속하게 처리하기 위한 기준입니다.
                  </p>
                </CardHeader>
                <CardContent className='space-y-8'>
                  <Card className='border-scholar-red/20 bg-muted/30'>
                    <CardContent className='pt-4'>
                      <ul className='space-y-1 text-sm'>
                        <li>
                          <strong>접수 기간</strong>: 결과 공지일로부터 7일 이내(단, 회차별 공모요강
                          우선)
                        </li>
                        <li>
                          <strong>원칙</strong>: 사실관계 중심 검토 + 접수 확인 회신 + 기한 내 답변
                        </li>
                        <li>
                          <strong>채널</strong>: 전화/실시간 상담(공식 채널)로 접수
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className='font-semibold mb-3'>처리 원칙 및 기한</h4>
                    <ul className='space-y-2 text-sm'>
                      <li className='flex gap-2'>
                        <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                        <span>
                          협회는 접수된 이의제기에 대해 <strong>접수 확인 회신</strong>을
                          제공합니다.
                        </span>
                      </li>
                      <li className='flex gap-2'>
                        <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                        <span>
                          접수일로부터 <strong>영업일 3일 이내 1차 회신</strong>,{' '}
                          <strong>영업일 14일 이내 최종 회신</strong>을 원칙으로 합니다.
                        </span>
                      </li>
                      <li className='flex gap-2'>
                        <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                        <span>추가 검토가 필요한 경우 지연 사유와 예정 일정을 안내합니다.</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-semibold mb-3'>접수 가능한 유형</h4>
                    <div className='grid gap-3 sm:grid-cols-3'>
                      {OBJECTION_TYPES.map(type => (
                        <div key={type.title} className='rounded-lg border p-4'>
                          <h5 className='text-sm font-medium mb-1'>{type.title}</h5>
                          <p className='text-xs text-muted-foreground'>{type.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-semibold mb-3'>각하 사유</h4>
                    <ul className='space-y-1'>
                      {DISMISSAL_REASONS.map((reason, i) => (
                        <li key={i} className='text-sm text-muted-foreground flex gap-2'>
                          <span className='shrink-0'>•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-semibold mb-3'>필수 기재사항</h4>
                    <ul className='space-y-1 text-sm'>
                      <li>(필수) 성명, 연락처, 접수번호(또는 출품 정보)</li>
                      <li>(필수) 이의제기 대상(부문/항목/사안)</li>
                      <li>(필수) 이의제기 사유 및 근거(사실관계 중심)</li>
                      <li>(필수) 요청사항(정정 요청, 사실 확인 요청 등)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id='coi'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <UserCheck className='h-5 w-5 text-scholar-red' />
                    심사위원 이해상충(COI) 확인서
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    본 확인서는 (사) 동양서예협회 공모전·전시 심사 운영의 공정성을 확보하기 위한
                    필수 절차입니다. 심사위원은 아래 항목을 확인하고, 이해상충이 있는 경우 해당 건
                    심사에서 회피합니다.
                  </p>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <Card className='border-scholar-red/20 bg-muted/30'>
                    <CardContent className='pt-4'>
                      <ul className='space-y-1 text-sm'>
                        <li>
                          심사위원은 <strong>사전 이해상충 점검</strong>을 완료합니다.
                        </li>
                        <li>
                          해당 시 <strong>회피(배제)</strong> 원칙을 적용합니다.
                        </li>
                        <li>
                          심사 정보는 <strong>비밀유지</strong> 원칙을 준수합니다.
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className='font-semibold mb-4'>이해상충 확인 항목</h4>
                    <div className='space-y-3'>
                      {COI_ITEMS.map((item, i) => (
                        <div key={i} className='flex gap-3 rounded-lg border p-4'>
                          <Badge
                            variant='outline'
                            className='shrink-0 h-6 w-6 rounded-full p-0 justify-center'
                          >
                            {i + 1}
                          </Badge>
                          <span className='text-sm'>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='rounded-lg border p-4 bg-muted/30'>
                    <h4 className='font-semibold mb-2 text-sm'>비밀유지 및 공정 심사 서약</h4>
                    <p className='text-sm text-muted-foreground'>
                      심사위원은 심사 과정에서 취득한 모든 정보를 외부에 공개하지 않으며, 공정한
                      기준에 따라 심사에 임합니다. 또한 이해상충이 확인되는 경우 협회 요청에 따라
                      해당 심사에서 회피합니다.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <div className='text-center text-sm text-muted-foreground'>
              <p>
                <strong>시행일</strong>: 2026.01.01 | <strong>버전</strong>: v1.0
              </p>
            </div>
          </main>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
