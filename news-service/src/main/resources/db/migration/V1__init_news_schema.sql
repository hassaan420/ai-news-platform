CREATE TABLE sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NULL,
    endpoint VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider (provider),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(1000) NULL,
    content TEXT NULL,
    image VARCHAR(1000) NULL,
    url VARCHAR(1000) NOT NULL,
    author VARCHAR(200) NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    published_at TIMESTAMP NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_articles_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_source_id (source_id),
    INDEX idx_published_at (published_at),
    FULLTEXT idx_ft_title_desc_content (title, description, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fetch_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(20) NOT NULL,
    articles_fetched INT NOT NULL DEFAULT 0,
    articles_stored INT NOT NULL DEFAULT 0,
    duplicates_skipped INT NOT NULL DEFAULT 0,
    error_message VARCHAR(2000) NULL,
    fetched_at TIMESTAMP NOT NULL,
    execution_time_ms INT NOT NULL,
    CONSTRAINT fk_fetchlogs_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
    INDEX idx_source_id (source_id),
    INDEX idx_fetched_at (fetched_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
