import { createClient } from '@supabase/supabase-js'
// SSR imports removed - not needed for this file
import { log } from '@/lib/utils/logger'

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
    log.warn('Failed to create Supabase client', error instanceof Error ? error : new Error(String(error)))
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
      hasKey: !!supabaseAnonKey 
    })
    return null
  }
  return supabase
}

export const getSupabaseAdminClient = () => {
  if (!supabaseAdmin) {
    log.warn('Supabase Admin configuration missing', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceRoleKey
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
    log.warn('Supabase Admin operation failed', error instanceof Error ? error : new Error(String(error)))
    return null
  }
}

// 타입 정의
export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          name: string
          name_en: string | null
          name_ja: string | null
          name_zh: string | null
          bio: string
          bio_en: string | null
          bio_ja: string | null
          bio_zh: string | null
          profile_image: string | null
          birth_year: number | null
          nationality: string | null
          specialties: string[] | null
          awards: string[] | null
          exhibitions: string[] | null
          membership_type: '준회원' | '정회원' | '특별회원' | '명예회원'
          artist_type: '공모작가' | '청년작가' | '일반작가' | '추천작가' | '초대작가'
          title: '이사' | '상임이사' | '감사' | '고문' | '상임고문' | '자문위원' | '운영위원' | '심사위원' | '운영위원장' | '심사위원장' | '이사장' | '명예이사장' | '부회장' | '회장' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          name_ja?: string | null
          name_zh?: string | null
          bio: string
          bio_en?: string | null
          bio_ja?: string | null
          bio_zh?: string | null
          profile_image?: string | null
          birth_year?: number | null
          nationality?: string | null
          specialties?: string[] | null
          awards?: string[] | null
          exhibitions?: string[] | null
          membership_type?: '준회원' | '정회원' | '특별회원' | '명예회원'
          artist_type?: '공모작가' | '청년작가' | '일반작가' | '추천작가' | '초대작가'
          title?: '이사' | '상임이사' | '감사' | '고문' | '상임고문' | '자문위원' | '운영위원' | '심사위원' | '운영위원장' | '심사위원장' | '이사장' | '명예이사장' | '부회장' | '회장' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          name_ja?: string | null
          name_zh?: string | null
          bio?: string
          bio_en?: string | null
          bio_ja?: string | null
          bio_zh?: string | null
          profile_image?: string | null
          birth_year?: number | null
          nationality?: string | null
          specialties?: string[] | null
          awards?: string[] | null
          exhibitions?: string[] | null
          membership_type?: '준회원' | '정회원' | '특별회원' | '명예회원'
          artist_type?: '공모작가' | '청년작가' | '일반작가' | '추천작가' | '초대작가'
          title?: '이사' | '상임이사' | '감사' | '고문' | '상임고문' | '자문위원' | '운영위원' | '심사위원' | '운영위원장' | '심사위원장' | '이사장' | '명예이사장' | '부회장' | '회장' | null
          created_at?: string
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          title: string
          title_en: string | null
          title_ja: string | null
          title_zh: string | null
          description: string
          description_en: string | null
          description_ja: string | null
          description_zh: string | null
          artist_id: string
          category: 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media'
          style: 'traditional' | 'contemporary' | 'modern'
          year: number
          materials: string[]
          dimensions: {
            width: number
            height: number
            depth?: number
            unit: 'cm' | 'mm' | 'inch'
          }
          price: {
            amount: number
            currency: 'KRW' | 'USD' | 'EUR' | 'JPY'
          } | null
          availability: 'available' | 'sold' | 'reserved'
          featured: boolean
          tags: string[]
          images: string[]
          thumbnail: string
          exhibition_history: string[] | null
          condition: string | null
          technique: string | null
          authenticity_certificate: boolean
          views: number
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          title_en?: string | null
          title_ja?: string | null
          title_zh?: string | null
          description: string
          description_en?: string | null
          description_ja?: string | null
          description_zh?: string | null
          artist_id: string
          category: 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media'
          style: 'traditional' | 'contemporary' | 'modern'
          year: number
          materials: string[]
          dimensions: {
            width: number
            height: number
            depth?: number
            unit: 'cm' | 'mm' | 'inch'
          }
          price?: {
            amount: number
            currency: 'KRW' | 'USD' | 'EUR' | 'JPY'
          } | null
          availability?: 'available' | 'sold' | 'reserved'
          featured?: boolean
          tags?: string[]
          images: string[]
          thumbnail: string
          exhibition_history?: string[] | null
          condition?: string | null
          technique?: string | null
          authenticity_certificate?: boolean
          views?: number
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_en?: string | null
          title_ja?: string | null
          title_zh?: string | null
          description?: string
          description_en?: string | null
          description_ja?: string | null
          description_zh?: string | null
          artist_id?: string
          category?: 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media'
          style?: 'traditional' | 'contemporary' | 'modern'
          year?: number
          materials?: string[]
          dimensions?: {
            width: number
            height: number
            depth?: number
            unit: 'cm' | 'mm' | 'inch'
          }
          price?: {
            amount: number
            currency: 'KRW' | 'USD' | 'EUR' | 'JPY'
          } | null
          availability?: 'available' | 'sold' | 'reserved'
          featured?: boolean
          tags?: string[]
          images?: string[]
          thumbnail?: string
          exhibition_history?: string[] | null
          condition?: string | null
          technique?: string | null
          authenticity_certificate?: boolean
          views?: number
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          title: string
          title_en: string | null
          title_ja: string | null
          title_zh: string | null
          description: string | null
          description_en: string | null
          description_ja: string | null
          description_zh: string | null
          category: 'form' | 'rule' | 'document' | 'notice' | 'other'
          file_type: 'pdf' | 'doc' | 'docx' | 'hwp' | 'xlsx' | 'pptx' | 'zip' | 'other'
          file_url: string
          file_size: number
          download_count: number
          is_public: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          title_en?: string | null
          title_ja?: string | null
          title_zh?: string | null
          description?: string | null
          description_en?: string | null
          description_ja?: string | null
          description_zh?: string | null
          category: 'form' | 'rule' | 'document' | 'notice' | 'other'
          file_type: 'pdf' | 'doc' | 'docx' | 'hwp' | 'xlsx' | 'pptx' | 'zip' | 'other'
          file_url: string
          file_size: number
          download_count?: number
          is_public?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_en?: string | null
          title_ja?: string | null
          title_zh?: string | null
          description?: string | null
          description_en?: string | null
          description_ja?: string | null
          description_zh?: string | null
          category?: 'form' | 'rule' | 'document' | 'notice' | 'other'
          file_type?: 'pdf' | 'doc' | 'docx' | 'hwp' | 'xlsx' | 'pptx' | 'zip' | 'other'
          file_url?: string
          file_size?: number
          download_count?: number
          is_public?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 