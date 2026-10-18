'use client'

import { useEffect, type RefObject } from 'react'

export type NameOrder = 'family-first' | 'given-first'

const ROW = '.cl-formFieldRow__name'
const GIVEN = '.cl-formField__firstName'
const FAMILY = '.cl-formField__lastName'

// Clerk 는 이름(firstName)→성(lastName) 순서로만 그린다.
// CSS 로 뒤집으면 Tab 순서가 화면과 어긋나므로 두 칸의 DOM 순서 자체를 맞춘다.
// 순서가 이미 맞으면 건드리지 않아 관찰자가 자기 변경에 다시 반응해도 멈춘다.
function applyOrder(root: HTMLElement, order: NameOrder) {
  const row = root.querySelector(ROW)
  const given = row?.querySelector(`:scope > ${GIVEN}`)
  const family = row?.querySelector(`:scope > ${FAMILY}`)
  if (!row || !given || !family) return

  const [first, second] = order === 'family-first' ? [family, given] : [given, family]
  const inOrder = first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
  if (!inOrder) row.insertBefore(first, second)
}

export function useNameFieldOrder(rootRef: RefObject<HTMLElement | null>, order: NameOrder) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    applyOrder(root, order)
    // Clerk 위젯은 비동기로 그려지고 단계마다 다시 그려진다.
    const observer = new MutationObserver(() => applyOrder(root, order))
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [rootRef, order])
}
