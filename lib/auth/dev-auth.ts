// 개발 환경용 인증 시스템

export interface DevUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'member' | 'guest';
  membershipLevel?: string;
  isAuthenticated: boolean;
}

class DevAuthService {
  private currentUser: DevUser | null = null;
  private isDevMode = process.env.NODE_ENV === 'development';

  constructor() {
    // 개발 모드에서만 사용
    if (!this.isDevMode) {
      // 개발 환경이 아닌 경우 경고 (linter 오류 방지)
    }
  }

  // 임시 로그인
  async signIn(email: string, password?: string): Promise<DevUser> {
    if (!this.isDevMode) {
      throw new Error('DevAuthService는 개발 환경에서만 사용됩니다.');
    }

    // 개발용 테스트 계정들
    const devUsers: Record<string, DevUser> = {
      'admin@dev.com': {
        id: 'dev-admin-1',
        email: 'admin@dev.com',
        firstName: '관리자',
        lastName: '개발',
        role: 'admin',
        membershipLevel: 'honorary_master',
        isAuthenticated: true,
      },
      'member@dev.com': {
        id: 'dev-member-1',
        email: 'member@dev.com',
        firstName: '회원',
        lastName: '테스트',
        role: 'member',
        membershipLevel: 'advanced_practitioner',
        isAuthenticated: true,
      },
      'guest@dev.com': {
        id: 'dev-guest-1',
        email: 'guest@dev.com',
        firstName: '게스트',
        lastName: '사용자',
        role: 'guest',
        isAuthenticated: true,
      },
    };

    const user = devUsers[email];
    if (!user) {
      throw new Error('유효하지 않은 이메일입니다.');
    }

    this.currentUser = user;
    
    // 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev-auth-user', JSON.stringify(user));
    }

    return user;
  }

  // 로그아웃
  async signOut(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev-auth-user');
    }
  }

  // 현재 사용자 가져오기
  async getCurrentUser(): Promise<DevUser | null> {
    if (!this.isDevMode) {
      return null;
    }

    if (this.currentUser) {
      return this.currentUser;
    }

    // 로컬 스토리지에서 복원
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dev-auth-user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    }

    return null;
  }

  // 인증 상태 확인
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.isAuthenticated || false;
  }

  // 관리자 권한 확인
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  }

  // 회원 권한 확인
  async isMember(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'member' || user?.role === 'admin';
  }
}

export const devAuth = new DevAuthService(); 