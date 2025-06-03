"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  MessageCircle, 
  MapPin, 
  Bell, 
  User, 
  Share, 
  Navigation,
  Calendar,
  Trophy,
  Palette
} from "lucide-react"

// 카카오 컴포넌트들 import
import { KakaoShareButton, ArtistShareButton, ContestShareButton, ExhibitionShareButton } from "@/components/kakao/kakao-share-button"
import { KakaoLoginButton, useKakaoAuth } from "@/components/kakao/kakao-login-button"
import { KakaoMap, ExhibitionMap } from "@/components/kakao/kakao-map"
import { 
  sendContestDeadlineAlert, 
  sendExhibitionAlert, 
  sendArtistAlert,
  kakaoNotificationService 
} from "@/lib/kakao-notifications"

export default function KakaoDemoPage() {
  const [notificationTest, setNotificationTest] = useState({
    userIds: ['test_user_1', 'test_user_2'],
    contestName: '제33회 동양서예협회 정기공모전',
    daysLeft: 3
  })
  const [searchLocation, setSearchLocation] = useState("세종문화회관")
  
  const { userInfo, isLoggedIn, login, logout } = useKakaoAuth()

  const handleNotificationTest = async (type: 'contest' | 'exhibition' | 'artist') => {
    try {
      switch (type) {
        case 'contest':
          await sendContestDeadlineAlert(
            notificationTest.userIds,
            notificationTest.contestName,
            notificationTest.daysLeft,
            '/contests/demo'
          )
          break
        case 'exhibition':
          await sendExhibitionAlert(
            notificationTest.userIds,
            '2024 신진작가 초대전',
            '2024년 3월 15일',
            '세종문화회관',
            '/exhibitions/demo'
          )
          break
        case 'artist':
          await sendArtistAlert(
            notificationTest.userIds,
            '김서예',
            'new_artwork',
            '새로운 작품 "봄의 향기"가 업로드되었습니다.',
            '/artists/demo'
          )
          break
      }
    } catch (error) {
      console.error('Notification test failed:', error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            카카오 API 통합 데모
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            ASCA 플랫폼에 통합된 카카오 API 기능들을 체험해보세요
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <MessageCircle className="w-3 h-3 mr-1" />
              카카오톡 공유
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
              <User className="w-3 h-3 mr-1" />
              카카오 로그인
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
              <MapPin className="w-3 h-3 mr-1" />
              카카오맵
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
              <Bell className="w-3 h-3 mr-1" />
              푸시 알림
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              공유하기
            </TabsTrigger>
            <TabsTrigger value="login" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              로그인
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              지도
            </TabsTrigger>
            <TabsTrigger value="notification" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              알림
            </TabsTrigger>
          </TabsList>

          {/* 카카오톡 공유 탭 */}
          <TabsContent value="share" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-yellow-500" />
                  카카오톡 공유하기
                </CardTitle>
                <CardDescription>
                  다양한 콘텐츠를 카카오톡으로 쉽게 공유할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 작가 공유 예제 */}
                  <Card className="border-2 border-dashed border-muted">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        작가 프로필 공유
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-celadon to-sage rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">김서예 작가</h4>
                            <p className="text-sm text-muted-foreground">전통서예, 현대서예</p>
                          </div>
                        </div>
                        <ArtistShareButton
                          title="김서예 작가"
                          description="전통서예와 현대서예를 아우르는 동양서예협회의 대표 작가입니다."
                          imageUrl="/placeholder-profile.jpg"
                          webUrl="/artists/demo"
                          variant="default"
                          className="w-full"
                          onShareSuccess={() => console.log('Artist shared successfully')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 공모전 공유 예제 */}
                  <Card className="border-2 border-dashed border-muted">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        공모전 공유
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <h4 className="font-medium">제33회 정기공모전</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>마감: 2024년 4월 30일</span>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            3일 남음
                          </Badge>
                        </div>
                        <ContestShareButton
                          title="제33회 동양서예협회 정기공모전"
                          description="전통과 현대가 만나는 서예의 향연! 지금 바로 참가하세요."
                          imageUrl="/placeholder-contest.jpg"
                          webUrl="/contests/demo"
                          variant="default"
                          className="w-full"
                          onShareSuccess={() => console.log('Contest shared successfully')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 전시회 공유 예제 */}
                  <Card className="border-2 border-dashed border-muted">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        전시회 공유
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <h4 className="font-medium">2024 신진작가 초대전</h4>
                          <div className="text-sm text-muted-foreground">
                            <p>일시: 2024년 3월 15일 - 4월 15일</p>
                            <p>장소: 세종문화회관</p>
                          </div>
                        </div>
                        <ExhibitionShareButton
                          title="2024 신진작가 초대전"
                          description="젊은 서예가들의 현대적 해석을 만나보세요."
                          imageUrl="/placeholder-exhibition.jpg"
                          webUrl="/exhibitions/demo"
                          variant="default"
                          className="w-full"
                          onShareSuccess={() => console.log('Exhibition shared successfully')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 일반 공유 예제 */}
                  <Card className="border-2 border-dashed border-muted">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        일반 콘텐츠 공유
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <h4 className="font-medium">ASCA 동양서예협회</h4>
                          <p className="text-sm text-muted-foreground">
                            전통 서예의 아름다움을 현대에 전하는 문화 예술 단체
                          </p>
                        </div>
                        <KakaoShareButton
                          title="ASCA 동양서예협회"
                          description="전통과 현대가 조화를 이루는 서예 예술의 세계로 초대합니다."
                          imageUrl="/og-image.jpg"
                          webUrl="/"
                          variant="default"
                          className="w-full"
                          onShareSuccess={() => console.log('ASCA shared successfully')}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 카카오 로그인 탭 */}
          <TabsContent value="login" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-500" />
                  카카오 로그인
                </CardTitle>
                <CardDescription>
                  카카오 계정으로 간편하게 로그인하거나 사용자 정보를 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">기본 로그인 버튼</h3>
                    <KakaoLoginButton
                      variant="outline"
                      size="lg"
                      onLoginSuccess={(userInfo) => {
                        console.log('Login success:', userInfo)
                      }}
                      onLogout={() => {
                        console.log('Logout success')
                      }}
                    />
                    
                    <Separator />
                    
                    <h3 className="font-medium">사용자 정보 표시</h3>
                    <KakaoLoginButton
                      variant="outline"
                      size="md"
                      showUserInfo={true}
                      onLoginSuccess={(userInfo) => {
                        console.log('Login with user info:', userInfo)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">로그인 상태 정보</h3>
                    <Card className="p-4 bg-muted/30">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">로그인 상태:</span>
                          <Badge variant={isLoggedIn ? "default" : "secondary"}>
                            {isLoggedIn ? "로그인됨" : "로그아웃됨"}
                          </Badge>
                        </div>
                        {userInfo && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">닉네임:</span>
                              <span className="text-sm">{userInfo.properties?.nickname || '없음'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">이메일:</span>
                              <span className="text-sm">{userInfo.kakao_account?.email || '없음'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">카카오 ID:</span>
                              <span className="text-sm font-mono">{userInfo.id}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 카카오맵 탭 */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  카카오맵
                </CardTitle>
                <CardDescription>
                  전시회 장소나 갤러리 위치를 카카오맵으로 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="location-search">장소 검색</Label>
                      <Input
                        id="location-search"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="검색할 장소를 입력하세요"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        // 지도 컴포넌트에서 자동으로 검색됨
                      }}
                      className="mt-6"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      검색
                    </Button>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">일반 지도</h3>
                      <KakaoMap
                        searchQuery={searchLocation}
                        height={300}
                        onMarkerClick={(marker) => {
                          console.log('Marker clicked:', marker)
                        }}
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">전시회 장소 지도</h3>
                      <ExhibitionMap
                        exhibition={{
                          name: "2024 신진작가 초대전",
                          location: "세종문화회관",
                          address: "서울 종로구 세종대로 175"
                        }}
                        height={300}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 푸시 알림 탭 */}
          <TabsContent value="notification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-500" />
                  카카오 푸시 알림
                </CardTitle>
                <CardDescription>
                  공모전 마감 알림, 전시회 소식 등을 카카오톡으로 받아보세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      공모전 알림
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      공모전 마감 임박 알림을 테스트합니다.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleNotificationTest('contest')}
                    >
                      테스트 발송
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      전시회 알림
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      새로운 전시회 오픈 알림을 테스트합니다.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleNotificationTest('exhibition')}
                    >
                      테스트 발송
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      작가 알림
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      작가 업데이트 알림을 테스트합니다.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleNotificationTest('artist')}
                    >
                      테스트 발송
                    </Button>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">알림 설정 테스트</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>사용자 ID (테스트용)</Label>
                      <Input
                        value={notificationTest.userIds.join(', ')}
                        onChange={(e) => setNotificationTest(prev => ({
                          ...prev,
                          userIds: e.target.value.split(', ').map(id => id.trim())
                        }))}
                        placeholder="user1, user2, user3"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>공모전명</Label>
                      <Input
                        value={notificationTest.contestName}
                        onChange={(e) => setNotificationTest(prev => ({
                          ...prev,
                          contestName: e.target.value
                        }))}
                        placeholder="공모전명을 입력하세요"
                      />
                    </div>
                  </div>
                </div>

                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium mb-2">📝 알림 기능 설명</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 공모전 마감 3일 전, 1일 전, 당일 자동 알림</li>
                    <li>• 새로운 전시회 오픈 알림</li>
                    <li>• 관심 작가의 새 작품 업로드 알림</li>
                    <li>• 협회 공지사항 및 일반 소식 알림</li>
                  </ul>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 추가 정보 섹션 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 구현 완료된 카카오 API 기능들</CardTitle>
            <CardDescription>
              ASCA 플랫폼에 성공적으로 통합된 카카오 API 기능들의 목록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-yellow-600">✅ 구현 완료</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-yellow-500" />
                    <span>카카오톡 공유 API (작가, 공모전, 전시회, 일반)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>카카오 로그인 API (OAuth 2.0)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span>카카오맵 API (장소 검색, 지도 표시)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-500" />
                    <span>카카오 푸시 알림 API (REST 기반)</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-blue-600">🎯 활용 시나리오</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 작가 프로필을 SNS로 공유하여 홍보 효과 증대</li>
                  <li>• 공모전 정보를 빠르게 전파하여 참가자 모집</li>
                  <li>• 전시회 위치를 쉽게 찾을 수 있도록 지도 제공</li>
                  <li>• 마감 임박 알림으로 참가 기회 놓치지 않도록 지원</li>
                  <li>• 카카오 계정으로 간편 회원가입 및 로그인</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  )
} 