import * as schema from './schema';

// 간단한 데이터베이스 스텁 - 실제 연결 없이 타입만 제공
export const db = {} as any;

// 데이터베이스 연결 테스트 함수
export async function testConnection() {
  return true;
}

// 데이터베이스 종료 함수
export function closeConnection() {
  // No-op
}
