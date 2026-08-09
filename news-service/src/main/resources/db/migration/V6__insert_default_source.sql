-- Insert real external API sources for the news platform
INSERT INTO sources (id, provider, name, endpoint, status, created_at, updated_at) VALUES 
(1, 'newsapi', 'NewsAPI', 'https://newsapi.org/v2', 'ACTIVE', NOW(), NOW()),
(2, 'gnews', 'GNews', 'https://gnews.io/api/v4', 'ACTIVE', NOW(), NOW()),
(3, 'guardian', 'The Guardian', 'https://content.guardianapis.com', 'ACTIVE', NOW(), NOW()),
(4, 'mediastack', 'Mediastack', 'http://api.mediastack.com/v1', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
