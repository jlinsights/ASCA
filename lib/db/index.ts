import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// @ts-ignore - better-sqlite3 타입 선언 파일이 없어서 무시
// 데이터베이스 연결 설정
const sqlite = new Database(process.env.DATABASE_URL || 'sqlite.db');

// Drizzle 인스턴스 생성
export const db = drizzle(sqlite, { schema });

// 데이터베이스 연결 테스트 함수
export async function testConnection() {
  try {
    const result = sqlite.prepare('SELECT 1 as test').get();
    
    return true;
  } catch (error) {
    
    return false;
  }
}

// 데이터베이스 종료 함수
export function closeConnection() {
  sqlite.close();
}

// 개발 환경에서 프로세스 종료 시 연결 정리
if (process.env.NODE_ENV === 'development') {
  process.on('SIGINT', () => {
    
    closeConnection();
    process.exit(0);
  });
}
