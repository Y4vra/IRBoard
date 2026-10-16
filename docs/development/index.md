# Development

This section is for anyone building or extending IR-Board.

- **[Prerequisites](prerequisites.md)** — tools required before working on the project (Docker, Git, a shell).
- **[Local Setup](local-setup.md)** — bringing up a development stack with hot-reload enabled.
- **[Repository Structure](repository-structure.md)** — how the codebase is laid out, and where infrastructure definitions live relative to the application code.
- **[Backend Development](backend-development.md)** — conventions for the Spring Boot service: where domain logic, orchestration, and infrastructure adapters belong.
- **[Frontend Development](frontend-development.md)** — conventions for the React application: pages, components, contexts, hooks, and the frontend permission model.
- **[Database Development](database-development.md)** — working with the persistence layer and JPA mappings.
- **[API Development](api-development.md)** — adding or modifying REST endpoints, including permission checks.
- **[Contributing](contributing.md)** — how changes are reviewed, the quality gate they need to pass, and what a complete pull request looks like.

## Before you start

Read [Repository Structure](repository-structure.md) first if you're new to the project — it explains the split between `backend`, `frontend`, and the infrastructure definitions at the repository root, and links out to the deeper architectural background in [Architecture](../architecture/index.md).