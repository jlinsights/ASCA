import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드",
  description: "FamilyOffice S 개인 대시보드",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  
  // 로그인하지 않은 사용자는 홈으로 리디렉션
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen font-body text-navy-primary dark:text-white">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* 대시보드 헤더 */}
          <section className="py-12 md:py-16">
            <div className="glass-card p-6 md:p-8 mb-8">
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                안녕하세요, {user?.firstName || user?.emailAddresses[0]?.emailAddress}님! 👋
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                FamilyOffice S 개인 대시보드에 오신 것을 환영합니다.
              </p>
            </div>

            {/* 대시보드 메뉴 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 자산 현황 */}
              <div className="glass-card p-6 hover:scale-105 transition-fo">
                <div className="text-2xl mb-4">📊</div>
                <h3 className="font-heading text-xl font-semibold mb-2">자산 현황</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  포트폴리오 현황과 자산 분석 리포트를 확인하세요.
                </p>
              </div>

              {/* 상담 이력 */}
              <div className="glass-card p-6 hover:scale-105 transition-fo">
                <div className="text-2xl mb-4">💬</div>
                <h3 className="font-heading text-xl font-semibold mb-2">상담 이력</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  과거 상담 이력과 전문가 추천사항을 검토하세요.
                </p>
              </div>

              {/* 문서 관리 */}
              <div className="glass-card p-6 hover:scale-105 transition-fo">
                <div className="text-2xl mb-4">📋</div>
                <h3 className="font-heading text-xl font-semibold mb-2">문서 관리</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  계약서, 보고서 등 중요 문서를 안전하게 관리하세요.
                </p>
              </div>

              {/* 일정 관리 */}
              <div className="glass-card p-6 hover:scale-105 transition-fo">
                <div className="text-2xl mb-4">📅</div>
                <h3 className="font-heading text-xl font-semibold mb-2">일정 관리</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  상담 일정과 중요 미팅을 관리하세요.
                </p>
              </div>

              {/* 알림 센터 */}
              <div className="glass-card p-6 hover:scale-105 transition-fo">
                <div className="text-2xl mb-4">🔔</div>
                <h3 className="font-heading text-xl font-semibold mb-2">알림 센터</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  시장 동향, 세법 변화 등 중요 알림을 확인하세요.
                </p>
              </div>

              {/* 설정 */}
              <div className="glass-card p-6 hover:scale-105 transition-fo">
                <div className="text-2xl mb-4">⚙️</div>
                <h3 className="font-heading text-xl font-semibold mb-2">계정 설정</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  개인 정보와 알림 설정을 관리하세요.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
} 