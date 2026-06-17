// ===============================
// Configuración general del documento
// ===============================
#import "@preview/efilrst:0.3.2" as efilrst
#show ref: efilrst.show-rule
#show link: set text(fill: blue)
#show link: underline
#show figure: set block(breakable: true)
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
The scope of this project is the design and implementation of IR-Board, a Requirements Management Platform focused on supporting the complete lifecycle of software requirements engineering. The system aims to provide a centralized environment where software projects can define, organize, validate, and maintain requirements while preserving traceability between the different elements involved in the requirements process.

The project covers the analysis, design, development, and validation of the core platform functionalities required to manage software requirements in a structured manner.

The implemented solution combines traditional requirements engineering practices with selected Agile-oriented concepts, allowing users to manage requirements, stakeholders, documents, and related project information from a unified interface.Furthermore, it includes support for the complete management lifecycle of project entities. This includes the creation, modification, validation, deactivation, and archival of projects, functionalities, requirements, stakeholders, and associated documentation. The platform provides mechanisms to maintain the relationships between these entities, enabling bidirectional traceability and ensuring that changes affecting one element can be identified across related elements.

About document management, the system allows users to upload, associate, update, and manage documents linked to project entities. These documents contribute to requirements traceability by allowing requirements and other elements to reference supporting material throughout the development lifecycle.

Another objective within the scope of the project is the implementation of a secure architecture following Zero-Trust principles. The system incorporates identity management, authentication, and authorization mechanisms designed to prevent implicit trust between components. Fine-grained access control is implemented through a Relation-Based Access Control (ReBAC) approach, allowing permissions to be determined dynamically according to relationships between users, projects, functionalities, and other system entities. More on the selection of a ReBAC access control on the section #link(<alternatives_analysis>)[alternatives analysis].
About the user management, the system covers user invitation, authentication workflows, credential management, and permission assignment. Users can participate in projects according to their assigned relationships and responsibilities, enabling collaborative work while maintaining controlled access to each project.

The project also includes the implementation of basic system observability capabilities. The platform provides mechanisms for collecting operational information such as application logs and relevant system metrics. These capabilities are intended to assist development, debugging, maintenance, and basic operational monitoring of the deployed solution.

The platform is designed with extensibility and future integration in mind. Although some external services are not implemented as part of this project, the architecture has been prepared to allow their incorporation without requiring significant changes to the core system. This includes the possibility of replacing development components with production-ready alternatives when deploying the system in a real environment.

The following elements are considered outside the scope of this project:

- Full production-grade security hardening of the observability infrastructure is not included. Although logging and metric collection mechanisms are implemented, securing, isolating, auditing, and managing the observability ecosystem itself is considered an infrastructure operation outside the objectives of this project.

- Integration of the observability stack as part of the business application is not included. The platform exposes the necessary information for monitoring, but advanced dashboards, alerting systems, automated incident response, and operational intelligence, included in comprehensive and unified panels within the frontend are outside the project scope.

- Integration with external third-party platforms is not included. This includes external project management tools, development platforms, issue trackers, or other enterprise systems.

- Production email infrastructure is not included. During development, email-related functionality is supported through development-oriented components intended for testing purposes, that is, a local development test server called mailpit. Configuration and deployment with real SMTP providers, domain verification, email reputation management, SPF, DKIM, DMARC, and production mail delivery processes, all necessary to allow a mail to even reach the spam folder when self hosting, are outside the scope of this project.

- Deployment automation for large-scale production environments is not included. While the system is containerized and designed for reproducible deployment, advanced orchestration, scaling strategies, and cloud-specific infrastructure management are considered future work.

The final result of this project is therefore a functional and extensible prototype of a requirements management platform that demonstrates secure architecture design, requirements lifecycle management, traceability, collaboration capabilities, and basic operational visibility, while leaving production infrastructure concerns and external ecosystem integrations as future extensions.
== Assumptions and Constraints
The development of IR-Board is based on several assumptions and constraints regarding the environment, users, and expected usage of the platform.

It is assumed that the system will primarily be used by software development teams or academic/project environments where requirements need to be collected, structured, reviewed, and maintained throughout a software lifecycle. The platform is not intended to replace complete enterprise Application Lifecycle Management (ALM) suites, but rather provide a focused requirements engineering environment combining formal documentation practices with Agile techniques.

The project is constrained by the available development time and the scope of a bachelor's thesis. Therefore, some enterprise-level functionalities commonly found in commercial requirements management platforms are not implemented.

It is assumed that users interacting with the system have basic knowledge of software development concepts and requirements engineering terminology. Although the platform provides mechanisms to guide the creation and validation of requirements, it does not attempt to automatically determine whether a requirement is correct from a business perspective; this responsibility remains with stakeholders and project members, and therefore those actions are fundamentally manual by design.

The system assumes that requirements are created and maintained following a structured lifecycle. Requirements may evolve over time, and changes are expected to occur through controlled modification, validation, and approval processes rather than direct deletion. Therefore, the platform assumes that maintaining historical information and traceability is more valuable than permanently removing data in a quick manner.

The project assumes that the group using the system may have different projects at a time, operated by different groups of developers, and therefore static global roles are unfit for access control.

The project assumes that external security services such as identity management, authentication, and authorization providers can be integrated through standardized interfaces. Therefore, solutions such as the Ory ecosystem are treated as replaceable infrastructure components rather than business logic dependencies.

It is assumed that PostgreSQL provides enough flexibility for the domain model, including structured relational data and semi-structured information through JSONB fields. The system does not require a dedicated NoSQL database because the main entities require strong consistency and traceability.

The document management subsystem assumes that uploaded documents act mainly as requirement-related artifacts. Advanced document processing, version control systems, collaborative document editing, or automatic content extraction are outside the expected functionality.

The observability layer assumes that basic logging, metrics, and monitoring capabilities are sufficient for system administration and debugging. The project does not assume the need for security monitoring, automated incident response, or a complete observability platform.

The deployment environment assumes containerized execution. Components are expected to run through container orchestration tools such as Docker Compose during development and testing, allowing the same architecture to be adapted to more advanced deployment environments if required.

= Theoretical Background //2
To better understand the system developed, here is a brief summary of the concepts related and used on it.
== Software requirements engineering
Requirements engineering is the structured and systematic approach to formalizing the needs and expectations of stakeholders for a system. It encompasses different processes for identifying, eliciting, analyzing, specificating, validating and their management.

=== Concepts

But first, it is necessary to explain what a #strong("stakeholder") is. A stakeholder is someone with a "stake" or share on a project, or in general, someone interested in it. Stakeholders are the ones who, directly or indirectly define what a system must do for it to succeed. Common examples of stakeholders are end users, investors, industry competitors, and the development team. Understanding the stakeholders related to a project and their needs is imperative for a project to be accepted and provide value.

A #strong("requirement") represents a formal, documented statement describing a capability, condition, or constraint that a system must satisfy. Requirements act as the communication bridge between stakeholders and the development team, allowing the expected behavior of a system to be understood, evaluated, and implemented.

=== Criteria <requirements_criteria>

Generally, requirements are classified according to different criteria, including their abstraction level and whether they are functional or non-functional. Regarding abstraction, requirements are commonly organized in a hierarchical structure, where high-level requirements are progressively refined into more specific ones.This hierarchy allows requirements to be represented using identifiers, commonly composed of a unique identifier followed by a structured notation for their refinements. Sub-requirements can be nested within parent requirements, often using dot-separated numbering schemes that represent their position within the hierarchy.

At the highest level, #strong("business requirements") describe the objectives and needs that motivate the development of a system. They are closer to the concerns of stakeholders and are therefore usually expressed in a more abstract way, making them easier for non-technical stakeholders to understand and validate. As requirements are refined into lower levels of abstraction, they become increasingly detailed and closer to the technical aspects of the system. These #strong("technical requirements") describe specific behaviors, constraints, or implementation-related aspects necessary to satisfy the higher-level objectives.

This separation between abstraction levels facilitates communication between stakeholders and development teams, while also improving requirements traceability by allowing each detailed requirement to be linked back to the original business need that originated it.

Regarding the other criteria, #strong("functional requirements") describe the behaviors and services that the system must provide, defining what the system should do. Examples include allowing a user to create an account, generating reports, or managing project information. #strong("Non-functional requirements"), on the other hand, define quality attributes and constraints that affect how the system performs. These include aspects such as security, performance, reliability, usability, and maintainability.

=== Lifecycle

The requirements engineering process usually follows several interconnected activities:

#figure(image("assets/diagrams/SpiralRequirementsEngineeringProcess.svg"), caption: "Requirement engineering processes")

The first phase is #strong("requirements elicitation"), where information is gathered from stakeholders through techniques such as interviews, observation, workshops, or analysis of existing documentation. The objective of this phase is to understand the problem domain, its scope, and identify the actual needs behind the requested system. Due to the inherently human-centered nature of requirements elicitation, many of these techniques are influenced by methods from fields such as social sciences, qualitative research, and human-computer interaction. This is because requirements are not always explicitly known or easily communicated by stakeholders; they often need to be discovered through structured interaction, analysis, and interpretation.

After elicitation, requirements are analyzed and refined. During #strong("requirements analysis"), ambiguous, conflicting, or incomplete requirements are identified and resolved. This stage also involves prioritizing requirements according to factors such as business value, feasibility, cost, and risk.

Once analyzed, requirements are documented during the #strong("requirements specification") phase. The purpose of specification is to create a clear and structured representation of the requirements, reducing misunderstandings between stakeholders and developers. A well-written requirement should be understandable, consistent, testable, and traceable throughout the development process.

Requirements must also be validated before being considered complete. #strong("Requirements validation") ensures that documented requirements accurately represent stakeholder needs and that they are realistic within the technical and organizational constraints of the project. Validation activities may include reviews, prototypes, and acceptance criteria definition. Logically, part of the requirements may be validated while others may need refinement. For this reason, the process is modelled as a spiral, iterating over the different phases until accepted.

Finally, requirements engineering includes #strong("requirements management"), which handles changes to requirements during the lifecycle of a project. Software systems frequently evolve due to changes in business needs, regulations, technology, or user expectations. Managing these changes ensures that modifications are controlled and that the relationship between requirements, design decisions, implementation, and testing remains clear.

=== Traceability
A key concept within requirements management is #strong("traceability"). Requirements traceability refers to the ability to follow the relationship between a requirement and other elements associated with it, such as stakeholders, design components, implementation artifacts, tests, or related requirements. Traceability improves impact analysis, change management, and verification by providing visibility into how modifications affect the overall system.

#strong[Forward traceability] ensures that every requirement can be followed from its original stakeholder need towards its implementation and verification artifacts. This helps confirm that all requested functionality has been addressed.

#strong[Backward traceability] performs the opposite analysis, allowing developers and analysts to determine why a specific implementation element exists and which requirement originated it. This is particularly useful for preventing unnecessary functionality and supporting maintenance activities.

#strong[Horizontal traceability] refers to relationships between artifacts at the same abstraction level or between parallel elements of the system. Unlike hierarchical decomposition, horizontal traceability focuses on dependencies, interactions, and consistency between related elements. Examples include linking requirements that depend on each other, connecting a requirement with its related stakeholders, associating documents or models with the requirements they describe, or identifying conflicts and overlaps between different requirements. This form of traceability is especially important in complex systems, where a modification to one element may affect several other elements that are not directly above or below it in the hierarchy.

One common approach to implementing these concepts is #strong[identifier-based] traceability, where each requirement is assigned a unique identifier that remains stable throughout its lifecycle. These identifiers provide a direct reference mechanism between requirements, design elements, source code components, test cases, documentation, and other related artifacts. In this project, unique and semantically meaningful identifiers are used. For functional requirements, the identifier is composed of the initials of the requirement category or containing functionality, followed by a dot-separated numbering scheme that represents its position within the requirement hierarchy. This structure allows requirements to be located and understood without inspecting their complete content.

Another commonly used strategy is #strong[traceability matrices], where relationships between different artifacts are represented in a structured table. For example, a requirements-to-test matrix can demonstrate that every requirement has associated validation activities, while a requirements-to-design matrix can show how each requirement is translated into system components.

== Requirements Documentation Standards

Requirements documentation standards provide guidelines and recommendations for creating consistent, complete, and understandable descriptions of software requirements. Their main objective is to reduce ambiguity between stakeholders and development teams by defining common structures, terminology, and practices for representing system needs.

=== IEEE 830

The IEEE 830 standard, formally known as *IEEE Recommended Practice for Software Requirements Specifications*, defines recommendations for writing Software Requirements Specifications (SRS).

The standard establishes characteristics that a good requirement specification should have. A requirements document should be:

- *Correct:* The documented requirements should represent the actual needs of the stakeholders and system objectives.
- *Unambiguous:* Each requirement should have only one possible interpretation, avoiding unclear or subjective language.
- *Complete:* All relevant requirements, constraints, and system behaviors should be included.
- *Consistent:* Requirements should not contradict each other or define incompatible system behavior.
- *Verifiable:* Each requirement should be testable through objective validation methods.
- *Modifiable:* The document structure should allow changes without introducing inconsistencies.
- *Traceable:* Each requirement should be uniquely identifiable and linked to its origin and related artifacts.

Although modern Agile methodologies often favor lighter documentation approaches, the principles introduced by IEEE 830 remain applicable, especially regarding clarity, traceability, and verification.

=== ISO/IEC/IEEE 29148

The ISO/IEC/IEEE 29148 standard, *Systems and software engineering - Life cycle processes - Requirements engineering*, provides a more modern and comprehensive framework for requirements engineering. While IEEE 830 focuses mainly on the structure of the requirements specification document, ISO/IEC/IEEE 29148 covers the complete requirements lifecycle.

This standard defines processes for requirements definition, analysis, management, validation, and maintenance throughout the entire system lifecycle. It emphasizes that requirements should not be considered static documents, but rather managed entities that evolve together with the system.

ISO/IEC/IEEE 29148 introduces concepts such as:

- *Stakeholder requirements and system requirements:* The criteria about requirement abstraction based on levels seen on the #link(<requirements_criteria>)[criteria] section. Stakeholder requirements are the equivalent of lower level, project-specific business requirements, as in some contexts, a business requirement may be broader, to affect the whole business.
- *Requirements management:* The continuous process of controlling requirement changes, relationships, versions, and status throughout the lifecycle.
- *Requirements verification and validation:* Activities that ensure requirements are correctly defined (verification) and that they represent the intended system (validation).

The standard also reinforces the importance of requirements attributes beyond their textual description. These attributes may include identifiers, priority, source, rationale, status, dependencies, and verification criteria. These elements support traceability and enable better impact analysis when requirements change.

Compared to IEEE 830, ISO/IEC/IEEE 29148 provides a broader lifecycle-oriented perspective, making it more suitable for modern development environments where requirements continuously evolve. For this reason, IR-Board follows the principles of both standards: using structured requirement documentation inspired by IEEE 830 while applying lifecycle management concepts defined by ISO/IEC/IEEE 29148.

== Agile methodologies
Agile methodologies are software development approaches that prioritize adaptability, continuous feedback, and incremental delivery over rigid, sequential planning. They emerged as a response to traditional development models, where requirements were often defined completely at the beginning of the project and changes were expensive to introduce later.

Their approach is based on the idea that software requirements evolve as stakeholders gain a better understanding of their needs and as the project progresses. Instead of attempting to define the complete system beforehand, Agile teams work through short development iterations or sprints, frequently delivering functional increments of the system and incorporating feedback from users and stakeholders.

Common principles of Agile development include close collaboration between developers and stakeholders, continuous improvement, prioritization of valuable features, and responding to changes rather than strictly following an initial plan.

Although Agile methodologies generally favor lightweight documentation, they do not eliminate the need for requirements management. Instead, requirements are commonly represented through simpler and more flexible artifacts that can evolve during development, like user stories.

*User stories* are an Agile technique used to describe system requirements from the perspective of the user or stakeholder. Rather than focusing on technical implementation details, user stories express the expected value and purpose of a feature. They generally follow a structure like so:

As a [type of user], I want [goal], so that [reason or benefit].


== Security principles
Software security principles are fundamental concepts used to design systems that protect data, users, and operations against unauthorized access, misuse, or failure. Security is not only implemented through specific mechanisms but also through architectural decisions and development practices.

A common principle is the principle of *least privilege*, which states that users and components should only have the permissions required to perform their intended tasks. This reduces the potential impact of compromised accounts or services.

Another important principle is defense in depth, where multiple independent security layers are applied instead of relying on a single protection mechanism. If one layer fails, additional controls can still prevent or limit damage.

Modern security approaches also emphasize concepts such as secure-by-design, where security considerations are incorporated from the beginning of the system lifecycle rather than added as a final step.

== Software architectures
Software architecture describes the high-level structure of a software system, including its components, their responsibilities, and the communication mechanisms between them. Architectural decisions influence scalability, maintainability, security, and the ability of the system to evolve. It not only defines how software is organized internally, but also how different parts of the system interact with each other and with external services.

=== Monolithic Architecture

A monolithic architecture is a software architecture where the different system components are developed, deployed, and executed as a single application unit.

In a monolithic system, business logic, data access, authentication, and other application concerns usually exist within the same deployment artifact. This approach is simple to develop and deploy, especially for smaller systems, as communication between components occurs through internal method calls.

However, as the system grows, monolithic architectures can become harder to maintain because changes in one component may require redeploying the entire application. Scaling individual parts independently is also more difficult, since the complete application is scaled as a single unit.

=== Microservices Architecture

A microservices architecture divides an application into a collection of smaller, independent services. Each service is responsible for a specific business capability and communicates with other services through well-defined interfaces.

Microservices allow independent deployment, scaling, and development of different system components. They also provide stronger isolation, as failures in one service can potentially be contained without affecting the entire system.

However, this approach introduces additional complexity, including network communication, service discovery, distributed data management, monitoring requirements, and more complex deployment processes.

For this reason, microservices architectures are often combined with supporting infrastructure such as API gateways, centralized logging, authentication services, and monitoring systems.

== Observability
Observability is the ability to understand the internal state and behavior of a software system by analyzing its external outputs. It allows operators and developers to detect failures, investigate problems, and understand system performance.

Modern distributed systems require observability because failures are often not limited to a single component. Instead, they may result from interactions between several services, infrastructure components, or external dependencies.

The three main pillars of observability are logs, metrics, and traces.

=== Logs

Logs are timestamped records of events produced by applications and infrastructure components. They provide detailed information about what happened at a specific point in time. Examples of logged events include application errors, authentication attempts, configuration changes, or important business operations.

Logs are especially useful for debugging and investigating incidents because they provide contextual information about individual events.

=== Metrics

Metrics are numerical measurements that represent the state or performance of a system over time. Unlike logs, which describe individual events, metrics provide aggregated information that can be analyzed through trends and comprehensive dashboards.

Common examples include CPU usage, memory consumption, request latency, error rates, or the number of active users.

=== Traces

Traces represent the path of a request as it travels through different components of a system. They are particularly important in distributed architectures where a single user action may involve multiple services.

A trace is composed of multiple spans, where each span represents an operation performed by a specific component. By analyzing traces, developers can identify bottlenecks, latency sources, or failures across service boundaries.

Together, logs, metrics, and traces provide a complete view of system behavior, supporting reliability, maintenance, and operational decision-making.

= Feasibility Study and Alternatives Analysis <alternatives_analysis> //3
Before starting the implementation of IR-Board, an analysis of the technical feasibility and the different alternatives available was performed. The objective of this analysis was to identify the most appropriate technologies and architectural decisions according to the characteristics of the system to be implemented, the expected complexity, the security requirements, and the available development resources.

The main factors considered during the evaluation were maintainability, scalability, security, development complexity, ecosystem maturity, integration capabilities, and suitability for the requirements management domain.

Given the collaborative nature of requirements engineering systems, the decision was made to develop IR-Board as a web-based platform rather than as a standalone desktop application. A web architecture provides easier deployment, multiplatform access, and a better foundation for collaborative workflows where several users may interact with the same project simultaneously.

The selected architecture separates the frontend and backend into independent projects. This separation improves maintainability and allows each layer to evolve independently. Additionally, it facilitates future deployment scenarios where the frontend could be served independently or replaced without requiring modifications to the core business logic.

== Deferral or self-implementation of security environment
Security was identified as a critical aspect of the system due to the collaborative nature of requirements management and the need for controlled access between users, projects, and functionalities.

Two approaches were considered: implementing security mechanisms directly inside the application, or delegating security responsibilities to specialized external components.

#figure(
  table(
    columns: 3,
    [
      #strong[Criteria]
    ],
    [#strong[Custom implementation]],
    [#strong[External security ecosystem]],

    [Control], [Maximum control], [Controlled through configuration],
    [Development effort], [Very high], [Lower],
    [Security assurance], [Depends on implementation quality], [Based on mature solutions],
    [Maintainability], [Higher responsibility], [Separated components],
  ),
  caption: "Security implementation alternatives comparison",
)

A custom implementation would provide maximum control over authentication, authorization, and session management. However, implementing a complete security environment would significantly increase the complexity of the project. Features such as secure password management, session handling, authorization policies, token management, and protection against common vulnerabilities require extensive development and testing.

For this reason, the project decided to use specialized open-source identity and security components from the Ory ecosystem. Their specific licensing is documented over on the #link(<appendices>)[appendices].

Ory Kratos is responsible for identity management and user sessions. Ory Oathkeeper acts as an authorization gateway, validating requests before they reach internal services. Ory Keto provides relationship-based access control (ReBAC), which is particularly appropriate for the project because permissions depend on relationships between users, projects, and functionalities.

Similarly, Traefik was selected as the API gateway and entry point due to its maturity and previous experience with the technology.

The use of these components follows the security principle of defense in depth, separating responsibilities and reducing the amount of security-critical code maintained by the project.

== Backend framework selection

The backend was approached as a system exposing a REST API from the beginning. Three main alternatives were considered: Spring Boot, Express.js, and FastAPI.

#figure(
  table(
    columns: 3,
    [#strong[Framework]], [#strong[Advantages]], [#strong[Disadvantages]],

    [Spring Boot],
    [Mature ecosystem, strong security support, dependency injection, Spring Data JPA integration, suitable for complex domain models],
    [Higher initial complexity and more verbose configuration compared with lightweight alternatives],

    [Express.js],
    [Simple architecture, rapid development, large JavaScript ecosystem, direct compatibility with React and TypeScript],
    [Minimal framework approach requires manual decisions for architecture, security, validation, and application structure],

    [FastAPI],
    [Modern API design, automatic OpenAPI generation, type-based validation, high performance, simple development model],
    [Less opinionated architecture, fewer enterprise-oriented patterns, additional design decisions required for complex systems],
  ),
  caption: "Backend framework alternatives comparison",
)

=== Spring Boot
Spring Boot was selected as the backend framework due to its maturity, strong ecosystem, and extensive support for enterprise-oriented applications. Its opinionated structure provides several development and security advantages, including dependency management, validation support, integrated configuration management, security modules, and mature database access through Spring Data JPA.

Additionally, the IR-Board domain requires complex relationships between entities, lifecycle management, state transitions, and strict data consistency. The object-relational mapping capabilities provided by JPA allow these relationships to be represented naturally while maintaining control over the resulting database structure. The Spring ecosystem also provides mature integration possibilities with authentication systems, authorization layers, and observability tools.

=== Express.js
Express.js was considered due to its simplicity, lightweight nature, and strong integration with JavaScript-based frontend ecosystems. Since the frontend was planned using React and TypeScript, using a JavaScript-based backend would allow sharing the same programming language across the stack, potentially simplifying development and reducing context switching.

However, Express.js is intentionally minimal and provides fewer architectural constraints. This means that important aspects such as project structure, validation, security practices, dependency management, and error handling need to be manually defined. For a system where security, traceability, and long-term maintainability are important objectives, this additional responsibility increases implementation complexity and risk.

=== FastAPI
FastAPI was also considered as a modern alternative for REST API development. Its use of Python type hints and Pydantic models provides automatic validation, clear API contracts, and automatic OpenAPI documentation generation. Additionally, its asynchronous architecture can provide excellent performance for I/O-heavy applications while maintaining a relatively simple development experience.

Despite these advantages, FastAPI was not selected. Although it is a strong framework for API-focused applications, it provides fewer built-in architectural conventions for large domain-oriented systems compared with Spring Boot. More decisions regarding dependency injection patterns, application organization, security integration, and persistence architecture would need to be defined independently. While this flexibility is valuable in many contexts, the additional design decisions would increase the complexity of maintaining a consistent architecture.

The final decision was Spring Boot because the additional structure, mature security ecosystem, database integration capabilities, and established enterprise patterns better match the requirements of IR-Board. The framework reduces implementation risks and development efforts while providing a solid foundation for future expansion.

== Frontend framework selection

The frontend is responsible for presenting the requirements management interface and enabling user interaction with complex entities such as requirements, documents, stakeholders, and project structures. Due to the collaborative and data-intensive nature of the system, the frontend needed to support reusable components, responsive layouts, maintainable state management, and a flexible design system.

The main frontend framework alternatives considered were React and Angular.

React with TypeScript was selected as the frontend framework due to its flexibility, ecosystem maturity, and previous experience with the technology. React provides a component-based development model, allowing the creation of reusable interface elements and facilitating the development of complex interactive views. The use of TypeScript adds static typing, reducing potential errors and improving maintainability in a project with a large number of entities and interactions.

Angular was considered because it provides a complete frontend framework including routing, dependency injection, and a predefined application structure. This approach improves consistency and can simplify development in large teams by reducing the number of architectural decisions required during implementation. However, Angular's broader framework scope, stricter conventions, and larger set of integrated concepts introduce additional complexity compared with lighter approaches. Since IR-Board requires flexibility in interface design and integration with external services, React offered a better balance between structure, adaptability, and control over the selected tooling.

#figure(
  table(
    columns: 3,
    [
      #strong[Criteria]
    ],
    [
      #strong[React + TypeScript]
    ],
    [
      #strong[Angular]
    ],

    [Architecture],
    [Flexible component-based approach; additional tooling chosen according to project needs],
    [Complete framework with predefined application structure],

    [Flexibility],
    [High; developers choose supporting libraries and patterns],
    [Moderate; framework conventions guide implementation],

    [Learning curve], [Moderate; requires selecting additional tools], [Higher initially due to wider framework scope],

    [Ecosystem], [Large ecosystem and extensive third-party integrations], [Large ecosystem with official tooling],

    [Decision], [Selected], [Rejected],
  ),
  caption: "Frontend framework alternatives comparison",
)

== Database selection

The system requires persistent storage for projects, requirements, users, documents, relationships, and lifecycle information. The database solution needed to provide reliable persistence, transactional guarantees, support for complex relationships between entities, and enough flexibility to evolve as the system grows.

A relational database management system (RDBMS) was selected because the problem domain is primarily composed of structured entities with well-defined relationships. Requirements engineering involves maintaining consistency between projects, functionalities, requirements, stakeholders, and documents, where modifications to one entity may affect others. Therefore, transactional operations, referential integrity, and explicit relationship modelling are important characteristics for the system.

PostgreSQL was selected due to its maturity, reliability, and extensive feature set. It provides strong relational guarantees while also supporting semi-structured data through features such as JSONB columns. This allows storing flexible attributes when required without abandoning the advantages of a relational model.

Alternative database solutions based on document-oriented databases, such as MongoDB, were considered due to their flexible schema and ability to represent changing data structures. However, this flexibility is less relevant for the IR-Board domain, where consistency, traceability, and explicit relationships between entities are critical. A document-oriented approach would require additional application-level logic to maintain relationships and enforce integrity constraints.

Another important consideration was the integration with the selected security architecture. The Ory ecosystem used by the project relies on relational database support, and PostgreSQL is a mature option compatible with these components, as commented #link("https://github.com/ory/kratos/discussions/3007")[here]. Using the same database technology across the system reduces deployment complexity, simplifies maintenance, and avoids introducing unnecessary infrastructure differences.

The final decision was PostgreSQL because it provides the required balance between consistency, flexibility, ecosystem compatibility, and long-term maintainability.

#figure(
  table(
    columns: 4,
    [#strong[Criteria]], [#strong[PostgreSQL]], [#strong[MongoDB]], [#strong[Evaluation]],

    [Data consistency],
    [Strong ACID transactions and relational integrity],
    [Flexible schema with weaker relationship enforcement],
    [PostgreSQL preferred],

    [Entity relationships],
    [Native foreign keys and relational modelling],
    [Relationships require additional application logic],
    [PostgreSQL preferred],

    [Traceability],
    [Suitable for immutable identifiers, lifecycle states, and audit information],
    [Possible but requires additional modelling],
    [PostgreSQL preferred],

    [Schema flexibility],
    [JSONB allows semi-structured fields while maintaining relations],
    [Highly flexible document model],
    [Both viable],

    [Ory ecosystem compatibility],
    [Supported and commonly used],
    [Not suitable for the selected deployment],
    [PostgreSQL preferred],
  ),
  caption: "Database alternatives comparison",
)

= Initial Project Planning and Management //4
== Theoretical client petition
To be able to appropiately create a project's budget aligned with the needs of the client, and ensure a complete enough context, the planning was done with the following fictional scenario in mind:

The theoretical client, NorthTech Solutions, is a company located in a nearby city to where the development team operates. The company requests the creation of a customized software platform to improve its internal processes and digital management.

The project involves collaboration between different parties, including NorthTech Solutions, the development team, the company's management department, technical staff, and the future users of the application. The requested work covers the complete software lifecycle, including requirements analysis, custom development, deployment on the internal network of the company, load testing, usability testing, and technical documentation.

The objective is to deliver a functional, maintainable, and scalable solution while applying professional software engineering practices within the scope of this TFG.

== Stakeholder Identification

#figure(
  table(
    columns: (1fr, 3fr, 6fr),
    align: left,
    [*ID*], [*Stakeholder*], [*Description*],

    [ST-1],
    [NorthTech Solutions],
    [Fictional company requesting the software solution, defining business needs and validating the final product],

    [ST-2],
    [Company Management Department],
    [Area responsible for organizational decisions, providing objectives, priorities, and project approval],

    [ST-3],
    [Technical Department],
    [Employees responsible for IT systems, providing technical requirements and supporting deployment],

    [ST-4],
    [End Users (Software Development Teams)],
    [Teams that will use the application daily for their development activities, providing usability feedback and validating workflows],

    [ST-5],
    [Development Team],
    [TFG development group responsible for the solution, analyzing, designing, developing, testing, and documenting the system],

    [ST-6],
    [Client Development Team],
    [Technical personnel from the client organization who may review the solution and support future improvements],

    [ST-7],
    [Future Maintenance Team],
    [Hypothetical team responsible for future evolution, requiring documentation and maintainability information],

    [ST-8],
    [NorthTech Systems Administration Team],
    [Hypothetical team responsible for infrastructure management, deployment support, and system monitoring],
  ),
  caption: "Stakeholder list",
)

Domain and infrastructure providers are not included as stakeholders, since the deployment environment will rely on the theoretical client's existing infrastructure and no external provisioning or management is required within the scope of this project.

== OBS and PBS
This section presents the Product Breakdown Structure (PBS) and Organization Breakdown Structure (OBS) of the IR-Board project. The PBS provides a hierarchical view of the main components and modules that compose the final product, while the OBS defines the organizational structure and the distribution of responsibilities among the roles involved in the project.

The purpose of these structures is to establish a clear understanding of the system scope, its main elements, and the relationship between the product components and the theoretical teams responsible for their development and management.
=== PBS <pbs>
The Product Breakdown Structure (PBS) shown below decomposes IR-Board into its main functional components. At the highest level, the system is divided into several modules that represent the main capabilities offered by the platform.

The security and access control module contains the mechanisms required to protect the system, including authentication, Relation-Based Access Control (ReBAC), and the Zero-Trust security model. The requirements management module represents the core functionality of the platform, covering functional and non-functional requirements, their lifecycle, and traceability between related elements.

Project management provides the necessary tools to organize projects, manage their functionalities, and control approval workflows. User management handles users and permissions, while the project element management module groups additional entities managed within projects, such as documents and stakeholders.

Finally, collaboration services provide support for concurrent work through entity locking, and the search and filtering module improves accessibility by allowing users to efficiently locate and organize project information.

This decomposition defines the main product boundaries and provides a high-level overview of the system architecture from a functional perspective.
#figure(image("/docs/assets/diagrams/pbs.svg"), caption: "PBS")

=== OBS
#figure(image("/docs/assets/diagrams/obs.svg"), caption: "OBS")
A RACI responsibility matrix has been used to define the responsibilities and participation of each stakeholder throughout the project. This matrix helps clarify the involvement of each role during the different project activities.

The RACI model defines the following categories:

- R (Responsible): Person or role responsible for carrying out the activity.
- A (Accountable): Person or role who approves the result and has the final responsibility.
- C (Consulted): Person or role whose expertise or opinion is required.
- I (Informed): Person or role who must be notified about the progress or results.

The roles considered in the project are:

- Project Manager (PM)
- Systems Analyst (SA)
- Service Coordinator (SC)
- Technology Consultant (TC)
- Software Architect (SWA)
- Senior Developers (SD)
- Junior Developers (JD)

The following matrix defines the responsibility distribution for the main project activities:
#table(
  columns: (3fr, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr),
  align: center,

  [*Activity*], [*PM*], [*SA*], [*SC*], [*TC*], [*SWA*], [*SD*], [*JD*],

  [Project Management], [R], [I], [I], [I], [I], [I], [I],
  [Requirements Analysis], [A], [R], [R], [I], [I], [I], [I],
  [Software Design], [I], [A], [C], [R], [R], [I], [I],
  [Software Development], [I], [I], [I], [C], [A], [R], [C],
  [Testing and Validation], [I], [A], [C], [I], [I], [R], [R],
  [Documentation], [A], [I], [I], [I], [C], [R], [R],
)

== Initial Planning
The initial project planning was developed based on the Product Breakdown Structure (PBS) of the system, which can be found #link(<pbs>)[here]. The PBS was defined through an iterative process of refinement with the client (outside the theoretical context, this process was carried out with the project tutors) until a suitable system scope and set of functional requirements were established.

From the identified requirements, the main system modules were derived and used as the basis for creating the project breakdown structure and the initial planning. It should be noted that this planning does not consider strict execution deadlines or real resource constraints, as its main objective is to estimate the required resources and project budget. Therefore, no distinction has been made between individual team members within the same professional profile; for example, tasks assigned to junior developers are considered equivalent regardless of whether they are performed by Junior Developer 1 or Junior Developer 2.

The estimated effort, task durations, and assignment of professional profiles were defined using expert judgement, considering the complexity of each activity and the expected workload required for its completion.

#pagebreak()
#page(paper: "a4", flipped: true)[
  #figure(
    table(
      columns: (0.75fr, 4fr, 1fr, 2.25fr, 1.5fr, 1.5fr),
      align: left,

      [*ID*], [*Task*], [*Work*], [*Profile*], [*Start*], [*End*],

      [0], [*IRBoard development*], [300 hrs], [], [Thu 01/01/26], [Fri 13/02/26],
      [1], [Project management], [30 hrs], [], [Thu 01/01/26], [Fri 13/02/26],
      [1.1], [Design project schedule], [2 hrs], [Project manager], [Thu 01/01/26], [Thu 01/01/26],
      [1.2], [Generate budget], [2 hrs], [Project manager], [Thu 01/01/26], [Thu 01/01/26],
      [1.3], [Periodic project management], [26 hrs], [], [Fri 02/01/26], [Fri 13/02/26],
      [1.3.1], [Periodic project management 1], [2 hrs], [Project manager], [Fri 02/01/26], [Fri 02/01/26],
      [1.3.2], [Periodic project management 2], [2 hrs], [Project manager], [Mon 05/01/26], [Mon 05/01/26],
      [1.3.3], [Periodic project management 3], [2 hrs], [Project manager], [Fri 09/01/26], [Fri 09/01/26],
      [1.3.4], [Periodic project management 4], [2 hrs], [Project manager], [Mon 12/01/26], [Mon 12/01/26],
      [1.3.5], [Periodic project management 5], [2 hrs], [Project manager], [Fri 16/01/26], [Fri 16/01/26],
      [1.3.6], [Periodic project management 6], [2 hrs], [Project manager], [Mon 19/01/26], [Mon 19/01/26],
      [1.3.7], [Periodic project management 7], [2 hrs], [Project manager], [Fri 23/01/26], [Fri 23/01/26],
      [1.3.8], [Periodic project management 8], [2 hrs], [Project manager], [Mon 26/01/26], [Mon 26/01/26],
      [1.3.9], [Periodic project management 9], [2 hrs], [Project manager], [Fri 30/01/26], [Fri 30/01/26],
      [1.3.10], [Periodic project management 10], [2 hrs], [Project manager], [Mon 02/02/26], [Mon 02/02/26],
      [1.3.11], [Periodic project management 11], [2 hrs], [Project manager], [Fri 06/02/26], [Fri 06/02/26],
      [1.3.12], [Periodic project management 12], [2 hrs], [Project manager], [Mon 09/02/26], [Mon 09/02/26],
      [1.3.13], [Periodic project management 13], [2 hrs], [Project manager], [Fri 13/02/26], [Fri 13/02/26],
      [2], [Analysis/Software Requirements], [54 hrs], [], [Thu 01/01/26], [Fri 09/01/26],
      [2.1], [Determine project scope], [1 hr], [System Analyst], [Thu 01/01/26], [Thu 01/01/26],
      [2.2], [Review Regulatory Standards], [4 hrs], [Technology consultant], [Thu 01/01/26], [Thu 01/01/26],
      [2.3], [Identify required Documentation], [2 hrs], [System Analyst], [Thu 01/01/26], [Thu 01/01/26],
      [2.4], [Determine hand-ins for the project], [1 hr], [System Analyst], [Thu 01/01/26], [Thu 01/01/26],
      [2.5], [Adapt project template to typst], [2 hrs], [System Analyst], [Fri 02/01/26], [Fri 02/01/26],
      [2.6], [Analyze existing systems], [6 hrs], [Technology consultant], [Fri 02/01/26], [Fri 02/01/26],
      [2.7], [Draft preliminary software requirements], [22 hrs], [System Analyst], [Mon 05/01/26], [Wed 07/01/26],
      [2.8], [Model auxiliary diagrams], [6 hrs], [System Analyst], [Wed 07/01/26], [Thu 08/01/26],
      [2.9], [Review software requirements], [2 hrs], [System Analyst], [Thu 08/01/26], [Thu 08/01/26],
      [2.10], [Modify requirements with feedback], [8 hrs], [System Analyst], [Thu 08/01/26], [Fri 09/01/26],
      [3], [Analysis complete], [0 hrs], [], [Fri 09/01/26], [Fri 09/01/26],
      [4], [Design], [51 hrs], [], [Fri 09/01/26], [Fri 16/01/26],
      [4.1], [Design architecture], [10 hrs], [Software architect], [Fri 09/01/26], [Mon 12/01/26],
      [4.2], [Design brand identity], [3 hrs], [Junior software engineer], [Fri 09/01/26], [Mon 12/01/26],
      [4.3], [Design project management], [8 hrs], [Senior software engineer], [Mon 12/01/26], [Tue 13/01/26],
      [4.4], [Design stakeholder management], [4 hrs], [Senior software engineer], [Tue 13/01/26], [Tue 13/01/26],
      [4.5], [Design requirement management], [6 hrs], [Senior software engineer], [Tue 13/01/26], [Wed 14/01/26],
      [4.6], [Design user management], [10 hrs], [Senior software engineer], [Wed 14/01/26], [Thu 15/01/26],
      [4.7],
      [Design document management and diagram modelling],
      [10 hrs],
      [Senior software engineer],
      [Thu 15/01/26],
      [Fri 16/01/26],

      [5], [Design complete], [0 hrs], [], [Fri 16/01/26], [Fri 16/01/26],
      [6],
      [Set up SonarQube for Quality Assurance],
      [3 hrs],
      [Senior software engineer],
      [Fri 16/01/26],
      [Mon 19/01/26],

      [7], [Development], [105 hrs], [], [Mon 19/01/26], [Thu 05/02/26],
      [7.1], [Set up architecture], [4 hrs], [Software architect], [Mon 19/01/26], [Mon 19/01/26],
      [7.2], [Set up development enviroment], [3 hrs], [Software architect], [Mon 19/01/26], [Tue 20/01/26],
      [7.3], [Develop code], [98 hrs], [], [Tue 20/01/26], [Thu 05/02/26],
      [7.3.1],
      [Develop project management module],
      [22 hrs],
      [Junior software engineer],
      [Tue 20/01/26],
      [Thu 22/01/26],

      [7.3.2],
      [Develop stakeholder management module],
      [10 hrs],
      [Junior software engineer],
      [Thu 22/01/26],
      [Mon 26/01/26],

      [7.3.3],
      [Develop requirement management module],
      [25 hrs],
      [Senior software engineer],
      [Mon 26/01/26],
      [Thu 29/01/26],

      [7.3.4], [Develop user management module], [6 hrs], [Junior software engineer], [Thu 29/01/26], [Thu 29/01/26],
      [7.3.5], [Develop document management], [15 hrs], [Senior software engineer], [Fri 30/01/26], [Mon 02/02/26],
      [7.3.6],
      [Develop modifying concurrency system],
      [10 hrs],
      [Senior software engineer],
      [Mon 02/02/26],
      [Wed 04/02/26],

      [7.3.7], [Develop search and filtering], [10 hrs], [Junior software engineer], [Wed 04/02/26], [Thu 05/02/26],
      [8], [Development complete], [0 hrs], [], [Thu 05/02/26], [Thu 05/02/26],
      [9], [Testing], [27 hrs], [], [Fri 16/01/26], [Thu 05/02/26],
      [9.1], [Test project management module], [4 hrs], [Junior software engineer], [Mon 26/01/26], [Mon 26/01/26],
      [9.2], [Test stakeholder management module], [3 hrs], [Junior software engineer], [Mon 26/01/26], [Mon 26/01/26],
      [9.3], [Test requirement management module], [5 hrs], [Junior software engineer], [Fri 30/01/26], [Fri 30/01/26],
      [9.4], [Test user management module], [3 hrs], [Junior software engineer], [Fri 30/01/26], [Fri 30/01/26],
      [9.5], [Test document management], [3 hrs], [Junior software engineer], [Mon 02/02/26], [Tue 03/02/26],
      [9.6], [Test modifying concurrency system], [2 hrs], [Junior software engineer], [Thu 05/02/26], [Thu 05/02/26],
      [9.7], [Test search and filtering], [3 hrs], [Junior software engineer], [Thu 05/02/26], [Thu 05/02/26],
      [9.8], [Accesibility testing], [2 hrs], [Junior software engineer], [Fri 16/01/26], [Mon 19/01/26],
      [9.9], [Load testing], [2 hrs], [Senior software engineer], [Mon 19/01/26], [Tue 20/01/26],
      [10], [Testing complete], [0 hrs], [], [Thu 05/02/26], [Thu 05/02/26],
      [11], [Documentation], [30 hrs], [], [Thu 01/01/26], [Mon 09/02/26],
      [11.1],
      [Document declaration of originality, abstract and keywords],
      [1 hr],
      [Project manager],
      [Thu 01/01/26],
      [Thu 01/01/26],

      [11.2], [Document introduction], [1 hr], [Project manager], [Thu 01/01/26], [Thu 01/01/26],
      [11.3], [Document theoretical background], [1 hr], [Technology consultant], [Thu 01/01/26], [Thu 01/01/26],
      [11.4],
      [Document feasibility study and alternative analysis],
      [2 hrs],
      [Technology consultant],
      [Thu 01/01/26],
      [Thu 01/01/26],

      [11.5],
      [Document Initial project planning and management],
      [2 hrs],
      [Project manager],
      [Fri 02/01/26],
      [Fri 02/01/26],

      [11.6], [Document system analysis], [3 hrs], [System Analyst], [Fri 02/01/26], [Fri 02/01/26],
      [11.7], [Document system design], [5 hrs], [Software architect], [Tue 13/01/26], [Tue 13/01/26],
      [11.8], [Document system implementation], [5 hrs], [Senior software engineer], [Thu 05/02/26], [Thu 05/02/26],
      [11.9], [Document test plan execution], [2 hrs], [Senior software engineer], [Fri 06/02/26], [Fri 06/02/26],
      [11.10], [Document system manuals], [5 hrs], [Senior software engineer], [Fri 06/02/26], [Fri 06/02/26],
      [11.11], [Document final project closure], [2 hrs], [Project manager], [Fri 06/02/26], [Mon 09/02/26],
      [11.12], [Document conclusions and future work], [1 hr], [Project manager], [Mon 09/02/26], [Mon 09/02/26],
      [12], [Documentation complete], [0 hrs], [], [Mon 09/02/26], [Mon 09/02/26],
    ),
    caption: "Project initial planning",
  )
  Which gives the following Gantt chart:
  #figure(image("/docs/assets/screenshots/gantt_diagram_1.png"), caption: "Project management Gantt chart")
  #figure(image("/docs/assets/screenshots/gantt_diagram_2.png"), caption: "Analysis and design Gantt chart")
  #figure(image("/docs/assets/screenshots/gantt_diagram_3.png"), caption: "Development and testing Gantt chart")
  #figure(image("/docs/assets/screenshots/gantt_diagram_4.png"), caption: "Documentation Gantt chart")
]

== Risk Analysis
TODO comprehensive risk analysis
== Initial Budget
The budget is divided into three stages. The first stage describes the provider's financial reality, establishing the internal cost model. The second stage calculates the specific cost of executing the project for the theoretical provider. Finally, the third stage converts this cost into the final client offer, diluting the non-billable costs into each main task. In a situation where hardware is to be purchased, or where a price is standard or set by the market, these budget lines would be avoided for the dilution, as it is expected to match the market.

=== Provider finantial reality
The provider financial reality represents the internal economic structure of the company delivering the project. It includes the personnel required to operate the organization, their annual employment costs (salary plus employer costs), and the resulting hourly cost rates. The hourly rate without profit represents the minimum cost recovery rate, while the hourly rate with profit incorporates the expected commercial margin applied when billing clients.

The complete spreadsheet can be found #link(<provider_finantial_reality_budget>)[here].

#table(
  columns: (2.5fr, 0.8fr, 1.5fr, 1.5fr, 1.5fr),
  align: left,

  [*Resource*], [*Num.*], [*Annual employment cost*], [*Hourly rate (without profit)*], [*Hourly rate (with profit)*],

  [General manager], [1], [91.781,35 €], [-], [-],
  [Project manager], [1], [53.039,40 €], [49,78 €], [55,62 €],
  [Service coordinator], [1], [32.876,58 €], [46,75 €], [54,35 €],
  [Systems analyst], [1], [46.530,79 €], [42,16 €], [46,91 €],
  [Technology consultant], [1], [54.920,30 €], [45,22 €], [49,69 €],
  [Software architect], [1], [58.034,65 €], [49,15 €], [54,22 €],
  [Senior developer], [2], [104.323,46 €], [43,85 €], [48,31 €],
  [Junior developer], [4], [135.362,32 €], [38,55 €], [43,98 €],
  [Sales representative], [1], [35.118,49 €], [-], [-],

  [*TOTAL*], [*13*], [*611.987,34 €*], [], [],
)
#pagebreak()
#page(paper: "a4", flipped: true)[
  === Initial provider cost breakdown
  On this section of the budget, the complete cost structure is calculated and layed out, and the proportional amount to be diluted is calculated.

  #figure(
    table(
      columns: (0.75fr, 1fr, 0.75fr, 5fr, 2fr, 1.25fr, 1.25fr, 1.75fr, 2fr, 2fr, 2fr),

      table.cell(colspan: 11)[*Category 1: IrBoard development costs breakdown*],
      table.header(
        [*I1*],
        [*I2*],
        [*I3*],
        [*Description*],
        [*Resource*],
        [*Quantity*],
        [*Units*],
        [*Price*],
        [*Subtotal*],
        [*Subtotal (2)*],
        [*Total*],
      ),

      // 01 Project Management
      [01], [], [], [Project management], [], [], [], [], [], [], [1.493,46 €],

      [], [001], [], [Design project schedule], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [99,56 €], [],
      [], [002], [], [Generate budget], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [99,56 €], [],

      [], [003], [], [Periodic project management], [], [], [], [], [], [1.294,34 €], [],

      [], [], [01], [Periodic project management 1], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [02], [Periodic project management 2], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [03], [Periodic project management 3], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [04], [Periodic project management 4], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [05], [Periodic project management 5], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [06], [Periodic project management 6], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [07], [Periodic project management 7], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [08], [Periodic project management 8], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [09], [Periodic project management 9], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [10], [Periodic project management 10], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [11], [Periodic project management 11], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [12], [Periodic project management 12], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],
      [], [], [13], [Periodic project management 13], [Project manager], [2], [Hours], [49,78 €], [99,56 €], [], [],

      // 02 Analysis
      [02], [], [], [Analysis / Software Requirements], [], [], [], [], [], [], [2.307,21 €],

      [], [001], [], [Determine project scope], [System Analyst], [1], [Hours], [42,16 €], [42,16 €], [42,16 €], [],
      [],
      [002],
      [],
      [Review Regulatory Standards],
      [Technology consultant],
      [4],
      [Hours],
      [45,22 €],
      [180,88 €],
      [180,88 €],
      [],
      [],
      [003],
      [],
      [Identify required Documentation],
      [System Analyst],
      [2],
      [Hours],
      [42,16 €],
      [84,32 €],
      [84,32 €],
      [],
      [],
      [004],
      [],
      [Determine hand-ins for the project],
      [System Analyst],
      [1],
      [Hours],
      [42,16 €],
      [42,16 €],
      [42,16 €],
      [],
      [],
      [005],
      [],
      [Adapt project template to Typst],
      [System Analyst],
      [2],
      [Hours],
      [42,16 €],
      [84,32 €],
      [84,32 €],
      [],
      [],
      [006],
      [],
      [Analyze existing systems],
      [Technology consultant],
      [6],
      [Hours],
      [45,22 €],
      [271,32 €],
      [271,32 €],
      [],
      [],
      [007],
      [],
      [Draft preliminary software requirements],
      [System Analyst],
      [22],
      [Hours],
      [42,16 €],
      [927,50 €],
      [927,50 €],
      [],
      [], [008], [], [Model auxiliary diagrams], [System Analyst], [6], [Hours], [42,16 €], [252,96 €], [252,96 €], [],
      [],
      [009],
      [],
      [Review software requirements],
      [System Analyst],
      [2],
      [Hours],
      [42,16 €],
      [84,32 €],
      [84,32 €],
      [],
      [],
      [010],
      [],
      [Modify requirements with feedback],
      [System Analyst],
      [8],
      [Hours],
      [42,16 €],
      [337,27 €],
      [337,27 €],
      [],

      // 03 Design
      [03], [], [], [Design], [], [], [], [], [], [], [2.273,37 €],

      [], [001], [], [Design architecture], [Software architect], [10], [Hours], [49,15 €], [491,54 €], [491,54 €], [],
      [],
      [002],
      [],
      [Design brand identity],
      [Junior software engineer],
      [3],
      [Hours],
      [38,55 €],
      [115,66 €],
      [115,66 €],
      [],
      [],
      [003],
      [],
      [Design project management],
      [Senior software engineer],
      [8],
      [Hours],
      [43,85 €],
      [350,77 €],
      [350,77 €],
      [],
      [],
      [004],
      [],
      [Design stakeholder management],
      [Senior software engineer],
      [4],
      [Hours],
      [43,85 €],
      [175,39 €],
      [175,39 €],
      [],
      [],
      [005],
      [],
      [Design requirement management],
      [Senior software engineer],
      [6],
      [Hours],
      [43,85 €],
      [263,08 €],
      [263,08 €],
      [],
      [],
      [006],
      [],
      [Design user management],
      [Senior software engineer],
      [10],
      [Hours],
      [43,85 €],
      [438,47 €],
      [438,47 €],
      [],
      [],
      [007],
      [],
      [Design document management],
      [Senior software engineer],
      [10],
      [Hours],
      [43,85 €],
      [438,47 €],
      [438,47 €],
      [],

      // 04 SonarQube
      [04],
      [],
      [],
      [Set up SonarQube for Quality Assurance],
      [Senior software engineer],
      [3],
      [Hours],
      [43,85 €],
      [131,54 €],
      [131,54 €],
      [131,54 €],

      // 05 Development
      [05], [], [], [Development], [], [], [], [], [], [], [4.386,90 €],

      [], [001], [], [Set up architecture], [Software architect], [4], [Hours], [49,15 €], [196,62 €], [196,62 €], [],
      [],
      [002],
      [],
      [Set up development environment],
      [Software architect],
      [3],
      [Hours],
      [49,15 €],
      [147,46 €],
      [147,46 €],
      [],

      [], [003], [], [Develop code], [], [], [], [], [], [4.042,82 €], [],

      [],
      [],
      [01],
      [Develop project management module],
      [Junior software engineer],
      [22],
      [Hours],
      [38,55 €],
      [848,14 €],
      [],
      [],
      [], [], [02], [Develop stakeholder management module],
      [Junior software engineer],
      [10],
      [Hours],
      [38,55 €],
      [385,52 €],
      [],
      [],
      [],
      [],
      [03],
      [Develop requirement management module],
      [Senior software engineer],
      [25],
      [Hours],
      [43,85 €],
      [1.096,17 €],
      [],
      [],
      [],
      [],
      [04],
      [Develop user management module],
      [Junior software engineer],
      [6],
      [Hours],
      [38,55 €],
      [231,31 €],
      [],
      [],
      [],
      [],
      [05],
      [Develop document management module],
      [Senior software engineer],
      [15],
      [Hours],
      [43,85 €],
      [657,70 €],
      [],
      [],
      [],
      [],
      [06],
      [Develop modifying concurrency system],
      [Senior software engineer],
      [10],
      [Hours],
      [43,85 €],
      [438,47 €],
      [],
      [],
      [],
      [],
      [07],
      [Develop search and filtering],
      [Junior software engineer],
      [10],
      [Hours],
      [38,55 €],
      [385,52 €],
      [],
      [],

      // 06 Testing
      [06], [], [], [Testing], [], [], [], [], [], [], [1.051,49 €],

      [],
      [001],
      [],
      [Test project management module],
      [Junior software engineer],
      [4],
      [Hours],
      [38,55 €],
      [154,21 €],
      [154,21 €],
      [],
      [],
      [002],
      [],
      [Test stakeholder management module],
      [Junior software engineer],
      [3],
      [Hours],
      [38,55 €],
      [115,66 €],
      [115,66 €],
      [],
      [],
      [003],
      [],
      [Test requirement management module],
      [Junior software engineer],
      [5],
      [Hours],
      [38,55 €],
      [192,76 €],
      [192,76 €],
      [],
      [],
      [004],
      [],
      [Test user management module],
      [Junior software engineer],
      [3],
      [Hours],
      [38,55 €],
      [115,66 €],
      [115,66 €],
      [],
      [],
      [005],
      [],
      [Test document management module],
      [Junior software engineer],
      [3],
      [Hours],
      [38,55 €],
      [115,66 €],
      [115,66 €],
      [],
      [],
      [006],
      [],
      [Test modifying concurrency system],
      [Junior software engineer],
      [2],
      [Hours],
      [38,55 €],
      [77,10 €],
      [77,10 €],
      [],
      [],
      [007],
      [],
      [Test search and filtering],
      [Junior software engineer],
      [3],
      [Hours],
      [38,55 €],
      [115,66 €],
      [115,66 €],
      [],
      [],
      [008],
      [],
      [Usability and accessibility testing],
      [Junior software engineer],
      [2],
      [Hours],
      [38,55 €],
      [77,10 €],
      [77,10 €],
      [],
      [], [009], [], [Load testing], [Senior software engineer], [2], [Hours], [43,85 €], [87,69 €], [87,69 €], [],

      // 07 Documentation
      [07], [], [], [Documentation], [], [], [], [], [], [], [1.382,54 €],

      [],
      [001],
      [],
      [Document declaration of originality, abstract and keywords],
      [Project manager],
      [1],
      [Hours],
      [49,78 €],
      [49,78 €],
      [49,78 €],
      [],
      [], [002], [], [Document introduction], [Project manager], [1], [Hours], [49,78 €], [49,78 €], [49,78 €], [],
      [],
      [003],
      [],
      [Document theoretical background],
      [Technology consultant],
      [1],
      [Hours],
      [45,22 €],
      [45,22 €],
      [45,22 €],
      [],
      [],
      [004],
      [],
      [Document feasibility study and alternative analysis],
      [Technology consultant],
      [2],
      [Hours],
      [90,44 €],
      [90,44 €],
      [90,44 €],
      [],
      [],
      [005],
      [],
      [Document initial project planning and management],
      [Project manager],
      [2],
      [Hours],
      [99,56 €],
      [99,56 €],
      [99,56 €],
      [],
      [], [006], [], [Document system analysis], [System Analyst], [3], [Hours], [126,48 €], [126,48 €], [126,48 €], [],
      [],
      [007],
      [],
      [Document system design],
      [Software architect],
      [5],
      [Hours],
      [245,77 €],
      [245,77 €],
      [245,77 €],
      [],
      [],
      [008],
      [],
      [Document system implementation],
      [Senior software engineer],
      [5],
      [Hours],
      [219,23 €],
      [219,23 €],
      [219,23 €],
      [],
      [],
      [009],
      [],
      [Document test plan execution],
      [Senior software engineer],
      [2],
      [Hours],
      [87,69 €],
      [87,69 €],
      [87,69 €],
      [],
      [],
      [010],
      [],
      [Document system manuals],
      [Senior software engineer],
      [5],
      [Hours],
      [219,23 €],
      [219,23 €],
      [219,23 €],
      [],
      [],
      [011],
      [],
      [Document final project closure],
      [Project manager],
      [2],
      [Hours],
      [99,56 €],
      [99,56 €],
      [99,56 €],
      [],
      [],
      [012],
      [],
      [Document conclusions and future work],
      [Project manager],
      [1],
      [Hours],
      [49,78 €],
      [49,78 €],
      [49,78 €],
      [],

      table.hline(),

      table.cell(colspan: 10)[*Total*],
      [13.026,52 €],
    ),
    caption: "Provider's budget category 1",
  )
  #figure(
    table(
      columns: (0.75fr, 1fr, 0.75fr, 5fr, 2fr, 1.25fr, 1.25fr, 1.75fr, 2fr, 2fr, 2fr),

      table.cell(colspan: 11)[*Category 2: Other*],
      table.header(
        [*I1*],
        [*I2*],
        [*I3*],
        [*Description*],
        [*Resource*],
        [*Quantity*],
        [*Units*],
        [*Price*],
        [*Subtotal*],
        [*Subtotal (2)*],
        [*Total*],
      ),

      [01], [], [], [Travel and transportation expenses], [], [], [], [], [], [172,50 €], [172,50 €],
      [], [001], [], [Travel to client facilities (deployment/support)], [], [150], [km], [0,35 €], [52,50 €], [], [],
      [], [002], [], [Meals/daily allowance], [], [6], [meals], [20,00 €], [120,00 €], [], [],
    ),
    caption: "Provider's budget category 2",
  )
  Which is the same as:
  #figure(
    table(
      columns: 3,

      table.cell(colspan: 3)[*IrBoard costs*],
      table.header([*Cat. Num*], [*Category*], [*Total*]),
      [01], [IrBoard development costs breakdown], [13.026,52 €],
      [02], [Other], [172,50 €],
      [03], [Profit (25%)], [3.299,75 €],
      table.cell(colspan: 2)[total], [16.498,77 €],
    ),
    caption: "Provider's budget summary",
  )
  And allows us to compute the following metrics for the client's budget:
  - Amount to be increased on the first category: 3.472,25 €
  - Total billable hours: 300,00 hours
  - Dilution increase per billable hour: 11,58 €
]
=== Client's budget
As stated before, on the client's budget only the directly billable budget lines are shown. Any line with an standard or expected market value cannot be increased to dilute the amounts non-billable (profit, trips, meals...), but in this case this is not necessary as no hardware adquisition is needed.
#figure(
  table(
    columns: (0.5fr, 0.5fr, 3fr, 1fr, 1fr),
    align: left,
    table.cell(colspan: 5)[*Detailed client budget*],
    table.header([*I1*], [*I2*], [*Description*], [*Cost*], [*Total*]),
    [01], [], [Project management], [], [1.840,86 €],
    [], [001], [Design project schedule], [122,72 €], [],
    [], [002], [Generate budget], [122,72 €], [],
    [], [003], [Periodic project management], [1.595,42 €], [],
    [02], [], [Analysis/Software Requirements], [], [2.932,53 €],
    [], [001], [Determine project scope], [53,74 €], [],
    [], [002], [Review Regulatory Standards], [227,20 €], [],
    [], [003], [Identify required Documentation], [107,48 €], [],
    [], [004], [Determine hand-ins for the project], [53,74 €], [],
    [], [005], [Adapt project template to typst], [107,48 €], [],
    [], [006], [Analyze existing systems], [340,80 €], [],
    [], [007], [Draft preliminary software requirements], [1.182,26 €], [],
    [], [008], [Model auxiliary diagrams], [322,44 €], [],
    [], [009], [Review software requirements], [107,48 €], [],
    [], [010], [Modify requirements with feedback], [429,91 €], [],
    [03], [], [Design], [], [2.863,95 €],
    [], [001], [Design architecture], [607,34 €], [],
    [], [002], [Design brand identity], [150,40 €], [],
    [], [003], [Design project management], [443,41 €], [],
    [], [004], [Design stakeholder management], [221,71 €], [],
    [], [005], [Design requirement management], [332,56 €], [],
    [], [006], [Design user management], [554,27 €], [],
    [], [007], [Design document management], [554,27 €], [],
    [04], [], [Set up SonarQube for Quality Assurance], [166,28 €], [166,28 €],
    [05], [], [Development], [], [5.602,80 €],
    [], [001], [Set up architecture], [242,94 €], [],
    [], [002], [Set up development enviroment], [182,20 €], [],
    [], [003], [Develop code], [5.177,66 €], [],
    [06], [], [Testing], [], [1.364,15 €],
    [], [001], [Test project management module], [200,53 €], [],
    [], [002], [Test stakeholder management module], [150,40 €], [],
    [], [003], [Test requirement management module], [250,66 €], [],
    [], [004], [Test user management module], [150,40 €], [],
    [], [005], [Test document management], [150,40 €], [],
    [], [006], [Test modifying concurrency system], [100,26 €], [],
    [], [007], [Test search and filtering], [150,40 €], [],
    [], [008], [Usability and accesibility testing], [100,26 €], [],
    [], [009], [Load testing], [110,85 €], [],
    [07], [], [Documentation], [], [1.729,94 €],
    [], [001], [Document declaration of originality, abstract and keywords], [61,36 €], [],
    [], [002], [Document introduction], [61,36 €], [],
    [], [003], [Document theoretical background], [56,80 €], [],
    [], [004], [Document feasibility study and alternative analysis], [113,60 €], [],
    [], [005], [Document Initial project planning and management], [122,72 €], [],
    [], [006], [Document system analysis], [161,22 €], [],
    [], [007], [Document system design], [303,67 €], [],
    [], [008], [Document system implementation], [277,13 €], [],
    [], [009], [Document test plan execution], [110,85 €], [],
    [], [010], [Document system manuals], [277,13 €], [],
    [], [011], [Document final project closure], [122,72 €], [],
    [], [012], [Document conclusions and future work], [61,36 €], [],
    table.cell(colspan: 4)[*Total*], [16.500,52 €],
  ),
  caption: "Detailed client budget",
)
#figure(
  table(
    columns: 3,
    align: left,
    table.cell(colspan: 3)[*Simplified client budget*],
    table.header([*Cat. Num*], [*Category*], [*Total*]),
    [01], [IrBoard development costs breakdown], [16.500,52 €],
    table.cell(colspan: 2)[*total*], [16.500,52 €],
  ),
  caption: "Simplified client budget",
)

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
On this document, several different kinds of identifiers are referenced, be dynamic, internal unique identifier, or "entity slug".
TODO explain more
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
- [1] “Welcome to Ory! | Ory,” Ory.com, Oct. 15, 2025. https://www.ory.com/docs/ (accessed Mar. 07, 2026).
- [2] “Configuring Vite,” vitejs, 2025. https://vite.dev/config/
- [3] “Typst Documentation,” Typst, 2024. https://typst.app/docs/
= Appendices <appendices>
== Budget
=== Provider finantial reality <provider_finantial_reality_budget>

== Supplementary Material
