# IR-Board: Requirements Management Platform

**IR-Board** is a comprehensive web platform for software requirements management. Its objective is to bridge the gap between engineering standards (IEEE 830, ISO 29148) and agile methodologies, providing a real-time collaborative environment with full traceability.

## Project Status

The project is analyzed by Sonarcloud to ensure proper development and quality.

### Frontend Status
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Y4vra_IRBoard_Frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Y4vra_IRBoard_Frontend)
### Backend Status
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Y4vra_IRBoard_Backend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Y4vra_IRBoard_Backend)
## Main Features

* **Standard-Based Management:** Native support for **IEEE 830** and **ISO 29148** standards.
* **Real-Time Collaboration:** Concurrent editing system using **requirement-level mutex** (paragraph locking), similar to tools like Google Docs or Word Online.
* **Integrated Modeling:** Integration with **Draw.io** for flowcharts, use cases, and decision tables directly linked to requirements.
* **Bidirectional Traceability:** Intelligent flagging system that marks dependent elements (stakeholders, other requirements, or diagrams) for automatic review after changes.
* **Stakeholder Management:** Detailed control of sources and interested parties with direct links to requirement gathering.
* **Project Versioning:** Version control based on *Semantic Versioning* (Major.Minor) for the global project state.

---

## Technical Architecture

The system utilizes a **microservices** architecture designed for scalability, security, and high availability.

### Technology Stack

* **Frontend:** React with **Material UI (MUI)** for a professional and adaptive interface.
* **Backend:** Java with **Spring Boot**, chosen for its robustness and native security.
* **Database:** **PostgreSQL** with **JSONB** column support, allowing for the rigidity of relational data combined with the flexibility of custom attributes.
* **Security:** **Ory** ecosystem (Kratos for identities and sessions; Oathkeeper as the enforcement proxy).
* **Gateway:** Traefik for network routing.
* **Observability:** Centralized logging stack with **Loki**, **Promtail**, and visualization in **Grafana**.

To guarantee the principle of least privilege, the architecture is divided into:

1. **Public Network:** Hosts the Gateway (Traefik) and the Frontend (React).
2. **Internal Network:** Protects the Backend, identity services (Ory), and databases.

---

## Installation and Development (Work in Progress)

The project is currently in the development phase.

### Local Configuration

1. **Clone the repository:**
```bash
git clone https://github.com/Y4vra/IRBoard.git

```


2. **Environment Configuration:**
Create and configure your `.env` file based on the provided example.
3. **Hosts File Configuration:**
For the Reverse Proxy (Traefik) and the identity system to function correctly, **you must add the domain name defined in your `.env` file to your local hosts file** (e.g., `/etc/hosts` on Linux/macOS or `C:\Windows\System32\drivers\etc\hosts` on Windows).
*Example:*
If your `.env` contains `DOMAIN_NAME=irboard.local`, add the following line:
```text
127.0.0.1 irboard.local api.irboard.local auth.irboard.local objects.irboard.local grafana.irboard.local

```
4. **Oathkeeper Configuration:**
If you use a domain other than the default `irboard.local`, you must configure the API and Grafana domains in `config/oathkeeper/access-rules.yaml`.
5. **docker-compose.yaml configuration:**
If you do not need the development enviroment, modify the docker-compose file to 
6. **Deployment:**
With docker installed, run the following command on the root of the repository:
```bash
docker compose up -d --build
```

---

## License

This project is distributed under the **GNU GPLv3** license. Refer to the `LICENSE` file for further details.

---

## Credits

Developed as a Bachelor's Thesis (TFG) for the University of Oviedo.

**Author:** Javier Carrasco Arango - Y4vra
