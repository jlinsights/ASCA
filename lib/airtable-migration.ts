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

  // 전체 마이그레이션 orchestration
  static async migrateAll(): Promise<{
    artists: { success: number; failed: number };
    artworks: { success: number; failed: number };
    exhibitions: { success: number; failed: number };
  }> {
    console.log('Starting migration...');
    
    // 1. Artists 먼저 마이그레이션 (다른 테이블의 외래키 참조)
    console.log('Migrating artists...');
    const artistResult = await this.migrateArtists();
    console.log(`Artists: ${artistResult.success} success, ${artistResult.failed} failed`);
    
    // 2. Artworks 마이그레이션 (artist_id 필요)
    console.log('Migrating artworks...');
    const artworkResult = await this.migrateArtworks(artistResult.artistIdMap);
    console.log(`Artworks: ${artworkResult.success} success, ${artworkResult.failed} failed`);
    
    // 3. Exhibitions 마이그레이션
    console.log('Migrating exhibitions...');
    const exhibitionResult = await this.migrateExhibitions();
    console.log(`Exhibitions: ${exhibitionResult.success} success, ${exhibitionResult.failed} failed`);
    
    console.log('Migration completed!');
    
    return {
      artists: { success: artistResult.success, failed: artistResult.failed },
      artworks: artworkResult,
      exhibitions: exhibitionResult
    };
  }
} 