/** Airtable owns only the pre-archive artist fields listed here. */
const aliases: Record<string, string> = {
  'Name (Korean)': 'name',
  name_korean: 'name',
  Name: 'name',
  'Name (Chinese)': 'name_zh',
  name_chinese: 'name_zh',
  'Membership Type': 'membership_type',
  'Artist Type': 'artist_type',
  Nationality: 'nationality',
  Title: 'title',
}
const allowed = new Set([
  'name',
  'name_en',
  'name_ja',
  'name_zh',
  'bio',
  'bio_en',
  'bio_ja',
  'bio_zh',
  'birth_year',
  'nationality',
  'specialties',
  'awards',
  'exhibitions',
  'profile_image',
  'membership_type',
  'artist_type',
  'title',
])

export function mapArtistSync(fields: Record<string, unknown>) {
  const artist: Record<string, unknown> = {}
  const contacts: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(fields)) {
    const normalized = aliases[key] ?? key.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    if (normalized === 'email' || normalized === 'phone') {
      if (value === null || typeof value === 'string') contacts[normalized] = value
    } else if (allowed.has(normalized)) {
      artist[normalized] = value
    } else if (key === 'DOB' || key === 'Date of Birth' || key === 'date_of_birth') {
      const year = typeof value === 'string' ? Number(value.slice(0, 4)) : NaN
      if (Number.isInteger(year) && year >= 1000 && year <= 9999) artist.birth_year = year
    }
  }
  return { artist, contacts }
}
