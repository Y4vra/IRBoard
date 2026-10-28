# Technology Stack

## Backend

- **Java** with **Spring Boot** — application logic, dependency injection, and the main server structure.
- **Spring Data JPA** — object-relational mapping against PostgreSQL.
- **JPQL** — queries expressed against the entity model rather than raw SQL, keeping the persistence layer independent of the underlying schema details.

Spring Boot's opinionated structure provides validation support, integrated configuration management, and mature integration points for authentication and authorization layers — useful given the complexity of the domain's entity relationships, lifecycle management, and state transitions. Lighter alternatives (Express.js, FastAPI) would have required defining more of that structure by hand.

## Frontend

- **TypeScript** on **React** — a component-based single-page application, with static typing reducing errors across a domain with a large number of entity types and interactions.
- **shadcn/ui** — unstyled component primitives used as the base layer for the interface.

See [Frontend](frontend.md) for how the codebase is organized on top of this.

## Database

- **PostgreSQL** — the primary data store. Chosen for strong relational guarantees (foreign keys, transactions) combined with JSONB support for the handful of fields that benefit from semi-structured flexibility.

See [Database](database.md) for the schema itself.

## Identity, authorization, and gateway

- **Ory Kratos** — identity and session management.
- **Ory Oathkeeper** — policy-enforcement gateway.
- **Ory Keto** — Relation-Based Access Control (ReBAC), using the **Ory Permission Language (OPL)** to define relationships.
- **Traefik** — API gateway / reverse proxy and TLS termination.

See [Security](security/index.md) for how these fit together.

## Observability

- **Grafana** — dashboards.
- **Loki** — log aggregation.
- **Promtail** — log shipping from Docker container output.
- **Prometheus** — metrics collection.

See [Observability](observability.md).

## Testing

- **JUnit 5** and **Mockito** — backend unit tests.
- **Testcontainers** — isolated PostgreSQL instances for backend integration tests.
- **Vitest** and **React Testing Library** — frontend unit and integration tests.
- **Playwright** — end-to-end tests against the full deployed stack.
- **Gatling** — load testing.
- **SonarQube** — static analysis, code coverage, and quality gate enforcement.

See [Testing](../testing/index.md) for how these are used.

## Infrastructure and tooling

- **Docker / Docker Compose** — containerization and orchestration across all deployment profiles.
- **YAML** — Docker Compose definitions and Ory service configuration.
- **Shell scripts** — deployment automation (e.g. seeding the initial admin account).
- **JSON Schema** — Kratos identity schema definitions.

## Documentation

This documentation and the originating project report are written in **Typst**, chosen for its fast compilation and Markdown-like syntax relative to more traditional typesetting tools.