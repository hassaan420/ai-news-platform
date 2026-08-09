-- Seed a permanent admin user
INSERT INTO users (name, email, password, role, enabled, created_at, updated_at) 
VALUES ('System Admin', 'admin@newsplatform.com', '$2a$12$C1wQJLwnl5frA8KGpRCEserti.TDwX3FyQJ0DZXqUaXzbNAuj4.my', 'ROLE_ADMIN', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
