# Cache Strategy

## 1. Cache Technology

Redis, single shared instance/cluster for Phase 1 (Assumption A-15 — a single Redis instance is used, keyspace-namespaced per service, rather than one Redis instance per service, to reduce infrastructure overhead; revisit if contention becomes an issue). Accessed via Spring Data Redis + Spring Cache abstraction (`@Cacheable`, `@CacheEvict`, `@CachePut`).

## 2. Keyspace Namespacing

All keys are prefixed by owning service to prevent collisions in the shared instance:

```
news:homepage:latest:page:{page}:size:{size}
news:trending:page:{page}:size:{size}
news:category:{slug}:page:{page}:size:{size}:sort:{sort}
search:query:{md5(normalizedQueryParams)}
category:all
category:{slug}
admin:health:aggregate

```

## 3. Cache Table


| Key Pattern              | Owning Service   | TTL    | Populated By          | Invalidated By                                                                                                                                     |
| ------------------------ | ---------------- | ------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `news:homepage:latest:*` | news-service     | 5 min  | first cache-miss read | new article ingestion (any category)                                                                                                               |
| `news:trending:*`        | news-service     | 10 min | first cache-miss read | new article ingestion; scheduled recompute                                                                                                         |
| `news:category:{slug}:*` | news-service     | 5 min  | first cache-miss read | new article ingestion in that category                                                                                                             |
| `search:query:{hash}`    | search-service   | 3 min  | first cache-miss read | not proactively invalidated — short TTL is the invalidation mechanism (search result staleness of up to 3 min is acceptable — see Assumption A-16) |
| `category:all`           | category-service | 30 min | first cache-miss read | category create/update/delete                                                                                                                      |
| `category:{slug}`        | category-service | 30 min | first cache-miss read | that category's update/delete                                                                                                                      |
| `admin:health:aggregate` | admin-service    | 15 sec | first cache-miss read | TTL-only (health data must stay near-real-time)                                                                                                    |


## 4. Invalidation Rules

- **On article ingestion** (News Service `IngestionPipelineService`, after successful persist): evict `news:homepage:latest:`*, `news:trending:*`, and `news:category:{affectedSlug}:*` for every category that received at least one new article in this ingestion batch. Use Redis key pattern deletion (`SCAN` + `DEL`, never blocking `KEYS *` in production — see §6).
- **On category create/update/delete** (Category Service): evict `category:all` and `category:{slug}` for the affected category.
- **On admin manual cache clear** (`POST /api/admin/cache/clear`): evict by requested scope — `ALL` clears every namespace above; `CATEGORY` clears only `news:category:{slug}:`* for the given slug; `TRENDING` clears `news:trending:*`; `SEARCH` clears all `search:query:*`.
- Cache invalidation is **write-through eviction**, not write-through update — the next read after eviction repopulates the cache (lazy population), keeping cache logic simple and consistent with Spring's `@Cacheable`/`@CacheEvict` model.

## 5. What Is NOT Cached

- Individual article detail (`GET /api/articles/{id}`) is **not cached** in Phase 1 (Assumption A-17 — detail pages are lower-traffic than list views relative to the complexity of invalidating on every field including related-articles recomputation; revisit if traffic data shows otherwise).
- Admin write endpoints are never cached.
- Auth endpoints are never cached.

## 6. Operational Rules

- Never use the blocking `KEYS` command against production Redis. Use `SCAN` with a small `COUNT` for pattern-based eviction.
- Every cached value must be JSON-serializable DTOs, never JPA entities (consistent with `ARCHITECTURE.md` §5 DTO Pattern — also avoids Redis serialization issues with lazy-loaded JPA proxies).
- Cache serialization format: JSON via `GenericJackson2JsonRedisSerializer` (human-readable, debuggable in `redis-cli`).
- All TTLs are externalized to `application.yml` (`cache.ttl.homepage-latest`, etc.), not hardcoded, so they can be tuned per environment without a code change.

## 7. Cache-Aside vs. Read-Through

Phase 1 uses the **cache-aside** pattern uniformly: service checks Redis → on miss, queries MySQL → populates Redis → returns. This is implemented via Spring's `@Cacheable` annotation on the relevant service methods, not a custom read-through Redis proxy.