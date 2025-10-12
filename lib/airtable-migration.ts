import { AirtableService, AirtableArtist, AirtableArtwork, AirtableExhibition, AirtableEvent, AirtableNotice } from './airtable';
import { createArtist, createArtwork, type ArtistInsert, type ArtworkInsert } from './admin-api';
import { createExhibition } from './supabase/cms';
import type { ExhibitionFormData } from '@/types/cms';
import { ensureSupabase } from './supabase';

// Airtable → Supabase 데이터 변환 함수들
export class AirtableMigration {
  
  // 다중 라인 필드 파싱 유틸리티
  private static parseMultiLineField(field: string | undefined): string[] {
    if (!field) return [];
    return field.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  }

  // Artist 데이터 변환
  private static transformAirtableArtist(record: any): ArtistInsert {
    const fields = record.fields;
    
    // DOB 날짜 포맷 변환 함수
    const parseDOB = (dobString: string | undefined): string | null => {
      if (!dobString) return null;
      try {
        // YYYY-MM-DD 형식으로 변환
        const date = new Date(dobString);
        const dateString = date.toISOString().split('T')[0];
        return dateString || null;
      } catch {
        return null;
      }
    };
    
    return {
      name: fields['Name (Korean)'] || '',
      name_en: fields['Name (English)'] || null,
      name_ja: fields['Name (Japanese)'] || null,
      name_zh: fields['Name (Chinese)'] || null,
      bio: fields['Bio (Korean)'] || '',
      bio_en: fields['Bio (English)'] || null,
      bio_ja: fields['Bio (Japanese)'] || null,
      bio_zh: fields['Bio (Chinese)'] || null,
      birth_year: fields['Birth Year'] || null,
      nationality: fields['Nationality'] || null,
      specialties: fields['Specialties'] || [],
      awards: fields['Awards'] || [],
      exhibitions: fields['Exhibitions'] || [],
      profile_image: fields['Profile Image']?.[0]?.url || null,
      membership_type: fields['Membership Type'] || '준회원',
      artist_type: fields['Artist Type'] || '일반작가',
      title: fields['Title'] || null
    };
  }

  // Artwork 데이터 변환 (artist_id는 나중에 매핑)
  private static transformAirtableArtwork(record: any, artistIdMap: Map<string, string>): ArtworkInsert | null {
    const fields = record.fields;
    
    // 작가 ID 매핑 확인
    const airtableArtistId = fields['Artist']?.[0]; // Airtable 링크 필드
    if (!airtableArtistId || !artistIdMap.has(airtableArtistId)) {
      
      return null;
    }
    
    return {
      title: fields['Title (Korean)'] || '',
      title_en: fields['Title (English)'] || null,
      title_ja: fields['Title (Japanese)'] || null,
      title_zh: fields['Title (Chinese)'] || null,
      description: fields['Description (Korean)'] || '',
      description_en: fields['Description (English)'] || null,
      artist_id: artistIdMap.get(airtableArtistId)!,
      category: fields['Category'] || 'mixed-media',
      style: fields['Style'] || 'traditional',
      year: fields['Year'] || null,
      materials: fields['Materials'] || [],
      dimensions: {
        width: fields['Width (cm)'] || 0,
        height: fields['Height (cm)'] || 0,
        depth: fields['Depth (cm)'] || undefined,
        unit: 'cm' as const
      },
      price: fields['Price Amount'] ? {
        amount: fields['Price Amount'],
        currency: fields['Price Currency'] || 'KRW'
      } : null,
      availability: fields['Availability'] || 'available',
      featured: fields['Featured'] || false,
      tags: fields['Tags'] || [],
      images: fields['Images']?.map((img: any) => img.url) || [],
      thumbnail: fields['Images']?.[0]?.url || null,
      condition: fields['Condition'] || null,
      technique: fields['Technique'] || null,
      authenticity_certificate: fields['Authenticity Certificate'] || false
    };
  }

  // Exhibition 데이터 변환
  private static transformAirtableExhibition(record: any): ExhibitionFormData {
    const fields = record.fields;
    
    return {
      title: fields['Title (Korean)'] || '',
      description: fields['Description (Korean)'] || '',
      start_date: fields['Start Date'] || '',
      end_date: fields['End Date'] || '',
      location: fields['Location'] || null,
      venue: fields['Venue'] || null,
      curator: fields['Curator'] || null,
      featured_image_url: fields['Featured Image']?.[0]?.url || null,
      gallery_images: fields['Gallery Images']?.map((img: any) => img.url) || [],
      status: fields['Status'] || 'upcoming',
      is_featured: fields['Is Featured'] || false,
      is_published: fields['Is Published'] !== false,
      ticket_price: fields['Ticket Price'] || null,
      currency: fields['Currency'] || 'KRW',
      is_free: fields['Is Free'] || false,
      subtitle: fields['Subtitle'] || null,
      address: fields['Address'] || null,
      max_capacity: fields['Max Capacity'] || null,
      admission_fee: fields['Ticket Price'] || null,
      opening_hours: fields['Opening Hours'] || null,
      contact: fields['Contact'] || null,
      website: fields['Website'] || null
    };
  }

  // Event 데이터 변환
  private static transformAirtableEvent(record: any): any {
    const fields = record.fields;
    
    return {
      title: fields['Title (Korean)'] || '',
      title_en: fields['Title (English)'] || null,
      title_zh: fields['Title (Chinese)'] || null,
      description: fields['Description (Korean)'] || '',
      description_en: fields['Description (English)'] || null,
      description_zh: fields['Description (Chinese)'] || null,
      start_date: fields['Start Date'] || '',
      end_date: fields['End Date'] || null,
      registration_start: fields['Registration Start'] || null,
      registration_end: fields['Registration End'] || null,
      location: fields['Location'] || null,
      venue: fields['Venue'] || null,
      address: fields['Address'] || null,
      max_participants: fields['Max Participants'] || null,
      current_participants: 0,
      registration_fee: fields['Registration Fee'] || null,
      currency: fields['Currency'] || 'KRW',
      is_free: fields['Is Free'] || false,
      featured_image_url: fields['Featured Image']?.[0]?.url || null,
      gallery_images: fields['Gallery Images']?.map((img: any) => img.url) || [],
      organizer: fields['Organizer'] || null,
      contact_email: fields['Contact Email'] || null,
      contact_phone: fields['Contact Phone'] || null,
      website: fields['Website'] || null,
      status: fields['Status'] || 'draft',
      event_type: fields['Event Type'] || 'other',
      is_featured: fields['Is Featured'] || false,
      is_published: fields['Is Published'] !== false,
      tags: fields['Tags'] || [],
      requirements: fields['Requirements'] || null,
      notes: fields['Notes'] || null,
      airtable_id: record.id
    };
  }

  // Notice 데이터 변환
  private static transformAirtableNotice(record: any): any {
    const fields = record.fields;
    
    return {
      title: fields['Title (Korean)'] || '',
      title_en: fields['Title (English)'] || null,
      title_zh: fields['Title (Chinese)'] || null,
      content: fields['Content (Korean)'] || '',
      content_en: fields['Content (English)'] || null,
      content_zh: fields['Content (Chinese)'] || null,
      summary: fields['Summary'] || null,
      author: fields['Author'] || null,
      category: fields['Category'] || 'general',
      priority: fields['Priority'] || 'normal',
      status: fields['Status'] || 'draft',
      is_pinned: fields['Is Pinned'] || false,
      is_featured: fields['Is Featured'] || false,
      show_on_homepage: fields['Show on Homepage'] || false,
      published_at: fields['Published At'] || null,
      expires_at: fields['Expires At'] || null,
      effective_date: fields['Effective Date'] || null,
      attachments: fields['Attachments']?.map((att: any) => ({
        id: att.id,
        url: att.url,
        filename: att.filename
      })) || [],
      featured_image_url: fields['Featured Image']?.[0]?.url || null,
      target_audience: fields['Target Audience'] || [],
      tags: fields['Tags'] || [],
      external_link: fields['External Link'] || null,
      download_url: fields['Download URL'] || null,
      airtable_id: record.id
    };
  }

  // 순차적 마이그레이션 (외래키 관계 고려)
  static async migrateArtists(): Promise<{ success: number; failed: number; artistIdMap: Map<string, string> }> {
    const airtableArtists = await AirtableService.getAllArtists();
    
    let success = 0;
    let failed = 0;
    const artistIdMap = new Map<string, string>();
    
    for (const airtableArtist of airtableArtists) {
      try {
        const artistData = this.transformAirtableArtist(airtableArtist);
        const result = await createArtist(artistData);
        artistIdMap.set(airtableArtist.id, result.id);
        success++;
      } catch (error) {
        
        failed++;
      }
    }
    
    return { success, failed, artistIdMap };
  }

  static async migrateArtworks(artistIdMap: Map<string, string>): Promise<{ success: number; failed: number }> {
    const airtableArtworks = await AirtableService.getAllArtworks();
    
    let success = 0;
    let failed = 0;
    
    for (const airtableArtwork of airtableArtworks) {
      try {
        const artworkData = this.transformAirtableArtwork(airtableArtwork, artistIdMap);
        if (artworkData) {
          await createArtwork(artworkData);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        
        failed++;
      }
    }
    
    return { success, failed };
  }

  static async migrateExhibitions(): Promise<{ success: number; failed: number }> {
    const airtableExhibitions = await AirtableService.getAllExhibitions();
    
    let success = 0;
    let failed = 0;
    
    for (const airtableExhibition of airtableExhibitions) {
      try {
        const exhibitionData = this.transformAirtableExhibition(airtableExhibition);
        await createExhibition(exhibitionData);
        success++;
      } catch (error) {
        
        failed++;
      }
    }
    
    return { success, failed };
  }

  static async migrateEvents(): Promise<{ success: number; failed: number }> {
    const airtableEvents = await AirtableService.getAllEvents();
    const supabase = ensureSupabase();
    
    let success = 0;
    let failed = 0;
    
    for (const airtableEvent of airtableEvents) {
      try {
        const eventData = this.transformAirtableEvent(airtableEvent);
        const { error } = await supabase.from('events').insert(eventData);
        
        if (error) {
          throw error;
        }
        
        success++;
      } catch (error) {
        
        failed++;
      }
    }
    
    return { success, failed };
  }

  static async migrateNotices(): Promise<{ success: number; failed: number }> {
    const airtableNotices = await AirtableService.getAllNotices();
    const supabase = ensureSupabase();
    
    let success = 0;
    let failed = 0;
    
    for (const airtableNotice of airtableNotices) {
      try {
        const noticeData = this.transformAirtableNotice(airtableNotice);
        const { error } = await supabase.from('notices').insert(noticeData);
        
        if (error) {
          throw error;
        }
        
        success++;
      } catch (error) {
        
        failed++;
      }
    }
    
    return { success, failed };
  }

  // 전체 마이그레이션 실행
  static async migrateAll(): Promise<{
    artists: { success: number; failed: number; total: number };
    artworks: { success: number; failed: number; total: number };
    exhibitions: { success: number; failed: number; total: number };
    events: { success: number; failed: number; total: number };
    notices: { success: number; failed: number; total: number };
  }> {

    // 1. Artists 마이그레이션 (배치 처리)
    
    const artistResults = await this.migrateArtistsInBatches();

    // 아티스트 ID 매핑 생성
    const artistIdMap = await this.createArtistIdMap();
    
    // 2. Artworks 마이그레이션
    
    const artworkResults = await this.migrateArtworks(artistIdMap);

    // 3. Exhibitions 마이그레이션
    
    const exhibitionResults = await this.migrateExhibitions();

    // 4. Events 마이그레이션
    
    const eventResults = await this.migrateEvents();

    // 5. Notices 마이그레이션
    
    const noticeResults = await this.migrateNotices();

    return {
      artists: { ...artistResults, total: artistResults.success + artistResults.failed },
      artworks: { ...artworkResults, total: artworkResults.success + artworkResults.failed },
      exhibitions: { ...exhibitionResults, total: exhibitionResults.success + exhibitionResults.failed },
      events: { ...eventResults, total: eventResults.success + eventResults.failed },
      notices: { ...noticeResults, total: noticeResults.success + noticeResults.failed }
    };
  }

  // 배치 처리를 통한 Artists 마이그레이션
  static async migrateArtistsInBatches(batchSize: number = 50): Promise<{ success: number; failed: number }> {
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      const result = await AirtableService.processAllArtistsInBatches(
        async (batch) => {
          for (const airtableArtist of batch) {
            try {
              const artistData = this.transformAirtableArtist(airtableArtist);
              await createArtist(artistData);
              totalSuccess++;
            } catch (error) {
              
              totalFailed++;
            }
          }
        },
        batchSize
      );

      return {
        success: totalSuccess,
        failed: totalFailed
      };
    } catch (error) {
      
      throw error;
    }
  }

  // Airtable ID → Supabase ID 매핑 생성
  static async createArtistIdMap(): Promise<Map<string, string>> {
    const supabase = ensureSupabase();
    const map = new Map<string, string>();

    try {
      // Supabase에서 모든 작가 조회 (이름 기준으로 매핑)
      const { data: supabaseArtists, error } = await supabase
        .from('artists')
        .select('id, name, name_en');

      if (error) {
        
        throw error;
      }

      // Airtable에서 모든 작가 조회
      const airtableArtists = await AirtableService.getAllArtists();

      // 이름 기준으로 매핑 생성
      for (const airtableArtist of airtableArtists) {
        const airtableName = airtableArtist.fields['Name (Korean)'];
        const airtableNameEn = airtableArtist.fields['Name (English)'];

        const matchedSupabaseArtist = supabaseArtists?.find(sa => 
          sa.name === airtableName || 
          (airtableNameEn && sa.name_en === airtableNameEn)
        );

        if (matchedSupabaseArtist) {
          map.set(airtableArtist.id, matchedSupabaseArtist.id);
        }
      }

      return map;
    } catch (error) {
      
      throw error;
    }
  }
} 