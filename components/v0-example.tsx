'use client';

/**
 * V0 API 사용 예시 컴포넌트
 * V0 AI 디자인 도구를 사용하여 컴포넌트를 생성하는 방법을 보여줍니다.
 */

import React, { useState } from 'react';
import { generateComponent, V0GenerateRequest, V0GenerateResponse, V0ApiError } from '@/lib/v0-api';
import { log } from '@/lib/utils/logger'

export const V0Example: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<V0GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * V0 API를 사용하여 컴포넌트 생성
   */
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: V0GenerateRequest = {
        prompt: prompt.trim(),
        style: 'modern',
        framework: 'react',
      };

      const response = await generateComponent(request);
      setResult(response);
    } catch (err) {
      log.error('V0 API 오류', err as Error)
      setError('예시 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 입력 폼 초기화
   */
  const handleReset = () => {
    setPrompt('');
    setResult(null);
    setError(null);
  };

  /**
   * 샘플 프롬프트 버튼
   */
  const samplePrompts = [
    'A modern login form with email and password fields',
    'A responsive pricing card with three tiers',
    'A dashboard header with navigation and user avatar',
    'A contact form with validation states'
  ];

  const handleSamplePrompt = (sample: string) => {
    setPrompt(sample);
    setError(null);
  };

  return (
    <div className="w-full space-y-8">
      {/* 메인 생성 카드 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                V0 AI 컴포넌트 생성기
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                자연어로 UI 컴포넌트를 설명하면 React 코드로 변환해드립니다
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          {/* 프롬프트 입력 영역 */}
          <div className="space-y-3">
            <label 
              htmlFor="prompt" 
              className="block text-sm font-semibold text-slate-700"
            >
              컴포넌트 설명 (영문)
              <span className="ml-1 text-slate-400 font-normal">*</span>
            </label>
            <div className="relative">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: A modern card component with image, title, description, and action button"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none bg-slate-50 hover:bg-white focus:bg-white"
                rows={3}
                disabled={isLoading}
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {prompt.length}/500
              </div>
            </div>
          </div>

          {/* 샘플 프롬프트 */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-600">빠른 시작:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSamplePrompt(sample)}
                  disabled={isLoading}
                  className="text-left p-3 text-xs text-slate-600 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 rounded-lg border border-slate-200 hover:border-violet-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  AI가 코드를 생성하고 있습니다...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  컴포넌트 생성
                </>
              )}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                오류가 발생했습니다
              </h3>
              <p className="text-sm text-red-700 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  생성 완료!
                </h3>
                <p className="text-emerald-100 text-sm">
                  컴포넌트가 성공적으로 생성되었습니다
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {/* 메타 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">
                  생성 ID
                </div>
                <div className="text-sm font-mono text-slate-900 break-all">
                  {result.id}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">
                  상태
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-900 capitalize">
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 미리보기 링크 */}
            {result.preview_url && (
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">
                  미리보기
                </div>
                <a 
                  href={result.preview_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors duration-200"
                >
                  <span>V0에서 열기</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
            
            {/* 생성된 코드 */}
            {result.code && (
              <div className="bg-white rounded-lg border border-emerald-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                      생성된 React 코드
                    </span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(result.code)}
                      className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors duration-200"
                    >
                      복사
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="text-xs leading-relaxed overflow-x-auto">
                    <code className="text-slate-800">
                      {result.code}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default V0Example; 