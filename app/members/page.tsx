/**
 * Members List Page
 *
 * Displays all members with filtering and pagination
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMembers } from '@/lib/api/rails-hooks'

export default function MembersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')

  const { data, isLoading, error } = useMembers(page, status)

  if (isLoading) {
    return (
      <div className='container mx-auto p-8'>
        <div className='text-center py-12'>Loading members...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto p-8'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-800'>
          <strong>Error:</strong> {(error as Error).message}
        </div>
        <div className='mt-4 text-sm text-gray-600'>
          Rails 서버가 실행 중인지 확인해주세요: http://localhost:3000
        </div>
      </div>
    )
  }

  const members = data?.members || []
  const meta = data?.meta || {}

  return (
    <div className='container mx-auto p-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>회원 목록</h1>
        <Link
          href='/members/apply'
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
        >
          회원 신청
        </Link>
      </div>

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
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>회원번호</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>이름</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>등급</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>상태</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>가입일</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              members.map((member: any) => (
                <tr key={member.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 text-sm'>{member.membership_number || '-'}</td>
                  <td className='px-6 py-4 text-sm font-medium'>
                    {member.full_name_ko || member.full_name}
                  </td>
                  <td className='px-6 py-4 text-sm'>Level {member.tier_level}</td>
                  <td className='px-6 py-4 text-sm'>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'pending_approval'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600'>
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
            className='px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
          >
            Previous
          </button>

          <span className='px-4 py-2'>
            Page {meta.current_page} of {meta.total_pages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
            disabled={page === meta.total_pages}
            className='px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
