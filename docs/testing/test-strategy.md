# Test Strategy

IR-Board is tested at several levels, from isolated unit tests up to a full-stack load simulation. Each level targets a different kind of risk.

| Level | Tool | What it verifies |
|---|---|---|
| Static analysis and coverage | SonarQube | Code smells, reliability issues, duplication, vulnerabilities, and a minimum 80% coverage gate. |
| Backend unit tests | JUnit 5, Mockito | Domain rules, state transitions, services, and adapters in isolation. |
| Backend integration tests | Spring Boot test support, Testcontainers | Full vertical slices from HTTP to a real PostgreSQL database, with Ory components mocked. |
| Frontend unit and integration tests | Vitest, React Testing Library | Pages and components, with `fetch` stubbed. |
| End-to-end tests | Playwright | The whole deployed stack, driven through a real browser. |
| Load testing | Gatling | Behavior of the Traefik → Oathkeeper → backend path under concurrent users. |
| Usability and accessibility | Task-based sessions, Google Lighthouse | Whether real users can complete realistic tasks, and whether the interface meets accessibility targets. |

Acceptance testing is treated as an extension of integration testing: each integration scenario is traceable to one or more functional requirements, giving a verification record at the component boundary.

## Performance targets

The system is held to these requirements, validated through [load testing](load-testing.md):

- The system stays responsive for up to **20 simultaneous authenticated users**, with a p95 API latency of at most **3000 ms**.
- Entity locks time out after no more than **one hour**.

## Quality targets

- Coverage of at least **80%**, enforced by the SonarQube quality gate. See [Contributing](../development/contributing.md).
- Lighthouse scores of at least **80** for Performance and Accessibility on each main page.

## Current coverage and known gaps

Not everything that has been verified is covered by automation.

| Area | Status |
|---|---|
| Authentication flow | Automated (E2E). |
| Core requirements lifecycle (project, stakeholder, NFR, document, functionality, FR) | Automated (E2E). |
| Multi-user access control across roles | Verified manually only. No E2E coverage against the live Keto layer. |
| Concurrency control (two users, one entity) | Verified manually only. Needs two browser contexts, which Playwright supports. |
| Slug-based search | Verified manually only. |
| Document upload under load | Not included in the load simulation. |
| Load from a remote client | All load testing ran on the same machine as the stack, so network latency isn't measured. |

Each of these is a good [contribution](../development/contributing.md#open-areas).

## Where to read more

- [Functional Testing](functional-testing.md) — unit, integration, and end-to-end tests in detail.
- [Security Testing](security-testing.md) — static analysis and access-control verification.
- [Usability and Accessibility](usability-and-accessibility.md) — protocol, results, and fixes.
- [Load Testing](load-testing.md) — the simulation and its results.