export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      artist_contacts: {
        Row: {
          artist_id: string
          created_at: string
          email: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          email?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          email?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'artist_contacts_artist_id_fkey'
            columns: ['artist_id']
            isOneToOne: true
            referencedRelation: 'artists'
            referencedColumns: ['id']
          },
        ]
      }
      artist_records: {
        Row: {
          artist_id: string
          artwork_id: string | null
          award_level: string | null
          contest_ref: string | null
          created_at: string
          id: string
          is_asca_verified: boolean
          organizer: string | null
          record_type: string
          source: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          artist_id: string
          artwork_id?: string | null
          award_level?: string | null
          contest_ref?: string | null
          created_at?: string
          id?: string
          is_asca_verified?: boolean
          organizer?: string | null
          record_type: string
          source?: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          artist_id?: string
          artwork_id?: string | null
          award_level?: string | null
          contest_ref?: string | null
          created_at?: string
          id?: string
          is_asca_verified?: boolean
          organizer?: string | null
          record_type?: string
          source?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'artist_records_artist_id_fkey'
            columns: ['artist_id']
            isOneToOne: false
            referencedRelation: 'artists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'artist_records_artwork_id_artist_id_fkey'
            columns: ['artwork_id', 'artist_id']
            isOneToOne: false
            referencedRelation: 'artworks'
            referencedColumns: ['id', 'artist_id']
          },
          {
            foreignKeyName: 'artist_records_artwork_id_artist_id_fkey'
            columns: ['artwork_id', 'artist_id']
            isOneToOne: false
            referencedRelation: 'public_artworks'
            referencedColumns: ['id', 'artist_id']
          },
        ]
      }
      artists: {
        Row: {
          airtable_id: string | null
          archive_bio: string | null
          archive_bio_en: string | null
          art_name_hanja: string | null
          art_name_ko: string | null
          artist_type: string | null
          awards: string[] | null
          bio: string | null
          bio_en: string | null
          bio_ja: string | null
          bio_zh: string | null
          birth_year: number | null
          branch_name: string | null
          calligraphy_styles: string[]
          certification_grade: string | null
          certified_at: string | null
          claimed_by_user_id: string | null
          created_at: string | null
          death_year: number | null
          dues_status: string
          exhibitions: string[] | null
          id: string
          membership_type: string | null
          name: string
          name_en: string | null
          name_ja: string | null
          name_zh: string | null
          nationality: string | null
          profile_image: string | null
          profile_image_path: string | null
          specialties: string[] | null
          teacher_artist_id: string | null
          teacher_name: string | null
          title: string | null
          updated_at: string | null
          visibility: string
        }
        Insert: {
          airtable_id?: string | null
          archive_bio?: string | null
          archive_bio_en?: string | null
          art_name_hanja?: string | null
          art_name_ko?: string | null
          artist_type?: string | null
          awards?: string[] | null
          bio?: string | null
          bio_en?: string | null
          bio_ja?: string | null
          bio_zh?: string | null
          birth_year?: number | null
          branch_name?: string | null
          calligraphy_styles?: string[]
          certification_grade?: string | null
          certified_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string | null
          death_year?: number | null
          dues_status?: string
          exhibitions?: string[] | null
          id?: string
          membership_type?: string | null
          name: string
          name_en?: string | null
          name_ja?: string | null
          name_zh?: string | null
          nationality?: string | null
          profile_image?: string | null
          profile_image_path?: string | null
          specialties?: string[] | null
          teacher_artist_id?: string | null
          teacher_name?: string | null
          title?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          airtable_id?: string | null
          archive_bio?: string | null
          archive_bio_en?: string | null
          art_name_hanja?: string | null
          art_name_ko?: string | null
          artist_type?: string | null
          awards?: string[] | null
          bio?: string | null
          bio_en?: string | null
          bio_ja?: string | null
          bio_zh?: string | null
          birth_year?: number | null
          branch_name?: string | null
          calligraphy_styles?: string[]
          certification_grade?: string | null
          certified_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string | null
          death_year?: number | null
          dues_status?: string
          exhibitions?: string[] | null
          id?: string
          membership_type?: string | null
          name?: string
          name_en?: string | null
          name_ja?: string | null
          name_zh?: string | null
          nationality?: string | null
          profile_image?: string | null
          profile_image_path?: string | null
          specialties?: string[] | null
          teacher_artist_id?: string | null
          teacher_name?: string | null
          title?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: 'artists_teacher_artist_id_fkey'
            columns: ['teacher_artist_id']
            isOneToOne: false
            referencedRelation: 'artists'
            referencedColumns: ['id']
          },
        ]
      }
      artwork_images: {
        Row: {
          artwork_id: string
          created_at: string
          height: number
          id: string
          is_primary: boolean
          original_path: string
          sort_order: number
          thumb_path: string
          updated_at: string
          web_path: string
          width: number
        }
        Insert: {
          artwork_id: string
          created_at?: string
          height: number
          id?: string
          is_primary?: boolean
          original_path: string
          sort_order?: number
          thumb_path: string
          updated_at?: string
          web_path: string
          width: number
        }
        Update: {
          artwork_id?: string
          created_at?: string
          height?: number
          id?: string
          is_primary?: boolean
          original_path?: string
          sort_order?: number
          thumb_path?: string
          updated_at?: string
          web_path?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: 'artwork_images_artwork_id_fkey'
            columns: ['artwork_id']
            isOneToOne: false
            referencedRelation: 'artworks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'artwork_images_artwork_id_fkey'
            columns: ['artwork_id']
            isOneToOne: false
            referencedRelation: 'public_artworks'
            referencedColumns: ['id']
          },
        ]
      }
      artworks: {
        Row: {
          artist_id: string
          category: Database['public']['Enums']['artwork_category']
          contests: string[] | null
          created_at: string | null
          created_by: string
          currency: string | null
          description: string
          description_en: string | null
          dimensions: Json
          display_order: number | null
          exhibitions: string[] | null
          height_cm: number | null
          id: string
          images: Json
          interpretation: string | null
          interpretation_en: string | null
          is_featured: boolean | null
          is_for_sale: boolean | null
          likes: number | null
          materials: string[] | null
          medium: string
          price: number | null
          published_at: string | null
          seal_description: string | null
          source_text: string | null
          status: Database['public']['Enums']['artwork_status'] | null
          style: string | null
          tags: string[] | null
          title: string
          title_en: string | null
          title_hanja: string | null
          transcription: string | null
          updated_at: string | null
          views: number | null
          width_cm: number | null
          year_created: number
        }
        Insert: {
          artist_id: string
          category: Database['public']['Enums']['artwork_category']
          contests?: string[] | null
          created_at?: string | null
          created_by?: string
          currency?: string | null
          description: string
          description_en?: string | null
          dimensions: Json
          display_order?: number | null
          exhibitions?: string[] | null
          height_cm?: number | null
          id?: string
          images: Json
          interpretation?: string | null
          interpretation_en?: string | null
          is_featured?: boolean | null
          is_for_sale?: boolean | null
          likes?: number | null
          materials?: string[] | null
          medium: string
          price?: number | null
          published_at?: string | null
          seal_description?: string | null
          source_text?: string | null
          status?: Database['public']['Enums']['artwork_status'] | null
          style?: string | null
          tags?: string[] | null
          title: string
          title_en?: string | null
          title_hanja?: string | null
          transcription?: string | null
          updated_at?: string | null
          views?: number | null
          width_cm?: number | null
          year_created: number
        }
        Update: {
          artist_id?: string
          category?: Database['public']['Enums']['artwork_category']
          contests?: string[] | null
          created_at?: string | null
          created_by?: string
          currency?: string | null
          description?: string
          description_en?: string | null
          dimensions?: Json
          display_order?: number | null
          exhibitions?: string[] | null
          height_cm?: number | null
          id?: string
          images?: Json
          interpretation?: string | null
          interpretation_en?: string | null
          is_featured?: boolean | null
          is_for_sale?: boolean | null
          likes?: number | null
          materials?: string[] | null
          medium?: string
          price?: number | null
          published_at?: string | null
          seal_description?: string | null
          source_text?: string | null
          status?: Database['public']['Enums']['artwork_status'] | null
          style?: string | null
          tags?: string[] | null
          title?: string
          title_en?: string | null
          title_hanja?: string | null
          transcription?: string | null
          updated_at?: string | null
          views?: number | null
          width_cm?: number | null
          year_created?: number
        }
        Relationships: [
          {
            foreignKeyName: 'artworks_artist_id_fkey'
            columns: ['artist_id']
            isOneToOne: false
            referencedRelation: 'artists'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          content: string | null
          created_at: string | null
          current_participants: number | null
          description: string
          end_date: string | null
          event_date: string
          event_type: string | null
          exhibition_id: string | null
          featured_image_url: string | null
          gallery_images: string[] | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          location: string | null
          luma_url: string | null
          luma_url_public: string | null
          luma_visibility: string
          max_participants: number | null
          organizer: string | null
          registration_deadline: string | null
          registration_fee: number | null
          registration_required: boolean | null
          search_vector: unknown
          status: string | null
          title: string
          updated_at: string | null
          venue: string | null
          views: number | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          content?: string | null
          created_at?: string | null
          current_participants?: number | null
          description: string
          end_date?: string | null
          event_date: string
          event_type?: string | null
          exhibition_id?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          luma_url?: string | null
          luma_url_public?: string | null
          luma_visibility?: string
          max_participants?: number | null
          organizer?: string | null
          registration_deadline?: string | null
          registration_fee?: number | null
          registration_required?: boolean | null
          search_vector?: unknown
          status?: string | null
          title: string
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          content?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string
          end_date?: string | null
          event_date?: string
          event_type?: string | null
          exhibition_id?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          luma_url?: string | null
          luma_url_public?: string | null
          luma_visibility?: string
          max_participants?: number | null
          organizer?: string | null
          registration_deadline?: string | null
          registration_fee?: number | null
          registration_required?: boolean | null
          search_vector?: unknown
          status?: string | null
          title?: string
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibition_details'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibitions'
            referencedColumns: ['id']
          },
        ]
      }
      exhibition_artists: {
        Row: {
          artist_id: string
          bio: string | null
          created_at: string | null
          display_order: number | null
          exhibition_id: string
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          exhibition_id: string
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          exhibition_id?: string
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'exhibition_artists_artist_id_fkey'
            columns: ['artist_id']
            isOneToOne: false
            referencedRelation: 'artists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exhibition_artists_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibition_details'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exhibition_artists_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibitions'
            referencedColumns: ['id']
          },
        ]
      }
      exhibition_artworks: {
        Row: {
          artwork_id: string
          created_at: string | null
          display_order: number | null
          exhibition_id: string
          id: string
          is_featured: boolean | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          artwork_id: string
          created_at?: string | null
          display_order?: number | null
          exhibition_id: string
          id?: string
          is_featured?: boolean | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          artwork_id?: string
          created_at?: string | null
          display_order?: number | null
          exhibition_id?: string
          id?: string
          is_featured?: boolean | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'exhibition_artworks_artwork_id_fkey'
            columns: ['artwork_id']
            isOneToOne: false
            referencedRelation: 'artworks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exhibition_artworks_artwork_id_fkey'
            columns: ['artwork_id']
            isOneToOne: false
            referencedRelation: 'public_artworks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exhibition_artworks_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibition_details'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exhibition_artworks_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibitions'
            referencedColumns: ['id']
          },
        ]
      }
      exhibitions: {
        Row: {
          content: string | null
          created_at: string | null
          curator: string | null
          current_visitors: number | null
          description: string
          end_date: string
          featured_image_url: string | null
          gallery_images: string[] | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          location: string | null
          max_capacity: number | null
          search_vector: unknown
          start_date: string
          status: string | null
          subtitle: string | null
          ticket_price: number | null
          title: string
          updated_at: string | null
          venue: string | null
          views: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          curator?: string | null
          current_visitors?: number | null
          description: string
          end_date: string
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          max_capacity?: number | null
          search_vector?: unknown
          start_date: string
          status?: string | null
          subtitle?: string | null
          ticket_price?: number | null
          title: string
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          curator?: string | null
          current_visitors?: number | null
          description?: string
          end_date?: string
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          max_capacity?: number | null
          search_vector?: unknown
          start_date?: string
          status?: string | null
          subtitle?: string | null
          ticket_price?: number | null
          title?: string
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Relationships: []
      }
      notice_comments: {
        Row: {
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          notice_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          notice_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          notice_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notice_comments_notice_id_fkey'
            columns: ['notice_id']
            isOneToOne: false
            referencedRelation: 'notices'
            referencedColumns: ['id']
          },
        ]
      }
      notices: {
        Row: {
          author_name: string | null
          category: string
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          is_pinned: boolean | null
          is_published: boolean | null
          published_at: string | null
          search_vector: unknown
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_name?: string | null
          category?: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          search_vector?: unknown
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          search_vector?: unknown
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      exhibition_details: {
        Row: {
          artists: Json | null
          artworks: Json | null
          content: string | null
          created_at: string | null
          curator: string | null
          current_visitors: number | null
          description: string | null
          end_date: string | null
          featured_image_url: string | null
          gallery_images: string[] | null
          id: string | null
          is_featured: boolean | null
          is_published: boolean | null
          location: string | null
          max_capacity: number | null
          search_vector: unknown
          start_date: string | null
          status: string | null
          subtitle: string | null
          ticket_price: number | null
          title: string | null
          updated_at: string | null
          venue: string | null
          views: number | null
        }
        Insert: {
          artists?: never
          artworks?: never
          content?: string | null
          created_at?: string | null
          curator?: string | null
          current_visitors?: number | null
          description?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          max_capacity?: number | null
          search_vector?: unknown
          start_date?: string | null
          status?: string | null
          subtitle?: string | null
          ticket_price?: number | null
          title?: string | null
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Update: {
          artists?: never
          artworks?: never
          content?: string | null
          created_at?: string | null
          curator?: string | null
          current_visitors?: number | null
          description?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          max_capacity?: number | null
          search_vector?: unknown
          start_date?: string | null
          status?: string | null
          subtitle?: string | null
          ticket_price?: number | null
          title?: string | null
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Relationships: []
      }
      public_artworks: {
        Row: {
          artist_id: string | null
          category: Database['public']['Enums']['artwork_category'] | null
          currency: string | null
          description: string | null
          description_en: string | null
          dimensions: Json | null
          id: string | null
          images: Json | null
          is_featured: boolean | null
          is_for_sale: boolean | null
          likes: number | null
          materials: string[] | null
          medium: string | null
          price: number | null
          published_at: string | null
          style: string | null
          tags: string[] | null
          title: string | null
          title_en: string | null
          views: number | null
          year_created: number | null
        }
        Insert: {
          artist_id?: string | null
          category?: Database['public']['Enums']['artwork_category'] | null
          currency?: string | null
          description?: string | null
          description_en?: string | null
          dimensions?: Json | null
          id?: string | null
          images?: Json | null
          is_featured?: boolean | null
          is_for_sale?: boolean | null
          likes?: number | null
          materials?: string[] | null
          medium?: string | null
          price?: number | null
          published_at?: string | null
          style?: string | null
          tags?: string[] | null
          title?: string | null
          title_en?: string | null
          views?: number | null
          year_created?: number | null
        }
        Update: {
          artist_id?: string | null
          category?: Database['public']['Enums']['artwork_category'] | null
          currency?: string | null
          description?: string | null
          description_en?: string | null
          dimensions?: Json | null
          id?: string | null
          images?: Json | null
          is_featured?: boolean | null
          is_for_sale?: boolean | null
          likes?: number | null
          materials?: string[] | null
          medium?: string | null
          price?: number | null
          published_at?: string | null
          style?: string | null
          tags?: string[] | null
          title?: string | null
          title_en?: string | null
          views?: number | null
          year_created?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'artworks_artist_id_fkey'
            columns: ['artist_id']
            isOneToOne: false
            referencedRelation: 'artists'
            referencedColumns: ['id']
          },
        ]
      }
      public_events: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          content: string | null
          created_at: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          event_date: string | null
          event_type: string | null
          exhibition_id: string | null
          featured_image_url: string | null
          gallery_images: string[] | null
          id: string | null
          is_featured: boolean | null
          is_published: boolean | null
          location: string | null
          luma_url: string | null
          luma_visibility: string | null
          max_participants: number | null
          organizer: string | null
          registration_deadline: string | null
          registration_fee: number | null
          registration_required: boolean | null
          search_vector: unknown
          status: string | null
          title: string | null
          updated_at: string | null
          venue: string | null
          views: number | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          content?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_date?: string | null
          event_type?: string | null
          exhibition_id?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          luma_url?: string | null
          luma_visibility?: string | null
          max_participants?: number | null
          organizer?: string | null
          registration_deadline?: string | null
          registration_fee?: number | null
          registration_required?: boolean | null
          search_vector?: unknown
          status?: string | null
          title?: string | null
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          content?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_date?: string | null
          event_type?: string | null
          exhibition_id?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          luma_url?: string | null
          luma_visibility?: string | null
          max_participants?: number | null
          organizer?: string | null
          registration_deadline?: string | null
          registration_fee?: number | null
          registration_required?: boolean | null
          search_vector?: unknown
          status?: string | null
          title?: string | null
          updated_at?: string | null
          venue?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibition_details'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_exhibition_id_fkey'
            columns: ['exhibition_id']
            isOneToOne: false
            referencedRelation: 'exhibitions'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      increment_event_views: {
        Args: { event_uuid: string }
        Returns: undefined
      }
      increment_exhibition_views: {
        Args: { exhibition_uuid: string }
        Returns: undefined
      }
      increment_notice_views: {
        Args: { notice_uuid: string }
        Returns: undefined
      }
      is_archive_path: { Args: { value: string }; Returns: boolean }
    }
    Enums: {
      artwork_category:
        | 'calligraphy'
        | 'traditional-painting'
        | 'modern-painting'
        | 'sculpture'
        | 'photography'
        | 'digital-art'
        | 'mixed-media'
        | 'installation'
        | 'video-art'
      artwork_status: 'draft' | 'published' | 'archived' | 'in-exhibition' | 'pending_review'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      artwork_category: [
        'calligraphy',
        'traditional-painting',
        'modern-painting',
        'sculpture',
        'photography',
        'digital-art',
        'mixed-media',
        'installation',
        'video-art',
      ],
      artwork_status: ['draft', 'published', 'archived', 'in-exhibition', 'pending_review'],
    },
  },
} as const
