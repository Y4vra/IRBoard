# API Development

The backend exposes a **RESTful API** and deliberately embeds no frontend concerns. Every request from the frontend reaches it exclusively through the API gateway (Traefik → Oathkeeper); there is no direct internal service access from the client. This page covers how to add or change an endpoint.

## Anatomy of an endpoint

An endpoint touches each backend layer in a consistent way (see [Backend Development](backend-development.md) for where each piece belongs):

| Piece | Layer | Responsibility |
|---|---|---|
| REST controller | Infrastructure | Request mapping, HTTP status codes, response serialization, error translation. No business logic. |
| Service method | Application | Orchestrates entities, repositories, and ports to implement the use case. |
| DTOs and mappers | Application | The shapes sent to and received from the outside world, and the translation to and from domain entities. |
| Domain entity method | Domain | Enforces the rules: valid state transitions, invariants, review-flag propagation. |

HTTP-level concerns stay in the controller. They shouldn't leak into services or the domain model.

## Identity and authorization

Requests reach the backend already authenticated: Oathkeeper validates the session and injects the resolved identity as the `X-User` header. Endpoints read the caller from that header and never validate sessions themselves.

For authorization, call `PermissionService` (the Keto adapter) rather than writing relationship checks locally. A failed check should surface as `403`. See [Architecture › Security › Zero-Trust Perimeter](../architecture/security/zero-trust-perimeter.md) for the full request path.

## Status codes

The existing endpoints follow a consistent convention, which new ones should match:

| Code | When |
|---|---|
| `400` | Malformed input or failed validation. |
| `403` | The caller lacks the required Keto permission. |
| `404` | The target entity doesn't exist (or, for slug search, isn't visible to the caller). |
| `409` | A constraint violation, such as a duplicate functionality label within a project. |

For slug-based lookup specifically, an entity the caller can't access is reported exactly like one that doesn't exist, so the endpoint can't be used to probe for entities the user shouldn't know about.

## Designing DTOs

DTOs are intentionally partial depending on context: list endpoints return only what a list needs, while detail endpoints populate the full graph (the requirement DTO's `children` collection is the clearest example). When you add an endpoint:

- Return only the fields the calling use case needs.
- State clearly, in naming or documentation, which fields are populated, so frontend code doesn't silently assume a field is always present. See [Frontend Development](frontend-development.md#partial-dtos).
- If the UI needs to know what the caller may do, surface it as an explicit field (like `editPermission` or the bucketed `FunctionalitiesResponse`) rather than expecting the frontend to infer it.

## State changes and side effects

Endpoints that change an entity's state should delegate the transition to the domain entity so the rules live in one place, and should let the existing propagation mechanism handle review flags: modifying a stakeholder, document, or requirement flags its observers as pending review, as described in [Architecture › Lifecycle and Workflows](../architecture/lifecycle-and-workflows.md).

Endpoints that edit an entity should also respect the [entity locking](../architecture/concurrency.md) mechanism: only the user holding the lock may submit changes to it.

!!! warning "Cross-service operations"
    Operations that change both the database and object storage (bulk document deletion is the main example) aren't currently wrapped in a distributed transaction or compensating action. If you add an endpoint with that shape, be aware that a failure partway through can leave the two stores inconsistent.

## Testing an endpoint

Backend integration tests exercise a full vertical slice: a real HTTP request to a real controller, through the Spring Security filter chain with an injected identity, into the service and repository layers against a Testcontainers database. A new endpoint should have tests covering at least its success path plus the error cases above (`400`, `403`, `404`, and `409` where applicable). See [Testing › Functional Testing](../testing/functional-testing.md).