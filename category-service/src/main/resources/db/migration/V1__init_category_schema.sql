CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data per PROJECT_REQUIREMENTS.md §2.2
INSERT INTO categories (title, slug, icon, active) VALUES
('Politics', 'politics', NULL, TRUE),
('Sports', 'sports', NULL, TRUE),
('Technology', 'technology', NULL, TRUE),
('Business', 'business', NULL, TRUE),
('Entertainment', 'entertainment', NULL, TRUE),
('Science', 'science', NULL, TRUE),
('Health', 'health', NULL, TRUE),
('World', 'world', NULL, TRUE),
('Education', 'education', NULL, TRUE),
('Lifestyle', 'lifestyle', NULL, TRUE),
('Travel', 'travel', NULL, TRUE),
('Gaming', 'gaming', NULL, TRUE),
('AI', 'ai', NULL, TRUE);
