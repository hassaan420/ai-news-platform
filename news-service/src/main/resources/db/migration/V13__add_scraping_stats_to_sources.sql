ALTER TABLE sources
ADD COLUMN parser_type VARCHAR(50) DEFAULT 'RSS',
ADD COLUMN last_scraped_time DATETIME,
ADD COLUMN last_scrape_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN total_articles_scraped BIGINT DEFAULT 0;
