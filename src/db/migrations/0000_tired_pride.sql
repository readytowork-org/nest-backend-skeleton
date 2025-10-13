CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`middle_name` varchar(255),
	`last_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`auth_provider` varchar(255) NOT NULL,
	`phone_number` varchar(255),
	`role` enum('ADMIN','USER') NOT NULL DEFAULT 'ADMIN',
	`address` varchar(255),
	`status` enum('Active','Inactive','Suspended') NOT NULL,
	`profile_picture` varchar(255),
	`reset_password_token` varchar(64),
	`reset_password_token_expires_at` datetime,
	`last_login_at` datetime,
	`updated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `name_index` ON `users` (`email`);