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

== Problem Definition

== Objectives

== Scope and Limitations

== Development Methodology and Planning

= System architecture // 3


= Feasibility study // 4


= Project management and planning // 5


= System analysis // 6


= System design // 7


= System implementation // 8


= Deployment and system acceptance // 9


= Conclusions and future work // 10
