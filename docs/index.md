# IR-Board

IR-Board is a **Requirements Management Platform (RMP)** for teams that need to document, trace, and govern software requirements throughout their lifecycle.

It combines structured requirements engineering — aligned with **IEEE 830** and **ISO/IEC/IEEE 29148** — with lighter Agile artifacts such as user stories, so formal documentation and iterative delivery can coexist in the same project rather than requiring separate, disconnected tools.

## What IR-Board does

- **Requirements lifecycle management** — functional and non-functional requirements move through a defined state machine (pending approval, approved, finished, deactivated, removed), with review flags raised automatically whenever a linked entity changes.
- **Traceability** — every requirement, stakeholder, and document carries a stable identifier, and horizontal links between them make forward, backward, and horizontal traceability something you can query rather than something you have to remember.
- **Relation-Based Access Control (ReBAC)** — permissions are derived from the relationships between users, projects, and functionalities rather than from static global roles, enforced behind a Zero-Trust perimeter.
- **Collaboration support** — entity locking prevents two people from editing the same thing at once, and stakeholder and document management keep supporting material attached to the requirements it justifies.
- **Operational visibility** — logs and metrics are collected from every service and surfaced through Grafana, giving administrators insight into the health of a running deployment.

## Where to go next

| If you want to... | Start here |
|---|---|
| Understand what the project is and why it exists | [About](about/index.md) |
| Use IR-Board as an end user | [User Guide](user-guide/index.md) |
| Understand how the system is built | [Architecture](architecture/index.md) |
| Set up a local environment and contribute code | [Development](development/index.md) |
| Deploy IR-Board | [Deployment](deployment/index.md) |
| Understand how the system is tested | [Testing](testing/index.md) |

## Project status

IR-Board is an actively evolving open-source project. Some areas — such as diagram embedding and PDF export of requirements — are provisioned in the architecture but not yet fully wired up; these are tracked as open work rather than hidden gaps. See each section's index for the current state of that area.