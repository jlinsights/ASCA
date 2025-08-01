'use client'

import { HeaderSimple } from "@/components/header-simple"
import { FooterSimple } from "@/components/footer-simple"

export default function TestPage() {
  return (
    <>
      <HeaderSimple />
      <main className="gallery-container py-16">
        <div className="gallery-card p-8">
          <h1 className="font-calligraphy text-4xl mb-4">테스트 페이지</h1>
          <p className="text-ink-black">Enhanced Gallery CSS가 정상적으로 작동하는지 확인합니다.</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="gallery-card gallery-card-elevated">
              <div className="p-6">
                <h3 className="font-calligraphy text-xl text-celadon-green mb-2">Card 1</h3>
                <p className="text-stone-gray">Enhanced card styling test</p>
                <button className="gallery-btn gallery-btn-default gallery-btn-md mt-4">
                  Test Button
                </button>
              </div>
            </div>
            
            <div className="gallery-card gallery-card-glass">
              <div className="p-6">
                <h3 className="font-calligraphy text-xl text-temple-gold mb-2">Card 2</h3>
                <p className="text-stone-gray">Glass effect card test</p>
                <button className="gallery-btn gallery-btn-outline gallery-btn-md mt-4">
                  Outline Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSimple />
    </>
  )
}