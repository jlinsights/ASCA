'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Edit } from 'lucide-react';

// 개발용 임시 로그인 페이지
export default function DevLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const devAccounts = [
    {
      id: 'super_admin',
      name: '시스템 관리자',
      email: 'admin@asca.kr',
      role: 'super_admin',
      icon: Shield,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'content_manager',
      name: '콘텐츠 관리자',
      email: 'content@asca.kr',
      role: 'content_manager',
      icon: User,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'editor',
      name: '편집자',
      email: 'editor@asca.kr',
      role: 'editor',
      icon: Edit,
      color: 'bg-green-100 text-green-800'
    }
  ];

  const handleDevLogin = async (account: typeof devAccounts[0]) => {
    setLoading(true);
    
    // 개발용 임시 세션 설정
    localStorage.setItem('dev_admin_session', JSON.stringify({
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role
      },
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    }));

    // 관리자 대시보드로 리다이렉트
    setTimeout(() => {
      router.push('/admin');
    }, 1000);
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">개발용 관리자 로그인</CardTitle>
          <CardDescription>
            개발 환경에서만 사용 가능한 임시 로그인입니다
          </CardDescription>
          <Badge variant="destructive" className="mx-auto w-fit">
            개발 전용
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {devAccounts.map((account) => {
              const IconComponent = account.icon;
              return (
                <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${account.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.name}</h3>
                          <p className="text-sm text-gray-600">{account.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDevLogin(account)}
                        disabled={loading}
                        variant="outline"
                      >
                        {loading ? '로그인 중...' : '로그인'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ 이 페이지는 개발 환경에서만 사용하세요. 
              실제 운영 환경에서는 정식 Supabase Auth를 사용해야 합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}