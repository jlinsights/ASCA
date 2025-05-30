import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-center">접근 권한 없음</CardTitle>
          <CardDescription className="text-center">
            이 페이지에 접근할 권한이 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            관리자에게 문의하여 필요한 권한을 요청하세요.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                관리자 대시보드로 돌아가기
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">홈페이지로 이동</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}