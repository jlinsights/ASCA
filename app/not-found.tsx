'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            요청하신 페이지를 찾을 수 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈페이지로 이동
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                검색하기
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전 페이지로
              </Link>
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">
              문제가 지속되면{' '}
              <Link href="/contact" className="text-primary hover:underline">
                고객지원
              </Link>
              으로 문의해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 