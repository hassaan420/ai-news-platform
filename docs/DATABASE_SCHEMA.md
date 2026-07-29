# Database Schema

## 1. Databases

Per `ARCHITECTURE.md` §3.2, one logical MySQL schema per owning service:


| Schema        | Owning Service                                             |
| ------------- | ---------------------------------------------------------- |
| `auth_db`     | auth-service                                               |
| `news_db`     | news-service (and scheduler-service for `fetch_logs` only) |
| `category_db` | category-service                                           |
| `admin_db`    | admin-service                                              |


`search-service` and `gateway-service` own no schema.

All tables use `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` unless noted. All tables include `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` and `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` audit columns unless noted. Engine: InnoDB. Charset: `utf8mb4`, collation `utf8mb4_unicode_ci`.

## 2. `auth_db`

### 2.1 `users`


| Column     | Type            | Constraints                     |
| ---------- | --------------- | ------------------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT              |
| name       | VARCHAR(120)    | NOT NULL                        |
| email      | VARCHAR(190)    | NOT NULL, UNIQUE                |
| password   | VARCHAR(255)    | NOT NULL (BCrypt hash)          |
| role       | VARCHAR(30)     | NOT NULL, DEFAULT `'ROLE_USER'` |
| enabled    | BOOLEAN         | NOT NULL, DEFAULT TRUE          |
| created_at | TIMESTAMP       |                                 |
| updated_at | TIMESTAMP       |                                 |


Indexes: UNIQUE(`email`).

### 2.2 `refresh_tokens`


| Column     | Type            | Constraints               |
| ---------- | --------------- | ------------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT        |
| user_id    | BIGINT UNSIGNED | NOT NULL, FK → `users.id` |
| token      | VARCHAR(255)    | NOT NULL, UNIQUE          |
| expires_at | TIMESTAMP       | NOT NULL                  |
| revoked    | BOOLEAN         | NOT NULL, DEFAULT FALSE   |
| created_at | TIMESTAMP       |                           |


Indexes: UNIQUE(`token`), INDEX(`user_id`).

## 3. `category_db`

### 3.1 `categories`


| Column     | Type            | Constraints                       |
| ---------- | --------------- | --------------------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT                |
| title      | VARCHAR(80)     | NOT NULL, UNIQUE                  |
| slug       | VARCHAR(100)    | NOT NULL, UNIQUE                  |
| icon       | VARCHAR(100)    | NULL (icon identifier/class name) |
| active     | BOOLEAN         | NOT NULL, DEFAULT TRUE            |
| created_at | TIMESTAMP       |                                   |
| updated_at | TIMESTAMP       |                                   |


Indexes: UNIQUE(`slug`), UNIQUE(`title`).

Seed data: the 13 categories listed in `PROJECT_REQUIREMENTS.md` §2.2 must be seeded via a Flyway/Liquibase migration (see `CODING_RULES.md` §Migrations), not created ad hoc at runtime.

## 4. `news_db`

### 4.1 `sources`


| Column     | Type            | Constraints                                                                |
| ---------- | --------------- | -------------------------------------------------------------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT                                                         |
| provider   | VARCHAR(50)     | NOT NULL (e.g. `NEWSAPI`, `GNEWS`, `MEDIASTACK`, `GUARDIAN`, `GOOGLE_RSS`) |
| name       | VARCHAR(100)    | NOT NULL                                                                   |
| api_key    | VARCHAR(255)    | NULL (encrypted at rest — see `SECURITY.md` §Encryption at Rest)           |
| endpoint   | VARCHAR(500)    | NOT NULL                                                                   |
| status     | VARCHAR(20)     | NOT NULL, DEFAULT `'ACTIVE'` (`ACTIVE`, `DISABLED`, `RATE_LIMITED`)        |
| created_at | TIMESTAMP       |                                                                            |
| updated_at | TIMESTAMP       |                                                                            |


Indexes: INDEX(`provider`), INDEX(`status`).

### 4.2 `articles`


| Column       | Type            | Constraints                                                                                                     |
| ------------ | --------------- | --------------------------------------------------------------------------------------------------------------- |
| id           | BIGINT UNSIGNED | PK, AUTO_INCREMENT                                                                                              |
| source_id    | BIGINT UNSIGNED | NOT NULL, FK → `sources.id`                                                                                     |
| category_id  | BIGINT UNSIGNED | NOT NULL (logical FK to `category_db.categories.id` — cross-schema, enforced at application layer only, see §7) |
| title        | VARCHAR(500)    | NOT NULL                                                                                                        |
| description  | VARCHAR(1000)   | NULL                                                                                                            |
| content      | TEXT            | NULL                                                                                                            |
| image        | VARCHAR(1000)   | NULL (image URL)                                                                                                |
| url          | VARCHAR(1000)   | NOT NULL (canonical source URL)                                                                                 |
| author       | VARCHAR(200)    | NULL                                                                                                            |
| language     | VARCHAR(10)     | NOT NULL, DEFAULT `'en'`                                                                                        |
| published_at | TIMESTAMP       | NOT NULL                                                                                                        |
| hash         | CHAR(64)        | NOT NULL, UNIQUE (SHA-256 of normalized title + url — see §6)                                                   |
| created_at   | TIMESTAMP       |                                                                                                                 |
| updated_at   | TIMESTAMP       |                                                                                                                 |


Indexes: UNIQUE(`hash`), INDEX(`category_id`), INDEX(`source_id`), INDEX(`published_at`), FULLTEXT(`title`, `description`, `content`) for Search Service (Assumption A-5).

### 4.3 `fetch_logs`

Owned/written by scheduler-service; read by news-service's internal endpoint (`ARCHITECTURE.md` §3.3).


| Column             | Type            | Constraints                               |
| ------------------ | --------------- | ----------------------------------------- |
| id                 | BIGINT UNSIGNED | PK, AUTO_INCREMENT                        |
| source_id          | BIGINT UNSIGNED | NOT NULL, FK → `sources.id`               |
| status             | VARCHAR(20)     | NOT NULL (`SUCCESS`, `FAILED`, `PARTIAL`) |
| articles_fetched   | INT             | NOT NULL, DEFAULT 0                       |
| articles_stored    | INT             | NOT NULL, DEFAULT 0                       |
| duplicates_skipped | INT             | NOT NULL, DEFAULT 0                       |
| error_message      | VARCHAR(2000)   | NULL                                      |
| fetched_at         | TIMESTAMP       | NOT NULL                                  |
| execution_time_ms  | INT             | NOT NULL                                  |


Indexes: INDEX(`source_id`), INDEX(`fetched_at`), INDEX(`status`).

## 5. `admin_db`

### 5.1 `settings`


| Column        | Type            | Constraints        |
| ------------- | --------------- | ------------------ |
| id            | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| setting_key   | VARCHAR(150)    | NOT NULL, UNIQUE   |
| setting_value | VARCHAR(2000)   | NULL               |
| created_at    | TIMESTAMP       |                    |
| updated_at    | TIMESTAMP       |                    |


Indexes: UNIQUE(`setting_key`).

Admin Service does not duplicate `users`, `sources`, or `categories` data — it orchestrates calls to `auth-service`, `news-service`, and `category-service` for those (see `SERVICES.md` §Admin Service). `settings` holds only admin-service-local configuration (e.g., dashboard preferences, cache-clear confirmation thresholds).

## 6. Duplicate Detection Rule (Resolves FR-4)

`hash = SHA-256(lowercase(trim(title)) + '|' + normalized(url))`, where `normalized(url)` strips query strings and trailing slashes. Computed in News Service's ingestion pipeline before insert; insert is rejected (and logged as a duplicate in `fetch_logs.duplicates_skipped`) on unique-constraint violation of `articles.hash`. This is an application-level check-then-insert with a DB-level unique constraint as the authoritative guard against race conditions.

## 7. Cross-Schema Reference Policy

`articles.category_id` and `sources` references from other services are **logical foreign keys only** — no physical `FOREIGN KEY` constraint crosses a schema/service boundary (this would violate service independence, `ARCHITECTURE.md` §3.1). Referential integrity for `category_id` is enforced at the application layer: News Service validates a `category_id` by calling Category Service (`GET /api/categories/{id}`) at article-creation time and caches the valid category ID set locally (Redis, short TTL) to avoid a network call per article during bulk ingestion.

## 8. Migrations

All schema changes must be expressed as versioned migration scripts (Flyway recommended — see `CODING_RULES.md` §Migrations). No `ddl-auto: update` in `test` or `prod` profiles. `ddl-auto: validate` only outside `dev`.

## 9. ER Diagram (Logical, Cross-Service)

```
users (auth_db)              categories (category_db)
  │ 1                              │ 1 (logical, app-enforced)
  │                                │
  │ N                              │ N
  └──(no direct FK)──►             articles (news_db) ◄──── sources (news_db) 1─N
                                        │ 1
                                        │
                                        │ N
                                   fetch_logs (news_db, source_id FK → sources.id)

```

