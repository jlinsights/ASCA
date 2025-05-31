import { db } from './index';
import { 
  users, 
  artists, 
  artworks, 
  exhibitions, 
  news, 
  events,
  galleries,
  exhibitionArtworks,
  galleryArtworks,
  adminPermissions
} from './schema';

// 시드 데이터 생성 함수
export async function seedDatabase() {
  console.log('🌱 데이터베이스 시드 데이터 생성을 시작합니다...');

  try {
    // 1. 사용자 데이터 생성
    console.log('👥 사용자 데이터 생성 중...');
    const sampleUsers = [
      {
        id: 'user-admin-001',
        email: 'info@orientalcalligraphy.org',
        name: '관리자',
        role: 'admin' as const,
        bio: '동양서예협회 관리자입니다.',
      },
      {
        id: 'user-artist-001',
        email: 'artist1@example.com',
        name: '김서예',
        role: 'artist' as const,
        bio: '전통 서예의 현대적 해석을 추구하는 작가입니다.',
      },
      {
        id: 'user-artist-002',
        email: 'artist2@example.com',
        name: '이묵향',
        role: 'artist' as const,
        bio: '한중일 서예 교류에 힘쓰는 국제적 작가입니다.',
      },
      {
        id: 'user-member-001',
        email: 'member1@example.com',
        name: '박문인',
        role: 'member' as const,
        bio: '서예를 사랑하는 일반 회원입니다.',
      }
    ];

    await db.insert(users).values(sampleUsers);

    // 2. 작가 데이터 생성
    console.log('🎨 작가 데이터 생성 중...');
    const sampleArtists = [
      {
        id: 'artist-001',
        userId: 'user-artist-001',
        name: '김서예',
        nameKo: '김서예',
        nameEn: 'Kim Seoye',
        nameCn: '金书艺',
        nameJp: 'キム・ソイェ',
        bio: '전통 서예의 현대적 해석을 통해 새로운 예술 언어를 창조하는 작가입니다.',
        bioKo: '전통 서예의 현대적 해석을 통해 새로운 예술 언어를 창조하는 작가입니다.',
        bioEn: 'An artist who creates new artistic language through modern interpretation of traditional calligraphy.',
        birthYear: 1975,
        nationality: '대한민국',
        specialties: JSON.stringify(['행서', '초서', '현대서예']),
        awards: JSON.stringify([
          { year: 2020, title: '대한민국 서예대전 대상' },
          { year: 2019, title: '동아시아 서예교류전 우수상' }
        ]),
        exhibitions: JSON.stringify([
          { year: 2023, title: '정법과 창신의 조화', type: 'solo' },
          { year: 2022, title: '현대 서예의 새로운 지평', type: 'group' }
        ]),
        website: 'https://kimseoye.art',
        socialMedia: JSON.stringify({
          instagram: '@kimseoye_art',
          facebook: 'kimseoye.artist'
        }),
      },
      {
        id: 'artist-002',
        userId: 'user-artist-002',
        name: '이묵향',
        nameKo: '이묵향',
        nameEn: 'Lee Mukhyang',
        nameCn: '李墨香',
        nameJp: 'イ・ムキャン',
        bio: '한중일 서예 교류의 가교 역할을 하며 동아시아 서예 문화 발전에 기여하고 있습니다.',
        bioKo: '한중일 서예 교류의 가교 역할을 하며 동아시아 서예 문화 발전에 기여하고 있습니다.',
        bioEn: 'Serving as a bridge for Korea-China-Japan calligraphy exchange and contributing to the development of East Asian calligraphy culture.',
        birthYear: 1968,
        nationality: '대한민국',
        specialties: JSON.stringify(['해서', '예서', '전서']),
        awards: JSON.stringify([
          { year: 2021, title: '아시아 서예 문화상' },
          { year: 2018, title: '국제 서예 교류 공로상' }
        ]),
        exhibitions: JSON.stringify([
          { year: 2023, title: '동아시아 서예 삼국지', type: 'group' },
          { year: 2021, title: '묵향의 여정', type: 'solo' }
        ]),
      }
    ];

    await db.insert(artists).values(sampleArtists);

    // 3. 작품 데이터 생성
    console.log('🖼️ 작품 데이터 생성 중...');
    const sampleArtworks = [
      {
        id: 'artwork-001',
        artistId: 'artist-001',
        title: '정법의 계승',
        titleKo: '정법의 계승',
        titleEn: 'Inheritance of Orthodox Dharma',
        titleCn: '正法的传承',
        titleJp: '正法の継承',
        description: '전통 서예의 정신을 현대적 감각으로 재해석한 작품입니다.',
        descriptionKo: '전통 서예의 정신을 현대적 감각으로 재해석한 작품입니다.',
        descriptionEn: 'A work that reinterprets the spirit of traditional calligraphy with modern sensibility.',
        category: 'calligraphy' as const,
        style: '행서',
        medium: '한지, 먹',
        dimensions: '70 x 140 cm',
        year: 2023,
        imageUrl: '/images/artworks/artwork-001.jpg',
        isFeatured: true,
        tags: JSON.stringify(['전통', '현대', '행서', '정법']),
      },
      {
        id: 'artwork-002',
        artistId: 'artist-001',
        title: '창신의 조화',
        titleKo: '창신의 조화',
        titleEn: 'Harmony of Innovation',
        titleCn: '创新的和谐',
        titleJp: '創新の調和',
        description: '혁신적 접근을 통한 서예의 새로운 가능성을 탐구한 작품입니다.',
        descriptionKo: '혁신적 접근을 통한 서예의 새로운 가능성을 탐구한 작품입니다.',
        descriptionEn: 'A work exploring new possibilities of calligraphy through innovative approaches.',
        category: 'calligraphy' as const,
        style: '초서',
        medium: '비단, 먹',
        dimensions: '60 x 120 cm',
        year: 2023,
        imageUrl: '/images/artworks/artwork-002.jpg',
        isFeatured: true,
        tags: JSON.stringify(['혁신', '창신', '초서', '조화']),
      },
      {
        id: 'artwork-003',
        artistId: 'artist-002',
        title: '동아시아의 정신',
        titleKo: '동아시아의 정신',
        titleEn: 'Spirit of East Asia',
        titleCn: '东亚精神',
        titleJp: '東アジアの精神',
        description: '한중일 서예 문화의 공통점과 차이점을 표현한 작품입니다.',
        descriptionKo: '한중일 서예 문화의 공통점과 차이점을 표현한 작품입니다.',
        descriptionEn: 'A work expressing the commonalities and differences of Korea-China-Japan calligraphy culture.',
        category: 'calligraphy' as const,
        style: '해서',
        medium: '한지, 먹',
        dimensions: '80 x 160 cm',
        year: 2022,
        imageUrl: '/images/artworks/artwork-003.jpg',
        isFeatured: false,
        tags: JSON.stringify(['동아시아', '문화교류', '해서', '정신']),
      }
    ];

    await db.insert(artworks).values(sampleArtworks);

    // 4. 전시회 데이터 생성
    console.log('🏛️ 전시회 데이터 생성 중...');
    const sampleExhibitions = [
      {
        id: 'exhibition-001',
        title: '정법과 창신의 조화',
        titleKo: '정법과 창신의 조화',
        titleEn: 'Harmony of Orthodox Dharma and Innovation',
        titleCn: '正法与创新的和谐',
        titleJp: '正法と創新の調和',
        description: '전통과 현대가 만나는 서예의 새로운 지평을 제시하는 특별 기획전입니다.',
        descriptionKo: '전통과 현대가 만나는 서예의 새로운 지평을 제시하는 특별 기획전입니다.',
        descriptionEn: 'A special exhibition presenting new horizons of calligraphy where tradition meets modernity.',
        type: 'special' as const,
        status: 'ongoing' as const,
        venue: '동양서예협회 본관',
        venueAddress: '서울시 종로구 인사동길 12',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-05-30'),
        openingHours: '화-일 10:00-18:00 (월요일 휴관)',
        admissionFee: 5000,
        currency: 'KRW',
        posterImage: '/images/exhibitions/exhibition-001-poster.jpg',
        curatorNotes: '이번 전시는 동양 서예의 정통성과 현대적 창신이 어떻게 조화를 이룰 수 있는지를 보여줍니다.',
        isFeatured: true,
      },
      {
        id: 'exhibition-002',
        title: '동아시아 서예 교류전',
        titleKo: '동아시아 서예 교류전',
        titleEn: 'East Asian Calligraphy Exchange Exhibition',
        titleCn: '东亚书法交流展',
        titleJp: '東アジア書道交流展',
        description: '한국, 중국, 일본 서예가들의 작품을 통해 동아시아 서예 문화의 다양성을 조명합니다.',
        descriptionKo: '한국, 중국, 일본 서예가들의 작품을 통해 동아시아 서예 문화의 다양성을 조명합니다.',
        descriptionEn: 'Illuminating the diversity of East Asian calligraphy culture through works by Korean, Chinese, and Japanese calligraphers.',
        type: 'group' as const,
        status: 'upcoming' as const,
        venue: '동양서예협회 별관',
        venueAddress: '서울시 종로구 인사동길 15',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        openingHours: '화-일 10:00-18:00 (월요일 휴관)',
        admissionFee: 7000,
        currency: 'KRW',
        posterImage: '/images/exhibitions/exhibition-002-poster.jpg',
        curatorNotes: '동아시아 삼국의 서예 전통이 어떻게 서로 영향을 주고받았는지 살펴볼 수 있는 기회입니다.',
        isFeatured: true,
      }
    ];

    await db.insert(exhibitions).values(sampleExhibitions);

    // 5. 뉴스 데이터 생성
    console.log('📰 뉴스 데이터 생성 중...');
    const sampleNews = [
      {
        id: 'news-001',
        title: '2024년 동양서예협회 정기총회 개최 안내',
        titleKo: '2024년 동양서예협회 정기총회 개최 안내',
        titleEn: '2024 Oriental Calligraphy Association Annual General Meeting Notice',
        content: '2024년 동양서예협회 정기총회가 3월 20일 오후 2시에 개최됩니다. 모든 회원님들의 참석을 부탁드립니다.',
        contentKo: '2024년 동양서예협회 정기총회가 3월 20일 오후 2시에 개최됩니다. 모든 회원님들의 참석을 부탁드립니다.',
        contentEn: 'The 2024 Oriental Calligraphy Association Annual General Meeting will be held on March 20th at 2 PM. We request the attendance of all members.',
        excerpt: '2024년 정기총회 개최 안내',
        category: 'announcement' as const,
        status: 'published' as const,
        authorId: 'user-admin-001',
        featuredImage: '/images/news/news-001.jpg',
        publishedAt: new Date('2024-03-01'),
        isPinned: true,
        viewCount: 245,
        tags: JSON.stringify(['총회', '공지', '2024']),
      },
      {
        id: 'news-002',
        title: '신진 작가 발굴 프로그램 참가자 모집',
        titleKo: '신진 작가 발굴 프로그램 참가자 모집',
        titleEn: 'Recruitment for Emerging Artist Discovery Program',
        content: '동양서예협회에서 신진 작가 발굴을 위한 특별 프로그램을 운영합니다. 많은 관심과 참여 부탁드립니다.',
        contentKo: '동양서예협회에서 신진 작가 발굴을 위한 특별 프로그램을 운영합니다. 많은 관심과 참여 부탁드립니다.',
        contentEn: 'The Oriental Calligraphy Association is running a special program to discover emerging artists. We ask for your interest and participation.',
        excerpt: '신진 작가를 위한 특별 프로그램',
        category: 'news' as const,
        status: 'published' as const,
        authorId: 'user-admin-001',
        featuredImage: '/images/news/news-002.jpg',
        publishedAt: new Date('2024-02-15'),
        isPinned: false,
        viewCount: 189,
        tags: JSON.stringify(['신진작가', '프로그램', '모집']),
      }
    ];

    await db.insert(news).values(sampleNews);

    // 6. 이벤트 데이터 생성
    console.log('📅 이벤트 데이터 생성 중...');
    const sampleEvents = [
      {
        id: 'event-001',
        title: '서예 기초 워크숍',
        titleKo: '서예 기초 워크숍',
        titleEn: 'Basic Calligraphy Workshop',
        description: '서예 입문자를 위한 기초 워크숍입니다. 붓잡는 법부터 기본 획까지 차근차근 배워보세요.',
        descriptionKo: '서예 입문자를 위한 기초 워크숍입니다. 붓잡는 법부터 기본 획까지 차근차근 배워보세요.',
        descriptionEn: 'A basic workshop for calligraphy beginners. Learn step by step from holding the brush to basic strokes.',
        type: 'workshop' as const,
        status: 'upcoming' as const,
        venue: '동양서예협회 교육관',
        venueAddress: '서울시 종로구 인사동길 18',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-15'),
        registrationDeadline: new Date('2024-04-10'),
        maxParticipants: 20,
        currentParticipants: 8,
        fee: 50000,
        currency: 'KRW',
        organizerId: 'user-admin-001',
        posterImage: '/images/events/event-001.jpg',
        requirements: '서예 경험이 없어도 참가 가능합니다.',
        materials: JSON.stringify(['붓', '먹', '한지', '벼루']),
        isFeatured: true,
      },
      {
        id: 'event-002',
        title: '명작 감상 강연회',
        titleKo: '명작 감상 강연회',
        titleEn: 'Masterpiece Appreciation Lecture',
        description: '동양 서예 명작들을 감상하고 그 의미를 깊이 있게 탐구하는 강연회입니다.',
        descriptionKo: '동양 서예 명작들을 감상하고 그 의미를 깊이 있게 탐구하는 강연회입니다.',
        descriptionEn: 'A lecture series to appreciate Oriental calligraphy masterpieces and explore their meanings in depth.',
        type: 'lecture' as const,
        status: 'upcoming' as const,
        venue: '동양서예협회 강당',
        venueAddress: '서울시 종로구 인사동길 12',
        startDate: new Date('2024-05-10'),
        endDate: new Date('2024-05-10'),
        registrationDeadline: new Date('2024-05-05'),
        maxParticipants: 100,
        currentParticipants: 35,
        fee: 20000,
        currency: 'KRW',
        organizerId: 'user-admin-001',
        posterImage: '/images/events/event-002.jpg',
        requirements: '서예에 관심이 있는 누구나 참가 가능합니다.',
        isFeatured: false,
      }
    ];

    await db.insert(events).values(sampleEvents);

    // 7. 갤러리 데이터 생성
    console.log('🖼️ 갤러리 데이터 생성 중...');
    const sampleGalleries = [
      {
        id: 'gallery-001',
        name: '상설 전시관',
        nameKo: '상설 전시관',
        nameEn: 'Permanent Exhibition Hall',
        nameCn: '常设展览馆',
        nameJp: '常設展示館',
        description: '동양서예협회의 대표 작품들을 상시 전시하는 공간입니다.',
        descriptionKo: '동양서예협회의 대표 작품들을 상시 전시하는 공간입니다.',
        descriptionEn: 'A space for permanent display of representative works of the Oriental Calligraphy Association.',
        type: 'permanent' as const,
        coverImage: '/images/galleries/gallery-001.jpg',
        sortOrder: 1,
      },
      {
        id: 'gallery-002',
        name: '특별 기획관',
        nameKo: '특별 기획관',
        nameEn: 'Special Exhibition Hall',
        nameCn: '特别策划馆',
        nameJp: '特別企画館',
        description: '특별 기획전과 임시 전시를 위한 공간입니다.',
        descriptionKo: '특별 기획전과 임시 전시를 위한 공간입니다.',
        descriptionEn: 'A space for special exhibitions and temporary displays.',
        type: 'temporary' as const,
        coverImage: '/images/galleries/gallery-002.jpg',
        sortOrder: 2,
      }
    ];

    await db.insert(galleries).values(sampleGalleries);

    // 8. 관계 테이블 데이터 생성
    console.log('🔗 관계 데이터 생성 중...');
    
    // 전시회-작품 관계
    await db.insert(exhibitionArtworks).values([
      {
        id: 'ex-art-001',
        exhibitionId: 'exhibition-001',
        artworkId: 'artwork-001',
        displayOrder: 1,
        isHighlight: true,
      },
      {
        id: 'ex-art-002',
        exhibitionId: 'exhibition-001',
        artworkId: 'artwork-002',
        displayOrder: 2,
        isHighlight: true,
      }
    ]);

    // 갤러리-작품 관계
    await db.insert(galleryArtworks).values([
      {
        id: 'gal-art-001',
        galleryId: 'gallery-001',
        artworkId: 'artwork-001',
        displayOrder: 1,
        isHighlight: true,
      },
      {
        id: 'gal-art-002',
        galleryId: 'gallery-001',
        artworkId: 'artwork-002',
        displayOrder: 2,
        isHighlight: false,
      },
      {
        id: 'gal-art-003',
        galleryId: 'gallery-001',
        artworkId: 'artwork-003',
        displayOrder: 3,
        isHighlight: false,
      }
    ]);

    // 9. 관리자 권한 설정
    console.log('🔐 관리자 권한 설정 중...');
    await db.insert(adminPermissions).values({
      id: 'admin-perm-001',
      userId: 'user-admin-001',
      permissions: JSON.stringify({
        cms: { read: true, write: true, delete: true },
        artists: { read: true, write: true, delete: true },
        artworks: { read: true, write: true, delete: true },
        exhibitions: { read: true, write: true, delete: true },
        news: { read: true, write: true, delete: true },
        events: { read: true, write: true, delete: true },
        users: { read: true, write: true, delete: true },
        admin: { read: true, write: true, delete: true }
      }),
      grantedBy: 'user-admin-001',
    });

    console.log('✅ 데이터베이스 시드 데이터 생성이 완료되었습니다!');
    console.log('📊 생성된 데이터:');
    console.log('  - 사용자: 4명');
    console.log('  - 작가: 2명');
    console.log('  - 작품: 3점');
    console.log('  - 전시회: 2개');
    console.log('  - 뉴스: 2개');
    console.log('  - 이벤트: 2개');
    console.log('  - 갤러리: 2개');

  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

// 시드 데이터 삭제 함수 (개발용)
export async function clearDatabase() {
  console.log('🗑️ 데이터베이스 초기화 중...');
  
  try {
    // 관계 테이블부터 삭제 (외래키 제약 조건 때문)
    await db.delete(galleryArtworks);
    await db.delete(exhibitionArtworks);
    await db.delete(adminPermissions);
    
    // 메인 테이블 삭제
    await db.delete(events);
    await db.delete(news);
    await db.delete(exhibitions);
    await db.delete(artworks);
    await db.delete(artists);
    await db.delete(galleries);
    await db.delete(users);
    
    console.log('✅ 데이터베이스가 초기화되었습니다.');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('시드 데이터 생성 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('시드 데이터 생성 실패:', error);
      process.exit(1);
    });
} 