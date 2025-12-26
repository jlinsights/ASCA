/**
 * Enhanced Admin API - CQRS + Agent 패턴 적용
 * 기존 admin-api.ts의 개선된 버전
 */
import { log } from '../utils/logger';

import { commandBus, CommandHandler, Command, CommandResult, COMMANDS } from '../cqrs/command-bus';
import { queryBus, QueryHandler, Query, QueryResult, QUERIES } from '../cqrs/query-bus';
import { eventBus, EVENTS } from '../events/event-bus';
import { ArtistService } from '../agents/artist-agent';
import { safeSupabaseAdminCall, ensureSupabaseAdmin, type Database } from '../supabase';
import { SecurityMiddleware, createSecurityContext, sanitizeInput } from '../security/security-middleware';
import { auditTrail } from '../audit/audit-trail';
import { performanceMonitor } from '../monitoring/performance-monitor';

type Artist = Database['public']['Tables']['artists']['Row'];
type ArtistInsert = Database['public']['Tables']['artists']['Insert'];
type ArtistUpdate = Database['public']['Tables']['artists']['Update'];

type Artwork = Database['public']['Tables']['artworks']['Row'];
type ArtworkInsert = Database['public']['Tables']['artworks']['Insert'];
type ArtworkUpdate = Database['public']['Tables']['artworks']['Update'];

// ========== Command Handlers ==========

/**
 * Artist 생성 Command Handler - 보안 강화
 */
export class CreateArtistHandler implements CommandHandler {
  async handle(command: Command): Promise<CommandResult<Artist>> {
    const startTime = performance.now();
    const userId = command.metadata?.userId || 'system';
    
    try {
      const { payload: artistData } = command;
      
      // 보안 검증
      const securityContext = createSecurityContext(userId, 'admin', ['artist.create']);
      const securityValidation = await SecurityMiddleware.validateOperation(
        'artist.create',
        artistData,
        securityContext
      );

      if (!securityValidation.isValid) {
        await auditTrail.log({
          userId,
          operation: 'artist.create',
          resource: 'artist',
          resourceId: 'new',
          metadata: {
            source: 'command_handler',
            version: '1.0.0'
          },
          result: 'failure',
          errorMessage: securityValidation.errors.join(', '),
          riskScore: securityValidation.riskScore
        });

        return {
          success: false,
          error: `Security validation failed: ${securityValidation.errors.join(', ')}`
        };
      }

      // 입력 데이터 살균화
      const sanitizedData = sanitizeInput(artistData);
      
      const supabase = ensureSupabaseAdmin();
      const { data, error } = await supabase
        .from('artists')
        .insert([{
          ...sanitizedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 감사 로그 기록
      await auditTrail.trackDataChange(
        userId,
        'artist.create',
        'artist',
        data.id,
        null,
        data
      );

      // 캐시 무효화
      queryBus.invalidateCache('artists');

      // 성능 모니터링
      performanceMonitor.recordMetric({
        name: 'command.artist.create.duration',
        value: performance.now() - startTime,
        unit: 'ms',
        tags: { success: 'true' },
        threshold: { warning: 1000, critical: 3000 }
      });

      return {
        success: true,
        data
      };

    } catch (error) {
      // 실패 감사 로그
      await auditTrail.log({
        userId,
        operation: 'artist.create',
        resource: 'artist',
        resourceId: 'new',
        metadata: {
          source: 'command_handler',
          version: '1.0.0'
        },
        result: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        riskScore: 0.7
      });

      // 성능 모니터링 (실패)
      performanceMonitor.recordMetric({
        name: 'command.artist.create.duration',
        value: performance.now() - startTime,
        unit: 'ms',
        tags: { success: 'false', error: 'true' }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create artist'
      };
    }
  }
}

/**
 * Artist 업데이트 Command Handler
 */
export class UpdateArtistHandler implements CommandHandler {
  async handle(command: Command): Promise<CommandResult<Artist>> {
    try {
      const { payload: { id, data: artistData } } = command;
      
      const supabase = ensureSupabaseAdmin();
      const { data, error } = await supabase
        .from('artists')
        .update({
          ...artistData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 캐시 무효화
      queryBus.invalidateCache('artists');
      queryBus.invalidateCache(`artist_${id}`);

      return {
        success: true,
        data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update artist'
      };
    }
  }
}

/**
 * Artist 삭제 Command Handler
 */
export class DeleteArtistHandler implements CommandHandler {
  async handle(command: Command): Promise<CommandResult<boolean>> {
    try {
      const { payload: { id } } = command;
      
      const supabase = ensureSupabaseAdmin();
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // 캐시 무효화
      queryBus.invalidateCache('artists');
      queryBus.invalidateCache(`artist_${id}`);

      return {
        success: true,
        data: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete artist'
      };
    }
  }
}

// ========== Query Handlers ==========

/**
 * 모든 Artist 조회 Query Handler
 */
export class GetAllArtistsHandler implements QueryHandler {
  async handle(query: Query): Promise<QueryResult<Artist[]>> {
    try {
      const result = await safeSupabaseAdminCall(async (supabase) => {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return data;
      });

      if (!result) {
        throw new Error('Failed to fetch artists');
      }

      return {
        success: true,
        data: result,
        metadata: {
          totalCount: result.length,
          executionTime: 0,
          fromCache: false,
          timestamp: Date.now()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch artists'
      };
    }
  }
}

/**
 * ID로 Artist 조회 Query Handler
 */
export class GetArtistByIdHandler implements QueryHandler {
  async handle(query: Query): Promise<QueryResult<Artist>> {
    try {
      const { params: { id } } = query;
      
      const result = await safeSupabaseAdminCall(async (supabase) => {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        return data;
      });

      if (!result) {
        throw new Error('Artist not found');
      }

      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch artist'
      };
    }
  }
}

/**
 * Artist 검색 Query Handler
 */
export class SearchArtistsHandler implements QueryHandler {
  async handle(query: Query): Promise<QueryResult<Artist[]>> {
    try {
      const { params: { query: searchQuery } } = query;
      
      const supabase = ensureSupabaseAdmin();
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,nationality.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        metadata: {
          totalCount: data?.length || 0,
          executionTime: 0,
          fromCache: false,
          timestamp: Date.now()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }
}

/**
 * 대시보드 통계 Query Handler
 */
export class GetDashboardStatsHandler implements QueryHandler {
  async handle(query: Query): Promise<QueryResult<any>> {
    try {
      const supabase = ensureSupabaseAdmin();
      
      // 병렬로 통계 데이터 수집
      const [
        { count: artistCount },
        { count: artworkCount },
        { count: availableCount },
        { count: monthlyCount }
      ] = await Promise.all([
        supabase.from('artists').select('*', { count: 'exact', head: true }),
        supabase.from('artworks').select('*', { count: 'exact', head: true }),
        supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('availability', 'available'),
        supabase.from('artworks').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      const stats = {
        totalArtists: artistCount || 0,
        totalArtworks: artworkCount || 0,
        availableArtworks: availableCount || 0,
        monthlyArtworks: monthlyCount || 0,
        lastUpdated: new Date().toISOString()
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats'
      };
    }
  }
}

// ========== Handler 등록 ==========

// Command Handlers 등록
commandBus.registerHandler(COMMANDS.CREATE_ARTIST, new CreateArtistHandler());
commandBus.registerHandler(COMMANDS.UPDATE_ARTIST, new UpdateArtistHandler());
commandBus.registerHandler(COMMANDS.DELETE_ARTIST, new DeleteArtistHandler());

// Query Handlers 등록
queryBus.registerHandler(QUERIES.GET_ALL_ARTISTS, new GetAllArtistsHandler());
queryBus.registerHandler(QUERIES.GET_ARTIST_BY_ID, new GetArtistByIdHandler());
queryBus.registerHandler(QUERIES.SEARCH_ARTISTS, new SearchArtistsHandler());
queryBus.registerHandler(QUERIES.GET_DASHBOARD_STATS, new GetDashboardStatsHandler());

// ========== 호환성을 위한 기존 API 래퍼 ==========

/**
 * 기존 API와 호환성을 유지하면서 새로운 아키텍처 적용
 */
export class EnhancedAdminAPI {
  // Artist 관련 메서드들
  static async getAllArtists(): Promise<Artist[] | null> {
    const result = await queryBus.execute({
      type: QUERIES.GET_ALL_ARTISTS,
      params: {},
      metadata: {
        cacheKey: 'all_artists',
        cacheTTL: 300000 // 5분 캐시
      }
    });

    return result.success ? result.data : null;
  }

  static async getArtistById(id: string): Promise<Artist | null> {
    const result = await queryBus.execute({
      type: QUERIES.GET_ARTIST_BY_ID,
      params: { id },
      metadata: {
        cacheKey: `artist_${id}`,
        cacheTTL: 600000 // 10분 캐시
      }
    });

    return result.success ? result.data : null;
  }

  static async createArtist(artistData: ArtistInsert): Promise<Artist | null> {
    // Agent를 통한 검증 및 생성
    const agentResult = await ArtistService.createArtist(artistData);
    
    if (!agentResult.success) {
      log.error('Artist creation failed:', agentResult.message);
      return null;
    }

    return agentResult.artist || null;
  }

  static async updateArtist(id: string, artistData: ArtistUpdate): Promise<Artist | null> {
    const agentResult = await ArtistService.updateArtist(id, artistData);
    
    if (!agentResult.success) {
      log.error('Artist update failed:', agentResult.message);
      return null;
    }

    return agentResult.artist || null;
  }

  static async deleteArtist(id: string): Promise<boolean> {
    const result = await commandBus.execute({
      type: COMMANDS.DELETE_ARTIST,
      payload: { id },
      metadata: {
        userId: 'system', // 실제 구현에서는 현재 사용자 ID
        timestamp: Date.now()
      }
    });

    return result.success;
  }

  static async searchArtists(query: string): Promise<Artist[] | null> {
    const agentResult = await ArtistService.searchArtists(query);
    
    if (!agentResult.success) {
      log.error('Artist search failed:', agentResult.message);
      return null;
    }

    return agentResult.artists || [];
  }

  static async getDashboardStats(): Promise<any | null> {
    const result = await queryBus.execute({
      type: QUERIES.GET_DASHBOARD_STATS,
      params: {},
      metadata: {
        cacheKey: 'dashboard_stats',
        cacheTTL: 60000 // 1분 캐시 (통계는 자주 업데이트)
      }
    });

    return result.success ? result.data : null;
  }
}

// 이벤트 리스너 등록
eventBus.subscribe(EVENTS.ARTIST_CREATED, async (event) => {
  log.info('Artist created:', event.payload);
  // 추가 비즈니스 로직 (알림, 로깅 등)
});

eventBus.subscribe(EVENTS.ARTIST_UPDATED, async (event) => {
  log.info('Artist updated:', event.payload);
  // 추가 비즈니스 로직
});

eventBus.subscribe(EVENTS.ARTIST_DELETED, async (event) => {
  log.info('Artist deleted:', event.payload);
  // 추가 비즈니스 로직
});