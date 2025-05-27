"use client"

import Image from "next/image"
import Link from "next/link"
import { Users, Calendar, MapPin, Phone, Mail, ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface OrganizationMember {
  title: string
  name: string
  koreanTitle?: string
  description?: string
  imagePath?: string
  level: number
}

export default function OrganizationPage() {
  const { t } = useLanguage()
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  const organizationStructure: OrganizationMember[] = [
    // 명예이사장
    {
      title: "명예이사장",
      name: "성곡 임현기",
      level: 1,
      description: "본관: 나주, 아호: 성곡・곡산・심고제 주인・증달산인, 당호: 심고제"
    },
    
    // 고문단
    {
      title: "고문",
      name: "토우 강대희",
      level: 2
    },
    {
      title: "고문", 
      name: "지용 박영순",
      level: 2
    },
    {
      title: "고문",
      name: "중관 황재국", 
      level: 2
    },
    
    // 상임고문 및 이사장, 심사위원장
    {
      title: "상임고문",
      name: "호암 임국환",
      level: 3
    },
    {
      title: "이사장 및 운영위원장",
      name: "임재홍",
      level: 3,
      description: "사단법인 동양서예협회를 이끄는 최고 경영진"
    },
    {
      title: "심사위원장",
      name: "아남 배옥영",
      level: 3
    },
    
    // 감사
    {
      title: "감사",
      name: "아남 배옥영",
      level: 4
    },
    {
      title: "감사",
      name: "문원 이권재",
      level: 4
    },
    {
      title: "감사",
      name: "옥채 박성호",
      level: 4
    },
    
    // 상임이사
    {
      title: "상임이사",
      name: "혜전 김정례",
      level: 5
    },
    {
      title: "상임이사",
      name: "진호 소정아",
      level: 5
    },
    {
      title: "상임이사",
      name: "정암 김형석",
      level: 5
    },
    {
      title: "상임이사",
      name: "은혜 최은주",
      level: 5
    },
    {
      title: "상임이사",
      name: "희랑 공경순",
      level: 5
    },
    {
      title: "상임이사",
      name: "향촌 민경배",
      level: 5
    },
    
    // 지부장
    {
      title: "청주지부장",
      name: "서천 김정희",
      level: 6
    },
    {
      title: "태안지부장",
      name: "한솔 윤경희",
      level: 6
    },
    {
      title: "춘천지부장",
      name: "진호 소정아",
      level: 6
    }
  ]

  const groupByLevel = (members: OrganizationMember[]) => {
    return members.reduce((acc, member) => {
      if (!acc[member.level]) {
        acc[member.level] = []
      }
      acc[member.level].push(member)
      return acc
    }, {} as Record<number, OrganizationMember[]>)
  }

  const groupedMembers = groupByLevel(organizationStructure)

  const getLevelTitle = (levelNum: number) => {
    switch(levelNum) {
      case 1: return "명예직"
      case 2: return "고문단"
      case 3: return "경영진"
      case 4: return "감사"
      case 5: return "상임이사"
      case 6: return "지부"
      default: return ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 border-b border-[#222222]/10 dark:border-[#fcfcfc]/10">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-4 md:mb-6">
            <Users className="mx-auto h-8 md:h-12 w-8 md:w-12 text-foreground/60" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider uppercase mb-4 md:mb-6 leading-tight">
            {t("organizationChart")}
          </h1>
          <p className="text-sm md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            {t("organizationDescription")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-6 md:mt-8">
            <Link
              href="https://orientalcalligraphy.channel.io"
              target="_blank"
              className="px-4 md:px-6 py-3 bg-foreground text-background rounded text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors text-center"
            >
              {t("consultationInquiry")}
            </Link>
            <Link
              href="https://cal.com/orientalcalligraphy"
              target="_blank"
              className="px-4 md:px-6 py-3 border border-foreground rounded text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors text-center"
            >
              {t("consultationReservation")}
            </Link>
          </div>
        </div>
      </section>

      {/* Organization Chart - Mobile Accordion Style */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-4">
              조직 구성도
            </h2>
            <div className="w-20 h-px bg-foreground/20 mx-auto"></div>
          </div>

          {/* Mobile/Tablet: Accordion Style */}
          <div className="block lg:hidden space-y-4">
            {Object.entries(groupedMembers).map(([level, members]) => {
              const levelNum = parseInt(level)
              const isExpanded = expandedSection === levelNum
              
              return (
                <div key={level} className="border border-[#222222]/10 dark:border-[#fcfcfc]/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : levelNum)}
                    className="w-full px-4 py-4 bg-foreground/5 flex items-center justify-between text-left hover:bg-foreground/10 transition-colors"
                  >
                    <div>
                      <span className="text-sm uppercase tracking-wider font-medium">
                        {getLevelTitle(levelNum)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({members.length}명)
                      </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-foreground/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {members.map((member, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-background/50 border border-[#222222]/5 dark:border-[#fcfcfc]/5 rounded"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="h-5 w-5 text-foreground/40" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs uppercase tracking-wider text-foreground/60 mb-1">
                                {member.title}
                              </h3>
                              <p className="font-medium text-sm mb-1">
                                {member.name}
                              </p>
                              {member.description && (
                                <p className="text-xs text-foreground/60 leading-relaxed">
                                  {member.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop: Grid Style */}
          <div className="hidden lg:block space-y-12">
            {Object.entries(groupedMembers).map(([level, members]) => {
              const levelNum = parseInt(level)
              
              return (
                <div key={level} className="w-full">
                  {/* Level Title */}
                  <div className="text-center mb-8">
                    <div className="inline-block px-6 py-2 bg-foreground/5 rounded-full border border-foreground/10">
                      <span className="text-sm uppercase tracking-wider font-medium">
                        {getLevelTitle(levelNum)}
                      </span>
                    </div>
                  </div>

                  {/* Members Grid */}
                  <div className={`grid gap-6 ${
                    levelNum === 1 ? "grid-cols-1 max-w-md mx-auto" :
                    levelNum === 2 ? "grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto" :
                    levelNum === 3 ? "grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto" :
                    levelNum === 4 ? "grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto" :
                    levelNum === 5 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" :
                    "grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto"
                  }`}>
                    {members.map((member, index) => (
                      <div 
                        key={index}
                        className={`group p-6 border border-[#222222]/10 dark:border-[#fcfcfc]/10 rounded-lg hover:shadow-lg transition-all duration-300 hover:border-foreground/20 bg-background/50 backdrop-blur-sm ${
                          member.title.includes("이사장") ? "ring-2 ring-foreground/20 transform scale-105" : ""
                        }`}
                      >
                        {/* Member Image Placeholder */}
                        <div className="w-16 h-16 mx-auto mb-4 bg-foreground/10 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-foreground/40" />
                        </div>

                        {/* Member Info */}
                        <div className="text-center">
                          <h3 className="text-xs uppercase tracking-wider text-foreground/60 mb-2">
                            {member.title}
                          </h3>
                          <p className="font-medium text-lg mb-2">
                            {member.name}
                          </p>
                          {member.description && (
                            <p className="text-sm text-foreground/60 leading-relaxed">
                              {member.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Visual Organization Chart - Desktop Only */}
      <section className="hidden lg:block py-20 px-4 bg-foreground/[0.02] border-t border-[#222222]/10 dark:border-[#fcfcfc]/10">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-light tracking-wider uppercase mb-4">
              조직도 다이어그램
            </h2>
            <div className="w-20 h-px bg-foreground/20 mx-auto"></div>
          </div>

          <div className="bg-background border border-[#222222]/10 dark:border-[#fcfcfc]/10 rounded-lg p-8 overflow-x-auto">
            <div className="min-w-[800px] space-y-8">
              {/* 명예이사장 */}
              <div className="text-center">
                <div className="inline-block p-4 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-lg border-2 border-foreground/20">
                  <div className="text-xs uppercase tracking-wider text-foreground/60 mb-1">명예이사장</div>
                  <div className="font-medium">성곡 임현기</div>
                </div>
              </div>

              {/* 연결선 */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-foreground/20"></div>
              </div>

              {/* 고문단 */}
              <div className="flex justify-center space-x-8">
                <div className="text-center p-3 bg-foreground/5 rounded border border-foreground/10">
                  <div className="text-xs text-foreground/60 mb-1">고문</div>
                  <div className="text-sm">토우 강대희</div>
                </div>
                <div className="text-center p-3 bg-foreground/5 rounded border border-foreground/10">
                  <div className="text-xs text-foreground/60 mb-1">고문</div>
                  <div className="text-sm">지용 박영순</div>
                </div>
                <div className="text-center p-3 bg-foreground/5 rounded border border-foreground/10">
                  <div className="text-xs text-foreground/60 mb-1">고문</div>
                  <div className="text-sm">중관 황재국</div>
                </div>
              </div>

              {/* 연결선 */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-foreground/20"></div>
              </div>

              {/* 경영진 */}
              <div className="flex justify-center items-center space-x-6">
                <div className="text-center p-3 bg-foreground/5 rounded border border-foreground/10">
                  <div className="text-xs text-foreground/60 mb-1">상임고문</div>
                  <div className="text-sm">호암 임국환</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                  <div className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">이사장</div>
                  <div className="font-medium text-blue-800 dark:text-blue-300">임재홍</div>
                </div>
                <div className="text-center p-3 bg-foreground/5 rounded border border-foreground/10">
                  <div className="text-xs text-foreground/60 mb-1">심사위원장</div>
                  <div className="text-sm">아남 배옥영</div>
                </div>
              </div>

              {/* 연결선 */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-foreground/20"></div>
              </div>

              {/* 감사 및 상임이사 */}
              <div className="grid grid-cols-2 gap-8">
                {/* 감사 */}
                <div>
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-foreground/80">감사</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">아남 배옥영</div>
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">문원 이권재</div>
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">옥채 박성호</div>
                  </div>
                </div>

                {/* 상임이사 */}
                <div>
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-foreground/80">상임이사</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">혜전 김정례</div>
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">진호 소정아</div>
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">정암 김형석</div>
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">은혜 최은주</div>
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">희랑 공경순</div>
                    <div className="text-center p-2 bg-foreground/5 rounded text-sm">향촌 민경배</div>
                  </div>
                </div>
              </div>

              {/* 지부 */}
              <div className="border-t border-foreground/10 pt-6">
                <div className="text-center mb-4">
                  <span className="text-sm font-medium text-foreground/80">지부장</span>
                </div>
                <div className="flex justify-center space-x-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">청주지부</div>
                    <div className="text-sm">서천 김정희</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">태안지부</div>
                    <div className="text-sm">한솔 윤경희</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">춘천지부</div>
                    <div className="text-sm">진호 소정아</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-6 md:mb-8">
            연락처 및 문의
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="space-y-2">
              <MapPin className="mx-auto h-5 md:h-6 w-5 md:w-6 mb-3 md:mb-4" />
              <h3 className="text-sm uppercase tracking-wider">위치</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                서울특별시 중구 인사동길 12번지<br />
                전통문화센터 3층
              </p>
            </div>
            
            <div className="space-y-2">
              <Phone className="mx-auto h-5 md:h-6 w-5 md:w-6 mb-3 md:mb-4" />
              <h3 className="text-sm uppercase tracking-wider">전화</h3>
              <p className="text-sm opacity-80">
                02-1234-5678
              </p>
            </div>
            
            <div className="space-y-2">
              <Mail className="mx-auto h-5 md:h-6 w-5 md:w-6 mb-3 md:mb-4" />
              <h3 className="text-sm uppercase tracking-wider">이메일</h3>
              <p className="text-sm opacity-80">
                info@orientalcalligraphy.org
              </p>
            </div>
          </div>
          
          <div className="border-t border-background/20 pt-6 md:pt-8">
            <p className="text-sm opacity-80 leading-relaxed">
              궁금하신 부분이 있거나 저희 협회에 남기실 말씀이 있다면 언제든지 문의하여 주시기 바랍니다.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 