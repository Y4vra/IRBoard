# Docker Compose

IR-Board is deployed as a containerized stack with Docker Compose, with no cloud-specific infrastructure required. Three compose configurations cover the supported profiles.

| Profile | File(s) | Use case |
|---|---|---|
| **Development** | `docker-compose.yaml` + `docker-compose.override.yaml` (applied automatically) | Local work, with hot-reload and extra exposed ports. |
| **Production** | `docker-compose.yaml` (explicitly) | A real deployment, without development tooling. |
| **Load testing** | `docker-compose.load-testing.yaml` | A production-like stack prepared for load tests. |

## Development

`docker-compose.yaml` defines the production stack. When no file is specified, Docker Compose also picks up `docker-compose.override.yaml`, which extends the base with development-specific configuration: the final Dockerfile stages for the backend and frontend, additional exposed ports, and extra environment variables. Running `docker compose up` with no arguments therefore produces the development environment.

```shell-unix-generic
docker compose up -d --build
```

The full walkthrough, including the hosts-file step, is in [Development › Local Setup](../development/local-setup.md).

## Production

This profile names `docker-compose.yaml` explicitly, bypassing the override file. It's a slimmer profile without the Spring Boot devtools or Vite hot-reload.

```shell-unix-generic
docker compose -f docker-compose.yaml up -d --build
```

Before starting it you need a server, a domain with DNS records for each subdomain, Docker and Git installed, and a configured `.env` file. [Configuration](configuration.md) covers the `.env` file, and the reference deployment below shows the whole sequence.

### Reference deployment

The project's own deployment ran on a single Azure VM:

| Setting | Value |
|---|---|
| Region | France Central |
| OS | Ubuntu Server 24.04 LTS |
| Size | Standard B2as_v2 (2 vCPU, 8 GB RAM) |
| Storage | 64 GiB Standard SSD, with the OS disk set to delete with the VM |

1. Point the domain's DNS records at the server, one per subdomain.
2. Install the prerequisites and clone the repository:

    ```shell-unix-generic
    sudo apt update
    curl -fsSL https://get.docker.com | sudo sh
    sudo apt install -y git
    sudo usermod -aG docker $USER
    git clone https://github.com/Y4vra/IRBoard.git
    ```

    Then log out and back in so the Docker group membership applies.
3. Configure `.env` with your real domains, users, and passwords.
4. Start the stack with the production command above.
5. Open an inbound rule for port 80 (HTTP).

!!! warning "Keep Mailpit private"
    Mailpit's web UI listens on port 8025 and is intentionally **not** exposed publicly, because anyone who could reach it could read invitation codes. Reaching it in production is left to the operator.

!!! note "HTTP only in the reference setup"
    The reference deployment exposes HTTP on port 80. Traefik is the TLS termination point in the architecture, but enabling HTTPS isn't part of the documented sequence above.

## Load testing

`docker-compose.load-testing.yaml` is a variant of the production profile prepared for load tests. It disables load balancing and pre-inserts 499 user accounts, so a 500-user simulation doesn't have user creation interfering with the measurements. Configuration and startup follow the production steps, including DNS and `.env`:

```shell-unix-generic
docker compose -f docker-compose.load-testing.yaml up -d --build
```

Open the same inbound ports as production. Once the stack is healthy and all users are seeded, it's ready for the Gatling simulation described in [Testing › Load Testing](../testing/load-testing.md).

## Stopping and resetting

```shell-unix-generic
docker compose down        # stop the stack, keep data
docker compose down -v     # stop and delete volumes, including database and uploaded documents
```

!!! danger
    `-v` is destructive. Use it freely in development, never on a deployment holding data you want to keep.