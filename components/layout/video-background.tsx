'use client'

import { useRef } from 'react'

export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-[-1] select-none pointer-events-none overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full">
         <iframe 
           src="https://player.vimeo.com/video/51843128?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1" 
           className="absolute top-1/2 left-1/2 w-[177.77vh] min-w-full min-h-[56.25vw] h-[56.25vw] -translate-x-1/2 -translate-y-1/2"
           frameBorder="0" 
           allow="autoplay; fullscreen; picture-in-picture" 
           allowFullScreen
         />
      </div>
      
      {/* Subtle patterns and overlays for readability */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/patterns/korean-pattern.png')] bg-repeat" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-white/10 dark:bg-black/30 mix-blend-overlay pointer-events-none" />
      
      {/* Additional global overlay to ensure text readability on all pages by default */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" />
    </div>
  )
}
