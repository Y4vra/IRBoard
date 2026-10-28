# Services

This page lists the containers in the stack from an operator's point of view: what each one does, and whether it should be reachable from outside. For how they interact, see [Architecture › System Overview](../architecture/system-overview.md).

## Core services

| Service | Role | Exposure |
|---|---|---|
| **Traefik** | Entry point and TLS termination proxy. Routes by hostname and hides the internal topology. | Public (port 80 in the reference deployment). |
| **Frontend** | The React SPA, served as static content. | Public, via Traefik on `DOMAIN_NAME`. |
| **Ory Oathkeeper** | Gateway that validates sessions and permissions before requests reach internal services. | Via Traefik; every protected request passes through it. |
| **Ory Kratos** | Identity and session management. | Self-service endpoints public via `AUTH_DOMAIN`; admin API internal only. |
| **Ory Keto** | ReBAC authorization server. | Internal. |
| **Backend** | Spring Boot service with the domain logic. | Reached only through Oathkeeper, via `API_DOMAIN`. |
| **PostgreSQL** | Relational database. | Internal. |
| **Object storage (MinIO)** | S3-compatible storage for uploaded documents. | Via `OBJS_DOMAIN`; see the note below. |

## Supporting services

| Service | Role | Exposure |
|---|---|---|
| **Kratos Courier** | Separate process that polls Kratos' database for pending email jobs and sends them to the configured SMTP relay. | Internal. |
| **Mailpit** | Development mail server that captures Kratos' emails in a local web UI. Web UI on port **8025**. | **Never public.** |
| **initial-setup-admin** | One-shot service that seeds the first administrator from `.env` credentials. | Internal, runs at startup. |
| **draw.io** | Self-hosted diagramming tool, intended for embedding in the frontend. | Via `DRAWIO_DOMAIN`. The integration isn't finished; see [Contributing](../development/contributing.md#open-areas). |

## Observability services

| Service | Role | Exposure |
|---|---|---|
| **Grafana** | Dashboards over logs and metrics. | Public on its own subdomain, through Traefik. |
| **Loki** | Log aggregation. | Internal. |
| **Promtail** | Ships container logs from the Docker socket to Loki. | Internal. Runs as root. |
| **Prometheus** | Scrapes and stores metrics. | Internal. |

See [Architecture › Observability](../architecture/observability.md) for what's collected.

## Operational notes

**Mailpit in production.** Mailpit captures mail rather than delivering it. A deployment that must actually reach users' inboxes has to point Kratos at a real SMTP relay. Configuring that relay, including domain verification, SPF, DKIM, and DMARC, is outside IR-Board's scope.

**Grafana is public by default routing.** It sits on a subdomain behind Traefik, but hardening the observability stack itself (access control, isolation, auditing) isn't handled by IR-Board. Restrict it in front of Traefik or via your network if the deployment is internet-facing.

**Promtail's privileges.** It runs as root solely to read the Docker socket. That's a recognized hardening concern; keep it off any network segment you don't control.

**MinIO is in maintenance mode.** The open-source edition's web console lost administrative features in 2025, and upstream moved to maintenance mode in December 2025. The current deployment uses the unpinned `latest` tags for `minio/minio` and `minio/mc`, so image updates can change behavior unexpectedly and security patches aren't guaranteed. Pin explicit, audited versions, and see [Contributing](../development/contributing.md#open-areas) for the migration discussion. MinIO is AGPLv3 licensed; running the unmodified upstream image triggers no source-disclosure obligation, but modifying and exposing it would.

**Licensing of the observability stack.** Grafana, Loki, and Promtail are also AGPLv3, with the same unmodified-image caveat. The Ory components, Traefik, Prometheus, PostgreSQL, Spring Boot, and React are under permissive licenses.