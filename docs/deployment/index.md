# Deployment

IR-Board runs as a containerized stack via Docker Compose, with separate profiles for local development, production, and load testing.

- **[Docker Compose](docker-compose.md)** — the available compose profiles, what each includes, and when to use which one.
- **[Configuration](configuration.md)** — environment variables, the `.env` file, and domain requirements.
- **[Services](services.md)** — the containers in the stack, their roles, and which ones are exposed publicly.
- **[Database Setup](database-setup.md)** — provisioning and initializing PostgreSQL for a new deployment.
- **[Backups and Maintenance](backups-and-maintenance.md)** — keeping a running deployment healthy over time.
- **[Troubleshooting](troubleshooting.md)** — diagnosing common issues during deployment or startup.

## Choosing a profile

| Profile | Use case |
|---|---|
| Development (default) | Local work, hot-reload enabled |
| Production | A real deployment, slimmed down, no dev tooling |
| Load testing | A production-like deployment with load balancing disabled and test users pre-seeded |

Each profile is covered in more detail in [Docker Compose](docker-compose.md).

## A note on domains

The identity and authorization components used by IR-Board expect a real domain to be reachable at all times — a plain `localhost` setup isn't enough. For local development this is satisfied by editing your hosts file; for a real deployment you'll need a domain with DNS pointing at your server. See [Configuration](configuration.md) for details.