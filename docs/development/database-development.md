# Database Development

The domain model is implemented with **JPA (Java Persistence API)**: each domain entity maps to a relational table, and relationships in the class diagram translate into JPA associations (one-to-many, many-to-one, many-to-many). For the schema itself and the reasoning behind it, see [Architecture › Database](../architecture/database.md). This page covers the conventions to follow when changing it.

## Identifiers

Every persistent entity follows the same three-tier identifier scheme:

| Identifier | Purpose | Exposed externally? |
|---|---|---|
| `id : bigint` | Internal primary key, managed by the database. | No |
| `entity_identifier` / slug | Stable, unique, human-referenceable identifier, generated from context (project, entity type) plus a collision-resistant random component. Used for lookup and traceability. | Yes |
| Dynamic identifier (requirements only) | Human-readable, position-dependent identifier such as `FR-UM-001.1`, recalculated when requirements are reordered or nested. | Yes |

New entities that need to be referenced from outside the system should carry a slug generated through `EntitySlugService` rather than exposing the numeric `id`.

## Mapping conventions

- **Inheritance** — the abstract `Requirement` entity uses JPA **single-table inheritance**. `FunctionalRequirement` and `NonFunctionalRequirement` share the `requirement` table, distinguished by a `requirement_type` discriminator column. Fields specific to non-functional requirements are nullable for functional-requirement rows. If you add a field to one subtype, make it nullable on the shared table.
- **Enumerations** — lifecycle states (`ProjectState`, `RequirementState`), `ComparisonOperator`, and the discriminator are stored as database enumerations. State transition rules are enforced at the **application/domain layer** before anything reaches the database, so don't rely on database constraints alone to reject an invalid transition.
- **Nesting** — requirement hierarchy is a self-referential foreign key (`parent_id`). There's no closure table; any traversal logic is handled at the application layer.
- **Ordering** — requirements carry a floating-point `order_value` so reordering doesn't require renumbering. Dynamic identifiers are recalculated at the application layer after reordering.

## Relationships between entities

Traceability relationships between requirements, stakeholders, and documents are modeled as **explicit join tables** rather than embedded references:

- `stakeholder_observer_requirement`
- `document_observer_requirement`
- `requirement_observing` (peer requirement cross-links)

If you add a new kind of observable relationship, follow the same pattern: a dedicated join table, so the relationship is explicit at the schema level and traversable from either side. These tables are what drive the pending-review cascade described in [Architecture › Lifecycle and Workflows](../architecture/lifecycle-and-workflows.md).

## What does *not* belong in the schema

**User-to-project and user-to-functionality relationships.** Those are managed entirely by Ory Keto as ReBAC tuples, not in PostgreSQL. The `app_user` table stores only identity and administrative attributes; the only structural link between a user and a domain entity is `entity_lock.user_id`. Don't add a `user_project` join table — grant or check access through `PermissionService` instead. See [Architecture › Security › ReBAC](../architecture/security/rebac.md).

## Deletion policy

No entity may be permanently deleted without first passing through the defined deactivation and removal states. Where a parent is removed, the appropriate states must have been traversed at least on the parent. Any new deletion logic should preserve this rather than short-circuiting to a hard delete.

## Testing against a real database

Backend integration tests run against an isolated PostgreSQL instance provisioned by **Testcontainers**, so schema and mapping changes are exercised against real PostgreSQL behavior rather than an in-memory substitute. See [Testing › Functional Testing](../testing/functional-testing.md).