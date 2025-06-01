import Airtable from 'airtable';

// Airtable 설정
const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;

if (!airtableApiKey || !airtableBaseId) {
  console.warn('Airtable credentials not configured');
}

// Airtable 클라이언트 초기화
const airtable = new Airtable({ apiKey: airtableApiKey });
const base = airtable.base(airtableBaseId!);

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
  // Artists 조회
  static async getAllArtists(): Promise<AirtableArtist[]> {
    if (!airtableApiKey || !airtableBaseId) {
      throw new Error('Airtable credentials not configured');
    }

    try {
      const records = await base(TABLES.ARTISTS).select({
        maxRecords: 1000,
        sort: [{ field: 'Name (Korean)', direction: 'asc' }]
      }).all();

      return records.map(record => ({
        id: record.id,
        fields: record.fields as unknown as AirtableArtist['fields']
      }));
    } catch (error) {
      console.error('Error fetching artists from Airtable:', error);
      throw error;
    }
  }

  // Artworks 조회
  static async getAllArtworks(): Promise<AirtableArtwork[]> {
    if (!airtableApiKey || !airtableBaseId) {
      throw new Error('Airtable credentials not configured');
    }

    try {
      const records = await base(TABLES.ARTWORKS).select({
        maxRecords: 1000,
        sort: [{ field: 'Title (Korean)', direction: 'asc' }]
      }).all();

      return records.map(record => ({
        id: record.id,
        fields: record.fields as unknown as AirtableArtwork['fields']
      }));
    } catch (error) {
      console.error('Error fetching artworks from Airtable:', error);
      throw error;
    }
  }

  // Exhibitions 조회
  static async getAllExhibitions(): Promise<AirtableExhibition[]> {
    if (!airtableApiKey || !airtableBaseId) {
      throw new Error('Airtable credentials not configured');
    }

    try {
      const records = await base(TABLES.EXHIBITIONS).select({
        maxRecords: 1000,
        sort: [{ field: 'Start Date', direction: 'desc' }]
      }).all();

      return records.map(record => ({
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
    if (!airtableApiKey || !airtableBaseId) {
      throw new Error('Airtable credentials not configured');
    }

    try {
      const record = await base(TABLES.ARTISTS).find(id);
      return {
        id: record.id,
        fields: record.fields as unknown as AirtableArtist['fields']
      };
    } catch (error) {
      console.error('Error fetching artist from Airtable:', error);
      return null;
    }
  }
} 