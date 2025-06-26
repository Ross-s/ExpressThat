DROP TABLE `apikey`;--> statement-breakpoint
DROP TABLE `invitation`;--> statement-breakpoint
DROP TABLE `member`;--> statement-breakpoint
DROP TABLE `organization`;--> statement-breakpoint
DROP TABLE `passkey`;--> statement-breakpoint
DROP TABLE `two_factor`;--> statement-breakpoint
ALTER TABLE `session` DROP COLUMN `active_organization_id`;--> statement-breakpoint
ALTER TABLE `session` DROP COLUMN `impersonated_by`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `stripe_customer_id`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `banned`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `ban_reason`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `ban_expires`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `two_factor_enabled`;