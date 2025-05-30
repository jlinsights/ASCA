'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollText, Scale, Shield, User, FileText, AlertCircle } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ScrollText className="h-8 w-8 md:h-10 md:w-10 text-scholar-red" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              이용약관
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            사단법인 동양서예협회 웹사이트 이용약관
          </p>
          <Badge variant="outline" className="text-sm">
            시행일: 2019년 1월 1일
          </Badge>
        </div>
      </section>

      {/* Terms Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 목적 */}
          <Card className="border-l-4 border-l-scholar-red">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-scholar-red" />
                <h2 className="text-xl md:text-2xl font-bold">제1조 목적</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 인터넷 사단법인 동양서예협회 (www.orientalcalligraphy.org) 이용자 약관(이하 "본 약관")은 이용자가 사단법인 동양서예협회에서 제공하는 인터넷 관련 서비스(이하 "서비스")를 이용함에 있어 이용자와 동양서예협회의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
                <p>
                  ② 이용자가 되고자 하는 자가 동양서예협회가 정한 소정의 절차를 거쳐서 "동의" 단추를 누르면 본 약관에 동의하는 것으로 간주합니다.
                </p>
                <p>
                  본 약관에 정하는 이외의 이용자와 동양서예협회의 권리, 의무 및 책임사항에 관해서는 전기통신사업법 기타 대한민국의 관련 법령과 상관습에 의합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 이용자의 정의 */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl md:text-2xl font-bold">제2조 이용자의 정의</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                "이용자"란 동양서예협회에 접속하여 본 약관에 따라 홈페이지에 동양서예협회 회원(이하 "협회원")으로 가입하여 동양서예협회가 제공하는 서비스를 받는 자를 말합니다.
              </p>
            </CardContent>
          </Card>

          {/* 회원 가입 */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-emerald-500" />
                <h2 className="text-xl md:text-2xl font-bold">제3조 회원 가입</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 이용자가 되고자 하는 자는 동양서예협회가 정한 가입 양식에 따라 회원정보를 기입하고 "가입하기" 단추를 누르는 방법으로 회원 가입을 신청합니다.
                </p>
                <p>
                  ② 동양서예협회는 제1항과 같이 회원으로 가입할 것을 신청한 자가 다음 각 호에 해당하지 않는 한 신청한 자를 회원으로 등록합니다.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p>1. 가입신청자가 본 약관 제7조 제3항에 의하여 이전에 회원자격을 상실한 적이 있는 경우. 다만 제7조 제3항에 의한 회원자격 상실 후 1개월이 경과한 자로서 서협의 회원재가입 승낙을 얻은 경우에는 예외로 합니다.</p>
                  <p>2. 등록 내용에 허위, 기재누락, 오기, 상업성이 있는 경우</p>
                  <p>3. 기타 회원으로 등록하는 것이 서협의 기술상 현저히 지장이 있다고 판단되는 경우</p>
                </div>
                <p>
                  ③ 회원가입계약의 성립시기는 서협이 회원가입의 여부를 신청절차 상에서 표시한 시점으로 합니다.
                </p>
                <p>
                  ④ 회원은 제15조 제1항에 의한 정보의 변경이 있는 경우, 즉시 이를 수정하여 기타 회원정보 변경으로 인한 불이익은 회원이 책임집니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 서비스의 제공 및 변경 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제4조 서비스의 제공 및 변경</h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 동양서예협회는 다음과 같은 업무를 수행합니다.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p>1. 회원정보 관리업무</p>
                  <p>2. 회원제 서비스 제공업무</p>
                  <p>3. 기타 동양서예협회가 정하는 업무</p>
                </div>
                <p>
                  ② 동양서예협회는 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 재화 또는 용역의 내용을 변경할 수 있습니다. 이 경우에는 변경된 재화 또는 용역의 내용 및 제공일자를 명시하여 현재의 재화 또는 용역의 내용을 게시한 곳에 즉시 공지합니다.
                </p>
                <p>
                  ③ 동양서예협회가 제공하기로 이용자와 계약을 체결한 서비스의 내용을 재화등의 품절 또는 기술적 사양의 변경 등의 사유로 변경할 경우에는 그 사유를 이용자에게 통지 가능한 주소로 즉시 통지합니다.
                </p>
                <p>
                  ④ 전항의 경우 동양서예협회는 이로 인하여 이용자가 입은 손해를 배상합니다. 다만, 동양서예협회가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 서비스의 중단 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제5조 서비스의 중단</h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 동양서예협회는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
                </p>
                <p>
                  ② 동양서예협회는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 동양서예협회가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
                </p>
                <p>
                  ③ 사업종목의 전환, 사업의 포기, 업체간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 동양서예협회는 제8조에 정한 방법으로 이용자에게 통지하고 당초 동양서예협회에서 제시한 조건에 따라 소비자에게 보상합니다. 다만, 동양서예협회가 보상기준 등을 고지하지 아니한 경우에는 이용자들의 마일리지 또는 적립금 등을 동양서예협회에서 통용되는 통화가치에 상응하는 현물 또는 현금으로 이용자에게 지급합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* 이용자의 의무 */}
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl md:text-2xl font-bold">제12조 이용자의 의무</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 이용자는 다음 행위를 하여서는 안됩니다.
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg space-y-2 border border-amber-200 dark:border-amber-800">
                  <p>1. 신청 또는 변경시 허위내용의 등록</p>
                  <p>2. 타인의 정보 도용</p>
                  <p>3. 동양서예협회에 게시된 정보의 변경</p>
                  <p>4. 동양서예협회가 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는 게시</p>
                  <p>5. 동양서예협회 기타 제3자의 저작권 등 지적재산권에 대한 침해</p>
                  <p>6. 동양서예협회 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</p>
                  <p>7. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 동양서예협회에 공개 또는 게시하는 행위</p>
                  <p>8. 회원을 스토킹, 협박 등 다른 이용자를 괴롭히는 행위</p>
                  <p>9. 다른 이용자에 대한 개인정보를 그 동의 없이 수집,저장,공개하는 행위</p>
                  <p>10. 불특정 다수의 자를 대상으로 하여 광고 또는 선전을 게시하거나 스팸메일을 전송하는 등의 방법으로 동양서예협회의 서비스를 이용하여 영리 목적의 활동을 하는 행위</p>
                  <p>11. 동양서예협회가 제공하는 서비스에 정한 약관 기타 서비스 이용에 관한 규정을 위반하는 행위</p>
                </div>
                <p>
                  ② 제1항에 해당하는 행위를 한 이용자가 있을 경우 동양서예협회는 본 약관 제7조 제2, 3항에서 정한 바에 따라 이용자의 회원자격을 적절한 방법으로 제한 및 정지, 상실시킬 수 있습니다.
                </p>
                <p>
                  ③ 이용자는 그 귀책사유로 인하여 동양서예협회나 다른 이용자가 입은 손해를 배상할 책임이 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 저작권의 귀속 및 이용제한 */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl md:text-2xl font-bold">제14조 저작권의 귀속 및 이용제한</h2>
              </div>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 동양서예협회가 작성한 저작물에 대한 저작권 기타 지적재산권은 동양서예협회에 귀속합니다.
                </p>
                <p>
                  ② 이용자는 동양서예협회를 이용함으로써 얻은 정보를 동양서예협회의 사전승낙 없이 복제, 전송, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 약관의 개정 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제15조 약관의 개정</h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  ① 동양서예협회는 약관의 규제등에 관한 법률, 전자거래기본법, 전자서명법, 정보통신망이용촉진등에 관한 법률 등 관련 법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
                </p>
                <p>
                  ② 동양서예협회가 본 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
                </p>
                <p>
                  ③ 동양서예협회가 본 약관을 개정할 경우에는 그 개정약관은 개정된 내용이 관계 법령에 위배되지 않는 한 개정 이전에 회원으로 가입한 이용자에게도 적용됩니다.
                </p>
                <p>
                  ④ 변경된 약관에 이의가 있는 이용자는 제7조 제1항에 따라 탈퇴할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 재판관할 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">제16조 재판관할</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                동양서예협회와 이용자간에 발생한 서비스 이용에 관한 분쟁으로 인한 소는 민사소송법상의 관할을 가지는 대한민국의 법원에 제기합니다.
              </p>
            </CardContent>
          </Card>

          {/* 부칙 */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">부칙</h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                이 약관은 2019년 1월 1일부터 시행합니다.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-scholar-red/5 to-scholar-red/10 border-scholar-red/20">
            <CardContent className="p-6 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-bold mb-4">문의사항</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                이용약관에 대해 궁금한 사항이 있으시면 언제든지 문의해 주세요.
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