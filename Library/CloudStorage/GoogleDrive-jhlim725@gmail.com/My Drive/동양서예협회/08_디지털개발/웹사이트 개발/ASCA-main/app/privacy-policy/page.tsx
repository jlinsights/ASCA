'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Eye, User, FileText, AlertTriangle, Database, Settings } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              개인정보처리방침
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            사단법인 동양서예협회 개인정보처리방침
          </p>
          <Badge variant="outline" className="text-sm">
            시행일: 2024년 1월 1일
          </Badge>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 목적 */}
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl md:text-2xl font-bold">제1조 목적</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                사단법인 동양서예협회(이하 '회사'라고 함)는 회사가 제공하고자 하는 서비스(이하 '회사 서비스')를 이용하는 개인(이하 '이용자' 또는 '개인')의 정보(이하 '개인정보')를 보호하기 위해, 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 '정보통신망법') 등 관련 법령을 준수하고, 서비스 이용자의 개인정보 보호 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침(이하 '본 방침')을 수립합니다.
              </p>
            </CardContent>
          </Card>

          {/* 개인정보 처리의 원칙 */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-5 w-5 text-emerald-500" />
                <h2 className="text-xl md:text-2xl font-bold">제2조 개인정보 처리의 원칙</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                개인정보 관련 법령 및 본 방침에 따라 회사는 이용자의 개인정보를 수집할 수 있으며 수집된 개인정보는 개인의 동의가 있는 경우에 한해 제3자에게 제공될 수 있습니다. 단, 법령의 규정 등에 의해 적법하게 강제되는 경우 회사는 수집한 이용자의 개인정보를 사전에 개인의 동의 없이 제3자에게 제공할 수도 있습니다.
              </p>
            </CardContent>
          </Card>

          {/* 본 방침의 공개 */}
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl md:text-2xl font-bold">제3조 본 방침의 공개</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 회사는 이용자가 언제든지 쉽게 본 방침을 확인할 수 있도록 회사 홈페이지 첫 화면 또는 첫 화면과의 연결화면을 통해 본 방침을 공개하고 있습니다.
                </p>
                <p>
                  ② 회사는 제1항에 따라 본 방침을 공개하는 경우 글자 크기, 색상 등을 활용하여 이용자가 본 방침을 쉽게 확인할 수 있도록 합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 개인정보의 수집 및 처리 목적 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl md:text-2xl font-bold">제5조 개인정보의 수집 및 처리 목적</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg space-y-2 border border-purple-200 dark:border-purple-800">
                  <p>1. 홈페이지 회원 가입 및 관리</p>
                  <p>2. 재화 또는 서비스 제공</p>
                  <p>3. 마케팅 및 광고에의 활용</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 수집하는 개인정보 항목 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제6조 수집하는 개인정보 항목</h2>
              <div className="space-y-6 text-sm md:text-base text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">① 회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</h3>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p><strong>회원가입시:</strong> 필수항목 - 아이디, 비밀번호, 이름, 생년월일, 성별, 전화번호, 휴대전화번호, 이메일, 주소</p>
                    <p><strong>선택항목:</strong> 직업, 취미, 기타 등</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">② 서비스 이용과정이나 사업처리 과정에서 아래와 같은 정보들이 생성되어 수집될 수 있습니다.</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p>서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보, 결제기록</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인정보의 처리 및 보유기간 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제7조 개인정보의 처리 및 보유기간</h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 회사는 법령에 따른 개인정보 보유, 이용 기간 또는 정보주체로부터 개인정보를 수집시에 동의 받은 개인정보 보유, 이용 기간 내에서 개인정보를 처리, 보유합니다.
                </p>
                <p>
                  ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>홈페이지 회원가입 및 관리:</strong> 사업자/단체 홈페이지 탈퇴시까지</p>
                  <p><strong>재화 또는 서비스 제공:</strong> 재화·서비스 공급완료 및 요금결제·정산 완료시까지</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인정보의 제3자 제공 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제8조 개인정보의 제3자 제공</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                ① 회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
            </CardContent>
          </Card>

          {/* 정보주체의 권리·의무 및 행사방법 */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-green-500" />
                <h2 className="text-xl md:text-2xl font-bold">제10조 정보주체의 권리·의무 및 행사방법</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg space-y-2 border border-green-200 dark:border-green-800">
                  <p>1. 개인정보 처리현황 통지요구</p>
                  <p>2. 개인정보 열람요구</p>
                  <p>3. 오류 등이 있을 경우 정정·삭제요구</p>
                  <p>4. 처리정지요구</p>
                </div>
                <p>② 제1항에 따른 권리 행사는 회사에 대해 개인정보보호법 시행규칙 별지 제8호 서식에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.</p>
              </div>
            </CardContent>
          </Card>

          {/* 개인정보의 파기절차 및 파기방법 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제11조 개인정보의 파기절차 및 파기방법</h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">파기절차</h3>
                    <p>이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">파기방법</h3>
                    <p>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인정보의 안전성 확보조치 */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-red-500" />
                <h2 className="text-xl md:text-2xl font-bold">제12조 개인정보의 안전성 확보조치</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold text-foreground mb-2">기술적 조치</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• 개인정보처리시스템 등의 접근권한 관리</li>
                      <li>• 접근통제시스템 설치</li>
                      <li>• 개인정보의 암호화</li>
                      <li>• 보안프로그램 설치 및 갱신</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold text-foreground mb-2">관리적 조치</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• 개인정보 취급직원의 최소화 및 교육</li>
                      <li>• 정기적 자체 감사 실시</li>
                      <li>• 내부관리계획의 수립 및 시행</li>
                      <li>• 개인정보 취급직원에 대한 접근 권한 제한</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 쿠키에 관한 사항 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl md:text-2xl font-bold">제13조 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>① 회사는 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</p>
                <p>② 쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터내의 하드디스크에 저장되기도 합니다.</p>
                <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="font-semibold text-foreground mb-2">쿠키 설정 거부 방법</h3>
                  <div className="space-y-2 text-sm">
                    <p>1. <strong>Edge:</strong> 웹브라우저 우측 상단의 설정 메뉴 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리 및 삭제</p>
                    <p>2. <strong>Chrome:</strong> 웹브라우저 우측 상단의 설정 메뉴 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</p>
                    <p>3. <strong>Whale:</strong> 웹브라우저 우측 상단의 설정 메뉴 &gt; 개인정보 보호 &gt; 쿠키 및 기타 사이트 데이터</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* 개인정보 보호 책임자 */}
          <Card className="border-l-4 border-l-scholar-red">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-scholar-red" />
                <h2 className="text-xl md:text-2xl font-bold">제36조 개인정보 보호 책임자 지정</h2>
              </div>
              <div className="space-y-6 text-sm md:text-base text-muted-foreground">
                <p>① 회사는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보 보호 책임자를 지정하고 있습니다.</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-scholar-red/5 p-4 rounded-lg border border-scholar-red/20">
                    <h3 className="font-semibold text-foreground mb-3">개인정보 보호 책임자</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>성명:</strong> 임재홍</p>
                      <p><strong>직책:</strong> 이사장</p>
                      <p><strong>전화번호:</strong> 02-928-1117</p>
                      <p><strong>이메일:</strong> ceo@orientalcalligraphy.org</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-3">개인정보 보호 담당자</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>담당부서:</strong> 사무국장</p>
                      <p><strong>전화번호:</strong> 02-928-1117</p>
                      <p><strong>이메일:</strong> info@orientalcalligraphy.org</p>
                    </div>
                  </div>
                </div>

                <p>② 회사는 개인정보의 보호를 위해 개인정보보호 전담부서를 운영하고 있으며, 개인정보처리방침의 이행사항 및 담당자의 준수여부를 확인하여 문제가 발견될 경우 즉시 해결하고 바로 잡을 수 있도록 최선을 다하고 있습니다.</p>
              </div>
            </CardContent>
          </Card>

          {/* 권익침해에 대한 구제방법 */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl md:text-2xl font-bold">제37조 권익침해에 대한 구제방법</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>① 정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
                
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-foreground mb-3">관련 기관 연락처</h3>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>개인정보분쟁조정위원회:</strong> (국번없이) 1833-6972 (www.kopico.go.kr)</p>
                    <p>• <strong>개인정보침해신고센터:</strong> (국번없이) 118 (privacy.kisa.or.kr)</p>
                    <p>• <strong>대검찰청:</strong> (국번없이) 1301 (www.spo.go.kr)</p>
                    <p>• <strong>경찰청:</strong> (국번없이) 182 (ecrm.cyber.go.kr)</p>
                    <p>• <strong>중앙행정심판위원회:</strong> (국번없이) 110 (www.simpan.go.kr)</p>
                  </div>
                </div>

                <p>② 회사는 정보주체의 개인정보자기결정권을 보장하고, 개인정보침해로 인한 상담 및 피해 구제를 위해 노력하고 있으며, 신고나 상담이 필요한 경우 제1항의 담당부서로 연락해주시기 바랍니다.</p>
              </div>
            </CardContent>
          </Card>

          {/* 부칙 */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">부칙</h2>
              <div className="space-y-2 text-sm md:text-base text-muted-foreground">
                <p><strong>제1조</strong> 본 방침은 2024.01.01.부터 시행됩니다.</p>
                <p><strong>제2조</strong> 개정 전 개인정보처리방침은 공지사항을 통하여 확인할 수 있습니다.</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-blue-600/5 to-blue-600/10 border-blue-600/20">
            <CardContent className="p-6 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-bold mb-4">개인정보 관련 문의사항</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                개인정보처리방침에 대해 궁금한 사항이나 개인정보 관련 문의가 있으시면 언제든지 연락해 주세요.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📧 info@orientalcalligraphy.org</p>
                <p>📞 0502-5550-8700</p>
                <p>📍 서울시 성북구 보문로 57-1 중앙빌딩 6층</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <Footer />
    </div>
  )
} 