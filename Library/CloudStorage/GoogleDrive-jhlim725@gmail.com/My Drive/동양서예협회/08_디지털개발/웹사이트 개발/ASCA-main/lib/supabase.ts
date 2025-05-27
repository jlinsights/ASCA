import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// 환경 변수가 설정되지 않은 경우 null을 반환하여 오류 방지
export const supabase = (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey)

// Supabase가 설정되지 않았을 때 사용할 더미 함수들
export const isSupabaseConfigured = () => supabase !== null

export const getSupabaseClient = () => {
  if (!supabase) {
    console.warn('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
    return null
  }
  return supabase
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
    }
  }
} 