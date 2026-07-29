# Deployment & CI/CD

## 1. Pipeline Overview (GitHub Actions)

```
Developer pushes / opens PR
        │
        ▼
GitHub Actions workflow triggers (.github/workflows/ci.yml)
        │
        ▼
Job 1: Lint & Static Analysis
   - Checkstyle / Spotless (see CODING_RULES.md §Formatting)
        │
        ▼
Job 2: Unit Tests (per module, JUnit 5 + Mockito)
        │
        ▼
Job 3: Integration Tests (Testcontainers: MySQL, Redis — see TESTING.md)
        │
        ▼
Job 4 (main branch only): Build Spring Boot JARs (mvn clean package)
        │
        ▼
Job 5 (main branch only): Build Docker images (one per service, DOCKER.md §2)
        │
        ▼
Job 6 (main branch only): Push images to Docker Hub, tagged :<git-sha> and :latest
        │
        ▼
Job 7 (main branch only, manual approval gate for prod — see §4): Deploy via
   docker compose pull && docker compose up -d on the target host
        │
        ▼
Job 8: Post-deploy health check (poll /actuator/health on every service, timeout 3 min)
        │
        ▼
   Success → mark deployment green
   Failure → auto-rollback (redeploy previous :<git-sha> tag), alert

```

## 2. Branching & Trigger Model

- Feature branches / PRs → Jobs 1–3 only (fast feedback, no deploy).
- Merge to `main` → full pipeline, Jobs 1–8.
- Tags (`v*.*.*`) → same as `main` plus a GitHub Release created with changelog (see `CONTRIBUTING.md` §Versioning).

## 3. Environments


| Environment | Trigger                                      | Spring Profile | Notes                                                                                                                         |
| ----------- | -------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `dev`       | local `docker compose up` with override file | `dev`          | DevTools hot reload, exposed ports, verbose logging                                                                           |
| `test` (CI) | every PR and push                            | `test`         | Testcontainers-backed, ephemeral, torn down after run                                                                         |
| `prod`      | merge to `main` (after approval gate)        | `prod`         | Deployed host, secrets from environment/secret manager, minimal logging (INFO), Actuator endpoints restricted (`SECURITY.md`) |


## 4. Deployment Target (Phase 1)

Single Docker Compose host (VM or dedicated server) — no Kubernetes in Phase 1 (`ARCHITECTURE.md` §10). Deployment is performed by the CI runner via SSH to the target host, running `docker compose pull && docker compose up -d` against the already-committed `docker-compose.yml`, with the `.env` file managed on the host (not in CI) or injected via the CI platform's secret store into a generated `.env` at deploy time (see `SECURITY.md` §Secrets Management — exact mechanism, GitHub Environments + `secrets.*` context, is the assumed approach: `DECISIONS.md` A-22).

A manual approval gate (GitHub Environments "required reviewers") protects the `prod` deployment job so no merge to `main` auto-deploys without a human confirming — this is a deliberate safety measure and must not be removed without a corresponding `DECISIONS.md` entry.

## 5. Health Checks & Auto-Restart

- Post-deploy: CI polls each service's `/actuator/health` (readiness group) for up to 3 minutes; any service not `UP` fails the deployment job.
- Runtime: Docker Compose `restart: unless-stopped` on every service container, combined with the `healthcheck` blocks in `DOCKER.md` §8 — Docker will restart a container whose healthcheck fails repeatedly.
- Rollback: on post-deploy health check failure, the pipeline re-runs `docker compose up -d` pointed at the previous successful `:<git-sha>` tag (stored as a pipeline artifact/variable from the last green run).

## 6. Zero-Downtime Note

Phase 1's single-host Docker Compose model does **not** guarantee zero-downtime deploys (a `docker compose up -d` recreates containers, causing brief unavailability per service during rollout). This is an accepted Phase 1 limitation (Assumption A-23). Blue-green or rolling deployment would require an orchestrator (Kubernetes/Swarm) — explicitly out of scope per `ARCHITECTURE.md` §10.

## 7. Secrets in CI/CD

All secrets (DB password, JWT signing key, News Provider API keys, Docker Hub credentials, deploy-target SSH key) are stored as GitHub Actions encrypted secrets, referenced via `${{ secrets.* }}`, never echoed to logs, never committed to `.env.example` with real values (see `SECURITY.md` §Secrets Management).

## 8. Required Status Checks

`main` branch protection requires: lint, unit tests, integration tests, and successful image build to pass before merge is permitted. This must be configured in repository settings — it is not enforced by the workflow file alone.