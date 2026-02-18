// ===============================
// Configuración general del documento
// ===============================

#set page(
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 3cm),
  footer: context {
    let i = counter(page).at(here()).at(0)
    if i > 1 [
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
    image("Emblema Universidad de Oviedo Horizontal Color.png"),
    [],
    image("EII_logotipo_version_principal_PREFERIDO.png"),
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
// función que auto separa secciones
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  it
}
= Declaration of originality

= Special thanks to
// ===============================
// Índice
// ===============================

#outline(
  title: [Summary of Chapters],
  indent: auto,
  depth: 2,
)
#counter(page).update(1)

#set heading(numbering: (..nums) => {
  let n = nums.pos()
  if n.len() == 1 {
    return "Chapter " + str(n.at(0)) + ". "
  } else {
    return n.map(str).join(".") + " "
  }
})
= Introduction // 1
== Abstract

== Keywords

== Resumen

== Palabras clave

= Project context and planning //2
== Project Context and Motivation

== State of the Art and Related Work
=== Existing Requirement Management Tools
=== Limitations of Existing Solutions

=== Key Lessons and Takeaways
== Problem Definition

== Objectives

== Scope and Limitations

== Development Methodology and Planning

// 3
= System architecture
== Overall System Architecture

== Technology Stack

== Infrastructure Decisions

== Justification of Technology Choices

// 4
= Feasibility study

== Feasibility of Alternatives

== Selected Alternative and Justification

== Risk Assessment (High-Level)

// 5
= Project management and planning
== Project planning
=== ?
== Work Breakdown Structure (WBS)

== Risk Management

== Timeline and Milestones

== Budget and Resources

== Lessons Learned / Reflection

// 6
= System analysis
== System Definition

=== Determination of System Scope

=== System Context Diagram

== Requirements Elicitation and Specification

=== Functional Requirements
==== project management
- The system must allow an admin to create a project
  - The following are required:
    - Project name
    - Description
    - Owner
  - The following are optional:
    - Priority, either:
      - Ternary (High, Medium, Low) Predefined
      - MOSCOW (Must, Should, Could or Won't have)
- The system must allow an admin to deactivate a project
  - The system must ask for confirmation before deactivating
  - The system must put the project on read only mode
- The system must allow an admin to reactivate a deactivated project
- The system must allow an admin to modify an active project
- The system must allow to link users with a project
  - The system must allow an admin to link users to a project as project manager
  - The system must allow an admin or project manager linked to the project to link users to a functionality on said project as a stakeholder user
  - The system must allow a project manager to link users to one or more functionalities of a project as requirement engineers.
- The system must allow access to the project description/dashboard to users linked to it or a functionality of it.
  - The system must show the total split of requirements by their states (pie chart)
  - The system must show the different functionalities of the project
- The system must allow a project manager to mark as approved all elements in a project
- The system must allow a project manager to add a functionality to a project
  - A functionality needs a name and unique set of letters for its dynamic identifier.
  - The system must automatically attempt to get the letters for the dynamic identifier from the name
    - The system must take the first letter from every word in the name.
    - If the identifier is already in use by another functionality on the same project, the system will suggest one letter more of each word on the name.
    - If the system cannot generate a new set of letters to identify its requirements, a message must be shown to the project manager.
  - The system must check the letters for the identifier are not the same from another functionality on the same project.
    - The system must deny adding a functionality that breaks the rule above.
  - The system must automatically link the project manager to the new functionality
- The system must allow a project manager to modify a functionality.
- The system must allow a project manager to deactivate a functionality.
  - The system must ask for confirmation before deactivating
  - The system must put the functionality (elements contained by it) on read only
- The system must allow a project manager to reactivate a functionality.
- The system must allow a project manager to mark as approved all elements in a functionality
- The system must allow a project manager to generate a baseline for a project.
  - The system must perform a snapshot of the project once a baseline is set.
- The system must allow a project manager to export the project's requirements onto a pdf file
==== Stakeholders management
- The system must allow any user linked with the project access to view its stakeholders
  - The system must show if a stakeholder is flagged as pending review
  - The system must show the identifier, the name and part of the description
  - The system must allow to collapse and expand stakeholders with children
  - The system must allow to view the details of a stakeholder
    - The system must show:
      - All atributes of a stakeholder
      - All requirements linked to it
- The system must allow a project manager to add a new stakeholder to a project
  - The system must only allow a stakeholder to be added to a project the user is linked to.
  - The system must ask for the following:
    - Name
    - Description
  - The system must generate the identifier for the stakeholder
- The system must allow a project manager or requirement engineer to link a stakeholder to one or more requirements on the same project
  - The system must only allow the user to link the stakeholder to a requirement on a functionality they are linked to
- The system must allow a project manager or requirement engineer to unlink a stakeholder from one or more requirements
  - The system must only allow the user to unlink a stakeholder from a requirement of a functionality they are linked to.
- The system must allow a project manager to deactivate a stakeholder from a project the user is linked to
  - The system must show the user the amount of entities affected by the deactivations
  - The system must flag all entities linked as pending review
  - The system must ask for confirmation before deactivating
  - The system must put the stakeholder on read only mode
- The system must allow a project manager or requirement engineer to modify a stakeholder
  - The system must flag as pending review linked entities upon saving with changes.
==== Requirement management
- The system must allow users linked to a project or functionality of a project access to its requirements
  - The system must only allow users linked to the functionality of a functional requirement access to it
  - The system must allow to collapse and expand requirements with children
  - The system must show the dynamic identifier, the name, state and part of the description
    - The system must show as "state" on a non-functional requirement whether it is passed or not
  - The system must allow to view the details of a requirement
    - The system must show:
      - The internal unique identifier
      - All atributes of a requirement
      - All stakeholders linked to it
      - All requirements cross-linked with it
      - All documents linked to it
      - The previous dynamic identifiers
- The system must allow a requirement engineer or a project manager to add a requirement to a project the user is linked to
  - The system must only allow a functional requirement to be added to a functionality the user is linked to.
  - The system must allow the user to generate a requirement as a child of another requirement (nesting).
  - The system must assign automatically the dynamic identifier
    - The identifier must be based on its relation to other requirements.
    - The identifier must represent if it is a functional or non functional requirement (FR or NFR)
    - The identifier must represent the folder/component that holds the requirement (user management -> UM)
  - The system must assign automatically the internal unique identifier
    - The identifier must represent the project that will hold the requirement
    - The identifier must represent whether the requirement is functional or non functional
    - The identifier must have a random element to ensure a low colision rate
  - The system must ask for the following data for a functional requirement:
    - The following are required:
      - Name
      - Description
      - a priority as predefined on the project
    - The following are not required:
      - Stability
      - Origin
  - The system must ask for the following data for a non-functional requirement:
    - The following are required:
      - Name
      - Description
    - The following are optional:
      - Measurement unit
      - comparison operator
        - equal to, less than or greater than
      - Threshold value
        - This value represents the minimum value to mark the requirement as passed
      - Target value
        - This value represents the optimal value desired by the team
      - Actual value
        - This value represents the current status of the measurement
- The system must allow a project manager or requirement engineer to link a requirement on a functionality they are linked to, to another entity
  - The system must allow to link a requirement with a stakeholder of the same project
  - The system must allow to un-link a requirement with a stakeholder
  - The system must allow to link a requirement with one or more requirements of functionalities of the same project the user is linked to
  - The system must allow to un-link a requirement with other requirements of functionalities of the same project the user is linked to
  - The system must allow to link a requirement with one or more documents of the same project.
  - The system must allow to un-link a requirement with one or more documents of the same project.
- The system must allow a requirement engineer or a project manager to deactivate a requirement on a functionality they are linked to
  - The system must show the user the amount of entities that will be affected by the deactivation
  - The system must ask for confirmation
  - The system must flag any requirements linked to the deactivated requirement as pending review
  - The system must put the requirement on read only
- The system must allow a requirement engineer or a project manager to reactivate a requirement on a functionality they are linked to
  - The system must automatically flag as pending review the reactivated requirement
- The system must allow a requirement engineer or a project manager to modify a requirement on a project
  - The system must only allow a project manager or requirement engineer to modify functional requiremets of a functionality the user is linked to.
  - The system must flag linked requirements as pending review upon saving with changes.
- The system must allow a project manager marking as approved one or more requirements
  - The system must only allow to mark as approved a requirement that is pending approval, not pending review nor deactivated.
- The system must allow a project manager or requirement engineer linked to a functionality of the project to change the position of a requirement
  - The system must allow reordering of functional requirements to users linked to the same functionality.
  - The system must update the dynamic identifier automatically
  - The system must set the order of requirements using a floating point order value
- The system must allow a project manager or requirement engineer to review an requirement flagged as pending a review
  - The system must allow removing the flag if no changes are required.
  - The system must allow modifying the requirement upon review.
    - The system must remove the flag upon saving with changes.
    - The system must flag the linked entities as pending a review.
==== User management
- The system must allow an admin to invite new users to the system
  - The system must provide different levels of authorisation.
    - The system must have the levels: Admin, project manager, requirement engineer and stakeholder user
  - The system must ask the admin to set the name, surname, and email of the invited user
    - The system must generate an signup code as a temporal password
    - The system must automatically send an invitation with the signup code to the email of the invited user
- The system must allow an admin to modify the name and surname of a user from the system
- The system must allow an admin to generate a new invite with a signup code for a user
- The system must allow any user with valid credentials to sign in to the system
  - The system must prompt any user signing in with a signup code to set a permanent password.
    - The system must ensure the password is between 15 and 64 characters long.
    - The system must make use of a random salt specific of each user.
    - The system must remove any password or signup code of the user upon seting a permanent password.
  - The system must temporally block the user after 3 consecutive failed attempts
- The system must allow an admin to deactivate a user from the system
  - A deactivated user remains on the system but cannot access it
- The system must allow an admin to reactivate a user from the system
==== Document management and modelling
- The system must allow users linked to a project access to documents of that project
  - The system must show entities linked to the document.
- The system must allow a project manager or a requirement engineer to add document to a project
  - The user must be linked to the project
- The system must allow a document to be linked to one or more requirements of the same project
  - The system must flag those requirements linked to it as pending a review if the document is altered
- The system must allow a project manager or requirement engineer to update a document
  - The user must be linked to the project the document is on.
  - The system must flag as pending a review any requirements linked to the document
- The system must allow a project manager to disable a document
  - The system must flag as pending a review any requirements linked to the document
- The system must allow a requirement engineer to model diagrams using a Draw.io integration
==== Concurrency
- The system must block other users from modifying an entity that another user is already modifying
  - The system must release automatically the entity if the user modifying it saves and exits (stops modifying).
  - The system must release automatically the entity after a predetermined timeout period
  - The system must release automatically the entity if the user editing it modifies another entity
  - The system must only accept changes to the entity from the user who holds the entity
- The system must display for other users who is modifying the entity
==== Search and filtering
- The system must allow searching an entity by internal unique identifier.
  - The system must search lexically
  - The system must allow the user to see the details of the found entity
    - only if an exact match occurs,
    - only if the user has access to it.
- The system must allow users to filter entities they have access to
  - The system must allow filtering out deactivated requirements
  - The system must allow filtering requirements based on priority
  - The system must allow filtering requirements based on state
  - Any filter must be reversible; ascending or descending order
=== Non-Functional Requirements

=== Actors and Use Cases

== Analysis of Subsystems

=== Subsystem Description

=== Interfaces Between Subsystems

== Use Case Analysis

=== Use Case 1

=== Use Case 2

== Class Analysis

=== Class Diagrams

=== Class Descriptions

== User Interface Definition

=== Layout and Components

=== Interaction Design

=== Navigation Flow

== Test Planning

=== Unit Test Plan

=== Integration Test Plan

=== System Test Plan

// 7
= System design
== Use Case Design

== Class Design
#image("docs\diagrams\RequirementStates.svg")
== Module Architecture Design

== Data Design (Database / ER diagrams)


== Detailed Test Plan / Test Cases

// 8
= System implementation
== Development Environment Setup

== Code Implementation

== Unit Testing

== Integration Testing

== System Testing

=== Usability Tests

=== Accessibility Tests

== User and Developer Manuals

== Migration Scripts Implementation

// 9
= Deployment and system acceptance
== Deployment Plan

== Acceptance Testing

== Maintenance Considerations

// 10
= Conclusions and future work
== Conclusions

== Future Work / Enhancements
=== Document management
- (future work) The system must allow a requirement engineer fill a tabular use case
  - The system must have the following fields:
    - Name
    - Description
    - Actors
    - Initial Condition
    - Preconditions
    - Postconditions
    - Normal flow
    - Alternative flows
    - Exceptions
- (future work) The system must allow a requirement engineer fill a scenario
  - The system must have the following fields:
    - Name
    - Description
    - Actors
    - Initial Condition
    - Preconditions
    - Postconditions
    - Flow
- The system must allow a project manager generate a customized pdf of requirements for a stakeholder
- The system must allow a project manager define a stencil for pdf generation of the srs export
=== Variant control
Highly ambitious—only if time permits.
Keep this in mind even if not implemented: requirement reuse.
Defining templates or abstract projects.
In the industry, "copy and paste" is the standard approach.
=== Search and filtering
The system must allow a user to search requirements by text
