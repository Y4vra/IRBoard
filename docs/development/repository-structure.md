# Repository Structure

The repository is split into two top-level applications, plus the infrastructure definitions that tie them together.

```
.
├── backend/              # Spring Boot service
├── frontend/              # React/TypeScript SPA
├── docker-compose.yaml            # Production stack definition
├── docker-compose.override.yaml   # Development-specific overrides (auto-applied)
├── docker-compose.load-testing.yaml
├── .env.example
└── ...                    # Ory configuration, Traefik dynamic config
```

## `backend/`

Follows the hexagonal/clean-architecture layering described in [Architecture › Backend](../architecture/backend.md): `domain`, `application`, and `infrastructure` packages, each with a specific responsibility and a strict dependency direction (outer layers depend on inner ones, never the reverse).

## `frontend/`

Organized into the purpose-delimited packages described in [Architecture › Frontend](../architecture/frontend.md): `pages`, `components` (further split into `badges`, `dialogs`, `graphics`, `ui`, `wrappers`), `contexts`, `hooks`, `lib`, `types`, and `tests` (mirroring `src`, plus an `e2e` subfolder).

## Repository root

Infrastructure definitions live at the repository root, alongside the application code rather than in a separate repository:

- **Docker Compose files** — one per deployment profile. See [Deployment › Docker Compose](../deployment/docker-compose.md).
- **Ory configuration** — Kratos identity schemas, Oathkeeper access rules, Keto permission definitions (OPL).
- **Traefik dynamic configuration** — routing rules for the gateway.
- **`.env.example`** — the template for the environment configuration every profile depends on.

## Before making changes

1. Read [Local Setup](local-setup.md) to bring up a working stack.
2. Read [Backend Development](backend-development.md) or [Frontend Development](frontend-development.md) depending on what you're touching, for the layering conventions specific to that half of the application.
3. Read [Contributing](contributing.md) for what a pull request needs to pass before it's merged.