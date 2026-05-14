// 1시간 ISR — 전시회 데이터는 실시간 갱신 불필요
export const revalidate = 3600

export default function ExhibitionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
