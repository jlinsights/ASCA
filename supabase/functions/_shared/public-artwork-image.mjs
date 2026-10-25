const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const FILE = /^[0-9a-f-]{36}-[0-9a-f]{24}\.(?:jpg|png|webp|avif)$/
const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-ASCA-Media': 'public-artwork-image-v1',
  'Content-Security-Policy': "default-src 'none'; sandbox",
}
const empty = status => new Response(null, { status, headers })

/** Pass an anon-key client only. Never forward caller credentials or use a service role. */
export async function publicArtworkImage(request, anon) {
  if (!['GET', 'HEAD'].includes(request.method)) return empty(405)
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !UUID.test(id)) return empty(404)
  try {
    // Both reads are governed by RLS, including the second check at download time.
    const { data, error } = await anon
      .from('artworks')
      .select('id,images')
      .eq('id', id)
      .maybeSingle()
    if (error) return empty(503)
    if (!data) return empty(404)
    const main = data.images?.main
    const parts = typeof main?.path === 'string' ? main.path.split('/') : []
    if (
      main?.bucket !== 'archive-private' ||
      parts.length !== 3 ||
      parts[0] !== 'published-imports' ||
      parts[1] !== id ||
      !FILE.test(parts[2])
    )
      return empty(404)
    const image = await anon.storage.from('archive-private').download(main.path)
    if (image.error || !image.data) return empty(404)
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(image.data.type))
      return empty(404)
    return new Response(request.method === 'HEAD' ? null : image.data, {
      status: 200,
      headers: { ...headers, 'Content-Type': image.data.type },
    })
  } catch {
    return empty(503)
  }
}
