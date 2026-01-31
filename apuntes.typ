
== Título
*IR-Board: Requirements management platform*

== Resumen
Se pretende crear una herramienta que permita dar soporte a los procesos involucrados en la gestión de
requisitos: gestión de fuentes e interesados, obtención y refinado de requisitos permitiendo la comprobación
de los atributos de calidad, y dando soporte a distintas estándares y normas (guías del IEEE 830 y el estándar
de la ISO 29148)
Se incorporarán facilidades para incluir información de técnicas estáticas y dinámicas (como casos de uso,
diagramas de flujo y tablas de decisión) y la aplicación de metodologías ágiles como las historias de usuario.


= Decisiones arquitectónicas
- Debido a petición de los tutores, se decidió un sistema web sobre standalone.
Se elige React con Material UI debido a su conocimiento previo, además de una gran versatilidad y enfoque destinado a portabilidad y adaptabilidad. Se prefiere sobre la madurez de otros frameworks como Angular, o sobre bibliotecas de componentes como Ant Design o TailwindCss debido a dicho enfoque y simplificación del desarrollo.
- Se elige SpringBoot sobre Express.js por el entorno más seguro por defecto, y valorando que ambos tienen una buena integración con la tecnología de frontend elegida.

- A fin de facilitar su implantación en otros sistemas, se decide separar el frontend y backend en proyectos separados para facilitar su adaptación a otros entornos.

- Arquitectura web simulando trabajo colaborativo similar al word con los mutex a nivel de párrafo = requisito

- La asociación entre elementos a fin de marcar como pendientes de revisar debe ser bidireccional, y de forma que el patrón observer debe estar unido para cada entidad. Para evitar bucles infinitos, se puede hacer una revisión por separado de una modificación, que a efectos, aplica el mutex de la misma manera, y o bien valida o modifica aquello marcado. Se ha decidido ante la visión que, aunque se pueda entrar en un bucle de modificar todo, forma parte del proceso de refinado, y es en esencia, una buena práctica.

- Arquitectura de microservicios
  // red public
  -- Traefik        - Gateway (ya tengo una mínima experiencia con este de ASR)
  -- React          - frontend
  // red internal
  -- Ory Kratos     - Identification & Sessions
  -- Ory Oathkeeper - Enforcement
  -- springboot     - backend con el RMS
  -- PostgreSQL     - BD Identidad para Ory Kratos
  -- PostgreSQL     - BD del RMS
  -- Loki           - Logging centralizado
  -- Promtail       - Agente que recolecta los logs para Loki
  -- Grafana        - Dashboard para métricas y logs de Loki
- Consideraciones de la arquitectura a indicar que valoré pero descarté
Ory Hydra - (unneeded because I'm not an identity provider)
Ory Keto - Authorization (unneded because the role groups are simple)
gateways Kong y Typhoon.

- Elegí microservicios por una mayor escalabilidad e integración más sencilla con servicios existentes.
- Elegí hacer uso de sistemas ya probados de seguridad modulares, como Ory, así como la gateway de traefik, debido a la complejidad, trabajo añadido y probablemente menor eficiencia que tendría crearlos por mi cuenta. Asimismo, evitarlo me asegura un proyecto más sólido, con más facilidad de añadir nuevas funcionalidades, más seguro, y más eficiente.

- Elección de postgre como base de datos relacional debido a que el dominio es estable, se trata de requisitos y datos a guardar considerados estándar, y debido a su integración preferida por Ory. Además, permite usar columnas JSONB, que ofrecen la flexibilidad de bases de datos NoSQL para tener atributos personalizados. Por último, tiene una buena integración con un driver de mucha madurez con springboot.

- Elegí separar en dos redes la arquitectura para dar una mayor seguridad a la arquitectura siguiendo el principio de menor privilegio.

= Funcionalidades de alto nivel
== project management
- The system must allow an admin to create a project
- Borrado de proyecto
- Modificado de proyecto
- The system must allow to link users with a project
  - The system must allow an admin to link users to a project as project manager
  - The system must allow a project manager to link users to a project as requirement engineers.
- Vista general de proyecto
  - % de requisitos aprobados
  - Requisitos pendientes de revisión
== Stakeholders management
- Creation of stakeholder
  - The system must ask for the following:
    - Name
    - Description
    - TODO
- Borrado de stakeholder
  - The system must show the amount of elements affected by the deletion
  - The system must ask for confirmation before deleting
- Modifying a stakeholder
  - The system must deny editing a stakeholder to other users when one is doing so.
    - The system must free the stakeholder after a predetermined inactivity timeout.
    - The system must free the stakeholder if the user editing it begins to edit another.
  - The system must flag as pending review linked entities upon saving with changes.
- Visualización de asociados
  - El sistema debe mostrar los requisitos asociados al stakeholder
- Linking
  - el sistema debe permitir asociar stakeholders a requisitos
  - el sistema debe permitir desasociar stakeholders de requisitos
== Requirement management
- The system must allow users linked to a project access to its contents
  - The system must show if a user is modifying a requirement
    - The system must show who is modifying that requirement
  - The system must show if a requirement is flagged as pending review
  - The system must show the identifier, the name and part of the description
  - The system must allow to collapse and expand requirements with children
  - The system must allow to view the details of a requirement
    - The system must show:
      - All atributes of a requirement
      - All elements linked to it
  - The system must show if a non functional requirement is passed or not
  - The system must allow filtering the requirements
    - The system must allow a requirement engineer or a project manager to reorder requirements
    - The system must allow any user to filter the requirements based on MOSCOW priority
    - (future work) The system must allow a user to search requirements by text
- The system must allow a requirement engineer or a project manager to delete a requirement on a project
  - The system must only allow a requirement to be deleted from a project by a user linked to said project.
  - The system must only allow a requirement engineer to delete a requirement as high as the level set on the project settings
  - The system must ask for confirmation
  - The system must flag any element linked to the deleted requirement as pending review
- The system must allow a requirement engineer or a project manager to add a requirement to a project
  - The system must only allow a requirement to be added to a project the user is linked to.
  - The system must only allow a requirement engineer to add a requirement as high as the level set on the project settings
  - The system must allow the user to generate a requirement as a child of another requirement.
  - The system must assign automatically the identifier
    - The identifier must be based on its relation to other requirements.
    - The identifier must represent if it is a functional or non functional requirement (FR or NFR)
    - The identifier must represent the folder/component that holds the requirement (user management -> UM)
  - The system must ask for the following data for a functional requirement:
    - The following are required:
      - Name
      - Description
      - a priority
        - The system must allow MOSCOW categories (either Must, Should, Could or Won't have)
        - The system must allow to set a priority value from 1-5 with the MOSCOW value
    - The following are not required:
      - Stability
      - Origin
  - The system must ask for the following data for a non functional requirement:
    - The following are required:
      - Name
      - Description
      - Measurement unit
      - comparison operator
        - equal to, less than or greater than
      - Threshold value
        - This value represents the minimum value to mark the requirement as passed
      - Target value
        - This value represents the optimal value desired by the team
      - Actual value
        - This value represents the current status of the measurement

- Linking
  - The system must allow to link a requirement with a stakeholder
  - The system must allow to un-link a requirement with a stakeholder
  - The system must allow to link a requirement with other requirements
  - The system must allow to un-link a requirement with other requirements
- The system must allow a requirement engineer or a project manager to modify a requirement on a project
  - The system must only allow modifying a requirement of a project by a user linked to said project.
  - The system must only allow a requirement engineer to modify a requirement as high as the level set on the project settings
  - The system must deny editing a requirement to other users when one is doing so.
    - The system must free the requirement after a predetermined inactivity timeout.
    - The system must free the requirement if the user editing it begins to edit another.
  - The system must flag linked entities as pending review upon saving with changes.
- Revisión de material marcado como pendiente de revisar
  - Se permite o bien modificar el requisito o marcarlo como correcto.
== User management
- The system must allow an admin to add new users to the system
  - The system must provide different levels of authorisation.
    - The system must have the levels: Admin, project manager, requirement engineer and stakeholder
- Borrado de usuario
- Modificado de usuario
- Asignación de usuarios
  - Admin puede asignar a proyectos.
  - Gestor de proyecto puede asignar como ing. requisitos de sus proyectos.
    - Puede asignar permisos de acceso a editar según que niveles de la estructura (requisitos de alto - medio - bajo).
    - Puede asignar permisos de gestor de archivos (añadir, borrar, editar)
    - (Opcional) Generar un grupo con conjunto de permisos (copiar a linux)
== Document management and modelling
- Visión de documento
  - Visión de asociados
- Añadido de documento
- Asociado de documento
  - A otro documento
  - A uno/s requisito/s
- Modificación
  - The system must flag as pending review any elements linked to the document
- Borrado
- The system must allow a requirement engineer to model diagrams using a Draw.io integration
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

== Control de versiones
Aparte de UUID interno y orden de usuario.
Número de versión del PROYECTO. Semantic versioning Major-Minor.
- Guardado de versión
- Recargado de versión

== Soporte a normas
- El sistema debe dar soporte a las guías del IEEE 830
- El sistema debe dar sooporte a el estándar de la ISO 29148

== Control de variantes
Muy ambicioso solo si voy bien de tiempo.
Tenerlo en cuenta aunque no lo implemente, reutilización de requisitos.
Definición de plantillas o proyectos abstractos.
En la industria se tira por copia y pega.

= Requisitos no funcionales
- RN-01 Persistencia Normativa: La base de datos debe permitir la trazabilidad exigida por la ISO 29148 (id, descripción, prioridad, estado, origen, justificación).
- RN-02 Control de Concurrencia: El sistema debe implementar un mecanismo de bloqueo a nivel de requisito (mutex) para evitar condiciones de carrera durante la edición simultánea.
- RN-03 Disponibilidad y Web: Acceso multiplataforma mediante navegador, garantizando un diseño responsive gracias a Material UI.
- RN-04
