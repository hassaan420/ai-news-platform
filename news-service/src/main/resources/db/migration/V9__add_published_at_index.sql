-- V8__add_published_at_index.sql
-- Add index on published_at to optimize date-based filtering and sorting

CREATE INDEX idx_articles_published_at ON articles(published_at);
