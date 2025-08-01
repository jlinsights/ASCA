import { sql } from 'drizzle-orm';
import { db } from './index';
import * as fs from 'fs';
import * as path from 'path';

interface Migration {
  id: string;
  filename: string;
  version: number;
  content: string;
  checksum: string;
}

// 마이그레이션 상태 테이블 생성
async function createMigrationsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      version INTEGER NOT NULL,
      checksum TEXT NOT NULL,
      executed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      execution_time INTEGER NOT NULL,
      success INTEGER NOT NULL DEFAULT 1
    )
  `);
}

// 체크섬 계산
function calculateChecksum(content: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(content).digest('hex');
}

// 마이그레이션 파일 로드
function loadMigrations(): Migration[] {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('Migrations directory not found');
    return [];
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  const migrations: Migration[] = [];
  
  for (const filename of files) {
    const filePath = path.join(migrationsDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const checksum = calculateChecksum(content);
    
    // 파일명에서 버전 번호 추출 (예: 001_add_new_tables.sql -> 1)
    const versionMatch = filename.match(/^(\d+)_/);
    const version = versionMatch ? parseInt(versionMatch[1], 10) : 0;
    
    migrations.push({
      id: filename.replace('.sql', ''),
      filename,
      version,
      content,
      checksum
    });
  }
  
  return migrations.sort((a, b) => a.version - b.version);
}

// 실행된 마이그레이션 조회
async function getExecutedMigrations(): Promise<string[]> {
  try {
    const result = await db.execute(sql`
      SELECT filename FROM schema_migrations WHERE success = 1 ORDER BY version
    `);
    return result.rows.map((row: any) => row.filename);
  } catch (error) {
    // 테이블이 없으면 빈 배열 반환
    return [];
  }
}

// 단일 마이그레이션 실행
async function executeMigration(migration: Migration): Promise<void> {
  const startTime = Date.now();
  
  console.log(`Executing migration: ${migration.filename}`);
  
  try {
    // 트랜잭션 내에서 마이그레이션 실행
    await db.transaction(async (tx) => {
      // SQL 명령어들을 개별적으로 실행
      const statements = migration.content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          await tx.execute(sql.raw(statement));
        }
      }
      
      // 마이그레이션 기록 저장
      const executionTime = Date.now() - startTime;
      await tx.execute(sql`
        INSERT INTO schema_migrations (
          id, filename, version, checksum, execution_time, success
        ) VALUES (
          ${migration.id}, ${migration.filename}, ${migration.version}, 
          ${migration.checksum}, ${executionTime}, 1
        )
      `);
    });
    
    console.log(`✅ Migration ${migration.filename} completed in ${Date.now() - startTime}ms`);
    
  } catch (error) {
    // 실패 기록 저장
    const executionTime = Date.now() - startTime;
    try {
      await db.execute(sql`
        INSERT INTO schema_migrations (
          id, filename, version, checksum, execution_time, success
        ) VALUES (
          ${migration.id}, ${migration.filename}, ${migration.version}, 
          ${migration.checksum}, ${executionTime}, 0
        )
      `);
    } catch (insertError) {
      console.error('Failed to record migration failure:', insertError);
    }
    
    console.error(`❌ Migration ${migration.filename} failed:`, error);
    throw error;
  }
}

// 모든 대기 중인 마이그레이션 실행
export async function runMigrations(): Promise<void> {
  console.log('🚀 Starting database migrations...');
  
  try {
    // 마이그레이션 테이블 확인/생성
    await createMigrationsTable();
    
    // 마이그레이션 파일 로드
    const availableMigrations = loadMigrations();
    const executedMigrations = await getExecutedMigrations();
    
    // 실행할 마이그레이션 필터링
    const pendingMigrations = availableMigrations.filter(
      migration => !executedMigrations.includes(migration.filename)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations found. Database is up to date.');
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach(migration => {
      console.log(`   - ${migration.filename}`);
    });
    
    // 순차적으로 마이그레이션 실행
    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }
    
    console.log(`🎉 Successfully executed ${pendingMigrations.length} migration(s)!`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// 마이그레이션 상태 조회
export async function getMigrationStatus(): Promise<{
  total: number;
  executed: number;
  pending: number;
  failed: number;
  migrations: Array<{
    filename: string;
    version: number;
    status: 'executed' | 'pending' | 'failed';
    executedAt?: Date;
    executionTime?: number;
  }>;
}> {
  await createMigrationsTable();
  
  const availableMigrations = loadMigrations();
  const executedResult = await db.execute(sql`
    SELECT filename, executed_at, execution_time, success 
    FROM schema_migrations 
    ORDER BY version
  `);
  
  const executedMap = new Map();
  executedResult.rows.forEach((row: any) => {
    executedMap.set(row.filename, {
      executedAt: new Date(row.executed_at * 1000),
      executionTime: row.execution_time,
      success: row.success === 1
    });
  });
  
  const migrations = availableMigrations.map(migration => {
    const executed = executedMap.get(migration.filename);
    
    return {
      filename: migration.filename,
      version: migration.version,
      status: executed ? (executed.success ? 'executed' : 'failed') : 'pending' as const,
      executedAt: executed?.executedAt,
      executionTime: executed?.executionTime
    };
  });
  
  const executed = migrations.filter(m => m.status === 'executed').length;
  const failed = migrations.filter(m => m.status === 'failed').length;
  const pending = migrations.filter(m => m.status === 'pending').length;
  
  return {
    total: availableMigrations.length,
    executed,
    pending,
    failed,
    migrations
  };
}

// 마이그레이션 롤백 (개발 환경용)
export async function rollbackMigration(filename: string): Promise<void> {
  console.warn('⚠️  Migration rollback is not implemented. Manual intervention required.');
  console.warn('   Please restore from backup or manually revert schema changes.');
}

// CLI 실행 지원
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'run':
      runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'status':
      getMigrationStatus()
        .then(status => {
          console.log('\n📊 Migration Status:');
          console.log(`   Total: ${status.total}`);
          console.log(`   Executed: ${status.executed}`);
          console.log(`   Pending: ${status.pending}`);
          console.log(`   Failed: ${status.failed}\n`);
          
          status.migrations.forEach(migration => {
            const statusIcon = migration.status === 'executed' ? '✅' : 
                              migration.status === 'failed' ? '❌' : '⏳';
            console.log(`${statusIcon} ${migration.filename} (v${migration.version})`);
            if (migration.executedAt) {
              console.log(`   Executed: ${migration.executedAt.toISOString()}`);
            }
          });
          
          process.exit(0);
        })
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('Usage: npm run migrate [command]');
      console.log('Commands:');
      console.log('  run    - Execute pending migrations');
      console.log('  status - Show migration status');
      process.exit(0);
  }
}