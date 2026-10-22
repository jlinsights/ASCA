import { submissionSchema } from './submission'
import { z } from 'zod'

// Ownership, image paths, record verification and publication are never client writable.
export const draftSchema = submissionSchema
  .omit({ artistId: true, recordTitle: true, organizer: true, contestRef: true })
  .extend({ expectedUpdatedAt: z.string().datetime({ offset: true }).nullable() })

export function draftValues(input: z.infer<typeof draftSchema>) {
  return {
    title: input.title,
    title_hanja: input.titleHanja || null,
    title_en: input.titleEn || null,
    style: input.style,
    width_cm: input.width,
    height_cm: input.height,
    year_created: input.year,
    materials: [input.materials],
    medium: input.materials,
    transcription: input.transcription || null,
    interpretation: input.interpretation || null,
    interpretation_en: input.interpretationEn || null,
    description: input.interpretation,
    source_text: input.source || null,
    seal_description: input.seal || null,
    dimensions: { width: input.width, height: input.height, unit: 'cm' },
    status: input.status,
    updated_at: new Date().toISOString(),
  }
}
