# Prerequisites

The following tools are required before working on IR-Board, regardless of which deployment profile you end up using.

| Tool | Notes |
|---|---|
| **A shell** | The deployment and setup process is command-line driven. `bash` is assumed; on Windows, `Git Bash` is a suitable alternative. |
| **Docker** | Required for every profile. Install via the official install script or your system's package manager — Docker Compose ships with modern Docker installations, no separate install needed. |
| **Git** | Required to clone the repository. Not needed if you're working from a downloaded archive instead. |
| **A configured `.env` file** | Every profile depends on this for domain names, database credentials, and service configuration. A `.env.example` is provided at the repository root as a starting point. |
| **A domain name, or local DNS control** | The identity and authorization components IR-Board relies on expect a real domain to be available at all times. See the note below. |

## The domain requirement

This is the one prerequisite that trips people up most often: a plain `localhost` setup isn't enough.

- **Local development** — satisfied by adding the configured domains to your system's hosts file (`/etc/hosts` on Linux/macOS, `C:\Windows\System32\drivers\etc\hosts` on Windows). [Local Setup](local-setup.md) covers exactly what to add.
- **Production or load-testing deployments** — a real domain with DNS records pointing at the server's public IP. See [Deployment](../deployment/index.md).

Background on *why* this is required is in [Architecture › Security › Authentication Flows](../architecture/security/authentication-flows.md#a-practical-consequence).

## What you don't need up front

You don't need Java, Node.js, or PostgreSQL installed on your host machine — everything backend- and frontend-related runs inside containers via Docker Compose in the default development profile. If you're planning to work on the backend or frontend outside of Docker (for faster iteration, IDE debugging, etc.), see [Backend Development](backend-development.md) and [Frontend Development](frontend-development.md) for what to install locally for that.