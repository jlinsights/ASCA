import { createClient } from '@supabase/supabase-js'
// SSR imports removed - not needed for this file
import { log } from '@/lib/utils/logger'
import type {
  Artist,
  NewArtist,
  Artwork,
  NewArtwork,
  Exhibition,
  NewExhibition,
} from '@/lib/db/schema'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// 안전한 클라이언트 생성 함수
const createSafeSupabaseClient = (url: string, key: string) => {
  try {
    if (url.includes('placeholder') || key.includes('placeholder')) {
      return null
    }
    return createClient(url, key)
  } catch (error) {
    log.warn(
      'Failed to create Supabase client',
      error instanceof Error ? error : new Error(String(error))
    )
    return null
  }
}

// 일반 클라이언트 (Anon Key 사용)
export const supabase = createSafeSupabaseClient(supabaseUrl, supabaseAnonKey)

// 관리용 클라이언트 (Service Role Key 사용)
export const supabaseAdmin = createSafeSupabaseClient(supabaseUrl, supabaseServiceRoleKey)

// Supabase가 설정되지 않았을 때 사용할 더미 함수들
export const isSupabaseConfigured = () => supabase !== null
export const isSupabaseAdminConfigured = () => supabaseAdmin !== null

export const getSupabaseClient = () => {
  if (!supabase) {
    log.warn('Supabase is not configured', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    return null
  }
  return supabase
}

export const getSupabaseAdminClient = () => {
  if (!supabaseAdmin) {
    log.warn('Supabase Admin configuration missing', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceRoleKey,
    })
    return null
  }
  return supabaseAdmin
}

// 안전한 Supabase 사용을 위한 헬퍼 함수 (일반 클라이언트)
export const ensureSupabase = () => {
  if (!supabase) {
    log.warn('Supabase is not configured. Using mock data.')
    return null
  }
  return supabase
}

// 안전한 Supabase Admin 사용을 위한 헬퍼 함수 (Service Role)
export const ensureSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    log.warn('Supabase Admin is not configured.')
    throw new Error('Supabase Admin client not available')
  }
  return supabaseAdmin
}

// 안전한 타입 체크를 위한 함수
export const safeSupabaseCall = async <T>(
  operation: (client: NonNullable<typeof supabase>) => Promise<T>
): Promise<T | null> => {
  try {
    const client = ensureSupabase()
    if (!client) {
      log.warn('Supabase client not available, returning null')
      return null
    }
    return await operation(client)
  } catch (error) {
    log.warn('Supabase operation failed', error instanceof Error ? error : new Error(String(error)))
    return null
  }
}

// 관리자 권한이 필요한 작업용
export const safeSupabaseAdminCall = async <T>(
  operation: (client: NonNullable<typeof supabaseAdmin>) => Promise<T>
): Promise<T | null> => {
  try {
    const client = ensureSupabaseAdmin()
    if (!client) {
      log.warn('Supabase Admin client not available, returning null')
      return null
    }
    return await operation(client)
  } catch (error) {
    log.warn(
      'Supabase Admin operation failed',
      error instanceof Error ? error : new Error(String(error))
    )
    return null
  }
}

// 타입 정의 (Drizzle 스키마에서 추론)
// supabase-js(PostgREST)는 timestamptz를 ISO 문자열로 반환하므로
// Drizzle의 Date 타입을 경계에서 string으로 변환해 노출한다
type SerializedValue<V> = V extends Date ? string : V
type Serialized<T> = { [K in keyof T]: SerializedValue<T[K]> }

export type ArtistInsert = Serialized<NewArtist>
export type ArtistUpdate = Partial<Serialized<NewArtist>>
export type ArtistRow = Serialized<Artist>

export type ArtworkInsert = Serialized<NewArtwork>
export type ArtworkUpdate = Partial<Serialized<NewArtwork>>
export type ArtworkRow = Serialized<Artwork>

export type ExhibitionInsert = Serialized<NewExhibition>
export type ExhibitionUpdate = Partial<Serialized<NewExhibition>>
export type ExhibitionRow = Serialized<Exhibition>
