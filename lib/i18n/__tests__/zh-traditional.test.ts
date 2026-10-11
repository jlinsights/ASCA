import { translations } from '../translations'
import { LANGUAGE_METADATA } from '../index'

// 사이트 중국어는 번체로 통일한다(홈 시안·Noto Serif TC 폰트와 맞춤, 2026-10-11 결정).
// 아래는 2026-10-11 당시 zh 표에 섞여 있던 간체 전용 글자 — 다시 들어오면 실패한다.
const SIMPLIFIED_ONLY =
  '与东个为举习书买于从们价会传体关册况刚创删别制办务动区协单历厦发号咨团图处学宝实审对将尔开当录征态户摄时术权条杰构标检欢汇汉没注浏点热状环现画确秘筛签类系线组细织绍绘络绝统编网群联艺荐营观规视览订认讯记证评试诞询详语误请课谐账购资赞载辑过运进选邮鉴钟银错门闭问间闻阅隐韩页领频题风验'

// 制·注·系 는 변환기가 문맥(製·註·係)에 따라 바꿨을 뿐, 번체에서도 그대로 쓰는 글자라(系統 등) 검사에서 뺀다.
const SAME_IN_TRADITIONAL = new Set(['制', '注', '系'])

describe('zh 번역은 번체다', () => {
  it('zh 로케일이 번체(zh-TW)다', () => {
    expect(LANGUAGE_METADATA.zh.locale).toBe('zh-TW')
  })

  it('zh 표에 간체 전용 글자가 없다', () => {
    const chars = [...SIMPLIFIED_ONLY].filter(c => !SAME_IN_TRADITIONAL.has(c))
    const zh = translations.zh ?? {}
    const offenders = Object.entries(zh)
      .filter(([, value]) => chars.some(c => value.includes(c)))
      .map(([key, value]) => `${key}=${value}`)
    expect(Object.keys(zh).length).toBeGreaterThan(100)
    expect(offenders).toStrictEqual([])
  })
})
