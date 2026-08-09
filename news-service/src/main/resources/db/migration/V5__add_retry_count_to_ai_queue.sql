ALTER TABLE ai_processing_queue
ADD COLUMN retry_count INT NOT NULL DEFAULT 0;
