export function isArchivePath(path: string): boolean {
  return (
    path.length > 0 &&
    !/^\//.test(path) &&
    !/[:\\\\?#%]/.test(path) &&
    !/(^|\/)\.\.?(\/|$)/.test(path) &&
    !path.includes('//')
  )
}

export function archivePublicUrl(path: string): string {
  if (!isArchivePath(path)) throw new Error('Invalid archive object key')
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!origin) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  const bucket = process.env.NEXT_PUBLIC_ARCHIVE_PUBLIC_BUCKET || 'archive-public'
  return `${origin.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`
}
