import { z } from 'zod'
const text = (max: number) => z.string().trim().max(max)
export const submissionSchema = z
  .object({
    artistId: z.string().uuid(),
    title: text(300).min(1),
    titleHanja: text(300),
    titleEn: text(300),
    style: text(100).min(1),
    width: z.coerce.number().positive().max(10000),
    height: z.coerce.number().positive().max(10000),
    year: z.coerce.number().int().min(1).max(new Date().getFullYear()),
    materials: text(300).min(1),
    transcription: text(10000),
    interpretation: text(10000),
    interpretationEn: text(10000),
    source: text(2000),
    seal: text(2000),
    recordTitle: text(300),
    organizer: text(300),
    contestRef: text(300),
    status: z.enum(['draft', 'pending_review']),
  })
  .strict()
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024
export const MAX_IMAGES = 3
export type Submission = z.infer<typeof submissionSchema>
export function canSubmitForArtist(userId: string, ownerId: string | null, admin: boolean) {
  return admin || ownerId === userId
}
