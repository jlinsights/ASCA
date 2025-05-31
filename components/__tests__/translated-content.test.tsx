import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TranslatedContent } from '../translated-content'
import { LanguageProvider } from '@/contexts/language-context'

// LanguageProvider로 감싸는 헬퍼 함수
const renderWithLanguageProvider = (component: React.ReactElement, language = 'ko') => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('TranslatedContent', () => {
  it('한국어 텍스트를 올바르게 렌더링한다', () => {
    renderWithLanguageProvider(<TranslatedContent textKey="exhibition" />)
    
    expect(screen.getByText('전시회')).toBeInTheDocument()
  })

  it('존재하지 않는 키에 대해 키 자체를 반환한다', () => {
    renderWithLanguageProvider(<TranslatedContent textKey="nonexistent-key" />)
    
    expect(screen.getByText('nonexistent-key')).toBeInTheDocument()
  })

  it('빈 textKey에 대해 빈 문자열을 렌더링한다', () => {
    const { container } = renderWithLanguageProvider(<TranslatedContent textKey="" />)
    
    expect(container.firstChild?.textContent).toBe('')
  })
}) 