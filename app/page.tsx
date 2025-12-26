import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowRight, Image as ImageIcon, BookOpen } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사단법인 동양서예협회',
  description: '전통 서예의 정법을 계승하고 현대적 창신을 통해 동양서예의 새로운 미래를 열어갑니다.',
  openGraph: {
    title: '사단법인 동양서예협회',
    description: '동양서예협회 공식 홈페이지. 갤러리와 블로그를 통해 협회의 다양한 활동을 만나보세요.',
    images: ['/logo/Logo & Tagline_white BG.png'],
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-5">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/korean-pattern.png')] bg-repeat opacity-20" /> 
           {/* Fallback pattern if image is missing, or CSS gradient */}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-stone-50 to-stone-100 dark:from-background dark:via-stone-900 dark:to-stone-950" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Logo Section */}
          <div className="mb-12 animate-fade-in-up">
            <div className="relative w-64 h-24 md:w-80 md:h-32 mx-auto mb-8">
              <Image
                src="/logo/Logo & Tagline_white BG.png"
                alt="동양서예협회"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-3xl font-light text-foreground mb-4 tracking-wide font-serif">
              正法의 계승, 創新의 조화
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              동양서예협회에 오신 것을 환영합니다.<br className="hidden md:block"/>
              우리는 전통과 현대가 어우러지는 서예 문화를 만들어갑니다.
            </p>


          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            {/* Gallery Card */}
            <Link href="/gallery" className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full p-8 md:p-12 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">갤러리</h2>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Gallery</h3>
                <p className="text-muted-foreground mb-8 line-clamp-2">
                  협회의 다양한 활동과 작품들을 고화질로 감상하세요.
                </p>
                <div className="mt-auto flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                  입장하기 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            {/* Blog (News) Card */}
            <Link href="/blog" className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full p-8 md:p-12 flex flex-col items-center text-center">
                 <div className="p-4 rounded-full bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">블로그</h2>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Blog & News</h3>
                <p className="text-muted-foreground mb-8 line-clamp-2">
                  동양서예협회의 최신 소식과 이야기를 만나보세요.
                </p>
                <div className="mt-auto flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                  구독하기 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}