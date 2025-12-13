# Decisiones arquitectónicas
Debido a petición de los tutores, se decidió un sistema web sobre standalone.
Se elige React con Material UI debido a su conocimiento previo, además de una gran versatilidad y enfoque destinado a portabilidad y adaptabilidad. Se prefiere sobre la madurez de otros frameworks como Angular, o sobre bibliotecas de componentes como Ant Design o TailwindCss debido a dicho enfoque y simplificación del desarrollo.
Se elige SpringBoot sobre Express.js por el entorno más seguro por defecto, y valorando que ambos tienen una buena integración con la tecnología de frontend elegida.

A fin de facilitar su implantación en otros sistemas, se decide separar el frontend y backend en proyectos separados para facilitar su adaptación a otros entornos.

Arquitectura web simulando trabajo colaborativo similar al word con los mutex a nivel de párrafo = requisito
# Funcionalidades de alto nivel
## Gestión de proyectos
- Creación de proyecto
- Borrado de proyecto
- Modificado de proyecto 
- Asignación de proyecto a usuarios
## Gestión de stakeholders
- Añadido de stakeholder
- Borrado de stakeholder
- Modificado de stakeholder
	- Flagging de requisitos asociados a revisar.
## Gestión de requisitos
- Añadido de requisito
- Borrado de requisito
	- Flagging de otros que lo referencien
- Modificado de requisito
	- Flagging de material asociado a revisar
- Linking con stakeholder (Observer pattern)
- Filtrado
	- Según orden natural
	- Según orden 
## Gestión de usuarios
- Añadido de usuario
	- Niveles de permiso: (Admin - (proyectos, gest. usuarios, asignado gestor proyecto), gestor de proyecto - (asignar usuarios como ingeniero requisitos), ingeniero requisitos - (gestión de requisitos de medio - bajo), Usuario stakeholder (solo permiso de visión))
- Borrado de usuario
- Modificado de usuario
- Asignación de usuarios
	- Admin puede asignar a proyectos.
	- Gestor de proyecto puede asignar como ing. requisitos de sus proyectos.
		- Puede asignar permisos de acceso a editar según que niveles de la estructura (requisitos de alto - medio - bajo).
		- Puede asignar permisos de gestor de archivos (añadir, borrar, editar)
		- (Opcional) Generar un grupo con conjunto de permisos (copiar a linux)
## Gestión de documentos asociados
- Añadido de documento
- Asociado de documento
	- A una funcionalidad
	- A un conjunto de requisitos
- Modificación
	- Flagging de documento al cambiar un requisito/funcionalidad asociada
- Borrado
## Herramienta de draw.io para los diagramas

## Control de variantes
Muy ambicioso solo si voy bien de tiempo.
Tenerlo en cuenta aunque no lo implemente, reutilización de requisitos.
Definición de plantillas o proyectos abstractos.
En la industria se tira por copia y pega.
## Control de versiones
Aparte de UUID interno y orden externo (del usuario).
Número de versión **del PROYECTO**. Semantic versioning Major-Minor.
- Guardado de versión
- Recargado de versión
