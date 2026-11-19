import { existsSync } from 'fs'
import path from 'path'
import { EXHIBITION_YEARS } from '../_components/business-plan-data'

// 회귀: 포스터가 git 에 없는 public/webflow 경로를 가리켜 배포본에서 빈 칸으로 나왔다
describe('사업계획 — 전시 포스터', () => {
  it.each(EXHIBITION_YEARS.filter(e => e.posterSrc).map(e => [e.year, e.posterSrc!]))(
    '%s년 포스터 파일이 저장소 public 에 있다',
    (_year, src) => {
      expect(existsSync(path.join(process.cwd(), 'public', src))).toBe(true)
    }
  )
})
