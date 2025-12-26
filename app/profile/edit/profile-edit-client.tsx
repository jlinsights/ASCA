'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Eye, Upload, Globe, Instagram, Facebook, Twitter } from 'lucide-react'
import { fetchArtistProfile, updateArtistProfile, toggleProfileVisibility, uploadProfileImage } from '@/lib/api/profiles'
import { getSupabaseClient } from '@/lib/supabase'
import type { ArtistProfile, ArtistProfileFormData } from '@/types/profile'
import Image from 'next/image'

export function ProfileEditClient() {
  const router = useRouter()
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<ArtistProfileFormData>({
    name: '',
    nameEn: '',
    bio: '',
    bioEn: '',
    email: '',
    phone: '',
    location: '',
    specialization: [],
    yearsActive: undefined,
    birthYear: undefined,
    socialLinks: {
      website: '',
      instagram: '',
      facebook: '',
      twitter: ''
    },
    isPublic: true
  })

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        router.push('/login')
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)
      const { data, error } = await fetchArtistProfile(user.id)

      if (data) {
        setProfile(data)
        setFormData({
          name: data.name || '',
          nameEn: data.nameEn || '',
          bio: data.bio || '',
          bioEn: data.bioEn || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          specialization: data.specialization || [],
          yearsActive: data.yearsActive,
          birthYear: data.birthYear,
          socialLinks: data.socialLinks || {},
          isPublic: data.isPublic
        })
        if (data.profileImage) {
          setProfileImagePreview(data.profileImage)
        }
      }
      
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return

    setSaving(true)

    try {
      // Upload profile image if changed
      if (profileImageFile) {
        await uploadProfileImage(userId, profileImageFile)
      }

      // Update profile
      const { data, error } = await updateArtistProfile(userId, formData)

      if (error) {
        alert('프로필 저장에 실패했습니다.')
        console.error(error)
      } else {
        alert('프로필이 성공적으로 저장되었습니다!')
        setProfile(data)
      }
    } catch (error) {
      alert('프로필 저장 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = async () => {
    if (!userId) return

    const { data, error } = await toggleProfileVisibility(userId)
    
    if (error) {
      alert('공개 설정 변경에 실패했습니다.')
    } else if (data) {
      setProfile(data)
      setFormData({ ...formData, isPublic: data.isPublic })
    }
  }

  const handleSpecializationChange = (value: string) => {
    const specs = value.split(',').map(s => s.trim()).filter(Boolean)
    setFormData({ ...formData, specialization: specs })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-celadon-green mb-4" />
          <p className="text-muted-foreground">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로 가기
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                  프로필 편집
                </h1>
                <p className="text-muted-foreground">
                  작가 프로필 정보를 관리하세요
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/artists/${userId}/portfolio`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                포트폴리오 보기
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">프로필 이미지</CardTitle>
                <CardDescription>
                  작가의 프로필 사진을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-celadon-green">
                  {profileImagePreview ? (
                    <Image
                      src={profileImagePreview}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-celadon-green/20 flex items-center justify-center">
                      <span className="text-4xl font-serif text-celadon-green">
                        {formData.name.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <Label htmlFor="profileImage">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        이미지 업로드
                      </span>
                    </Button>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG 또는 WEBP 파일 (최대 5MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름 (한글) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">이름 (영문)</Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">소개 (한글) *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bioEn">소개 (영문)</Label>
                    <Textarea
                      id="bioEn"
                      value={formData.bioEn}
                      onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthYear">출생연도</Label>
                    <Input
                      id="birthYear"
                      type="number"
                      value={formData.birthYear || ''}
                      onChange={(e) => setFormData({ ...formData, birthYear: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsActive">활동 연수</Label>
                    <Input
                      id="yearsActive"
                      type="number"
                      value={formData.yearsActive || ''}
                      onChange={(e) => setFormData({ ...formData, yearsActive: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">지역</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="예: 서울"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">전문 분야</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization.join(', ')}
                    onChange={(e) => handleSpecializationChange(e.target.value)}
                    placeholder="쉼표로 구분하여 입력 (예: 서예, 전통회화)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">연락처</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">소셜 미디어</CardTitle>
                <CardDescription>
                  SNS 및 웹사이트 링크를 추가하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      웹사이트
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.socialLinks?.website || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, website: e.target.value }
                      })}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={formData.socialLinks?.facebook || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">공개 설정</CardTitle>
                <CardDescription>
                  프로필과 포트폴리오의 공개 여부를 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>프로필 공개</Label>
                    <p className="text-sm text-muted-foreground">
                      공개 시 누구나 포트폴리오를 볼 수 있습니다
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-celadon-green hover:bg-celadon-green/90 text-ink-black"
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '저장 중...' : '프로필 저장'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
