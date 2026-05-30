import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import ProjectView from "@/pages/Project/ProjectView"

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("../lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

// ── Mutable project state (mutated per test in beforeEach) ────────────────────

const mockProjectState = {
  id: "proj-1",
  name: "IR-Board",
  description: "Requirements management",
  priorityStyle: "TERNARY" as const,
  state: "ACTIVE",
  isManager: false,
  editPermission: false,
  refresh: vi.fn(),
}

const mockAuthState = {
  user: { isAdmin: false, name: "alice" },
  isAuthenticated: true,
}

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}))

vi.mock("@/hooks/useProject", () => ({
  useProject: () => mockProjectState,
}))

const mockFunctionalities = {
  functionalities: { edit: [], view: [], none: [] },
  loading: false,
  error: null as string | null,
  refresh: vi.fn(),
}

vi.mock("@/hooks/useFunctionalities", () => ({
  useFunctionalities: () => mockFunctionalities,
}))

vi.mock("@/hooks/useLocks", () => ({
  useLocks: () => ({ getLock: () => null }),
}))

vi.mock("@/components/LockIndicator", () => ({
  LockIndicator: () => null,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text ?? "Loading..."}</div>
  ),
}))

vi.mock("@/components/badges/ProjectStateBadge", () => ({
  ProjectStateBadge: ({ state }: { state: string }) => (
    <span data-testid="project-state-badge">{state}</span>
  ),
}))

vi.mock("@/components/badges/FunctionalityStateBadge", () => ({
  FunctionalityStateBadge: ({ state }: { state: string }) => (
    <span data-testid="functionality-state-badge">{state}</span>
  ),
}))

vi.mock("@/components/ViewToggle", () => ({
  ViewToggle: ({ onChange }: { onChange: (m: string) => void }) => (
    <div>
      <button onClick={() => onChange("active")} data-testid="toggle-active">Active</button>
      <button onClick={() => onChange("removed")} data-testid="toggle-removed">Removed</button>
    </div>
  ),
}))

vi.mock("@/components/graphics/ProjectStatsSectionGraph", () => ({
  ProjectStatsSection: () => <div data-testid="stats-section" />,
}))

vi.mock("@/components/graphics/ProjectHealthBar", () => ({
  ProjectHealthBar: () => <div data-testid="health-bar" />,
}))

vi.mock("@/components/dialogs/creatingDialogs/CreateFunctionalityDialog", () => ({
  CreateFunctionalityDialog: () => <button>Create Functionality</button>,
}))

vi.mock("@/components/dialogs/userLinking/LinkUserToProjectDialog", () => ({
  LinkUserToProjectDialog: () => <button>Link User</button>,
}))

vi.mock("@/components/dialogs/ConfirmActionDialog", () => ({
  ConfirmActionDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/hooks/useApproveActions", () => ({
  useApproveAll: () => ({ approveAll: vi.fn(), loading: false }),
}))

vi.mock("@/hooks/useProjectActions", () => ({
  useFinishProject:  () => ({ finishProject:  vi.fn(), loading: false }),
  useDisableProject: () => ({ disableProject: vi.fn(), loading: false }),
  useEnableProject:  () => ({ enableProject:  vi.fn(), loading: false }),
  useRemoveProject:  () => ({ removeProject:  vi.fn(), loading: false }),
  useDeleteProject:  () => ({ deleteProject:  vi.fn(), loading: false }),
}))

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: () => ({ data: [], loading: false, error: null, refresh: vi.fn() }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderProjectView() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-1"]}>
      <Routes>
        <Route path="/project/:projectId" element={<ProjectView />} />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProjectView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mutable state to safe defaults
    Object.assign(mockProjectState, {
      id: "proj-1",
      name: "IR-Board",
      description: "Requirements management",
      priorityStyle: "TERNARY",
      state: "ACTIVE",
      isManager: false,
      editPermission: false,
      refresh: vi.fn(),
    })
    Object.assign(mockAuthState, {
      user: { isAdmin: false, name: "alice" },
      isAuthenticated: true,
    })
    Object.assign(mockFunctionalities, {
      functionalities: { edit: [], view: [], none: [] },
      loading: false,
      error: null,
      refresh: vi.fn(),
    })
  })

  // ── Basic rendering ──────────────────────────────────────────────────────────

  it("renders the project name as the main heading", () => {
    renderProjectView()
    expect(screen.getByRole("heading", { name: "IR-Board", level: 1 })).toBeInTheDocument()
  })

  it("renders the project description", () => {
    renderProjectView()
    expect(screen.getByText("Requirements management")).toBeInTheDocument()
  })

  it("shows fallback description when project has none", () => {
    mockProjectState.description = ""
    renderProjectView()
    expect(screen.getByText(/no project description available/i)).toBeInTheDocument()
  })

  it("renders the priority style badge", () => {
    renderProjectView()
    expect(screen.getByText("TERNARY")).toBeInTheDocument()
  })

  it("renders the project state badge", () => {
    renderProjectView()
    expect(screen.getByTestId("project-state-badge")).toHaveTextContent("ACTIVE")
  })

  it("renders the project REF id", () => {
    renderProjectView()
    expect(screen.getByText(/REF: proj-1/)).toBeInTheDocument()
  })

  it("renders back to projects link", () => {
    renderProjectView()
    expect(screen.getByRole("link", { name: /back to projects/i })).toBeInTheDocument()
  })

  it("renders the project stats section", () => {
    renderProjectView()
    expect(screen.getByTestId("stats-section")).toBeInTheDocument()
  })

  it("renders the health bar", () => {
    renderProjectView()
    expect(screen.getByTestId("health-bar")).toBeInTheDocument()
  })

  // ── Navigation section cards ─────────────────────────────────────────────────

  it("renders Stakeholders section link", () => {
    renderProjectView()
    expect(screen.getByRole("link", { name: /stakeholders/i })).toBeInTheDocument()
  })

  it("renders Non-Functional Requirements section link", () => {
    renderProjectView()
    expect(screen.getByRole("link", { name: /non-functional requirements/i })).toBeInTheDocument()
  })

  it("renders Documents section link", () => {
    renderProjectView()
    expect(screen.getByRole("link", { name: /documents/i })).toBeInTheDocument()
  })

  it("stakeholders link points to the correct route", () => {
    renderProjectView()
    expect(screen.getByRole("link", { name: /stakeholders/i }))
      .toHaveAttribute("href", "/project/proj-1/stakeholders")
  })

  it("NFR link points to the correct route", () => {
    renderProjectView()
    expect(screen.getByRole("link", { name: /non-functional requirements/i }))
      .toHaveAttribute("href", "/project/proj-1/nfr")
  })

  it("documents link points to the correct route", () => {
    renderProjectView()
    expect(screen.getByRole("link", { name: /documents/i }))
      .toHaveAttribute("href", "/project/proj-1/documents")
  })

  // ── Admin controls ───────────────────────────────────────────────────────────

  it("does NOT show 'Edit project' button for non-admin users", () => {
    renderProjectView()
    expect(screen.queryByText(/edit project/i)).not.toBeInTheDocument()
  })

  it("shows 'Edit project' button for admin users", () => {
    mockAuthState.user = { isAdmin: true, name: "alice" }
    renderProjectView()
    expect(screen.getByText(/edit project/i)).toBeInTheDocument()
  })

  it("shows 'Link User' button for admin users", () => {
    mockAuthState.user = { isAdmin: true, name: "alice" }
    renderProjectView()
    expect(screen.getByRole("button", { name: /link user/i })).toBeInTheDocument()
  })

  it("does NOT show 'Link User' button for non-admin users", () => {
    renderProjectView()
    expect(screen.queryByRole("button", { name: /link user/i })).not.toBeInTheDocument()
  })

  // ── Manager controls ─────────────────────────────────────────────────────────

  it("does NOT show Actions dropdown for non-manager users", () => {
    renderProjectView()
    expect(screen.queryByRole("button", { name: /actions/i })).not.toBeInTheDocument()
  })

  it("shows Actions dropdown for manager users", () => {
    mockProjectState.isManager = true
    renderProjectView()
    expect(screen.getByRole("button", { name: /actions/i })).toBeInTheDocument()
  })

  it("shows ViewToggle for manager users", () => {
    mockProjectState.isManager = true
    renderProjectView()
    expect(screen.getByTestId("toggle-active")).toBeInTheDocument()
    expect(screen.getByTestId("toggle-removed")).toBeInTheDocument()
  })

  it("does NOT show ViewToggle for non-manager users", () => {
    renderProjectView()
    expect(screen.queryByTestId("toggle-active")).not.toBeInTheDocument()
  })

  it("shows Create Functionality button when user has edit permission", () => {
    mockProjectState.editPermission = true
    renderProjectView()
    expect(screen.getByRole("button", { name: /create functionality/i })).toBeInTheDocument()
  })

  it("does NOT show Create Functionality button without edit permission", () => {
    renderProjectView()
    expect(screen.queryByRole("button", { name: /create functionality/i })).not.toBeInTheDocument()
  })

  // ── Empty functionalities ────────────────────────────────────────────────────

  it("shows 'No functionalities yet' when there are none", () => {
    renderProjectView()
    expect(screen.getByText(/no functionalities yet/i)).toBeInTheDocument()
  })

  it("shows loading spinner when functionalities are loading", () => {
    mockFunctionalities.loading = true
    renderProjectView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  it("shows error UI when functionalities fetch returns an error", () => {
    mockFunctionalities.error = "Failed to load"
    renderProjectView()
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })

  // ── Functionalities list ─────────────────────────────────────────────────────

  it("renders functionality cards for edit-permission functionalities", () => {
    mockFunctionalities.functionalities = {
      edit: [{ id: "1", name: "Auth Module", description: "", state: "ACTIVE" }] as any,
      view: [],
      none: [],
    }
    renderProjectView()
    expect(screen.getByText("Auth Module")).toBeInTheDocument()
  })

  it("renders functionality cards for view-permission functionalities", () => {
    mockFunctionalities.functionalities = {
      edit: [],
      view: [{ id: "2", name: "Reporting Module", description: "", state: "ACTIVE" }] as any,
      none: [],
    }
    renderProjectView()
    expect(screen.getByText("Reporting Module")).toBeInTheDocument()
  })

  it("renders permission summary counts when functionalities exist", () => {
    mockFunctionalities.functionalities = {
      edit: [{ id: "1", name: "A", description: "", state: "ACTIVE" }] as any,
      view: [{ id: "2", name: "B", description: "", state: "ACTIVE" }] as any,
      none: [],
    }
    renderProjectView()
    // "1 accessible · 0 restricted" summary line
    expect(screen.getByText(/accessible/i)).toBeInTheDocument()
  })

  it("functionality card links to the correct route", () => {
    mockFunctionalities.functionalities = {
      edit: [{ id: "func-99", name: "My Func", description: "", state: "ACTIVE" }] as any,
      view: [],
      none: [],
    }
    renderProjectView()
    expect(screen.getByRole("link", { name: /my func/i }))
      .toHaveAttribute("href", "/project/proj-1/functionalities/func-99")
  })

  // ── Removed view mode ────────────────────────────────────────────────────────

  it("shows removed-functionalities banner when switching to removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderProjectView()

    await user.click(screen.getByTestId("toggle-removed"))

    expect(screen.getByText(/these functionalities have been removed/i)).toBeInTheDocument()
  })

  it("shows 'No removed functionalities' row when removed list is empty", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderProjectView()

    await user.click(screen.getByTestId("toggle-removed"))

    expect(screen.getByText(/no removed functionalities found/i)).toBeInTheDocument()
  })

  // ── Actions dropdown — state machine ─────────────────────────────────────────

  it("'Approve all entities' is enabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "ACTIVE"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /approve all entities/i })).not.toBeDisabled()
  })

  it("'Approve all entities' is disabled when state is FINISHED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "FINISHED"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /approve all entities/i })).toBeDisabled()
  })

  it("'Mark as finished' is enabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "ACTIVE"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /mark as finished/i })).not.toBeDisabled()
  })

  it("'Disable project' is enabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "ACTIVE"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /disable project/i })).not.toBeDisabled()
  })

  it("'Enable project' is disabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "ACTIVE"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /enable project/i })).toBeDisabled()
  })

  it("'Enable project' is enabled when state is DEACTIVATED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "DEACTIVATED"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /enable project/i })).not.toBeDisabled()
  })

  it("'Enable project' is enabled when state is FINISHED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "FINISHED"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /enable project/i })).not.toBeDisabled()
  })

  it("'Remove project' is disabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "ACTIVE"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /remove project/i })).toBeDisabled()
  })

  it("'Remove project' is enabled when state is DEACTIVATED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "DEACTIVATED"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /remove project/i })).not.toBeDisabled()
  })

  it("'Delete permanently' is disabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "ACTIVE"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /delete permanently/i })).toBeDisabled()
  })

  it("'Delete permanently' is enabled when state is REMOVED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.state = "REMOVED"
    renderProjectView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /delete permanently/i })).not.toBeDisabled()
  })
})
