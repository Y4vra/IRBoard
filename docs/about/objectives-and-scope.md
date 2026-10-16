# Objectives and Scope

## What IR-Board does

IR-Board provides a centralized environment for defining, organizing, validating, and maintaining software requirements across a project's lifecycle. Specifically, it supports:

- **Methodological compliance.** Requirements can be documented following recommendations from **IEEE 830** and the **ISO/IEC/IEEE 29148** standard, covering both the structure of individual requirements and their lifecycle management.
- **Hybrid documentation.** Traditional artifacts (functional and non-functional requirements, structured identifiers, hierarchical decomposition) sit alongside lighter Agile concepts such as user story-style descriptions, so a team isn't forced to pick one paradigm.
- **Relation-Based Access Control (ReBAC).** Permissions are derived dynamically from the relationships between users, projects, and functionalities, rather than from a fixed set of global roles. See [Access Control](../user-guide/access-control.md) for how this looks in practice.
- **Full lifecycle management.** Projects, functionalities, requirements, stakeholders, and documents all move through explicit states (active, deactivated, removed, and similar), with relationships between entities preserved rather than deleted outright.
- **Document management.** Files can be uploaded and linked to requirements, contributing to traceability by keeping supporting material attached to the requirement it justifies.
- **Collaboration.** Entity locking prevents two users from editing the same entity at the same time. See [Concurrency](../architecture/concurrency.md) for the underlying mechanism.
- **Basic observability.** Application logs and system metrics are collected and exposed through Grafana, supporting debugging, maintenance, and operational monitoring of a deployment.

The platform is built with extensibility in mind: components such as the identity provider, mail server, or object storage backend are accessed through abstraction layers, so they can be swapped for production-grade alternatives without touching business logic.

## What's outside the current scope

A few things are deliberately left out, either because they belong to a different layer of responsibility or because they're better served by dedicated tools:

- **Hardening of the observability infrastructure itself.** Logs and metrics are collected, but securing, isolating, and auditing the observability stack (Grafana, Loki, Prometheus) is treated as an infrastructure concern.
- **Advanced dashboards and alerting.** IR-Board exposes the data needed for monitoring; building comprehensive operational-intelligence dashboards or automated incident response on top of it is not part of the application itself.
- **Integration with external third-party platforms** such as external issue trackers, project management tools, or other enterprise systems.
- **Production email infrastructure.** Development and self-hosted deployments use a local test mail server (Mailpit). Configuring a real SMTP provider, domain verification, and deliverability (SPF, DKIM, DMARC) is left to the operator.
- **Large-scale deployment orchestration.** The system is containerized and reproducible, but advanced orchestration (auto-scaling, multi-region deployment, and similar) is left to whichever platform you deploy it on. See [Deployment](../deployment/index.md).

For a list of specific features that are provisioned but not yet fully wired up (like diagram embedding or PDF export of requirements), see the relevant architecture or user guide pages — each notes its current state rather than assuming full coverage.

## Assumptions

A few assumptions shape how the platform behaves:

- Requirements evolve through controlled modification, validation, and approval rather than direct deletion — history and traceability are treated as more valuable than fast removal.
- A single instance can host multiple projects run by different groups of people, which is why permissions are scoped per-project rather than assigned globally.
- Users are expected to have basic familiarity with software development and requirements engineering terminology; the platform doesn't attempt to judge whether a requirement is correct from a business perspective — that responsibility stays with stakeholders and project members.
- External identity and authorization providers (the Ory ecosystem, by default) are treated as replaceable infrastructure, not as a fixed dependency of the business logic.