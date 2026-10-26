'use client'

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'

interface AboutMarqueeProps {
  names: string[]
  /** 멈춤 단추 이름에 붙는 띠 이름 */
  label: string
}

/**
 * 옆으로 흐르는 이름 띠. 같은 목록을 두 번 이어 끊김 없이 돈다.
 * 이름은 모두 아래 목록에 다시 나오므로 띠는 화면 읽기에서 빼고, 멈춤 단추만 남긴다(WCAG 2.2.2).
 */
export function AboutMarquee({ names, label }: AboutMarqueeProps) {
  const [paused, setPaused] = useState(false)
  const loop = [...names, ...names]

  return (
    <div className='ab-marquee' data-paused={paused || undefined}>
      <ul className='ab-marquee__track' aria-hidden='true'>
        {loop.map((name, index) => (
          <li key={`${index}-${name}`} className='ab-marquee__item'>
            {name}
          </li>
        ))}
      </ul>
      <button
        type='button'
        className='ab-marquee__toggle'
        aria-pressed={paused}
        onClick={() => setPaused(value => !value)}
      >
        {paused ? <Play aria-hidden='true' /> : <Pause aria-hidden='true' />}
        <span>{paused ? `${label} 다시 흐르기` : `${label} 멈추기`}</span>
      </button>
    </div>
  )
}
