import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function ConsultationsPage() {
  const supabase = createClient()
  const { data: consultations, error } = await supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching consultations:", error)
  }

  return (
    <div className="min-h-screen font-body text-navy-primary dark:text-white">
      <Header />

      <section className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="container mx-auto px-6">
          <h1 className="font-heading text-3xl font-bold mb-10">상담 신청 목록</h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
              데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          )}

          <div className="bg-white dark:bg-dark-bg-secondary rounded-md shadow-medium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-light-bg-secondary dark:bg-dark-bg-tertiary">
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      신청일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      관심 서비스
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {consultations && consultations.length > 0 ? (
                    consultations.map((consultation) => (
                      <tr key={consultation.id} className="hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(consultation.created_at).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{consultation.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{consultation.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{consultation.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getServiceName(consultation.service_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(consultation.status)}`}>
                            {getStatusName(consultation.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm text-light-text-tertiary dark:text-dark-text-tertiary"
                      >
                        상담 신청 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function getServiceName(serviceType: string | null): string {
  if (!serviceType) return "미지정"

  const serviceMap: Record<string, string> = {
    "wealth-management": "통합 자산관리",
    inheritance: "상속·증여 설계",
    "tax-legal": "세무·법률 자문",
    "real-estate": "부동산 포트폴리오",
    "business-succession": "가업승계",
    "global-assets": "해외 자산 관리",
  }

  return serviceMap[serviceType] || serviceType
}

function getStatusName(status: string | null): string {
  if (!status) return "미지정"

  const statusMap: Record<string, string> = {
    pending: "대기중",
    contacted: "연락완료",
    completed: "상담완료",
  }

  return statusMap[status] || status
}

function getStatusClass(status: string | null): string {
  if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"

  const statusClassMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    contacted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  }

  return statusClassMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
}
