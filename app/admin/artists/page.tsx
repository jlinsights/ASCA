'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DUES_STATUSES,
  DUES_STATUS_NOTES,
  type AdminArtistRow,
  type DuesStatus,
} from '@/lib/admin/artist-dues'
import { ArtistDuesTable } from './_components/artist-dues-table'

interface ListResponse {
  artists: AdminArtistRow[]
  total: number
  page: number
  pageSize: number
}

const GRADES = ['초대작가', '추천작가', '회원작가', '청년작가', '준회원', '공모작가']
const FILTER_CLASS =
  'h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? fallback
}

export default function AdminArtistsPage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('')
  const [dues, setDues] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ page: String(page) })
    if (query) params.set('q', query)
    if (grade) params.set('grade', grade)
    if (dues) params.set('dues', dues)
    try {
      const response = await fetch(`/api/admin/artists?${params}`, { credentials: 'include' })
      if (!response.ok) throw new Error(await errorMessage(response, '목록을 불러오지 못했습니다.'))
      setData((await response.json()) as ListResponse)
    } catch (loadError) {
      setData(null)
      setError(loadError instanceof Error ? loadError.message : '목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [page, query, grade, dues])

  useEffect(() => {
    void load()
  }, [load])

  const changeDues = async (artist: AdminArtistRow, next: DuesStatus) => {
    if (next === artist.dues_status) return
    setSavingId(artist.id)
    setNotice(null)
    try {
      const response = await fetch(`/api/admin/artists/${artist.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dues_status: next }),
      })
      if (!response.ok) throw new Error(await errorMessage(response, '저장하지 못했습니다.'))
      const { artist: saved } = (await response.json()) as { artist: AdminArtistRow }
      setData(current =>
        current
          ? { ...current, artists: current.artists.map(a => (a.id === saved.id ? saved : a)) }
          : current
      )
      setNotice(
        `${saved.name}: 회비 상태 ${saved.dues_status} · 웹사이트 ${saved.visibility === 'public' ? '공개' : '비공개'}`
      )
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : '저장하지 못했습니다.')
    } finally {
      setSavingId(null)
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const resetPage = () => setPage(1)

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>작가 회비 관리</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          회원 및 회비 규정 제5조. 등급은 그대로 두고 회비 상태만 바꿉니다 — 완납하면 「정상」으로
          되돌리면 기존 등급과 공개가 복원됩니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>회비 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-2 text-sm sm:grid-cols-3'>
            {DUES_STATUSES.map(status => (
              <div key={status}>
                <dt className='font-medium'>{status}</dt>
                <dd className='text-muted-foreground'>{DUES_STATUS_NOTES[status]}</dd>
              </div>
            ))}
          </dl>
          <p className='mt-3 text-xs text-muted-foreground'>
            준회원·공모작가는 회비 상태와 관계없이 웹사이트에 공개되지 않습니다.
          </p>
        </CardContent>
      </Card>

      <form
        className='flex flex-wrap gap-2'
        onSubmit={event => {
          event.preventDefault()
          resetPage()
          setQuery(search.trim())
        }}
      >
        <Input
          type='search'
          aria-label='이름 검색'
          placeholder='이름(한글·한자·영문)'
          value={search}
          onChange={event => setSearch(event.target.value)}
          className='w-56'
        />
        <select
          aria-label='등급'
          className={FILTER_CLASS}
          value={grade}
          onChange={event => {
            resetPage()
            setGrade(event.target.value)
          }}
        >
          <option value=''>등급 전체</option>
          {GRADES.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          aria-label='회비 상태 필터'
          className={FILTER_CLASS}
          value={dues}
          onChange={event => {
            resetPage()
            setDues(event.target.value)
          }}
        >
          <option value=''>회비 상태 전체</option>
          {DUES_STATUSES.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Button type='submit'>검색</Button>
      </form>

      {notice && (
        <p role='status' className='rounded-md bg-muted px-3 py-2 text-sm'>
          {notice}
        </p>
      )}

      {error ? (
        <div role='alert' className='rounded-md border border-destructive/40 p-4 text-sm'>
          {error}
          <Button variant='outline' size='sm' className='ml-3' onClick={() => void load()}>
            다시 시도
          </Button>
        </div>
      ) : loading && !data ? (
        <p className='text-sm text-muted-foreground'>불러오는 중…</p>
      ) : data && data.artists.length === 0 ? (
        <p className='text-sm text-muted-foreground'>조건에 맞는 작가가 없습니다.</p>
      ) : data ? (
        <>
          <p className='text-sm text-muted-foreground'>총 {data.total.toLocaleString()}명</p>
          <ArtistDuesTable artists={data.artists} savingId={savingId} onChangeDues={changeDues} />
          <div className='flex items-center justify-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              이전
            </Button>
            <span className='text-sm'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              다음
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
