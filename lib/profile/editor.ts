import { z } from 'zod'
import type { Database } from '@/lib/types/database.generated'
import type { ArtistProfileEditorData } from '@/lib/types/profile-editor'

export const ARTIST_PROFILE_COLUMNS =
  'id,name,name_en,bio,bio_en,birth_year,specialties,profile_image,visibility'

export const artistProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    nameEn: z.string().trim().max(200).nullable().optional(),
    bio: z.string().max(10000).nullable().optional(),
    bioEn: z.string().max(10000).nullable().optional(),
    birthYear: z.number().int().min(1000).max(new Date().getUTCFullYear()).nullable().optional(),
    specialization: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  })
  .strict()
  .refine(value => Object.keys(value).length > 0)

export function artistProfilePatch(input: z.infer<typeof artistProfileUpdateSchema>) {
  const patch: Database['public']['Tables']['artists']['Update'] = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.nameEn !== undefined) patch.name_en = input.nameEn
  if (input.bio !== undefined) patch.bio = input.bio
  if (input.bioEn !== undefined) patch.bio_en = input.bioEn
  if (input.birthYear !== undefined) patch.birth_year = input.birthYear
  if (input.specialization !== undefined) patch.specialties = input.specialization
  return patch
}

type ArtistRow = Pick<
  Database['public']['Tables']['artists']['Row'],
  | 'id'
  | 'name'
  | 'name_en'
  | 'bio'
  | 'bio_en'
  | 'birth_year'
  | 'specialties'
  | 'profile_image'
  | 'visibility'
>

export function artistProfileResponse(row: ArtistRow): ArtistProfileEditorData {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    bio: row.bio,
    bioEn: row.bio_en,
    birthYear: row.birth_year,
    specialization: row.specialties ?? [],
    profileImage: row.profile_image,
    visibility:
      row.visibility === 'public' || row.visibility === 'members' ? row.visibility : 'hidden',
  }
}
