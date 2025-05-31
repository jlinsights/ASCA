'use client'

import React, { useEffect, useRef } from 'react'

interface CalligraphyTextProps {
  children: React.ReactNode
  className?: string
}

// 한자 유니코드 범위 확인 함수
const isCJKCharacter = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return (
    (code >= 0x4E00 && code <= 0x9FFF) || // CJK 통합 한자
    (code >= 0x3400 && code <= 0x4DBF) || // CJK 확장 A
    (code >= 0x20000 && code <= 0x2A6DF) // CJK 확장 B
  )
}

// 특정 한자에 대한 폰트 매핑 - Noto CJK 사용
const getOptimalFont = (char: string): string => {
  const charCode = char.charCodeAt(0)
  
  // 정법(正法), 창신(創新) 등 주요 한자
  const importantChars = ['正', '法', '創', '新', '계', '승', '발', '전', '조', '화']
  
  if (importantChars.includes(char)) {
    return 'Noto Serif KR, Noto Serif SC'
  }
  
  // 일반 CJK 한자
  if (isCJKCharacter(char)) {
    return 'ASCA-Calligraphy, Noto Serif KR, Noto Serif SC'
  }
  
  // 한글
  if ((charCode >= 0xAC00 && charCode <= 0xD7AF) || 
      (charCode >= 0x1100 && charCode <= 0x11FF) || 
      (charCode >= 0x3130 && charCode <= 0x318F)) {
    return 'Noto Serif KR'
  }
  
  return 'inherit'
}

export default function CalligraphyText({ children, className = '' }: CalligraphyTextProps) {
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!textRef.current) return

    const processTextNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent
        const fragment = document.createDocumentFragment()
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          const span = document.createElement('span')
          span.textContent = char
          
          const optimalFont = getOptimalFont(char)
          if (optimalFont !== 'inherit') {
            span.style.fontFamily = optimalFont
            span.style.fontWeight = '500'
          }
          
          fragment.appendChild(span)
        }
        
        node.parentNode?.replaceChild(fragment, node)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 자식 노드들을 처리
        const children = Array.from(node.childNodes)
        children.forEach(processTextNode)
      }
    }

    processTextNode(textRef.current)
  }, [children])

  return (
    <span ref={textRef} className={`font-calligraphy ${className}`}>
      {children}
    </span>
  )
} 