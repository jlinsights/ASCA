'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

interface UseFocusTrapOptions {
  /** 트랩 활성 여부 — 모달 열림 상태와 연결 */
  active: boolean
  /** Escape 키 입력 시 호출 (보통 모달 닫기) */
  onEscape?: () => void
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * 모달/라이트박스용 포커스 트랩 훅.
 *
 * active 동안: 최초 포커스를 컨테이너 내부로 이동, Tab/Shift+Tab을 컨테이너 안에서 순환,
 * Escape에 onEscape 호출. 비활성화/언마운트 시 이전 포커스 요소로 복귀한다.
 *
 * 반환된 ref를 트랩 대상 컨테이너에 연결한다. 내부에 포커스 가능한 요소가 없을 때를
 * 대비해 컨테이너에 `tabIndex={-1}`을 함께 지정하는 것을 권장한다.
 */
export function useFocusTrap<T extends HTMLElement>({
  active,
  onEscape,
}: UseFocusTrapOptions): RefObject<T | null> {
  const containerRef = useRef<T | null>(null)
  const onEscapeRef = useRef(onEscape)
  onEscapeRef.current = onEscape

  useEffect(() => {
    if (!active) return undefined

    const container = containerRef.current
    if (!container) return undefined

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onEscapeRef.current?.()
        return
      }

      if (e.key !== 'Tab') return

      const focusables = getFocusable()
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      const current = document.activeElement

      if (e.shiftKey) {
        if (current === first || !container.contains(current)) {
          e.preventDefault()
          last.focus()
        }
      } else if (current === last || !container.contains(current)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    const initialTarget = getFocusable()[0] ?? container
    initialTarget.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      previouslyFocused?.focus()
    }
  }, [active])

  return containerRef
}
