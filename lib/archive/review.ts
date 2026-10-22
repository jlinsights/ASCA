import { z } from 'zod'

export const reviewRequest = z
  .object({
    operationId: z.string().uuid(),
    action: z.enum(['publish', 'return', 'unpublish']),
    expectedUpdatedAt: z.string().datetime({ offset: true }).nullable(),
    reason: z.string().trim().max(2000),
  })
  .strict()
  .refine(input => input.action === 'publish' || input.reason.length > 0)

export const reviewImage = z.object({
  id: z.string().uuid(),
  private_thumb: z.string(),
  private_web: z.string(),
  public_thumb: z.string(),
  public_web: z.string(),
})
export const reviewOperation = z.object({
  id: z.string().uuid(),
  artwork_id: z.string().uuid(),
  action: z.enum(['publish', 'return', 'unpublish']),
  state: z.enum(['processing', 'failed', 'completed']),
  reason: z.string(),
  lease_token: z.string().uuid(),
  images: z.array(reviewImage).max(3),
  cleanup_paths: z.array(z.string()).default([]),
})
export type ReviewOperation = z.infer<typeof reviewOperation>
