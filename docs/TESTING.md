# Testing Strategy

## 1. Test Levels


| Level       | Tooling                                                                                  | Scope                                                                                     | Runs In                                           |
| ----------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Unit        | JUnit 5, Mockito                                                                         | Single class in isolation (service logic, mappers, utilities); all dependencies mocked    | Every build, every PR                             |
| Integration | JUnit 5, Spring Boot Test, Testcontainers (MySQL, Redis)                                 | A service's full stack (controller → service → repository → real DB/cache in a container) | Every build, every PR                             |
| Contract    | Spring Cloud Contract or hand-written Feign-client tests against WireMock stubs          | Inter-service OpenFeign clients against the documented `API_SPEC.md` contract             | Every build, every PR                             |
| End-to-End  | Postman/Newman collection or REST-assured suite against a full `docker compose up` stack | Critical user journeys across the whole platform                                          | Nightly / pre-release, not on every PR (too slow) |


## 2. Coverage Expectations

- Minimum 80% line coverage on `service` and `mapper` packages per service (Assumption A-35). Controllers and repositories are covered primarily via integration tests, not unit-test line-coverage targets.
- Coverage is measured via JaCoCo; CI fails the build if a service's `service`/`mapper` package coverage drops below the threshold on a PR (not an absolute gate on the whole repo at once — new/changed code is what's enforced, per-service).
- 100% of documented `API_SPEC.md` endpoints must have at least one integration test asserting the documented success response shape and at least one asserting a documented error case (`PROJECT_REQUIREMENTS.md` §6 Acceptance Criteria item 1).

## 3. What Must Be Unit Tested (Every Service)

- Every `@Service` class's public methods, including edge cases (empty results, null-safe handling, validation failures).
- `IngestionPipelineService` (news-service): duplicate detection, category validation fallback, cache eviction is triggered.
- `NewsProvider` implementations (scheduler-service): response-mapping logic per provider, tested against a fixture of a real (anonymized/truncated) sample response per provider, not the live API.
- `JwtTokenProvider` (auth-service): issuance, expiry, signature validation, tampering rejection.
- `DuplicateDetectionService`: hash computation determinism and normalization rules (`DATABASE_SCHEMA.md` §6).
- `SlugGenerator` (category-service): collision handling.

## 4. What Must Be Integration Tested (Every Service)

- Full controller → DB round trip for every endpoint in `API_SPEC.md` owned by that service, using Testcontainers-backed MySQL (never H2 — H2's SQL dialect diverges from MySQL and has caused false-positive test passes historically; this is a hard rule, see `CODING_RULES.md` §Testing Conventions).
- Redis-backed caching behavior: cache populated on first read, subsequent read served from cache (assert via cache-hit inspection or mock-boundary verification), eviction on the relevant write operation.
- Security: protected endpoints reject missing/invalid JWT with 401; role-protected endpoints reject insufficient role with 403.
- Global exception handler: at least one test per service asserting the standard error envelope (`API_SPEC.md` §2) is returned for a validation failure and a not-found case.

## 5. External API Testing

Scheduler-service's calls to real external News Provider APIs are **never** called in automated tests (cost, rate limits, non-determinism, and network dependency in CI). All provider integration tests use WireMock stubs seeded with fixture responses captured once and checked into `src/test/resources/fixtures/{provider}/`. A separate, manually-triggered "smoke test" script (not part of CI) may hit the real APIs for pre-release sanity checking — documented but not automated (Assumption A-36).

## 6. Test Data

- Integration tests use Testcontainers with schema migrations (Flyway) applied fresh per test class/suite, then seeded with minimal fixture data via `@Sql` scripts or a test data builder utility — never relying on production data.
- No test may depend on execution order or leftover state from another test (each test class's Testcontainers instance is isolated per the chosen Testcontainers lifecycle strategy — `@Testcontainers` with `@Container` static reuse is acceptable for speed as long as each test cleans up its own rows, e.g. via `@Transactional` rollback or explicit teardown).

## 7. CI Enforcement

See `DEPLOYMENT.md` §1 Jobs 2–3. A PR cannot be merged (branch protection, `DEPLOYMENT.md` §8) unless unit and integration tests pass and coverage thresholds (§2) are met.

## 8. Manual/Exploratory Testing

Not a substitute for automated coverage, but required before any `prod` deployment approval (`DEPLOYMENT.md` §4 manual approval gate): a human verifies the critical path (register → login → browse → search → article detail → admin fetch trigger → admin cache clear) against the `dev`/staging environment.