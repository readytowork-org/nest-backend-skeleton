CREATE TABLE `staffs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('STAFF','ADMIN') NOT NULL DEFAULT 'STAFF',
	`is_active` tinyint NOT NULL DEFAULT 0,
	`last_login_at` datetime,
	`notes` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `staffs_id` PRIMARY KEY(`id`),
	CONSTRAINT `staffs_email_unique` UNIQUE(`email`)
);
