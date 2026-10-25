/** Plan only by previously verified artwork UUIDs; never infer an owner from a name. */
export const ARTWORK_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function hasServableImage(images) {
  const main = images?.main
  if (
    typeof main?.path === 'string' &&
    main.path.trim() &&
    (main.bucket === undefined || main.bucket === 'artwork-images') &&
    main.path.split('/').every(part => part && part !== '.' && part !== '..')
  )
    return true
  if (typeof main?.url !== 'string') return false
  if (main.url.startsWith('/images/')) return true
  try {
    const url = new URL(main.url)
    return (
      url.protocol === 'https:' &&
      !['drive.google.com', 'docs.google.com'].includes(url.hostname) &&
      !/(^|\.)airtable(?:usercontent)?\.com$/.test(url.hostname)
    )
  } catch {
    return false
  }
}

export function planVerifiedImages(files, artworks, artists, year) {
  const rows = new Map(artworks.map(row => [row.id, row]))
  const owners = new Map(artists.map(row => [row.id, row]))
  const ready = [],
    skipped = []
  const counts = new Map()
  for (const file of files) counts.set(file.artworkId, (counts.get(file.artworkId) || 0) + 1)
  for (const file of files) {
    const artwork = rows.get(file.artworkId)
    const owner = artwork && owners.get(artwork.artist_id)
    let reason
    if (!ARTWORK_UUID.test(file.artworkId)) reason = 'invalid_id'
    else if (counts.get(file.artworkId) !== 1) reason = 'duplicate_source'
    else if (!artwork) reason = 'missing_artwork'
    else if (artwork.year_created !== year) reason = 'year_mismatch'
    else if (artwork.status !== 'published' || owner?.visibility !== 'public') reason = 'not_public'
    else if (hasServableImage(artwork.images)) reason = 'already_connected'
    if (reason) skipped.push({ artworkId: file.artworkId, reason })
    else ready.push({ file, artwork })
  }
  return { ready, skipped }
}

/** The compare-and-set guards must stay in the UPDATE, not just its preceding read. */
export function guardedImageUpdate(client, artwork, images) {
  let query = client
    .from('artworks')
    .update({ images, updated_at: new Date().toISOString() })
    .eq('id', artwork.id)
    .eq('artist_id', artwork.artist_id)
    .eq('status', 'published')
    .eq('year_created', artwork.year_created)
  query =
    artwork.updated_at === null
      ? query.is('updated_at', null)
      : query.eq('updated_at', artwork.updated_at)
  query =
    artwork.images === null
      ? query.is('images', null)
      : query.eq('images', JSON.stringify(artwork.images))
  return query.select('id,images,updated_at').maybeSingle()
}

export async function stillPublicSnapshot(client, artwork) {
  const { data, error } = await client
    .from('artworks')
    .select('id,artist_id,images,status,year_created,updated_at')
    .eq('id', artwork.id)
    .maybeSingle()
  if (
    error ||
    !data ||
    ['id', 'artist_id', 'status', 'year_created', 'updated_at'].some(
      key => data[key] !== artwork[key]
    ) ||
    JSON.stringify(data.images) !== JSON.stringify(artwork.images)
  )
    return false
  const owner = await client
    .from('artists')
    .select('id')
    .eq('id', artwork.artist_id)
    .eq('visibility', 'public')
    .maybeSingle()
  return !owner.error && !!owner.data
}

/** Unique per execution: a failing import can never delete another run's object. */
export async function cleanupImportObject(client, artworkId, objectPath) {
  const current = await client.from('artworks').select('images').eq('id', artworkId).maybeSingle()
  if (current.error) return 'cleanup_required'
  if (current.data?.images?.main?.path === objectPath) return 'referenced'
  const removed = await client.storage.from('archive-private').remove([objectPath])
  return removed.error ? 'cleanup_required' : 'removed'
}
