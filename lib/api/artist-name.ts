/** Public display only; never rewrites the artist's registered name. */
type ArtistNames = {
  name: string
  nationality?: string | null
  nameJa?: string | null
  nameZh?: string | null
}

const JAPAN = new Set(['日本', '일본', 'japan', 'jp', 'jpn'])
const CHINA = new Set(['中國', '中国', '중국', 'china', 'cn', 'chn'])
const HAN = /\p{Script=Han}/u
const HANGUL = /\p{Script=Hangul}/u

/** A recorded native Han name for Japan/China; null when no suitable name is stored. */
export function artistNativeHanName(artist: ArtistNames): string | null {
  const country = artist.nationality?.trim().toLowerCase() ?? ''
  const candidates = JAPAN.has(country)
    ? [artist.nameJa, artist.nameZh]
    : CHINA.has(country)
      ? [artist.nameZh]
      : []
  return (
    candidates
      .map(value => value?.trim())
      .find(value => value && HAN.test(value) && !HANGUL.test(value)) || null
  )
}

export function artistNativeName(artist: ArtistNames): string {
  return artistNativeHanName(artist) ?? artist.name
}
