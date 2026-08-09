-- Flyway V2 migration for auth_db schema
-- Adds deleted flag to users table

ALTER TABLE `users` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT FALSE;
