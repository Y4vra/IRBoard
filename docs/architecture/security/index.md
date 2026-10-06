# Security

IR-Board's security model rests on two pillars: a **Relation-Based Access Control (ReBAC)** authorization model, and a **Zero-Trust** perimeter that enforces it. Both are delegated to specialized, open-source components from the [Ory](https://www.ory.com/) ecosystem rather than implemented inside the application.

- **[ReBAC](rebac.md)** — how permissions are modeled as relationships between users, projects, and functionalities, and how Ory Keto evaluates them.
- **[Zero-Trust Perimeter](zero-trust-perimeter.md)** — how Traefik, Oathkeeper, and Kratos combine to validate every request before it reaches an internal service.
- **[Authentication Flows](authentication-flows.md)** — the login and signup/invitation sequences in detail.

## Why delegate security to Ory

Implementing identity management, session handling, and authorization from scratch would mean maintaining secure password storage, token management, and protection against common vulnerabilities as part of the application itself — a significant amount of security-critical code to get right and keep right. Delegating these concerns to mature, purpose-built components follows the principle of **defense in depth**: responsibilities are separated, and the amount of security-critical code the application itself has to maintain is minimized.

The trade-off is infrastructure complexity: correctly configuring trust boundaries between Traefik, Oathkeeper, Kratos, and Keto — deciding what sits behind the gateway and what doesn't — takes more upfront configuration work than a single self-contained auth module would. See [Zero-Trust Perimeter](zero-trust-perimeter.md) for how that boundary is currently drawn.

## Related reading

- [Access Control](../../user-guide/access-control.md) — the user-facing side of this model: roles, permissions, and what each one grants.

!!! note "Licensing"
    The Ory components used here (Kratos, Oathkeeper, Keto) are Apache 2.0 licensed, imposing no meaningful restriction on self-hosted or commercial use.