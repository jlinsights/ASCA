// 화면에 쓰는 최종 번역표 (ko).
// 순서는 예전 t() 가 번역을 미리 불러온 뒤 찾던 순서 그대로다:
// 내비게이션 → 작품 → 정적 표 → 예전 컨텍스트 내장 표.
import { resolveTable } from '../resolve'
import navigation from './navigation'
import artworks from './artworks'
import staticTable from './static'
import legacy from './legacy'

const table = resolveTable([navigation, artworks, staticTable, legacy])

export default table
