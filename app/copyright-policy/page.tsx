'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Copyright, 
  Shield, 
  Book, 
  Gavel, 
  Eye, 
  Lock,
  AlertTriangle,
  FileText,
  Image,
  Users,
  ExternalLink,
  Scale,
  Camera,
  Palette
} from 'lucide-react'

// 동적으로 컴포넌트를 로드하여 프리렌더링 문제 해결
const CopyrightPolicyContent = dynamic(() => import('./content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>로딩 중...</p>
      </div>
    </div>
  ),
})

export default function CopyrightPolicyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    }>
      <CopyrightPolicyContent />
    </Suspense>
  )
} 