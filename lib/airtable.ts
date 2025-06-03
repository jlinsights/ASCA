import Airtable from 'airtable';

// Airtable 설정
const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;

// Airtable 클라이언트 초기화 - 빌드 시에는 초기화하지 않음
let airtable: Airtable | null = null;
let base: any = null;

function initializeAirtable() {
  if (!airtableApiKey || !airtableBaseId) {
    throw new Error('Airtable credentials not configured');
  }
  
  if (!airtable) {
    airtable = new Airtable({ apiKey: airtableApiKey });
    base = airtable.base(airtableBaseId);
  }
  
  return base;
}

// Airtable 테이블 정의
export const TABLES = {
  ARTISTS: 'Artists',
  ARTWORKS: 'Artworks', 
  EXHIBITIONS: 'Exhibitions',
  EVENTS: 'Events',
  NOTICES: 'Notices'
} as const;

// 타입 정의
export interface AirtableArtist {
  id: string;
  fields: {
    'Name (Korean)': string;
    'Name (English)'?: string;
    'Name (Japanese)'?: string;
    'Name (Chinese)'?: string;
    'Bio (Korean)': string;
    'Bio (English)'?: string;
    'Bio (Japanese)'?: string;
    'Bio (Chinese)'?: string;
    'Birth Year'?: number;
    'Nationality'?: string;
    'Specialties'?: string[];
    'Awards'?: string[];
    'Exhibitions'?: string[];
    'Profile Image'?: Array<{
      id: string;
      url: string;
      filename: string;
    }>;
    'Membership Type'?: '준회원' | '정회원' | '특별회원' | '명예회원';
    'Artist Type'?: '공모작가' | '청년작가' | '일반작가' | '추천작가' | '초대작가';
    'Title'?: '이사' | '상임이사' | '감사' | '고문' | '상임고문' | '자문위원' | '운영위원' | '심사위원' | '운영위원장' | '심사위원장' | '이사장' | '명예이사장' | '부회장' | '회장';
    'Created'?: string;
    'Last Modified'?: string;
  };
}

export interface AirtableArtwork {
  id: string;
  fields: {
    'Title (Korean)': string;
    'Title (English)'?: string;
    'Title (Japanese)'?: string;
    'Title (Chinese)'?: string;
    'Description (Korean)': string;
    'Description (English)'?: string;
    'Artist': string[]; // Airtable Link field
    'Category'?: 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media';
    'Style'?: 'traditional' | 'contemporary' | 'modern';
    'Year'?: number;
    'Materials'?: string[];
    'Width (cm)'?: number;
    'Height (cm)'?: number;
    'Depth (cm)'?: number;
    'Price Amount'?: number;
    'Price Currency'?: 'KRW' | 'USD' | 'EUR' | 'JPY';
    'Availability'?: 'available' | 'sold' | 'reserved';
    'Featured'?: boolean;
    'Tags'?: string[];
    'Images'?: Array<{
      id: string;
      url: string;
      filename: string;
    }>;
    'Condition'?: string;
    'Technique'?: string;
    'Authenticity Certificate'?: boolean;
    'Created'?: string;
    'Last Modified'?: string;
  };
}

export interface AirtableExhibition {
  id: string;
  fields: {
    'Title (Korean)': string;
    'Title (English)'?: string;
    'Description (Korean)': string;
    'Start Date': string;
    'End Date': string;
    'Location'?: string;
    'Venue'?: string;
    'Curator'?: string;
    'Featured Image'?: Array<{
      id: string;
      url: string;
      filename: string;
    }>;
    'Gallery Images'?: Array<{
      id: string;
      url: string;
      filename: string;
    }>;
    'Status': 'upcoming' | 'current' | 'past';
    'Is Featured'?: boolean;
    'Is Published'?: boolean;
    'Ticket Price'?: number;
    'Currency'?: string;
    'Is Free'?: boolean;
    'Participating Artists'?: string[]; // Airtable Link field
    'Featured Artworks'?: string[]; // Airtable Link field
    'Created'?: string;
    'Last Modified'?: string;
  };
}

// Airtable 데이터 조회 함수들
export class AirtableService {
  // Artists 조회 - 모든 레코드를 가져오기 위해 페이지네이션 사용
  static async getAllArtists(): Promise<AirtableArtist[]> {
    const currentBase = initializeAirtable();

    try {
      // maxRecords를 제거하고 .all()을 사용하면 자동으로 페이지네이션 처리됨
      const records = await currentBase(TABLES.ARTISTS).select({
        sort: [{ field: 'Name (Korean)', direction: 'asc' }]
      }).all();

      console.log(`Fetched ${records.length} artists from Airtable`);

      return records.map((record: any) => ({
        id: record.id,
        fields: record.fields as unknown as AirtableArtist['fields']
      }));
    } catch (error) {
      console.error('Error fetching artists from Airtable:', error);
      throw error;
    }
  }

  // Artworks 조회 - 모든 레코드 가져오기
  static async getAllArtworks(): Promise<AirtableArtwork[]> {
    const currentBase = initializeAirtable();

    try {
      const records = await currentBase(TABLES.ARTWORKS).select({
        sort: [{ field: 'Title (Korean)', direction: 'asc' }]
      }).all();

      console.log(`Fetched ${records.length} artworks from Airtable`);

      return records.map((record: any) => ({
        id: record.id,
        fields: record.fields as unknown as AirtableArtwork['fields']
      }));
    } catch (error) {
      console.error('Error fetching artworks from Airtable:', error);
      throw error;
    }
  }

  // Exhibitions 조회 - 모든 레코드 가져오기
  static async getAllExhibitions(): Promise<AirtableExhibition[]> {
    const currentBase = initializeAirtable();

    try {
      const records = await currentBase(TABLES.EXHIBITIONS).select({
        sort: [{ field: 'Start Date', direction: 'desc' }]
      }).all();

      console.log(`Fetched ${records.length} exhibitions from Airtable`);

      return records.map((record: any) => ({
        id: record.id,
        fields: record.fields as unknown as AirtableExhibition['fields']
      }));
    } catch (error) {
      console.error('Error fetching exhibitions from Airtable:', error);
      throw error;
    }
  }

  // 특정 아티스트 조회
  static async getArtistById(id: string): Promise<AirtableArtist | null> {
    const currentBase = initializeAirtable();

    try {
      const record = await currentBase(TABLES.ARTISTS).find(id);
      return {
        id: record.id,
        fields: record.fields as unknown as AirtableArtist['fields']
      };
    } catch (error) {
      console.error('Error fetching artist from Airtable:', error);
      return null;
    }
  }

  // 배치 처리를 위한 작가 데이터 가져오기 (페이지별)
  static async getArtistsBatch(offset: number = 0, limit: number = 100): Promise<{
    artists: AirtableArtist[];
    hasMore: boolean;
    total: number;
  }> {
    const currentBase = initializeAirtable();

    try {
      // 먼저 전체 개수 확인
      const allRecords = await currentBase(TABLES.ARTISTS).select({
        fields: ['Name (Korean)'], // 최소한의 필드만 가져와서 성능 향상
        sort: [{ field: 'Name (Korean)', direction: 'asc' }]
      }).all();

      const total = allRecords.length;

      // 실제 데이터 가져오기 (배치)
      const records = await currentBase(TABLES.ARTISTS).select({
        sort: [{ field: 'Name (Korean)', direction: 'asc' }]
      }).eachPage(async (records: any, fetchNextPage: any) => {
        // 현재 페이지의 레코드 수를 확인하고 필요한 범위만 처리
        const startIndex = offset;
        const endIndex = offset + limit;
        
        // 현재 배치에 해당하는 레코드만 반환
        if (records.length > startIndex) {
          return records.slice(startIndex, endIndex);
        }
        
        fetchNextPage();
      });

      const artists = records.map((record: any) => ({
        id: record.id,
        fields: record.fields as unknown as AirtableArtist['fields']
      }));

      return {
        artists,
        hasMore: offset + limit < total,
        total
      };
    } catch (error) {
      console.error('Error fetching artists batch from Airtable:', error);
      throw error;
    }
  }

  // 대용량 데이터 스트리밍 처리
  static async processAllArtistsInBatches(
    processor: (batch: AirtableArtist[]) => Promise<void>,
    batchSize: number = 50
  ): Promise<{ processed: number; errors: number }> {
    const currentBase = initializeAirtable();
    let processed = 0;
    let errors = 0;

    try {
      await currentBase(TABLES.ARTISTS).select({
        sort: [{ field: 'Name (Korean)', direction: 'asc' }]
      }).eachPage(async (records: any, fetchNextPage: any) => {
        try {
          // 레코드들을 배치 크기로 나누어 처리
          for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize).map((record: any) => ({
              id: record.id,
              fields: record.fields as unknown as AirtableArtist['fields']
            }));

            await processor(batch);
            processed += batch.length;
            
            console.log(`Processed ${processed} artists...`);
          }

          fetchNextPage();
        } catch (error) {
          console.error('Error processing batch:', error);
          errors += records.length;
          fetchNextPage();
        }
      });

      console.log(`Batch processing completed: ${processed} processed, ${errors} errors`);
      return { processed, errors };
    } catch (error) {
      console.error('Error in batch processing:', error);
      throw error;
    }
  }
} 