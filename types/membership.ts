// 문화 예술 단체 특화 회원 관리 시스템 타입 정의

export interface MembershipLevel {
  id: string;
  name: string;
  display_name_ko: string;
  display_name_en: string;
  description_ko?: string;
  description_en?: string;
  privileges: Record<string, any>;
  max_mentees: number;
  can_teach: boolean;
  can_evaluate: boolean;
  can_approve: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  clerk_user_id?: string;
  email: string;
  first_name_ko?: string;
  last_name_ko?: string;
  first_name_en?: string;
  last_name_en?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  residence_country?: string;
  residence_city?: string;
  timezone: string;
  preferred_language: string;
  membership_level_id?: string;
  membership_status: 'active' | 'inactive' | 'suspended' | 'pending';
  joined_date: string;
  last_active: string;
  profile_image_url?: string;
  bio_ko?: string;
  bio_en?: string;
  website_url?: string;
  social_media: Record<string, string>;
  is_verified: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtisticProfile {
  id: string;
  member_id: string;
  primary_art_form: string;
  secondary_art_forms?: string[];
  years_of_experience?: number;
  education_background?: Record<string, any>;
  teaching_experience?: Record<string, any>;
  exhibition_history?: Record<string, any>;
  awards_and_recognition?: Record<string, any>;
  artistic_statement_ko?: string;
  artistic_statement_en?: string;
  portfolio_url?: string;
  preferred_style?: string;
  materials_specialty?: string[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  member_id: string;
  title_ko: string;
  title_en?: string;
  description_ko?: string;
  description_en?: string;
  achievement_type: 'award' | 'exhibition' | 'publication' | 'teaching' | 'cultural' | 'other';
  category?: string;
  year?: number;
  organization?: string;
  certificate_url?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  member_id: string;
  name_ko: string;
  name_en?: string;
  issuing_organization: string;
  certification_type?: string;
  level?: string;
  issue_date?: string;
  expiry_date?: string;
  certificate_number?: string;
  certificate_url?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CulturalBackground {
  id: string;
  member_id: string;
  cultural_heritage?: string[];
  traditional_art_forms?: string[];
  cultural_region?: string;
  language_skills?: Record<string, any>;
  cultural_exchange_experience?: Record<string, any>;
  international_connections?: Record<string, any>;
  cultural_mentorship?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MentoringRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  relationship_type: 'formal' | 'informal' | 'cultural' | 'technical';
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused';
  goals_ko?: string;
  goals_en?: string;
  progress_notes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MemberActivityLog {
  id: string;
  member_id: string;
  activity_type: string;
  description_ko?: string;
  description_en?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API 요청/응답 타입
export interface CreateMemberRequest {
  email: string;
  first_name_ko?: string;
  last_name_ko?: string;
  first_name_en?: string;
  last_name_en?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  residence_country?: string;
  residence_city?: string;
  timezone?: string;
  preferred_language?: string;
  bio_ko?: string;
  bio_en?: string;
  website_url?: string;
  social_media?: Record<string, string>;
  is_public?: boolean;
}

export interface UpdateMemberRequest {
  first_name_ko?: string;
  last_name_ko?: string;
  first_name_en?: string;
  last_name_en?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  residence_country?: string;
  residence_city?: string;
  timezone?: string;
  preferred_language?: string;
  membership_level_id?: string;
  membership_status?: 'active' | 'inactive' | 'suspended' | 'pending';
  profile_image_url?: string;
  bio_ko?: string;
  bio_en?: string;
  website_url?: string;
  social_media?: Record<string, string>;
  is_public?: boolean;
}

export interface MemberSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  membership_level?: string;
  membership_status?: string;
  art_form?: string;
  country?: string;
  is_verified?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// 한국 특화 타입
export interface KoreanName {
  family_name: string; // 성
  given_name: string;  // 이름
  full_name: string;   // 전체 이름
}

export interface CulturalArtForm {
  primary: string;     // 주요 예술 분야
  secondary: string[]; // 부차적 예술 분야
  traditional: boolean; // 전통 예술 여부
  modern: boolean;     // 현대 예술 여부
}

export interface KoreanCulturalBackground {
  region: string;      // 지역 (경상도, 전라도 등)
  traditional_arts: string[]; // 전통 예술 분야
  cultural_heritage: string[]; // 문화유산
  language_skills: {
    korean: 'native' | 'fluent' | 'intermediate' | 'basic';
    english?: 'fluent' | 'intermediate' | 'basic';
    chinese?: 'fluent' | 'intermediate' | 'basic';
    japanese?: 'fluent' | 'intermediate' | 'basic';
  };
} 