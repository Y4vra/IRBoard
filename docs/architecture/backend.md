# Backend

The backend blends **hexagonal architecture** (ports and adapters) with the explicit layering of **Clean Architecture**: three concentric layers — domain, application, and infrastructure — with a strict dependency rule that outer layers depend on inner ones, never the reverse.

## Layers

### Domain

The innermost layer, with no framework dependencies. Contains:

- The main entities and their lifecycle rules (state transitions, validation invariants).
- Repository **interfaces** (not implementations) through which persistence is accessed.
- Enumerated types and value objects shared across the domain.
- `EntitySlugService`, responsible for generating the structured, semantically meaningful slugs assigned to each entity. Slug generation lives here rather than in infrastructure because the slug format encodes domain knowledge — project, entity type, and a collision-resistant random component.

### Application

Orchestrates use cases by coordinating domain entities, repositories, and external service ports. Contains:

- Service classes implementing the system's operations.
- DTOs used to communicate with the outside world, and mappers between DTOs and domain entities.
- Three port interfaces representing external dependencies: `IdentityService`, `PermissionService`, and `ObjectStorageService` — abstracting Ory Kratos, Ory Keto, and the object storage backend respectively.

Keeping these port definitions in the application layer (rather than infrastructure) means business logic never depends on which specific technology fulfills each role.

### Infrastructure

The outermost layer, holding all technology-specific implementations (the adapters, in hexagonal terms):

- **REST controllers** exposing the system's endpoints and handling HTTP concerns.
- **Port implementations** — the Kratos, Keto, and object storage clients.
- **Persistence** — Spring Data JPA repository implementations.
- **Configuration** — Spring context wiring, security settings, and environment-specific properties.

## Why this separation

- Domain and application logic can be tested in complete isolation, with Ory ecosystem components replaced by mocks injected through the port interfaces.
- Any of the three external services can be swapped (a different identity provider, a different S3-compatible store) without touching business logic.
- HTTP-level concerns (request mapping, response serialization, error translation) stay out of the domain model entirely.

New endpoints that require permission checks call into `PermissionService` rather than re-implementing relationship checks locally, keeping authorization logic centralized and consistent with the [ReBAC model](security/rebac.md).

## Entity identifiers

Each persistent entity carries an internal numeric primary key (`id: bigint`), not intended for external use. Entities that support external reference additionally carry a human-readable `entity_identifier` (or, for requirements, a dynamic identifier), generated from contextual information such as the containing project or functionality. Requirements also carry an `order_value`, a floating-point value supporting efficient reordering without renumbering — see [Database](database.md) for the schema this maps to.

## Known implementation trade-offs

- **Document transfer.** Uploads and downloads currently route the full file content through the backend rather than using presigned URLs for direct client-to-storage transfer. This is functional but adds avoidable backend load for large files; migrating to presigned URLs would limit the backend's role to authorization and metadata persistence.
- **Cross-service consistency.** Operations spanning both the database and object storage (most visibly bulk document deletion) aren't wrapped in a distributed transaction or compensating-action mechanism. A failure partway through can leave the two stores out of sync, requiring manual reconciliation.