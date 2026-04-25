#!/usr/bin/env tsx
/**
 * design-lint: WCAG 2.1 contrast verification for hard-fail pairs.
 *
 * AA 4.5:1 (normal text) / 3:1 (large text). Decorative-only colors are excluded
 * (Obang / Seasonal / Calligraphy / Brand-Extended) — see DESIGN.md §3.6.
 *
 * Run: `npm run design:wcag` or `npx tsx scripts/design-lint.ts`.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DESIGN_PATH = resolve(__dirname, '../docs/02-design/DESIGN.md')

const fmBody = readFileSync(DESIGN_PATH, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1]
if (!fmBody) {
  console.error('design-lint: DESIGN.md front matter not found')
  process.exit(1)
}
interface DesignSystem {
  colors?: Record<string, string>
}
const design = parseYaml(fmBody) as DesignSystem
if (!design.colors) {
  console.error('design-lint: DESIGN.md has no colors section')
  process.exit(1)
}
const colors = design.colors

function resolveValue(value: string, depth = 0): string {
  if (depth > 5) return value
  // var(--name) — recursively resolve via design.colors lookup
  const m = value.match(/^var\(--([\w-]+)\)$/)
  const refKey = m?.[1]
  if (!refKey) return value
  const ref = colors[refKey]
  return ref ? resolveValue(ref, depth + 1) : value
}

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(h)) return null
  const expanded =
    h.length === 3
      ? h
          .split('')
          .map(c => c + c)
          .join('')
      : h
  const n = parseInt(expanded, 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const norm = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b)
}

function contrastRatio(fgHex: string, bgHex: string): number | null {
  const fg = hexToRgb(fgHex)
  const bg = hexToRgb(bgHex)
  if (!fg || !bg) return null
  const fgL = relativeLuminance(fg)
  const bgL = relativeLuminance(bg)
  const [light, dark] = fgL > bgL ? [fgL, bgL] : [bgL, fgL]
  return (light + 0.05) / (dark + 0.05)
}

interface Pair {
  id: string
  fg: string
  bg: string
  min: number
  size: 'normal' | 'large'
}

const PAIRS: Pair[] = [
  { id: 'P1', fg: 'foreground', bg: 'background', min: 4.5, size: 'normal' },
  { id: 'P2', fg: 'primary-foreground', bg: 'primary', min: 4.5, size: 'normal' },
  { id: 'P3', fg: 'secondary-foreground', bg: 'secondary', min: 4.5, size: 'normal' },
  { id: 'P4', fg: 'accent-foreground', bg: 'accent', min: 4.5, size: 'normal' },
  { id: 'P5', fg: 'highlight-foreground', bg: 'highlight', min: 4.5, size: 'normal' },
  { id: 'P6', fg: 'destructive-foreground', bg: 'destructive', min: 4.5, size: 'normal' },
  { id: 'P7', fg: 'muted-foreground', bg: 'muted', min: 4.5, size: 'normal' },
  { id: 'P8', fg: 'foreground', bg: 'card', min: 4.5, size: 'normal' },
  { id: 'P9', fg: 'foreground', bg: 'card', min: 4.5, size: 'normal' }, // popover shares card surface
  { id: 'L1', fg: 'foreground', bg: 'background', min: 3.0, size: 'large' },
  { id: 'L2', fg: 'primary-foreground', bg: 'primary', min: 3.0, size: 'large' },
]

interface Result extends Pair {
  status: 'PASS' | 'FAIL' | 'MISSING' | 'UNRESOLVED'
  ratio: number
  fgHex?: string
  bgHex?: string
}

const results: Result[] = PAIRS.map(p => {
  const fgRaw = colors[p.fg]
  const bgRaw = colors[p.bg]
  if (!fgRaw || !bgRaw) {
    return { ...p, status: 'MISSING', ratio: 0 }
  }
  const fgHex = resolveValue(fgRaw)
  const bgHex = resolveValue(bgRaw)
  if (!fgHex.startsWith('#') || !bgHex.startsWith('#')) {
    return { ...p, status: 'UNRESOLVED', ratio: 0, fgHex, bgHex }
  }
  const r = contrastRatio(fgHex, bgHex)
  if (r === null) {
    return { ...p, status: 'UNRESOLVED', ratio: 0, fgHex, bgHex }
  }
  return {
    ...p,
    status: r >= p.min ? 'PASS' : 'FAIL',
    ratio: r,
    fgHex,
    bgHex,
  }
})

const fails = results.filter(r => r.status !== 'PASS')

console.log('WCAG 2.1 Contrast Lint Report')
console.log('─'.repeat(82))
for (const r of results) {
  const icon = r.status === 'PASS' ? '✓' : '✗'
  const ratioStr = r.ratio > 0 ? r.ratio.toFixed(2) : '   - '
  const sizeLbl = r.size === 'large' ? 'large' : 'norm '
  console.log(
    `  ${icon} ${r.id} ${r.fg.padEnd(22)} on ${r.bg.padEnd(15)} ${ratioStr.padStart(6)}:1  (≥${r.min}, ${sizeLbl}) ${r.status}`
  )
}
console.log('─'.repeat(82))
console.log(
  `Total: ${results.length}, Pass: ${results.length - fails.length}, Fail: ${fails.length}`
)

if (fails.length > 0) {
  console.error('\n✗ design-wcag FAILED — see DESIGN.md §3.6 Color Pair Policy for context.')
  for (const f of fails) {
    console.error(
      `  ${f.id} ${f.fg} on ${f.bg}: ${f.fgHex ?? '?'} vs ${f.bgHex ?? '?'} (status=${f.status}, ratio=${f.ratio.toFixed(2)})`
    )
  }
  process.exit(1)
}
console.log('\n✓ All hard-fail pairs pass WCAG AA.')
