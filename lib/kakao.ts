// Kakao SDK 유틸리티
// Kakao JavaScript SDK 및 REST API 관리

declare global {
  interface Window {
    Kakao: any;
  }
}

export interface KakaoConfig {
  appKey: string;
  restApiKey: string;
  javascriptKey: string;
  adminKey?: string;
}

export interface KakaoShareTemplate {
  objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text';
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl?: string;
      webUrl?: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      mobileWebUrl?: string;
      webUrl?: string;
    };
  }>;
}

export interface KakaoLoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
    };
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
  };
}

class KakaoSDK {
  private config: KakaoConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      appKey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '',
      restApiKey: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || '',
      javascriptKey: process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || '',
      adminKey: process.env.KAKAO_ADMIN_KEY || '',
    };
  }

  // Kakao SDK 초기화
  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') {
      
      return false;
    }

    if (this.isInitialized && window.Kakao?.isInitialized()) {
      return true;
    }

    try {
      // Kakao SDK 스크립트 로드
      if (!window.Kakao) {
        await this.loadKakaoScript();
      }

      // JavaScript 키로 초기화
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(this.config.javascriptKey);
        
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      
      return false;
    }
  }

  // Kakao SDK 스크립트 동적 로드
  private loadKakaoScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('kakao-sdk')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'kakao-sdk';
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Kakao SDK'));
      
      document.head.appendChild(script);
    });
  }

  // 카카오톡 공유하기
  async shareToKakaoTalk(template: KakaoShareTemplate): Promise<boolean> {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Kakao SDK initialization failed');
      }

      return new Promise((resolve, reject) => {
        window.Kakao.Share.sendDefault({
          ...template,
          success: (response: any) => {
            
            resolve(true);
          },
          fail: (error: any) => {
            
            reject(error);
          },
        });
      });
    } catch (error) {
      
      return false;
    }
  }

  // 카카오 로그인
  async loginWithKakao(): Promise<KakaoLoginResponse | null> {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Kakao SDK initialization failed');
      }

      return new Promise((resolve, reject) => {
        window.Kakao.Auth.login({
          success: (authObj: KakaoLoginResponse) => {
            
            resolve(authObj);
          },
          fail: (error: any) => {
            
            reject(error);
          },
        });
      });
    } catch (error) {
      
      return null;
    }
  }

  // 카카오 로그아웃
  async logoutFromKakao(): Promise<boolean> {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }

      return new Promise((resolve) => {
        window.Kakao.Auth.logout(() => {
          
          resolve(true);
        });
      });
    } catch (error) {
      
      return false;
    }
  }

  // 사용자 정보 가져오기
  async getUserInfo(): Promise<KakaoUserInfo | null> {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Kakao SDK initialization failed');
      }

      return new Promise((resolve, reject) => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (response: KakaoUserInfo) => {
            
            resolve(response);
          },
          fail: (error: any) => {
            
            reject(error);
          },
        });
      });
    } catch (error) {
      
      return null;
    }
  }

  // REST API를 이용한 푸시 알림 발송
  async sendPushNotification(userIds: string[], templateId: number, templateArgs?: any): Promise<boolean> {
    try {
      const response = await fetch('https://kapi.kakao.com/v1/push/send', {
        method: 'POST',
        headers: {
          'Authorization': `KakaoAK ${this.config.restApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'receiver_id_type': 'user_id',
          'receiver_ids': JSON.stringify(userIds),
          'template_id': templateId.toString(),
          'template_args': templateArgs ? JSON.stringify(templateArgs) : '{}',
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        
        return true;
      } else {
        
        return false;
      }
    } catch (error) {
      
      return false;
    }
  }

  // 카카오맵 연동을 위한 좌표 검색
  async searchLocation(query: string): Promise<any> {
    try {
      const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `KakaoAK ${this.config.restApiKey}`,
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        
        return result;
      } else {
        
        return null;
      }
    } catch (error) {
      
      return null;
    }
  }

  // 설정 정보 반환
  getConfig(): KakaoConfig {
    return { ...this.config };
  }

  // 초기화 상태 확인
  isSDKInitialized(): boolean {
    return this.isInitialized && (typeof window !== 'undefined' && window.Kakao?.isInitialized());
  }
}

// 싱글톤 인스턴스
export const kakaoSDK = new KakaoSDK();

// 편의 함수들
export const initializeKakao = () => kakaoSDK.initialize();
export const shareToKakaoTalk = (template: KakaoShareTemplate) => kakaoSDK.shareToKakaoTalk(template);
export const loginWithKakao = () => kakaoSDK.loginWithKakao();
export const logoutFromKakao = () => kakaoSDK.logoutFromKakao();
export const getKakaoUserInfo = () => kakaoSDK.getUserInfo();
export const searchKakaoLocation = (query: string) => kakaoSDK.searchLocation(query);

export default kakaoSDK; 