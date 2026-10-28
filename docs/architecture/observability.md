# Observability

IR-Board collects the two most foundational observability signals — **logs** and **metrics** — and exposes them through a dedicated dashboard, giving administrators visibility into the health of a running deployment without needing to inspect individual containers by hand.

## The stack

| Component | Role |
|---|---|
| **Promtail** | Reads container stdout/stderr logs from the Docker socket and forwards them to Loki. |
| **Loki** | Aggregates logs on the internal network and exposes them to Grafana for querying. |
| **Prometheus** | Scrapes operational metrics from instrumented services. |
| **Grafana** | The dashboard layer — queries both Loki and Prometheus and presents them together. |

Grafana is reachable on a dedicated subdomain through Traefik; the other three components operate entirely on the internal network and aren't exposed publicly.

## Logs vs. metrics vs. traces

- **Logs** are timestamped records of individual events — errors, authentication attempts, configuration changes — useful for debugging a specific incident.
- **Metrics** are numerical measurements aggregated over time — CPU usage, memory, request latency, error rates — useful for spotting trends.
- **Traces**, which follow a single request across multiple services, are **not currently implemented**. In a system with this many services in the request path (Traefik → Oathkeeper → Kratos/Keto → backend), traces would be the natural next addition for diagnosing latency across service boundaries — this is tracked as potential future work rather than something the stack already does.

## Known trade-off: Promtail's privileges

Promtail runs with elevated (root) container privileges, which it needs purely to access the Docker socket and read container logs. This is a recognized hardening concern: broader privileges than strictly required for the log-reading task itself, accepted here in exchange for the simplicity of reading logs directly off the Docker socket rather than through an intermediate, more tightly-scoped log-shipping mechanism.

## What's explicitly out of scope

- **Securing and isolating the observability stack itself.** Logging and metrics collection are implemented, but hardening, auditing, and access-managing the observability infrastructure is treated as a separate, infrastructure-level concern — see [Objectives and Scope](../about/objectives-and-scope.md).
- **Advanced dashboards, alerting, and automated incident response.** The platform exposes the data needed for these; building them is left to whoever operates a given deployment, using Grafana's own dashboarding and alerting features directly.

See [Deployment › Services](../deployment/services.md) for how these containers fit into the broader compose stack, including which ports are and aren't exposed.