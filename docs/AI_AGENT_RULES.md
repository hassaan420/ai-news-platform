# AI Agent Rules (Binding — For Cursor AI and Any AI Coding Agent)

These rules override any conflicting inference an AI agent might otherwise make from the source Project Statement or from general training knowledge about "how a Spring Boot microservices project is usually built." When this file conflicts with anything else, this file wins, except that it never authorizes violating `SECURITY.md` or introducing something explicitly marked out-of-scope in `PROJECT_REQUIREMENTS.md` §4.

## 1. Read Before You Write

Before generating or modifying any code, the agent MUST have read, in this order:

1. This file (`AI_AGENT_RULES.md`)
2. `PROJECT_REQUIREMENTS.md`
3. `ARCHITECTURE.md`
4. The specific subsystem doc(s) relevant to the task (`DATABASE_SCHEMA.md`, `API_SPEC.md`, `SERVICES.md`, `CACHE_STRATEGY.md`, `QUEUE_WORKFLOW.md`, `SECURITY.md`)
5. `CODING_RULES.md` and `FOLDER_STRUCTURE.md`

If a task's relevant documentation has not been loaded into context, the agent must load it before proceeding, even if this consumes additional turns.

## 2. Documentation Is the Source of Truth, Not the Agent's Prior Knowledge

- Do not assume a "typical" Spring Boot microservices layout, a "typical" set of endpoints, or a "typical" schema. Use exactly what is documented in this set.
- If the agent's general knowledge suggests a different approach than what's documented (e.g., "usually you'd add Eureka here"), the documentation wins. Do not silently substitute the agent's preferred approach.
- If the documentation is genuinely silent on something needed to proceed, the agent must not invent a new architectural decision on its own. Instead: (a) check `DECISIONS.md` for an existing assumption that resolves it, and if none exists, (b) stop and flag the gap explicitly to the human rather than guessing, per §5 below.

## 3. No Unnecessary Modifications

- Do not refactor, rename, reformat, or restructure existing code that is unrelated to the current task, even if the agent judges it "could be improved."
- Do not modify a file outside the scope of the current task's documented requirement.
- Do not change an already-implemented API contract, DB column, or cache key defined in this documentation set without first updating the corresponding `.md` file and noting the change in `DECISIONS.md` — code changes that silently diverge from documented contracts are prohibited (see `CONTRIBUTING.md` §4 Documentation-First Rule).
- If existing code already satisfies a requirement, do not regenerate it "to be safe" — leave it as is.

## 4. No Speculative Generality

- Do not build abstractions, interfaces, configuration flags, plugin systems, or extension points for functionality listed as out-of-scope in `PROJECT_REQUIREMENTS.md` §4 (AI summarization, recommendation engine, mobile apps, Elasticsearch, messaging brokers, Config Server/Eureka).
- The only sanctioned extension points are those explicitly listed in `ARCHITECTURE.md` §7. Do not add others "for future-proofing."
- Do not add a new microservice, a new external dependency, a new database table, or a new REST endpoint that is not documented in this set. Propose it by updating the relevant `.md` file first (or flagging the gap per §5), not by implementing it directly and documenting afterward.

## 5. Handling Ambiguity or Gaps

When a task requires a decision not covered by this documentation set or `DECISIONS.md`:

1. Do not silently guess and proceed as if the answer were obvious.
2. Do not pick the most common/generic industry-standard answer without flagging it.
3. State explicitly what is ambiguous, propose the most reasonable resolution consistent with the rest of this documentation (naming conventions, existing patterns, `PROJECT_REQUIREMENTS.md` scope), and note that it should be added to `DECISIONS.md` once confirmed.
4. Prefer the smallest change that unblocks the current task over a broad speculative solution.

## 6. Layering & Pattern Discipline

- Strictly follow `CODING_RULES.md` §3 layering (Controller → Service → Repository, DTOs only across boundaries). Do not put business logic in a controller "just this once," even for a small endpoint.
- Strictly follow the design patterns mandated in `ARCHITECTURE.md` §5 (Strategy for providers, Factory for provider selection, Repository, Service Layer, DTO, Builder, Constructor DI, Global Exception Handling, Circuit Breaker). Do not substitute an ad hoc `if/else` chain for the Strategy+Factory pattern when adding a provider, for example.

## 7. Consistency Across Services

- When implementing a pattern in one service (e.g., the `GlobalExceptionHandler` shape, the pagination response envelope, the Resilience4j fallback style), replicate the same pattern exactly in every other service that needs it. Do not let services diverge stylistically — a reviewer or another agent must be able to move between services without relearning conventions.
- If a genuinely reusable piece of code would otherwise be duplicated identically across every service (e.g., the standard error envelope DTO, the correlation-ID filter), it belongs in a shared library module (`common-library/` — see `FOLDER_STRUCTURE.md`), not copy-pasted per service.

## 8. Security Non-Negotiables

- Never disable JWT validation, remove a `@PreAuthorize`/security matcher, or weaken a validation rule to "get a test passing" or "unblock local development" without an explicit, scoped `dev`-profile-only exception that is clearly documented as such.
- Never commit a real secret, API key, or credential — not even "temporarily" or "for a demo."
- Never introduce raw/string-concatenated SQL or JPQL.
- Follow `SECURITY.md` in full for any auth, validation, encryption, or rate-limiting code.

## 9. Testing Obligation

- Any new service method, controller endpoint, or non-trivial logic change must come with corresponding tests per `TESTING.md` in the same change — not as a follow-up "add tests later" task.
- Do not use H2 for integration tests under any circumstance (`TESTING.md` §4, `CODING_RULES.md` §9) — Testcontainers with real MySQL only.

## 10. When Generating Multiple Files/Services in Sequence

- Maintain internal consistency: an endpoint added to `news-service` that `search-service` depends on must match exactly what `search-service`'s Feign client expects, and both must match `API_SPEC.md`. If implementing incrementally across turns, re-check the relevant `API_SPEC.md`/`DATABASE_SCHEMA.md` section before each new service to avoid drift.
- Do not generate placeholder/TODO code for a documented requirement and call the task complete — if something is genuinely deferred, it must be explicitly out of scope per `PROJECT_REQUIREMENTS.md` §4, not silently stubbed.

## 11. Communicating Uncertainty

If asked to implement something and the agent is not fully confident the implementation matches this documentation set, the agent must say so explicitly rather than presenting uncertain output with unwarranted confidence. This applies especially to: exact cache key formats (`CACHE_STRATEGY.md`), exact Resilience4j configuration values (`QUEUE_WORKFLOW.md`), and exact response DTO shapes (`API_SPEC.md`).

## 12. Precedence Reminder

Order of precedence when documents conflict (repeated from `README.md` §2 for convenience, since this is the file most likely to be loaded first): this file → `PROJECT_REQUIREMENTS.md` → `ARCHITECTURE.md` → subsystem docs → `CODING_RULES.md`/`FOLDER_STRUCTURE.md` → operational docs → process docs.