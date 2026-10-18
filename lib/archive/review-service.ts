import 'server-only'
import { archiveWriter } from './writer'
import { reviewOperation, type ReviewOperation } from './review'

type DB = ReturnType<typeof archiveWriter>

async function buckets(db: DB) {
  const privateBucket = process.env.ARCHIVE_PRIVATE_BUCKET || 'archive-private'
  const publicBucket = process.env.NEXT_PUBLIC_ARCHIVE_PUBLIC_BUCKET || 'archive-public'
  const [privateInfo, publicInfo] = await Promise.all([
    db.storage.getBucket(privateBucket),
    db.storage.getBucket(publicBucket),
  ])
  if (
    privateInfo.error ||
    publicInfo.error ||
    !privateInfo.data ||
    !publicInfo.data ||
    privateInfo.data.public ||
    !publicInfo.data.public ||
    privateBucket === publicBucket
  )
    throw new Error('Archive bucket configuration invalid')
  return { privateBucket, publicBucket }
}

export async function finishReview(db: DB, operation: ReviewOperation, success: boolean) {
  const { data, error } = await db.rpc('finish_archive_review', {
    p_id: operation.id,
    p_lease_token: operation.lease_token,
    p_success: success,
  })
  if (error) throw error
  return reviewOperation.parse(data)
}

export async function executeReview(db: DB, operation: ReviewOperation) {
  if (operation.state === 'completed') return operation
  let finishAttempted = false
  let publicBucket: string | undefined
  const copied: string[] = []
  try {
    if (operation.action !== 'return') {
      const targets = await buckets(db)
      publicBucket = targets.publicBucket
      const publicStore = db.storage.from(targets.publicBucket)
      if (operation.cleanup_paths.length) {
        const { error } = await publicStore.remove(operation.cleanup_paths)
        if (error) throw error
      }
      if (operation.action === 'publish') {
        for (const image of operation.images) {
          for (const [source, destination] of [
            [image.private_thumb, image.public_thumb],
            [image.private_web, image.public_web],
          ]) {
            const { data: blob, error } = await db.storage
              .from(targets.privateBucket)
              .download(source!)
            if (error || !blob) throw error || new Error('Image unavailable')
            // Upload-time derivatives only: originals are never copied or signed here.
            const { error: uploadError } = await publicStore.upload(destination!, blob, {
              upsert: true,
              contentType: 'image/webp',
              cacheControl: '0',
            })
            if (uploadError) throw uploadError
            copied.push(destination!)
          }
        }
      } else {
        const { error } = await publicStore.remove(
          operation.images.flatMap(i => [i.public_thumb, i.public_web])
        )
        if (error) throw error
      }
    }
    finishAttempted = true
    return await finishReview(db, operation, true)
  } catch (error) {
    // Never delete after an ambiguous final commit: it may already be publicly published.
    if (!finishAttempted && publicBucket && copied.length)
      await db.storage
        .from(publicBucket)
        .remove(copied)
        .catch(() => undefined)
    // The durable ledger preserves the manifest even if cleanup/DB access fails.
    // A lost successful response returns the already-completed operation idempotently.
    try {
      const result = await finishReview(db, operation, false)
      if (result.state === 'completed') return result
    } catch {
      /* Processing lease remains recoverable after expiry. */
    }
    throw error
  }
}
