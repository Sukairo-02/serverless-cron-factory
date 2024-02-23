CREATE TABLE `stack` (
	`name` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`created_at` integer NOT NULL,
	`password` text NOT NULL,
	`log_telegram_id` text
);
--> statement-breakpoint
CREATE TABLE `task` (
	`name` text NOT NULL,
	`stack_name` text NOT NULL,
	`cron_string` text NOT NULL,
	`url` text NOT NULL,
	`headers` text,
	`created_at` integer NOT NULL,
	`calls` integer DEFAULT 0 NOT NULL,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`last_succesfull_call` integer,
	PRIMARY KEY(`name`, `stack_name`),
	FOREIGN KEY (`stack_name`) REFERENCES `stack`(`name`) ON UPDATE cascade ON DELETE cascade
);
