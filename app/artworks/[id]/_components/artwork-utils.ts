const HANGEUL_FONTS = ['궁채', '판본체', '고체', '흘림체', '민체']
const HANJA_FONTS = ['해서', '행서', '예서', '전서', '초서', '행초서']
const CALLIGRAPHY_CATEGORIES = ['한글서예', '한자서예', '현대서예']
const VALID_PAPER_SIZES = ['반절지(35×135cm)', '전지(70×135cm)', '국전지(70×200cm)', '기타']

export function formatPrice(price: number, currency: string): string {
  if (currency === 'KRW') {
    return `₩${price.toLocaleString()}`
  }
  return `$${price.toLocaleString()}`
}

export function getCategoryLabel(category: string): string {
  return category
}

export function getStyleLabel(style: string): string {
  return style
}

export function isValidFont(category: string, style: string, font?: string): boolean {
  if (!font) return true
  if (style === '전통') {
    if (category === '한글서예') return HANGEUL_FONTS.includes(font)
    if (category === '한자서예') return HANJA_FONTS.includes(font)
  }
  return false
}

export function isValidPaperSize(category: string, paperSize?: string): boolean {
  if (!paperSize) return true
  if (CALLIGRAPHY_CATEGORIES.includes(category)) {
    return VALID_PAPER_SIZES.includes(paperSize)
  }
  return false
}

const PAPER_SIZE_DESCRIPTIONS: Record<string, string> = {
  '반절지(35×135cm)': '전통 서예에서 가장 많이 사용되는 기본 규격',
  '전지(70×135cm)': '반절지의 2배 크기로 대작에 사용되는 규격',
  '국전지(70×200cm)': '국전 및 대형 전시회에서 사용되는 특대 규격 (70×200cm)',
  기타: '작가가 특별히 선택한 맞춤 규격',
}

export function getPaperSizeDescription(paperSize: string): string {
  return PAPER_SIZE_DESCRIPTIONS[paperSize] || ''
}
