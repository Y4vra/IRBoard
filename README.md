# IR-Board: Requirements Management Platform

**IR-Board** es una plataforma web integral para la gestión de requisitos de software. Su objetivo es cerrar la brecha entre los estándares de ingeniería (IEEE 830, ISO 29148) y las metodologías ágiles, proporcionando un entorno colaborativo en tiempo real con trazabilidad total.

## ✨ Características Principales

* **Gestión Normativa:** Soporte nativo para estándares **IEEE 830** e **ISO 29148**.
* **Colaboración en Tiempo Real:** Sistema de edición concurrente mediante **mutex a nivel de requisito** (bloqueo de párrafo), similar a herramientas como Google Docs/Word Online.
* **Modelado Integrado:** Integración con **Draw.io** para diagramas de flujo, casos de uso y tablas de decisión vinculadas directamente a los requisitos.
* **Trazabilidad Bidireccional:** Sistema inteligente de *flagging* que marca elementos dependientes (interesados, otros requisitos o diagramas) para revisión automática tras cambios.
* **Gestión de Stakeholders:** Control detallado de fuentes e interesados con vinculación directa a la toma de requisitos.
* **Versionado de Proyectos:** Control de versiones basado en *Semantic Versioning* (Major.Minor) para el estado global del proyecto.

---

## 🏗️ Arquitectura Técnica

El sistema utiliza una arquitectura de **microservicios** diseñada para la escalabilidad, seguridad y alta disponibilidad.

### Stack Tecnológico

* **Frontend:** React con **Material UI (MUI)** para una interfaz adaptativa y profesional.
* **Backend:** Java con **Spring Boot**, elegido por su robustez y seguridad nativa.
* **Base de Datos:** **PostgreSQL** con soporte para columnas **JSONB**, permitiendo la rigidez de los datos relacionales y la flexibilidad de atributos personalizados.
* **Seguridad:** Ecosistema **Ory** (Kratos para identidades y sesiones; Oathkeeper como Proxy de cumplimiento).
* **Gateway:** Traefik para el enrutamiento de red.
* **Observabilidad:** Stack de logging centralizado con **Loki**, **Promtail** y visualización en **Grafana**.

Para garantizar el principio de menor privilegio, la arquitectura se divide en:

1. **Red Pública:** Aloja el Gateway (Traefik) y el Frontend (React).
2. **Red Interna:** Protege el Backend, los servicios de identidad (Ory) y las bases de datos.

---

## 🚀 Instalación y Desarrollo (TFG en progreso)

Actualmente, el proyecto se encuentra en fase de desarrollo.

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/ir-board.git

```

---

## ⚖️ Licencia

Este proyecto se distribuye bajo la licencia **GNU GPLv3**. Consulta el archivo `LICENSE` para más detalles.

---

## 🎓 Créditos

Desarrollado como Trabajo de Fin de Grado (TFG) para la universidad de oviedo.
**Autor:** Javier Carrasco Arango - Y4vra
