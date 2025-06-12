import { createClient } from '@supabase/supabase-js'
import Airtable from 'airtable'

/**
 * Airtable ↔ Supabase 실시간 동기화 엔진
 * 
 * 주요 기능:
 * 1. 스키마 동기화 (필드 추가/삭제)
 * 2. 데이터 동기화 (레코드 생성/수정/삭제)
 * 3. 충돌 해결
 * 4. 실시간 감지 및 처리
 */

export class SyncEngine {
  private supabase: any
  private airtableBase: any
  private isRunning = false
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    this.airtableBase = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY! 
    }).base(process.env.AIRTABLE_BASE_ID!)
  }

  /**
   * 동기화 엔진 시작
   */
  async start(intervalMs: number = 60000) {
    if (this.isRunning) {
      
      return
    }

    
    this.isRunning = true

    // 초기 전체 동기화
    await this.performFullSync()

    // 주기적 동기화 설정
    this.syncInterval = setInterval(async () => {
      await this.processPendingChanges()
    }, intervalMs)

    
  }

  /**
   * 동기화 엔진 중지
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.isRunning = false
    
  }

  /**
   * 전체 동기화 수행
   */
  async performFullSync() {
    
    
    try {
      // 1. 스키마 동기화
      await this.syncSchemas()
      
      // 2. 데이터 동기화
      await this.syncAllData()
      
      
    } catch (error) {
      
      throw error
    }
  }

  /**
   * 스키마 동기화 (Airtable → Supabase)
   */
  async syncSchemas() {
    
    
    const tables = ['Artists', 'Artworks', 'Exhibitions']
    
    for (const tableName of tables) {
      try {
        await this.syncTableSchema(tableName)
      } catch (error) {
        
      }
    }
  }

  /**
   * 개별 테이블 스키마 동기화
   */
  async syncTableSchema(airtableTableName: string) {
    const supabaseTableName = airtableTableName.toLowerCase()
    
    try {
      // Airtable 필드 구조 가져오기
      const airtableFields = await this.getAirtableFields(airtableTableName)
      
      // Supabase 컬럼 구조 가져오기
      const { data: supabaseColumns } = await this.supabase.rpc('get_table_columns', {
        table_name: supabaseTableName
      })

      // 스키마 차이점 분석
      const differences = this.analyzeSchemaChanges(airtableFields, supabaseColumns || [])
      
      // 필요한 스키마 변경 적용
      await this.applySchemaChanges(supabaseTableName, differences)
      
      
    } catch (error) {
      
    }
  }

  /**
   * Airtable 필드 구조 가져오기
   */
  async getAirtableFields(tableName: string): Promise<AirtableField[]> {
    try {
      // 샘플 레코드를 가져와서 필드 구조 파악
      const records = await this.airtableBase(tableName).select({
        maxRecords: 10
      }).firstPage()

      const fieldMap = new Map<string, AirtableField>()

      records.forEach(record => {
        Object.entries(record.fields).forEach(([fieldName, value]) => {
          if (!fieldMap.has(fieldName)) {
            fieldMap.set(fieldName, {
              name: fieldName,
              type: this.inferAirtableFieldType(value),
              required: false
            })
          }
        })
      })

      return Array.from(fieldMap.values())
    } catch (error) {
      
      return []
    }
  }

  /**
   * Airtable 값으로부터 필드 타입 추론
   */
  private inferAirtableFieldType(value: any): string {
    if (value === null || value === undefined) return 'text'
    if (typeof value === 'string') {
      // 이메일 패턴 체크
      if (value.includes('@') && value.includes('.')) return 'email'
      // 전화번호 패턴 체크
      if (/^\+?[\d\s\-\(\)]+$/.test(value)) return 'phone'
      // 날짜 패턴 체크
      if (Date.parse(value)) return 'date'
      return 'text'
    }
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) return 'array'
    return 'json'
  }

  /**
   * 스키마 변경사항 분석
   */
  private analyzeSchemaChanges(
    airtableFields: AirtableField[], 
    supabaseColumns: any[]
  ): SchemaChange[] {
    const changes: SchemaChange[] = []
    
    // Airtable 필드를 Supabase 컬럼명으로 매핑
    const fieldMapping = this.getFieldMapping()
    
    airtableFields.forEach(field => {
      const supabaseColumnName = fieldMapping[field.name] || this.sanitizeColumnName(field.name)
      const existingColumn = supabaseColumns.find(col => col.column_name === supabaseColumnName)
      
      if (!existingColumn) {
        changes.push({
          type: 'add_column',
          columnName: supabaseColumnName,
          dataType: this.mapAirtableToPostgres(field.type),
          airtableField: field.name
        })
      } else {
        // 타입 체크 및 필요시 수정
        const expectedType = this.mapAirtableToPostgres(field.type)
        if (existingColumn.data_type !== expectedType) {
          changes.push({
            type: 'modify_column',
            columnName: supabaseColumnName,
            dataType: expectedType,
            currentType: existingColumn.data_type,
            airtableField: field.name
          })
        }
      }
    })

    return changes
  }

  /**
   * 스키마 변경사항 적용
   */
  private async applySchemaChanges(tableName: string, changes: SchemaChange[]) {
    for (const change of changes) {
      try {
        await this.executeSchemaChange(tableName, change)
        
        // 로그 기록
        await this.supabase.from('sync_logs').insert({
          sync_type: 'schema',
          source_system: 'airtable',
          target_system: 'supabase',
          table_name: tableName,
          operation: change.type,
          changes: change,
          status: 'success'
        })
        
        
      } catch (error) {
        
        
        // 에러 로그 기록
        await this.supabase.from('sync_logs').insert({
          sync_type: 'schema',
          source_system: 'airtable',
          target_system: 'supabase',
          table_name: tableName,
          operation: change.type,
          changes: change,
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }

  /**
   * 스키마 변경 SQL 실행
   */
  private async executeSchemaChange(tableName: string, change: SchemaChange) {
    let sql = ''
    
    switch (change.type) {
      case 'add_column':
        sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS "${change.columnName}" ${change.dataType}`
        break
      case 'modify_column':
        sql = `ALTER TABLE ${tableName} ALTER COLUMN "${change.columnName}" TYPE ${change.dataType} USING "${change.columnName}"::${change.dataType}`
        break
      case 'drop_column':
        sql = `ALTER TABLE ${tableName} DROP COLUMN IF EXISTS "${change.columnName}"`
        break
    }

    if (sql) {
      const { error } = await this.supabase.rpc('execute_sql', { sql_query: sql })
      if (error) throw error
    }
  }

  /**
   * 모든 데이터 동기화
   */
  async syncAllData() {
    
    
    const tables = ['Artists', 'Artworks', 'Exhibitions']
    
    for (const tableName of tables) {
      try {
        await this.syncTableData(tableName)
      } catch (error) {
        
      }
    }
  }

  /**
   * 개별 테이블 데이터 동기화
   */
  async syncTableData(airtableTableName: string) {
    const supabaseTableName = airtableTableName.toLowerCase()
    
    try {
      // Airtable 데이터 가져오기
      const airtableRecords = await this.airtableBase(airtableTableName).select().all()
      
      // Supabase 데이터와 비교하여 동기화
      for (const record of airtableRecords) {
        await this.syncSingleRecord(airtableTableName, record)
      }
      
      
    } catch (error) {
      
    }
  }

  /**
   * 개별 레코드 동기화
   */
  private async syncSingleRecord(tableName: string, airtableRecord: any) {
    const supabaseTableName = tableName.toLowerCase()
    const mappedData = this.mapAirtableToSupabase(airtableRecord.fields, tableName)
    
    try {
      // Supabase에서 기존 레코드 찾기
      const { data: existingRecords } = await this.supabase
        .from(supabaseTableName)
        .select('*')
        .eq('airtable_id', airtableRecord.id)
      
      if (existingRecords && existingRecords.length > 0) {
        // 업데이트
        const { error } = await this.supabase
          .from(supabaseTableName)
          .update(mappedData)
          .eq('airtable_id', airtableRecord.id)
        
        if (error) throw error
      } else {
        // 새로 삽입
        const { error } = await this.supabase
          .from(supabaseTableName)
          .insert({ ...mappedData, airtable_id: airtableRecord.id })
        
        if (error) throw error
      }
    } catch (error) {
      
    }
  }

  /**
   * 보류 중인 변경사항 처리
   */
  async processPendingChanges() {
    try {
      const { data: pendingLogs } = await this.supabase
        .from('sync_logs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(50)

      for (const log of pendingLogs || []) {
        await this.processSyncLog(log)
      }
    } catch (error) {
      
    }
  }

  /**
   * 동기화 로그 처리
   */
  private async processSyncLog(log: any) {
    try {
      if (log.source_system === 'supabase' && log.target_system === 'airtable') {
        await this.syncToAirtable(log)
      } else if (log.source_system === 'airtable' && log.target_system === 'supabase') {
        await this.syncToSupabase(log)
      }

      // 성공 상태로 업데이트
      await this.supabase
        .from('sync_logs')
        .update({ 
          status: 'success', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', log.id)

    } catch (error) {
      // 실패 상태로 업데이트
      await this.supabase
        .from('sync_logs')
        .update({ 
          status: 'failed', 
          error_message: error instanceof Error ? error.message : String(error),
          completed_at: new Date().toISOString() 
        })
        .eq('id', log.id)
    }
  }

  /**
   * Supabase → Airtable 동기화
   */
  private async syncToAirtable(log: any) {
    // 구현 예정: Supabase 변경사항을 Airtable에 반영
    
  }

  /**
   * Airtable → Supabase 동기화
   */
  private async syncToSupabase(log: any) {
    // 구현 예정: Airtable 변경사항을 Supabase에 반영
    
  }

  /**
   * 필드 매핑 정의
   */
  private getFieldMapping(): Record<string, string> {
    return {
      'Name (Korean)': 'name_korean',
      'Name (Chinese)': 'name_chinese',
      'Membership Type': 'membership_type',
      'Phone': 'phone',
      'Email': 'email',
      'DOB': 'date_of_birth',
      'Date of Birth': 'date_of_birth',
      'Nationality': 'nationality',
      'Artist Type': 'artist_type'
    }
  }

  /**
   * 컬럼명 정규화
   */
  private sanitizeColumnName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
  }

  /**
   * Airtable 타입을 PostgreSQL 타입으로 매핑
   */
  private mapAirtableToPostgres(airtableType: string): string {
    const typeMap: Record<string, string> = {
      'text': 'text',
      'email': 'text',
      'phone': 'text',
      'number': 'numeric',
      'boolean': 'boolean',
      'date': 'timestamp with time zone',
      'array': 'jsonb',
      'json': 'jsonb'
    }
    
    return typeMap[airtableType] || 'text'
  }

  /**
   * Airtable 데이터를 Supabase 형식으로 변환
   */
  private mapAirtableToSupabase(fields: any, tableName: string): any {
    const mapping = this.getFieldMapping()
    const result: any = {}
    
    Object.entries(fields).forEach(([airtableField, value]) => {
      const supabaseField = mapping[airtableField] || this.sanitizeColumnName(airtableField)
      result[supabaseField] = value
    })
    
    return result
  }
}

// 타입 정의
interface AirtableField {
  name: string
  type: string
  required: boolean
}

interface SchemaChange {
  type: 'add_column' | 'modify_column' | 'drop_column'
  columnName: string
  dataType: string
  currentType?: string
  airtableField: string
}

// 싱글톤 인스턴스
export const syncEngine = new SyncEngine() 