declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_APP_URL: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    // 추가 환경 변수가 있다면 여기에 정의
  }
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

// 브랜드 색상 타입 정의
export type BrandColor = 
  | 'navy-primary' 
  | 'navy-dark' 
  | 'navy-light'
  | 'gold-primary' 
  | 'gold-light' 
  | 'gold-dark'
  | 'burgundy-primary' 
  | 'burgundy-light'

// 서비스 타입 정의
export interface ServiceItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  href: string
}

// 네비게이션 아이템 타입 정의
export interface NavigationItem {
  href: string
  label: string
} 