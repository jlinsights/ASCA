"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"

export default function RegulationsPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              {t("regulations")}
            </h1>
            <p className="text-lg text-muted-foreground">
              사단법인 동양서예협회 운영 규정
            </p>
          </div>

          <div className="space-y-8">
            {/* 제1장 총칙 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">제1장 총칙</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제1조 (목적)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    이 규정은 사단법인 동양서예협회(이하 "협회"라 한다)의 운영에 관한 기본사항을 정함으로써 
                    협회의 목적사업을 효율적으로 수행하고 건전한 발전을 도모함을 목적으로 한다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제2조 (적용범위)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    이 규정은 협회의 모든 임원 및 회원에게 적용된다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제3조 (용어의 정의)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    이 규정에서 사용하는 용어의 정의는 다음과 같다:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>"임원"이라 함은 이사장, 부이사장, 상임이사, 이사, 감사를 말한다.</li>
                    <li>"회원"이라 함은 정회원, 준회원, 명예회원을 말한다.</li>
                    <li>"사업"이라 함은 정관에 명시된 목적사업을 말한다.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 제2장 조직 및 운영 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">제2장 조직 및 운영</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제4조 (조직구성)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    협회는 다음과 같이 조직한다:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>이사회</li>
                    <li>운영위원회</li>
                    <li>심사위원회</li>
                    <li>사무국</li>
                    <li>지부</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제5조 (이사회)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    이사회는 협회의 최고 의결기관으로서 중요사항을 심의·의결한다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제6조 (운영위원회)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    운영위원회는 협회의 일상적인 운영사항을 처리한다.
                  </p>
                </div>
              </div>
            </div>

            {/* 제3장 회원 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">제3장 회원</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제7조 (회원의 자격)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    협회의 목적에 찬동하고 소정의 절차를 거쳐 가입한 개인 또는 단체는 회원이 될 수 있다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제8조 (회원의 권리와 의무)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    회원은 협회의 모든 활동에 참여할 권리를 가지며, 협회의 발전을 위해 노력할 의무를 진다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제9조 (회비)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    회원은 이사회에서 정한 회비를 납부하여야 한다.
                  </p>
                </div>
              </div>
            </div>

            {/* 제4장 사업 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">제4장 사업</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제10조 (사업의 종류)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    협회는 다음의 사업을 수행한다:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>서예 전시회 개최</li>
                    <li>서예 교육 및 연구</li>
                    <li>서예 문화 보급 및 홍보</li>
                    <li>국내외 서예 단체와의 교류</li>
                    <li>서예 관련 출판사업</li>
                    <li>기타 협회 목적 달성에 필요한 사업</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제11조 (사업계획)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    협회는 매년 사업계획을 수립하여 이사회의 승인을 받아 시행한다.
                  </p>
                </div>
              </div>
            </div>

            {/* 제5장 재정 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">제5장 재정</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제12조 (재정)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    협회의 재정은 회비, 기부금, 사업수익금, 기타 수입으로 충당한다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제13조 (회계연도)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    협회의 회계연도는 매년 1월 1일부터 12월 31일까지로 한다.
                  </p>
                </div>
              </div>
            </div>

            {/* 제6장 보칙 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">제6장 보칙</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제14조 (규정의 개정)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    이 규정의 개정은 이사회의 의결을 거쳐 시행한다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">제15조 (시행일)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    이 규정은 2023년 1월 1일부터 시행한다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 문의 정보 */}
          <div className="mt-12 text-center">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2 text-foreground">규정 관련 문의</h3>
              <p className="text-muted-foreground">
                규정에 대한 문의사항이 있으시면 협회 사무국으로 연락해 주시기 바랍니다.
              </p>
              <p className="text-muted-foreground mt-2">
                전화: 02-1234-5678 | 이메일: info@asca.or.kr
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 