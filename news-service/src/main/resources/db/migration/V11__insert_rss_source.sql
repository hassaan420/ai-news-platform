-- Insert the regional RSS feed provider for the search/verification pipeline
INSERT INTO sources (id, provider, name, endpoint, status, created_at, updated_at) VALUES 
(5, 'RSS_REGIONAL', 'Regional RSS Feeds', 'https://www.dawn.com/feed,https://tribune.com.pk/feed/home,https://arynews.tv/feed', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
