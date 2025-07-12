"use client"

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Image from 'next/image'

const brandColors = [
  { name: 'ASCA Black', hex: '#222222' },
  { name: 'ASCA Gold', hex: '#C9A063' },
  { name: 'ASCA Blue', hex: '#2B4C7E' },
  { name: 'ASCA White', hex: '#FFFFFF' },
]

const subBrands = [
  { name: 'ASCA Books', desc: '예술 도서 출판' },
  { name: 'ASCA Gallery', desc: '전시/아카이브' },
  { name: 'ASCA Club', desc: '멤버십/구독' },
  { name: 'ASCA Shop', desc: '아트상품/굿즈' },
]

export default function BrandPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* 히어로 섹션 */}
        <section className="py-12 text-center bg-gradient-to-r from-[#f8f5f0] to-[#e9e6e1]">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">ASCA Brand Identity Guide</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-4">동양예술의 전통과 현대를 잇는 글로벌 예술 플랫폼</p>
          <div className="flex justify-center gap-4">
            <Image src="/logo/Logo & Slogan_black BG.png" alt="ASCA Logo" width={120} height={40} />
            <Image src="/logo/Logo & Slogan_white BG.png" alt="ASCA Logo White" width={120} height={40} />
          </div>
        </section>

        {/* Tab UI */}
        <section className="max-w-3xl mx-auto py-10 px-4">
          <Tabs defaultValue="vision" className="w-full">
            <TabsList className="flex flex-wrap gap-2 mb-6">
              <TabsTrigger value="vision">비전/미션</TabsTrigger>
              <TabsTrigger value="logo">로고</TabsTrigger>
              <TabsTrigger value="color">컬러</TabsTrigger>
              <TabsTrigger value="typo">타이포그래피</TabsTrigger>
              <TabsTrigger value="slogan">슬로건</TabsTrigger>
              <TabsTrigger value="subbrand">서브브랜드</TabsTrigger>
              <TabsTrigger value="usage">활용 예시</TabsTrigger>
              <TabsTrigger value="download">다운로드</TabsTrigger>
              <TabsTrigger value="global">글로벌 가이드</TabsTrigger>
            </TabsList>

            <TabsContent value="vision">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">브랜드 비전 & 미션</h2>
                <p className="mb-1 font-medium">비전: <span className="text-gray-700">동양예술의 전통과 현대를 잇는, 아시아 대표 예술 플랫폼</span></p>
                <p className="mb-1 font-medium">미션: <span className="text-gray-700">서예·문인화·현대미술 등 동양예술의 가치를 출판·전시·구독·커뮤니티로 확장, 예술가와 대중이 함께 성장하는 생태계 구축</span></p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-2">브랜드 스토리</h2>
                <p className="text-gray-700 mb-2">
                  ASCA(동양서예협회)는 동양예술의 깊이와 아름다움을 현대적으로 재해석하여, 예술가와 대중이 함께 소통하고 성장하는 플랫폼을 지향합니다.<br />
                  전통 서예와 문인화, 현대미술까지 아우르며, 출판·전시·구독·커뮤니티 등 다양한 사업을 통해 예술의 일상화와 글로벌 확산을 실현합니다.
                </p>
              </section>
            </TabsContent>

            <TabsContent value="logo">
              <section>
                <h2 className="text-2xl font-semibold mb-2">로고 & 사용 가이드</h2>
                <div className="flex gap-6 flex-wrap items-center mb-4">
                  <Image src="/logo/Logo & Slogan_black BG.png" alt="ASCA Logo Black" width={180} height={60} className="rounded shadow" />
                  <Image src="/logo/Logo & Slogan_white BG.png" alt="ASCA Logo White" width={180} height={60} className="rounded shadow bg-gray-900" />
                </div>
                <ul className="list-disc ml-6 text-gray-700 text-sm">
                  <li>로고는 반드시 지정된 컬러와 비율로만 사용해야 합니다.</li>
                  <li>배경색에 따라 흑/백 버전을 선택하세요.</li>
                  <li>로고 주변에는 충분한 여백을 확보해야 합니다.</li>
                  <li>임의로 변형, 왜곡, 색상 변경 금지</li>
                </ul>
              </section>
            </TabsContent>

            <TabsContent value="color">
              <section>
                <h2 className="text-2xl font-semibold mb-2">컬러 팔레트</h2>
                <div className="flex gap-4 flex-wrap mb-4">
                  {brandColors.map((color) => (
                    <div key={color.hex} className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full border-2 border-gray-200 mb-2" style={{ background: color.hex }} />
                      <span className="font-medium text-gray-800">{color.name}</span>
                      <span className="text-xs text-gray-500">{color.hex}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">ASCA의 브랜드 컬러는 전통성과 현대성을 동시에 표현합니다.</p>
              </section>
            </TabsContent>

            <TabsContent value="typo">
              <section>
                <h2 className="text-2xl font-semibold mb-2">타이포그래피</h2>
                <ul className="list-disc ml-6 text-gray-700 text-sm mb-2">
                  <li>Noto Sans KR (한글 본문/제목)</li>
                  <li>Pretendard (웹/모바일 UI)</li>
                  <li>Inter (영문/숫자)</li>
                </ul>
                <div className="flex gap-6 flex-wrap">
                  <span className="font-sans text-2xl">가나다 ABC 123</span>
                  <span className="font-serif text-2xl">동양예술의 아름다움</span>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="slogan">
              <section>
                <h2 className="text-2xl font-semibold mb-2">슬로건 & 톤앤매너</h2>
                <p className="text-gray-700 mb-2 font-bold">“예술, 일상이 되다”</p>
                <ul className="list-disc ml-6 text-gray-700 text-sm">
                  <li>전통과 현대의 조화</li>
                  <li>열린 커뮤니티, 글로벌 지향</li>
                  <li>따뜻함과 전문성의 균형</li>
                </ul>
              </section>
            </TabsContent>

            <TabsContent value="subbrand">
              <section>
                <h2 className="text-2xl font-semibold mb-2">서브 브랜드 구조</h2>
                <div className="flex gap-6 flex-wrap mb-4">
                  {subBrands.map((sb) => (
                    <div key={sb.name} className="bg-white rounded shadow p-4 min-w-[120px] text-center">
                      <div className="font-bold text-lg mb-1">{sb.name}</div>
                      <div className="text-gray-600 text-sm">{sb.desc}</div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">각 서브 브랜드는 고유의 컬러와 로고, UX 가이드라인을 가집니다.</p>
              </section>
            </TabsContent>

            <TabsContent value="usage">
              <section>
                <h2 className="text-2xl font-semibold mb-2">활용 예시 (Do & Don’t)</h2>
                <div className="flex gap-8 flex-wrap mb-4">
                  <div className="bg-green-50 border border-green-200 rounded p-4 flex-1 min-w-[180px]">
                    <h3 className="font-bold text-green-700 mb-2">Do</h3>
                    <ul className="list-disc ml-6 text-green-800 text-sm">
                      <li>공식 로고/컬러/폰트만 사용</li>
                      <li>로고 주변 여백 확보</li>
                      <li>정해진 비율/크기 유지</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-4 flex-1 min-w-[180px]">
                    <h3 className="font-bold text-red-700 mb-2">Don’t</h3>
                    <ul className="list-disc ml-6 text-red-800 text-sm">
                      <li>로고 임의 변형/왜곡/색상 변경</li>
                      <li>비공식 폰트/컬러 사용</li>
                      <li>로고 위에 텍스트/이미지 겹치기</li>
                    </ul>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="download">
              <section>
                <h2 className="text-2xl font-semibold mb-2">다운로드</h2>
                <ul className="list-disc ml-6 text-sm">
                  <li><a href="/logo/Logo & Slogan_black BG.png" download className="text-blue-600 underline">로고(PNG, 흑색)</a></li>
                  <li><a href="/logo/Logo & Slogan_white BG.png" download className="text-blue-600 underline">로고(PNG, 백색)</a></li>
                  <li><a href="/logo/asca-logo-black.svg" download className="text-blue-600 underline">로고(SVG, 흑색)</a></li>
                  <li><a href="/logo/asca-logo-white.svg" download className="text-blue-600 underline">로고(SVG, 백색)</a></li>
                  <li><a href="/logo/asca-logo.ai" download className="text-blue-600 underline">로고(AI, 벡터)</a></li>
                  <li><a href="/logo/asca-logo.pdf" download className="text-blue-600 underline">로고(PDF, 벡터)</a></li>
                  <li><a href="/fonts/font-face.css" download className="text-blue-600 underline">폰트 CSS</a></li>
                  <li><a href="/brand/asca-brand-guide.pdf" download className="text-blue-600 underline">브랜드 가이드(PDF)</a></li>
                  <li><a href="/brand/asca-brand-guide.pptx" download className="text-blue-600 underline">브랜드 가이드(PPTX)</a></li>
                  <li><a href="/brand/asca-design-mockup.fig" download className="text-blue-600 underline">디자인 시안(Figma)</a></li>
                  <li><a href="/brand/asca-design-mockup.png" download className="text-blue-600 underline">디자인 시안(PNG)</a></li>
                </ul>
              </section>
            </TabsContent>

            <TabsContent value="global">
              <section>
                <h2 className="text-2xl font-semibold mb-2">글로벌 가이드 & 다국어 전략</h2>
                <ul className="list-disc ml-6 text-gray-700 text-sm mb-2">
                  <li>한국어, 영어, 중국어, 일본어 등 다국어 지원(i18n)</li>
                  <li>글로벌 결제/멤버십 시스템 연동</li>
                  <li>현지화(로컬라이제이션) 및 문화적 맥락 반영</li>
                  <li>국제 아트 네트워크/파트너십 구축</li>
                  <li>글로벌 UX 가이드(모바일/PC, 접근성 등)</li>
                </ul>
                <p className="text-gray-700 text-sm">ASCA는 아시아를 넘어 글로벌 예술 플랫폼으로 성장하기 위해, 다양한 언어와 문화, 결제/멤버십/커뮤니티 시스템을 지속적으로 확장합니다.</p>
              </section>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </>
  )
}
