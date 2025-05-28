"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Palette, 
  Type, 
  Layout, 
  Layers, 
  Zap, 
  Copy,
  Check,
  Eye,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Shield,
  DollarSign,
  PieChart,
  BarChart3,
  Calculator,
  Briefcase,
  Users,
  Target,
  Award,
  Lock,
  CheckCircle,
  AlertTriangle,
  Code,
  Lightbulb
} from "lucide-react"
import { useTheme } from "next-themes"
import { BrandUsageExamples } from "@/components/ui/brand-usage-examples"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/footer"

export default function BrandGuidelinesPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(colorName)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const copyCodeToClipboard = (code: string, codeId: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(codeId)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const colorPalette = {
    primary: {
      navy: {
        name: "Navy Primary",
        value: "#1E3A8A",
        css: "navy-primary",
        description: "메인 브랜드 색상, 신뢰성과 전문성을 나타내는 핵심 색상"
      },
      bronze: {
        name: "Bronze Primary", 
        value: "#92400E",
        css: "bronze-primary",
        description: "프리미엄 액센트 색상, 차분하고 고급스러운 느낌의 강조 요소"
      },
      forest: {
        name: "Forest Primary",
        value: "#065F46", 
        css: "forest-primary",
        description: "안정성과 성장을 상징하는 포레스트 그린, 긍정적 메시지 전달"
      }
    },
    financial: {
      trustBlue: {
        name: "Trust Blue",
        value: "#2563EB",
        css: "trust-blue",
        description: "신뢰성을 강조하는 파란색, 금융 안정성 표현"
      },
      successGreen: {
        name: "Success Green",
        value: "#059669",
        css: "success-green", 
        description: "성장과 수익을 나타내는 녹색, 긍정적 지표에 사용"
      },
      warningAmber: {
        name: "Warning Amber",
        value: "#D97706",
        css: "warning-amber",
        description: "주의사항과 리스크 알림에 사용하는 주황색"
      },
      premiumPurple: {
        name: "Premium Purple",
        value: "#7C3AED",
        css: "premium-purple",
        description: "프리미엄 서비스와 VIP 고객을 위한 보라색"
      }
    },
    neutral: {
      white: { name: "Pure White", value: "#FFFFFF", css: "white", description: "깔끔한 배경과 텍스트" },
      slate50: { name: "Slate 50", value: "#F8FAFC", css: "slate-50", description: "미묘한 배경색" },
      slate100: { name: "Slate 100", value: "#F1F5F9", css: "slate-100", description: "카드 배경" },
      slate300: { name: "Slate 300", value: "#CBD5E1", css: "slate-300", description: "경계선과 구분선" },
      slate500: { name: "Slate 500", value: "#64748B", css: "slate-500", description: "보조 텍스트" },
      slate700: { name: "Slate 700", value: "#334155", css: "slate-700", description: "일반 텍스트" },
      slate900: { name: "Slate 900", value: "#0F172A", css: "slate-900", description: "제목과 강조 텍스트" }
    }
  }

  const typography = {
    heading: {
      name: "Heading Font",
      family: "var(--font-heading)",
      description: "제목과 헤딩에 사용되는 세리프 폰트"
    },
    body: {
      name: "Body Font", 
      family: "var(--font-body)",
      description: "본문과 일반 텍스트에 사용되는 산세리프 폰트"
    }
  }

  const spacing = {
    xs: "8px",
    sm: "16px", 
    md: "24px",
    lg: "48px",
    xl: "100px"
  }

  const codeExamples = {
    darkMode: `// 다크 모드 자동 전환 예시
<div className="bg-light-bg-primary dark:bg-dark-bg-primary">
  <p className="text-light-text-primary dark:text-dark-text-primary">
    패밀리오피스는 고객의 자산을 소중히 관리합니다.
  </p>
</div>`,
    button: `// 버튼 사용 예시
import { Button } from "@/components/ui/button"

<Button variant="primary">상담 신청</Button>
<Button variant="secondary">서비스 안내</Button>
<Button variant="tertiary">사례 보기</Button>`,
    brandColors: `// 브랜드 색상 사용 예시
<div className="bg-navy-primary text-white">
  <h1 className="text-bronze-primary">패밀리오피스</h1>
  <p className="text-forest-primary">전문적인 자산관리 서비스</p>
</div>`,
    typography: `// 타이포그래피 사용 예시
<h1 className="font-heading text-4xl font-bold text-navy-primary">
  패밀리오피스 서비스
</h1>
<p className="font-body text-base text-gray-600">
  고액자산가를 위한 종합적인 자산관리 솔루션
</p>`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-gradient-brand mb-4">
            브랜드 아이덴티티 가이드라인
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            패밀리오피스 S의 브랜드 아이덴티티와 디자인 시스템입니다.
            일관된 사용자 경험을 위한 색상, 타이포그래피, 컴포넌트 가이드라인과 
            실제 개발에 활용할 수 있는 코드 예시를 제공합니다.
          </p>
          
          {/* 테마 토글 */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              라이트
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              다크
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 glass-card">
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="h-4 w-4" />
              색상
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2">
              <Type className="h-4 w-4" />
              타이포그래피
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-2">
              <Layout className="h-4 w-4" />
              컴포넌트
            </TabsTrigger>
            <TabsTrigger value="spacing" className="gap-2">
              <Layers className="h-4 w-4" />
              스페이싱
            </TabsTrigger>
            <TabsTrigger value="effects" className="gap-2">
              <Zap className="h-4 w-4" />
              효과
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-4 w-4" />
              코드 예시
            </TabsTrigger>
            <TabsTrigger value="examples" className="gap-2">
              <Eye className="h-4 w-4" />
              사용 예시
            </TabsTrigger>
          </TabsList>

          {/* 색상 팔레트 */}
          <TabsContent value="colors" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  브랜드 색상 팔레트
                </CardTitle>
                <CardDescription>
                  브랜드 아이덴티티를 나타내는 핵심 색상들입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 주요 브랜드 색상 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">주요 브랜드 색상</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(colorPalette.primary).map(([key, color]) => (
                      <Card key={key} className="overflow-hidden hover-lift">
                        <div 
                          className="h-24 w-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{color.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(color.value, key)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedColor === key ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {color.description}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>HEX:</span>
                              <code className="bg-muted px-1 rounded">{color.value}</code>
                            </div>
                            <div className="flex justify-between">
                              <span>CSS:</span>
                              <code className="bg-muted px-1 rounded">bg-{color.css}</code>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 금융 특화 색상 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">금융 특화 색상</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(colorPalette.financial).map(([key, color]) => (
                      <Card key={key} className="overflow-hidden hover-lift">
                        <div 
                          className="h-20 w-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{color.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(color.value, key)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedColor === key ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {color.description}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>HEX:</span>
                              <code className="bg-muted px-1 rounded">{color.value}</code>
                            </div>
                            <div className="flex justify-between">
                              <span>CSS:</span>
                              <code className="bg-muted px-1 rounded">bg-{color.css}</code>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 중성 색상 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">중성 색상</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Object.entries(colorPalette.neutral).map(([key, color]) => (
                      <Card key={key} className="overflow-hidden hover-lift">
                        <div 
                          className="h-16 w-full border-b"
                          style={{ backgroundColor: color.value }}
                        />
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-xs font-medium">{color.name}</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(color.value, key)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedColor === key ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <code className="text-xs bg-muted px-1 rounded">{color.value}</code>
                          <p className="text-xs text-muted-foreground mt-1">{color.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 타이포그래피 */}
          <TabsContent value="typography" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  타이포그래피 시스템
                </CardTitle>
                <CardDescription>
                  일관된 텍스트 스타일과 계층 구조를 정의합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 폰트 패밀리 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">폰트 패밀리</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(typography).map(([key, font]) => (
                      <Card key={key}>
                        <CardContent className="p-6">
                          <h4 className="font-semibold mb-2">{font.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {font.description}
                          </p>
                          <div 
                            className="text-2xl mb-2"
                            style={{ fontFamily: font.family }}
                          >
                            The quick brown fox jumps
                          </div>
                          <div 
                            className="text-lg"
                            style={{ fontFamily: font.family }}
                          >
                            빠른 갈색 여우가 게으른 개를 뛰어넘습니다
                          </div>
                          <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                            font-family: {font.family}
                          </code>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 텍스트 크기 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">텍스트 크기 스케일</h3>
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="text-6xl font-heading">Heading 1 - 6xl</div>
                      <div className="text-4xl font-heading">Heading 2 - 4xl</div>
                      <div className="text-2xl font-heading">Heading 3 - 2xl</div>
                      <div className="text-xl font-heading">Heading 4 - xl</div>
                      <div className="text-lg font-body">Body Large - lg</div>
                      <div className="text-base font-body">Body Regular - base</div>
                      <div className="text-sm font-body">Body Small - sm</div>
                      <div className="text-xs font-body">Caption - xs</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 컴포넌트 */}
          <TabsContent value="components" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  UI 컴포넌트 라이브러리
                </CardTitle>
                <CardDescription>
                  재사용 가능한 UI 컴포넌트들의 예시와 사용법입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 버튼 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">버튼</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-4 mb-4">
                        <Button>Primary Button</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 입력 필드 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">입력 필드</h3>
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">이메일</label>
                          <Input placeholder="이메일을 입력하세요" type="email" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">비밀번호</label>
                          <Input placeholder="비밀번호를 입력하세요" type="password" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">메시지</label>
                        <Textarea placeholder="메시지를 입력하세요" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 배지와 상태 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">배지와 상태</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-4 mb-4">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                      </div>
                      <div className="space-y-4">
                        <Alert>
                          <AlertDescription>
                            기본 알림 메시지입니다.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 인터랙티브 요소 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">인터랙티브 요소</h3>
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center space-x-4">
                        <Switch />
                        <span>스위치 토글</span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">진행률</label>
                        <Progress value={65} className="w-full" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">슬라이더</label>
                        <Slider defaultValue={[50]} max={100} step={1} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 금융 데이터 시각화 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">금융 데이터 시각화</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success-green" />
                          포트폴리오 성과
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">총 수익률</span>
                            <span className="font-semibold text-success-green">+12.5%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-trust-blue">₩2.5M</div>
                              <div className="text-xs text-muted-foreground">주식</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-bronze-primary">₩1.8M</div>
                              <div className="text-xs text-muted-foreground">채권</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-premium-purple">₩900K</div>
                              <div className="text-xs text-muted-foreground">대안투자</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-navy-primary" />
                          리스크 분석
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">리스크 레벨</span>
                            <Badge variant="outline" className="text-warning-amber border-warning-amber">중간</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>변동성</span>
                              <span>15.2%</span>
                            </div>
                            <Progress value={30} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>샤프 비율</span>
                              <span>1.45</span>
                            </div>
                            <Progress value={72} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* 아바타와 프로필 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">아바타</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>CD</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 스페이싱 */}
          <TabsContent value="spacing" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  스페이싱 시스템
                </CardTitle>
                <CardDescription>
                  일관된 레이아웃을 위한 간격 정의입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(spacing).map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-sm font-medium mb-2">{key.toUpperCase()}</div>
                          <div 
                            className="bg-bronze-primary mx-auto mb-2"
                            style={{ 
                              width: value,
                              height: value,
                              maxWidth: '100px',
                              maxHeight: '100px'
                            }}
                          />
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {value}
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">스페이싱 사용 예시</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="p-2 bg-muted rounded">
                          <span className="text-sm">xs (8px) - 작은 여백</span>
                        </div>
                        <div className="p-4 bg-muted rounded">
                          <span className="text-sm">sm (16px) - 기본 여백</span>
                        </div>
                        <div className="p-6 bg-muted rounded">
                          <span className="text-sm">md (24px) - 중간 여백</span>
                        </div>
                        <div className="p-12 bg-muted rounded">
                          <span className="text-sm">lg (48px) - 큰 여백</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 효과 */}
          <TabsContent value="effects" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  시각적 효과
                </CardTitle>
                <CardDescription>
                  글래스모피즘, 그림자, 애니메이션 등의 시각적 효과입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 글래스모피즘 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">글래스모피즘 효과</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="glass">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-semibold mb-2">Glass</h4>
                        <p className="text-sm text-muted-foreground">
                          기본 글래스 효과
                        </p>
                        <code className="text-xs bg-black/10 px-2 py-1 rounded mt-2 inline-block">
                          .glass
                        </code>
                      </CardContent>
                    </Card>
                    <Card className="glass-dark">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-semibold mb-2">Glass Dark</h4>
                        <p className="text-sm text-muted-foreground">
                          다크 글래스 효과
                        </p>
                        <code className="text-xs bg-black/10 px-2 py-1 rounded mt-2 inline-block">
                          .glass-dark
                        </code>
                      </CardContent>
                    </Card>
                    <Card className="glass-card">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-semibold mb-2">Glass Card</h4>
                        <p className="text-sm text-muted-foreground">
                          카드형 글래스 효과
                        </p>
                        <code className="text-xs bg-black/10 px-2 py-1 rounded mt-2 inline-block">
                          .glass-card
                        </code>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* 호버 효과 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">호버 효과</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="hover-lift cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-semibold mb-2">Hover Lift</h4>
                        <p className="text-sm text-muted-foreground">
                          마우스 오버 시 들어올리는 효과
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="hover-glow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-semibold mb-2">Hover Glow</h4>
                        <p className="text-sm text-muted-foreground">
                          마우스 오버 시 글로우 효과
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* 그라데이션 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">그라데이션</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="overflow-hidden">
                      <div className="h-20 bg-gradient-brand" />
                      <CardContent className="p-4 text-center">
                        <h5 className="font-medium">Brand</h5>
                        <code className="text-xs">bg-gradient-brand</code>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <div className="h-20 bg-gradient-navy" />
                      <CardContent className="p-4 text-center">
                        <h5 className="font-medium">Navy</h5>
                        <code className="text-xs">bg-gradient-navy</code>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <div className="h-20 bg-gradient-bronze" />
                      <CardContent className="p-4 text-center">
                        <h5 className="font-medium">Bronze</h5>
                        <code className="text-xs">bg-gradient-bronze</code>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <div className="h-20 bg-gradient-forest" />
                      <CardContent className="p-4 text-center">
                        <h5 className="font-medium">Forest</h5>
                        <code className="text-xs">bg-gradient-forest</code>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* 금융 특화 아이콘 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">금융 특화 아이콘</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-6">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-trust-blue/10 text-trust-blue">
                            <TrendingUp className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">성장</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-navy-primary/10 text-navy-primary">
                            <Shield className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">보안</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-success-green/10 text-success-green">
                            <DollarSign className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">수익</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-bronze-primary/10 text-bronze-primary">
                            <PieChart className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">분석</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-premium-purple/10 text-premium-purple">
                            <BarChart3 className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">리포트</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-slate-500/10 text-slate-700">
                            <Calculator className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">계산</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-forest-primary/10 text-forest-primary">
                            <Briefcase className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">포트폴리오</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-trust-blue/10 text-trust-blue">
                            <Users className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">고객</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-warning-amber/10 text-warning-amber">
                            <Target className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">목표</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-bronze-primary/10 text-bronze-primary">
                            <Award className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">프리미엄</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-navy-primary/10 text-navy-primary">
                            <Lock className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">보안</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-lg bg-success-green/10 text-success-green">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">승인</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 반응형 디자인 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">반응형 디자인</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center gap-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Smartphone className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Mobile</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            &lt; 768px
                          </code>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Tablet className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Tablet</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            768px - 1024px
                          </code>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Monitor className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Desktop</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            &gt; 1024px
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 코드 예시 */}
          <TabsContent value="code" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  개발자를 위한 코드 예시
                </CardTitle>
                <CardDescription>
                  실제 개발에 바로 활용할 수 있는 코드 예시와 미리보기입니다.
                  Tailwind CSS와 Shadcn UI 기반으로 작성되었습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 다크 모드 자동 전환 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    다크 모드 자동 전환
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">미리보기</h4>
                      <Card className="bg-light-bg-primary dark:bg-dark-bg-primary border-2">
                        <CardContent className="p-6">
                          <p className="text-light-text-primary dark:text-dark-text-primary">
                            패밀리오피스는 고객의 자산을 소중히 관리합니다.
                          </p>
                          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-2">
                            테마를 변경해보세요 - 자동으로 색상이 전환됩니다.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">코드</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCodeToClipboard(codeExamples.darkMode, 'darkMode')}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCode === 'darkMode' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Card className="bg-slate-900 text-slate-100">
                        <CardContent className="p-4">
                          <pre className="text-xs overflow-x-auto">
                            <code>{codeExamples.darkMode}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* 버튼 컴포넌트 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    버튼 컴포넌트 사용법
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">미리보기</h4>
                      <Card>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex flex-wrap gap-3">
                            <Button variant="primary">상담 신청</Button>
                            <Button variant="secondary">서비스 안내</Button>
                            <Button variant="tertiary">사례 보기</Button>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                            <Button variant="outline">Outline</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">코드</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCodeToClipboard(codeExamples.button, 'button')}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCode === 'button' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Card className="bg-slate-900 text-slate-100">
                        <CardContent className="p-4">
                          <pre className="text-xs overflow-x-auto">
                            <code>{codeExamples.button}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* 브랜드 색상 활용 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    브랜드 색상 활용법
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">미리보기</h4>
                      <Card className="bg-navy-primary text-white">
                        <CardContent className="p-6">
                          <h1 className="text-bronze-primary text-2xl font-bold mb-2">패밀리오피스</h1>
                          <p className="text-forest-primary font-medium">전문적인 자산관리 서비스</p>
                          <p className="text-white/80 text-sm mt-2">
                            신뢰할 수 있는 파트너와 함께하세요
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">코드</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCodeToClipboard(codeExamples.brandColors, 'brandColors')}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCode === 'brandColors' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Card className="bg-slate-900 text-slate-100">
                        <CardContent className="p-4">
                          <pre className="text-xs overflow-x-auto">
                            <code>{codeExamples.brandColors}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* 타이포그래피 시스템 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    타이포그래피 시스템
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">미리보기</h4>
                      <Card>
                        <CardContent className="p-6">
                          <h1 className="font-heading text-4xl font-bold text-navy-primary mb-4">
                            패밀리오피스 서비스
                          </h1>
                          <h2 className="font-heading text-2xl font-semibold text-bronze-primary mb-3">
                            고객 중심의 자산관리
                          </h2>
                          <p className="font-body text-base text-gray-600 mb-2">
                            고액자산가를 위한 종합적인 자산관리 솔루션을 제공합니다.
                          </p>
                          <p className="font-body text-sm text-gray-500">
                            전문성과 신뢰성을 바탕으로 한 맞춤형 서비스
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">코드</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCodeToClipboard(codeExamples.typography, 'typography')}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCode === 'typography' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Card className="bg-slate-900 text-slate-100">
                        <CardContent className="p-4">
                          <pre className="text-xs overflow-x-auto">
                            <code>{codeExamples.typography}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* 개발 가이드라인 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">개발 가이드라인</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">권장사항</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Tailwind CSS 유틸리티 클래스 사용
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Shadcn UI 컴포넌트 활용
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              다크 모드 지원을 위한 dark: 접두사 사용
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              반응형 디자인을 위한 브레이크포인트 활용
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">주의사항</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              인라인 스타일 대신 CSS 클래스 사용
                            </li>
                            <li className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              브랜드 색상 외의 임의 색상 사용 금지
                            </li>
                            <li className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              접근성을 고려한 색상 대비 유지
                            </li>
                            <li className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              일관된 스페이싱 시스템 준수
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 사용 예시 */}
          <TabsContent value="examples" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  브랜드 컴포넌트 사용 예시
                </CardTitle>
                <CardDescription>
                  실제 프로젝트에서 브랜드 컴포넌트들을 어떻게 사용하는지 보여주는 예시입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandUsageExamples />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 사용 가이드라인 */}
        <Card className="glass-card mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              사용 가이드라인
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-600">✅ 권장사항</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 브랜드 색상을 일관되게 사용하세요</li>
                  <li>• 적절한 대비율을 유지하세요 (WCAG 2.1 AA 기준)</li>
                  <li>• 모바일 우선 반응형 디자인을 적용하세요</li>
                  <li>• 글래스모피즘 효과를 적절히 활용하세요</li>
                  <li>• 일관된 스페이싱을 사용하세요</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-red-600">❌ 주의사항</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 브랜드 색상을 임의로 변경하지 마세요</li>
                  <li>• 과도한 애니메이션은 피하세요</li>
                  <li>• 접근성을 해치는 디자인은 사용하지 마세요</li>
                  <li>• 일관성 없는 컴포넌트 스타일링을 피하세요</li>
                  <li>• 너무 많은 시각적 효과를 한 번에 사용하지 마세요</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
} 