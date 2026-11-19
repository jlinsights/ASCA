'use client'

import { useEffect } from 'react'

const TARGET = '[data-reveal]:not(.is-shown)'

/**
 * 스크롤 나타남. 스크립트가 붙은 뒤에만 .ab[data-motion=on] 으로 [data-reveal] 을 숨겼다가
 * 화면에 들어오면 is-shown 을 단다 — 스크립트가 없거나 움직임 줄이기를 켜면 처음부터 보인다.
 * 언어를 바꿔 새로 그려진 행도 MutationObserver 로 마저 지켜본다.
 */
export function AboutMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.ab')
    if (!root || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-shown')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )
    const watch = () => root.querySelectorAll(TARGET).forEach(target => io.observe(target))
    const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(watch)

    root.dataset.motion = 'on'
    watch()
    mo?.observe(root, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo?.disconnect()
      delete root.dataset.motion
      root.querySelectorAll('.is-shown').forEach(target => target.classList.remove('is-shown'))
    }
  }, [])

  return null
}
