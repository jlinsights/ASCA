import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { TranslatedContent } from "@/components/translated-content"
import { ArrowRight, Calendar, Users, Eye, MapPin } from "lucide-react"
import CalligraphyText from "@/components/calligraphy-text"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "ASCA | 사단법인 동양서예협회",
  description: "正法의 계승, 創新의 조화 - 동양 서예 문화의 발전과 보급을 선도하는 사단법인 동양서예협회입니다.",
  keywords: "동양서예협회, ASCA, 서예, 동양서예, 한국서예, 서예전시, 서예교육, 서예문화, 정법, 창신",
  openGraph: {
    title: "ASCA | 사단법인 동양서예협회",
    description: "正法의 계승, 創新의 조화 - 동양 서예 문화의 발전과 보급을 선도하는 사단법인 동양서예협회입니다.",
    type: "website",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 md:py-16 lg:py-24">
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4 text-center lg:text-left">
              <p className="text-xs uppercase tracking-wider opacity-60">
                <TranslatedContent textKey="artGalleryExhibition" />
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-calligraphy uppercase leading-tight text-multilingual">
                <TranslatedContent textKey="journeyThroughArts" />
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-traditional text-multilingual">
                <CalligraphyText>正法</CalligraphyText>의 계승과 <CalligraphyText>創新</CalligraphyText>의 조화가 만나는 특별한 공간에서 동양 서예 예술의 새로운 차원을 경험하세요.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto text-xs uppercase tracking-wider px-6 lg:px-8 py-3 lg:py-4 h-auto">
                  <TranslatedContent textKey="bookVisit" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs uppercase tracking-wider px-6 lg:px-8 py-3 lg:py-4 h-auto">
                  <TranslatedContent textKey="virtualTour" />
                </Button>
              </div>
            </div>            {/* Gallery Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-3 md:space-y-4">
                <Image
                  src="/placeholder.svg?height=400&width=300"
                  alt="Art exhibition piece"
                  width={300}
                  height={400}
                  className="w-full h-auto object-cover rounded hover:scale-105 transition-transform duration-300"
                />
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  alt="Art gallery interior"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover rounded hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="lg:col-span-2">
                <Image
                  src="/placeholder.svg?height=500&width=600"
                  alt="Featured artwork"
                  width={600}
                  height={500}
                  className="w-full h-full object-cover rounded hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Stats - Mobile optimized */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 pt-4">
              <div className="text-center p-3 md:p-4 border border-border/50 rounded hover:border-border transition-colors">
                <div className="text-xl md:text-2xl lg:text-3xl font-light">500+</div>
                <div className="text-xs md:text-sm uppercase opacity-60 mt-1">작품</div>
              </div>
              <div className="text-center p-3 md:p-4 border border-border/50 rounded hover:border-border transition-colors">
                <div className="text-xl md:text-2xl lg:text-3xl font-light">100+</div>
                <div className="text-xs md:text-sm uppercase opacity-60 mt-1">아티스트</div>
              </div>
              <div className="text-center p-3 md:p-4 border border-border/50 rounded hover:border-border transition-colors">
                <div className="text-xl md:text-2xl lg:text-3xl font-light">20+</div>
                <div className="text-xs md:text-sm uppercase opacity-60 mt-1">전시회</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Exhibitions */}
      <section className="border-t border-border/20">
        <div className="container mx-auto px-4 py-8 md:py-16 lg:py-24">
          <div className="space-y-6 md:space-y-8 lg:space-y-12">
            <div className="space-y-3 md:space-y-4 text-center lg:text-left">
              <p className="text-xs uppercase tracking-wider opacity-60">
                <TranslatedContent textKey="ourExhibitions" />
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal uppercase">
                <TranslatedContent textKey="discoverArtistic" />
              </h2>
            </div>            {/* Exhibition Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                "ephemeralBeauty", "soulscapeAbstract", "lovableEarth", 
                "explorationRealities", "globalFolkArts", "infinitePerspectives"
              ].map((title, index) => (
                <div key={index} className="relative group overflow-hidden rounded border border-border/20 hover:border-border transition-all duration-300">
                  <Image
                    src="/placeholder.svg?height=400&width=300"
                    alt={`Exhibition ${index + 1}`}
                    width={300}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {index === 0 && (
                      <div className="text-xs uppercase tracking-wider opacity-80 mb-2">Featured Exhibition</div>
                    )}
                    <h3 className="text-sm md:text-lg xl:text-xl uppercase font-light mb-2">
                      <TranslatedContent textKey={title} />
                    </h3>
                    <p className="text-xs opacity-80 mb-3 md:mb-4">2024년 12월 - 2025년 2월</p>
                    <Button size="sm" variant="secondary" className="text-xs uppercase tracking-wider px-3 py-2 h-auto">
                      자세히 보기
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button - Mobile centered */}
            <div className="text-center lg:text-left">
              <Link href="/exhibitions">
                <Button variant="outline" className="text-xs uppercase tracking-wider px-6 py-3 h-auto">
                  모든 전시 보기 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>      {/* Mission Section */}
      <section className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-8 md:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-center">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <p className="text-xs uppercase tracking-wider opacity-80">
                  <TranslatedContent textKey="ourMission" />
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-calligraphy uppercase leading-tight text-multilingual">
                  <TranslatedContent textKey="experienceArt" />
                  <br />
                  <TranslatedContent textKey="boundaries" />
                </h2>
              </div>
              <p className="text-sm md:text-lg leading-relaxed opacity-90 font-artwork text-multilingual">
                <CalligraphyText>正法</CalligraphyText>의 계승을 통해 동양 서예의 정통성을 지키고, <CalligraphyText>創新</CalligraphyText>의 정신으로 현대에 새롭게 전하는 것이 저희의 사명입니다. 
                붓 끝에서 흘러나오는 먹의 농담은 단순한 글자가 아닌, 천년의 법맥과 현대의 창신이 어우러진 예술입니다.
              </p>
              <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-2xl md:text-3xl font-light">28년</div>
                  <div className="text-xs md:text-sm uppercase tracking-wider opacity-80">역사와 전통</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl md:text-3xl font-light">1997</div>
                  <div className="text-xs md:text-sm uppercase tracking-wider opacity-80">설립년도</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 md:pt-6">
                <MapPin className="h-4 w-4 opacity-80 flex-shrink-0" />
                <span className="text-xs md:text-sm opacity-80">서울특별시 중구 인사동길 12번지</span>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="aspect-[4/5] lg:aspect-[4/5] rounded overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=480"
                  alt="Traditional calligraphy"
                  width={480}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 lg:-bottom-6 lg:-right-6 w-16 h-16 lg:w-32 lg:h-32 bg-background/10 rounded"></div>
            </div>
          </div>
        </div>
      </section>      {/* Newsletter Section */}
      <section className="border-t border-border/20">
        <div className="container mx-auto px-4 py-8 md:py-16 lg:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <p className="text-xs uppercase tracking-wider opacity-60">
                  <TranslatedContent textKey="newsletter" />
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal uppercase">
                  <TranslatedContent textKey="subscribeNewsletter" />
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  최신 전시회 소식과 동양 예술 관련 정보를 가장 먼저 받아보세요.
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-3 md:space-y-4">
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  className="w-full px-4 py-3 md:py-4 border border-border bg-transparent text-sm md:text-base focus:outline-none focus:border-foreground rounded"
                />
                <Button className="w-full text-xs uppercase tracking-wider px-6 py-3 md:py-4 h-auto">
                  <TranslatedContent textKey="subscribe" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}