import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ArtistPreviewProps {
  formData: {
    name: string
    name_en: string
    name_ja: string
    name_zh: string
    bio: string
    bio_en: string
    bio_ja: string
    bio_zh: string
    birth_year: string
    nationality: string
    profile_image: string
    membership_type: string
    artist_type: string
    title: string | null
  }
  skills: string[]
  awards: string[]
  exhibitions: string[]
}

export function ArtistPreview({ formData, skills, awards, exhibitions }: ArtistPreviewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 섹션 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32">
                <AvatarImage src={formData.profile_image} alt={formData.name} />
                <AvatarFallback className="text-2xl">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 기본 정보 */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{formData.name}</h1>
                {formData.name_en && (
                  <p className="text-lg text-gray-600 mt-1">{formData.name_en}</p>
                )}
                {formData.name_ja && (
                  <p className="text-sm text-gray-500">{formData.name_ja}</p>
                )}
                {formData.name_zh && (
                  <p className="text-sm text-gray-500">{formData.name_zh}</p>
                )}
              </div>

              {/* 배지들 */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {formData.membership_type}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  {formData.artist_type}
                </Badge>
                {formData.title && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    {formData.title}
                  </Badge>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {formData.birth_year && (
                  <div>
                    <span className="font-medium text-gray-700">출생년도:</span>
                    <span className="ml-2 text-gray-600">{formData.birth_year}년</span>
                  </div>
                )}
                {formData.nationality && (
                  <div>
                    <span className="font-medium text-gray-700">국적:</span>
                    <span className="ml-2 text-gray-600">{formData.nationality}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 소개 */}
      {formData.bio && (
        <Card>
          <CardHeader>
            <CardTitle>작가 소개</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">한국어</h4>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{formData.bio}</p>
              </div>
              {formData.bio_en && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">English</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{formData.bio_en}</p>
                </div>
              )}
              {formData.bio_ja && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">日本語</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{formData.bio_ja}</p>
                </div>
              )}
              {formData.bio_zh && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">中文</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{formData.bio_zh}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 전문 분야 */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>전문 분야</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 수상 경력 */}
      {awards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>수상 경력</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {awards.map((award, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{award}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 전시 경력 */}
      {exhibitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>전시 경력</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exhibitions.map((exhibition, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{exhibition}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 