-- Migration: Add contest_results and partners tables
-- Created: 2026-04-11

CREATE TABLE IF NOT EXISTS "contest_results" (
  "id" text PRIMARY KEY NOT NULL,
  "year" integer NOT NULL,
  "edition" text,
  "contest_type" text DEFAULT 'oriental_calligraphy' NOT NULL,
  "contest_title" text NOT NULL,
  "award_category" text NOT NULL,
  "award_sub_category" text,
  "winner_name" text NOT NULL,
  "artwork_title" text,
  "script" text,
  "medium" text,
  "dimensions" text,
  "image_url" text,
  "artist_id" text REFERENCES "artists"("id"),
  "display_order" integer DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "partners" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "name_en" text,
  "name_cn" text,
  "name_jp" text,
  "category" text NOT NULL,
  "description" text,
  "description_en" text,
  "website" text,
  "logo_url" text,
  "address" text,
  "phone" text,
  "email" text,
  "relationship_type" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_contest_results_year" ON "contest_results" ("year");
CREATE INDEX IF NOT EXISTS "idx_contest_results_category" ON "contest_results" ("award_category");
CREATE INDEX IF NOT EXISTS "idx_contest_results_type" ON "contest_results" ("contest_type");
CREATE INDEX IF NOT EXISTS "idx_partners_category" ON "partners" ("category");
CREATE INDEX IF NOT EXISTS "idx_partners_active" ON "partners" ("is_active");
