# Architecture

IR-Board is built as a set of microservices around a Zero-Trust security model. Identity, session handling, and fine-grained authorization are delegated to the [Ory](https://www.ory.com/) ecosystem rather than implemented inside the business application, and every request passes through an API gateway before it reaches an internal service.

- **[System Overview](system-overview.md)** — the containers that make up the stack, how they're wired together, and the request flow through the gateway.
- **[Technology Stack](technology-stack.md)** — the languages, frameworks, and tools used across the project, and why each was chosen.
- **[Backend](backend.md)** — the Spring Boot service, its hexagonal/clean-architecture layering, and its domain model.
- **[Frontend](frontend.md)** — the React/TypeScript single-page application and how its packages are organized.
- **[Database](database.md)** — the PostgreSQL schema and the reasoning behind key modelling decisions (identifiers, inheritance, observer join tables).
- **[Security](security/)** — the Relation-Based Access Control (ReBAC) model and the Zero-Trust perimeter it runs behind.
- **[Lifecycle and Workflows](lifecycle-and-workflows.md)** — the state machines governing projects, functionalities, and requirements, and how state changes propagate.
- **[Concurrency](concurrency.md)** — how entity locking prevents two users from editing the same thing at once.
- **[Observability](observability.md)** — the logging and metrics stack, and what it currently does and doesn't cover.

This section describes the system as it stands today. Where a design decision has a non-obvious rationale — or a known trade-off — that's called out on the relevant page rather than in a separate history.