-- MySQL init script: create per-service databases and grant privileges
-- Runs once on first container start (mounted into /docker-entrypoint-initdb.d/)

CREATE DATABASE IF NOT EXISTS `auth_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `news_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `category_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `admin_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Grant full privileges on each schema to the application user
GRANT ALL PRIVILEGES ON `auth_db`.* TO 'newsplatform'@'%';
GRANT ALL PRIVILEGES ON `news_db`.* TO 'newsplatform'@'%';
GRANT ALL PRIVILEGES ON `category_db`.* TO 'newsplatform'@'%';
GRANT ALL PRIVILEGES ON `admin_db`.* TO 'newsplatform'@'%';

FLUSH PRIVILEGES;
