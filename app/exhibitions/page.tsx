import { ExhibitionRecordsPage } from './_components/exhibition-records-page'

// 전시 목록도 하위 페이지(현재·예정·지난·온라인)와 같은 협회 연혁 기록을 쓴다.
// 예전엔 비어 있는 exhibitions 테이블을 읽어 "전시가 없습니다"만 보였다.
export default function ExhibitionsPage() {
  return <ExhibitionRecordsPage variant='all' />
}
