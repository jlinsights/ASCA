/**
 * V0 API 클라이언트
 * Vercel의 V0 AI 디자인 도구 API를 사용하기 위한 유틸리티입니다.
 */

import { getEnvVar } from '@/types/env';

/**
 * V0 API 기본 설정
 */
const V0_API_BASE_URL = 'https://api.v0.dev';

/**
 * V0 API 요청 헤더 생성
 */
const getHeaders = (): HeadersInit => {
  const apiKey = getEnvVar('V0_API_KEY');
  
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
};

/**
 * V0 API 응답 타입 정의
 */
export interface V0GenerateRequest {
  prompt: string;
  model?: string;
  style?: 'default' | 'modern' | 'minimal' | 'bold';
  framework?: 'react' | 'vue' | 'svelte';
}

export interface V0GenerateResponse {
  id: string;
  code: string;
  preview_url?: string;
  status: 'completed' | 'processing' | 'failed';
  created_at: string;
}

/**
 * V0 API 에러 타입
 */
export class V0ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'V0ApiError';
  }
}

/**
 * API 응답 처리 헬퍼
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new V0ApiError(
      errorData.message || `API 요청 실패: ${response.status}`,
      response.status,
      errorData
    );
  }
  
  return response.json();
};

/**
 * V0에서 UI 컴포넌트 생성
 * @param request - 생성 요청 파라미터
 * @returns 생성된 컴포넌트 정보
 */
export const generateComponent = async (
  request: V0GenerateRequest
): Promise<V0GenerateResponse> => {
  try {
    const response = await fetch(`${V0_API_BASE_URL}/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    return handleResponse<V0GenerateResponse>(response);
  } catch (error) {
    if (error instanceof V0ApiError) {
      throw error;
    }
    throw new V0ApiError(
      `컴포넌트 생성 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
};

/**
 * 생성된 컴포넌트 상태 확인
 * @param id - 컴포넌트 ID
 * @returns 컴포넌트 상태 정보
 */
export const getComponentStatus = async (
  id: string
): Promise<V0GenerateResponse> => {
  try {
    const response = await fetch(`${V0_API_BASE_URL}/generate/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<V0GenerateResponse>(response);
  } catch (error) {
    if (error instanceof V0ApiError) {
      throw error;
    }
    throw new V0ApiError(
      `컴포넌트 상태 조회 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
};

/**
 * V0 API 연결 테스트
 * @returns API 연결 상태
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${V0_API_BASE_URL}/health`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    return response.ok;
  } catch (error) {
    
    return false;
  }
};

/**
 * V0 API 클라이언트 클래스
 * 더 복잡한 사용 사례를 위한 클래스 기반 접근법
 */
export class V0Client {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || getEnvVar('V0_API_KEY');
    this.baseUrl = baseUrl || V0_API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async generate(request: V0GenerateRequest): Promise<V0GenerateResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return handleResponse<V0GenerateResponse>(response);
  }

  async getStatus(id: string): Promise<V0GenerateResponse> {
    const response = await fetch(`${this.baseUrl}/generate/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return handleResponse<V0GenerateResponse>(response);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
} 