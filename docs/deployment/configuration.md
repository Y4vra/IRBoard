# Configuration

Every deployment profile reads its configuration from a `.env` file at the repository root. A `.env.example` is provided as a starting point, and its defaults work for local development.

```shell-unix-generic
cp .env.example .env
```

## What the `.env` file controls

The file holds domain names, database credentials, and service configuration, including the credentials used to seed the first administrator account.

### Domains

Each externally reachable service gets its own subdomain:

```env
DOMAIN_NAME=irboard.online
AUTH_DOMAIN=auth.irboard.online
API_DOMAIN=api.irboard.online
OBJS_DOMAIN=objects.irboard.online
DRAWIO_DOMAIN=diagrams.irboard.online
```

| Variable | Serves |
|---|---|
| `DOMAIN_NAME` | The frontend. |
| `AUTH_DOMAIN` | Ory Kratos' self-service endpoints. |
| `API_DOMAIN` | The backend API, through Oathkeeper. |
| `OBJS_DOMAIN` | The object storage service. |
| `DRAWIO_DOMAIN` | The self-hosted draw.io instance. |

Grafana is served on its own subdomain through Traefik as well (`grafana.irboard.local` in the development defaults).

In the development defaults every domain lives under `irboard.local`. The reference production deployment uses `irboard.online`.

## Why a real domain is required

The Ory components don't treat `localhost` as a valid setup: they expect a proper domain to be available at all times, because session cookies and flow redirects are tied to it. That has two practical consequences:

- **Development.** Add every configured domain to your hosts file, pointing at `127.0.0.1`. The exact line is in [Development › Local Setup](../development/local-setup.md). If you change the domains in `.env`, change the hosts entry to match.
- **Production.** Use a domain you control, with DNS records for each subdomain pointing at the server's public IP.

!!! tip "Free dynamic DNS services"
    Free dynamic DNS can be unreliable for a deployment that has to stay up. The reference deployment uses a purchased domain for that reason. Note that cloud student plans often expose only provider-managed domains whose DNS you can't edit.

## Credentials

Replace every default credential before exposing a deployment. That includes the seeded administrator account (created by the `initial-setup-admin` service on first start), database passwords, and the object storage credentials. Keep `.env` out of version control.

## Changing configuration

Compose reads `.env` when containers are created, so after editing it, recreate the affected services:

```shell-unix-generic
docker compose up -d --build
```

## Swappable infrastructure

Components such as the identity provider, mail server, and object storage are reached through abstraction layers rather than direct dependencies, so they can be replaced without changing business logic. In particular, Mailpit is a development stand-in: a real deployment that needs to deliver invitation emails must point Kratos at a real SMTP relay. Setting up that relay (domain verification, SPF, DKIM, DMARC) is the operator's responsibility. See [Services](services.md).