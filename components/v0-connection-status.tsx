'use client';

/**
 * V0 API 연결 상태 확인 컴포넌트
 * API 키가 올바르게 설정되었는지 실시간으로 확인합니다.
 */

import React, { useState, useEffect } from 'react';
import { testConnection } from '@/lib/v0-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, RefreshCw } from 'lucide-react';
import { log } from '@/lib/utils/logger';

interface ConnectionStatusProps {
  autoCheck?: boolean;
}

export const V0ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  autoCheck = false 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  /**
   * API 연결 상태 확인
   */
  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await testConnection();
      setIsConnected(connected);
      setLastChecked(new Date());
    } catch (error) {
      log.error('연결 테스트 오류', error as Error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  // 자동 확인 설정시 컴포넌트 마운트시 실행
  useEffect(() => {
    if (autoCheck) {
      checkConnection();
    }
  }, [autoCheck]);

  /**
   * 상태에 따른 스타일 반환
   */
  const getStatusConfig = () => {
    if (isChecking) {
      return {
        variant: 'checking',
        icon: (
          <div className="flex items-center justify-center w-5 h-5">
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ),
        title: '연결 상태 확인 중',
        description: 'V0 API 서버와의 연결을 확인하고 있습니다...',
        bgClass: 'bg-amber-50 border-amber-200',
        textClass: 'text-amber-900',
        descClass: 'text-amber-700'
      };
    }

    if (isConnected === null) {
      return {
        variant: 'idle',
        icon: (
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: '연결 상태 미확인',
        description: '연결 테스트 버튼을 클릭하여 V0 API 상태를 확인하세요.',
        bgClass: 'bg-slate-50 border-slate-200',
        textClass: 'text-slate-900',
        descClass: 'text-slate-600'
      };
    }

    if (isConnected) {
      return {
        variant: 'success',
        icon: (
          <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full">
            <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ),
        title: '연결 성공',
        description: 'V0 API에 성공적으로 연결되었습니다. 컴포넌트 생성이 가능합니다.',
        bgClass: 'bg-emerald-50 border-emerald-200',
        textClass: 'text-emerald-900',
        descClass: 'text-emerald-700'
      };
    }

    return {
      variant: 'error',
      icon: (
        <div className="flex items-center justify-center w-5 h-5 bg-red-100 rounded-full">
          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      title: '연결 실패',
      description: 'V0 API 연결에 실패했습니다. 설정을 확인해주세요.',
      bgClass: 'bg-red-50 border-red-200',
      textClass: 'text-red-900',
      descClass: 'text-red-700'
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="w-full">
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${statusConfig.bgClass}`}>
        {/* 상단 헤더 */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <div className="mt-0.5 transition-transform duration-200 hover:scale-110">
                {statusConfig.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className={`text-sm font-semibold tracking-tight ${statusConfig.textClass}`}>
                    V0 API 연결 상태
                  </h3>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/50 ${statusConfig.textClass}`}>
                    {statusConfig.title}
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${statusConfig.descClass}`}>
                  {statusConfig.description}
                </p>
                {lastChecked && (
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    마지막 확인: {lastChecked.toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg border border-transparent hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  확인 중
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  연결 테스트
                </>
              )}
            </button>
          </div>
        </div>

        {/* 에러 상태일 때 문제 해결 가이드 */}
        {isConnected === false && (
          <div className="border-t border-red-200 bg-red-25 px-6 py-4">
            <div className="rounded-lg bg-white/60 p-4 backdrop-blur-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">
                    문제 해결 가이드
                  </h4>
                  <div className="space-y-2">
                    {[
                      '.env.local 파일에 V0_API_KEY가 올바르게 설정되었는지 확인',
                      'API 키 형식이 v1:xxx:xxx 형태인지 확인',
                      'V0 대시보드에서 API 키가 활성화되어 있는지 확인',
                      '개발 서버를 재시작해보세요'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-red-800 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default V0ConnectionStatus; 