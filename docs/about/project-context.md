# Project Context

## Requirements engineering, briefly

Requirements engineering is the discipline of identifying, documenting, validating, and managing what a software system needs to do before — and while — it's built. It exists to bridge the gap between what stakeholders need and what a development team implements, reducing ambiguity, rework, and disputes over scope.

Two broad families of standards and practices are relevant here:

- **IEEE 830** defines what a good Software Requirements Specification looks like: correct, unambiguous, complete, consistent, verifiable, modifiable, and traceable.
- **ISO/IEC/IEEE 29148** takes a lifecycle view — requirements aren't a static document but managed entities that evolve alongside the system, with attributes like status, priority, source, and dependencies tracked over time.

Agile methodologies approach the same problem differently: instead of specifying everything up front, they favor short iterations, lightweight documentation (user stories being the most common artifact), and continuous feedback. This works well for adaptability, but tends to sacrifice some of the traceability and governance that formal standards provide.

IR-Board doesn't pick one side. It applies structured documentation and identifier-based traceability inspired by IEEE 830, and lifecycle management concepts from ISO/IEC/IEEE 29148, while also supporting lighter, Agile-friendly artifacts — so a team isn't forced to abandon formal rigor to move quickly, or abandon agility to stay compliant.

## Where IR-Board fits relative to other tools

Existing requirements and lifecycle management tools tend to specialize in one direction:

- **Enterprise ALM/RMP suites** (IBM Engineering Requirements Management DOORS Next, Jama Connect, Polarion ALM) and extended issue trackers (Jira, Azure DevOps) offer mature, end-to-end traceability and workflow integration, but are typically proprietary, complex to configure, and priced for large organizations. Their support for modern access-control models like ReBAC and Zero-Trust is usually limited or heavily abstracted.
- **Open-source alternatives** tend to focus narrowly on either issue tracking or lightweight Agile backlog management, rather than covering a full requirements engineering lifecycle aligned with formal standards.

IR-Board is built to sit between these: an open, self-hostable platform that combines structured requirements engineering, Agile-friendly artifacts, a relationship-based access control model, and collaborative lifecycle management, without the licensing overhead or configuration complexity of enterprise suites.

## Key concepts used throughout the documentation

A few terms recur across this documentation and are worth defining once:

| Term | Meaning |
|---|---|
| **Stakeholder** | A person or party with an interest in a project — an end user, sponsor, or team member whose needs shape what the system must do. |
| **Requirement** | A documented statement of a capability, condition, or constraint the system must satisfy. Split into **functional** (what the system does) and **non-functional** (quality attributes like performance or security). |
| **Traceability** | The ability to follow relationships between a requirement and the stakeholders, documents, or other requirements connected to it — forward, backward, or horizontally. |
| **ReBAC** | Relation-Based Access Control — permissions determined by relationships (e.g. "this user is a project manager on this project") rather than static, system-wide roles. |
| **Zero-Trust** | A security model that verifies every request rather than assuming trust based on network location or prior authentication. |

See [Architecture](../architecture/index.md) for how these concepts map onto the actual system design.