"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Logo } from "@/components/logo"
import { useLanguage } from "@/contexts/language-context"
import CalligraphyText from "@/components/CalligraphyText"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Eye, Palette, Type, Target, Globe, Users, TrendingUp, Layers } from "lucide-react"

export default function BrandGuidelinesPage() {
  const [activeTab, setActiveTab] = useState("brand-strategy")
  const { t } = useLanguage()

  const downloadAsset = (assetName: string) => {
    // 실제 로고 파일 다운로드 로직
    let fileUrl = ''
    let fileName = ''
    
    switch (assetName) {
      case 'logo-white':
        fileUrl = '/logo/Logo & Tagline_white BG.png'
        fileName = 'ASCA_Logo_White_BG.png'
        break
      case 'logo-black':
        fileUrl = '/logo/Logo & Tagline_black BG.png'
        fileName = 'ASCA_Logo_Black_BG.png'
        break
      case 'logo-slogan-white':
        fileUrl = '/logo/Logo & Slogan_white BG.png'
        fileName = 'ASCA_Logo_Slogan_White_BG.png'
        break
      case 'logo-slogan-black':
        fileUrl = '/logo/Logo & Slogan_black BG.png'
        fileName = 'ASCA_Logo_Slogan_Black_BG.png'
        break
      case 'logo-color':
      case 'logo-png':
        fileUrl = '/logo/Logo & Tagline_white BG.png'
        fileName = 'ASCA_Logo_Primary.png'
        break
      case 'logo-svg':
        // SVG 파일이 없으므로 PNG로 대체
        fileUrl = '/logo/Logo & Tagline_white BG.png'
        fileName = 'ASCA_Logo_Primary.png'
        break
      default:
        console.log(`Downloading ${assetName}`)
        return
    }
    
    // 파일 다운로드 실행
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="brand-guidelines">
      <Header />
      
      {/* Enhanced Hero Section */}
      <header className="guidelines-header">
        <div className="hero-content">
          <Badge variant="outline" className="mb-4 bg-celadon/10 text-celadon border-celadon/30">
            Brand Guidelines v2.0
          </Badge>
          <h1>BRAND GUIDELINES</h1>
          <p className="hero-subtitle">The Asian Society of Calligraphic Arts (ASCA)</p>
          <span className="tagline">
            &quot;<CalligraphyText>正法</CalligraphyText>의 계승 발전과 <CalligraphyText>創新</CalligraphyText>의 조화로운 구현&quot;
          </span>
          
          {/* Quick Actions */}
          <div className="hero-actions">
            <Button onClick={() => downloadAsset('brand-kit')} className="bg-celadon hover:bg-celadon/90">
              <Download className="w-4 h-4 mr-2" />
              브랜드 키트 다운로드
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("logo-identity")}>
              <Eye className="w-4 h-4 mr-2" />
              로고 미리보기
            </Button>
          </div>
        </div>
        
        {/* Enhanced Navigation */}
        <nav className="guidelines-nav-centered">
          <div className="nav-menu-centered">
            <a 
              href="#brand-strategy" 
              className={`nav-link ${activeTab === "brand-strategy" ? "active" : ""}`}
              onClick={() => setActiveTab("brand-strategy")}
            >
              <Target className="w-4 h-4" />
              브랜드 전략
            </a>
            <a 
              href="#brand-identity" 
              className={`nav-link ${activeTab === "brand-identity" ? "active" : ""}`}
              onClick={() => setActiveTab("brand-identity")}
            >
              <Users className="w-4 h-4" />
              {t("brandIdentity")}
            </a>
            <a 
              href="#logo-identity" 
              className={`nav-link ${activeTab === "logo-identity" ? "active" : ""}`}
              onClick={() => setActiveTab("logo-identity")}
            >
              <Eye className="w-4 h-4" />
              {t("logoIdentity")}
            </a>
            <a 
              href="#color-palette" 
              className={`nav-link ${activeTab === "color-palette" ? "active" : ""}`}
              onClick={() => setActiveTab("color-palette")}
            >
              <Palette className="w-4 h-4" />
              {t("colorPalette")}
            </a>
            <a 
              href="#typography" 
              className={`nav-link ${activeTab === "typography" ? "active" : ""}`}
              onClick={() => setActiveTab("typography")}
            >
              <Type className="w-4 h-4" />
              타이포그래피
            </a>
            <a 
              href="#brand-voice" 
              className={`nav-link ${activeTab === "brand-voice" ? "active" : ""}`}
              onClick={() => setActiveTab("brand-voice")}
            >
              <Globe className="w-4 h-4" />
              브랜드 보이스
            </a>
            <a 
              href="#applications" 
              className={`nav-link ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              <TrendingUp className="w-4 h-4" />
              적용 사례
            </a>
            <a 
              href="#ui-components" 
              className={`nav-link ${activeTab === "ui-components" ? "active" : ""}`}
              onClick={() => setActiveTab("ui-components")}
            >
              <Layers className="w-4 h-4" />
              UI 컴포넌트
            </a>
          </div>
        </nav>
      </header>

      <main className="guidelines-container">
        {/* Brand Strategy Section - NEW */}
        {activeTab === "brand-strategy" && (
          <section className="guidelines-section visible" id="brand-strategy">
            <h2 className="section-title">브랜드 전략 & 포지셔닝</h2>
            <p className="section-description">
              동양서예협회의 브랜드 전략은 전통과 혁신의 균형을 통해 글로벌 서예 문화의 리더십을 확립하는 것입니다.
            </p>

            <div className="strategy-grid">
              <Card className="strategy-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-celadon" />
                    브랜드 미션
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium mb-3">
                    "동양 서예의 정통성을 계승하며 현대적 창신을 통해 세계와 소통하는 문화 예술 플랫폼"
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 전통 서예 기법과 정신의 보존 및 전승</li>
                    <li>• 현대적 해석을 통한 서예 예술의 확장</li>
                    <li>• 국제적 문화 교류와 예술적 소통 촉진</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="strategy-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-celadon" />
                    브랜드 비전
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium mb-3">
                    "2030년까지 아시아 최고의 서예 문화 기관으로 성장하여 글로벌 예술 생태계를 선도"
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 연간 100만 명 이상의 글로벌 관람객 유치</li>
                    <li>• 50개국 이상의 국제 파트너십 구축</li>
                    <li>• 디지털 플랫폼을 통한 온라인 교육 확산</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="strategy-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-celadon" />
                    핵심 가치
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-celadon mb-2">正法 (정법)</h4>
                      <p className="text-sm">전통의 올바른 계승</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-celadon mb-2">創新 (창신)</h4>
                      <p className="text-sm">혁신적 예술 창조</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-celadon mb-2">調和 (조화)</h4>
                      <p className="text-sm">균형잡힌 융합</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-celadon mb-2">共鳴 (공명)</h4>
                      <p className="text-sm">세계와의 소통</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="strategy-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-celadon" />
                    타겟 오디언스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="audience-segment">
                      <Badge variant="secondary" className="mb-2">Primary</Badge>
                      <h4 className="font-semibold">서예 애호가 & 전문가</h4>
                      <p className="text-sm text-muted-foreground">25-65세, 고학력, 문화예술 관심층</p>
                    </div>
                    <div className="audience-segment">
                      <Badge variant="outline" className="mb-2">Secondary</Badge>
                      <h4 className="font-semibold">교육기관 & 학습자</h4>
                      <p className="text-sm text-muted-foreground">학교, 문화센터, 평생교육 참여자</p>
                    </div>
                    <div className="audience-segment">
                      <Badge variant="outline" className="mb-2">Tertiary</Badge>
                      <h4 className="font-semibold">글로벌 문화 관광객</h4>
                      <p className="text-sm text-muted-foreground">동양 문화에 관심있는 해외 방문객</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <div className="competitive-analysis">
              <h3 className="section-subtitle">경쟁 우위 요소</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="advantage-item">
                  <h4 className="font-semibold text-celadon mb-2">전통성의 권위</h4>
                  <p className="text-sm">수천 년 역사를 가진 동양 서예의 정통 계승자로서의 신뢰성</p>
                </div>
                <div className="advantage-item">
                  <h4 className="font-semibold text-celadon mb-2">혁신적 접근</h4>
                  <p className="text-sm">디지털 기술과 현대 예술의 융합을 통한 차별화된 경험</p>
                </div>
                <div className="advantage-item">
                  <h4 className="font-semibold text-celadon mb-2">글로벌 네트워크</h4>
                  <p className="text-sm">아시아 전역의 서예 기관과의 협력을 통한 국제적 영향력</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Brand Identity Section */}
        {activeTab === "brand-identity" && (
          <section className="guidelines-section visible" id="brand-identity">
            <h2 className="section-title">{t("brandIdentity")}</h2>
            <p className="section-description">
              동양서예협회의 브랜드 아이덴티티는 正法의 계승과 創新의 조화라는 핵심 철학을 담고 있습니다. 
              수천 년 동양 서예의 정통 법맥을 계승하면서도 창신적 접근을 통해 현대 사회에서 서예의 아름다움과 깊이를 전달합니다.
            </p>
            
            <div className="brand-personality">
              <h3 className="section-subtitle">브랜드 퍼스낼리티</h3>
              <div className="personality-grid">
                <Card className="personality-card">
                  <CardContent className="pt-6">
                    <div className="personality-icon">🎨</div>
                    <h4>예술적 (Artistic)</h4>
                    <p>창조적이고 미적 감각이 뛰어난</p>
                  </CardContent>
                </Card>
                <Card className="personality-card">
                  <CardContent className="pt-6">
                    <div className="personality-icon">🏛️</div>
                    <h4>권위적 (Authoritative)</h4>
                    <p>전통과 전문성에 기반한 신뢰성</p>
                  </CardContent>
                </Card>
                <Card className="personality-card">
                  <CardContent className="pt-6">
                    <div className="personality-icon">🌏</div>
                    <h4>포용적 (Inclusive)</h4>
                    <p>다양한 문화와 세대를 아우르는</p>
                  </CardContent>
                </Card>
                <Card className="personality-card">
                  <CardContent className="pt-6">
                    <div className="personality-icon">🚀</div>
                    <h4>혁신적 (Innovative)</h4>
                    <p>전통을 현대적으로 재해석하는</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="identity-grid">
              <div className="identity-item">
                <h3>正法의 계승 발전</h3>
                <p>동양 예술의 오랜 정신과 가치를 계승하며, 한·중·일 서예의 풍부한 문화적 유산을 존중합니다. 과거의 지혜를 오늘에 되살립니다.</p>
                <Badge variant="outline" className="mt-2">전통성</Badge>
              </div>
              <div className="identity-item">
                <h3>創新의 조화로운 구현</h3>
                <p>전통 서예의 현대적 재해석과 실험적 시도를 통해 새로운 예술 언어를 창조합니다. 경계를 넘어선 표현에 도전합니다.</p>
                <Badge variant="outline" className="mt-2">혁신성</Badge>
              </div>
              <div className="identity-item">
                <h3>조화와 균형</h3>
                <p>正法과 創新, 동양과 서양, 정신과 기술의 균형 있는 융합을 추구합니다. 대립이 아닌 조화 속에서 새로운 가치를 발견합니다.</p>
                <Badge variant="outline" className="mt-2">균형성</Badge>
              </div>
              <div className="identity-item">
                <h3>예술적 탁월함</h3>
                <p>세심한 붓놀림부터 작품의 구성까지, 모든 단계에서 최고의 예술적 완성도와 전문성을 추구합니다. 타협 없는 품질을 약속합니다.</p>
                <Badge variant="outline" className="mt-2">전문성</Badge>
              </div>
              <div className="identity-item">
                <h3>문화적 유산</h3>
                <p>동아시아 서예와 문화예술을 보존하고 계승하며 미래 세대를 위한 문화적 다리를 놓습니다. 형태뿐 아니라 정신까지 전합니다.</p>
                <Badge variant="outline" className="mt-2">지속성</Badge>
              </div>
              <div className="identity-item">
                <h3>글로벌 비전</h3>
                <p>국경과 언어를 초월하여 세계와 소통하는 열린 예술 정신을 지향합니다. 동양 서예의 정수를 전 세계에 알립니다.</p>
                <Badge variant="outline" className="mt-2">국제성</Badge>
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Logo Identity Section */}
        {activeTab === "logo-identity" && (
          <section className="guidelines-section visible" id="logo-identity">
            <h2 className="section-title">{t("logoIdentity")}</h2>
            <p className="section-description">
              동양서예협회의 로고는 철학, 역사, 미학이 어우러진 시각적 정체성입니다. 
              매 획에는 의미가 담겨 있으며, 서예의 본질적 아름다움을 현대적으로 해석했습니다.
            </p>

            {/* Logo Display with Download Options */}
            <div className="logo-showcase">
              <div className="logo-container">
                <Logo width={400} height={120} className="max-w-full h-auto" />
                <div className="logo-actions">
                  <Button size="sm" onClick={() => downloadAsset('logo-svg')}>
                    <Download className="w-4 h-4 mr-2" />
                    SVG 다운로드
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsset('logo-png')}>
                    <Download className="w-4 h-4 mr-2" />
                    PNG 다운로드
                  </Button>
                </div>
              </div>
            </div>

            {/* Logo Variations */}
            <div className="logo-variations">
              <h3 className="section-subtitle">로고 변형</h3>
              <div className="variations-grid">
                <Card className="variation-card">
                  <CardHeader>
                    <CardTitle className="text-sm">기본 로고 (컬러)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="variation-preview bg-white p-4 rounded border">
                      <Logo width={200} height={60} />
                    </div>
                    <Button size="sm" className="w-full mt-2" onClick={() => downloadAsset('logo-color')}>
                      다운로드
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="variation-card">
                  <CardHeader>
                    <CardTitle className="text-sm">단색 로고 (검정)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="variation-preview bg-white p-4 rounded border">
                      <Logo width={200} height={60} />
                    </div>
                    <Button size="sm" className="w-full mt-2" onClick={() => downloadAsset('logo-black')}>
                      다운로드
                    </Button>
                  </CardContent>
                </Card>

                <Card className="variation-card">
                  <CardHeader>
                    <CardTitle className="text-sm">단색 로고 (흰색)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="variation-preview bg-gray-900 p-4 rounded border">
                      <Logo width={200} height={60} />
                    </div>
                    <Button size="sm" className="w-full mt-2" onClick={() => downloadAsset('logo-white')}>
                      다운로드
                    </Button>
                  </CardContent>
                </Card>

                <Card className="variation-card">
                  <CardHeader>
                    <CardTitle className="text-sm">슬로건 로고 (흰색 배경)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="variation-preview bg-white p-4 rounded border">
                      <img 
                        src="/logo/Logo & Slogan_white BG.png" 
                        alt="ASCA Logo with Slogan" 
                        width={200} 
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <Button size="sm" className="w-full mt-2" onClick={() => downloadAsset('logo-slogan-white')}>
                      다운로드
                    </Button>
                  </CardContent>
                </Card>

                <Card className="variation-card">
                  <CardHeader>
                    <CardTitle className="text-sm">슬로건 로고 (검정 배경)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="variation-preview bg-gray-900 p-4 rounded border">
                      <img 
                        src="/logo/Logo & Slogan_black BG.png" 
                        alt="ASCA Logo with Slogan" 
                        width={200} 
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <Button size="sm" className="w-full mt-2" onClick={() => downloadAsset('logo-slogan-black')}>
                      다운로드
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="logo-section">
              <h3 className="section-subtitle">로고 주요 요소</h3>
              <div className="logo-usage-item">
                <ul className="usage-list">
                  <li><strong>자연스러운 붓 획:</strong> 서예가의 붓놀림이 느껴지는 브러시 스트로크 캘리그래피로 전통적 서예의 정수를 표현</li>
                  <li><strong>여백의 미:</strong> 동양 예술의 핵심 철학인 '여백'을 로고에 적용하여 숨쉬는 공간감 창출</li>
                  <li><strong>대칭적 균형:</strong> 상하 대칭의 잎사귀 모티프로 자연과 조화, 성장의 상징성 부여</li>
                  <li><strong>서체의 대비:</strong> 캘리그래피와 현대적 산세리프 서체의 조합으로 正法과 創新의 공존 표현</li>
                </ul>
              </div>
            </div>

            {/* Clear Space Guidelines */}
            <div className="logo-section">
              <h3 className="section-subtitle">여백 가이드라인</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="clearspace-demo">
                    <div className="clearspace-grid">
                      <div className="clearspace-item">
                        <div className="clearspace-visual">
                          <div className="logo-placeholder"></div>
                          <div className="clearspace-lines"></div>
                        </div>
                        <p className="text-sm mt-2">최소 여백: 로고 높이의 1/2</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Size Guidelines */}
            <div className="logo-section">
              <h3 className="section-subtitle">크기 가이드라인</h3>
              <div className="size-guidelines">
                <Card>
                  <CardContent className="pt-6">
                    <div className="size-examples">
                      <div className="size-item">
                        <h4>최소 크기</h4>
                        <p>인쇄물: 20mm (높이)</p>
                        <p>디지털: 60px (높이)</p>
                      </div>
                      <div className="size-item">
                        <h4>권장 크기</h4>
                        <p>명함: 25-30mm</p>
                        <p>레터헤드: 40-50mm</p>
                        <p>웹사이트: 80-120px</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="logo-guidelines">
              <div className="guidelines-item">
                <h3>로고 사용 권장사항 (Do's)</h3>
                <ul className="usage-list">
                  <li>원본 비율을 항상 정확히 유지하기</li>
                  <li>지정된 브랜드 컬러만 사용하기</li>
                  <li>모든 방향에서 충분한 여백 확보하기</li>
                  <li>배경과 최적의 대비를 이루는 버전 선택하기</li>
                  <li>고해상도 원본 파일 형식(SVG, AI) 활용하기</li>
                  <li>매체별 권장 최소 크기 준수하기</li>
                </ul>
              </div>
              <div className="guidelines-item">
                <h3>로고 사용 금지사항 (Don'ts)</h3>
                <ul className="usage-list">
                  <li>로고 비율 왜곡하거나 임의로 변경하지 않기</li>
                  <li>지정되지 않은 컬러나 그라데이션 적용하지 않기</li>
                  <li>복잡한 이미지나 패턴 위에 직접 배치하지 않기</li>
                  <li>로고 회전하거나 기울이지 않기</li>
                  <li>그림자, 윤곽선, 광택 등의 효과 추가하지 않기</li>
                  <li>로고 구성 요소의 위치나 크기 임의 변경하지 않기</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Color Palette Section */}
        {activeTab === "color-palette" && (
          <section className="guidelines-section visible" id="color-palette">
            <h2 className="section-title">{t("colorPalette")}</h2>
            <p className="section-description">
              동양서예협회의 컬러 팔레트는 동아시아 예술의 전통적 재료와 자연에서 영감을 받았습니다. 
              깊은 먹색부터 종이의 따스함까지, 각 색상은 서예의 역사와 정신을 담고 있습니다.
            </p>
            
            <h3 className="section-subtitle">주요 컬러</h3>
            <div className="color-palette">
              <div className="color-swatch ink-black">
                <div className="color-header">
                  <span className="color-name">Traditional Ink Black</span>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('#1a1a1a')}>
                    복사
                  </Button>
                </div>
                <div className="color-code">#1a1a1a</div>
                <div className="color-values">
                  <span>RGB: 26, 26, 26</span>
                  <span>HSL: 0°, 0%, 10%</span>
                </div>
                <div className="color-info">먹의 깊이와 전통의 권위를 상징하는 주요 배경색</div>
              </div>
              
              <div className="color-swatch rice-paper">
                <div className="color-header">
                  <span className="color-name">Rice Paper White</span>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('#f5f5f0')}>
                    복사
                  </Button>
                </div>
                <div className="color-code">#f5f5f0</div>
                <div className="color-values">
                  <span>RGB: 245, 245, 240</span>
                  <span>HSL: 60°, 30%, 96%</span>
                </div>
                <div className="color-info">한지의 따스한 질감과 순수함을 담은 기본 폰트 색상</div>
              </div>
              
              <div className="color-swatch celadon">
                <div className="color-header">
                  <span className="color-name">Celadon Green</span>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('#88A891')}>
                    복사
                  </Button>
                </div>
                <div className="color-code">#88A891</div>
                <div className="color-values">
                  <span>RGB: 136, 168, 145</span>
                  <span>HSL: 142°, 14%, 60%</span>
                </div>
                <div className="color-info">동아시아 청자의 고요함과 지혜를 표현하는 포인트 컬러</div>
              </div>
              
              <div className="color-swatch terra-red">
                <div className="color-header">
                  <span className="color-name">Terra Red</span>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('#9B4444')}>
                    복사
                  </Button>
                </div>
                <div className="color-code">#9B4444</div>
                <div className="color-values">
                  <span>RGB: 155, 68, 68</span>
                  <span>HSL: 0°, 39%, 44%</span>
                </div>
                <div className="color-info">전통 도장의 주홍색에서 영감받은 강조색</div>
              </div>
              
              <div className="color-swatch stone-gray">
                <div className="color-header">
                  <span className="color-name">Stone Gray</span>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('#707070')}>
                    복사
                  </Button>
                </div>
                <div className="color-code">#707070</div>
                <div className="color-values">
                  <span>RGB: 112, 112, 112</span>
                  <span>HSL: 0°, 0%, 44%</span>
                </div>
                <div className="color-info">동양 문인석의 고전적 품격을 담은 중성색</div>
              </div>
              
              <div className="color-swatch sage-green">
                <div className="color-header">
                  <span className="color-name">Sage Green</span>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('#B7C4B7')}>
                    복사
                  </Button>
                </div>
                <div className="color-code">#B7C4B7</div>
                <div className="color-values">
                  <span>RGB: 183, 196, 183</span>
                  <span>HSL: 120°, 11%, 74%</span>
                </div>
                <div className="color-info">문인화의 절제된 초록빛을 현대적으로 재해석</div>
              </div>
            </div>

            {/* Color Accessibility */}
            <div className="accessibility-section">
              <h3 className="section-subtitle">접근성 가이드라인</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="accessibility-grid">
                    <div className="contrast-item">
                      <h4>WCAG AA 준수</h4>
                      <p>모든 텍스트-배경 조합이 4.5:1 이상의 대비율 유지</p>
                      <Badge variant="outline" className="mt-2">AA 인증</Badge>
                    </div>
                    <div className="contrast-item">
                      <h4>색맹 친화적</h4>
                      <p>색상에만 의존하지 않는 정보 전달 방식 채택</p>
                      <Badge variant="outline" className="mt-2">색맹 대응</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="usage-container">
              <div className="usage-title">컬러 사용 가이드라인</div>
              <div className="usage-grid">
                <div className="usage-item">
                  <h3>주요 컬러 활용</h3>
                  <ul className="usage-list">
                    <li><strong>Traditional Ink Black:</strong> 기본 배경, 밝은 텍스트, 여백 강조에 활용</li>
                    <li><strong>Rice Paper White:</strong> 로고, 주요 헤딩, 중요 텍스트에 사용</li>
                    <li><strong>Celadon Green:</strong> 액센트, 버튼, 하이라이트, 포인트 요소에 적용</li>
                    <li><strong>Terra Red:</strong> 경고, 중요 알림, 특별한 강조가 필요한 요소에 사용</li>
                  </ul>
                </div>
                <div className="usage-item">
                  <h3>컬러 조합 원칙</h3>
                  <ul className="usage-list">
                    <li><strong>대비와 가독성:</strong> 텍스트와 배경 간 충분한 대비로 WCAG 2.1 AA 기준 준수</li>
                    <li><strong>조화로운 조합:</strong> 최대 3개의 주요 컬러를 한 화면에서 조화롭게 사용</li>
                    <li><strong>의미적 일관성:</strong> 동일한 기능과 상태는 항상 같은 색상으로 표현</li>
                    <li><strong>문화적 맥락:</strong> 동아시아 예술의 색채 미학을 고려한 색상 활용</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Typography Section */}
        {activeTab === "typography" && (
          <section className="guidelines-section visible" id="typography">
            <h2 className="section-title">타이포그래피 시스템</h2>
            <p className="section-description">
              동양서예협회의 타이포그래피 시스템은 서예의 전통적 아름다움과 현대적 가독성을 조화시킨 다국어 지원 폰트 체계입니다. 
              한국어, 중국어, 일본어, 영어 모든 언어에서 일관된 브랜드 경험을 제공합니다.
            </p>

            {/* Font Hierarchy */}
            <div className="typography-hierarchy">
              <h3 className="section-subtitle">타이포그래피 계층</h3>
              <div className="hierarchy-grid">
                <Card className="hierarchy-item">
                  <CardContent className="pt-6">
                    <div className="font-sample font-calligraphy" style={{fontSize: '48px', lineHeight: '1.2'}}>
                      書藝
                    </div>
                    <div className="font-details">
                      <h4>Display / H1</h4>
                      <p>48-64px • font-calligraphy</p>
                      <p>메인 제목, 히어로 텍스트</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hierarchy-item">
                  <CardContent className="pt-6">
                    <div className="font-sample font-traditional" style={{fontSize: '32px', lineHeight: '1.3'}}>
                      동양서예협회
                    </div>
                    <div className="font-details">
                      <h4>Heading / H2</h4>
                      <p>32-40px • font-traditional</p>
                      <p>섹션 제목, 페이지 제목</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hierarchy-item">
                  <CardContent className="pt-6">
                    <div className="font-sample font-traditional" style={{fontSize: '24px', lineHeight: '1.4'}}>
                      브랜드 가이드라인
                    </div>
                    <div className="font-details">
                      <h4>Subheading / H3</h4>
                      <p>24-28px • font-traditional</p>
                      <p>서브 제목, 카테고리</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hierarchy-item">
                  <CardContent className="pt-6">
                    <div className="font-sample font-traditional" style={{fontSize: '18px', lineHeight: '1.6'}}>
                      전통과 현대의 조화로운 만남을 통해 서예의 새로운 가능성을 탐구합니다.
                    </div>
                    <div className="font-details">
                      <h4>Body Text</h4>
                      <p>16-18px • font-traditional</p>
                      <p>본문, 설명문</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hierarchy-item">
                  <CardContent className="pt-6">
                    <div className="font-sample font-modern" style={{fontSize: '14px', lineHeight: '1.5'}}>
                      Navigation • Button • UI Elements
                    </div>
                    <div className="font-details">
                      <h4>UI Text</h4>
                      <p>14-16px • font-modern</p>
                      <p>버튼, 네비게이션, UI</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hierarchy-item">
                  <CardContent className="pt-6">
                    <div className="font-sample font-modern" style={{fontSize: '12px', lineHeight: '1.4', color: 'var(--muted-foreground)'}}>
                      Caption • Metadata • Fine Print
                    </div>
                    <div className="font-details">
                      <h4>Caption</h4>
                      <p>12-14px • font-modern</p>
                      <p>캡션, 메타데이터</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="logo-section">
              <h3 className="section-subtitle">주요 폰트 패밀리</h3>
              <div className="logo-guidelines">
                <div className="guidelines-item">
                  <h3>Noto Serif CJK (주요 폰트)</h3>
                  <div className="font-sample font-traditional text-multilingual" style={{fontSize: '24px', marginBottom: '12px'}}>
                    동양서예협회 | 東洋書藝協會 | Oriental Calligraphy
                  </div>
                  <ul className="usage-list">
                    <li><strong>용도:</strong> 본문, 설명문, 작품 소개</li>
                    <li><strong>특징:</strong> Google/Adobe 공동 개발, 완벽한 CJK 지원</li>
                    <li><strong>장점:</strong> 서예의 전통적 느낌과 현대적 가독성 균형</li>
                    <li><strong>지원 언어:</strong> 한국어, 중국어(간체/번체), 일본어, 영어</li>
                  </ul>
                </div>
                <div className="guidelines-item">
                  <h3>Inter (보조 폰트)</h3>
                  <div className="font-sample font-modern text-multilingual" style={{fontSize: '24px', marginBottom: '12px'}}>
                    Modern Typography for Digital Interface
                  </div>
                  <ul className="usage-list">
                    <li><strong>용도:</strong> UI 요소, 버튼, 네비게이션</li>
                    <li><strong>특징:</strong> 디지털 최적화, 뛰어난 가독성</li>
                    <li><strong>장점:</strong> 다양한 굵기, 웹폰트 최적화</li>
                    <li><strong>지원 언어:</strong> 라틴 문자, 확장 라틴</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Font Pairing Examples */}
            <div className="font-pairing">
              <h3 className="section-subtitle">폰트 조합 예시</h3>
              <div className="pairing-examples">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">✓ 권장하는 톤</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li>
                        <strong>존중하는:</strong> "서예의 오랜 전통을 계승하며..."
                        <p className="text-sm text-muted-foreground">전통과 선배 예술가들에 대한 존경 표현</p>
                      </li>
                      <li>
                        <strong>영감을 주는:</strong> "새로운 가능성을 탐구해보세요"
                        <p className="text-sm text-muted-foreground">긍정적이고 동기부여가 되는 메시지</p>
                      </li>
                      <li>
                        <strong>포용적인:</strong> "모든 수준의 학습자를 환영합니다"
                        <p className="text-sm text-muted-foreground">다양성과 포용성을 강조하는 표현</p>
                      </li>
                      <li>
                        <strong>전문적인:</strong> "정확한 붓놀림과 균형잡힌 구성"
                        <p className="text-sm text-muted-foreground">전문 지식을 바탕으로 한 구체적 설명</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">✗ 피해야 할 톤</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li>
                        <strong>배타적인:</strong> "진정한 서예는..." (X)
                        <p className="text-sm text-muted-foreground">특정 방식만을 옳다고 주장하는 표현</p>
                      </li>
                      <li>
                        <strong>과도하게 캐주얼한:</strong> "완전 대박!" (X)
                        <p className="text-sm text-muted-foreground">브랜드의 품격에 맞지 않는 표현</p>
                      </li>
                      <li>
                        <strong>복잡하고 어려운:</strong> 전문용어 남발 (X)
                        <p className="text-sm text-muted-foreground">일반인이 이해하기 어려운 표현</p>
                      </li>
                      <li>
                        <strong>부정적인:</strong> "잘못된 방법", "실패" (X)
                        <p className="text-sm text-muted-foreground">비판적이거나 부정적인 표현</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="logo-section">
              <h3 className="section-subtitle">다국어 최적화</h3>
              <div className="logo-guidelines">
                <div className="guidelines-item">
                  <h3>언어별 특화 클래스</h3>
                  <div style={{marginBottom: '16px'}}>
                    <div className="font-sample text-korean" style={{fontSize: '20px', marginBottom: '8px'}}>
                      한국어: 正法의 계승과 創新의 조화
                    </div>
                    <div className="font-sample text-chinese" style={{fontSize: '20px', marginBottom: '8px'}}>
                      中文：传统与现代的和谐
                    </div>
                    <div className="font-sample text-japanese" style={{fontSize: '20px', marginBottom: '8px'}}>
                      日本語：伝統と現代の調和
                    </div>
                  </div>
                  <ul className="usage-list">
                    <li><strong>.text-korean:</strong> 한국어 텍스트 최적화 (line-height: 1.7)</li>
                    <li><strong>.text-chinese:</strong> 중국어 텍스트 최적화 (line-height: 1.8)</li>
                    <li><strong>.text-japanese:</strong> 일본어 텍스트 최적화 (line-height: 1.8)</li>
                    <li><strong>.text-multilingual:</strong> 다국어 렌더링 최적화</li>
                  </ul>
                </div>
                <div className="guidelines-item">
                  <h3>폰트 렌더링 최적화</h3>
                  <ul className="usage-list">
                    <li><strong>font-display: swap:</strong> 폰트 로딩 최적화</li>
                    <li><strong>-webkit-font-smoothing:</strong> 안티앨리어싱 적용</li>
                    <li><strong>font-feature-settings:</strong> 커닝, 리가처 활성화</li>
                    <li><strong>text-rendering:</strong> 가독성 최적화</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="usage-container">
              <div className="usage-title">타이포그래피 사용 가이드라인</div>
              <div className="usage-grid">
                <div className="usage-item">
                  <h3>계층 구조</h3>
                  <ul className="usage-list">
                    <li><strong>H1 (메인 제목):</strong> font-calligraphy, 32-48px</li>
                    <li><strong>H2 (섹션 제목):</strong> font-traditional, 24-32px</li>
                    <li><strong>H3 (서브 제목):</strong> font-traditional, 20-24px</li>
                    <li><strong>본문:</strong> font-traditional, 16-18px</li>
                    <li><strong>UI 텍스트:</strong> font-modern, 14-16px</li>
                    <li><strong>캡션:</strong> font-modern, 12-14px</li>
                  </ul>
                </div>
                <div className="usage-item">
                  <h3>사용 원칙</h3>
                  <ul className="usage-list">
                    <li><strong>일관성:</strong> 동일한 요소는 항상 같은 폰트 사용</li>
                    <li><strong>대비:</strong> 제목과 본문의 명확한 구분</li>
                    <li><strong>가독성:</strong> 충분한 행간과 자간 확보</li>
                    <li><strong>접근성:</strong> 최소 16px 이상 폰트 크기 권장</li>
                    <li><strong>성능:</strong> 필요한 폰트만 로드하여 최적화</li>
                  </ul>
                </div>
                <div className="usage-item">
                  <h3>금지사항</h3>
                  <ul className="usage-list">
                    <li>지정되지 않은 폰트 임의 사용 금지</li>
                    <li>과도한 폰트 굵기 변경 금지</li>
                    <li>극단적인 자간, 행간 조정 금지</li>
                    <li>언어별 최적화 클래스 무시 금지</li>
                    <li>모바일에서 16px 미만 폰트 사용 금지</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Brand Voice Section - NEW */}
        {activeTab === "brand-voice" && (
          <section className="guidelines-section visible" id="brand-voice">
            <h2 className="section-title">브랜드 보이스 & 톤</h2>
            <p className="section-description">
              동양서예협회의 브랜드 보이스는 전통의 권위와 현대적 접근성을 균형있게 표현합니다. 
              깊이 있는 전문성과 따뜻한 포용성을 동시에 전달하는 커뮤니케이션 가이드라인입니다.
            </p>

            <div className="voice-characteristics">
              <h3 className="section-subtitle">브랜드 보이스 특성</h3>
              <div className="voice-grid">
                <Card className="voice-card">
                  <CardContent className="pt-6">
                    <h4 className="text-celadon mb-3">권위적이면서도 접근 가능한</h4>
                    <div className="voice-spectrum">
                      <div className="spectrum-bar">
                        <div className="spectrum-fill" style={{width: '75%'}}></div>
                      </div>
                      <div className="spectrum-labels">
                        <span>권위적</span>
                        <span>접근 가능한</span>
                      </div>
                    </div>
                    <p className="text-sm mt-2">전문성을 바탕으로 한 신뢰성을 유지하면서도 누구나 이해할 수 있는 언어 사용</p>
                  </CardContent>
                </Card>

                <Card className="voice-card">
                  <CardContent className="pt-6">
                    <h4 className="text-celadon mb-3">전통적이면서도 혁신적인</h4>
                    <div className="voice-spectrum">
                      <div className="spectrum-bar">
                        <div className="spectrum-fill" style={{width: '60%'}}></div>
                      </div>
                      <div className="spectrum-labels">
                        <span>전통적</span>
                        <span>혁신적</span>
                      </div>
                    </div>
                    <p className="text-sm mt-2">고전적 가치를 존중하면서도 새로운 시각과 아이디어를 적극적으로 수용</p>
                  </CardContent>
                </Card>

                <Card className="voice-card">
                  <CardContent className="pt-6">
                    <h4 className="text-celadon mb-3">진지하면서도 따뜻한</h4>
                    <div className="voice-spectrum">
                      <div className="spectrum-bar">
                        <div className="spectrum-fill" style={{width: '70%'}}></div>
                      </div>
                      <div className="spectrum-labels">
                        <span>진지한</span>
                        <span>따뜻한</span>
                      </div>
                    </div>
                    <p className="text-sm mt-2">예술의 깊이와 진정성을 유지하면서도 인간적인 온기와 공감을 표현</p>
                  </CardContent>
                </Card>

                <Card className="voice-card">
                  <CardContent className="pt-6">
                    <h4 className="text-celadon mb-3">글로벌하면서도 로컬한</h4>
                    <div className="voice-spectrum">
                      <div className="spectrum-bar">
                        <div className="spectrum-fill" style={{width: '65%'}}></div>
                      </div>
                      <div className="spectrum-labels">
                        <span>글로벌</span>
                        <span>로컬</span>
                      </div>
                    </div>
                    <p className="text-sm mt-2">국제적 시각과 보편적 가치를 추구하면서도 동아시아 문화의 특수성 존중</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="tone-guidelines">
              <h3 className="section-subtitle">톤 가이드라인</h3>
              <div className="tone-examples">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">✓ 권장하는 톤</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li>
                        <strong>존중하는:</strong> "서예의 오랜 전통을 계승하며..."
                        <p className="text-sm text-muted-foreground">전통과 선배 예술가들에 대한 존경 표현</p>
                      </li>
                      <li>
                        <strong>영감을 주는:</strong> "새로운 가능성을 탐구해보세요"
                        <p className="text-sm text-muted-foreground">긍정적이고 동기부여가 되는 메시지</p>
                      </li>
                      <li>
                        <strong>포용적인:</strong> "모든 수준의 학습자를 환영합니다"
                        <p className="text-sm text-muted-foreground">다양성과 포용성을 강조하는 표현</p>
                      </li>
                      <li>
                        <strong>전문적인:</strong> "정확한 붓놀림과 균형잡힌 구성"
                        <p className="text-sm text-muted-foreground">전문 지식을 바탕으로 한 구체적 설명</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">✗ 피해야 할 톤</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li>
                        <strong>배타적인:</strong> "진정한 서예는..." (X)
                        <p className="text-sm text-muted-foreground">특정 방식만을 옳다고 주장하는 표현</p>
                      </li>
                      <li>
                        <strong>과도하게 캐주얼한:</strong> "완전 대박!" (X)
                        <p className="text-sm text-muted-foreground">브랜드의 품격에 맞지 않는 표현</p>
                      </li>
                      <li>
                        <strong>복잡하고 어려운:</strong> 전문용어 남발 (X)
                        <p className="text-sm text-muted-foreground">일반인이 이해하기 어려운 표현</p>
                      </li>
                      <li>
                        <strong>부정적인:</strong> "잘못된 방법", "실패" (X)
                        <p className="text-sm text-muted-foreground">비판적이거나 부정적인 표현</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="messaging-framework">
              <h3 className="section-subtitle">핵심 메시지 프레임워크</h3>
              <div className="framework-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>태그라인</CardTitle>
                    <CardDescription>브랜드의 핵심 약속</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-lg font-medium italic border-l-4 border-celadon pl-4">
                      "Where Tradition Flows Contemporary"
                    </blockquote>
                    <p className="text-sm mt-2">전통이 현대로 자연스럽게 흘러가는 모습을 표현</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>슬로건</CardTitle>
                    <CardDescription>행동 지향적 메시지</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-lg font-medium italic border-l-4 border-celadon pl-4">
                      "Artistry in Every Stroke of Life"
                    </blockquote>
                    <p className="text-sm mt-2">삶의 모든 순간에 예술성을 담자는 철학</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>엘리베이터 피치</CardTitle>
                    <CardDescription>30초 브랜드 소개</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      "동양서예협회는 수천 년 전통의 서예 예술을 현대적 감각으로 재해석하여, 
                      전 세계 사람들이 서예의 아름다움과 깊이를 경험할 수 있도록 돕는 문화 예술 기관입니다."
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="communication-channels">
              <h3 className="section-subtitle">채널별 커뮤니케이션 가이드</h3>
              <div className="channels-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>공식 문서</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• 격식있고 전문적인 어조</li>
                      <li>• 완전한 문장과 정확한 문법</li>
                      <li>• 전문 용어 사용 시 설명 병기</li>
                      <li>• 존댓말 사용</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>웹사이트</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• 친근하면서도 전문적인 톤</li>
                      <li>• 명확하고 간결한 표현</li>
                      <li>• 행동 유도 문구 적극 활용</li>
                      <li>• 다국어 고려한 표현</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>소셜 미디어</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• 따뜻하고 접근 가능한 톤</li>
                      <li>• 시각적 콘텐츠 중심</li>
                      <li>• 해시태그 적극 활용</li>
                      <li>• 커뮤니티 참여 유도</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>교육 자료</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• 명확하고 이해하기 쉬운 설명</li>
                      <li>• 단계별 구체적 가이드</li>
                      <li>• 격려와 동기부여 메시지</li>
                      <li>• 실습 중심의 표현</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Applications Section - NEW */}
        {activeTab === "applications" && (
          <section className="guidelines-section visible" id="applications">
            <h2 className="section-title">브랜드 적용 사례</h2>
            <p className="section-description">
              동양서예협회 브랜드 가이드라인의 실제 적용 사례를 통해 일관된 브랜드 경험을 구현하는 방법을 제시합니다.
            </p>

            <div className="applications-grid">
              <Card className="application-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-celadon/20 rounded flex items-center justify-center">
                      📄
                    </div>
                    인쇄물 디자인
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="application-examples">
                    <div className="example-item">
                      <h4>명함</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 로고: 25-30mm 크기</li>
                        <li>• 주색상: Rice Paper White 배경</li>
                        <li>• 폰트: Noto Serif CJK</li>
                        <li>• 여백: 최소 5mm</li>
                      </ul>
                    </div>
                    <div className="example-item">
                      <h4>레터헤드</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 로고: 상단 좌측, 40-50mm</li>
                        <li>• 태그라인: 로고 하단 배치</li>
                        <li>• 연락처: Stone Gray 색상</li>
                        <li>• 여백: A4 기준 20mm</li>
                      </ul>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4" onClick={() => downloadAsset('print-templates')}>
                    <Download className="w-4 h-4 mr-2" />
                    인쇄물 템플릿 다운로드
                  </Button>
                </CardContent>
              </Card>

              <Card className="application-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-celadon/20 rounded flex items-center justify-center">
                      💻
                    </div>
                    디지털 미디어
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="application-examples">
                    <div className="example-item">
                      <h4>웹사이트</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 헤더 로고: 80-120px</li>
                        <li>• 다크/라이트 모드 대응</li>
                        <li>• 반응형 타이포그래피</li>
                        <li>• 접근성 AA 준수</li>
                      </ul>
                    </div>
                    <div className="example-item">
                      <h4>소셜 미디어</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 프로필 이미지: 400x400px</li>
                        <li>• 커버 이미지: 1200x630px</li>
                        <li>• 브랜드 컬러 일관성</li>
                        <li>• 해시태그 가이드라인</li>
                      </ul>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4" onClick={() => downloadAsset('digital-templates')}>
                    <Download className="w-4 h-4 mr-2" />
                    디지털 템플릿 다운로드
                  </Button>
                </CardContent>
              </Card>

              <Card className="application-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-celadon/20 rounded flex items-center justify-center">
                      🏢
                    </div>
                    환경 그래픽
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="application-examples">
                    <div className="example-item">
                      <h4>사인 시스템</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 외부 간판: 최소 500mm</li>
                        <li>• 내부 안내판: 200-300mm</li>
                        <li>• 야간 조명 고려</li>
                        <li>• 다국어 표기</li>
                      </ul>
                    </div>
                    <div className="example-item">
                      <h4>전시 공간</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 작품 설명판 디자인</li>
                        <li>• 동선 안내 시스템</li>
                        <li>• 포토존 브랜딩</li>
                        <li>• 조명과 색상 조화</li>
                      </ul>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4" onClick={() => downloadAsset('signage-guide')}>
                    <Download className="w-4 h-4 mr-2" />
                    사인 가이드 다운로드
                  </Button>
                </CardContent>
              </Card>

              <Card className="application-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-celadon/20 rounded flex items-center justify-center">
                      🎁
                    </div>
                    상품 & 굿즈
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="application-examples">
                    <div className="example-item">
                      <h4>문구류</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 붓, 먹, 벼루 브랜딩</li>
                        <li>• 패키징 디자인</li>
                        <li>• 품질 인증 마크</li>
                        <li>• 사용법 안내서</li>
                      </ul>
                    </div>
                    <div className="example-item">
                      <h4>기념품</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 티셔츠, 에코백</li>
                        <li>• 도록, 엽서</li>
                        <li>• 디지털 굿즈</li>
                        <li>• 한정판 컬렉션</li>
                      </ul>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4" onClick={() => downloadAsset('merchandise-guide')}>
                    <Download className="w-4 h-4 mr-2" />
                    상품 가이드 다운로드
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <div className="brand-consistency">
              <h3 className="section-subtitle">브랜드 일관성 체크리스트</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="checklist-grid">
                    <div className="checklist-section">
                      <h4 className="font-semibold mb-3">로고 사용</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          올바른 로고 버전 사용
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          적절한 크기와 여백 확보
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          배경과의 충분한 대비
                        </li>
                      </ul>
                    </div>
                    
                    <div className="checklist-section">
                      <h4 className="font-semibold mb-3">컬러 적용</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          브랜드 컬러 팔레트 준수
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          접근성 기준 충족
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          색상 조합 원칙 적용
                        </li>
                      </ul>
                    </div>
                    
                    <div className="checklist-section">
                      <h4 className="font-semibold mb-3">타이포그래피</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          지정 폰트 패밀리 사용
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          계층 구조 준수
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          다국어 최적화 적용
                        </li>
                      </ul>
                    </div>
                    
                    <div className="checklist-section">
                      <h4 className="font-semibold mb-3">브랜드 보이스</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          브랜드 톤 일관성
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          핵심 메시지 반영
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center">✓</div>
                          채널별 가이드라인 준수
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* UI Components Section - NEW */}
        {activeTab === "ui-components" && (
          <section className="guidelines-section visible" id="ui-components">
            <h2 className="section-title">UI 컴포넌트 시스템</h2>
            <p className="section-description">
              동양서예협회의 UI 컴포넌트 시스템은 브랜드 가이드라인을 기반으로 일관된 사용자 경험을 제공합니다. 
              모든 컴포넌트는 접근성, 반응형 디자인, 그리고 브랜드 아이덴티티를 고려하여 설계되었습니다.
            </p>

            <div className="component-showcase">
              <h3 className="section-subtitle">핵심 컴포넌트</h3>
              
              {/* Button Components */}
              <Card className="component-demo">
                <CardHeader>
                  <CardTitle>Button 컴포넌트</CardTitle>
                  <CardDescription>다양한 상황에 맞는 버튼 스타일과 크기</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="component-examples">
                                         <div className="example-group">
                       <h4 className="text-sm font-semibold mb-3">기본 버튼</h4>
                       <div className="flex gap-3 flex-wrap">
                         <Button>기본 버튼</Button>
                         <Button variant="secondary">보조 버튼</Button>
                         <Button variant="outline">아웃라인</Button>
                         <Button variant="ghost">고스트</Button>
                         <Button variant="destructive">삭제</Button>
                       </div>
                     </div>
                     
                     <div className="example-group">
                       <h4 className="text-sm font-semibold mb-3">브랜드 특화 버튼</h4>
                       <div className="flex gap-3 flex-wrap">
                         <Button variant="celadon">주요 액션</Button>
                         <Button variant="sage">보조 액션</Button>
                         <Button variant="terra">경고/삭제</Button>
                         <Button variant="traditional">전통적</Button>
                         <Button variant="rice">라이트 모드</Button>
                       </div>
                     </div>
                     
                     <div className="example-group">
                       <h4 className="text-sm font-semibold mb-3">크기 변형</h4>
                       <div className="flex gap-3 items-center flex-wrap">
                         <Button size="sm" variant="celadon">작은 버튼</Button>
                         <Button size="default" variant="celadon">기본 버튼</Button>
                         <Button size="lg" variant="celadon">큰 버튼</Button>
                         <Button size="touch" variant="celadon">터치 친화적</Button>
                         <Button size="icon" variant="celadon">
                           <Download className="w-4 h-4" />
                         </Button>
                       </div>
                     </div>
                  </div>
                  
                  <div className="component-specs">
                    <h4 className="text-sm font-semibold mb-2">디자인 원칙</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 최소 44px 터치 타겟 크기 (모바일 접근성)</li>
                      <li>• Celadon Green을 주요 액션 색상으로 사용</li>
                      <li>• 명확한 시각적 계층 구조</li>
                      <li>• 일관된 패딩과 여백</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Card Components */}
              <Card className="component-demo">
                <CardHeader>
                  <CardTitle>Card 컴포넌트</CardTitle>
                  <CardDescription>콘텐츠를 구조화하는 카드 레이아웃</CardDescription>
                </CardHeader>
                <CardContent>
                                     <div className="component-examples">
                     <div className="grid md:grid-cols-2 gap-4 mb-4">
                       <Card variant="artwork" hover="lift">
                         <CardHeader>
                           <CardTitle className="text-lg">작품 카드</CardTitle>
                           <CardDescription>서예 작품 정보 표시</CardDescription>
                         </CardHeader>
                         <CardContent>
                           <p className="text-sm">작품의 상세 정보와 설명이 들어갑니다.</p>
                           <div className="flex gap-2 mt-3">
                             <Badge variant="traditional">전통</Badge>
                             <Badge variant="innovation">현대</Badge>
                           </div>
                         </CardContent>
                       </Card>
                       
                       <Card variant="traditional" hover="glow">
                         <CardHeader>
                           <CardTitle className="text-lg">작가 프로필</CardTitle>
                           <CardDescription>작가 정보 카드</CardDescription>
                         </CardHeader>
                         <CardContent>
                           <p className="text-sm">작가의 프로필과 경력이 표시됩니다.</p>
                           <div className="flex gap-2 mt-3">
                             <Badge variant="special">특별전</Badge>
                             <Badge variant="neutral">정회원</Badge>
                           </div>
                         </CardContent>
                       </Card>
                     </div>
                     
                     <div className="grid md:grid-cols-3 gap-4">
                       <Card variant="glass" hover="scale">
                         <CardHeader>
                           <CardTitle className="text-base">글래스 카드</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <p className="text-sm">투명한 글래스모피즘 효과</p>
                         </CardContent>
                       </Card>
                       
                       <Card variant="elevated">
                         <CardHeader>
                           <CardTitle className="text-base">엘리베이티드</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <p className="text-sm">강조된 그림자 효과</p>
                         </CardContent>
                       </Card>
                       
                       <Card hover="lift">
                         <CardHeader>
                           <CardTitle className="text-base">기본 카드</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <p className="text-sm">표준 카드 스타일</p>
                         </CardContent>
                       </Card>
                     </div>
                   </div>
                  
                  <div className="component-specs">
                    <h4 className="text-sm font-semibold mb-2">디자인 원칙</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 8px 기본 border-radius</li>
                      <li>• 미묘한 그림자 효과 (shadow-sm)</li>
                      <li>• 일관된 패딩 (24px)</li>
                      <li>• 호버 시 상승 효과</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Badge Components */}
              <Card className="component-demo">
                <CardHeader>
                  <CardTitle>Badge 컴포넌트</CardTitle>
                  <CardDescription>상태와 카테고리를 나타내는 배지</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="component-examples">
                    <div className="example-group">
                      <h4 className="text-sm font-semibold mb-3">기본 배지</h4>
                      <div className="flex gap-3 flex-wrap">
                        <Badge>기본</Badge>
                        <Badge variant="secondary">보조</Badge>
                        <Badge variant="outline">아웃라인</Badge>
                        <Badge variant="destructive">중요</Badge>
                      </div>
                    </div>
                    
                                         <div className="example-group">
                       <h4 className="text-sm font-semibold mb-3">브랜드 특화 배지</h4>
                       <div className="flex gap-3 flex-wrap">
                         <Badge variant="traditional">전통성</Badge>
                         <Badge variant="innovation">혁신성</Badge>
                         <Badge variant="special">특별전</Badge>
                         <Badge variant="neutral">일반</Badge>
                         <Badge variant="rice">라이트</Badge>
                         <Badge variant="ink">다크</Badge>
                       </div>
                     </div>
                  </div>
                  
                  <div className="component-specs">
                    <h4 className="text-sm font-semibold mb-2">사용 가이드라인</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 작품 카테고리 분류에 활용</li>
                      <li>• 전시 상태 표시 (진행중, 예정, 종료)</li>
                      <li>• 작가 전문 분야 표시</li>
                      <li>• 브랜드 컬러 활용한 의미 구분</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Typography Components */}
              <Card className="component-demo">
                <CardHeader>
                  <CardTitle>Typography 시스템</CardTitle>
                  <CardDescription>일관된 텍스트 스타일링</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="component-examples">
                    <div className="typography-showcase">
                      <h1 className="font-calligraphy text-3xl mb-2">서예 제목 (H1)</h1>
                      <h2 className="font-traditional text-2xl mb-2">섹션 제목 (H2)</h2>
                      <h3 className="font-traditional text-xl mb-2">서브 제목 (H3)</h3>
                      <p className="font-traditional text-base mb-2">본문 텍스트 - 작품 설명과 상세 정보</p>
                      <p className="font-modern text-sm text-muted-foreground">UI 텍스트 - 버튼, 레이블, 메타데이터</p>
                    </div>
                  </div>
                  
                  <div className="component-specs">
                    <h4 className="text-sm font-semibold mb-2">폰트 클래스</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground font-mono">
                      <li>• .font-calligraphy - 서예 제목용</li>
                      <li>• .font-traditional - 본문 및 설명</li>
                      <li>• .font-modern - UI 요소</li>
                      <li>• .text-korean/.text-chinese/.text-japanese - 언어별 최적화</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            {/* Component Guidelines */}
            <div className="component-guidelines">
              <h3 className="section-subtitle">컴포넌트 사용 원칙</h3>
              <div className="guidelines-grid">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">일관성 (Consistency)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• 동일한 기능은 항상 같은 컴포넌트 사용</li>
                      <li>• 브랜드 컬러 팔레트 준수</li>
                      <li>• 정해진 간격과 크기 시스템 활용</li>
                      <li>• 타이포그래피 계층 구조 유지</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">접근성 (Accessibility)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• WCAG 2.1 AA 기준 준수</li>
                      <li>• 키보드 네비게이션 지원</li>
                      <li>• 충분한 색상 대비 유지</li>
                      <li>• 스크린 리더 호환성</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">반응형 (Responsive)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• 모바일 우선 설계</li>
                      <li>• 터치 친화적 인터페이스</li>
                      <li>• 유연한 그리드 시스템</li>
                      <li>• 적응형 타이포그래피</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">성능 (Performance)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• 최적화된 번들 크기</li>
                      <li>• 지연 로딩 지원</li>
                      <li>• 효율적인 리렌더링</li>
                      <li>• 웹 표준 준수</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Color System for Components */}
            <div className="component-colors">
              <h3 className="section-subtitle">컴포넌트 컬러 시스템</h3>
              <div className="color-system-grid">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Primary Actions</CardTitle>
                    <CardDescription>주요 액션 버튼과 링크</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="color-demo">
                      <div className="color-sample bg-celadon text-ink-black p-3 rounded mb-2">
                        Celadon Green (#88A891)
                      </div>
                      <p className="text-sm text-muted-foreground">
                        주요 CTA 버튼, 활성 상태, 중요한 링크에 사용
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Secondary Actions</CardTitle>
                    <CardDescription>보조 액션과 중성 요소</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="color-demo">
                      <div className="color-sample bg-sage-green text-ink-black p-3 rounded mb-2">
                        Sage Green (#B7C4B7)
                      </div>
                      <p className="text-sm text-muted-foreground">
                        보조 버튼, 비활성 상태, 배경 요소에 사용
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Alert & Warning</CardTitle>
                    <CardDescription>경고와 중요 알림</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="color-demo">
                      <div className="color-sample bg-terra-red text-rice-paper p-3 rounded mb-2">
                        Terra Red (#9B4444)
                      </div>
                      <p className="text-sm text-muted-foreground">
                        삭제 버튼, 오류 메시지, 중요 경고에 사용
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

                         <Separator className="my-8" />

             {/* Component Usage Examples */}
             <div className="component-usage-examples">
               <h3 className="section-subtitle">실제 사용 예시</h3>
               <div className="usage-examples-grid">
                 <Card variant="traditional">
                   <CardHeader>
                     <CardTitle className="text-lg">작품 갤러리 카드</CardTitle>
                     <CardDescription>실제 작품 전시에서 사용되는 카드 예시</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-calligraphy text-lg">蘭亭序</h4>
                           <p className="text-sm text-muted-foreground">왕희지 작품</p>
                         </div>
                         <Badge variant="traditional">전통</Badge>
                       </div>
                       <p className="text-sm">동진 시대의 대표적인 행서 작품으로, 서예사에서 가장 중요한 작품 중 하나입니다.</p>
                       <div className="flex gap-2">
                         <Button size="sm" variant="celadon">상세보기</Button>
                         <Button size="sm" variant="outline">공유하기</Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <Card variant="artwork" hover="lift">
                   <CardHeader>
                     <CardTitle className="text-lg">작가 프로필</CardTitle>
                     <CardDescription>작가 소개 페이지에서 사용되는 카드</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-traditional text-lg">김서예</h4>
                           <p className="text-sm text-muted-foreground">한국서예협회 이사</p>
                         </div>
                         <div className="flex gap-1">
                           <Badge variant="special">특별전</Badge>
                           <Badge variant="innovation">현대</Badge>
                         </div>
                       </div>
                       <p className="text-sm">전통 서예의 정신을 현대적 감각으로 재해석하는 작가입니다.</p>
                       <div className="flex gap-2">
                         <Button size="sm" variant="sage">작품보기</Button>
                         <Button size="sm" variant="outline">연락하기</Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <Card variant="glass" hover="glow">
                   <CardHeader>
                     <CardTitle className="text-lg">전시 안내</CardTitle>
                     <CardDescription>전시회 정보 카드</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-traditional text-lg">정법과 창신의 조화</h4>
                           <p className="text-sm text-muted-foreground">2024.03.15 - 2024.05.30</p>
                         </div>
                         <Badge variant="neutral">진행중</Badge>
                       </div>
                       <p className="text-sm">동양 서예의 전통과 현대적 해석이 만나는 특별 기획전입니다.</p>
                       <div className="flex gap-2">
                         <Button size="sm" variant="terra">예약하기</Button>
                         <Button size="sm" variant="outline">위치보기</Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </div>

             <Separator className="my-8" />

             {/* Component Development Guidelines */}
            <div className="development-guidelines">
              <h3 className="section-subtitle">개발 가이드라인</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="dev-guidelines-grid">
                    <div className="guideline-section">
                      <h4 className="font-semibold mb-3 text-celadon">CSS 변수 활용</h4>
                      <div className="code-example bg-muted p-3 rounded text-sm font-mono">
                        <div>{/* 브랜드 컬러 */}</div>
                        <div>--celadon: #88A891;</div>
                        <div>--sage-green: #B7C4B7;</div>
                        <div>--terra-red: #9B4444;</div>
                        <div>--rice-paper: #f5f5f0;</div>
                      </div>
                    </div>
                    
                    <div className="guideline-section">
                      <h4 className="font-semibold mb-3 text-celadon">Tailwind 클래스</h4>
                      <div className="code-example bg-muted p-3 rounded text-sm font-mono">
                        <div>{/* 브랜드 특화 클래스 */}</div>
                        <div>.bg-celadon</div>
                        <div>.text-rice-paper</div>
                        <div>.border-sage-green</div>
                        <div>.font-traditional</div>
                      </div>
                    </div>
                    
                    <div className="guideline-section">
                      <h4 className="font-semibold mb-3 text-celadon">컴포넌트 네이밍</h4>
                      <ul className="text-sm space-y-1">
                        <li>• PascalCase 사용 (Button, Card)</li>
                        <li>• 명확하고 직관적인 이름</li>
                        <li>• 기능 중심의 네이밍</li>
                        <li>• 일관된 Props 인터페이스</li>
                      </ul>
                    </div>
                    
                                         <div className="guideline-section">
                       <h4 className="font-semibold mb-3 text-celadon">문서화</h4>
                       <ul className="text-sm space-y-1">
                         <li>• Storybook 활용한 컴포넌트 문서</li>
                         <li>• Props 타입 정의</li>
                         <li>• 사용 예시 제공</li>
                         <li>• 접근성 가이드 포함</li>
                       </ul>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>

             <Separator className="my-8" />

             {/* Component Checklist */}
             <div className="component-checklist">
               <h3 className="section-subtitle">컴포넌트 개발 체크리스트</h3>
               <Card>
                 <CardContent className="pt-6">
                   <div className="checklist-categories">
                     <div className="checklist-category">
                       <h4 className="font-semibold mb-3 text-celadon">브랜드 일관성</h4>
                       <ul className="space-y-2 text-sm">
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           브랜드 컬러 팔레트 사용
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           타이포그래피 시스템 준수
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           간격 시스템 활용
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           브랜드 보이스 반영
                         </li>
                       </ul>
                     </div>

                     <div className="checklist-category">
                       <h4 className="font-semibold mb-3 text-celadon">기술적 요구사항</h4>
                       <ul className="space-y-2 text-sm">
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           TypeScript 타입 정의
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           forwardRef 구현
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           className prop 지원
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           variant 시스템 구현
                         </li>
                       </ul>
                     </div>

                     <div className="checklist-category">
                       <h4 className="font-semibold mb-3 text-celadon">사용자 경험</h4>
                       <ul className="space-y-2 text-sm">
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           직관적인 API 설계
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           적절한 기본값 설정
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           에러 상태 처리
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           로딩 상태 지원
                         </li>
                       </ul>
                     </div>

                     <div className="checklist-category">
                       <h4 className="font-semibold mb-3 text-celadon">접근성 & 성능</h4>
                       <ul className="space-y-2 text-sm">
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           ARIA 속성 구현
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           키보드 네비게이션
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           색상 대비 검증
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-4 h-4 border border-celadon rounded flex items-center justify-center text-xs">✓</div>
                           번들 크기 최적화
                         </li>
                       </ul>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </section>
         )}
      </main>

      <Footer />
    </div>
  )
}
