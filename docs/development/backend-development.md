# Backend Development

This page covers the conventions to follow when adding or modifying backend code. For the architectural reasoning behind these conventions, see [Architecture › Backend](../architecture/backend.md).

## Where new code belongs

The backend follows a hexagonal/clean-architecture split into `domain`, `application`, and `infrastructure`. As a rule of thumb when adding a new capability:

- **Domain rules** — state transitions, validation invariants — belong in the domain entities themselves, **not** in services. If you're writing an `if` statement that decides whether a state transition is allowed, it almost certainly belongs on the entity, not in a service method.
- **Orchestration** of multiple entities, repositories, or external ports belongs in the **application layer's** service classes.
- Anything that talks to **Kratos, Keto, the object storage backend, or the database directly** belongs in **infrastructure**, behind the existing port interfaces (`IdentityService`, `PermissionService`, `ObjectStorageService`). Don't call an external client directly from a service class — go through the port.

## Permission checks

New endpoints that require permission checks should call into `PermissionService` (the Keto adapter) rather than re-implementing relationship checks locally. This keeps authorization logic centralized and consistent with the [ReBAC model](../architecture/security/rebac.md) — a check written ad hoc in a service method is both a duplicate of logic that already exists and a potential inconsistency with how Keto actually evaluates the same relationship elsewhere.

## Testing expectations

- **Unit tests** exercise domain entities, services, and infrastructure adapters in isolation, using Mockito to mock collaborators only where necessary. Domain entities are generally tested without mocks, since they're self-contained business objects.
- **Integration tests** extend the shared `IrBoardBaseTest` base class, which provisions a Testcontainers-backed PostgreSQL instance and replaces Ory ecosystem components with Mockito beans (`KetoClient`, `MinioClient`, `MinioObjectStorageClient`), injecting pre-authenticated request contexts via the `X-User` header instead of requiring live Kratos sessions. See [Testing › Functional Testing](../testing/functional-testing.md) for the full picture, including the helper methods this base class provides (`allowEdit`-style permission stubs, entity builders, typed HTTP request helpers).

Whatever you add, it needs to pass the SonarQube quality gate described in [Contributing](contributing.md) before merging.