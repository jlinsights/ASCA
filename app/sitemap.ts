import { MetadataRoute } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { REGULATIONS, REGULATIONS_BASE_PATH, regulationHref } from '@/lib/regulations/catalog'
import { localPosts } from '@/lib/blog/local-posts'
import { getSupabaseClient } from '@/lib/supabase'

// 하루 한 번 다시 만든다 — 작가 공개 여부(등급·회비)가 바뀌면 다음 날 반영된다
export const revalidate = 86400

const PAGE_SIZE = 1000

interface SitemapArtist {
  id: string
  slug: string | null
  updated_at: string | null
}

/**
 * 공개 작가 id·slug. 🔴 anon 클라이언트만 쓴다 — RLS(artists_public_read)가 visibility='public' 만 돌려준다.
 * service role 은 RLS 를 건너뛰어 숨긴 작가(준회원·공모작가·자격 정지) 주소를 사이트맵에 싣게 된다.
 * 오류가 나면 빈 목록 — 사이트맵 때문에 배포 빌드가 죽지 않게 한다.
 */
async function publicArtists(): Promise<SitemapArtist[]> {
  const client = getSupabaseClient()
  if (!client) return []
  const rows: SitemapArtist[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client
      .from('artists')
      .select('id,slug,updated_at')
      .order('id')
      .range(from, from + PAGE_SIZE - 1)
    if (error || !data) return []
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = defaultSEO.url

  // Static routes
  // 공개 페이지. /search·/events 는 옛 CMS 테이블이 비어 있어(ASCA-2026 이관 전) 빈 화면이라 뺀다
  const routes = [
    '',
    '/introductions',
    '/greetings',
    '/mission',
    '/history',
    '/board-members',
    '/business-plan',
    '/partners',
    '/brand',
    '/fairness-transparency-hub',
    '/membership',
    '/fundraising',
    '/academy',
    '/contact',
    '/contests',
    '/awards',
    '/application',
    '/application-for-recommended-invited-calligrapher',
    '/commissioning-application',
    '/forms',
    '/exhibitions/current',
    '/exhibitions/upcoming',
    '/exhibitions/past',
    '/exhibitions/online',
    '/artists',
    '/artworks',
    '/gallery',
    '/blog',
    '/terms-of-service',
    '/privacy-policy',
    '/copyright-policy',
    '/email-refuse',
    '/terms-and-conditions-donations',
    REGULATIONS_BASE_PATH,
    ...REGULATIONS.map(entry => regulationHref(entry.slug)),
  ]

  const staticEntries: MetadataRoute.Sitemap = routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  // 옛 Webflow /post/<slug> 글 — 같은 slug 로 /blog/<slug> 에 있다
  const postEntries: MetadataRoute.Sitemap = localPosts.map(post => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  // 상세 페이지 canonical 이 /artists/<slug> 다. uuid 주소를 실으면 사이트맵과 canonical 이 서로 다른 주소를 가리킨다
  const artistEntries: MetadataRoute.Sitemap = (await publicArtists()).map(artist => ({
    url: `${baseUrl}/artists/${artist.slug ?? artist.id}`,
    ...(artist.updated_at ? { lastModified: new Date(artist.updated_at) } : {}),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries, ...artistEntries]
}
