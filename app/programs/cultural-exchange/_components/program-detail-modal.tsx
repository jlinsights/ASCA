import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star } from 'lucide-react'
import type { CulturalExchangeProgramInfo } from '@/lib/types/membership'

interface ProgramDetailModalProps {
  program: CulturalExchangeProgramInfo | null
  onClose: () => void
}

export function ProgramDetailModal({ program, onClose }: ProgramDetailModalProps) {
  if (!program) return null

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      <Card className='max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle>{program.title}</CardTitle>
              <p className='text-muted-foreground mt-2'>{program.description}</p>
            </div>
            <Button variant='outline' size='sm' onClick={onClose}>
              닫기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div>
              <h4 className='font-semibold mb-3'>프로그램 정보</h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>기간:</span>
                  <span className='ml-2'>{program.duration}일</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>장소:</span>
                  <span className='ml-2'>{program.location}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>참가비:</span>
                  <span className='ml-2'>₩{program.fee.toLocaleString()}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>모집인원:</span>
                  <span className='ml-2'>{program.maxParticipants}명</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-3'>신청 자격</h4>
              <div className='space-y-2'>
                {program.requirements.map((req, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4 text-green-600' />
                    <span className='text-sm'>{req.description}</span>
                    {req.mandatory && (
                      <Badge variant='secondary' className='text-xs'>
                        필수
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-3'>프로그램 혜택</h4>
              <div className='space-y-2'>
                {program.benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Star className='w-4 h-4 text-amber-500' />
                    <span className='text-sm'>{benefit.description}</span>
                    {benefit.value && (
                      <Badge variant='outline' className='text-xs'>
                        {benefit.value}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className='pt-4 border-t'>
              <Button className='w-full' size='lg'>
                지금 신청하기
              </Button>
              <p className='text-xs text-center text-muted-foreground mt-2'>
                신청 마감: {program.applicationDeadline?.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
