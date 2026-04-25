#!/usr/bin/env tsx
/**
 * design-diff: DESIGN.md ↔ tailwind.config.ts 양방향 검증
 *
 * - DESIGN.md front matter colors (literal hex만) → tailwind.config.ts에 존재 + 동일 hex
 * - tailwind.config.ts literal hex top-level → DESIGN.md에 존재
 *
 * Exit 1 on any drift, exit 0 if all literal color tokens in sync.
 *
 * Run: `npm run design:diff` (defined in package.json) or `npx tsx scripts/design-diff.ts`.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'
import tailwindConfig from '../tailwind.config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DESIGN_PATH = resolve(__dirname, '../docs/02-design/DESIGN.md')

const source = readFileSync(DESIGN_PATH, 'utf8')
const fmMatch = source.match(/^---\n([\s\S]*?)\n---/)
const fmBody = fmMatch?.[1]
if (!fmBody) {
  console.error('design-diff: DESIGN.md front matter not found')
  process.exit(1)
}

interface DesignSystem {
  colors?: Record<string, string>
}
const design = parseYaml(fmBody) as DesignSystem
if (!design.colors) {
  console.error('design-diff: DESIGN.md has no colors section')
  process.exit(1)
}

// Flatten tailwind.config.ts theme.extend.colors
// - kebab-case literal: top-level string ('ink-black': '#1a1a1a') → flattened['ink-black'] = '#1a1a1a'
// - shadcn semantic with foreground: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' }
//     → flattened['primary'] = 'var(--primary)', flattened['primary-foreground'] = 'var(--primary-foreground)'
const tailwindColors =
  // tailwind.config exports a Config; theme.extend.colors is object
  (
    tailwindConfig as unknown as {
      theme?: { extend?: { colors?: Record<string, unknown> } }
    }
  ).theme?.extend?.colors ?? {}

const flattened: Record<string, string> = {}
for (const [key, val] of Object.entries(tailwindColors)) {
  if (typeof val === 'string') {
    flattened[key] = val
  } else if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>
    if (typeof obj.DEFAULT === 'string') flattened[key] = obj.DEFAULT
    if (typeof obj.foreground === 'string') flattened[`${key}-foreground`] = obj.foreground
  }
}

const errors: string[] = []
let literalChecked = 0

// DESIGN → tailwind (literal hex only)
for (const [name, value] of Object.entries(design.colors)) {
  if (typeof value !== 'string' || !value.startsWith('#')) continue // skip non-literals
  literalChecked++
  const tw = flattened[name]
  if (!tw) {
    errors.push(
      `[missing in tailwind] DESIGN.md.${name} = ${value} (no matching key in tailwind.config.ts)`
    )
    continue
  }
  if (tw.startsWith('var(')) {
    // tailwind references CSS var → not directly comparable; trust globals.css mapping
    continue
  }
  if (tw.toLowerCase() !== value.toLowerCase()) {
    errors.push(`[mismatch] ${name}: DESIGN.md=${value} vs tailwind=${tw}`)
  }
}

// Tailwind → DESIGN (literal hex only)
for (const [name, value] of Object.entries(flattened)) {
  if (typeof value !== 'string' || !value.startsWith('#')) continue
  if (!(name in design.colors)) {
    errors.push(`[missing in DESIGN.md] tailwind.${name} = ${value}`)
  }
}

if (errors.length > 0) {
  console.error(`✗ design-diff FAILED (${errors.length} issue${errors.length === 1 ? '' : 's'}):`)
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}

console.log(
  `✓ design-diff: ${literalChecked} literal color token${literalChecked === 1 ? '' : 's'} in sync`
)
