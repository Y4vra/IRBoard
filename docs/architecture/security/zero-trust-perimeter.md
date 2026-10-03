# Zero-Trust Perimeter

Zero-Trust means no request is trusted by default, regardless of where it originates — every request to a protected resource is independently verified before it's allowed through. In IR-Board, this is enforced by **Ory Oathkeeper**, sitting between the public network and every internal service.

## How a protected request is validated

1. **Traefik** receives the request and routes it to Oathkeeper for any path requiring authentication.
2. **Oathkeeper** checks the request's session cookie against **Kratos** (`/sessions/whoami`). If the session is invalid or missing, the request is rejected with `401` before it goes any further.
3. For operations requiring a specific permission, Oathkeeper queries **Keto** to evaluate the relevant relationship (see [ReBAC](rebac.md)). If the check fails, the request is rejected with `403`.
4. If both checks pass, Oathkeeper injects the resolved identity as an `X-User` header and forwards the request to the backend.

The backend never validates sessions or evaluates top-level authorization itself for requests arriving through this path — by the time a request reaches it, Oathkeeper has already confirmed who the user is. The backend does still query Keto directly for operations that need finer-grained checks than the gateway alone can express (see [Backend](../backend.md)).

## Why gateway placement matters

Determining which services should sit *behind* Oathkeeper and which should remain reachable without going through it is one of the more consequential configuration decisions in the stack. Services like the observability stack (Grafana, Loki) or object storage need careful handling: exposing them without the same scrutiny applied to the main application would undermine the whole perimeter. Correctly drawing this boundary — and keeping internal service-to-service traffic separate from user-facing traffic — is an ongoing infrastructure concern rather than a one-time setup step; see [Deployment › Services](../../deployment/services.md) for how this is currently laid out.

## Security principles applied

- **Least privilege** — components and users hold only the permissions required for their specific task, limiting the blast radius of a compromised account or service.
- **Defense in depth** — multiple independent layers (gateway validation, session validation, relationship-based authorization) mean a failure in one layer doesn't automatically expose the system.
- **Secure-by-design** — authentication and authorization are foundational to the request path, not something bolted on after the fact.

See [Authentication Flows](authentication-flows.md) for exactly what happens, step by step, during login and signup.