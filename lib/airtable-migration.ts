import { AirtableService, AirtableArtist, AirtableArtwork, AirtableExhibition } from './airtable';
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
      console.warn(`Artist not found for artwork: ${fields['Title (Korean)']}`);
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
        console.error(`Artist migration failed for ${airtableArtist.fields['Name (Korean)']}:`, error);
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
        console.error(`Artwork migration failed for ${airtableArtwork.fields['Title (Korean)']}:`, error);
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
        console.error(`Exhibition migration failed for ${airtableExhibition.fields['Title (Korean)']}:`, error);
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
  }> {
    console.log('Starting full migration...');
    
    // 1. Artists 마이그레이션 (배치 처리)
    console.log('Migrating artists in batches...');
    const artistResults = await this.migrateArtistsInBatches();
    console.log(`Artists migration completed: ${artistResults.success} success, ${artistResults.failed} failed`);
    
    // 아티스트 ID 매핑 생성
    const artistIdMap = await this.createArtistIdMap();
    
    // 2. Artworks 마이그레이션
    console.log('Migrating artworks...');
    const artworkResults = await this.migrateArtworks(artistIdMap);
    console.log(`Artworks migration completed: ${artworkResults.success} success, ${artworkResults.failed} failed`);
    
    // 3. Exhibitions 마이그레이션
    console.log('Migrating exhibitions...');
    const exhibitionResults = await this.migrateExhibitions();
    console.log(`Exhibitions migration completed: ${exhibitionResults.success} success, ${exhibitionResults.failed} failed`);
    
    return {
      artists: { ...artistResults, total: artistResults.success + artistResults.failed },
      artworks: { ...artworkResults, total: artworkResults.success + artworkResults.failed },
      exhibitions: { ...exhibitionResults, total: exhibitionResults.success + exhibitionResults.failed }
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
              console.error(`Artist migration failed for ${airtableArtist.fields['Name (Korean)']}:`, error);
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
      console.error('Batch migration failed:', error);
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
        console.error('Error fetching Supabase artists:', error);
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

      console.log(`Created artist ID mapping: ${map.size} matches found`);
      return map;
    } catch (error) {
      console.error('Error creating artist ID map:', error);
      throw error;
    }
  }
} 