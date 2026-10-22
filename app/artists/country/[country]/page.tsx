import { notFound, redirect } from 'next/navigation'

// 이 경로는 실제 회원이 아닌 예시 작가(김영진·王明·田中雅子 …)를 하드코딩해 보여 주고 있었다 (2026-10-22 정리).
// 국가별 작가는 작가 목록의 국적 필터가 DB 에서 바로 보여 주므로 그쪽으로 보낸다.
const NATIONALITY: Record<string, string> = {
  korea: '韓國',
  china: '中國',
  japan: '日本',
}

export default async function CountryArtistsPage({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const nationality = NATIONALITY[country]
  if (!nationality) notFound()
  redirect(`/artists?${new URLSearchParams({ nationality }).toString()}`)
}
