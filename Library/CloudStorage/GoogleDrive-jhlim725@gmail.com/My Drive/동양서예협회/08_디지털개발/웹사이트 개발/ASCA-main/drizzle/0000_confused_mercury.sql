CREATE TABLE `admin_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`permissions` text NOT NULL,
	`granted_by` text,
	`granted_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`name_ko` text,
	`name_en` text,
	`name_cn` text,
	`name_jp` text,
	`bio` text,
	`bio_ko` text,
	`bio_en` text,
	`bio_cn` text,
	`bio_jp` text,
	`birth_year` integer,
	`nationality` text,
	`specialties` text,
	`awards` text,
	`exhibitions` text,
	`profile_image` text,
	`website` text,
	`social_media` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `artworks` (
	`id` text PRIMARY KEY NOT NULL,
	`artist_id` text NOT NULL,
	`title` text NOT NULL,
	`title_ko` text,
	`title_en` text,
	`title_cn` text,
	`title_jp` text,
	`description` text,
	`description_ko` text,
	`description_en` text,
	`description_cn` text,
	`description_jp` text,
	`category` text NOT NULL,
	`style` text,
	`medium` text,
	`dimensions` text,
	`year` integer,
	`image_url` text,
	`image_urls` text,
	`price` real,
	`currency` text DEFAULT 'KRW',
	`is_for_sale` integer DEFAULT false NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`tags` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`registered_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`notes` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`title_ko` text,
	`title_en` text,
	`title_cn` text,
	`title_jp` text,
	`description` text,
	`description_ko` text,
	`description_en` text,
	`description_cn` text,
	`description_jp` text,
	`type` text NOT NULL,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`venue` text,
	`venue_address` text,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`registration_deadline` integer,
	`max_participants` integer,
	`current_participants` integer DEFAULT 0 NOT NULL,
	`fee` real,
	`currency` text DEFAULT 'KRW',
	`organizer_id` text,
	`poster_image` text,
	`images` text,
	`requirements` text,
	`materials` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exhibition_artists` (
	`id` text PRIMARY KEY NOT NULL,
	`exhibition_id` text NOT NULL,
	`artist_id` text NOT NULL,
	`role` text DEFAULT 'participant',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`exhibition_id`) REFERENCES `exhibitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exhibition_artworks` (
	`id` text PRIMARY KEY NOT NULL,
	`exhibition_id` text NOT NULL,
	`artwork_id` text NOT NULL,
	`display_order` integer,
	`is_highlight` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`exhibition_id`) REFERENCES `exhibitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exhibitions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`title_ko` text,
	`title_en` text,
	`title_cn` text,
	`title_jp` text,
	`description` text,
	`description_ko` text,
	`description_en` text,
	`description_cn` text,
	`description_jp` text,
	`type` text NOT NULL,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`venue` text,
	`venue_address` text,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`opening_hours` text,
	`admission_fee` real,
	`currency` text DEFAULT 'KRW',
	`poster_image` text,
	`gallery_images` text,
	`curator_notes` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `galleries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_ko` text,
	`name_en` text,
	`name_cn` text,
	`name_jp` text,
	`description` text,
	`description_ko` text,
	`description_en` text,
	`description_cn` text,
	`description_jp` text,
	`type` text DEFAULT 'permanent' NOT NULL,
	`cover_image` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gallery_artworks` (
	`id` text PRIMARY KEY NOT NULL,
	`gallery_id` text NOT NULL,
	`artwork_id` text NOT NULL,
	`display_order` integer,
	`is_highlight` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`gallery_id`) REFERENCES `galleries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`title_ko` text,
	`title_en` text,
	`title_cn` text,
	`title_jp` text,
	`content` text NOT NULL,
	`content_ko` text,
	`content_en` text,
	`content_cn` text,
	`content_jp` text,
	`excerpt` text,
	`category` text DEFAULT 'news' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`author_id` text,
	`featured_image` text,
	`images` text,
	`tags` text,
	`published_at` integer,
	`is_pinned` integer DEFAULT false NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'visitor' NOT NULL,
	`avatar` text,
	`bio` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);