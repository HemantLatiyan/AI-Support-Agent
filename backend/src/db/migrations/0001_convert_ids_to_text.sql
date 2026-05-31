CREATE TABLE `__conversations_new` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer,
  `updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__conversations_new` (`id`, `created_at`, `updated_at`)
SELECT CAST(`id` AS text), `created_at`, `updated_at`
FROM `conversations`;
--> statement-breakpoint
CREATE TABLE `__messages_new` (
  `id` text PRIMARY KEY NOT NULL,
  `conversation_id` text NOT NULL,
  `content` text NOT NULL,
  `role` text NOT NULL,
  `created_at` integer,
  FOREIGN KEY (`conversation_id`) REFERENCES `__conversations_new`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__messages_new` (`id`, `conversation_id`, `content`, `role`, `created_at`)
SELECT CAST(`id` AS text), CAST(`conversation_id` AS text), `content`, `role`, `created_at`
FROM `messages`;
--> statement-breakpoint
DROP TABLE `messages`;
--> statement-breakpoint
DROP TABLE `conversations`;
--> statement-breakpoint
ALTER TABLE `__conversations_new` RENAME TO `conversations`;
--> statement-breakpoint
ALTER TABLE `__messages_new` RENAME TO `messages`;
