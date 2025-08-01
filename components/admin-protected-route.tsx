'use client';

import { useEffect, useState } from 'react';

import { devAuth } from '@/lib/auth/dev-auth';
import { useRouter } from 'next/navigation';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminProtectedRoute({ 
  children, 
  fallback = <div>관리자 권한이 필요합니다.</div> 
}: AdminProtectedRouteProps) {
  const [isDevAdmin, setIsDevAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // dev-auth 확인
        const devUser = await devAuth.getCurrentUser();
        if (devUser && devUser.role === 'admin') {
          setIsDevAdmin(true);
        }
      } catch (error) {
        // 오류 처리
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // dev-auth 관리자인 경우
  if (isDevAdmin) {
    return <>{children}</>;
  }

  // 인증되지 않은 경우
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">접근 제한</h1>
        <p className="text-muted-foreground">
          이 페이지에 접근하려면 관리자 권한이 필요합니다.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/admin/dev-login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            개발 로그인
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}