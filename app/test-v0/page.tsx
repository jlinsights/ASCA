/**
 * V0 API 테스트 페이지
 * V0 API 키가 정상적으로 작동하는지 확인하기 위한 테스트 페이지입니다.
 */

import V0Example from '@/components/v0-example';
import V0ConnectionStatus from '@/components/v0-connection-status';

export default function TestV0Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 헤더 영역 */}
      <div className="relative overflow-hidden bg-white shadow-sm border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-violet-100 text-violet-700 text-sm font-medium px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>AI 기반 컴포넌트 생성</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              V0 API
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"> 테스트</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
              V0 AI 디자인 도구와의 연동 상태를 확인하고, 
              <br className="hidden sm:block" />
              자연어로 React 컴포넌트를 생성해보세요.
            </p>

            {/* 기능 소개 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">실시간 연결 확인</h3>
                <p className="text-sm text-slate-600">API 키 상태를 즉시 확인</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">AI 코드 생성</h3>
                <p className="text-sm text-slate-600">자연어를 React 코드로 변환</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">바로 사용 가능</h3>
                <p className="text-sm text-slate-600">생성된 코드를 즉시 복사</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* API 연결 상태 확인 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              연결 상태 확인
            </h2>
            <p className="text-slate-600">
              V0 API 서버와의 연결 상태를 확인하고 문제를 진단합니다.
            </p>
          </div>
          <V0ConnectionStatus autoCheck={true} />
        </section>
        
        {/* V0 컴포넌트 생성 테스트 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              컴포넌트 생성 테스트
            </h2>
            <p className="text-slate-600">
              자연어 설명을 입력하여 React 컴포넌트를 생성해보세요.
            </p>
          </div>
          <V0Example />
        </section>
      </div>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
              <a 
                href="https://v0.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-violet-600 transition-colors duration-200"
              >
                V0 대시보드
              </a>
              <span>•</span>
              <a 
                href="https://vercel.com/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-violet-600 transition-colors duration-200"
              >
                문서
              </a>
              <span>•</span>
              <a 
                href="https://github.com/vercel/v0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-violet-600 transition-colors duration-200"
              >
                GitHub
              </a>
            </div>
            <p className="text-xs text-slate-400">
              V0 API 테스트 환경 • Next.js + TypeScript + Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 