# Backups and Maintenance

!!! warning "No built-in tooling"
    IR-Board doesn't ship backup, restore, or scheduled-maintenance tooling. This page describes what state exists and what to watch for, so you can build the right process with your own infrastructure. The commands shown are generic examples, not features of the project.

## What to back up

| State | Where it lives | Notes |
|---|---|---|
| Domain data and Ory data | PostgreSQL | Includes requirements, projects, users, locks, and Kratos identities. |
| Uploaded documents | Object storage (MinIO) | The database holds only each document's metadata. |
| Configuration | `.env` and the Compose and Ory configuration files | Includes the credentials and domain settings. Store securely. |
| Observability data | Grafana, Loki, and Prometheus volumes | Optional; useful history but not required to restore the application. |

### Back up the database and object storage together

Some operations change both stores (bulk document deletion is the main one), and they aren't wrapped in a distributed transaction. A backup of one taken at a different moment from the other can therefore capture a document record without its file, or a file without its record. Take both backups as close together as you can, ideally with the application quiet.

### Example: database dump

```shell-unix-generic
docker compose exec <postgres-service> pg_dump -U <user> <database> > backup.sql
```

Replace the placeholders with the service name and credentials from your Compose file and `.env`.

## Routine maintenance

**Pin image versions.** The deployment currently uses unpinned `latest` tags for `minio/minio` and `minio/mc`. Because the upstream open-source project is in maintenance mode, replace them with explicit, audited tags so a rebuild can't change behavior unexpectedly, and plan a migration to an actively maintained S3-compatible store. See [Services](services.md).

**Reconcile database and storage.** Because partial failures can leave an orphaned record or object, nothing detects or repairs the divergence automatically; recovery is manual. If you suspect a mismatch, compare document records in PostgreSQL against objects in storage.

**Expect stale lock indicators.** Expired entity locks are removed lazily, so the interface can show an entity as locked after its lock has expired (the timeout is about an hour). Editing is already unblocked in that state. The indicator clears when someone acquires or releases the lock. See [Architecture › Concurrency](../architecture/concurrency.md).

**Review the removed pile.** Removed projects, requirements, stakeholders, and documents are archived rather than deleted, and only a project manager (or, for projects, an administrator) can delete them permanently. Decide on a policy for when archived items should be purged.

**Watch the observability stack.** Use Grafana to review logs and metrics. Hardening and alerting on top of it are left to you. See [Architecture › Observability](../architecture/observability.md).

## Updating a deployment

The documented model is rebuilding the stack:

```shell-unix-generic
git pull
docker compose -f docker-compose.yaml up -d --build
```

This replaces all services at once, with no rollback path and a downtime window while containers restart. That's acceptable for demonstration and small deployments. For production use, take backups first, and consider a blue-green or rolling strategy if downtime matters.