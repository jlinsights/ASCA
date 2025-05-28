"use client"

import React from 'react'
import { 
  BrandContainer, 
  BrandSection, 
  BrandHeading, 
  BrandText, 
  BrandCard, 
  BrandGrid,
  BrandSpacer 
} from './brand-components'
import { Button } from './button'
import { Badge } from './badge'

export function BrandUsageExamples() {
  return (
    <div className="space-y-12">
      {/* 기본 레이아웃 예시 */}
      <div>
        <h3 className="text-lg font-semibold mb-6">레이아웃 컴포넌트 사용 예시</h3>
        
        <BrandSection background="muted" spacing="lg">
          <BrandContainer variant="wide">
            <BrandHeading as="h2" size="xl" color="brand" align="center">
              브랜드 컴포넌트 시스템
            </BrandHeading>
            <BrandSpacer size="md" />
            <BrandText size="lg" color="muted" align="center">
              일관된 디자인을 위한 재사용 가능한 컴포넌트들입니다.
            </BrandText>
          </BrandContainer>
        </BrandSection>
      </div>

      {/* 카드 그리드 예시 */}
      <div>
        <h3 className="text-lg font-semibold mb-6">카드 그리드 예시</h3>
        
        <BrandContainer>
          <BrandGrid cols={3} gap="lg">
            <BrandCard variant="glass" padding="lg">
              <BrandHeading as="h3" size="md" color="bronze">
                글래스 카드
              </BrandHeading>
              <BrandSpacer size="sm" />
              <BrandText color="muted">
                글래스모피즘 효과가 적용된 카드입니다.
              </BrandText>
              <BrandSpacer size="md" />
              <Button variant="outline" size="sm">
                자세히 보기
              </Button>
            </BrandCard>

            <BrandCard variant="elevated" padding="lg">
              <BrandHeading as="h3" size="md" color="forest">
                엘리베이티드 카드
              </BrandHeading>
              <BrandSpacer size="sm" />
              <BrandText color="muted">
                호버 효과와 그림자가 있는 카드입니다.
              </BrandText>
              <BrandSpacer size="md" />
              <Button size="sm">
                자세히 보기
              </Button>
            </BrandCard>

            <BrandCard variant="gradient" padding="lg">
              <BrandHeading as="h3" size="md">
                그라데이션 카드
              </BrandHeading>
              <BrandSpacer size="sm" />
              <BrandText>
                브랜드 그라데이션이 적용된 카드입니다.
              </BrandText>
              <BrandSpacer size="md" />
              <Button variant="secondary" size="sm">
                자세히 보기
              </Button>
            </BrandCard>
          </BrandGrid>
        </BrandContainer>
      </div>

      {/* 텍스트 스타일 예시 */}
      <div>
        <h3 className="text-lg font-semibold mb-6">텍스트 스타일 예시</h3>
        
        <BrandCard variant="default" padding="lg">
          <BrandHeading as="h1" size="2xl" color="brand">
            메인 헤딩 (H1)
          </BrandHeading>
          <BrandSpacer size="sm" />
          
          <BrandHeading as="h2" size="xl" color="bronze">
            서브 헤딩 (H2)
          </BrandHeading>
          <BrandSpacer size="sm" />
          
          <BrandHeading as="h3" size="lg" color="forest">
            섹션 헤딩 (H3)
          </BrandHeading>
          <BrandSpacer size="sm" />
          
          <BrandText size="lg" weight="medium">
            큰 본문 텍스트 - 중요한 내용에 사용
          </BrandText>
          <BrandSpacer size="xs" />
          
          <BrandText size="base">
            일반 본문 텍스트 - 기본적인 내용에 사용
          </BrandText>
          <BrandSpacer size="xs" />
          
          <BrandText size="sm" color="muted">
            작은 텍스트 - 부가 정보나 캡션에 사용
          </BrandText>
        </BrandCard>
      </div>

      {/* 섹션 배경 예시 */}
      <div>
        <h3 className="text-lg font-semibold mb-6">섹션 배경 예시</h3>
        
        <div className="space-y-4">
          <BrandSection background="default" spacing="md">
            <BrandContainer>
              <BrandText align="center">기본 배경 섹션</BrandText>
            </BrandContainer>
          </BrandSection>

          <BrandSection background="muted" spacing="md">
            <BrandContainer>
              <BrandText align="center">뮤티드 배경 섹션</BrandText>
            </BrandContainer>
          </BrandSection>

          <BrandSection background="glass" spacing="md">
            <BrandContainer>
              <BrandText align="center">글래스 배경 섹션</BrandText>
            </BrandContainer>
          </BrandSection>

          <BrandSection background="navy" spacing="md">
            <BrandContainer>
              <BrandText align="center">네이비 배경 섹션</BrandText>
            </BrandContainer>
          </BrandSection>

          <BrandSection background="gold" spacing="md">
            <BrandContainer>
              <BrandText align="center">골드 배경 섹션</BrandText>
            </BrandContainer>
          </BrandSection>
        </div>
      </div>

      {/* 실제 사용 예시 - 금융 컨설팅 특화 */}
      <div>
        <h3 className="text-lg font-semibold mb-6">금융 컨설팅 특화 사용 예시</h3>
        
        <BrandSection background="gradient" spacing="xl">
          <BrandContainer variant="narrow">
            <BrandHeading as="h2" size="xl" align="center">
              프리미엄 패밀리오피스
            </BrandHeading>
            <BrandSpacer size="md" />
            <BrandText size="lg" align="center">
              고액 자산가를 위한 전문적인 자산 관리와 투자 자문 서비스
            </BrandText>
            <BrandSpacer size="lg" />
            
            <BrandGrid cols={3} gap="lg">
              <BrandCard variant="glass" padding="lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-trust-blue/20">
                    <Badge className="bg-trust-blue text-white">투자 자문</Badge>
                  </div>
                </div>
                <BrandHeading as="h3" size="md" color="gold">
                  포트폴리오 관리
                </BrandHeading>
                <BrandSpacer size="sm" />
                <BrandText color="muted" size="sm">
                  개인 맞춤형 투자 전략 수립과 포트폴리오 최적화를 통해 
                  안정적인 수익을 추구합니다.
                </BrandText>
                <BrandSpacer size="md" />
                <div className="flex items-center justify-between text-sm mb-3">
                  <span>예상 수익률</span>
                  <span className="font-semibold text-success-green">+8.5%</span>
                </div>
                <Button variant="outline" className="w-full">
                  상담 신청
                </Button>
              </BrandCard>

              <BrandCard variant="glass" padding="lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-premium-purple/20">
                    <Badge className="bg-premium-purple text-white">자산 관리</Badge>
                  </div>
                </div>
                <BrandHeading as="h3" size="md" color="burgundy">
                  종합 자산 관리
                </BrandHeading>
                <BrandSpacer size="sm" />
                <BrandText color="muted" size="sm">
                  부동산, 금융 자산, 대안 투자까지 포괄하는 
                  통합 자산 관리 서비스를 제공합니다.
                </BrandText>
                <BrandSpacer size="md" />
                <div className="flex items-center justify-between text-sm mb-3">
                  <span>관리 자산</span>
                  <span className="font-semibold text-gold-primary">₩50억+</span>
                </div>
                <Button variant="outline" className="w-full">
                  상담 신청
                </Button>
              </BrandCard>

              <BrandCard variant="glass" padding="lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-warning-amber/20">
                    <Badge className="bg-warning-amber text-white">리스크 관리</Badge>
                  </div>
                </div>
                <BrandHeading as="h3" size="md" color="navy">
                  리스크 컨설팅
                </BrandHeading>
                <BrandSpacer size="sm" />
                <BrandText color="muted" size="sm">
                  체계적인 리스크 분석과 헤지 전략을 통해 
                  안전한 자산 보호를 실현합니다.
                </BrandText>
                <BrandSpacer size="md" />
                <div className="flex items-center justify-between text-sm mb-3">
                  <span>리스크 등급</span>
                  <span className="font-semibold text-navy-primary">AAA</span>
                </div>
                <Button variant="outline" className="w-full">
                  상담 신청
                </Button>
              </BrandCard>
            </BrandGrid>
          </BrandContainer>
        </BrandSection>

        {/* 금융 대시보드 예시 */}
        <BrandSpacer size="xl" />
        <BrandSection background="muted" spacing="lg">
          <BrandContainer>
            <BrandHeading as="h3" size="lg" align="center" color="brand">
              실시간 포트폴리오 대시보드
            </BrandHeading>
            <BrandSpacer size="lg" />
            
            <BrandGrid cols={4} gap="md">
              <BrandCard variant="elevated" padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-green mb-1">+12.5%</div>
                  <div className="text-sm text-muted-foreground">총 수익률</div>
                </div>
              </BrandCard>
              <BrandCard variant="elevated" padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-trust-blue mb-1">₩5.2B</div>
                  <div className="text-sm text-muted-foreground">총 자산</div>
                </div>
              </BrandCard>
              <BrandCard variant="elevated" padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-primary mb-1">1.45</div>
                  <div className="text-sm text-muted-foreground">샤프 비율</div>
                </div>
              </BrandCard>
              <BrandCard variant="elevated" padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-premium-purple mb-1">15.2%</div>
                  <div className="text-sm text-muted-foreground">변동성</div>
                </div>
              </BrandCard>
            </BrandGrid>
          </BrandContainer>
        </BrandSection>
      </div>
    </div>
  )
} 