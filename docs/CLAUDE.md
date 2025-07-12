# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASCA is a sophisticated Korean Calligraphy Association website featuring:
- **Dual Database System**: Supabase (PostgreSQL) primary + Airtable external CMS
- **Bidirectional Sync**: Custom real-time synchronization between databases  
- **Multi-language Support**: Korean (default), English, Japanese, Chinese
- **Admin Dashboard**: Complete CMS for managing artists, artworks, exhibitions
- **Advanced Gallery**: Filtering, categorization, and viewing features

## Primary Commands

### Development
```bash
npm run dev              # Development server (localhost:3000)
npm run dev:turbo        # Turbo mode development  
npm run build            # Production build
npm run start            # Start production server
npm run pre-commit       # Full quality check before commits
```

### Database Management
```bash
npm run db:studio        # Open Drizzle Studio GUI (key tool)
npm run db:push          # Apply schema changes to database
npm run db:seed          # Seed development data
npm run db:reset         # Complete reset: drop + push + seed
npm run db:generate      # Generate migrations from schema
```

### Quality Assurance
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix linting issues
npm run test             # Run Jest tests
npm run test:coverage    # Generate test coverage report
```

## Core Architecture

### Database System
- **Primary**: Supabase PostgreSQL (live production data)
- **Schema**: 12 main tables with multi-language fields
- **Sync Engine**: Custom bidirectional Airtable ↔ Supabase synchronization
- **ORM**: Drizzle with type-safe queries in `lib/db/queries.ts`

### Key Tables
- `artists` - Artist profiles with multilingual fields
- `artworks` - Artwork data with category/metadata 
- `exhibitions` - Exhibition management
- `events`, `news` - Content management
- Junction tables for many-to-many relationships

### Multi-language Pattern
All content tables use consistent multilingual structure:
- `title`, `titleKo`, `titleEn`, `titleCn`, `titleJp`
- `description`, `descriptionKo`, `descriptionEn`, `descriptionCn`, `descriptionJp`

## Admin System

### Special Admin Account
- Email: `info@orientalcalligraphy.org`
- Auto-login without password
- Full CMS access at `/admin`

### Key Admin Features
- Artist/artwork management
- Exhibition scheduling
- News/event publishing
- Database migration monitoring
- Real-time sync controls

## Development Patterns

### Database Operations
Always use typed queries from `lib/db/queries.ts`:
```typescript
import { getArtistById, createArtwork } from '@/lib/db/queries';
```

### Multi-language Content
Use the established pattern for all content:
```typescript
{
  title: string,      // Korean (default)
  titleEn?: string,   // English  
  titleCn?: string,   // Chinese
  titleJp?: string    // Japanese
}
```

### Component Structure
- UI components in `components/ui/` with brand variants
- Page components follow Next.js App Router structure
- Admin components separated in `app/admin/`

## Critical Development Guidelines

### Database Changes
1. Modify schema in `lib/db/schema.ts` (not schema-pg.ts)
2. Run `npm run db:generate` to create migration
3. Apply with `npm run db:push`
4. Update query functions in `lib/db/queries.ts`
5. Test with `npm run db:studio` visual interface

### Sync System
- Airtable integration in `lib/airtable.ts`
- Migration engine in `lib/airtable-migration.ts`  
- Real-time sync in `lib/sync-engine.ts`
- Never modify sync tables directly - use sync endpoints

### Brand Consistency
- Use brand color variables from Tailwind config
- Follow component variants: celadon, sage, terra, traditional
- Maintain Korean calligraphy aesthetic in UI

## Important File Locations

- **Database Schema**: `lib/db/schema.ts` (primary SQLite schema)
- **Database Config**: `drizzle.config.ts` (points to PostgreSQL)
- **Admin Auth**: `contexts/AuthContext.tsx`
- **Multi-language**: `lib/i18n/` directory
- **Sync Logic**: `lib/sync-engine.ts`
- **API Routes**: `app/api/` (artists, migration, sync endpoints)

## Testing Strategy

- Database tests: `npx tsx lib/db/test.ts`
- Component tests with React Testing Library
- Admin functionality testing via `/admin/dev-login`
- Use `npm run pre-commit` before any commits

## Common Workflows

### Adding New Content Type
1. Add table to `lib/db/schema.ts` with multilingual fields
2. Create query functions in `lib/db/queries.ts`
3. Add API routes in `app/api/[content-type]/`
4. Build admin pages in `app/admin/[content-type]/`
5. Update sync system if Airtable integration needed

### Database Debugging
1. Use `npm run db:studio` for visual inspection
2. Check schema with `scripts/check-supabase-schema.js`
3. Test connections with `scripts/test-supabase-artworks.js`
4. Monitor sync status via admin dashboard

The project emphasizes type safety, multilingual support, and robust data synchronization between multiple systems.