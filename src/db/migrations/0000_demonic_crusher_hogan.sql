CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`auth_provider` varchar(255) NOT NULL,
	`profile_picture` varchar(255),
	`role` enum('ADMIN','TELLER','USER') NOT NULL DEFAULT 'USER',
	`updated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
