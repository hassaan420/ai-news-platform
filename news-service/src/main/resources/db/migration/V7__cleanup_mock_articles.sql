-- Remove all legacy mock articles fetched under source_id = 1 (Mock API) or that look like mock data
-- This is critical to ensure we don't present mock data alongside real news.

-- Note: We must also clean up relationships (saved_articles, user_reading_history, article_keywords, article_stats, ai_processing_queue)
-- Wait, Flyway uses cascade deletes if we defined them, but just to be safe, we'll manually clean up dependents first.

DELETE FROM user_reading_history WHERE article_id IN (SELECT id FROM articles WHERE title LIKE 'Mock %' OR source_id = 1);
DELETE FROM saved_articles WHERE article_id IN (SELECT id FROM articles WHERE title LIKE 'Mock %' OR source_id = 1);
DELETE FROM article_keywords WHERE article_id IN (SELECT id FROM articles WHERE title LIKE 'Mock %' OR source_id = 1);
DELETE FROM article_tags WHERE article_id IN (SELECT id FROM articles WHERE title LIKE 'Mock %' OR source_id = 1);
DELETE FROM article_stats WHERE article_id IN (SELECT id FROM articles WHERE title LIKE 'Mock %' OR source_id = 1);
DELETE FROM ai_processing_queue WHERE article_id IN (SELECT id FROM articles WHERE title LIKE 'Mock %' OR source_id = 1);

-- Finally, delete the mock articles themselves
DELETE FROM articles WHERE title LIKE 'Mock %' OR source_id = 1;
