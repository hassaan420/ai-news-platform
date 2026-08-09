-- V2__ai_intelligence_schema.sql
-- Part 11: AI Intelligence Layer Tables

-- Alter Articles table to add summary and sentiment
ALTER TABLE articles
ADD COLUMN summary TEXT NULL,
ADD COLUMN sentiment VARCHAR(20) NULL,
ADD COLUMN sentiment_score DOUBLE NULL;

-- 1. Article Keywords (Many-to-Many)
CREATE TABLE article_keywords (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT UNSIGNED NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    CONSTRAINT fk_keyword_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_article_id (article_id),
    INDEX idx_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Article Tags (Many-to-Many)
CREATE TABLE article_tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT UNSIGNED NOT NULL,
    tag VARCHAR(100) NOT NULL,
    CONSTRAINT fk_tag_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_article_id (article_id),
    INDEX idx_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Article Stats (Trending Engine)
CREATE TABLE article_stats (
    article_id BIGINT UNSIGNED PRIMARY KEY,
    views INT NOT NULL DEFAULT 0,
    bookmarks INT NOT NULL DEFAULT 0,
    trending_score DOUBLE NOT NULL DEFAULT 0.0,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stats_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_trending_score (trending_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. User Reading History (Personalization)
CREATE TABLE user_reading_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL, -- UUID from auth service
    article_id BIGINT UNSIGNED NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_read_at (read_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AI Processing Queue (Async tasks)
CREATE TABLE ai_processing_queue (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    task_type VARCHAR(50) NOT NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_queue_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_article_id (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
