import { eq, desc, asc, and, or, like, count, sql } from 'drizzle-orm';
import { db } from './index';
import { 
  users, 
  artists, 
  artworks, 
  exhibitions, 
  news, 
  events,
  galleries,
  exhibitionArtworks,
  exhibitionArtists,
  galleryArtworks,
  eventParticipants,
  adminPermissions,
  type User,
  type NewUser,
  type Artist,
  type NewArtist,
  type Artwork,
  type NewArtwork,
  type Exhibition,
  type NewExhibition,
  type News,
  type NewNews,
  type Event,
  type NewEvent,
  type Gallery,
  type NewGallery
} from './schema';

// ===== 사용자 관련 쿼리 =====

export async function createUser(userData: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function updateUser(id: string, userData: Partial<NewUser>): Promise<User> {
  const [user] = await db
    .update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

// ===== 작가 관련 쿼리 =====

export async function createArtist(artistData: NewArtist): Promise<Artist> {
  const [artist] = await db.insert(artists).values(artistData).returning();
  return artist;
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const [artist] = await db.select().from(artists).where(eq(artists.id, id));
  return artist;
}

export async function getAllArtists(options?: {
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
}): Promise<Artist[]> {
  const { limit = 50, offset = 0, activeOnly = true } = options || {};
  
  let query = db.select().from(artists);
  
  if (activeOnly) {
    query = query.where(eq(artists.isActive, true));
  }
  
  return await query
    .orderBy(asc(artists.name))
    .limit(limit)
    .offset(offset);
}

export async function updateArtist(id: string, artistData: Partial<NewArtist>): Promise<Artist> {
  const [artist] = await db
    .update(artists)
    .set({ ...artistData, updatedAt: new Date() })
    .where(eq(artists.id, id))
    .returning();
  return artist;
}

export async function deleteArtist(id: string): Promise<void> {
  await db.delete(artists).where(eq(artists.id, id));
}

// ===== 작품 관련 쿼리 =====

export async function createArtwork(artworkData: NewArtwork): Promise<Artwork> {
  const [artwork] = await db.insert(artworks).values(artworkData).returning();
  return artwork;
}

export async function getArtworkById(id: string): Promise<Artwork | undefined> {
  const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
  return artwork;
}

export async function getArtworksByArtist(artistId: string, options?: {
  limit?: number;
  offset?: number;
}): Promise<Artwork[]> {
  const { limit = 20, offset = 0 } = options || {};
  
  return await db
    .select()
    .from(artworks)
    .where(eq(artworks.artistId, artistId))
    .orderBy(desc(artworks.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getFeaturedArtworks(limit: number = 10): Promise<Artwork[]> {
  return await db
    .select()
    .from(artworks)
    .where(eq(artworks.isFeatured, true))
    .orderBy(desc(artworks.createdAt))
    .limit(limit);
}

export async function searchArtworks(searchTerm: string, options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Artwork[]> {
  const { category, limit = 20, offset = 0 } = options || {};
  
  let query = db
    .select()
    .from(artworks)
    .where(
      or(
        like(artworks.title, `%${searchTerm}%`),
        like(artworks.description, `%${searchTerm}%`),
        like(artworks.tags, `%${searchTerm}%`)
      )
    );
  
  if (category) {
    query = query.where(eq(artworks.category, category));
  }
  
  return await query
    .orderBy(desc(artworks.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateArtwork(id: string, artworkData: Partial<NewArtwork>): Promise<Artwork> {
  const [artwork] = await db
    .update(artworks)
    .set({ ...artworkData, updatedAt: new Date() })
    .where(eq(artworks.id, id))
    .returning();
  return artwork;
}

export async function deleteArtwork(id: string): Promise<void> {
  await db.delete(artworks).where(eq(artworks.id, id));
}

// ===== 전시회 관련 쿼리 =====

export async function createExhibition(exhibitionData: NewExhibition): Promise<Exhibition> {
  const [exhibition] = await db.insert(exhibitions).values(exhibitionData).returning();
  return exhibition;
}

export async function getExhibitionById(id: string): Promise<Exhibition | undefined> {
  const [exhibition] = await db.select().from(exhibitions).where(eq(exhibitions.id, id));
  return exhibition;
}

export async function getExhibitionsByStatus(status: string, options?: {
  limit?: number;
  offset?: number;
}): Promise<Exhibition[]> {
  const { limit = 20, offset = 0 } = options || {};
  
  return await db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.status, status))
    .orderBy(desc(exhibitions.startDate))
    .limit(limit)
    .offset(offset);
}

export async function getFeaturedExhibitions(limit: number = 5): Promise<Exhibition[]> {
  return await db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.isFeatured, true))
    .orderBy(desc(exhibitions.startDate))
    .limit(limit);
}

export async function addArtworkToExhibition(
  exhibitionId: string, 
  artworkId: string, 
  options?: { displayOrder?: number; isHighlight?: boolean }
): Promise<void> {
  await db.insert(exhibitionArtworks).values({
    id: crypto.randomUUID(),
    exhibitionId,
    artworkId,
    displayOrder: options?.displayOrder,
    isHighlight: options?.isHighlight || false,
  });
}

export async function addArtistToExhibition(
  exhibitionId: string, 
  artistId: string, 
  role: string = 'participant'
): Promise<void> {
  await db.insert(exhibitionArtists).values({
    id: crypto.randomUUID(),
    exhibitionId,
    artistId,
    role,
  });
}

// ===== 뉴스 관련 쿼리 =====

export async function createNews(newsData: NewNews): Promise<News> {
  const [news] = await db.insert(news).values(newsData).returning();
  return news;
}

export async function getNewsById(id: string): Promise<News | undefined> {
  const [newsItem] = await db.select().from(news).where(eq(news.id, id));
  return newsItem;
}

export async function getPublishedNews(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<News[]> {
  const { category, limit = 20, offset = 0 } = options || {};
  
  let query = db
    .select()
    .from(news)
    .where(eq(news.status, 'published'));
  
  if (category) {
    query = query.where(eq(news.category, category));
  }
  
  return await query
    .orderBy(desc(news.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getPinnedNews(): Promise<News[]> {
  return await db
    .select()
    .from(news)
    .where(and(eq(news.status, 'published'), eq(news.isPinned, true)))
    .orderBy(desc(news.publishedAt));
}

export async function incrementNewsViewCount(id: string): Promise<void> {
  await db
    .update(news)
    .set({ viewCount: sql`${news.viewCount} + 1` })
    .where(eq(news.id, id));
}

// ===== 이벤트 관련 쿼리 =====

export async function createEvent(eventData: NewEvent): Promise<Event> {
  const [event] = await db.insert(events).values(eventData).returning();
  return event;
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const [event] = await db.select().from(events).where(eq(events.id, id));
  return event;
}

export async function getUpcomingEvents(limit: number = 10): Promise<Event[]> {
  return await db
    .select()
    .from(events)
    .where(eq(events.status, 'upcoming'))
    .orderBy(asc(events.startDate))
    .limit(limit);
}

export async function registerForEvent(eventId: string, userId: string): Promise<void> {
  await db.insert(eventParticipants).values({
    id: crypto.randomUUID(),
    eventId,
    userId,
    status: 'registered',
  });
  
  // 참가자 수 증가
  await db
    .update(events)
    .set({ currentParticipants: sql`${events.currentParticipants} + 1` })
    .where(eq(events.id, eventId));
}

// ===== 갤러리 관련 쿼리 =====

export async function createGallery(galleryData: NewGallery): Promise<Gallery> {
  const [gallery] = await db.insert(galleries).values(galleryData).returning();
  return gallery;
}

export async function getGalleryById(id: string): Promise<Gallery | undefined> {
  const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id));
  return gallery;
}

export async function getActiveGalleries(): Promise<Gallery[]> {
  return await db
    .select()
    .from(galleries)
    .where(eq(galleries.isActive, true))
    .orderBy(asc(galleries.sortOrder));
}

export async function addArtworkToGallery(
  galleryId: string, 
  artworkId: string, 
  options?: { displayOrder?: number; isHighlight?: boolean }
): Promise<void> {
  await db.insert(galleryArtworks).values({
    id: crypto.randomUUID(),
    galleryId,
    artworkId,
    displayOrder: options?.displayOrder,
    isHighlight: options?.isHighlight || false,
  });
}

// ===== 통계 및 대시보드 쿼리 =====

export async function getDashboardStats() {
  const [
    totalUsers,
    totalArtists,
    totalArtworks,
    totalExhibitions,
    totalNews,
    totalEvents
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(artists).where(eq(artists.isActive, true)),
    db.select({ count: count() }).from(artworks),
    db.select({ count: count() }).from(exhibitions),
    db.select({ count: count() }).from(news).where(eq(news.status, 'published')),
    db.select({ count: count() }).from(events)
  ]);

  return {
    users: totalUsers[0].count,
    artists: totalArtists[0].count,
    artworks: totalArtworks[0].count,
    exhibitions: totalExhibitions[0].count,
    news: totalNews[0].count,
    events: totalEvents[0].count,
  };
}

// ===== 관리자 권한 관련 쿼리 =====

export async function grantAdminPermissions(
  userId: string, 
  permissions: object, 
  grantedBy: string,
  expiresAt?: Date
): Promise<void> {
  await db.insert(adminPermissions).values({
    id: crypto.randomUUID(),
    userId,
    permissions: JSON.stringify(permissions),
    grantedBy,
    expiresAt,
  });
}

export async function getUserPermissions(userId: string): Promise<object | null> {
  const [permission] = await db
    .select()
    .from(adminPermissions)
    .where(
      and(
        eq(adminPermissions.userId, userId),
        eq(adminPermissions.isActive, true),
        or(
          sql`${adminPermissions.expiresAt} IS NULL`,
          sql`${adminPermissions.expiresAt} > CURRENT_TIMESTAMP`
        )
      )
    )
    .orderBy(desc(adminPermissions.grantedAt))
    .limit(1);

  return permission ? JSON.parse(permission.permissions) : null;
} 