# Concurrency

IR-Board enforces **single-writer concurrency** per entity through an explicit locking mechanism, preventing two users from editing the same project, functionality, requirement, stakeholder, or document at the same time.

## The `EntityLock` model

A lock is represented by the `EntityLock` entity, identified by an (`entity_id`, `entity_type`) pair rather than a typed foreign key — see [Database › Type-Agnostic Entity Lock](database.md#type-agnostic-entity-lock) for why this is modeled as a single table covering any entity type. Each lock is tied to the user holding it and the project it belongs to, with a `system_wide` flag distinguishing locks that span the whole system from project-scoped ones.

A user can hold only one lock at a time: acquiring a new lock automatically releases any other lock that user already held. This keeps the model simple — there's never a question of which of a user's several locks is "the active one."

## Acquisition and expiry

Locks time out after approximately **one hour**. Expiry is checked **at the point of acquisition**: when a user requests a lock on an entity that's already held, the existing lock row is checked —

- If it's expired, or already owned by the requesting user, it's deleted and replaced with a new lock for the requester.
- If it's not expired and held by someone else, the request is rejected.

The same expiry check gates write operations directly (`isLocked`, `isLockedByUser`), so an expired lock never blocks an edit — even before anyone has explicitly re-acquired it.

## A known limitation: stale lock display

The expiry check described above is **not** applied uniformly. The methods used purely for *listing* locks (`findLocksForProject`, `findSystemLocks`) return every `EntityLock` row regardless of whether it's expired. In practice, this means:

- A lock that has timed out isn't proactively deleted — the stale row remains until either the original holder explicitly releases it, or another user attempts to acquire the lock on that same entity (which triggers deletion as part of the acquisition flow).
- There is currently no scheduled job sweeping expired locks on its own.

The practical consequence: between the moment a lock expires and the next interaction with that specific entity's lock, the **frontend may still display the entity as held** by its original user, even though write operations against it are already correctly unblocked on the backend. These listing endpoints reflect **raw** lock state, not **effective** lock state.

If you're building a consumer of `findLocksForProject` or `findSystemLocks`, either filter by expiry client-side, or apply the same expiry check used for write-access gating to these query methods if a more accurate "currently locked" indicator is needed. A periodic cleanup job for expired locks is a reasonable addition, with care taken to avoid racing the lazy deletion that already happens during acquisition.

## User-facing behavior

See [User Guide › Documents](../user-guide/documents.md) and the other entity-specific user guide pages for how this surfaces in the interface: while editing an entity, other users see an indicator showing it's locked and by whom, and the lock releases automatically on save, on navigating to edit something else, or after the timeout described above.