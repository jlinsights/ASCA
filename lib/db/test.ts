import { testConnection, db } from './index';
import { 
  createUser, 
  getUserByEmail, 
  getAllArtists, 
  getFeaturedArtworks,
  getDashboardStats 
} from './queries';

async function testDatabase() {
  

  try {
    // 1. 연결 테스트
    
    const connectionResult = await testConnection();
    if (!connectionResult) {
      throw new Error('데이터베이스 연결 실패');
    }
    

    // 2. 사용자 생성 테스트
    
    try {
      const testUser = await createUser({
        id: 'test-user-001',
        email: 'test@example.com',
        name: '테스트 사용자',
        role: 'member',
        bio: '테스트용 사용자입니다.',
      });
      
    } catch (error) {
      
    }

    // 3. 사용자 조회 테스트
    
    const user = await getUserByEmail('info@orientalcalligraphy.org');
    if (user) {
      
    } else {
      
    }

    // 4. 작가 목록 조회 테스트
    
    const artists = await getAllArtists({ limit: 5 });
    
    artists.forEach((artist, index) => {
      
    });

    // 5. 추천 작품 조회 테스트
    
    const featuredArtworks = await getFeaturedArtworks(3);
    
    featuredArtworks.forEach((artwork, index) => {
      
    });

    // 6. 대시보드 통계 테스트
    
    const stats = await getDashboardStats();
    
    
    
    
    
    
    

    

  } catch (error) {
    
    throw error;
  }
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  testDatabase()
    .then(() => {
      
      process.exit(0);
    })
    .catch((error) => {
      
      process.exit(1);
    });
}

export { testDatabase }; 