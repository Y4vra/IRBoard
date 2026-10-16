# Frontend Development

This page covers the conventions to follow when adding or modifying frontend code. For how the codebase is organized and why, see [Architecture › Frontend](../architecture/frontend.md).

## Adding a page

New pages go under `pages`, one top-level component per route, and need to be wired into the navigability structure: register the route, and update the relevant route guards (`ProtectedRoute`, `ProjectLockWrapper`, `FunctionalitiesProviderWrapper`) where the new page needs authentication or project-scoped state. Use the existing guards rather than re-implementing access checks inside the page.

A page is responsible for orchestrating data-fetching, permission checks, and layout for its view; reusable pieces belong in `components`, and stateful fetch logic belongs in `hooks`.

## Permissions: defer to the backend

The frontend never evaluates permissions itself. The backend surfaces the information the UI needs through specific DTO fields, and components should treat those as the source of truth for conditional rendering:

| Field | Where | Use it to gate |
|---|---|---|
| `isAdmin` | User DTO | System-wide administrative views and actions (user invitation, project creation). |
| `editPermission` | Project DTO | Project-level mutating actions: editing metadata, deactivating the project, linking users, bulk approval. |
| `FunctionalitiesResponse` | Returned when fetching a project's functionalities | Functionality-level access, bucketed by permission level. |

```ts
export type Permission = "edit" | "view" | "none";
export type FunctionalitiesResponse = Record<Permission, Functionality[]>;
```

Rather than a single permission value attached to each functionality, the full list is bucketed by what the current user can do with each one: `edit` means requirement-engineer access or higher, `view` means stakeholder-level access, and `none` means the functionality exists but the user has no relationship to it. Read from the correct bucket — don't assume a flat array.

**Don't infer permissions client-side** from role names or other heuristics. These fields reflect the live ReBAC evaluation performed by the backend at request time; anything you derive yourself can drift out of sync with it.

## Partial DTOs

Several DTOs are deliberately partial depending on the calling endpoint. The clearest case is the requirement DTO: list endpoints (e.g. a functionality's requirement list) may omit `children` entirely or return it empty, while detail endpoints populate it.

- Don't assume a field is present just because the TypeScript type declares it. Check what the specific endpoint actually returns.
- Avoid generic rendering logic that silently breaks when an omitted field is `undefined` rather than legitimately empty.
- When adding new endpoints, be explicit — in naming or documentation — about which fields are populated, so this pattern doesn't turn into a source of confusion as DTOs evolve.

## Testing

Frontend tests use **Vitest** and **React Testing Library**, with API calls intercepted by stubbing the global `fetch` via `vi.stubGlobal`, and routing simulated with React Router's `MemoryRouter`. The distinction between unit and integration tests at this layer is a matter of scope rather than a strict boundary: a test rendering a single component is a unit test; one rendering a larger slice of the tree and checking coordination between components, shared context, and sequences of API responses is an integration test.

See [Testing › Functional Testing](../testing/functional-testing.md) for details and examples, and [Contributing](contributing.md) for what a change needs to pass before merging.