"use client";

import React from "react";
import { CulturalSpotlight } from "@/components/aceternity/cultural-spotlight";
import { InkMeteors } from "@/components/aceternity/ink-meteors";
import { CalligraphyBeams } from "@/components/aceternity/calligraphy-beams";
import { FloatingCulturalNav } from "@/components/aceternity/floating-cultural-nav";
import { CulturalHeroHighlight, CulturalHighlight } from "@/components/aceternity/cultural-hero-highlight";
import { CulturalMovingCards } from "@/components/aceternity/cultural-moving-cards";
import { Button } from "@/components/ui/button";
import { HomeIcon, UserIcon, PhoneIcon, BookIcon, PaletteIcon } from "lucide-react";

const culturalTestimonials = [
  {
    quote: "한국 서예의 전통을 현대적으로 계승하며, 동양 미학의 깊이를 탐구할 수 있는 소중한 공간입니다.",
    name: "김정호",
    title: "서예가",
    location: "서울",
    category: "calligraphy" as const,
  },
  {
    quote: "水墨畫의 정신을 통해 마음의 평화를 찾고, 예술적 영감을 얻을 수 있습니다.",
    name: "이미경",
    title: "수묵화가",
    location: "부산",
    category: "painting" as const,
  },
  {
    quote: "古詩와 현대 시의 만남, 한자 문화권의 시적 전통을 이어가는 의미 있는 활동입니다.",
    name: "박문수",
    title: "시인",
    location: "경주",
    category: "poetry" as const,
  },
  {
    quote: "동양 철학의 지혜를 현대인의 삶에 적용하여, 진정한 마음의 수양을 실천할 수 있습니다.",
    name: "최혜린",
    title: "철학자",
    location: "전주",
    category: "philosophy" as const,
  },
  {
    quote: "書道를 통해 마음의 수련과 정신적 성숙을 이룰 수 있는 귀중한 경험을 제공합니다.",
    name: "장영수",
    title: "서도연구가",
    location: "대구",
    category: "calligraphy" as const,
  },
];

const navItems = [
  {
    name: "Home",
    nameKo: "홈",
    nameZh: "首页",
    nameJa: "ホーム",
    link: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    name: "Gallery",
    nameKo: "갤러리",
    nameZh: "画廊",
    nameJa: "ギャラリー",
    link: "/gallery",
    icon: <PaletteIcon className="h-4 w-4" />,
  },
  {
    name: "Education",
    nameKo: "교육",
    nameZh: "教育",
    nameJa: "教育",
    link: "/education",
    icon: <BookIcon className="h-4 w-4" />,
  },
  {
    name: "About",
    nameKo: "소개",
    nameZh: "关于",
    nameJa: "について",
    link: "/about",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    name: "Contact",
    nameKo: "연락처",
    nameZh: "联系",
    nameJa: "お問合せ",
    link: "/contact",
    icon: <PhoneIcon className="h-4 w-4" />,
  },
];

export default function CulturalDemo() {
  return (
    <div className="min-h-screen bg-rice-paper dark:bg-lacquer-black text-ink-black dark:text-rice-paper">
      {/* Floating Cultural Navigation */}
      <FloatingCulturalNav navItems={navItems} />

      {/* Hero Section with Cultural Spotlight */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <CulturalSpotlight 
          className="-top-40 left-0 md:left-60 md:-top-20" 
          variant="ink"
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-7xl font-bold font-calligraphy mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-ink-black to-stone-gray dark:from-rice-paper dark:to-silk-cream">
              亞洲書藝文化協會
            </span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-calligraphy text-scholar-red dark:text-temple-gold mb-8">
            Asian Calligraphy & Arts Association
          </h2>
          <p className="text-lg md:text-xl mt-6 max-w-3xl mx-auto text-stone-gray dark:text-celadon-green font-sans">
            전통 동양 서예와 문화 예술의 보존과 계승을 통해 <br />
            현대인의 마음의 수양과 문화적 소양을 기릅니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button 
              className="bg-scholar-red hover:bg-scholar-red/90 text-rice-paper font-calligraphy" 
              size="lg"
            >
              서예 체험하기
            </Button>
            <Button 
              variant="outline" 
              className="border-bamboo-green text-bamboo-green hover:bg-bamboo-green/10 font-calligraphy" 
              size="lg"
            >
              작품 갤러리 보기
            </Button>
          </div>
        </div>
        
        {/* Traditional paper texture overlay */}
        <div 
          className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.1'%3E%3Cpolygon fill='%23af2626' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </section>

      {/* Cultural Programs with Ink Meteors */}
      <section className="py-20 px-4 bg-silk-cream dark:bg-ink-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 font-calligraphy">
            문화 교육 프로그램
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "서예 기초반",
                titleZh: "書法基礎班",
                description: "한국 전통 서예의 기본기를 배우는 과정",
                features: ["붓 잡는 법", "기본 획법", "한글 서예", "한자 서예"],
                color: "ink-black" as const,
                icon: "🖋️"
              },
              {
                title: "수묵화 교실",
                titleZh: "水墨畫教室", 
                description: "동양화의 정신과 기법을 익히는 과정",
                features: ["사군자", "산수화", "화조화", "인물화"],
                color: "scholar-red" as const,
                icon: "🎨"
              },
              {
                title: "문인화 워크숍",
                titleZh: "文人畫工作坊",
                description: "선비정신이 담긴 문인화 전통 계승",
                features: ["시서화", "문인정신", "품격수양", "정신수련"],
                color: "bamboo-green" as const,
                icon: "📜"
              },
            ].map((program, idx) => (
              <div
                key={idx}
                className="relative bg-rice-paper dark:bg-lacquer-black border-2 border-stone-gray/20 dark:border-rice-paper/20 rounded-2xl p-8 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <InkMeteors number={12} color={program.color} />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{program.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 font-calligraphy text-ink-black dark:text-rice-paper">
                    {program.title}
                  </h3>
                  <h4 className="text-lg mb-4 font-chinese text-scholar-red dark:text-temple-gold">
                    {program.titleZh}
                  </h4>
                  <p className="text-stone-gray dark:text-celadon-green mb-6 font-sans">
                    {program.description}
                  </p>
                  <ul className="space-y-2">
                    {program.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center text-sm font-calligraphy">
                        <span className="w-2 h-2 bg-bamboo-green rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Hero Highlight Section */}
      <section className="py-20">
        <CulturalHeroHighlight containerClassName="h-[60vh]">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 font-calligraphy">
              전통문화의{" "}
              <CulturalHighlight variant="scholar" className="text-ink-black dark:text-rice-paper">
                현대적 계승
              </CulturalHighlight>
            </h2>
            <p className="text-xl md:text-2xl text-stone-gray dark:text-celadon-green max-w-4xl mx-auto font-sans leading-relaxed">
              천년의 동양 문화 전통을 현대적 감각으로 재해석하여, 
              오늘날의 문화적 가치로 승화시키는 
              <CulturalHighlight variant="bamboo" className="mx-2">
                문화 창조 공간
              </CulturalHighlight>
              입니다.
            </p>
          </div>
        </CulturalHeroHighlight>
      </section>

      {/* Cultural Testimonials with Moving Cards */}
      <section className="py-20 bg-gradient-to-b from-silk-cream to-rice-paper dark:from-lacquer-black dark:to-ink-black">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-calligraphy">
            문화인들의 이야기
          </h2>
          <p className="text-xl text-stone-gray dark:text-celadon-green max-w-2xl mx-auto font-sans">
            전통 문화 예술을 사랑하는 분들의 소중한 경험담을 들어보세요
          </p>
        </div>
        <CulturalMovingCards
          items={culturalTestimonials}
          direction="right"
          speed="slow"
          className="mb-8"
        />
      </section>

      {/* Background with Calligraphy Beams */}
      <section className="relative py-20">
        <CalligraphyBeams className="absolute inset-0" />
        <div className="relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 font-calligraphy">
            함께 만들어가는 문화
          </h2>
          <p className="text-xl text-stone-gray dark:text-celadon-green mb-8 max-w-2xl mx-auto font-sans">
            전통 서예와 동양 문화 예술의 아름다움을 
            함께 배우고 나누어가실 분들을 모십니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-scholar-red to-temple-gold hover:from-scholar-red/90 hover:to-temple-gold/90 text-rice-paper font-calligraphy" 
              size="lg"
            >
              수업 신청하기
            </Button>
            <Button 
              variant="outline" 
              className="border-bamboo-green text-bamboo-green hover:bg-bamboo-green/10 font-calligraphy" 
              size="lg"
            >
              작품 갤러리 둘러보기
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-gray/20 dark:border-rice-paper/20 py-12 bg-silk-cream dark:bg-lacquer-black">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-calligraphy mb-2">亞洲書藝文化協會</h3>
            <p className="text-stone-gray dark:text-celadon-green font-sans">
              Asian Calligraphy & Arts Association
            </p>
          </div>
          <p className="text-stone-gray dark:text-celadon-green font-sans">
            © 2024 ASCA. 전통문화의 현대적 계승을 위한 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
}