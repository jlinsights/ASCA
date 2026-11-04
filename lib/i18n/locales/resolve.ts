/** 언어별 최종 번역표 한 장. 키 → 화면 문구. */
export type LocaleTable = Readonly<Record<string, string>>

/**
 * 여러 표를 우선순위가 높은 것부터 받아 한 장으로 합친다.
 * 예전 t() 의 `a[key] || b[key] || …` 와 같게, 빈 문자열은 다음 표로 넘긴다.
 */
export function resolveTable(layers: ReadonlyArray<Record<string, string>>): LocaleTable {
  const table: Record<string, string> = {}
  for (const layer of [...layers].reverse()) {
    for (const [key, value] of Object.entries(layer)) {
      if (value) table[key] = value
    }
  }
  return table
}
