# Local Setup

IR-Board's default `docker-compose.yaml` defines the production stack. A `docker-compose.override.yaml` file is picked up automatically by Docker Compose whenever no explicit file is specified, and extends the base stack with development-specific configuration — the backend and frontend's dev-oriented Dockerfile stages, plus additional exposed ports and environment variables for hot-reload.

Running `docker compose up` with no arguments therefore brings up the **development** environment. See [Deployment › Docker Compose](../deployment/docker-compose.md) for the other available profiles.

## Steps

1. Clone the repository (or download and extract an archive):

```shell-unix-generic
git clone https://github.com/Y4vra/IRBoard.git
```

2. Create and configure the `.env` file, or use the defaults from the provided `.env.example`.

3. Add the configured domains to your hosts file. On Linux and macOS, edit `/etc/hosts`; on Windows, `C:\Windows\System32\drivers\etc\hosts`. With the defaults:

```
127.0.0.1 irboard.local api.irboard.local auth.irboard.local objects.irboard.local diagrams.irboard.local grafana.irboard.local
```

If you've customized the domains in `.env`, substitute them accordingly.

4. Start Docker Desktop (or the Docker engine), then bring up the stack:

```shell-unix-generic
docker compose up -d --build
```

Once every container reports healthy:

- The frontend is reachable at `http://irboard.local` (or whatever domain you configured).
- **Mailpit**, for inspecting invitation emails sent during signup, is at `http://localhost:8025`.
- The `initial-setup-admin` container seeds the first administrator account using the credentials defined in `.env`.

## Resetting the stack

It's recommended that every development session starts from a clean stack:

```shell-unix-generic
docker compose down -v
```

The `-v` flag also removes the stack's volumes, so this wipes the database and any uploaded documents along with it — don't run it if you have local state you want to keep.

## Where to go next

- [Repository Structure](repository-structure.md) — understand how the codebase is laid out before making changes.
- [Backend Development](backend-development.md) and [Frontend Development](frontend-development.md) — conventions for each half of the application.
- [Architecture](../architecture/index.md) — the bigger picture behind the conventions in this section.