# Functional Testing

## Backend

### Unit tests

Backend unit tests use **JUnit 5** with **Mockito**, across the domain model, the service layer, and the infrastructure clients. They run without loading the Spring context or touching repositories, databases, or other infrastructure: the unit under test is instantiated directly, and collaborators are mocked only where needed to isolate the behavior being verified. Domain entities are generally tested without mocks, since they're self-contained.

Domain tests focus on business rules, state-transition constraints, identity semantics, observer notifications, validation, and edge cases such as null values or invalid state changes. Tests on components with external dependencies verify that rules and authorization are enforced, lifecycle transitions happen as expected, exceptions are propagated or translated correctly, and dependencies are called with the right parameters.

### Integration tests

Integration tests verify that the HTTP layer, service layer, repository layer, and database interact correctly with the full Spring Boot context active.

They share an abstract base class, `IrBoardBaseTest`, annotated with `@SpringBootTest(webEnvironment = RANDOM_PORT)` and `@ActiveProfiles("test")`. It provides:

- **A real PostgreSQL** via Testcontainers, with connection properties injected through `@DynamicPropertySource`, so every run is isolated.
- **Mocked Ory and storage components.** `KetoClient`, `MinioClient`, and `MinioObjectStorageClient` are `@MockitoBean` instances. A test security configuration injects pre-authenticated contexts through the `X-User` header, so no live Kratos session is needed.
- **Permission helpers.** A family of `allowX` methods (such as `allowEdit`, `allowEditProject`, and `allowViewRequirementsOfFunctionality`) stub specific Keto checks for a user and resource.
- **HTTP helpers.** A `RestClient` bound to the random port exposes typed `get`, `post`, `patch`, `delete`, and multipart helpers that add the `X-User` header automatically.
- **Entity builders and reload helpers.** `buildProject`, `buildFunctionality`, `buildStakeholder`, `buildFr`, `buildNfr`, and `buildDocument` produce persistable objects with sensible defaults. `reload` helpers re-fetch entities to assert on what was actually persisted.

Each suite's `@BeforeEach` delegates to `testSetup`, which clears all repositories in dependency order, seeds the fixed set of user identities, and creates a baseline active project. Each concrete class then implements a `setUp` hook to seed only its own fixtures, following the template method pattern.

The suites cover:

- **API contracts.** Expected structure and status for success and error cases: `400` for malformed input, `403` for insufficient permissions, `404` for missing entities, `409` for constraint violations such as duplicate functionality labels.
- **Requirement lifecycle transitions.** The full state machine, including rejection of transitions from invalid predecessor states.
- **Traceability.** Linking and unlinking requirements to stakeholders, documents, and peers updates the join tables and propagates pending-review flags.
- **Concurrency control.** The first user acquires a lock, a second user is rejected, and release on save or timeout makes the entity editable again.
- **Document management.** Upload, association, state transitions, and permanent deletion across controller, service, storage adapter, and database.
- **Access control boundaries.** Each operation returns `403` when the caller lacks the required Keto permission, before any domain logic runs.

## Frontend

Frontend tests use **Vitest** and **React Testing Library**. Because React components are compositional, the line between unit and integration tests is one of scope: a test rendering a single component is a unit test, while one rendering a larger slice of the tree is an integration test, even though the tooling is identical.

Each test renders the component in a controlled environment:

- Routing is simulated with React Router's `MemoryRouter`.
- API calls are intercepted by stubbing the global `fetch` with `vi.stubGlobal`, returning controlled response sequences without a running backend.
- Browser globals and modules are replaced with `vi.fn`, `vi.stubGlobal`, and `vi.mock`.
- `beforeEach(() => vi.restoreAllMocks())` prevents mock state leaking between tests.

A representative example checks that a button triggers navigation:

```ts
it("calls window.location.replace when Return Home is clicked", () => {
  const replaceMock = vi.fn()
  vi.stubGlobal("window", {
    ...window,
    location: { ...window.location, replace: replaceMock },
  })
  renderError()
  const button = screen.getByRole("button", { name: /return home/i })
  button.click()
  expect(replaceMock).toHaveBeenCalledWith("/home")
})
```

Integration-level frontend tests cover shared state through React Context, rendering driven by sequences of API responses (success, validation errors, unauthorized, network failure), navigation across components, and access-control-driven differences. For example, tests assert that administrative actions such as user invitation or project deactivation are shown or hidden according to the role information in the mocked session response.

## End-to-end tests

End-to-end tests use **Playwright** against a full Docker Compose deployment, exercising the browser, Traefik, Oathkeeper, Kratos, Keto, the backend, and the database exactly as a user would. Each scenario runs against a clean stack with the initial administrator seeded by the same `initial-setup-admin` service used in regular deployments, so the infrastructure configuration (routing, CORS, Keto rules, Kratos sessions) is exercised too.

Generated entity names get timestamps appended, which allows parallel runs and isolates consecutive executions without a full database reset.

### Authentication suite

| Scenario | Description |
|---|---|
| Successful login | The administrator signs in with valid credentials and is redirected to a correctly rendered home page. |
| Login page redirect when already authenticated | A user with a valid session who opens the login page is sent to the home page without re-authenticating. |
| Logout removes session | After logging out through the NavBar, the home view is no longer accessible and the login form returns. |
| Invalid credentials | Incorrect credentials are rejected, the user stays on the login page, and an error is shown. |

### Requirements engineering lifecycle suite

Each scenario follows a create–operate–delete cycle for its entity.

| Scenario | Description |
|---|---|
| Project creation and deletion | Create a project, verify it appears on the home view, then disable it, move it to the removed archive, and permanently delete it. |
| Stakeholder management | Create a project and a stakeholder, navigate to it, then take it through its full removal lifecycle. |
| Non-functional requirement management | Create an NFR with unit, operator, threshold, target, and actual values, then take it through removal. |
| Document management | Upload a plain-text file, verify it in the list, then take it through removal. |
| Functionality management | Add a functionality with a custom label and confirm its view is reachable from the dashboard. |
| Functional requirement management | Create a functionality and a requirement with name, description, priority, and stability, then take it through removal. |

Scenarios that create a project clean it up afterward.

### Not yet automated

Multi-user access control, concurrency control, and slug-based search have no E2E coverage. They have been verified manually, so this is a gap in regression safety rather than unverified functionality. See [Test Strategy](test-strategy.md#current-coverage-and-known-gaps).