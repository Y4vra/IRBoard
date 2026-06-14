// ===============================
// Configuración general del documento
// ===============================
#import "@preview/efilrst:0.3.2" as efilrst
#show ref: efilrst.show-rule
#show link: set text(fill: blue)
#show link: underline
#set page(
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 3cm),
  footer: context {
    let physical_page = counter(page).at(here()).first()
    if physical_page > 1 [
      #line(length: 100%, stroke: 0.5pt + gray)
      #v(-0.5em)
      #set text(size: 9pt, style: "italic", fill: gray.darken(30%))
      #counter(page).display()
    ]
  },
  header: context {
    if counter(page).get().first() > 1 [
      #set text(size: 9pt, style: "italic", fill: gray.darken(30%))
      #grid(
        columns: (1fr, 1fr),
        align: (left, right),
        [IR-Board], [Javier Carrasco Arango],
      )
      #v(-0.5em)
      #line(length: 100%, stroke: 0.5pt + gray)
    ]
  },
  header-ascent: 30%, // Espacio entre el encabezado y el cuerpo
)

#set text(
  font: "Inter",
  size: 11pt,
)

#set par(
  justify: true,
)
#set heading(numbering: none)

// ===============================
// Portada
// ===============================

#page(
  background: rect(
    width: 100% - 1.5cm,
    height: 100% - 1.5cm,
    stroke: 1pt + black,
  ),
)[
  #set text(font: "Times New Roman", size: 14pt)
  #grid(
    columns: (1.25fr, 0.5fr, 1fr),
    align: (left, right),
    image("./assets/logos/Emblema Universidad de Oviedo Horizontal Color.png"),
    [],
    image("./assets/logos/EII_logotipo_version_principal_PREFERIDO.png"),
  )
  #v(1fr)
  #align(center)[
    UNIVERSIDAD DE OVIEDO\
    ESCUELA DE INGENIERÍA INFORMÁTICA\
    GRADO EN INGENIERÍA INFORMÁTICA DEL SOFTWARE
  ]

  #v(1fr)
  #align(center)[#text()[#strong()[TRABAJO DE FIN DE GRADO]]]

  #v(1fr)
  #align(center)[
    #title()[#text(size: 14pt)[IR-Board]]
    #text()[Requirements Management Platform]
  ]
  #v(1fr)

  #align(center + bottom)[
    #set text(size: 11pt)
    #strong()[Author:]\
    Javier Carrasco Arango\
    #strong()[Tutors:]\
    Jorge Álvarez Fidalgo\
    Benjamín López Pérez
    #v(1mm)
    #datetime.today().display()
  ]
]

#pagebreak()
#set page(numbering: "I")
= Declaration of originality
I, <Name>, with DNI <DNI> and UO294532, hereby declare that this work is completely original and all sources used during the development of it have been correctly cited.
In Avilés, Asturias, on the xx of xx of 2026,



Signed: <Sign>
#pagebreak()
= Abstract
IR-Board is a Requirements Management Platform (RMP) designed to support the complete lifecycle of software requirements engineering. The project addresses the need for a unified environment that combines the rigor of traditional requirements specification standards with the flexibility of modern Agile methodologies. The platform is developed in accordance with the IEEE 830 and ISO/IEC/IEEE 29148 standards, providing structured support for the elicitation, documentation, validation, and maintenance of software requirements.

The system incorporates a hybrid documentation approach, enabling the management of traditional requirements engineering artifacts such as use cases, flowcharts, and decision tables, alongside Agile practices including user stories and story mapping. To ensure secure and granular access control, IR-Board implements a Relation-Based Access Control (ReBAC) model within a Zero-Trust architecture, allowing permissions to be determined dynamically according to user relationships with projects and functionalities.

In addition, the platform provides quality of life automations through controlled state transitions and approval workflows, improving traceability and governance. Collaborative features, including stakeholder management and concurrency control mechanisms, facilitate coordinated work among multiple users while preventing data conflicts. Finally, an integrated observability framework provides basic monitoring, operational metrics, and audit logging to support system reliability and administration. Through the integration of these capabilities, IR-Board offers a comprehensive solution for modern requirements engineering and project governance.

= Keywords
Requirements Management Platform, Software Requirements Engineering, IEEE 830, ISO/IEC/IEEE 29148, Agile Methodology, Hybrid Documentation, User Stories, Use Cases, Relation-Based Access Control (ReBAC), Zero-Trust Architecture, Requirements Lifecycle Management, Traceability, Collaborative Engineering, Concurrency Control, Observability, Audit Logging, Project Governance, Workflow Automation.
#pagebreak()
= About the document
This document follows a template provided by Jorge Álvarez Fidalgo.

It has been adapted and modified to fit the specific needs of the project during its development.

= Special thanks to

#pagebreak()
// Índice
#outline(
  title: [Index],
  indent: auto,
  depth: 2,
)
#pagebreak()
// Índice de Figuras
#outline(
  title: [Figure Index],
  target: figure.where(kind: image),
)
// Índice de Tablas
#outline(
  title: [Table Index],
  target: figure.where(kind: table),
)

#set heading(numbering: (..nums) => {
  let n = nums.pos()
  if n.len() == 1 {
    return "Chapter " + str(n.at(0)) + ". "
  } else {
    return n.map(str).join(".") + " "
  }
})
// función que auto separa secciones
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  it
}

#set page(numbering: "1")
= Introduction // 1
#counter(page).update(2)
== Object
The primary object of this project is the design and implementation of *IR-Board*, a comprehensive Requirements Management Platform (RMP) designed to support the full lifecycle of software requirements engineering. The system aims to bridge the gap between traditional documentation standards and modern agile methodologies, providing a centralized environment for eliciting, refining, and managing requirements.

Key objectives of the system include:

- *Methodological Compliance:* Implementing a framework that follows international standards for requirements specification, specifically the *IEEE 830* guidelines and the *ISO/IEC/IEEE 29148* standard.
- *Hybrid Documentation Support:* Providing tools for both traditional modeling (use cases, flowcharts, and decision tables) and Agile practices (user story mapping and management).
- *Relation-Based Access Control (ReBAC):* Developing a sophisticated security model where permissions are not merely role-based but determined by the dynamic relationship between users and specific entities (Projects and Functionalities), implemented through a *Zero-Trust* architecture.
- *Lifecycle and State Management:* Automating the management of requirement states (Pending Approval, Approved, Deactivated, etc.) and project lifecycles to ensure data integrity and traceability.
- *Collaborative Engineering:* Facilitating stakeholder management and real-time concurrency control to prevent data conflicts during collaborative editing sessions.
- *System Observability:* Integrating a high-standard monitoring stack to provide administrators with full visibility into the infrastructure's health and security audit logs.

== Background
Software requirements engineering is a fundamental phase in the software development lifecycle, as it defines what a system must achieve before design and implementation begin. It also helps bridge the gap between client needs and the technical rigor required to reduce misunderstandings, contractual ambiguity, and potential legal issues. To ensure quality and consistency, standardized approaches such as IEEE 830 and ISO/IEC/IEEE 29148 have been widely adopted. These standards emphasize structured documentation, traceability, validation, and completeness of requirements, making them particularly suitable for large-scale and regulated software systems.

In contrast, modern software development has increasingly shifted toward Agile methodologies, which prioritize iterative development, rapid feedback, and lightweight documentation. Techniques such as user stories and story mapping allow teams to respond quickly to changing requirements and stakeholder needs. However, Agile approaches often reduce formal structure, which can make long-term traceability and governance more challenging.

As a result, many organizations now operate in hybrid environments where both traditional and Agile requirements engineering practices are used simultaneously.

== Current state
Despite the coexistence of traditional and Agile methodologies, existing requirements management tools tend to favor one approach over the other. Traditional tools focus heavily on structured documentation and compliance with formal standards, while Agile-oriented platforms emphasize backlog management and iterative workflows. This separation often leads to fragmented processes, requiring teams to use multiple disconnected tools.

This fragmentation can result in reduced traceability, inconsistencies between requirement representations, and difficulties in maintaining lifecycle integrity across different development methodologies. Additionally, many existing systems provide limited support for advanced access control models, relying mainly on role-based access control (RBAC), which lacks flexibility in dynamic, collaborative environments.

At the same time, there is a broad ecosystem of commercial requirements management and product lifecycle tools that aim to address these challenges by offering more integrated workflows. Platforms such as IBM Engineering Requirements Management DOORS Next, Jama Connect, Polarion ALM, and modern lifecycle tools like Atlassian Jira (with extensions) or Azure DevOps provide end-to-end support for requirements tracking, traceability, collaboration, and integration with development pipelines. These systems are often highly mature and feature-rich, supporting compliance workflows, test management, and cross-team collaboration within large enterprises.

However, despite their extensive capabilities, these solutions are typically proprietary, complex to configure, and associated with significant licensing costs. They are often optimized for enterprise-scale environments, which makes them less accessible for small teams, academic projects, or organizations seeking flexible customization. Furthermore, while they provide strong workflow integration, their support for modern architectural security models such as Relation-Based Access Control (ReBAC) and Zero-Trust principles remains limited or heavily abstracted.

At the same time, there is an increasing demand for more sophisticated system capabilities such as real-time collaboration, automated workflow and state management, and integrated observability for monitoring system health and security. Emerging security models such as ReBAC and Zero-Trust architectures are not yet widely adopted in most requirements management platforms.

Within this landscape, open-source alternatives remain relatively limited in scope and maturity. Existing open-source tools tend to focus on either issue tracking or lightweight Agile backlog management rather than providing a full requirements engineering lifecycle aligned with formal standards such as IEEE 830 and ISO/IEC/IEEE 29148. As a result, there is a clear gap in the market for an open, extensible, and standards-compliant platform that combines structured requirements engineering, Agile methodologies, advanced access control mechanisms, and collaborative lifecycle management within a single coherent system.

== Definitions and Abbreviations
=== General concepts
- #strong("RMP (Requirements Management Platform)"): A software system designed to support the full lifecycle of software requirements, including elicitation, specification, validation, traceability, and change management.
- #strong("Requirements Engineering (RE)"): A discipline of software engineering focused on defining, documenting, and maintaining software requirements throughout the system lifecycle.
- #strong("IEEE 830"): A legacy IEEE standard for software requirements specification, defining structure and content of Software Requirements Specifications (SRS).
- #strong("ISO/IEC/IEEE 29148"): The current international standard for requirements engineering processes and requirements specification quality.
- #strong("Agile Methodology"): An iterative software development approach that emphasizes incremental delivery, collaboration, and adaptability to change.
- #strong("User Story"): A short description of a feature from an end-user perspective, commonly used in Agile development.
- #strong("Use Case"): A structured description of a system’s behavior in response to external actors.
=== Security and access control
- #strong("ReBAC (Relation-Based Access Control)"): An authorization model where access permissions are determined by relationships between entities (e.g., user–project, user–role–resource), rather than static roles.
- #strong("RBAC (Role-Based Access Control)"): A traditional access control model where permissions are assigned to roles, and users inherit permissions through assigned roles.
- #strong("Zero-Trust Architecture"): A security model that assumes no implicit trust in any user or system component, requiring continuous verification of identity and permissions.
- #strong("OIDC (OpenID Connect) (implied via Ory ecosystem context)"): An authentication layer built on OAuth 2.0 used for identity verification.
=== Protocols and data modelling concepts
- #strong("SMTP (Simple Mail Transfer Protocol)"): The standard protocol used for sending emails between servers.
- #strong("Internal Unique Identifier (ID)"): A system-generated identifier used internally to uniquely identify an entity in the database.
- #strong("Dynamic Identifier"): A human-readable structured identifier generated from relationships and context (e.g., FR-UM-001).
- #strong("Slug"): A URL-safe unique string identifier, typically used for routing or external references.
- #strong("Floating Point Ordering"): A technique for ordering entities (e.g., requirements) using floating-point values to allow efficient reordering without full renumbering.
- #strong("Entity"): A domain object within the system such as a project, requirement, stakeholder, or document.
- #strong("Audit Log"): A record of system actions used for traceability and accountability.
=== Abbreviations
- API – Application Programming Interface
- DNS – Domain Name System
- UI – User Interface
- UX – User Experience
- SRS – Software Requirements - Specification
- MTA – Mail Transfer Agent
- TLS – Transport Layer Security
- JWT – JSON Web Token
- CLI – Command Line Interface
- CI/CD – Continuous Integration / Continuous Deployment

== Scope

== Assumptions and Constraints

= Theoretical Background //2
explain the different identifiers, dynamic, slug and reordering
= Feasibility Study and Alternatives Analysis //3

= Initial Project Planning and Management //4

== Stakeholder Identification

== OBS and PBS

== Initial Planning

== Risk Analysis

== Initial Budget
cite the DPPI enterprise definition
= System Analysis //5

== Users and Characteristics
In this project, instead of conventional system-wide roles, the approach I found fit best the nature of requirement management systems was a relation-based role system. Therefore, two sets of user permissions can be defined: system-level permissions and project-level permissions.
#figure(
  table(columns: 2)[#strong[User]][#strong[Description]][Admin][Has access to project creation, deactivation, purge of removed projects... Still needs a project role to add to or modify a project, even if created by himself. Can link users as project manager to a project.][Basic][A basic user, the default. Has access to his profile management.],
  caption: "List of permission levels on the system",
)
A user is either an admin or not. Due to zero-trust, unless he is added as project manager to it he wont be able to modify any project, even if it was created by himself.
#figure(
  table(columns: 2)[#strong[User]][#strong[Description]][ProjectManager][Access to add, edit and disable functionalities, requirements within those functionalities, documents, and can link users to that project.][RequirementEngineer][Linked to a functionality, has access to add, modify and disable requirements in that functionality, as well as with documents linked to the project.][Stakeholder][Linked to a functionality, has read-only access to the requirements of that functionality, and documents linked to the project.],
  caption: "List of permissions within a project",
)
These permissions overlap, in case a user is linked to a project in several ways. In that situation, due to this overlap, the most high level permission prevails.

For example, if a user is listed as requirement engineer and stakeholder in the same functionality, the user will be able to view (both permissions), and add, modify, disable and all other requirement engineer actions as well.

== Requirements Analysis
Here are presented some diagrams that helped during the requirement edduction process.

#figure(image("./assets/diagrams/ProjectStates.svg"), caption: "Lifecicle of a project entity")
#strong[Active] - A project entity that is currently in progress.

#strong[finished] - A project entity that has been implemented. As the nature of a project is that one never ends, it does not represent an end state.

#strong[Deactivated] - A project entity that has been cancelled, postponed etc; A project that is not finished but is not currently in use.

#strong[Removed] - A project entity that has been archived for removal, placed in the trash bin in case it is needed as last resort.

#figure(image("./assets/diagrams/RequirementStates.svg"), caption: "Requirement entity's state diagram")
#strong[PendingApproval] - A requirement entity that has not been validated by a stakeholder as it currently is.
It's a complex state to ease development, as the pending review can be seen as an extension of itself, and therefore can be a simple boolean flag.

#strong[PendingReview] - A requirement entity that needs attention and possible modification, due to a change on a linked entity. Expected to be purely a flag.

#strong[Approved] - A requirement entity that has been validated by the appropiate stakeholders with the project manager outside the system.

#strong[Deactivated] - A requirement entity has been deactivated for some reason, be cancelled or an error, and does not count towards the metrics of the project.

#strong[Removed] - A requirement entity that has been deemed innecessary to the project. It is hidden from view, archived.

== System Analysis

=== Class Analysis

=== Data Modeling

=== Process Modeling
A crucial process for the system is the updates triggered by modifications between observed and observer entities. To illustrate the flows depicted on the system, the following diagram is provided:
#figure(image("./assets/diagrams/ObservationFlows.svg"), caption: "Possible observation processes between entities")

#strong[Linking Arrows] - The arrows in this diagram refer to linked entities in a modified observer pattern, to allow to search for linked elements from both sides of the relation. The direction of the arrow expresses the flow from a observed element to the observer element, for example, a modification on a Stakeholder element would trigger an update() call to all requirements observing it.

=== User Interface Definition

== Requirements Specification

=== External Interfaces

=== Functional Requirements
#let PM_List = efilrst.reflist.with(
  name: "PM_List",
  list-style: "PM.1.1.1.",
)
#let SM_List = efilrst.reflist.with(
  name: "SM_List",
  list-style: "SM.1.1.1.",
)
#let RM_List = efilrst.reflist.with(
  name: "RM_List",
  list-style: "RM.1.1.1.",
)
#let UM_List = efilrst.reflist.with(
  name: "UM_List",
  list-style: "UM.1.1.1.",
)
#let DMM_List = efilrst.reflist.with(
  name: "DMM_List",
  list-style: "DMM.1.1.1.",
)
#let C_List = efilrst.reflist.with(
  name: "C_List",
  list-style: "C.1.1.1.",
)
#let SF_List = efilrst.reflist.with(
  name: "SF_List",
  list-style: "SF.1.1.1.",
)
#let O_List = efilrst.reflist.with(
  name: "O_List",
  list-style: "O.1.1.1.",
)
==== project management
#PM_List(
  [The system must allow an admin to create a project.],
  (
    [The system must require a Project name to generate a project correctly.],
    [The system must require a description to generate a project correctly.],
    [The system must require a user to be an admin of the system to generate a project correctly.],
    [The system must allow to optionally change the priority style set for the project, either:],
    (
      [Ternary (High, Medium, Low) Predefined.],
      [MOSCOW (Must, Should, Could or Won't have).],
    ),
  ),
  [The system must allow an admin to deactivate a project.],
  (
    [The system must ask for confirmation before deactivating.],
    [The system must put the project on read only mode.],
  ),
  [The system must allow an admin to reactivate a deactivated project.],
  [The system must allow an admin to modify an active project.],
  [The system must allow to link users with a project.],
  (
    [The system must allow an admin to link users to a project as project manager.],
    [The system must allow an admin or project manager linked to the project to link users to a functionality on said project as a stakeholder user.],
    [The system must allow a project manager to link users to one or more functionalities of a project as requirement engineers.],
  ),
  [The system must allow access to the project description/dashboard to users linked to it or a functionality of it.],
  (
    [The system must show the total split of requirements by their states (pie chart).],
    [The system must not take into account deactivated requirements toward any metric.],
    [The system must show the different functionalities of the project.],
  ),
  [The system must allow a project manager to mark as approved all elements in a project.],
  [The system must allow a project manager to add a functionality to a project.],
  (
    [A functionality needs a name and unique set of letters for its dynamic identifier.],
    [The system must automatically attempt to get the letters for the dynamic identifier from the name.],
    (
      [The system must take the first letter from every word in the name.],
    ),
    [The system must deny adding any functionality with an identifier matching another on the same project.],
    [The system must allow to use a custom functionality identifier.],
    [The system must automatically link the project manager to the new functionality.],
  ),
  [The system must allow a project manager to modify a functionality.],
  [The system must allow a project manager to deactivate a functionality.],
  (
    [The system must ask for confirmation before deactivating.],
    [The system must put the functionality (elements contained by it) on read only.],
  ),
  [The system must allow a project manager to reactivate a functionality.],
  [The system must allow a project manager to mark as approved all elements in a functionality.],
  [The system must allow a project manager to export the project's requirements onto a pdf file.],
)
==== Stakeholders management
#SM_List(
  [The system must allow any user linked with the project access to view its stakeholders.],
  (
    [The system must show stakeholders that are not removed.],
    [The system must show if a stakeholder is flagged as pending review.],
    [The system must show the identifier, the name and part of the description.],
    [The system must allow to view the details of a stakeholder.],
    (
      [The system must show all atributes of a stakeholder.],
      [The system must show all requirements linked to it.],
    ),
  ),
  [The system must allow a project manager to view its removed stakeholders.],
  [The system must allow a requirement engineer or a project manager to add a new stakeholder to a project.],
  (
    [The system must only allow a stakeholder to be added to a project the user is linked to.],
    [The system must require a name to generate a stakeholder.],
    [The system must require a description to generate a stakeholder.],
    [The system must generate the identifier for the stakeholder.],
  ),
  [The system must allow a project manager or requirement engineer to link a stakeholder to one or more requirements on the same project.],
  (
    [The system must only allow the user to link the stakeholder to a requirement on a functionality they are linked to.],
  ),
  [The system must allow a project manager or requirement engineer to unlink a stakeholder from one or more requirements.],
  (
    [The system must only allow the user to unlink a stakeholder from a requirement of a functionality they are linked to.],
  ),
  [The system must allow a requirement engineer or a project manager to deactivate a stakeholder from a project the user is linked to.],
  (
    [The system must flag all entities linked as pending review.],
    [The system must put the stakeholder on read only mode.],
  ),
  [The system must allow a requirement engineer or a project manager to enable a disabled stakeholder from a project the user is linked to.],
  (
    [The system must flag all entities linked as pending review.],
    [The system must put the stakeholder on read only mode.],
  ),
  [The system must allow a project manager to remove a disabled stakeholder from a project the user is linked to.],
  (
    [The system must flag all entities linked as pending review.],
    [The system must unlink any requirements linked to the stakeholder],
  ),
  [The system must allow a project manager to delete permanently a removed stakeholder.],
  [The system must allow a project manager or requirement engineer to modify a stakeholder that's not deactivated or removed.],
  (
    [The system must flag as pending review linked entities upon saving.],
  ),
)
==== Requirement management
#RM_List(
  [The system must allow users linked to a project or functionality of a project access to its requirements.],
  (
    [The system must only allow users linked to the functionality of a functional requirement access to it.],
    [The system must allow to collapse and expand requirements with children.],
    [The system must show the dynamic identifier, the name, state and part of the description.],
    [The system must allow to view the details of a requirement.],
    (
      [The system must show the internal unique identifier.],
      [The system must show all atributes of a requirement.],
      [The system must show all stakeholders linked to it.],
      [The system must show all requirements cross-linked with it.],
      [The system must show all documents linked to it.],
    ),
  ),
  [The system must allow a requirement engineer or a project manager to add a requirement to a project the user is linked to.],
  (
    [The system must only allow a functional requirement to be added to a functionality the user is linked to.],
    [The system must allow the user to generate a requirement as a child of another requirement (nesting).],
    [The system must assign automatically the dynamic identifier.],
    (
      [The identifier must be based on its relation to other requirements.],
      [The identifier must represent if it is a functional or non functional requirement (FR or NFR).],
      [The identifier must represent the folder/component that holds the requirement (user management -> UM).],
    ),
    [The system must assign automatically an internal unique slug.],
    (
      [The identifier must represent the project that will hold the requirement.],
      [The identifier must represent whether the requirement is functional or non functional.],
      [The identifier must have a random element to ensure a low colision rate.],
    ),
    [The system must ask for the following data for a functional requirement:],
    (
      [The system must require a name.],
      [The system must require a description.],
      [The system must require a priority following the one set on the project creation.],
      [The system must allow to set a stability, which is optional.],
      [The system must allow to set a stakeholder as origin, which is optional.],
    ),
    [The system must ask for the following data for a non-functional requirement:],
    (
      [The system must require a name.],
      [The system must require a description.],
      [The system must allow to set a measurement unit.],
      [The system must allow to set a comparison operator.],
      ([equal to, less than or greater than.],),
      [The system must allow to set a threshold value.],
      ([This value represents the minimum value to mark the requirement as passed.],),
      [The system must allow to set a target value.],
      ([This value represents the optimal value desired by the team.],),
      [The system must allow to set an actual value.],
      ([This value represents the current status of the measurement.],),
    ),
    [The system must automatically set the new requirement as pending approval.],
  ),
  [The system must allow a project manager or requirement engineer to link a requirement on a functionality they are linked to, to another entity.],
  (
    [The system must allow to link a requirement with a stakeholder of the same project.],
    [The system must allow to un-link a requirement with a stakeholder.],
    [The system must allow to link a requirement with one or more requirements of functionalities of the same project the user is linked to.],
    [The system must allow to un-link a requirement with other requirements of functionalities of the same project the user is linked to.],
    [The system must allow to link a requirement with one or more documents of the same project.],
    [The system must allow to un-link a requirement with one or more documents of the same project.],
  ),
  [The system must allow a requirement engineer or a project manager to deactivate a requirement pending approval on a functionality they are linked to.],
  (
    [The system must flag any requirements linked to the deactivated requirement as pending review.],
    [The system must put the requirement on read only.],
  ),
  [The system must allow a project manager or requirement engineer to set a deactivated requirement as removed.],
  (
    [The system must hide from view a removed requirement, effectively archiving it.],
  ),
  [The system must allow a project manager to permanently delete a removed requirement.],
  (
    [The system must hide from view a removed requirement, effectively archiving it.],
  ),
  [The system must allow a requirement engineer or a project manager to reactivate a requirement on a functionality they are linked to.],
  (
    [The system must automatically flag as pending review the reactivated requirement.],
  ),
  [The system must allow a requirement engineer or a project manager to modify a requirement on a project.],
  (
    [The system must only allow a project manager or requirement engineer to modify functional requiremets of a functionality the user is linked to.],
    [The system must flag linked requirements as pending review upon saving with changes.],
  ),
  [The system must allow a project manager to mark as approved one or more requirements.],
  (
    [The system must only allow to mark as approved a requirement that is pending approval, not pending review nor deactivated.],
  ),
  [The system must allow a project manager to mark as finished a requirement.],
  (
    [The system must set the requirement as pending approval if it is modified.],
  ),

  [The system must allow a project manager or requirement engineer linked to a functionality of the project to change the position of a requirement.],
  (
    [The system must allow reordering of functional requirements to users linked to the same functionality.],
    [The system must update the dynamic identifier automatically.],
    [The system must set the order of requirements using a floating point order value.],
  ),
)
==== User management
#UM_List(
  [The system must allow an admin to invite new users to the system.],
  (
    [The system must provide different levels of authorisation, based on the relationship between its elements.],
    (
      [The system must have the levels: Admin, project manager, requirement engineer and stakeholder user.],
    ),
    [The system must ask the admin to set the name, surname, and email of the invited user.],
    (
      [The system must generate an signup code as a temporal password.],
      [The system must automatically send an invitation with the signup code to the email of the invited user.],
    ),
  ),
  [The system must allow an admin to view the name and surname of a user from the system.],
  [The system must allow an admin to modify the name and surname of a user from the system.],
  [The system must allow an admin to view the current permissions of a user from the system.],
  [The system must allow an admin to generate a new invite with a signup code for a user.],
  [The system must allow any user with valid credentials to sign in to the system.],
  (
    [The system must prompt any user signing in with a signup code to set a permanent password.],
    (
      [The system must ensure the password is between 15 and 64 characters long.],
      [The system must make use of a random salt specific of each user.],
      [The system must remove any password or signup code of the user upon seting a permanent password.],
    ),
    [The system must temporally block the user after 3 consecutive failed attempts.],
  ),
  [The system must allow an admin to remove a user from the system.],
  (
    [The system must clean the removed user's ReBAC permissions.],
  ),
)
==== Document management and modelling
#DMM_List(
  [The system must allow users linked to a project access to documents of that project.],
  (
    [The system must show documents not removed.],
    [The system must show entities linked to the document.],
  ),
  [The system must allow a project manager to access removed documents of that project.],
  (
    [The system must show entities linked to the document.],
  ),
  [The system must allow a project manager or a requirement engineer to add document to a project.],
  (
    [The user must be linked to the project.],
  ),
  [The system must allow a document to be linked to one or more requirements of the same project.],
  (
    [The system must flag those requirements linked to it as pending a review if the document is altered.],
  ),
  [The system must allow a project manager or requirement engineer to update a document.],
  (
    [The user must be linked to the project the document is on.],
    [The system must flag as pending a review any requirements linked to the document.],
  ),
  [The system must allow a project manager or requirement engineer to disable a document.],
  (
    [The system must flag as pending a review any requirements linked to the document.],
  ),
  [The system must allow a project manager or requirement engineer to enable a disabled document.],
  (
    [The system must flag as pending a review any requirements linked to the document.],
  ),
  [The system must allow a project manager or requirement engineer to remove a disabled document.],
  (
    [The system must flag as pending a review any requirements linked to the document.],
    [The system must unlink any requirements linked to the document.],
  ),
  [The system must allow a project manager to delete permanently a removed document.],
  [The system must allow a project manager or requirement engineer to model diagrams using a Draw.io integration.],
)
==== Concurrency
#C_List(
  [The system must block other users from modifying an entity that another user is already modifying.],
  (
    [The system must release automatically the entity if the user modifying it saves and exits (stops modifying).],
    [The system must release automatically the entity after a predetermined timeout period.],
    [The system must release automatically the entity if the user editing it modifies another entity.],
    [The system must only accept changes to the entity from the user who holds the entity.],
  ),
  [The system must display for other users who is modifying the entity.],
)
==== Search and filtering
#SF_List(
  [The system must allow searching a project entity by its internal unique identifier.],
  (
    [The system must search lexically.],
    [The system must allow the user to see the details of the found entity.],
    (
      [only if an exact match occurs,],
      [only if the user has access to it.],
    ),
  ),
  [The system must allow users to filter entities they have access to.],
  (
    [The system must allow filtering out deactivated requirements.],
    [The system must allow filtering requirements based on priority.],
    [The system must allow filtering requirements based on state.],
    [Any filter must be reversible; ascending or descending order.],
  ),
)

=== Usability Requirements

=== Performance Requirements

=== Logical Database Requirements

=== Design Constraints

=== System Attributes

=== Supporting Information

== Test Plan Analysis
To ensure the reliability, maintainability, and performance of the IR-Board system, a multi-dimensional testing strategy has been defined. This plan covers the entire development lifecycle, from code quality to system behavior under stress.

=== Code maintainability and unit testing with SonarQube
The project utilizes SonarQube as a Static Application Security Testing (SAST) tool. This analysis is integrated into the development workflow to ensure the following:
- Maintainability: Identification of "code smells" and technical debt that could hinder future scalability.
- Code Coverage Validation: Monitoring the percentage of the source code executed during automated tests. This ensures that critical business logic is thoroughly verified, maintaining a high safety net against regressions and establishing a minimum threshold of tested code before deployment.
- Reliability: Detection of potential bugs and logic errors through automated pattern matching.
- Security: Scanning for common vulnerabilities and ensuring compliance with industry standards (e.g., OWASP Top 10).

=== Load testing
For the load testing phase, the primary focus will be on stressing the critical entry points of the system, specifically the traffic flow passing through Traefik and Oathkeeper toward the Spring Boot backend. The goal is to simulate bursts of concurrent users to identify the exact point where identity validation latency begins to degrade the user experience or if Kratos' session management can handle the expected volume. This process goes beyond checking for server crashes; it involves using the Grafana stack to monitor how container resources scale and ensuring the internal network routing maintains stability under heavy pressure.

=== Usability testing
Regarding usability testing, the plan involves observing real users interacting with the React interface to validate that the integration of Grafana dashboards feels intuitive and seamless. Special attention will be paid to how easily users can navigate between Loki logs and the core business logic, ensuring that the underlying complexity of the microservices architecture remains completely transparent to the end user. The ultimate objective is to confirm that authentication flows do not create unnecessary friction and that the frontend information hierarchy allows for efficient data management without requiring prior technical knowledge from the operator.

= System Design //6

== System Architecture
=== General architecture desing
The system architecture follows a Microservices approach based on the Zero Trust security model. This ensures flexibility and scalability while maintaining a high level of isolation between business logic and infrastructure concerns. To guarantee a professional security standard while maintaining a manageable project scope, core identity and access management responsibilities have been delegated to the Ory Open Source ecosystem.

The figure below shows the main flow of the application represented by solid arrows, and secondary messaging between microservices represented by a dotted arrows.

#figure(image("./assets/diagrams/ArchitectureC2.svg"), caption: "Architecture C2 component diagram")

#strong[Traefik] - Acts as the system's entry point and TLS Termination Proxy. It handles dynamic routing and load balancing, effectively hiding the internal network topology and eliminating the need to expose multiple ports to the public internet.

#strong[RMS Frontend] - Built with React and TypeScript, served as static content. It executes within the user's browser and communicates with the backend services through the API Gateway.

#strong[Ory Oathkeeper] - A policy-enforcement engine that acts as a gatekeeper between the public and internal networks. It intercepted every request to validate session integrity (via Kratos) and fine-grained permissions (via Keto) before allowing traffic to reach the internal services.

#strong[Ory Keto] - A relationship-based access control (ReBAC) server inspired by Google’s Zanzibar. It manages permission tuples, allowing the system to verify complex authorization rules (e.g., checking if a user is linked to a specific project).

#strong[Ory Kratos] - Manages the full identity lifecycle, including user registration, multi-factor authentication, and session management, ensuring that sensitive credentials are handled by a specialized security component.

#strong[RMS Backend] - The core service developed using Spring Boot, containing the domain-specific business logic and data persistence. It interacts with keto both to write Relation-Based Access Control (ReBAC) tuples and to filter by permissions.

#strong[Mailpit] - A simple email server that receives all messages sent by Ory Kratos. Acts as a placeholder for development instead of a real email server, to ensure the signup works.
TODO add the other containers
TODO add another C1, C3
=== Backend system design

=== Frontend system design

== Real Use Case Design

== Class Design

#figure(image("./assets/diagrams/backendClassDiagram.svg"), caption: "Domain class diagram")

#strong[User] - The relationships between User and Project and Functionality, as they are purely access control related, are delgated to ory Keto or whatever security ReBAC system used. The boolean value isActive is also delegated to the ReBAC system, as it represents a user-to-system relationship.

== Database Design
(explain both jpa resulting database and keto relationship db)




== User Interface Design
To design the user interfaces, the design tool moqups was used to model the UI wireframes.
All designs provided were shared and accepted by the tutors, and are free to be inspected here:

#link("https://app.moqups.com/YJhvDCqTutTvP6fK9lrmLLpEvfYlnCLR/view/page/a662b029d", "TFG moqups")
== Test Plan Specification

= System Implementation //7

= Test Plan Execution //8
== Unit Testing

== Integration and System Testing

== Usability Testing

== Accessibility Testing

== Load Testing

== Acceptance Testing

= System manuals //9
== Installation Guide

== User Manual

== Developer Guide

= Project Closure //10

== Final Schedule

== Final Risk Report

== Final Budget

== Project Closure Analysis

= Conclusions and Future Work //11

= References //12
- https://vite.dev/config/
- https://typst.app/docs/
- [1] “Welcome to Ory! | Ory,” Ory.com, Oct. 15, 2025. https://www.ory.com/docs/ (accessed Mar. 07, 2026).
- [2] “Configuring Vite,” vitejs, 2025. https://vite.dev/config/
- [3] “Typst Documentation,” Typst, 2024. https://typst.app/docs/
= Appendices
== Supplementary Material
