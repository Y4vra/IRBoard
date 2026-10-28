# Troubleshooting

Common problems, with the usual cause and fix. For anything not covered here, start with the logs: Grafana (backed by Loki) aggregates container output, and `docker compose logs <service>` works for a single service.

## Access and startup

| Symptom | Likely cause | Fix |
|---|---|---|
| The site doesn't load, or login misbehaves in development | The configured domains aren't in your hosts file. The Ory components need a real domain. | Add every domain from `.env` to the hosts file, pointing at `127.0.0.1`. See [Local Setup](../development/local-setup.md). |
| The site doesn't load on a server | Port 80 isn't open, or DNS records don't point at the server. | Open the inbound rule and check each subdomain's record. See [Docker Compose](docker-compose.md). |
| Some subdomain fails while others work | A domain variable in `.env` doesn't match its DNS record. | Compare `DOMAIN_NAME`, `AUTH_DOMAIN`, `API_DOMAIN`, `OBJS_DOMAIN`, and `DRAWIO_DOMAIN` against your DNS. See [Configuration](configuration.md). |
| No administrator exists after first start | `initial-setup-admin` didn't run or failed. | Check its logs, confirm the credentials in `.env`, and rerun on a clean stack. |
| Stale or inconsistent state in a dev stack | Leftover volumes from earlier runs. | `docker compose down -v`, then bring the stack up again. This deletes all data. |
| Behavior changed after rebuilding | Unpinned `latest` image tags (MinIO) pulled a newer version. | Pin explicit versions. See [Services](services.md). |

## Invitations and sign-in

| Symptom | Likely cause | Fix |
|---|---|---|
| The invited user never gets the email | In development and self-hosted setups, Mailpit captures mail instead of delivering it. In production, no SMTP relay is configured or the email system is unavailable. | Read the code in Mailpit (`http://localhost:8025`) or configure a real relay. The account exists either way, and an administrator can **regenerate the signup code**. |
| Mailpit isn't reachable on a server | It's deliberately not exposed publicly. | Access it through your own infrastructure, never by opening port 8025 to the internet. |
| The password is rejected at activation | Passwords must be between 15 and 64 characters. | Choose a longer or shorter password. |
| A user is temporarily locked out | Three consecutive failed sign-in attempts block the account. | Wait for the block to expire. Failed attempts show a generic error that doesn't reveal whether the account exists. |

## Permissions

| Symptom | Likely cause | Fix |
|---|---|---|
| An administrator can't edit a project | Admin status doesn't grant project access under Zero-Trust. They need a project manager relationship. | Link the administrator as project manager. A project's creator is linked automatically. See [Access Control](../user-guide/access-control.md). |
| A user doesn't see an expected button or functionality | They lack the relationship that grants it. The interface hides what the backend says they can't do. | Check their project and functionality links. |
| A user holds two roles on one functionality | The higher permission wins, so roles don't restrict each other. | No action needed. |

## Data behavior that looks like a bug

| Symptom | Explanation |
|---|---|
| An entity shows as locked but can be edited | Expired locks are cleaned up lazily, so the indicator can outlast the lock. See [Concurrency](../architecture/concurrency.md). |
| A reactivated child requirement disappeared | Removing a parent removes every descendant unconditionally, including children reactivated independently while the parent stayed deactivated. See [Requirement Lifecycle](../user-guide/requirements/requirement-lifecycle.md). |
| Slug search finds nothing for an entity that exists | Search needs an exact full match, and entities the user can't access are reported as not found. |
| A document record exists but its file is missing, or the reverse | A multi-step operation failed partway across the database and object storage. Reconcile manually. See [Backups and Maintenance](backups-and-maintenance.md). |
| Deactivated requirements are missing from lists | In the current default they should be shown; check the filter toggle in the view. Removed items are visible only to project managers. |