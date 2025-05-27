import { testConnection, db } from './index';
import { 
  createUser, 
  getUserByEmail, 
  getAllArtists, 
  getFeaturedArtworks,
  getDashboardStats 
} from './queries';

async function testDatabase() {
  console.log('🧪 데이터베이스 테스트를 시작합니다...\n');

  try {
    // 1. 연결 테스트
    console.log('1️⃣ 데이터베이스 연결 테스트');
    const connectionResult = await testConnection();
    if (!connectionResult) {
      throw new Error('데이터베이스 연결 실패');
    }
    console.log('✅ 연결 성공\n');

    // 2. 사용자 생성 테스트
    console.log('2️⃣ 사용자 생성 테스트');
    try {
      const testUser = await createUser({
        id: 'test-user-001',
        email: 'test@example.com',
        name: '테스트 사용자',
        role: 'member',
        bio: '테스트용 사용자입니다.',
      });
      console.log('✅ 사용자 생성 성공:', testUser.name);
    } catch (error) {
      console.log('ℹ️ 사용자가 이미 존재하거나 생성 중 오류:', (error as Error).message);
    }

    // 3. 사용자 조회 테스트
    console.log('\n3️⃣ 사용자 조회 테스트');
    const user = await getUserByEmail('info@orientalcalligraphy.org');
    if (user) {
      console.log('✅ 관리자 계정 조회 성공:', user.name);
    } else {
      console.log('⚠️ 관리자 계정을 찾을 수 없습니다.');
    }

    // 4. 작가 목록 조회 테스트
    console.log('\n4️⃣ 작가 목록 조회 테스트');
    const artists = await getAllArtists({ limit: 5 });
    console.log(`✅ 작가 ${artists.length}명 조회 성공`);
    artists.forEach((artist, index) => {
      console.log(`   ${index + 1}. ${artist.name} (${artist.nationality})`);
    });

    // 5. 추천 작품 조회 테스트
    console.log('\n5️⃣ 추천 작품 조회 테스트');
    const featuredArtworks = await getFeaturedArtworks(3);
    console.log(`✅ 추천 작품 ${featuredArtworks.length}점 조회 성공`);
    featuredArtworks.forEach((artwork, index) => {
      console.log(`   ${index + 1}. ${artwork.title} (${artwork.year}년)`);
    });

    // 6. 대시보드 통계 테스트
    console.log('\n6️⃣ 대시보드 통계 테스트');
    const stats = await getDashboardStats();
    console.log('✅ 통계 조회 성공:');
    console.log(`   - 사용자: ${stats.users}명`);
    console.log(`   - 작가: ${stats.artists}명`);
    console.log(`   - 작품: ${stats.artworks}점`);
    console.log(`   - 전시회: ${stats.exhibitions}개`);
    console.log(`   - 뉴스: ${stats.news}개`);
    console.log(`   - 이벤트: ${stats.events}개`);

    console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다!');

  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  testDatabase()
    .then(() => {
      console.log('\n테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n테스트 실패:', error);
      process.exit(1);
    });
}

export { testDatabase }; 