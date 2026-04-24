/**
 * 환경변수 타입 정의
 * Next.js 프로젝트에서 사용되는 모든 환경변수의 타입을 정의합니다.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Clerk Authentication
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      CLERK_SECRET_KEY: string;
      NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
      NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL?: string;
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL?: string;

      // Supabase Configuration
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

      // Airtable Configuration
      AIRTABLE_API_KEY: string;
      AIRTABLE_BASE_ID: string;

      // V0 API Configuration
      V0_API_KEY: string;

      // Other environment variables
      NEXT_PUBLIC_SITE_URL: string;
    }
  }
}

/**
 * 환경변수 유틸리티 함수
 * 환경변수의 존재를 확인하고 안전하게 반환합니다.
 */
export const getEnvVar = (key: keyof NodeJS.ProcessEnv): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
};

/**
 * 선택적 환경변수 반환 함수
 */
export const getOptionalEnvVar = (
  key: keyof NodeJS.ProcessEnv,
  defaultValue?: string
): string | undefined => {
  return process.env[key] || defaultValue;
};

export {}; 