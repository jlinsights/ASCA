CREATE TABLE "academy_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"instructor" text,
	"schedule" text,
	"period" text,
	"level" text,
	"description" text,
	"curriculum" jsonb,
	"fee" text,
	"status" text,
	"external_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academy_courses_course_id_unique" UNIQUE("course_id")
);
--> statement-breakpoint
CREATE TABLE "academy_instructors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"intro_title" text,
	"category" text,
	"image_url" text,
	"career" jsonb,
	"artwork_url" text,
	"artwork_desc" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"granted_by" text,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"name_ko" text,
	"name_en" text,
	"name_cn" text,
	"name_jp" text,
	"bio" text,
	"bio_ko" text,
	"bio_en" text,
	"bio_cn" text,
	"bio_jp" text,
	"birth_year" integer,
	"nationality" text,
	"specialties" jsonb,
	"awards" jsonb,
	"exhibitions" jsonb,
	"profile_image" text,
	"website" text,
	"social_media" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artworks" (
	"id" text PRIMARY KEY NOT NULL,
	"artist_id" text NOT NULL,
	"title" text NOT NULL,
	"title_ko" text,
	"title_en" text,
	"title_cn" text,
	"title_jp" text,
	"description" text,
	"description_ko" text,
	"description_en" text,
	"description_cn" text,
	"description_jp" text,
	"category" text NOT NULL,
	"style" text,
	"medium" text,
	"dimensions" text,
	"year" integer,
	"image_url" text,
	"image_urls" jsonb,
	"price" real,
	"currency" text DEFAULT 'KRW',
	"is_for_sale" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cultural_exchange_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"member_id" text NOT NULL,
	"application_data" jsonb,
	"special_requests" text,
	"emergency_contact" jsonb,
	"status" text DEFAULT 'applied' NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"feedback" jsonb,
	"completion_certificate" text,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"completed_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "cultural_exchange_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_ko" text,
	"title_en" text,
	"title_cn" text,
	"title_jp" text,
	"description" text,
	"description_ko" text,
	"description_en" text,
	"description_cn" text,
	"description_jp" text,
	"program_type" text NOT NULL,
	"target_audience" jsonb,
	"partner_organizations" jsonb,
	"countries" jsonb,
	"languages" jsonb,
	"duration" integer,
	"max_participants" integer,
	"current_participants" integer DEFAULT 0,
	"fee" real,
	"currency" text DEFAULT 'KRW',
	"location" text,
	"venue" text,
	"accommodation_provided" boolean DEFAULT false,
	"meals_provided" boolean DEFAULT false,
	"transportation_provided" boolean DEFAULT false,
	"requirements" jsonb,
	"benefits" jsonb,
	"schedule" jsonb,
	"application_deadline" timestamp,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'planning' NOT NULL,
	"organizer_id" text,
	"coordinators" jsonb,
	"images" jsonb,
	"documents" jsonb,
	"is_featured" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'registered' NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_ko" text,
	"title_en" text,
	"title_cn" text,
	"title_jp" text,
	"description" text,
	"description_ko" text,
	"description_en" text,
	"description_cn" text,
	"description_jp" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"venue" text,
	"venue_address" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"registration_deadline" timestamp,
	"max_participants" integer,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"fee" real,
	"currency" text DEFAULT 'KRW',
	"organizer_id" text,
	"poster_image" text,
	"images" jsonb,
	"requirements" text,
	"materials" jsonb,
	"is_featured" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exhibition_artists" (
	"id" text PRIMARY KEY NOT NULL,
	"exhibition_id" text NOT NULL,
	"artist_id" text NOT NULL,
	"role" text DEFAULT 'participant',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exhibition_artworks" (
	"id" text PRIMARY KEY NOT NULL,
	"exhibition_id" text NOT NULL,
	"artwork_id" text NOT NULL,
	"display_order" integer,
	"is_highlight" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exhibitions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_ko" text,
	"title_en" text,
	"title_cn" text,
	"title_jp" text,
	"description" text,
	"description_ko" text,
	"description_en" text,
	"description_cn" text,
	"description_jp" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"venue" text,
	"venue_address" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"opening_hours" text,
	"admission_fee" real,
	"currency" text DEFAULT 'KRW',
	"poster_image" text,
	"gallery_images" jsonb,
	"curator_notes" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_storage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"file_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"width" integer,
	"height" integer,
	"format" text,
	"color_space" text,
	"purpose" text DEFAULT 'other' NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"is_public" boolean DEFAULT false,
	"access_level" text DEFAULT 'private' NOT NULL,
	"processing_status" text DEFAULT 'uploaded' NOT NULL,
	"checksum_md5" text,
	"checksum_sha256" text,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ko" text,
	"name_en" text,
	"name_cn" text,
	"name_jp" text,
	"description" text,
	"description_ko" text,
	"description_en" text,
	"description_cn" text,
	"description_jp" text,
	"type" text DEFAULT 'permanent' NOT NULL,
	"cover_image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_artworks" (
	"id" text PRIMARY KEY NOT NULL,
	"gallery_id" text NOT NULL,
	"artwork_id" text NOT NULL,
	"display_order" integer,
	"is_highlight" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"activity_type" text NOT NULL,
	"description" text,
	"points" integer DEFAULT 0,
	"related_entity_id" text,
	"related_entity_type" text,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_certifications" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"certification_type" text NOT NULL,
	"title" text NOT NULL,
	"title_ko" text,
	"title_en" text,
	"title_cn" text,
	"title_jp" text,
	"description" text,
	"level" text,
	"issuing_authority" text NOT NULL,
	"authority_logo" text,
	"certificate_number" text,
	"certificate_url" text,
	"skills_assessed" jsonb,
	"score" integer,
	"grade" text,
	"issued_at" timestamp NOT NULL,
	"expires_at" timestamp,
	"verification_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_certifications_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"membership_number" text NOT NULL,
	"tier_level" integer DEFAULT 1 NOT NULL,
	"tier_id" text,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"join_date" timestamp DEFAULT now() NOT NULL,
	"last_activity_date" timestamp,
	"full_name" text NOT NULL,
	"full_name_ko" text,
	"full_name_en" text,
	"full_name_cn" text,
	"full_name_jp" text,
	"date_of_birth" timestamp,
	"gender" text,
	"nationality" text DEFAULT 'KR',
	"phone_number" text,
	"alternate_email" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"address" text,
	"address_ko" text,
	"address_en" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text DEFAULT 'KR',
	"calligraphy_experience" integer,
	"specializations" jsonb,
	"preferred_styles" jsonb,
	"teaching_experience" integer,
	"certifications" jsonb,
	"achievements" jsonb,
	"education_background" jsonb,
	"calligraphy_education" jsonb,
	"interests" jsonb,
	"cultural_background" text,
	"languages" jsonb,
	"membership_history" jsonb,
	"payment_history" jsonb,
	"participation_score" integer DEFAULT 0,
	"contribution_score" integer DEFAULT 0,
	"privacy_settings" jsonb,
	"marketing_consent" boolean DEFAULT false,
	"data_processing_consent" boolean DEFAULT true,
	"profile_completeness" integer DEFAULT 0,
	"last_profile_update" timestamp,
	"referred_by" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "members_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "members_membership_number_unique" UNIQUE("membership_number")
);
--> statement-breakpoint
CREATE TABLE "membership_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"requested_tier_level" integer NOT NULL,
	"requested_tier_id" text,
	"application_type" text NOT NULL,
	"application_reason" text,
	"supporting_documents" jsonb,
	"portfolio_items" jsonb,
	"references" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewer_id" text,
	"review_comments" text,
	"review_score" integer,
	"review_criteria" jsonb,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"decided_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "membership_tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ko" text NOT NULL,
	"name_en" text NOT NULL,
	"name_cn" text,
	"name_jp" text,
	"description" text,
	"description_ko" text,
	"description_en" text,
	"description_cn" text,
	"description_jp" text,
	"level" integer NOT NULL,
	"requirements" jsonb,
	"benefits" jsonb,
	"annual_fee" real DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'KRW',
	"color" text DEFAULT '#000000',
	"icon" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_ko" text,
	"title_en" text,
	"title_cn" text,
	"title_jp" text,
	"content" text NOT NULL,
	"content_ko" text,
	"content_en" text,
	"content_cn" text,
	"content_jp" text,
	"excerpt" text,
	"category" text DEFAULT 'news' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" text,
	"featured_image" text,
	"images" jsonb,
	"tags" jsonb,
	"published_at" timestamp,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'visitor' NOT NULL,
	"avatar" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_exchange_participants" ADD CONSTRAINT "cultural_exchange_participants_program_id_cultural_exchange_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."cultural_exchange_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_exchange_participants" ADD CONSTRAINT "cultural_exchange_participants_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_exchange_programs" ADD CONSTRAINT "cultural_exchange_programs_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exhibition_artists" ADD CONSTRAINT "exhibition_artists_exhibition_id_exhibitions_id_fk" FOREIGN KEY ("exhibition_id") REFERENCES "public"."exhibitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exhibition_artists" ADD CONSTRAINT "exhibition_artists_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exhibition_artworks" ADD CONSTRAINT "exhibition_artworks_exhibition_id_exhibitions_id_fk" FOREIGN KEY ("exhibition_id") REFERENCES "public"."exhibitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exhibition_artworks" ADD CONSTRAINT "exhibition_artworks_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_storage" ADD CONSTRAINT "file_storage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_artworks" ADD CONSTRAINT "gallery_artworks_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_artworks" ADD CONSTRAINT "gallery_artworks_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_activities" ADD CONSTRAINT "member_activities_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_certifications" ADD CONSTRAINT "member_certifications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_tier_id_membership_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."membership_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_requested_tier_id_membership_tiers_id_fk" FOREIGN KEY ("requested_tier_id") REFERENCES "public"."membership_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;