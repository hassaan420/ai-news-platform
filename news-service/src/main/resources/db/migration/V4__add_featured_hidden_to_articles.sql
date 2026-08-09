-- Flyway V4 migration for news_db schema
-- Adds featured and hidden flags to articles table

ALTER TABLE `articles` 
ADD COLUMN `featured` BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN `hidden` BOOLEAN NOT NULL DEFAULT FALSE;
