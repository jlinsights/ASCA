import fs from 'node:fs'
import path from 'node:path'

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
export const normalizeText = value =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase()

export function galleryKey(value) {
  if (!value.startsWith('/images/gallery/') || value.split('/').includes('..')) return null
  return value
    .normalize('NFC')
    .replace(/\/(originals|thumbnails)\//, '/')
    .replace(/-\d+w(?=\.[^.]+$)/, '')
    .replace(/\.[^.]+$/, '')
}

export function walkImages(dir, root = dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkImages(file, root)
    if (!entry.isFile() || !imageExtensions.has(path.extname(file).toLowerCase())) return []
    return [{ file, relative: `/${path.relative(root, file).split(path.sep).join('/')}` }]
  })
}

function sourceScore(file) {
  return (
    (file.includes('/thumbnails/') ? 100 : 0) +
    (/-\d+w\.[^.]+$/.test(file) ? 10 : 0) +
    (/\.jpe?g$/i.test(file) ? 0 : 1)
  )
}

export function planGallery(publicDir, items) {
  const files = walkImages(path.join(publicDir, 'images/gallery'), publicDir)
  const byKey = new Map()
  for (const file of files) {
    const key = galleryKey(file.relative)
    if (!key) continue
    const previous = byKey.get(key)
    if (!previous || sourceScore(file.file) < sourceScore(previous.file)) byKey.set(key, file)
  }
  const seen = new Set()
  const matched = []
  const missing = []
  for (const item of items) {
    const key = galleryKey(item.src)
    if (!key || seen.has(key)) continue
    seen.add(key)
    const source = byKey.get(key)
    if (source) matched.push({ key, ...source, id: item.id })
    else missing.push({ id: item.id, src: item.src })
  }
  return { matched, missing, unlisted: [...byKey.keys()].filter(key => !seen.has(key)) }
}

export function planArtworks(publicDir, artworks, artists) {
  const byArtist = new Map(artists.map(artist => [artist.id, artist]))
  const files = walkImages(
    path.join(publicDir, 'webflow/orientalcalligraphy/images'),
    publicDir
  ).filter(source => !/-p-\d+\.[^.]+$/.test(source.file))
  const matched = []
  const unmatched = []
  const connected = []
  for (const artwork of artworks) {
    const main = artwork.images?.main
    const hasPath = typeof main?.path === 'string' && main.path.length > 0
    let hasPublicUrl = false
    try {
      const url = new URL(main?.url)
      hasPublicUrl =
        url.protocol === 'https:' && !['drive.google.com', 'docs.google.com'].includes(url.hostname)
    } catch {
      /* URL이 없는 기존 행도 대조한다. */
    }
    if (hasPath || hasPublicUrl) {
      connected.push({ id: artwork.id })
      continue
    }
    const artist = byArtist.get(artwork.artist_id)
    const names = [artist?.name, artist?.name_zh].map(normalizeText).filter(Boolean)
    const title = normalizeText(artwork.title)
    const hits =
      title.length < 3
        ? []
        : files.filter(source => {
            const raw = path.basename(source.file, path.extname(source.file)).normalize('NFKC')
            const stem = normalizeText(raw)
            const author = normalizeText(raw.split(/[_-]/)[0])
            return names.includes(author) && stem.includes(title)
          })
    if (hits.length === 1) matched.push({ ...hits[0], artwork, how: 'artist-and-title' })
    else unmatched.push({ id: artwork.id, title: artwork.title, candidates: hits.length })
  }
  // 한 원본이 여러 DB 행에 맞으면 자동으로 선택하지 않는다.
  const uses = new Map()
  for (const match of matched) uses.set(match.file, (uses.get(match.file) ?? 0) + 1)
  const unique = matched.filter(match => uses.get(match.file) === 1)
  for (const match of matched.filter(match => uses.get(match.file) !== 1)) {
    unmatched.push({ id: match.artwork.id, title: match.artwork.title, candidates: -1 })
  }
  return { matched: unique, unmatched, connected }
}
