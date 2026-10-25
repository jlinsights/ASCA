#!/usr/bin/env node
/** Import already verified Airtable originals from a PRIVATE UUID-named archive.
 * Default is read-only. --apply backs up every target before any Storage/DB write.
 * Credentials stay in the operator's terminal. No Airtable temporary URL is published.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createHash, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import {
  ARTWORK_UUID,
  stillPublicSnapshot,
  cleanupImportObject,
  guardedImageUpdate,
  planVerifiedImages,
} from './media-linking/airtable-artworks.mjs'

const PROJECT = 'caxjyimsuvjnbmjoxfad'
const URL_BASE = `https://${PROJECT}.supabase.co`
const BUCKET = 'archive-private'
const PUBLIC_IMAGE = `${URL_BASE}/functions/v1/public-artwork-image`
const runId = randomUUID()
const args = process.argv.slice(2)
const option = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const apply = args.includes('--apply')
const year = Number(option('--year') || 2025)
const source = option('--dir')
if (!source || !path.isAbsolute(source) || !Number.isInteger(year) || year < 1900 || year > 2200)
  throw Error('Use --dir <absolute private archive path> --year <year> [--apply]')
const key = process.env.ASCA_SUPABASE_SERVICE_ROLE_KEY
if (!key) throw Error('ASCA_SUPABASE_SERVICE_ROLE_KEY is required in the operator terminal')
if (key.split('.').length === 3) {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString())
  if (claims.ref !== PROJECT || claims.role !== 'service_role') throw Error('Wrong project or role')
}
const client = createClient(URL_BASE, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})
async function readAll(table, columns) {
  const rows = []
  for (let start = 0; ; start += 1000) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .order('id')
      .range(start, start + 999)
    if (error) throw Error(`Cannot read ${table}`)
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}
const entries = await fs.readdir(source, { withFileTypes: true })
// Non-recursive on purpose: review/ originals require a separate human decision.
const files = entries
  .filter(entry => entry.isFile() && /\.(?:jpe?g|png|webp|avif)$/i.test(entry.name))
  .map(entry => ({
    artworkId: path.parse(entry.name).name.toLowerCase(),
    path: path.join(source, entry.name),
  }))
if (files.some(file => !ARTWORK_UUID.test(file.artworkId)))
  throw Error('Every source filename must be a verified artwork UUID')
const [artworks, artists] = await Promise.all([
  readAll('artworks', 'id,artist_id,images,status,year_created,updated_at'),
  readAll('artists', 'id,visibility'),
])
const plan = planVerifiedImages(files, artworks, artists, year)
console.log(
  JSON.stringify({
    mode: apply ? 'apply' : 'preview',
    sources: files.length,
    ready: plan.ready.length,
    skipped: Object.fromEntries(
      [...new Set(plan.skipped.map(row => row.reason))].map(reason => [
        reason,
        plan.skipped.filter(row => row.reason === reason).length,
      ])
    ),
  })
)
if (!apply || !plan.ready.length) process.exit(0)

const health = await fetch(`${PUBLIC_IMAGE}?id=invalid`, { signal: AbortSignal.timeout(30000) })
if (health.status !== 404 || health.headers.get('x-asca-media') !== 'public-artwork-image-v1')
  throw Error('Deploy the reviewed RLS media migration and image function before --apply')
const bucket = await client.storage.getBucket(BUCKET)
if (bucket.error || bucket.data.public !== false) throw Error('Private archive bucket required')

const prepared = []
for (const row of plan.ready) {
  const bytes = await fs.readFile(row.file.path)
  const meta = await sharp(bytes).metadata()
  const formats = {
    jpeg: ['jpg', 'image/jpeg'],
    png: ['png', 'image/png'],
    webp: ['webp', 'image/webp'],
    avif: ['avif', 'image/avif'],
  }
  if (!formats[meta.format] || !meta.width || !meta.height || bytes.length > 10485760)
    throw Error('Unsupported source image; no writes performed')
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const [extension, contentType] = formats[meta.format]
  const rotated = [5, 6, 7, 8].includes(meta.orientation)
  prepared.push({
    ...row,
    sha256,
    contentType,
    width: rotated ? meta.height : meta.width,
    height: rotated ? meta.width : meta.height,
    objectPath: `published-imports/${row.artwork.id}/${runId}-${sha256.slice(0, 24)}.${extension}`,
  })
}
const backupRoot = option('--backup-dir') || path.join(os.homedir(), 'Developer/Archive')
const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backup = path.resolve(
  backupRoot,
  `asca-airtable-image-import-${new Date().toISOString().replace(/[:.]/g, '-')}`
)
if (backup === repository || backup.startsWith(repository + path.sep))
  throw Error('Backups must stay outside the public repository')
await fs.mkdir(backup, { recursive: true, mode: 0o700 })
await fs.chmod(backup, 0o700)
await fs.writeFile(
  path.join(backup, 'before.json'),
  JSON.stringify(
    {
      project: PROJECT,
      year,
      targets: prepared.map(row => ({
        artwork: row.artwork,
        source: row.file.path,
        sha256: row.sha256,
        objectPath: row.objectPath,
      })),
      skipped: plan.skipped,
    },
    null,
    2
  ),
  { mode: 0o600 }
)
console.log(JSON.stringify({ backup, targets: prepared.length }))
const results = []
for (const row of prepared) {
  let createdObject = false
  try {
    if (!(await stillPublicSnapshot(client, row.artwork)))
      throw Error('PUBLICATION_OR_SNAPSHOT_CHANGED')
    const bytes = await fs.readFile(row.file.path)
    if (createHash('sha256').update(bytes).digest('hex') !== row.sha256)
      throw Error('SOURCE_CHANGED')
    const upload = await client.storage.from(BUCKET).upload(row.objectPath, bytes, {
      contentType: row.contentType,
      upsert: false,
      cacheControl: '0',
    })
    if (upload.error && !/already exists|duplicate/i.test(upload.error.message))
      throw Error('STORAGE_UPLOAD_FAILED')
    createdObject = !upload.error
    const downloaded = await client.storage.from(BUCKET).download(row.objectPath)
    if (
      downloaded.error ||
      !downloaded.data ||
      createHash('sha256')
        .update(Buffer.from(await downloaded.data.arrayBuffer()))
        .digest('hex') !== row.sha256
    )
      throw Error('PRIVATE_IMAGE_VERIFICATION_FAILED')
    if (!(await stillPublicSnapshot(client, row.artwork)))
      throw Error('PUBLICATION_OR_SNAPSHOT_CHANGED')
    const publicUrl = `${PUBLIC_IMAGE}?id=${row.artwork.id}&v=${row.sha256.slice(0, 24)}`
    const images = {
      ...row.artwork.images,
      main: {
        bucket: BUCKET,
        path: row.objectPath,
        url: publicUrl,
        width: row.width,
        height: row.height,
      },
    }
    const saved = await guardedImageUpdate(client, row.artwork, images)
    if (saved.error || !saved.data) throw Error('ROW_CHANGED_OR_SAVE_FAILED')
    createdObject = false
    const publicRead = await fetch(publicUrl, { signal: AbortSignal.timeout(30000) })
    if (
      !publicRead.ok ||
      createHash('sha256')
        .update(Buffer.from(await publicRead.arrayBuffer()))
        .digest('hex') !== row.sha256
    )
      throw Error('PUBLIC_RLS_IMAGE_VERIFICATION_FAILED')
    results.push({
      id: row.artwork.id,
      status: 'saved',
      objectPath: row.objectPath,
      sha256: row.sha256,
    })
  } catch (error) {
    // Failed reads are explicit cleanup work; deleted rows are also cleaned up.
    if (createdObject) {
      const cleanup = await cleanupImportObject(client, row.artwork.id, row.objectPath)
      if (cleanup === 'cleanup_required')
        results.push({ id: row.artwork.id, status: cleanup, objectPath: row.objectPath })
    }
    results.push({ id: row.artwork.id, status: 'failed', code: error.message })
  }
  await fs.writeFile(path.join(backup, 'results.json'), JSON.stringify(results, null, 2), {
    mode: 0o600,
  })
  console.log(
    JSON.stringify({
      processed: results.filter(row => row.status !== 'cleanup_required').length,
      saved: results.filter(row => row.status === 'saved').length,
      failed: results.filter(row => row.status === 'failed').length,
    })
  )
}
const failed = results.filter(row => row.status === 'failed').length
console.log(
  JSON.stringify({
    complete: failed === 0,
    saved: results.filter(row => row.status === 'saved').length,
    failed,
    backup,
  })
)
if (failed) process.exitCode = 1
