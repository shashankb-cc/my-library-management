CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`author` varchar(100) NOT NULL,
	`publisher` varchar(100) NOT NULL,
	`genre` varchar(100) NOT NULL,
	`isbnNo` varchar(13),
	`numOfPages` int NOT NULL,
	`totalNumOfCopies` int NOT NULL,
	`availableNumberOfCopies` int NOT NULL,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`phoneNumber` varchar(10) NOT NULL,
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bookId` bigint unsigned NOT NULL,
	`memberId` bigint unsigned NOT NULL,
	`issueDate` varchar(100) NOT NULL,
	`dueDate` varchar(100) NOT NULL,
	`returnDate` varchar(100),
	`Status` varchar(100) NOT NULL,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;