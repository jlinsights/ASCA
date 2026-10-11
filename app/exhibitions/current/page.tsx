import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'

// 협회 연혁 기록(app/history/_data/history-events.ts)에서 만든 목록 — 예시 전시를 쓰지 않는다
export default function CurrentExhibitionsPage() {
  return <ExhibitionRecordsPage variant='current' />
}
