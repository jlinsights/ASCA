'use client'

export default function CSSTest() {
  return (
    <div className="min-h-screen bg-rice-paper">
      <div className="gallery-container py-16">
        <h1 className="text-4xl font-calligraphy text-ink-black mb-8">CSS 테스트</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Color Test</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="w-20 h-20 bg-ink-black rounded-lg flex items-center justify-center">
              <span className="text-rice-paper text-xs">ink-black</span>
            </div>
            <div className="w-20 h-20 bg-rice-paper border rounded-lg flex items-center justify-center">
              <span className="text-ink-black text-xs">rice-paper</span>
            </div>
            <div className="w-20 h-20 bg-celadon-green rounded-lg flex items-center justify-center">
              <span className="text-rice-paper text-xs">celadon</span>
            </div>
            <div className="w-20 h-20 bg-temple-gold rounded-lg flex items-center justify-center">
              <span className="text-rice-paper text-xs">temple-gold</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Gallery Components Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="gallery-card gallery-card-elevated p-6">
              <h3 className="font-calligraphy text-xl text-celadon-green mb-4">Enhanced Card</h3>
              <p className="text-stone-gray mb-4">This should show elevated card styling</p>
              <button className="gallery-btn gallery-btn-default gallery-btn-md">
                Default Button
              </button>
            </div>
            
            <div className="gallery-card gallery-card-glass p-6">
              <h3 className="font-calligraphy text-xl text-temple-gold mb-4">Glass Card</h3>
              <p className="text-stone-gray mb-4">This should show glass effect</p>
              <button className="gallery-btn gallery-btn-outline gallery-btn-md">
                Outline Button
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Typography Test</h2>
          <p className="font-calligraphy text-2xl text-ink-black mb-2">서예체 테스트</p>
          <p className="font-serif text-lg text-stone-gray mb-2">Serif font test</p>
          <p className="font-sans text-base text-ink-black">Sans font test</p>
        </div>
      </div>
    </div>
  )
}