import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            홈페이지로 이동
          </Link>
          
          <Link 
            href="/search" 
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            검색하기
          </Link>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            문제가 지속되면{' '}
            <Link href="/contact" className="text-primary hover:underline">
              고객지원
            </Link>
            으로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  )
} 