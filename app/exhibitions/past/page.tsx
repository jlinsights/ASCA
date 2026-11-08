import { exhibitionToday } from '../_data/exhibition-listings'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'

// 서울 기준 날짜를 서버에서 고정해 분류하고, 홍보 목업은 실제 전시와 구분한다.
export default function PastExhibitionsPage() {
  return <ExhibitionRecordsPage variant='past' today={exhibitionToday()} />
}
