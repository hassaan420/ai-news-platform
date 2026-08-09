-- Flyway V2 migration for admin_db schema
-- Adds audit_logs and error_logs tables

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `actor` VARCHAR(190) NOT NULL,
    `action_type` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_audit_actor` (`actor`),
    INDEX `idx_audit_action` (`action_type`),
    INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
    INDEX `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `error_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `service_name` VARCHAR(100) NOT NULL,
    `severity` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `stack_trace` TEXT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_error_service` (`service_name`),
    INDEX `idx_error_severity` (`severity`),
    INDEX `idx_error_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
