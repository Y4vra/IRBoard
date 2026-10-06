# Relation-Based Access Control (ReBAC)

Rather than assigning users a fixed, system-wide role, IR-Board determines permissions from the **relationships** between a user and specific resources — a model commonly called ReBAC, implemented here via **Ory Keto**, whose design is inspired by Google's internal Zanzibar system.

## Why relationships instead of static roles

A single global role (e.g. "developer") says nothing about *which* project or functionality that role applies to. In a system where one instance hosts multiple projects run by different, possibly overlapping groups of people, a static role model would either grant far too much access by default or require an explosion of role variants ("developer on project A", "developer on project B", ...). ReBAC avoids this by making the relationship itself — "this user is a project manager **of this project**" — the unit of authorization.

## The relationship levels

**System level** — a user is either an `admin` or not. This is a coarse, system-wide distinction covering project creation, user invitation, and similar global actions. It does **not** grant access to any specific project's contents.

**Project level** — scoped to an individual project or functionality:

| Relationship | Scope | Grants |
|---|---|---|
| `ProjectManager` | Project | Add/edit/disable functionalities, requirements, documents; link users to the project. |
| `RequirementEngineer` | Functionality | Add, modify, disable requirements in that functionality; work with project documents. |
| `Stakeholder` | Functionality | Read-only access to that functionality's requirements and the project's documents. |

See [Access Control](../../user-guide/access-control.md) for the user-facing explanation of these roles, including how overlapping relationships resolve (the highest-level permission wins).

## How this is modeled in Keto

Ory Keto stores authorization as **relationship tuples** and evaluates permission checks against them, using the **Ory Permission Language (OPL)** to define how relationships map to concrete permissions (e.g. "a user with a `ProjectManager` relationship to a project can `edit` that project's functionalities").

Because these relationships live in Keto rather than the application's relational schema, there's no `user_project` join table in PostgreSQL — see [Database › Deferred Integration for Access Control](../database.md#deferred-integration-for-access-control). The backend writes and queries Keto directly through the `PermissionService` port described in [Backend](../backend.md).

## What this buys, and what it costs

ReBAC lets permission logic stay out of both the relational schema and scattered application-level checks — authorization questions ("can this user edit this functionality?") are answered by a single purpose-built service rather than re-derived ad hoc wherever they're needed. The cost is an additional moving part in the stack, and a genuinely different mental model from role-based access control if that's what you're used to — see [Zero-Trust Perimeter](zero-trust-perimeter.md) for how Keto fits into the request path in practice.