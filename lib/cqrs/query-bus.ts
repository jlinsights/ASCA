/**
 * CQRS 패턴 - Query 버스
 * 읽기 작업 최적화 및 캐싱 지원
 */

export interface Query {
  type: string;
  params: any;
  metadata?: {
    userId?: string;
    timestamp?: number;
    cacheKey?: string;
    cacheTTL?: number;
  };
}

export interface QueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime: number;
    fromCache: boolean;
    totalCount?: number;
    timestamp: number;
  };
}

export interface QueryHandler<TQuery extends Query = Query, TResult = any> {
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}

/**
 * 간단한 메모리 캐시 구현
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 기본 5분
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 만료된 항목 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Query 버스 - 읽기 작업 중앙화
 */
export class QueryBus {
  private static instance: QueryBus;
  private handlers = new Map<string, QueryHandler>();
  private cache = new MemoryCache();
  private middleware: QueryMiddleware[] = [];

  private constructor() {
    // 캐시 정리 스케줄러 (5분마다)
    setInterval(() => this.cache.cleanup(), 300000);
  }

  static getInstance(): QueryBus {
    if (!QueryBus.instance) {
      QueryBus.instance = new QueryBus();
    }
    return QueryBus.instance;
  }

  /**
   * Query 핸들러 등록
   */
  registerHandler<T extends Query>(
    queryType: string, 
    handler: QueryHandler<T>
  ): void {
    this.handlers.set(queryType, handler);
  }

  /**
   * 미들웨어 추가
   */
  use(middleware: QueryMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Query 실행
   */
  async execute<T extends Query, R = any>(query: T): Promise<QueryResult<R>> {
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cacheKey = query.metadata?.cacheKey || this.generateCacheKey(query);
      const cachedResult = this.cache.get(cacheKey);
      
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          metadata: {
            executionTime: Date.now() - startTime,
            fromCache: true,
            timestamp: Date.now()
          }
        };
      }

      // 미들웨어 실행 (전처리)
      let processedQuery = query;
      for (const middleware of this.middleware) {
        if (middleware.before) {
          processedQuery = (await middleware.before(processedQuery) || processedQuery) as T;
        }
      }

      // 핸들러 찾기
      const handler = this.handlers.get(query.type);
      if (!handler) {
        throw new Error(`No handler registered for query type: ${query.type}`);
      }

      // Query 실행
      const result = await handler.handle(processedQuery);

      // 성공 시 캐시 저장
      if (result.success && result.data) {
        const ttl = query.metadata?.cacheTTL || 300000; // 기본 5분
        this.cache.set(cacheKey, result.data, ttl);
      }

      // 미들웨어 실행 (후처리)
      for (const middleware of this.middleware) {
        if (middleware.after) {
          await middleware.after(processedQuery, result);
        }
      }

      return {
        ...result,
        metadata: {
          executionTime: Date.now() - startTime,
          fromCache: false,
          timestamp: Date.now(),
          ...result.metadata
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
          fromCache: false,
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * 캐시 무효화
   */
  invalidateCache(pattern?: string): void {
    if (pattern) {
      // 패턴 매칭 캐시 삭제 (간단한 구현)
      const keys = Array.from((this.cache as any).cache.keys()) as string[];
      keys.forEach(key => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }

  private generateCacheKey(query: Query): string {
    return `query_${query.type}_${JSON.stringify(query.params)}`;
  }
}

// Query 미들웨어 인터페이스
export interface QueryMiddleware {
  before?(query: Query): Promise<Query | void>;
  after?(query: Query, result: QueryResult): Promise<void>;
}

// 성능 모니터링 미들웨어
export class PerformanceMiddleware implements QueryMiddleware {
  private slowQueryThreshold = 1000; // 1초

  async after(query: Query, result: QueryResult): Promise<void> {
    const executionTime = result.metadata?.executionTime || 0;
    
    if (executionTime > this.slowQueryThreshold) {
      console.warn(`[SLOW QUERY] ${query.type} took ${executionTime}ms`, {
        params: query.params,
        fromCache: result.metadata?.fromCache
      });
    }
  }
}

// 전역 Query 버스 인스턴스
export const queryBus = QueryBus.getInstance();

// 기본 미들웨어 등록
queryBus.use(new PerformanceMiddleware());

// Query 타입 정의
export const QUERIES = {
  // 아티스트 관련
  GET_ARTIST_BY_ID: 'get.artist.by_id',
  GET_ALL_ARTISTS: 'get.all.artists',
  SEARCH_ARTISTS: 'search.artists',
  
  // 작품 관련
  GET_ARTWORK_BY_ID: 'get.artwork.by_id',
  GET_ALL_ARTWORKS: 'get.all.artworks',
  GET_ARTWORKS_BY_ARTIST: 'get.artworks.by_artist',
  SEARCH_ARTWORKS: 'search.artworks',
  
  // 통계 관련
  GET_DASHBOARD_STATS: 'get.dashboard.stats',
  GET_RECENT_ARTISTS: 'get.recent.artists',
  GET_RECENT_ARTWORKS: 'get.recent.artworks'
} as const;

export type QueryType = typeof QUERIES[keyof typeof QUERIES];