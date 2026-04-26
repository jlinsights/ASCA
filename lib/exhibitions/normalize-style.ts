import type { CalligraphyStyle } from '@/lib/types/exhibition-legacy'

const STYLE_MAP: Record<string, CalligraphyStyle> = {
  // 한글 라벨
  '전서': 'zhuan', '예서': 'li', '해서': 'kai',
  '행서': 'xing', '초서': 'cao', '한글': 'hangul',
  '혼합': 'mixed',
  // 한자 라벨
  '篆書': 'zhuan', '隷書': 'li', '楷書': 'kai',
  '行書': 'xing', '草書': 'cao',
  // 영문 (소문자 키로 lookup)
  'zhuan': 'zhuan', 'li': 'li', 'kai': 'kai',
  'xing': 'xing', 'cao': 'cao', 'hangul': 'hangul', 'mixed': 'mixed',
}

export function normalizeCalligraphyStyle(
  raw: string | null | undefined
): CalligraphyStyle | null {
  if (!raw) return null
  const trimmed = raw.trim()
  return STYLE_MAP[trimmed] ?? STYLE_MAP[trimmed.toLowerCase()] ?? null
}
