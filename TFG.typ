// ===============================
// Configuración general del documento
// ===============================
#import "@preview/efilrst:0.3.2" as efilrst
#show ref: efilrst.show-rule
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
#set page(numbering: "I")
= Declaration of originality
I, <Name>, with DNI <DNI> and UO294532, hereby declare that this work is completely original and all sources used during the development of it have been correctly cited.
In Avilés, Asturias, on the xx of xx of 2026,



Signed: <Sign>
#pagebreak()
= Abstract

= Keywords

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

= Introduction // 1
#set page(numbering: "1")
#counter(page).update(2)
== Object

== Background

== Current state

== Definitions and Abbreviations

== Scope

== Assumptions and Constraints

= Theoretical Background //2

= Feasibility Study and Alternatives Analysis //3

= Initial Project Planning and Management //4

== Stakeholder Identification

== OBS and PBS

== Initial Planning

== Risk Analysis

== Initial Budget

= System Analysis //5

== Input Documentation

== Users and Characteristics

== Requirements Analysis
#figure(image("docs\diagrams\RequirementStates.svg"), caption: "Requirement entity's state diagram")

== System Analysis

=== Class Analysis

=== Data Modeling

=== Process Modeling

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
==== project management
#PM_List(
  [The system must allow an admin to create a project],
  (
    [The system must require a Project name to generate a project correctly],
    [The system must require a description to generate a project correctly],
    [The system must require a user to be project manager to generate a project correctly],
    [The system must allow to optionally change the priority style set for the project, either:],
    (
      [Ternary (High, Medium, Low) Predefined],
      [MOSCOW (Must, Should, Could or Won't have)],
    ),
  ),
  [The system must allow an admin to deactivate a project],
  (
    [The system must ask for confirmation before deactivating],
    [The system must put the project on read only mode],
  ),
  [The system must allow an admin to reactivate a deactivated project],
  [The system must allow an admin to modify an active project],
  [The system must allow to link users with a project],
  (
    [The system must allow an admin to link users to a project as project manager],
    [The system must allow an admin or project manager linked to the project to link users to a functionality on said project as a stakeholder user],
    [The system must allow a project manager to link users to one or more functionalities of a project as requirement engineers.],
  ),
  [The system must allow access to the project description/dashboard to users linked to it or a functionality of it.],
  (
    [The system must show the total split of requirements by their states (pie chart)],
    [The system must show the different functionalities of the project],
  ),
  [The system must allow a project manager to mark as approved all elements in a project],
  [The system must allow a project manager to add a functionality to a project],
  (
    [A functionality needs a name and unique set of letters for its dynamic identifier.],
    [The system must automatically attempt to get the letters for the dynamic identifier from the name],
    (
      [The system must take the first letter from every word in the name.],
      [If the identifier is already in use by another functionality on the same project, the system will suggest one letter more of each word on the name.],
      [If the system cannot generate a new set of letters to identify its requirements, a message must be shown to the project manager.],
    ),
    text(green)[The system must deny adding any functionality with an identifier matching another on the same project.],
    [The system must automatically link the project manager to the new functionality],
  ),
  [The system must allow a project manager to modify a functionality.],
  [The system must allow a project manager to deactivate a functionality.],
  (
    [The system must ask for confirmation before deactivating],
    [The system must put the functionality (elements contained by it) on read only],
  ),
  [The system must allow a project manager to reactivate a functionality.],
  [The system must allow a project manager to mark as approved all elements in a functionality],
  [The system must allow a project manager to generate a baseline for a project.],
  (
    [The system must perform a snapshot of the project once a baseline is set.],
  ),
  [The system must allow a project manager to export the project's requirements onto a pdf file],
)
==== Stakeholders management
#SM_List(
  [The system must allow any user linked with the project access to view its stakeholders],
  (
    [The system must show if a stakeholder is flagged as pending review],
    [The system must show the identifier, the name and part of the description],
    [The system must allow to collapse and expand stakeholders with children],
    [The system must allow to view the details of a stakeholder],
    (
      [The system must show all atributes of a stakeholder],
      [The system must show all requirements linked to it],
    ),
  ),
  [The system must allow a project manager to add a new stakeholder to a project],
  (
    [The system must only allow a stakeholder to be added to a project the user is linked to.],
    text(green)[The system must require a name to generate a stakeholder],
    text(green)[The system must require a description to generate a stakeholder],
    [The system must generate the identifier for the stakeholder],
  ),
  [The system must allow a project manager or requirement engineer to link a stakeholder to one or more requirements on the same project],
  (
    [The system must only allow the user to link the stakeholder to a requirement on a functionality they are linked to],
  ),
  [The system must allow a project manager or requirement engineer to unlink a stakeholder from one or more requirements],
  (
    [The system must only allow the user to unlink a stakeholder from a requirement of a functionality they are linked to.],
  ),
  [The system must allow a project manager to deactivate a stakeholder from a project the user is linked to],
  (
    [The system must show the user the amount of entities affected by the deactivations],
    [The system must flag all entities linked as pending review],
    [The system must ask for confirmation before deactivating],
    [The system must put the stakeholder on read only mode],
  ),
  [The system must allow a project manager or requirement engineer to modify a stakeholder],
  (
    [The system must flag as pending review linked entities upon saving with changes.],
  ),
)
==== Requirement management
#RM_List(
  [The system must allow users linked to a project or functionality of a project access to its requirements],
  (
    [The system must only allow users linked to the functionality of a functional requirement access to it],
    [The system must allow to collapse and expand requirements with children],
    [The system must show the dynamic identifier, the name, state and part of the description],
    [The system must allow to view the details of a requirement],
    (
      [The system must show the internal unique identifier],
      [The system must show all atributes of a requirement],
      [The system must show all stakeholders linked to it],
      [The system must show all requirements cross-linked with it],
      [The system must show all documents linked to it],
      [The system must show the previous dynamic identifiers],
    ),
  ),
  [The system must allow a requirement engineer or a project manager to add a requirement to a project the user is linked to],
  (
    [The system must only allow a functional requirement to be added to a functionality the user is linked to.],
    [The system must allow the user to generate a requirement as a child of another requirement (nesting).],
    [The system must assign automatically the dynamic identifier],
    (
      [The identifier must be based on its relation to other requirements.],
      [The identifier must represent if it is a functional or non functional requirement (FR or NFR)],
      [The identifier must represent the folder/component that holds the requirement (user management -> UM)],
    ),
    [The system must assign automatically the internal unique identifier],
    (
      [The identifier must represent the project that will hold the requirement],
      [The identifier must represent whether the requirement is functional or non functional],
      [The identifier must have a random element to ensure a low colision rate],
    ),
    [The system must ask for the following data for a functional requirement:],
    (
      [The system must require a name],
      [The system must require a description],
      [The system must require a priority following the one set on the project creation],
      [The system must allow to set a stability, which is optional],
      [The system must allow to set a stakeholder as origin, which is optional],
    ),
    [The system must ask for the following data for a non-functional requirement:],
    (
      [The system must require a name],
      [The system must require a description],
      [The system must allow to set a measurement unit],
      [The system must allow to set a comparison operator],
      ([equal to, less than or greater than],),
      [The system must allow to set a threshold value],
      ([This value represents the minimum value to mark the requirement as passed],),
      [The system must allow to set a target value],
      ([This value represents the optimal value desired by the team],),
      [The system must allow to set an actual value],
      ([This value represents the current status of the measurement],),
    ),
    text(green)[The system must automatically set the new requirement as pending approval ],
  ),
  [The system must allow a project manager or requirement engineer to link a requirement on a functionality they are linked to, to another entity],
  (
    [The system must allow to link a requirement with a stakeholder of the same project],
    [The system must allow to un-link a requirement with a stakeholder],
    [The system must allow to link a requirement with one or more requirements of functionalities of the same project the user is linked to],
    [The system must allow to un-link a requirement with other requirements of functionalities of the same project the user is linked to],
    [The system must allow to link a requirement with one or more documents of the same project.],
    [The system must allow to un-link a requirement with one or more documents of the same project.],
  ),
  [The system must allow a requirement engineer or a project manager to deactivate a requirement on a functionality they are linked to],
  (
    [The system must show the user the amount of entities that will be affected by the deactivation],
    [The system must ask for confirmation],
    [The system must flag any requirements linked to the deactivated requirement as pending review],
    [The system must put the requirement on read only],
  ),
  [The system must allow a requirement engineer or a project manager to reactivate a requirement on a functionality they are linked to],
  (
    [The system must automatically flag as pending review the reactivated requirement],
  ),
  [The system must allow a requirement engineer or a project manager to modify a requirement on a project],
  (
    [The system must only allow a project manager or requirement engineer to modify functional requiremets of a functionality the user is linked to.],
    [The system must flag linked requirements as pending review upon saving with changes.],
  ),
  [The system must allow a project manager to mark as approved one or more requirements],
  (
    [The system must only allow to mark as approved a requirement that is pending approval, not pending review nor deactivated.],
  ),
  [The system must allow a project manager or requirement engineer linked to a functionality of the project to change the position of a requirement],
  (
    [The system must allow reordering of functional requirements to users linked to the same functionality.],
    [The system must update the dynamic identifier automatically],
    [The system must set the order of requirements using a floating point order value],
  ),
  [The system must allow a project manager or requirement engineer to review an requirement flagged as pending a review],
  (
    [The system must allow removing the flag if no changes are required.],
    [The system must allow modifying the requirement upon review.],
    (
      [The system must remove the flag upon saving with changes.],
      [The system must flag the linked entities as pending a review.],
    ),
  ),
)
==== User management
#UM_List(
  [The system must allow an admin to invite new users to the system],
  (
    [The system must provide different levels of authorisation.],
    (
      [The system must have the levels: Admin, project manager, requirement engineer and stakeholder user],
    ),
    [The system must ask the admin to set the name, surname, and email of the invited user],
    (
      [The system must generate an signup code as a temporal password],
      [The system must automatically send an invitation with the signup code to the email of the invited user],
    ),
  ),
  [The system must allow an admin to modify the name and surname of a user from the system],
  [The system must allow an admin to generate a new invite with a signup code for a user],
  [The system must allow any user with valid credentials to sign in to the system],
  (
    [The system must prompt any user signing in with a signup code to set a permanent password.],
    (
      [The system must ensure the password is between 15 and 64 characters long.],
      [The system must make use of a random salt specific of each user.],
      [The system must remove any password or signup code of the user upon seting a permanent password.],
    ),
    [The system must temporally block the user after 3 consecutive failed attempts],
  ),
  [The system must allow an admin to deactivate a user from the system],
  (
    [A deactivated user remains on the system but cannot access it],
  ),
  [The system must allow an admin to reactivate a user from the system],
)
==== Document management and modelling
#DMM_List(
  [The system must allow users linked to a project access to documents of that project],
  (
    [The system must show entities linked to the document.],
  ),
  [The system must allow a project manager or a requirement engineer to add document to a project],
  (
    [The user must be linked to the project],
  ),
  [The system must allow a document to be linked to one or more requirements of the same project],
  (
    [The system must flag those requirements linked to it as pending a review if the document is altered],
  ),
  [The system must allow a project manager or requirement engineer to update a document],
  (
    [The user must be linked to the project the document is on.],
    [The system must flag as pending a review any requirements linked to the document],
  ),
  [The system must allow a project manager to disable a document],
  (
    [The system must flag as pending a review any requirements linked to the document],
  ),
  [The system must allow a requirement engineer to model diagrams using a Draw.io integration],
)
==== Concurrency
#C_List(
  [The system must block other users from modifying an entity that another user is already modifying],
  (
    [The system must release automatically the entity if the user modifying it saves and exits (stops modifying).],
    [The system must release automatically the entity after a predetermined timeout period],
    [The system must release automatically the entity if the user editing it modifies another entity],
    [The system must only accept changes to the entity from the user who holds the entity],
  ),
  [The system must display for other users who is modifying the entity],
)
==== Search and filtering
#SF_List(
  [The system must allow searching an entity by internal unique identifier.],
  (
    [The system must search lexically],
    [The system must allow the user to see the details of the found entity],
    (
      [only if an exact match occurs,],
      [only if the user has access to it.],
    ),
  ),
  [The system must allow users to filter entities they have access to],
  (
    [The system must allow filtering out deactivated requirements],
    [The system must allow filtering requirements based on priority],
    [The system must allow filtering requirements based on state],
    [Any filter must be reversible; ascending or descending order],
  ),
)
=== Usability Requirements

=== Performance Requirements

=== Logical Database Requirements

=== Design Constraints

=== System Attributes

=== Supporting Information

== Test Plan Analysis

= System Design //6

== System Architecture

== Real Use Case Design

== Class Design

== Database Design

== User Interface Design

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

= Appendices
== Supplementary Material
