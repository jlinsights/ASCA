/**
 * 2026-11-01 실시간 상담을 채널톡에서 카카오톡 채널로 옮겼다.
 * 채널톡 웹 상담 페이지(orientalcalligraphy.channel.io) 링크가 다시 들어오지 않게 묶어 둔다.
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { CHANNELS } from '../contact-data'
import { KAKAO_CHAT_URL } from '@/lib/content/contact-info'

const repoRoot = path.resolve(__dirname, '../../../..')

describe('실시간 상담 창구', () => {
  it('문의 페이지의 실시간 상담은 카카오톡 채팅 하나이고 추천 창구다', () => {
    const chats = CHANNELS.filter(channel => channel.href === KAKAO_CHAT_URL)
    expect(chats).toHaveLength(1)
    expect(chats[0]).toMatchObject({ title: '카카오톡 실시간 상담', recommended: true })
  })

  it('앱 코드 어디에도 채널톡 상담 링크가 없다', () => {
    let hits = ''
    try {
      hits = execFileSync(
        'git',
        ['grep', '-n', '-I', 'channel\\.io', '--', 'app', 'components', 'lib', ':!**/__tests__/**'],
        { cwd: repoRoot, encoding: 'utf8' }
      )
    } catch (error: unknown) {
      // git grep 은 일치가 없으면 종료 코드 1 — 그게 기대값이다
      const status = (error as { status?: number }).status
      if (status !== 1) throw error
    }
    expect(hits).toBe('')
  })
})
