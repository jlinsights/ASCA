'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Contest, ContestFormData, ContestCategory, ContestType, ContestStatus } from '@/types/contest-new'
import { createContest, updateContest } from '@/lib/api/contests'

const contestSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  titleEn: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().min(10, '설명을 입력하세요 (최소 10자)'),
  descriptionEn: z.string().optional(),
  organizer: z.string().min(1, '주최자를 입력하세요'),
  sponsor: z.string().optional(),
  contactEmail: z.string().email('올바른 이메일을 입력하세요').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  category: z.string(),
  contestType: z.string(),
  announcementDate: z.string().optional(),
  startDate: z.string().min(1, '시작일을 입력하세요'),
  endDate: z.string().min(1, '종료일을 입력하세요'),
  resultDate: z.string().optional(),
  exhibitionDate: z.string().optional(),
  eligibility: z.string().optional(),
  theme: z.string().optional(),
  maxSubmissions: z.number().min(1, '최소 1개 이상').max(50, '최대 50개'),
  entryFee: z.number().min(0, '0원 이상'),
  status: z.string(),
  isFeatured: z.boolean(),
}).refine(data => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start < end
}, {
  message: '종료일은 시작일 이후여야 합니다',
  path: ['endDate']
})

interface ContestFormProps {
  contest?: Contest
  onSuccess?: () => void
  onCancel?: () => void
}

export function ContestForm({ contest, onSuccess, onCancel }: ContestFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ContestFormData>({
    resolver: zodResolver(contestSchema as any),
    defaultValues: contest ? {
      title: contest.title,
      titleEn: contest.titleEn || '',
      subtitle: contest.subtitle || '',
      description: contest.description,
      descriptionEn: contest.descriptionEn || '',
      organizer: contest.organizer,
      sponsor: contest.sponsor || '',
      contactEmail: contest.contactEmail || '',
      contactPhone: contest.contactPhone || '',
      websiteUrl: contest.websiteUrl || '',
      category: contest.category,
      contestType: contest.contestType,
      announcementDate: contest.announcementDate || '',
      startDate: contest.startDate,
      endDate: contest.endDate,
      resultDate: contest.resultDate || '',
      exhibitionDate: contest.exhibitionDate || '',
      eligibility: contest.eligibility || '',
      theme: contest.theme || '',
      maxSubmissions: contest.maxSubmissions,
      entryFee: contest.entryFee,
      status: contest.status,
      isFeatured: contest.isFeatured,
    } : {
      title: '',
      description: '',
      organizer: '',
      category: 'painting',
      contestType: 'open',
      startDate: '',
      endDate: '',
      maxSubmissions: 5,
      entryFee: 0,
      status: 'draft',
      isFeatured: false,
    }
  })

  const onSubmit = async (data: ContestFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      if (contest) {
        // Update existing contest
        const { error: updateError } = await updateContest(contest.id, data)
        if (updateError) throw new Error(typeof updateError === 'string' ? updateError : '저장에 실패했습니다')
      } else {
        // Create new contest
        const { error: createError } = await createContest(data)
        if (createError) throw new Error(typeof createError === 'string' ? createError : '생성에 실패했습니다')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/admin/contests')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-scholar-red/10 border border-scholar-red rounded-lg p-4 text-scholar-red">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">제목 (한국어) *</Label>
            <Input id="title" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-sm text-scholar-red mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="titleEn">제목 (English)</Label>
            <Input id="titleEn" {...form.register('titleEn')} />
          </div>

          <div>
            <Label htmlFor="subtitle">부제</Label>
            <Input id="subtitle" {...form.register('subtitle')} />
          </div>

          <div>
            <Label htmlFor="description">설명 (한국어) *</Label>
            <Textarea id="description" {...form.register('description')} rows={4} />
            {form.formState.errors.description && (
              <p className="text-sm text-scholar-red mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descriptionEn">설명 (English)</Label>
            <Textarea id="descriptionEn" {...form.register('descriptionEn')} rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle>주최 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="organizer">주최자 *</Label>
            <Input id="organizer" {...form.register('organizer')} />
            {form.formState.errors.organizer && (
              <p className="text-sm text-scholar-red mt-1">{form.formState.errors.organizer.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="sponsor">후원사</Label>
            <Input id="sponsor" {...form.register('sponsor')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">연락 이메일</Label>
              <Input id="contactEmail" type="email" {...form.register('contactEmail')} />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-scholar-red mt-1">{form.formState.errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactPhone">연락 전화</Label>
              <Input id="contactPhone" {...form.register('contactPhone')} />
            </div>
          </div>

          <div>
            <Label htmlFor="websiteUrl">웹사이트 URL</Label>
            <Input id="websiteUrl" type="url" {...form.register('websiteUrl')} />
            {form.formState.errors.websiteUrl && (
              <p className="text-sm text-scholar-red mt-1">{form.formState.errors.websiteUrl.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category & Type */}
      <Card>
        <CardHeader>
          <CardTitle>분류</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">카테고리 *</Label>
              <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value as ContestCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calligraphy">서예</SelectItem>
                  <SelectItem value="painting">회화</SelectItem>
                  <SelectItem value="sculpture">조각</SelectItem>
                  <SelectItem value="photography">사진</SelectItem>
                  <SelectItem value="mixed">혼합</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contestType">공모전 유형 *</Label>
              <Select value={form.watch('contestType')} onValueChange={(value) => form.setValue('contestType', value as ContestType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">공개</SelectItem>
                  <SelectItem value="young_artist">청년작가</SelectItem>
                  <SelectItem value="professional">전문가</SelectItem>
                  <SelectItem value="student">학생</SelectItem>
                  <SelectItem value="regional">지역</SelectItem>
                  <SelectItem value="themed">테마</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>일정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">시작일 *</Label>
              <Input id="startDate" type="date" {...form.register('startDate')} />
              {form.formState.errors.startDate && (
                <p className="text-sm text-scholar-red mt-1">{form.formState.errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">종료일 *</Label>
              <Input id="endDate" type="date" {...form.register('endDate')} />
              {form.formState.errors.endDate && (
                <p className="text-sm text-scholar-red mt-1">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resultDate">결과 발표일</Label>
              <Input id="resultDate" type="date" {...form.register('resultDate')} />
            </div>

            <div>
              <Label htmlFor="exhibitionDate">전시일</Label>
              <Input id="exhibitionDate" type="date" {...form.register('exhibitionDate')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>요구사항</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="eligibility">응모 자격</Label>
            <Textarea id="eligibility" {...form.register('eligibility')} rows={3} />
          </div>

          <div>
            <Label htmlFor="theme">주제</Label>
            <Textarea id="theme" {...form.register('theme')} rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxSubmissions">최대 제출 작품 수 *</Label>
              <Input
                id="maxSubmissions"
                type="number"
                {...form.register('maxSubmissions', { valueAsNumber: true })}
                min={1}
                max={50}
              />
              {form.formState.errors.maxSubmissions && (
                <p className="text-sm text-scholar-red mt-1">{form.formState.errors.maxSubmissions.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="entryFee">참가비 (원) *</Label>
              <Input
                id="entryFee"
                type="number"
                {...form.register('entryFee', { valueAsNumber: true })}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>상태</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status">공모전 상태 *</Label>
            <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as ContestStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">초안</SelectItem>
                <SelectItem value="announced">발표됨</SelectItem>
                <SelectItem value="open">접수중</SelectItem>
                <SelectItem value="closed">마감</SelectItem>
                <SelectItem value="judging">심사중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={form.watch('isFeatured')}
              onCheckedChange={(checked) => form.setValue('isFeatured', checked)}
            />
            <Label htmlFor="isFeatured">추천 공모전으로 표시</Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="bg-celadon-green hover:bg-celadon-green/90">
          {submitting ? '저장 중...' : contest ? '수정하기' : '생성하기'}
        </Button>
      </div>
    </form>
  )
}
