import {
  DELETED_AUTHOR,
  THREAD_COLUMNS,
  excerpt,
  resolveAuthor,
  splitLinks,
  threadCreateSchema,
  threadModerationSchema,
  toThreadView,
  type PublicArtistLink,
} from '../threads'

const account = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const artist: PublicArtistLink = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  slug: 'test-artist',
  name: '시험작가',
  profile_image: 'https://example.test/a.jpg',
  membership_type: '초대작가, 이사',
  claimed_by_user_id: account,
}

describe('THREAD_COLUMNS', () => {
  it('never reads moderation details into public views', () => {
    for (const hidden of ['hidden_at', 'hidden_by', 'hidden_reason', 'deleted_at'])
      expect(THREAD_COLUMNS.split(',')).not.toContain(hidden)
  })
})

describe('threadCreateSchema', () => {
  it('trims and requires a title and body', () => {
    expect(threadCreateSchema.parse({ title: '  제목 ', body: ' 본문 ' })).toEqual({
      title: '제목',
      body: '본문',
    })
    expect(threadCreateSchema.safeParse({ title: '   ', body: '본문' }).success).toBe(false)
    expect(threadCreateSchema.safeParse({ title: '제목', body: '' }).success).toBe(false)
  })

  it('enforces the same limits as the database', () => {
    expect(threadCreateSchema.safeParse({ title: 'a'.repeat(121), body: 'b' }).success).toBe(false)
    expect(threadCreateSchema.safeParse({ title: 'a', body: 'b'.repeat(10001) }).success).toBe(
      false
    )
    expect(
      threadCreateSchema.safeParse({ title: 'a'.repeat(120), body: 'b'.repeat(10000) }).success
    ).toBe(true)
  })
})

describe('threadModerationSchema', () => {
  it('accepts hide with an optional reason and restore', () => {
    expect(threadModerationSchema.parse({ action: 'hide' })).toEqual({ action: 'hide' })
    expect(threadModerationSchema.parse({ action: 'hide', reason: ' 광고 ' })).toEqual({
      action: 'hide',
      reason: '광고',
    })
    expect(threadModerationSchema.parse({ action: 'restore' })).toEqual({ action: 'restore' })
    expect(threadModerationSchema.safeParse({ action: 'delete' }).success).toBe(false)
  })
})

describe('resolveAuthor', () => {
  const names = new Map([
    [account, '계정 이름'],
    [other, '  '],
  ])
  const artists = new Map([[account, artist]])

  it('shows a linked public artist with its first membership grade', () => {
    expect(resolveAuthor(account, names, artists)).toEqual({
      kind: 'artist',
      name: '시험작가',
      role: '초대작가',
      image: 'https://example.test/a.jpg',
      href: '/artists/test-artist',
    })
  })

  it('falls back to the display name without a role when no public artist is linked', () => {
    expect(resolveAuthor(account, names, new Map())).toEqual({
      kind: 'member',
      name: '계정 이름',
      role: null,
      image: null,
      href: null,
    })
    expect(resolveAuthor(other, names, new Map()).name).toBeNull()
  })

  it('marks posts of deleted accounts', () => {
    expect(resolveAuthor(null, names, artists)).toBe(DELETED_AUTHOR)
  })
})

describe('toThreadView', () => {
  const row = {
    id: 't1',
    author_id: account,
    title: '제목',
    body: '본문',
    created_at: '2026-10-25T00:00:00.000Z',
    updated_at: '2026-10-25T00:00:01.000Z',
  }
  it('flags edits only after a minute', () => {
    expect(toThreadView(row, new Map(), new Map()).edited).toBe(false)
    expect(
      toThreadView({ ...row, updated_at: '2026-10-25T00:05:00.000Z' }, new Map(), new Map()).edited
    ).toBe(true)
  })

  it('never sends the author account id to the page, only whether it is mine', () => {
    const view = toThreadView(row, new Map(), new Map(), account)
    expect(view).not.toHaveProperty('author_id')
    expect(JSON.stringify(view)).not.toContain(account)
    expect(view.mine).toBe(true)
    expect(toThreadView(row, new Map(), new Map(), other).mine).toBe(false)
    expect(toThreadView(row, new Map(), new Map()).mine).toBe(false)
    expect(toThreadView({ ...row, author_id: null }, new Map(), new Map(), null).mine).toBe(false)
  })
})

describe('splitLinks', () => {
  it('turns http(s) addresses into links and keeps trailing punctuation as text', () => {
    expect(splitLinks('전시 안내: https://example.test/a?b=1. 감사합니다')).toEqual([
      { kind: 'text', value: '전시 안내: ' },
      { kind: 'link', value: 'https://example.test/a?b=1' },
      { kind: 'text', value: '. 감사합니다' },
    ])
  })

  it('never links other schemes', () => {
    expect(splitLinks('javascript:alert(1) data:text/html,x')).toEqual([
      { kind: 'text', value: 'javascript:alert(1) data:text/html,x' },
    ])
  })

  it('handles text without links and empty bodies', () => {
    expect(splitLinks('그냥 글')).toEqual([{ kind: 'text', value: '그냥 글' }])
    expect(splitLinks('')).toEqual([])
  })
})

describe('excerpt', () => {
  it('keeps short bodies and cuts long ones', () => {
    expect(excerpt('  짧은 글  ')).toEqual({ text: '짧은 글', truncated: false })
    const long = excerpt('가'.repeat(300), 10)
    expect(long.truncated).toBe(true)
    expect(long.text).toBe(`${'가'.repeat(10)}…`)
  })
})
