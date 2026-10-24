'use client'

import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
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
  Palette,
} from 'lucide-react'

export default function CopyrightPolicyContent() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.copyright}
        title='저작권 정책'
        lede='동양서예협회는 창작자의 저작권을 존중하고 보호합니다'
      />

      {/* Main Content */}
      <section className='container mx-auto px-4 py-10 md:py-16'>
        <div className='max-w-4xl mx-auto space-y-8'>
          {/* 기본 원칙 */}
          <Card className='border-l-4 border-l-info'>
            <CardContent className='p-6 md:p-8'>
              <div className='flex items-center gap-3 mb-6'>
                <Shield className='h-6 w-6 text-info dark:text-navy-300' />
                <h2 className='text-2xl md:text-3xl font-bold'>저작권 보호 원칙</h2>
              </div>

              <div className='bg-info/5 p-6 rounded-lg border border-info/30 mb-6'>
                <div className='flex items-start gap-3'>
                  <Copyright className='h-5 w-5 text-info dark:text-navy-300 mt-1 flex-shrink-0' />
                  <div className='space-y-3'>
                    <p className='font-semibold text-foreground'>저작권 존중 선언</p>
                    <p className='text-sm md:text-base text-muted-foreground'>
                      사단법인 동양서예협회는 모든 창작자의 지적재산권을 존중하며, 저작권법에 따라
                      작품과 콘텐츠를 보호합니다. 당 협회의 모든 활동은 저작권 보호를 최우선으로
                      하여 진행됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className='grid md:grid-cols-3 gap-4'>
                <div className='bg-success/5 p-4 rounded-lg border border-success/30'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Palette className='h-5 w-5 text-success dark:text-foreground' />
                    <h3 className='font-semibold text-foreground'>작품 보호</h3>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    출품작, 전시작, 수상작 등 모든 서예 작품의 저작권을 엄격히 보호합니다.
                  </p>
                </div>

                <div className='bg-highlight/5 p-4 rounded-lg border border-highlight/30'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Camera className='h-5 w-5 text-gold-700 dark:text-gold-400' />
                    <h3 className='font-semibold text-foreground'>이미지 보호</h3>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    전시회 사진, 작품 이미지, 교육 자료의 무단 사용을 금지합니다.
                  </p>
                </div>

                <div className='bg-warning/5 p-4 rounded-lg border border-warning/30'>
                  <div className='flex items-center gap-2 mb-3'>
                    <FileText className='h-5 w-5 text-warning dark:text-gold-400' />
                    <h3 className='font-semibold text-foreground'>콘텐츠 보호</h3>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    웹사이트의 모든 텍스트, 디자인, 로고는 저작권 보호를 받습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className='bg-gradient-to-r from-scholar-red/5 to-scholar-red/10 border-scholar-red/20'>
            <CardContent className='p-6 md:p-8 text-center'>
              <h3 className='text-lg md:text-xl font-bold mb-4'>저작권 관련 문의사항</h3>
              <p className='text-sm md:text-base text-muted-foreground mb-4'>
                저작권 정책 및 침해 신고에 대해 궁금한 사항이 있으시면 언제든지 문의해 주세요.
              </p>
              <div className='space-y-2 text-sm text-muted-foreground'>
                <p>📧 info@orientalcalligraphy.org</p>
                <p>📞 0502-5550-8700</p>
                <p>📍 〒02873 서울시 성북구 보문로 57-1, 6층 (보문동7가, 중앙빌딩)</p>
              </div>
              <div className='flex gap-4 justify-center mt-6'>
                <Button className='gap-2'>상담 문의</Button>
                <Button variant='outline' className='gap-2'>
                  상담 예약
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
