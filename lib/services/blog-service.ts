import Parser from 'rss-parser';

export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  publishedAt: string;
  source: 'local' | 'tistory' | 'kakao';
  link: string;
  thumbnail?: string;
  author?: string;
  tags?: string[];
};

const parser = new Parser();

const TISTORY_RSS_URL = 'https://orientalcalligraphy.tistory.com/rss';

export async function getTistoryPosts(): Promise<BlogPost[]> {
  try {
    const feed = await parser.parseURL(TISTORY_RSS_URL);
    
    return feed.items.map((item) => {
        // Extract basic info
        const contentSnippet = item.contentSnippet || item.content || '';
        const summary = contentSnippet.substring(0, 150) + (contentSnippet.length > 150 ? '...' : '');
        
        // Extract first image from content if available (simple regex)
        const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
        const thumbnail = imgMatch ? imgMatch[1] : undefined;

        return {
            id: item.guid || item.link || Math.random().toString(),
            title: item.title || 'Untitled',
            summary: summary,
            content: item.content,
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            source: 'tistory',
            link: item.link || '#',
            thumbnail: thumbnail,
            author: item.creator || '동양서예',
            tags: item.categories,
        };
    });
  } catch (error) {
    // console.error('Failed to fetch Tistory RSS:', error);
    return [];
  }
}

// Import migrated data
import migratedPosts from '@/lib/data/blog-posts.json';

// Local mock data (migrated from news page)
export const localPosts: BlogPost[] = migratedPosts.map(post => ({
  ...post,
  source: 'local' as const,
  // Ensure optional fields are handled if missing in JSON (though they are present)
})) as BlogPost[];

export async function getCombinedPosts(): Promise<BlogPost[]> {
    const tistoryPosts = await getTistoryPosts();
    const allPosts = [...localPosts, ...tistoryPosts];
    
    // Sort by date descending
    return allPosts.sort((a, b) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}
