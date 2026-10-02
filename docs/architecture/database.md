# Database

The relational schema is a direct projection of the domain model onto PostgreSQL. A few design decisions shape how it's structured.

## Central aggregation around `project`

Every primary entity — `functionality`, `requirement`, `stakeholder`, `document` — carries a `project_id` foreign key. This makes the project the natural access-control boundary and simplifies bulk operations such as project export or archival.

## Flat requirement table with a discriminator

Rather than splitting functional and non-functional requirements into separate tables, a single `requirement` table is used with a `requirement_type` enum column acting as a discriminator. Fields exclusive to non-functional requirements (`measurement_unit`, `operator`, `actual_value`, `target_value`, `threshold_value`) are nullable. This avoids a join on every requirement query while keeping the schema compact, at the cost of some unused columns on functional-requirement rows.

## Self-referential nesting

The `parent_id` column on `requirement` implements hierarchical nesting without a separate closure table. The dynamic identifier and the floating-point `order_value` are recalculated at the application layer whenever requirements are reordered, so the database stores only the raw float rather than a sequence integer — avoiding full-table renumbering on every reorder.

## Explicit observer join tables

The many-to-many relationships between requirements and their observers — stakeholders, documents, and peer requirements — are represented as three dedicated join tables: `stakeholder_observer_requirement`, `document_observer_requirement`, and `requirement_observing`. Keeping these separate makes the observer pattern explicit at the schema level and allows indexed traversal from either side of each relationship. See [Lifecycle and Workflows](lifecycle-and-workflows.md) for how these tables drive the pending-review cascade.

## Type-agnostic entity lock

The `entity_lock` table identifies the entity being locked by an (`entity_id`, `entity_type`) pair rather than a typed foreign key, so a single table covers locks on any entity type without schema changes. A `system_wide` flag distinguishes locks that span the entire system from those scoped to a project. See [Concurrency](concurrency.md).

## Deferred integration for access control

The `app_user` table stores only identity and administrative attributes. There is no schema-level relationship linking users to projects or functionalities — those associations are managed entirely by Ory Keto as ReBAC tuples, outside the relational schema. The only structural link between users and domain entities is through `entity_lock`, where a `user_id` foreign key records who holds each lock.

## Enumerated state fields

Lifecycle states (`ProjectState`, `RequirementState`), the `ComparisonOperator`, and the `requirement_type` discriminator are all stored as database enumerations, ensuring only controlled values can be persisted and that state transitions are enforced at the application layer before reaching the database.