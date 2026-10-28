# Database Setup

IR-Board uses **PostgreSQL** as its data store. In every Compose profile the database runs as a container and is provisioned automatically, so there is no separate installation step.

## What lives in the database

- **Domain data** — projects, functionalities, requirements, stakeholders, documents (metadata), users, and entity locks. See [Architecture › Database](../architecture/database.md) for the schema.
- **Ory data** — the Ory components rely on relational database support, and PostgreSQL is the database used across the stack. This includes Kratos' identities and its queue of pending email jobs, which the Courier process polls.

!!! note
    Document **contents** are not in PostgreSQL. They live in the object storage backend, and the database holds only metadata (file name, MIME type). Keep that in mind for [backups](backups-and-maintenance.md).

User-to-project and user-to-functionality permissions are held as ReBAC tuples in Ory Keto, not as tables in the application schema.

## First start

On a fresh stack:

1. The database container starts and the services connect using the credentials from your `.env` file. See [Configuration](configuration.md).
2. The domain schema is derived from the backend's JPA entity mappings.
3. The `initial-setup-admin` service seeds the first administrator account from the credentials in `.env`.

Once the containers are healthy you can sign in with that administrator and invite everyone else. See [User Guide › Access Control](../user-guide/access-control.md).

!!! tip "Verify how the schema is applied"
    This documentation describes the schema as a projection of the JPA model. For the exact mechanism that creates or updates tables on startup, check the backend's configuration in the repository rather than assuming it.

## Starting from scratch

To discard all state and rebuild:

```shell-unix-generic
docker compose down -v
docker compose up -d --build
```

`-v` removes the volumes, which deletes the database, Kratos identities, and uploaded documents together.

## Using an external PostgreSQL

Running against a database outside the Compose stack isn't a documented or tested configuration. If you try it, make sure every consumer (the backend and the Ory services) can reach it with the credentials you configure.

## Tests

Backend integration tests don't touch your deployment database. They provision an isolated PostgreSQL instance through **Testcontainers** on every run. See [Testing › Functional Testing](../testing/functional-testing.md).