#!/usr/bin/env node
/**
 * 작가 대표 slug 바꾸기 — 옛 slug 는 slug_aliases 에 남겨 옛 주소(/artists/<옛 slug>)가 계속 열리게 한다.
 *
 * 사용법:
 *   node scripts/set-artist-slug.mjs --from <지금 slug> --to <새 slug>           # 미리 보기
 *   node scripts/set-artist-slug.mjs --from <지금 slug> --to <새 slug> --apply   # 백업 후 갱신
 *
 * 새 slug 가 다른 작가의 slug 나 옛 주소로 이미 쓰이면 멈춘다.
 * 갱신은 미리 본 slug·slug_aliases 가 그대로일 때만 한다 — 그 사이 바뀌었으면 아무것도 쓰지 않는다.
 *
 * 키: ASCA_SUPABASE_SERVICE_ROLE_KEY. .env.local 은 읽지 않는다 — 그 파일은 옛 프로젝트를 가리킨다.
 * 키는 화면·로그에 찍지 않는다. 터미널에서 직접 export 해서 쓰고, 대화창(!)에는 붙여 넣지 말 것.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const PROJECT_REF = 'caxjyimsuvjnbmjoxfad' // ASCA-2026
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function flag(name) {
  const i = process.argv.indexOf(name)
  return i === -1 ? undefined : process.argv[i + 1]
}

const from = flag('--from')
const to = flag('--to')
const apply = process.argv.includes('--apply')

if (!from || !to) {
  console.error('❌ --from <지금 slug> --to <새 slug> 를 모두 주세요.')
  process.exit(1)
}
if (!SLUG_PATTERN.test(to)) {
  console.error(`❌ 새 slug 는 영문 소문자·숫자·하이픈만 씁니다: ${to}`)
  process.exit(1)
}
if (from === to) {
  console.error('❌ 지금 slug 와 새 slug 가 같습니다.')
  process.exit(1)
}

const key = process.env.ASCA_SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  console.error('❌ ASCA_SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, key, { auth: { persistSession: false } })

async function findOne(column, value) {
  const query = supabase.from('artists').select('id,name,slug,slug_aliases')
  const { data, error } =
    column === 'slug'
      ? await query.eq('slug', value)
      : await query.contains('slug_aliases', [value])
  if (error) throw new Error(`작가 조회 실패: ${error.message}`)
  return data
}

function writeBackup(artist) {
  const dir = path.join(os.homedir(), 'Developer/Archive')
  fs.mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(dir, `asca-artist-slug-backup-${artist.slug}-${stamp}.json`)
  const row = { id: artist.id, slug: artist.slug, slug_aliases: artist.slug_aliases }
  fs.writeFileSync(file, JSON.stringify(row, null, 2))
  return file
}

const matches = await findOne('slug', from)
if (matches.length !== 1) {
  console.error(`❌ slug '${from}' 인 작가가 ${matches.length}명입니다. 1명이어야 합니다.`)
  process.exit(1)
}
const artist = matches[0]
const takenBySlug = (await findOne('slug', to)).filter(a => a.id !== artist.id)
const takenByAlias = (await findOne('alias', to)).filter(a => a.id !== artist.id)
if (takenBySlug.length || takenByAlias.length) {
  const who = [...takenBySlug, ...takenByAlias].map(a => `${a.name}(${a.slug})`).join(', ')
  console.error(`❌ '${to}' 는 이미 다른 작가가 씁니다: ${who}`)
  process.exit(1)
}

const oldAliases = artist.slug_aliases ?? []
const nextAliases = [...new Set([...oldAliases.filter(a => a !== to), from])]
console.log(`${artist.name}: slug '${from}' → '${to}'`)
console.log(`  옛 주소(slug_aliases): [${oldAliases.join(', ')}] → [${nextAliases.join(', ')}]`)

if (!apply) {
  console.log('\n미리 보기입니다. 바꾸려면 --apply 를 붙여 다시 실행하세요.')
  process.exit(0)
}

console.log(`\n백업: ${writeBackup(artist)}`)
const { data: updated, error } = await supabase
  .from('artists')
  .update({ slug: to, slug_aliases: nextAliases })
  .eq('id', artist.id)
  .eq('slug', from)
  .eq('slug_aliases', JSON.stringify(oldAliases).replace(/^\[/, '{').replace(/\]$/, '}'))
  .select('id,slug,slug_aliases')
if (error) {
  console.error(`❌ 갱신 실패 — ${error.message}`)
  process.exit(1)
}
if (!updated.length) {
  console.error(
    '❌ 그 사이 slug 나 옛 주소가 바뀌어 아무것도 쓰지 않았습니다. 다시 미리 보기부터 하세요.'
  )
  process.exit(1)
}
console.log(`✅ 완료: ${updated[0].slug} (옛 주소 ${updated[0].slug_aliases.join(', ')})`)
