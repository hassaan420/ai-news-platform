# Contributing

## 1. Branching Model

- `main` — always deployable; protected (see `DEPLOYMENT.md` §8).
- Feature branches: `feature/{service}-{short-description}` (e.g. `feature/news-service-duplicate-detection`).
- Bugfix branches: `fix/{service}-{short-description}`.
- One logical change per branch/PR — do not mix unrelated services or concerns in a single PR unless the change is genuinely cross-cutting (e.g., an `API_SPEC.md` update touching two services' contracts).

## 2. Commit Messages

Conventional Commits format (Assumption A-41):

```
{type}({scope}): {short summary}

{optional body}

```

`type` ∈ {`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`}. `scope` = affected service or doc area (e.g. `news-service`, `docs`, `gateway`). Example: `feat(news-service): implement duplicate detection via content hash`.

## 3. Pull Request Requirements

Before requesting review, a PR must:

1. Pass all CI checks (`DEPLOYMENT.md` §1 Jobs 1–3).
2. Include or update tests per `TESTING.md` for any behavior change.
3. Update the relevant documentation file(s) in this set if the change affects a documented contract (API shape, schema, architecture, cache key, etc.) — **a code change that contradicts an existing doc without updating that doc is treated as an incomplete PR.**
4. Include a clear description of what changed and why, referencing the relevant `PROJECT_REQUIREMENTS.md` FR/NFR ID(s) where applicable.

## 4. Documentation-First Rule

For any change that alters scope, an API contract, the schema, or an architectural decision: **update the relevant** `.md` **file(s) in the same PR as the code**, or in a preceding PR. Code and documentation must never be allowed to drift — this is the entire purpose of this documentation set (`README.md` §5).

## 5. Adding a New News Provider (Worked Example)

Because this is the primary designed extension point (`ARCHITECTURE.md` §7):

1. Add a new `NewsProvider` implementation in `scheduler-service` (per `SERVICES.md` §6).
2. Register it in `NewsProviderFactory`.
3. Add its rate-limit config block to `application.yml` (`QUEUE_WORKFLOW.md` §4).
4. Add a fixture-based unit test for its response-mapping logic (`TESTING.md` §3, §5).
5. Add the provider's enum value to `DATABASE_SCHEMA.md` §4.1 documentation and to any validation enum in code.
6. No other service requires changes. If a change outside `scheduler-service` seems necessary, stop and reconsider — it likely indicates the `NewsProvider` abstraction was violated somewhere and needs to be fixed, not worked around.

## 6. Versioning & Releases

Semantic Versioning (`MAJOR.MINOR.PATCH`), tags on `main` trigger a GitHub Release with an auto-generated changelog from Conventional Commit messages (`DEPLOYMENT.md` §2).

## 7. Code Review Expectations

- At least one approval required before merge (repository setting, enforced alongside `DEPLOYMENT.md` §8 required status checks).
- Reviewers check: adherence to `CODING_RULES.md` layering rules, test coverage of new logic, documentation updated where required (§4 above), no scope creep beyond the PR's stated purpose (`CODING_RULES.md` §12 No Speculative Generality applies to review, too).

## 8. Local Development Setup

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in local values (dummy News Provider API keys are fine for `dev` — provider calls can be pointed at WireMock fixtures locally if desired, see `TESTING.md` §5).
3. `docker compose up -d` (picks up `docker-compose.override.yml` automatically for `dev` profile, hot reload, exposed ports).
4. Access the platform via `http://localhost` (Nginx) or individual services directly on their exposed dev ports.
5. Swagger UI per service: `http://localhost:{port}/swagger-ui.html`.

