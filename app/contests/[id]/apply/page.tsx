'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchContestById, submitContestApplication } from '@/lib/api/contests'
import { getSupabaseClient } from '@/lib/supabase'
import { Contest, canApplyToContest } from '@/types/contest-new'
import type { Artwork } from '@/types/artwork'

export default function ContestApplyPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  const [contest, setContest] = useState<Contest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artistName, setArtistName] = useState('')
  const [artistEmail, setArtistEmail] = useState('')
  const [artistPhone, setArtistPhone] = useState('')
  const [artistAddress, setArtistAddress] = useState('')
  const [artistStatement, setArtistStatement] = useState('')
  const [notes, setNotes] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // User info
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)

        // Check authentication
        const supabase = getSupabaseClient()
        if (!supabase) {
          throw new Error('인증 시스템을 사용할 수 없습니다.')
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
          return
        }

        setUserId(user.id)

        // Get user profile for auto-fill
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', user.id)
          .single()

        if (profile) {
          setArtistName(profile.name || '')
          setArtistEmail(profile.email || user.email || '')
          setArtistPhone(profile.phone || '')
        }

        // Get user's artworks
        const { data: userArtworks } = await supabase
          .from('artworks')
          .select('*')
          .eq('artist_id', user.id)
          .order('created_at', { ascending: false })

        if (userArtworks) {
          setArtworks(userArtworks as Artwork[])
        }

        // Fetch contest
        const { data: contestData, error: contestError } = await fetchContestById(contestId)
        if (contestError || !contestData) {
          throw new Error('공모전을 찾을 수 없습니다.')
        }

        setContest(contestData)

        // Check if can apply
        if (!canApplyToContest(contestData)) {
          throw new Error('현재 이 공모전에 지원할 수 없습니다.')
        }

        // Check if already applied
        const { data: existingApp } = await supabase
          .from('contest_applications')
          .select('id')
          .eq('contest_id', contestId)
          .eq('artist_id', user.id)
          .single()

        if (existingApp) {
          throw new Error('이미 이 공모전에 지원하셨습니다.')
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : '초기화에 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (contestId) {
      init()
    }
  }, [contestId, router])

  const toggleArtworkSelection = (artworkId: string) => {
    if (selectedArtworkIds.includes(artworkId)) {
      setSelectedArtworkIds(selectedArtworkIds.filter(id => id !== artworkId))
    } else {
      if (contest && selectedArtworkIds.length >= contest.maxSubmissions) {
        setError(`최대 ${contest.maxSubmissions}개의 작품만 선택할 수 있습니다.`)
        return
      }
      setSelectedArtworkIds([...selectedArtworkIds, artworkId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !contest) return

    // Validation
    if (selectedArtworkIds.length === 0) {
      setError('최소 1개의 작품을 선택해주세요.')
      return
    }

    if (selectedArtworkIds.length > contest.maxSubmissions) {
      setError(`최대 ${contest.maxSubmissions}개의 작품만 제출할 수 있습니다.`)
      return
    }

    if (!artistName || !artistEmail) {
      setError('이름과 이메일은 필수입니다.')
      return
    }

    if (!agreedToTerms) {
      setError('참가 약관에 동의해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const { data, error: submitError } = await submitContestApplication({
        contestId,
        artworkIds: selectedArtworkIds,
        artistName,
        artistEmail,
        artistPhone,
        artistAddress,
        artistStatement,
        notes,
        paymentStatus: contest.entryFee === 0 ? 'waived' : 'pending'
      })

      if (submitError || !data) {
        throw new Error(submitError ? String(submitError) : '신청서 제출에 실패했습니다.')
      }

      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/profile/applications')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-celadon-green" />
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                신청이 완료되었습니다!
              </h2>
              <p className="text-muted-foreground mb-6">
                공모전 신청서가 성공적으로 제출되었습니다.
              </p>
              <Link href="/profile/applications">
                <Button className="bg-celadon-green hover:bg-celadon-green/90">
                  내 신청서 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !contest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center py-6">
            <Link href="/contests">
              <Button variant="outline">공모전 목록으로</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/contests/${contestId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            공모전 신청  
          </h1>
          <p className="text-lg text-muted-foreground">
            {contest?.title}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Artwork Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">출품작 선택</CardTitle>
              <p className="text-sm text-muted-foreground">
                최대 {contest?.maxSubmissions}개까지 선택 가능 (선택됨: {selectedArtworkIds.length})
              </p>
            </CardHeader>
            <CardContent>
              {artworks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">등록된 작품이 없습니다.</p>
                  <Link href="/artworks/upload">
                    <Button variant="outline">작품 업로드하기</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {artworks.map((artwork) => {
                    const isSelected = selectedArtworkIds.includes(artwork.id)
                    return (
                      <div
                        key={artwork.id}
                        onClick={() => toggleArtworkSelection(artwork.id)}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-celadon-green bg-celadon-green/10' 
                            : 'border-border hover:border-celadon-green/50'
                        }`}
                      >
                        <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                          {artwork.images?.main?.url && (
                            <Image
                              src={artwork.images.main.url}
                              alt={artwork.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-celadon-green rounded-full p-1">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                            {artwork.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {artwork.medium}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Artist Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">작가 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={artistEmail}
                    onChange={(e) => setArtistEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={artistPhone}
                    onChange={(e) => setArtistPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={artistAddress}
                    onChange={(e) => setArtistAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artist Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">작가 노트</CardTitle>
              <p className="text-sm text-muted-foreground">
                작품에 대한 설명이나 작가의 의도를 작성해주세요
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statement">작가 노트</Label>
                <Textarea
                  id="statement"
                  value={artistStatement}
                  onChange={(e) => setArtistStatement(e.target.value)}
                  rows={6}
                  placeholder="작품의 주제, 기법, 메시지 등을 자유롭게 작성해주세요..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">추가 메모</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="심사위원에게 전달하고 싶은 추가 정보가 있다면 작성해주세요..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Entry Fee */}
          {contest && contest.entryFee > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">참가비</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">참가비</span>
                  <span className="text-2xl font-bold text-foreground">
                    {(contest.entryFee / 10000).toLocaleString()}만원
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  신청 후 입금 안내가 이메일로 전송됩니다.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">약관 동의</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg max-h-48 overflow-y-auto text-sm text-muted-foreground">
                  <h4 className="font-semibold text-foreground mb-2">참가 약관</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>제출된 작품은 본인의 창작물이어야 합니다.</li>
                    <li>타인의 저작권을 침해하지 않는 작품이어야 합니다.</li>
                    <li>수상작은 전시 및 카탈로그 제작에 사용될 수 있습니다.</li>
                    <li>제출 후에는 작품 변경이 불가능합니다.</li>
                    <li>허위 정보 제공 시 수상이 취소될 수 있습니다.</li>
                    <li>참가비는 환불되지 않습니다.</li>
                  </ol>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label 
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    위 약관을 읽었으며 이에 동의합니다 *
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link href={`/contests/${contestId}`}>
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-celadon-green hover:bg-celadon-green/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  제출중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  신청서 제출
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
