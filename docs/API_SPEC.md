# API Specification

## 1. Conventions

- Base path through Gateway: `https://<host>/api`
- All request/response bodies: `application/json`, UTF-8.
- Versioning: URI-based, e.g. `/api/v1/...`. All endpoints below are implicitly `v1` (prefix omitted here for brevity, but MUST be present in implementation — see `DECISIONS.md` A-11).
- Pagination query params: `page` (0-indexed, default 0), `size` (default 20, max 100), `sort` (e.g. `publishedAt,desc`).
- Dates: ISO-8601 UTC (`2026-07-29T10:15:00Z`).
- Auth: `Authorization: Bearer <jwt>` header on protected endpoints.

## 2. Standard Response Envelope

### Success (list)

```json
{
  "content": [ /* array of resource DTOs */ ],
  "page": 0,
  "size": 20,
  "totalElements": 134,
  "totalPages": 7
}

```

### Success (single resource)

Returns the resource DTO directly (no envelope wrapper) with the appropriate 2xx status.

### Error Format

```json
{
  "timestamp": "2026-07-29T10:15:00Z",
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Article not found",
  "path": "/api/articles/999"
}

```

Validation errors additionally include a `fieldErrors` array of `{ "field": "...", "message": "..." }`.

## 3. Standard HTTP Status Codes


| Code | Usage                                                        |
| ---- | ------------------------------------------------------------ |
| 200  | Successful GET/PUT                                           |
| 201  | Successful POST creating a resource (with `Location` header) |
| 204  | Successful DELETE / action with no body                      |
| 400  | Validation error / malformed request                         |
| 401  | Missing/invalid/expired JWT                                  |
| 403  | Valid JWT but insufficient role                              |
| 404  | Resource not found                                           |
| 409  | Conflict (e.g., duplicate email, duplicate article hash)     |
| 429  | Rate limit exceeded                                          |
| 500  | Unhandled server error                                       |
| 503  | Downstream dependency unavailable (circuit breaker open)     |


## 4. Public Endpoints

### 4.1 News Service

`GET /api/news` List all articles, paginated. Query: `page`, `size`, `sort`

`GET /api/news/latest` Latest articles across all categories. Query: `page`, `size`

`GET /api/news/trending` Trending articles (see `DECISIONS.md` A-12 for trending algorithm definition). Query: `page`, `size`

`GET /api/news/category/{slug}` Articles in a given category. Path: `slug` — category slug Query: `page`, `size`, `sort` Errors: 404 if slug unknown.

`GET /api/articles/{id}` Single article detail, including `relatedArticles` (see `PROJECT_REQUIREMENTS.md` A-3). Response DTO:

```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "content": "string",
  "image": "url",
  "url": "url",
  "author": "string",
  "category": { "id": 1, "title": "Technology", "slug": "technology" },
  "source": { "id": 1, "name": "NewsAPI" },
  "publishedAt": "2026-07-29T10:15:00Z",
  "relatedArticles": [ /* array of summary DTOs, max 5 */ ]
}

```

Errors: 404 if not found.

### 4.2 Search Service

`GET /api/news/search` Query: `q` (required, keyword), `category` (slug, optional), `source` (source name, optional), `author` (optional), `dateFrom`, `dateTo` (ISO date, optional), `page`, `size`, `sort` Errors: 400 if `q` missing or blank.

### 4.3 Category Service

`GET /api/categories` List all active categories (no pagination — bounded set).

`GET /api/categories/{slug}` Single category detail. Errors: 404.

### 4.4 Auth Service

`POST /api/auth/register` Body: `{ "name": "string", "email": "string", "password": "string" }` Response: 201, `{ "id": 1, "name": "...", "email": "...", "role": "ROLE_USER" }` Errors: 400 (validation), 409 (email exists).

`POST /api/auth/login` Body: `{ "email": "string", "password": "string" }` Response: 200, `{ "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }` Errors: 401 (bad credentials).

`POST /api/auth/refresh` Body: `{ "refreshToken": "string" }` Response: 200, `{ "accessToken": "...", "expiresIn": 900 }` Errors: 401 (expired/revoked).

`POST /api/auth/logout` Body: `{ "refreshToken": "string" }` Response: 204 (revokes the refresh token).

## 5. Admin Endpoints (require `ROLE_ADMIN`)

`GET /api/admin/sources` — list sources `POST /api/admin/sources` — create source. Body: `{ "provider", "name", "apiKey", "endpoint" }`. Response 201. `PUT /api/admin/sources/{id}` — update source `DELETE /api/admin/sources/{id}` — deactivate source (soft delete: sets `status = DISABLED`, does not hard-delete)

`GET /api/admin/categories` / `POST /api/admin/categories` / `PUT /api/admin/categories/{id}` — category CRUD (proxied to category-service)

`GET /api/admin/users` — list users `PUT /api/admin/users/{id}/role` — update user role. Body: `{ "role": "ROLE_ADMIN" }`

`POST /api/admin/fetch` Manually trigger ingestion. Optional body: `{ "sourceId": 1 }` to target one source, otherwise all active sources. Response: 202 Accepted, `{ "triggered": true, "jobId": "uuid" }` (fire-and-forget; job status is visible via fetch logs, not polled synchronously — see `QUEUE_WORKFLOW.md`).

`POST /api/admin/cache/clear` Optional body: `{ "scope": "ALL" | "CATEGORY" | "TRENDING" | "SEARCH", "categorySlug": "string" }` (default scope `ALL`). Response: 204.

`GET /api/admin/logs` Query: `page`, `size`, `status` (optional filter) Proxies to News Service's internal fetch-logs read endpoint.

`GET /api/admin/health` Aggregated health status of all services (calls each service's `/actuator/health` — see `SERVICES.md` §Admin Service).

## 6. Internal Endpoints (Service-to-Service Only, Not Gateway-Routed)

These are not exposed through the Gateway and must reject requests without a valid internal service-to-service credential (see `SECURITY.md` §Internal Service Auth).

`GET /internal/articles/search` (news-service) — used by search-service, per `ARCHITECTURE.md` §6. `GET /internal/fetch-logs` (news-service) — used by admin-service. `POST /internal/articles/ingest` (news-service) — used by scheduler-service to submit a batch of validated articles. `GET /internal/categories/valid-ids` (category-service) — used by news-service to validate `category_id` (`DATABASE_SCHEMA.md` §7).

`GET /api/scheduler/search` (scheduler-service) — used by news-service verification layer. Requires `Internal-Api-Key` header.
Query parameters:
- `q` *(required)* — keyword search query, URL-encoded.
- `domains` *(optional)* — comma-separated list of bare domain names (no protocol, no path) to restrict results to specific outlets, e.g. `domains=bbc.com,reuters.com`. **Provider support:** NewsAPI honours this parameter (maps to `/v2/everything?domains=`). GNews and Mediastack do not support domain filtering on their search APIs (as of this implementation) and return unfiltered results for those parameters without error. GuardianProvider is self-scoped and ignores this parameter. Callers should not assume all providers honour `domains`; it is a best-effort restriction.

## 7. OpenAPI/Swagger

Every service exposes its own OpenAPI spec at `/v3/api-docs` and Swagger UI at `/swagger-ui.html`. The Gateway aggregates these under `/api-docs/{service}` for a unified developer portal (see `SERVICES.md` §Gateway). This document is the human-readable source of truth; the generated OpenAPI spec must not diverge from it — if implementation requires a divergence, update this file first.