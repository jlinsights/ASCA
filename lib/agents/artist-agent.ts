/**
 * Artist 도메인 SubAgent
 * 아티스트 관련 작업 처리 전담 Agent
 */

import { SubAgent, AgentTask, createTask, agentPool } from './sub-agent';
import { commandBus, COMMANDS } from '../cqrs/command-bus';
import { queryBus, QUERIES } from '../cqrs/query-bus';
import { eventBus, EVENTS } from '../events/event-bus';
import type { ArtistInsert, ArtistUpdate } from '../supabase';

export interface ArtistTaskInput {
  action: 'create' | 'update' | 'delete' | 'search' | 'validate';
  data?: ArtistInsert | ArtistUpdate;
  id?: string;
  searchQuery?: string;
  validationRules?: string[];
}

export interface ArtistTaskOutput {
  artist?: any;
  artists?: any[];
  validationErrors?: string[];
  success: boolean;
  message?: string;
}

/**
 * 아티스트 처리 SubAgent
 */
export class ArtistAgent extends SubAgent<ArtistTaskInput, ArtistTaskOutput> {
  constructor(id: string = 'artist-agent') {
    super(id, 'artist');
  }

  async execute(task: AgentTask<ArtistTaskInput>): Promise<ArtistTaskOutput> {
    const { action, data, id, searchQuery, validationRules } = task.input;

    switch (action) {
      case 'create':
        return await this.createArtist(data as ArtistInsert);
      
      case 'update':
        return await this.updateArtist(id!, data as ArtistUpdate);
      
      case 'delete':
        return await this.deleteArtist(id!);
      
      case 'search':
        return await this.searchArtists(searchQuery!);
      
      case 'validate':
        return await this.validateArtist(data as ArtistInsert, validationRules);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async createArtist(data: ArtistInsert): Promise<ArtistTaskOutput> {
    try {
      // 1. 데이터 검증
      const validation = await this.validateArtist(data);
      if (!validation.success) {
        return validation;
      }

      // 2. Command 실행
      const result = await commandBus.execute({
        type: COMMANDS.CREATE_ARTIST,
        payload: data,
        metadata: {
          timestamp: Date.now()
        }
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // 3. 이벤트 발행
      await eventBus.emit(EVENTS.ARTIST_CREATED, {
        artistId: result.data?.id,
        artistData: data
      });

      return {
        artist: result.data,
        success: true,
        message: 'Artist created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create artist'
      };
    }
  }

  private async updateArtist(id: string, data: ArtistUpdate): Promise<ArtistTaskOutput> {
    try {
      // 기존 아티스트 확인
      const existingResult = await queryBus.execute({
        type: QUERIES.GET_ARTIST_BY_ID,
        params: { id }
      });

      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          message: 'Artist not found'
        };
      }

      // Command 실행
      const result = await commandBus.execute({
        type: COMMANDS.UPDATE_ARTIST,
        payload: { id, data },
        metadata: {
          timestamp: Date.now()
        }
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // 이벤트 발행
      await eventBus.emit(EVENTS.ARTIST_UPDATED, {
        artistId: id,
        oldData: existingResult.data,
        newData: data
      });

      return {
        artist: result.data,
        success: true,
        message: 'Artist updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update artist'
      };
    }
  }

  private async deleteArtist(id: string): Promise<ArtistTaskOutput> {
    try {
      // Command 실행
      const result = await commandBus.execute({
        type: COMMANDS.DELETE_ARTIST,
        payload: { id },
        metadata: {
          timestamp: Date.now()
        }
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // 이벤트 발행
      await eventBus.emit(EVENTS.ARTIST_DELETED, {
        artistId: id
      });

      return {
        success: true,
        message: 'Artist deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete artist'
      };
    }
  }

  private async searchArtists(query: string): Promise<ArtistTaskOutput> {
    try {
      const result = await queryBus.execute({
        type: QUERIES.SEARCH_ARTISTS,
        params: { query },
        metadata: {
          cacheKey: `search_artists_${query}`,
          cacheTTL: 300000 // 5분 캐시
        }
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        artists: result.data,
        success: true,
        message: `Found ${result.data?.length || 0} artists`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  private async validateArtist(
    data: ArtistInsert, 
    rules: string[] = ['required', 'format']
  ): Promise<ArtistTaskOutput> {
    const validationErrors: string[] = [];

    if (rules.includes('required')) {
      if (!data.name || data.name.trim().length === 0) {
        validationErrors.push('Artist name is required');
      }
      if (!data.bio || data.bio.trim().length === 0) {
        validationErrors.push('Artist bio is required');
      }
    }

    if (rules.includes('format')) {
      if (data.name && data.name.length > 100) {
        validationErrors.push('Artist name must be less than 100 characters');
      }
      if (data.bio && data.bio.length > 1000) {
        validationErrors.push('Artist bio must be less than 1000 characters');
      }
    }

    if (rules.includes('uniqueness')) {
      // 이름 중복 확인
      const existingResult = await queryBus.execute({
        type: QUERIES.SEARCH_ARTISTS,
        params: { query: data.name }
      });

      if (existingResult.success && existingResult.data?.length > 0) {
        const duplicate = existingResult.data.find((artist: any) => 
          artist.name.toLowerCase() === data.name.toLowerCase()
        );
        if (duplicate) {
          validationErrors.push('Artist name already exists');
        }
      }
    }

    return {
      success: validationErrors.length === 0,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      message: validationErrors.length > 0 
        ? `Validation failed: ${validationErrors.join(', ')}`
        : 'Validation passed'
    };
  }
}

// Artist Agent 팩토리 함수
export function createArtistTask(
  action: ArtistTaskInput['action'],
  options: Omit<ArtistTaskInput, 'action'> = {},
  taskOptions: Partial<AgentTask<ArtistTaskInput>> = {}
) {
  return createTask<ArtistTaskInput>(
    'artist',
    { action, ...options },
    {
      priority: action === 'create' || action === 'update' ? 10 : 5,
      timeout: 30000, // 30초
      ...taskOptions
    }
  );
}

// Artist Agent 헬퍼 함수들
export class ArtistService {
  static async createArtist(data: ArtistInsert): Promise<ArtistTaskOutput> {
    const task = createArtistTask('create', { data });
    agentPool.addTask(task);
    
    // 결과 대기 (실제 구현에서는 Promise 기반으로 개선 필요)
    return new Promise((resolve) => {
      const checkResult = () => {
        const result = agentPool.getResult(task.id);
        if (result) {
          resolve(result.output as ArtistTaskOutput);
        } else {
          setTimeout(checkResult, 100);
        }
      };
      checkResult();
    });
  }

  static async updateArtist(id: string, data: ArtistUpdate): Promise<ArtistTaskOutput> {
    const task = createArtistTask('update', { id, data });
    agentPool.addTask(task);
    
    return new Promise((resolve) => {
      const checkResult = () => {
        const result = agentPool.getResult(task.id);
        if (result) {
          resolve(result.output as ArtistTaskOutput);
        } else {
          setTimeout(checkResult, 100);
        }
      };
      checkResult();
    });
  }

  static async searchArtists(query: string): Promise<ArtistTaskOutput> {
    const task = createArtistTask('search', { searchQuery: query });
    agentPool.addTask(task);
    
    return new Promise((resolve) => {
      const checkResult = () => {
        const result = agentPool.getResult(task.id);
        if (result) {
          resolve(result.output as ArtistTaskOutput);
        } else {
          setTimeout(checkResult, 100);
        }
      };
      checkResult();
    });
  }
}

// Artist Agent 인스턴스 생성 및 등록
export const artistAgent = new ArtistAgent();
agentPool.registerAgent(artistAgent);