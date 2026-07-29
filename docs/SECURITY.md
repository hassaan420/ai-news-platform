# Security

## 1. Authentication

- JWT-based, issued by `auth-service` only.
- **Access token:** 15-minute expiry (Assumption A-24), signed HS256 with a shared signing secret (Assumption A-25 — HS256 with a strong shared secret is used in Phase 1 for simplicity; RS256 with asymmetric keys is the recommended upgrade if the Gateway and services ever run in separately-trusted environments — see `DECISIONS.md` A-25).
- **Refresh token:** 7-day expiry (Assumption A-26), opaque random string (not a JWT), stored hashed in `auth_db.refresh_tokens`, single-use rotation on refresh (issuing a refresh returns a new refresh token and revokes the old one).
- JWT claims: `sub` (user id), `email`, `role`, `iat`, `exp`. No sensitive data (password, full profile) in claims.

## 2. Authorization

- Enforced at two layers (defense in depth, `PROJECT_REQUIREMENTS.md` NFR-4):
  1. **Gateway:** verifies JWT signature and expiry for any route not explicitly marked public in the route config; rejects invalid/missing tokens with 401 before forwarding.
  2. **Downstream service:** Spring Security method/endpoint security (`@PreAuthorize("hasRole('ADMIN')")` or equivalent `SecurityFilterChain` matcher rules) re-validates the JWT and checks role claims independently. A service must never trust the Gateway alone — every service parses and validates the JWT itself.
- Public (no-auth) endpoints are explicitly whitelisted per service (see `API_SPEC.md` §4 for the full public list); everything else defaults to "authenticated required," and `/api/admin/`** defaults to "`ROLE_ADMIN` required."

## 3. Internal Service-to-Service Auth

Internal endpoints (`API_SPEC.md` §6, path prefix `/internal/**`) are not reachable through the Gateway (Gateway routing config excludes `/internal/**` entirely) and additionally require a shared internal API key/header (`X-Internal-Api-Key`) validated by each service's `SecurityFilterChain`, distinct from the user-facing JWT. This prevents any externally-obtained user JWT from being used to reach internal endpoints even if a `/internal/**` route were accidentally exposed.

## 4. Secrets Management

- No secrets committed to the repository under any circumstance: DB passwords, JWT signing secret, News Provider API keys, Docker Hub credentials, deploy SSH keys.
- Local/dev: `.env` file (gitignored), loaded by Docker Compose.
- CI/CD: GitHub Actions encrypted secrets (`DEPLOYMENT.md` §7).
- Production host: `.env` file with restricted file permissions (`chmod 600`, owned by the deploy user), or a secret manager if the deploy target provides one (not assumed present in Phase 1 — plain `.env` on the host is the baseline, Assumption A-27).
- `.env.example` documents every required variable name with a placeholder/dummy value, never a real one.

## 5. Encryption

- **In transit:** TLS terminated at Nginx (cert managed via Let's Encrypt/Certbot — exact automation is a deployment-host concern, not part of this documentation set's Phase 1 scope beyond noting it is required, Assumption A-28). Internal Docker-network traffic (Gateway ↔ services) is plaintext HTTP within the trusted Compose network in Phase 1 (Assumption A-29 — acceptable because the Compose network is not exposed to the host network beyond Nginx; mTLS between services is a documented future hardening step, not built now).
- **At rest:** `sources.api_key` is encrypted at the application layer before persistence (e.g., AES-256-GCM via Spring's `Converter`/`AttributeConverter` on the JPA entity field, with the encryption key supplied via environment variable, never derived from a hardcoded value) — see `DATABASE_SCHEMA.md` §4.1. User passwords are BCrypt-hashed (never encrypted/reversible), strength 12.

## 6. Input Validation & Sanitization

- Every inbound DTO uses Jakarta Bean Validation annotations (`@NotBlank`, `@Email`, `@Size`, `@Pattern`, etc.) enforced via `@Valid` in controllers.
- Validation failures return `400` with the `fieldErrors` array format (`API_SPEC.md` §2).
- All article `content`/`description` fields sourced from external providers are HTML-sanitized before storage (strip script tags and inline event handlers) to prevent stored XSS when rendered in the frontend, since this data ultimately comes from third-party sources.
- Frontend renders article HTML/content via a sanitizing renderer as well (defense in depth) — never `dangerouslySetInnerHTML` (React) without sanitization.

## 7. Rate Limiting

- Gateway applies a per-client rate limit (Assumption A-30: 100 requests/minute per IP for anonymous traffic, 300 requests/minute per authenticated user, both configurable) using Spring Cloud Gateway's `RequestRateLimiter` filter backed by Redis.
- Exceeding the limit returns `429` with a `Retry-After` header.
- Admin endpoints additionally have a stricter limit given their sensitivity (Assumption A-31: 30 requests/minute).

## 8. Common Web Vulnerability Mitigations


| Threat                     | Mitigation                                                                                                                                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SQL Injection              | JPA/Hibernate parameterized queries exclusively; no string-concatenated JPQL/native queries.                                                                                                                                              |
| XSS                        | Input sanitization (§6) + React's default escaping + CSP header set by Nginx.                                                                                                                                                             |
| CSRF                       | Not applicable to the stateless JWT/Bearer-token API model (no cookie-based session auth) — CSRF protection is disabled at the Spring Security level for the API but must never be disabled if any cookie-based auth is introduced later. |
| Broken Auth                | JWT expiry + refresh rotation (§1), BCrypt hashing, account lockout after repeated failed logins (Assumption A-32: 5 attempts, 15-minute lockout).                                                                                        |
| Sensitive Data Exposure    | Encryption at rest for API keys (§5), no secrets in logs (see `CODING_RULES.md` §Logging — never log full request/response bodies containing credentials).                                                                                |
| Security Misconfiguration  | Actuator endpoints beyond `/health` and `/info` are restricted to internal network / require `ROLE_ADMIN` in `prod` profile (never publicly exposed).                                                                                     |
| Dependency Vulnerabilities | Dependabot (or equivalent) enabled on the repository; CI includes a dependency vulnerability scan step (Assumption A-33).                                                                                                                 |


## 9. CORS

Gateway (not individual services) owns CORS configuration, restricted to the known frontend origin(s) per environment (configured via `application-{profile}.yml`, never `*` in `prod`).

## 10. Audit Logging

Admin actions (source create/update/delete, category CRUD, manual fetch trigger, cache clear, user role change) are logged with actor (user id from JWT), action, target, and timestamp at `INFO` level in `admin-service`'s structured logs. A dedicated audit table is not built in Phase 1 (Assumption A-34) — log-based audit trail is sufficient for this phase; revisit if compliance requirements emerge.