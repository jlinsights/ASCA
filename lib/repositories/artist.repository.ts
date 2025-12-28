import { eq, like, or, desc, asc } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { artists } from '@/lib/db/schema-pg';
import type { Artist, NewArtist } from '@/lib/db/schema-pg';

/**
 * Artist Repository
 * Extends BaseRepository with artist-specific queries
 */
export class ArtistRepository extends BaseRepository<typeof artists, Artist, NewArtist> {
  constructor() {
    super(artists);
  }

  /**
   * Find artist by name
   */
  async findByName(name: string): Promise<Artist | null> {
    return this.findOne({
      where: or(
        eq(artists.name, name),
        eq(artists.name_en, name)
      ),
    });
  }

  /**
   * Find artists by nationality
   */
  async findByNationality(nationality: string): Promise<Artist[]> {
    return this.findAll({
      where: eq(artists.nationality, nationality),
      orderBy: desc(artists.created_at),
    });
  }

  /**
   * Find artists by membership type
   */
  async findByMembershipType(membershipType: string): Promise<Artist[]> {
    return this.findAll({
      where: eq(artists.membership_type, membershipType),
      orderBy: desc(artists.created_at),
    });
  }

  /**
   * Search artists by name or bio
   */
  async search(query: string): Promise<Artist[]> {
    return this.findAll({
      where: or(
        like(artists.name, `%${query}%`),
        like(artists.name_en, `%${query}%`),
        like(artists.bio, `%${query}%`)
      ),
      orderBy: desc(artists.created_at),
    });
  }
}

export const artistRepository = new ArtistRepository();
