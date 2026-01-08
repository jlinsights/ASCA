/**
 * Member Application Form Page
 * 
 * Allows users to apply for membership
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMember, useMembershipTiers } from '@/lib/api/rails-hooks';

export default function MemberApplicationPage() {
  const router = useRouter();
  const { data: tiersData, isLoading: tiersLoading } = useMembershipTiers();
  const createMember = useCreateMember();

  const [formData, setFormData] = useState({
    full_name_ko: '',
    full_name_en: '',
    phone_number: '',
    email: '',
    nationality: 'Korea',
    calligraphy_experience: '',
    specializations: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMember.mutateAsync(formData);
      alert('회원 신청이 완료되었습니다!');
      router.push('/members');
    } catch (error: any) {
      alert(`신청 실패: ${error.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (tiersLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">회원 신청</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-2">
            한국어 이름 *
          </label>
          <input
            type="text"
            name="full_name_ko"
            value={formData.full_name_ko}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="홍길동"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            영문 이름
          </label>
          <input
            type="text"
            name="full_name_en"
            value={formData.full_name_en}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Hong Gil-dong"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            전화번호 *
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="010-1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            이메일 *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="hong@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            국적
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            서예 경력 (년)
          </label>
          <input
            type="number"
            name="calligraphy_experience"
            value={formData.calligraphy_experience}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="5"
            min="0"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createMember.isPending}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createMember.isPending ? '제출 중...' : '신청하기'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </form>

      {/* Membership Tiers Info */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">회원 등급 안내</h2>
        <div className="space-y-3">
          {tiersData?.membership_tiers?.map((tier: any) => (
            <div key={tier.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{tier.name_ko}</span>
                  <span className="text-sm text-gray-600 ml-2">Level {tier.level}</span>
                </div>
                <span className="text-blue-600 font-semibold">
                  {tier.annual_fee?.toLocaleString()}원/년
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
