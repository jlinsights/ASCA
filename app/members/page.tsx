/**
 * Members List Page
 *
 * Displays all members with filtering and pagination
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMembers } from '@/lib/api/rails-hooks'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

export default function MembersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')

  const { data, isLoading, error } = useMembers(page, status)

  const members = data?.members || []
  const meta = data?.meta || {}

  const renderBody = () => {
    if (isLoading) {
      return <div className='text-center py-12'>Loading members...</div>
    }

    if (error) {
      return (
        <>
          <div className='bg-seal/5 border border-seal/30 rounded-lg p-4 text-foreground'>
            <strong>Error:</strong> {(error as Error).message}
          </div>
          <div className='mt-4 text-sm text-muted-foreground'>
            Rails 서버가 실행 중인지 확인해주세요: http://localhost:3000
          </div>
        </>
      )
    }

    return (
      <>
        {/* Filters */}
        <div className='mb-6 flex gap-4'>
          <select
            value={status}
            onChange={e => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className='px-4 py-2 border rounded-lg'
          >
            <option value=''>All Status</option>
            <option value='pending_approval'>Pending</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
            <option value='suspended'>Suspended</option>
          </select>
        </div>

        {/* Members Table */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-muted'>
              <tr>
                <th className='px-6 py-3 text-left text-sm font-medium text-foreground'>
                  회원번호
                </th>
                <th className='px-6 py-3 text-left text-sm font-medium text-foreground'>이름</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-foreground'>등급</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-foreground'>상태</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-foreground'>가입일</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-8 text-center text-muted-foreground'>
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((member: any) => (
                  <tr key={member.id} className='hover:bg-muted'>
                    <td className='px-6 py-4 text-sm'>{member.membership_number || '-'}</td>
                    <td className='px-6 py-4 text-sm font-medium'>
                      {member.full_name_ko || member.full_name}
                    </td>
                    <td className='px-6 py-4 text-sm'>Level {member.tier_level}</td>
                    <td className='px-6 py-4 text-sm'>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          member.status === 'active'
                            ? 'bg-success/10 text-foreground'
                            : member.status === 'pending_approval'
                              ? 'bg-warning/10 text-foreground'
                              : 'bg-muted text-foreground'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-muted-foreground'>
                      {member.join_date
                        ? new Date(member.join_date).toLocaleDateString('ko-KR')
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.total_pages > 1 && (
          <div className='mt-6 flex justify-center gap-2'>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className='px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted'
            >
              Previous
            </button>

            <span className='px-4 py-2'>
              Page {meta.current_page} of {meta.total_pages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
              disabled={page === meta.total_pages}
              className='px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted'
            >
              Next
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div>
      <PageHero
        {...PAGE_HERO_MARKS.members}
        title='회원 목록'
        actions={
          <Link
            href='/members/apply'
            className='bg-info text-white px-6 py-2 rounded-lg hover:bg-info/90'
          >
            회원 신청
          </Link>
        }
      >
        <HeroFacts
          facts={[
            {
              label: '불러온 회원',
              value: isLoading || error ? '—' : members.length,
            },
          ]}
        />
      </PageHero>

      <div className='container py-10 md:py-16'>{renderBody()}</div>
    </div>
  )
}
