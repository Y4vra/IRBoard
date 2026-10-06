# Testing

IR-Board is validated across several layers: automated unit, integration, and end-to-end tests; static analysis; load testing under concurrent usage; and manual usability and accessibility testing.

- **[Test Strategy](test-strategy.md)** — the overall approach, and which tool is used at each layer.
- **[Functional Testing](functional-testing.md)** — unit, integration, acceptance, and end-to-end tests, and how they're organized on both backend and frontend.
- **[Security Testing](security-testing.md)** — static analysis via SonarQube and verification of access-control boundaries.
- **[Usability and Accessibility](usability-and-accessibility.md)** — the testing protocol used, current results, and known open issues.
- **[Load Testing](load-testing.md)** — how concurrent usage is simulated, and current results against the system's performance targets.

## Current coverage

Not every scenario identified in [Test Strategy](test-strategy.md) is automated yet — multi-user access-control flows and concurrency control, for example, are verified manually today. Gaps like these are called out on the relevant page rather than left implicit.