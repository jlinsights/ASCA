import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Webflow 마이그레이션 대시보드',
  description: 'Webflow → Next.js 마이그레이션 현황 및 페이지 미리보기',
}

type PageEntry = {
  label: string
  wfPath: string
  nextRoute?: string
  priority: 'high' | 'medium' | 'low' | 'skip'
}

const MAIN_PAGES: PageEntry[] = [
  { label: '메인 (Home)', wfPath: 'index.html', nextRoute: '/', priority: 'high' },
  { label: '인사말씀', wfPath: 'greetings.html', priority: 'high' },
  { label: '협회 연혁', wfPath: 'history.html', priority: 'high' },
  { label: '소개', wfPath: 'introductions.html', priority: 'high' },
  { label: '사명', wfPath: 'mission.html', priority: 'high' },
  { label: '임원', wfPath: 'board-members.html', priority: 'high' },
  { label: '문의', wfPath: 'contact.html', priority: 'high' },
  { label: '아카데미', wfPath: 'academy.html', nextRoute: '/academy', priority: 'high' },
  { label: '블로그', wfPath: 'blog.html', nextRoute: '/blog', priority: 'high' },
  { label: '공지사항', wfPath: 'notifications.html', nextRoute: '/notice', priority: 'high' },
  { label: '입회원서', wfPath: 'membership.html', priority: 'high' },
  { label: '출품원서', wfPath: 'application.html', priority: 'high' },
  { label: '협력기관', wfPath: 'partners.html', priority: 'medium' },
  { label: '브랜드', wfPath: 'brand.html', priority: 'medium' },
  { label: '모금 및 후원', wfPath: 'fundrasing.html', priority: 'medium' },
  { label: '사업계획', wfPath: 'business-plan.html', priority: 'medium' },
  { label: '공정성·투명성', wfPath: 'fairness-transparency-hub.html', priority: 'medium' },
  { label: '정관', wfPath: 'articles-of-incorporation-and-bylaws.html', priority: 'medium' },
  { label: '서식', wfPath: 'forms.html', priority: 'medium' },
  { label: '숍', wfPath: 'shop.html', priority: 'low' },
]

const EXHIBITION_PAGES: PageEntry[] = [
  {
    label: '제22회 동양서예대전 2025',
    wfPath: 'exhibition/22-oriental-calligraphy-exhibition-2025.html',
    priority: 'high',
  },
  {
    label: '제22회 한·중 초대작가전',
    wfPath: 'exhibition/je22hoe-han-jung-il-dongyangseoyecodaejaggajeon.html',
    priority: 'high',
  },
  {
    label: '제21회 동양서예대전 2024',
    wfPath: 'exhibition/21-oriental-calligraphy-exhibition-2024.html',
    priority: 'high',
  },
  {
    label: '제21회 한·중·일 초대작가전 2024',
    wfPath: 'exhibition/21-korea-china-japan-exhibition-2024.html',
    priority: 'high',
  },
  {
    label: '제20회 동양서예대전 2023',
    wfPath: 'exhibition/20-oriental-calligraphy-exhibition-2023.html',
    priority: 'medium',
  },
  {
    label: '제20회 한·중·일 초대작가전 2023',
    wfPath: 'exhibition/20-korea-china-japan-exhibition-2023.html',
    priority: 'medium',
  },
  {
    label: '제19회 동양서예대전 2022',
    wfPath: 'exhibition/19-oriental-calligraphy-exhibition-2022.html',
    priority: 'medium',
  },
  {
    label: '제19회 한·중·일 초대작가전 2022',
    wfPath: 'exhibition/19-korea-china-japan-exhibition-2022.html',
    priority: 'medium',
  },
]

const MEMBER_PAGES: PageEntry[] = [
  { label: '고문', wfPath: 'members/executive-advisor.html', priority: 'medium' },
  { label: '자문위원', wfPath: 'members/advisor.html', priority: 'medium' },
  { label: '한국 초대작가', wfPath: 'members/korea-invited-calligrapher.html', priority: 'medium' },
  { label: '중국 초대작가', wfPath: 'members/china-invited-calligrapher.html', priority: 'medium' },
  { label: '일본 초대작가', wfPath: 'members/japan-invited-calligrapher.html', priority: 'medium' },
  { label: '추천작가', wfPath: 'members/recommended-calligrapher.html', priority: 'medium' },
  { label: '일반작가', wfPath: 'members/member-calligrapher.html', priority: 'medium' },
  { label: '공모작가', wfPath: 'members/applicant-calligrapher.html', priority: 'medium' },
  { label: '청년작가', wfPath: 'members/next-generatiion-calligrapher.html', priority: 'medium' },
  { label: '서예강사', wfPath: 'members/calligraphy-master.html', priority: 'medium' },
]

const LEGAL_PAGES: PageEntry[] = [
  {
    label: '이용약관',
    wfPath: 'terms-of-service.html',
    nextRoute: '/terms-of-service',
    priority: 'high',
  },
  {
    label: '개인정보처리방침',
    wfPath: 'privacy-policy.html',
    nextRoute: '/privacy-policy',
    priority: 'high',
  },
  {
    label: '저작권 정책',
    wfPath: 'copyright-policy.html',
    nextRoute: '/copyright-policy',
    priority: 'high',
  },
  {
    label: '이메일 무단수집 거부',
    wfPath: 'email-refuse.html',
    nextRoute: '/email-refuse',
    priority: 'medium',
  },
  {
    label: '기부금 이용약관',
    wfPath: 'terms-and-conditions-for-the-management-and-use-of-donations.html',
    priority: 'medium',
  },
]

const WF_BASE = '/webflow/orientalcalligraphy'

const priorityColors: Record<string, string> = {
  high: 'bg-scholar-red/10 text-scholar-red border-scholar-red/20',
  medium: 'bg-celadon-green/10 text-celadon-green border-celadon-green/20',
  low: 'bg-stone-gray/10 text-stone-gray border-stone-gray/20',
  skip: 'bg-muted text-muted-foreground border-muted',
}

function PageTable({ title, pages }: { title: string; pages: PageEntry[] }) {
  return (
    <div className='space-y-3'>
      <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>
      <div className='overflow-x-auto rounded-lg border'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b bg-muted/40'>
              <th className='px-4 py-2 text-left font-medium'>페이지</th>
              <th className='px-4 py-2 text-left font-medium'>Webflow 원본</th>
              <th className='px-4 py-2 text-left font-medium'>기존 Next 라우트</th>
              <th className='px-4 py-2 text-left font-medium'>우선순위</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(p => (
              <tr key={p.wfPath} className='border-b last:border-0'>
                <td className='px-4 py-2 font-medium'>{p.label}</td>
                <td className='px-4 py-2'>
                  <Link
                    href={`${WF_BASE}/${p.wfPath}`}
                    target='_blank'
                    className='text-celadon-green underline-offset-2 hover:underline'
                  >
                    {p.wfPath}
                  </Link>
                </td>
                <td className='px-4 py-2'>
                  {p.nextRoute ? (
                    <Link
                      href={p.nextRoute}
                      className='text-scholar-red underline-offset-2 hover:underline'
                    >
                      {p.nextRoute}
                    </Link>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </td>
                <td className='px-4 py-2'>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColors[p.priority]}`}
                  >
                    {p.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function WebflowMigrationPage() {
  return (
    <section className='container max-w-6xl py-10 space-y-10'>
      <header className='space-y-3'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Webflow → Next.js 마이그레이션 대시보드
        </h1>
        <p className='text-muted-foreground max-w-3xl'>
          Webflow ZIP 산출물(orientalcalligraphy.webflow.zip)을{' '}
          <code className='rounded bg-muted px-1.5 py-0.5 text-sm'>
            public/webflow/orientalcalligraphy
          </code>
          에 이관했습니다. 아래 표에서 각 Webflow 페이지의 원본을 확인하고, 기존 Next.js 라우트와의
          매핑을 관리할 수 있습니다.
        </p>
        <div className='flex flex-wrap gap-3 pt-2'>
          <Link
            href={`${WF_BASE}/index.html`}
            target='_blank'
            className='inline-flex items-center rounded-md bg-scholar-red px-4 py-2 text-sm font-medium text-white hover:bg-scholar-red/90'
          >
            Webflow 원본 메인 열기
          </Link>
          <Link
            href='/'
            className='inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent'
          >
            현재 Next.js 메인 보기
          </Link>
        </div>
      </header>

      <div className='rounded-lg border overflow-hidden bg-white'>
        <iframe
          title='Webflow 메인 미리보기'
          src={`${WF_BASE}/index.html`}
          className='w-full min-h-[60vh]'
        />
      </div>

      <PageTable title='주요 페이지' pages={MAIN_PAGES} />
      <PageTable title='전시 페이지' pages={EXHIBITION_PAGES} />
      <PageTable title='회원 페이지' pages={MEMBER_PAGES} />
      <PageTable title='법정·정책 페이지' pages={LEGAL_PAGES} />

      <div className='rounded-lg border bg-muted/30 p-6 space-y-3'>
        <h2 className='text-lg font-semibold'>마이그레이션 가이드</h2>
        <ol className='list-decimal list-inside space-y-2 text-sm text-muted-foreground'>
          <li>
            위 표에서 <strong>Webflow 원본</strong> 링크를 열어 디자인·콘텐츠를 확인합니다.
          </li>
          <li>기존 Next 라우트가 있으면 디자인/콘텐츠를 비교하여 병합 방향을 결정합니다.</li>
          <li>
            기존 라우트가 없으면 <code>app/</code> 아래 새 라우트를 생성하고, body 내부 HTML만
            React로 변환합니다.
          </li>
          <li>Webflow CSS 클래스는 점진적으로 Tailwind 유틸리티로 교체합니다.</li>
          <li>
            이미지는 <code>next/image</code>로 전환하여 최적화합니다.
          </li>
          <li>JS 인터랙션(GSAP, Webflow.js)은 Framer Motion 또는 React 상태로 대체합니다.</li>
        </ol>
      </div>
    </section>
  )
}
