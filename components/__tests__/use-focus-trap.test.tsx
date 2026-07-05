/**
 * useFocusTrap 동작 테스트 — asca-a11y-cleanup (design §3 FR-04)
 *
 * 케이스: ① Tab/Shift+Tab 순환 ② Escape → onEscape ③ 비활성화 시 트리거로 포커스 복귀
 */
import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { useFocusTrap } from '@/hooks/use-focus-trap'

function TrapHarness({ onEscape }: { onEscape?: () => void }) {
  const [open, setOpen] = useState(false)
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: () => {
      onEscape?.()
      setOpen(false)
    },
  })

  return (
    <div>
      <button type='button' onClick={() => setOpen(true)}>
        Open modal
      </button>
      {open && (
        <div ref={trapRef} tabIndex={-1} role='dialog' aria-modal='true' aria-label='Test modal'>
          <button type='button'>First</button>
          <button type='button'>Middle</button>
          <button type='button'>Last</button>
        </div>
      )}
    </div>
  )
}

describe('useFocusTrap', () => {
  it('활성화 시 첫 focusable로 포커스를 이동하고 Tab/Shift+Tab이 컨테이너 안에서 순환한다', () => {
    render(<TrapHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Open modal' }))

    const first = screen.getByRole('button', { name: 'First' })
    const last = screen.getByRole('button', { name: 'Last' })

    expect(first).toHaveFocus()

    // 마지막 요소에서 Tab → 첫 요소로 순환
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()

    // 첫 요소에서 Shift+Tab → 마지막 요소로 순환
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })

  it('Escape 입력 시 onEscape를 호출한다', () => {
    const onEscape = jest.fn()
    render(<TrapHarness onEscape={onEscape} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open modal' }))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('트랩 해제 시 이전에 포커스됐던 트리거 요소로 포커스를 복귀한다', () => {
    render(<TrapHarness />)
    const trigger = screen.getByRole('button', { name: 'Open modal' })

    trigger.focus()
    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
