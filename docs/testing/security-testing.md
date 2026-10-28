# Security Testing

Security verification combines static analysis with tests of access-control behavior. IR-Board has no dedicated penetration-testing or dynamic security scanning process, so treat the sections below as the complete current picture.

## Static analysis with SonarQube

**SonarQube** runs in the continuous integration pipeline as a static application security testing (SAST) tool. On each significant development checkpoint it:

- Scans for common vulnerabilities and checks against standards such as the **OWASP Top 10**.
- Detects reliability issues and potential bugs through pattern matching.
- Identifies code smells and technical debt.
- Measures coverage and enforces the minimum threshold of **80%**.
- Reports duplicated code.

A change must pass the quality gate without exception before it's merged. See [Contributing](../development/contributing.md).

Reaching the gate surfaced real issues: maintainability problems on the backend, and duplication above the threshold on the frontend. They were refactored out rather than suppressed.

!!! note "Coverage reporting"
    Coverage only reaches SonarQube if the pipeline runs a coverage-instrumented test execution. A plain test run passes without reporting any coverage data, so verify the report actually contains coverage when you touch the pipeline.

## Access-control verification

Authorization is enforced at the service layer, before any domain logic runs. Backend integration tests check each operation against the ReBAC model by stubbing the Keto permission checks for a given user and resource:

- Every operation is verified to return `403` when the caller lacks the required permission.
- Requests are made through the real HTTP layer and Spring Security filter chain with an injected identity, so the checks exercise the production code path.
- Frontend tests confirm that administrative controls are shown or hidden according to the role information returned by the backend.

For the model being tested, see [Architecture › Security › ReBAC](../architecture/security/rebac.md).

## Behavior that supports security

These are specified behaviors of the system. How each one is verified isn't documented individually, so don't assume automated coverage for every item:

- Authentication errors are generic and don't reveal whether an account exists.
- Slug search treats entities the user can't access as if they didn't exist.
- Passwords must be between 15 and 64 characters, and an account is temporarily blocked after three consecutive failed sign-ins.
- Requests to protected resources pass through Oathkeeper for session and permission validation.

## What isn't verified automatically

- **Live authorization.** Integration tests replace Ory with mocks, so the real Keto rules, Oathkeeper policies, and Kratos sessions are only exercised by the E2E suite, which currently covers the administrator role alone.
- **Cross-role boundaries.** Whether project managers, requirement engineers, and stakeholder users can reach only what the ReBAC model allows has been checked manually, not end-to-end. See [Test Strategy](test-strategy.md#current-coverage-and-known-gaps).
- **Hardening of the observability stack**, including Promtail's root privileges, is outside the project's scope.
- **Rate limiting** on authentication endpoints is a stated system attribute; there's no dedicated automated test for it described here.