# Contributing

Contributions to IR-Board go through pull requests and review. This page describes what a change needs to satisfy before it's merged.

## Ground rules

Every extension to the system must:

1. **Be submitted as a pull request** and reviewed by a trusted developer of the project before merging.
2. **Come with appropriate tests.** New behavior needs tests at the right level (see below), and no existing test may be left broken.
3. **Be properly scoped and self-contained.** Partial or half-implemented features are not acceptable. If a feature can't be finished in one change, split it into pieces that each stand on their own.
4. **Pass the SonarQube quality gate without exception.**

## The quality gate

Static analysis runs through **SonarQube** as part of the continuous integration pipeline, and the quality gate enforces:

- **Code coverage of at least 80%.** Coverage is measured from a coverage-instrumented test run, so make sure your tests actually execute under that mode.
- **No accumulation of critical code smells or reliability issues.**
- **Duplication below the configured threshold**, which applies to the frontend as well as the backend.
- **No common security vulnerabilities**, checked against standards such as the OWASP Top 10.

If the gate fails, fix the underlying issue rather than adjusting the thresholds.

## What to test

| Change | Expected tests |
|---|---|
| Domain entity logic (state transitions, validation) | Backend unit tests, without mocks where possible. |
| Service or adapter logic | Backend unit tests with Mockito for collaborators. |
| New or changed endpoint | Backend integration tests covering success and error paths. See [API Development](api-development.md). |
| Frontend page or component | Vitest + React Testing Library tests. |
| A new user-facing workflow | Consider an end-to-end Playwright scenario, following the create–operate–delete pattern of the existing suite. |

Details on each layer are in [Testing](../testing/index.md).

## Before opening a pull request

- [ ] The stack builds and runs from a clean state (`docker compose down -v`, then `docker compose up -d --build`). See [Local Setup](local-setup.md).
- [ ] Domain rules live in the domain layer, orchestration in the application layer, and external calls behind the existing ports. See [Backend Development](backend-development.md).
- [ ] Permission checks go through `PermissionService`, and the frontend reads permission fields from the backend rather than inferring them. See [Frontend Development](frontend-development.md).
- [ ] All tests pass and coverage stays above the threshold.
- [ ] The change is complete on its own, with no half-finished features.

## Open areas

Some known gaps are good candidates to pick up:

- **Warning before cascading removal.** Removing a parent requirement force-removes all its descendants, including children that were reactivated independently, and the UI doesn't warn about it. See [Architecture › Lifecycle and Workflows](../architecture/lifecycle-and-workflows.md).
- **Expired lock cleanup.** Expired entity locks are only removed lazily, so the UI can show stale lock indicators. See [Architecture › Concurrency](../architecture/concurrency.md).
- **Presigned URLs for documents.** Uploads and downloads currently pass through the backend. See [Architecture › Backend](../architecture/backend.md).
- **Cross-service consistency.** Operations spanning the database and object storage lack compensating actions.
- **Object storage dependency.** The MinIO open-source edition is in maintenance mode, and the deployment currently uses unpinned `latest` tags. Pinning versions and evaluating an actively maintained S3-compatible alternative are both open.
- **Centralized frontend error handling.** A shared fetch wrapper could redirect unrecoverable failures to the error page consistently.
- **Completing the draw.io integration** and **PDF export of requirements.** Both are provisioned or planned but not finished.
- **Keyboard navigation**, including Enter-to-navigate in slug search.
- **Further E2E coverage** for multi-user access control, concurrency, and slug search, all currently verified manually only.