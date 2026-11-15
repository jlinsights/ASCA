import 'server-only'

import { archiveIdentity } from '@/lib/archive/writer'
import { catalogQuoteEnabled } from './feature-flag'

// 가견적 미리보기는 기능을 켜도(CATALOG_QUOTE_PREVIEW=on) MFA 를 마친 관리자만 본다.
// 미의결 가격이 공개되지 않게, 그 밖의 방문자에게는 페이지와 API 가 없는 것처럼 404 를 준다.
export async function canViewCatalogQuotePreview(): Promise<boolean> {
  if (!catalogQuoteEnabled()) return false
  try {
    return (await archiveIdentity())?.admin === true
  } catch {
    return false
  }
}
