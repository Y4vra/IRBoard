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

## Running the documentation locally

The documentation you're reading is a MkDocs site, built from the `docs/` folder and configured by `mkdocs.yml` at the repository root. It has its own Compose file, separate from the application stack, so you can preview documentation changes without starting IR-Board itself:

```shell-unix-generic
docker compose -f docker-compose.docs.yaml up
```

Once the container is running, open the address it prints (for MkDocs the default is `http://localhost:8000`; check `docker-compose.docs.yaml` if you've changed the port). The site rebuilds and reloads as you edit files under `docs/`.

Stop it with `Ctrl+C`, or with `docker compose -f docker-compose.docs.yaml down` if you started it detached (`-d`).

!!! note
    Images are referenced from `docs/assets/`. If a diagram or screenshot appears broken, check that the file exists at that path.

To check the documentation builds cleanly before opening a pull request, run a strict build, which fails on broken links and missing files instead of only warning:

```shell-unix-generic
mkdocs build --strict
```

## Where to go next

- [Repository Structure](repository-structure.md) — understand how the codebase is laid out before making changes.
- [Backend Development](backend-development.md) and [Frontend Development](frontend-development.md) — conventions for each half of the application.
- [Architecture](../architecture/index.md) — the bigger picture behind the conventions in this section.