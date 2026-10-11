'use client'

import { useRef } from 'react'

export function VideoBackground() {
  return (
    // 바탕은 영상이 아직 안 떴거나 막혔을 때(중국 등 Vimeo 차단 지역, 사내망) 보이는 색이다.
    // 영상 자체가 밝은 한지 톤이라 검정 대신 페이지 바탕색을 깔아야 남색 글씨가 읽힌다.
    <div className='fixed inset-0 z-[-1] select-none pointer-events-none overflow-hidden bg-background'>
      <div className='absolute inset-0 w-full h-full'>
        <iframe
          src='https://player.vimeo.com/video/51843128?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1'
          className='absolute top-1/2 left-1/2 w-[177.77vh] min-w-full min-h-[56.25vw] h-[56.25vw] -translate-x-1/2 -translate-y-1/2'
          frameBorder='0'
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
        />
      </div>

      {/* Overlays for readability */}
      <div className='absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none' />
      <div className='absolute inset-0 bg-white/10 dark:bg-black/30 mix-blend-overlay pointer-events-none' />

      {/* Additional global overlay to ensure text readability on all pages by default */}
      <div className='absolute inset-0 bg-background/30 backdrop-blur-[1px]' />
    </div>
  )
}
