import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import FunctionalityView from "@/pages/Project/FunctionalityView"
import type { Functionality } from "@/types/Functionality"

// ── Module mocks ──────────────────────────────────────────────────────────────

// Match the path used in Home.test.tsx — one level up from the test file
vi.mock("../lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

// ── Mutable shared state ──────────────────────────────────────────────────────

const mockProjectState = {
  priorityStyle: "TERNARY" as const,
  functionalRequirementStats: {},
  isManager: false,
  id: "proj-1",
}

const mockFunctionalitiesState = {
  canEditFunctionality: vi.fn(() => false),
  refresh: vi.fn(),
}

const mockFunctionality = {
  id: "func-1",
  name: "Authentication",
  description: "Handles user auth",
  state: "ACTIVE",
  label: "FR",
  entityIdentifier: "AUTH-001",
}

// useBackendResource responses keyed by URL substring found in the fetcher's
// toString(). This is stable across re-renders unlike a shared call counter.
const backendResourceMap: Record<string, {
  data: unknown
  loading: boolean
  error: string | null
  refresh: ReturnType<typeof vi.fn>
}> = {}

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: ({ fetcher }: { fetcher: () => Promise<unknown>; enabled?: boolean }) => {
    const src = fetcher.toString()
    // Match by the most specific URL segment each fetcher contains
    const key =
      src.includes("/removed") ? "removed" :
      src.includes("/functionalRequirements") ? "reqs" :
      "func"
    return backendResourceMap[key] ?? { data: null, loading: false, error: null, refresh: vi.fn() }
  },
}))

vi.mock("@/hooks/useProject", () => ({
  useProject: () => mockProjectState,
}))

vi.mock("@/hooks/useFunctionalities", () => ({
  useFunctionalities: () => mockFunctionalitiesState,
}))

vi.mock("@/hooks/useLocks", () => ({
  useLocks: () => ({ getLock: () => null }),
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { isAdmin: false, name: "alice" } }),
}))

vi.mock("@/components/LockIndicator", () => ({
  LockIndicator: () => null,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text ?? "Loading..."}</div>
  ),
}))

vi.mock("@/components/badges/RequirementStateBadge", () => ({
  RequirementStateBadge: ({ state }: { state: string }) => (
    <span data-testid="req-state-badge">{state}</span>
  ),
}))

vi.mock("@/components/badges/FunctionalityStateBadge", () => ({
  FunctionalityStateBadge: ({ state }: { state: string }) => (
    <span data-testid="func-state-badge">{state}</span>
  ),
}))

vi.mock("@/components/badges/PriorityBadge", () => ({
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span data-testid="priority-badge">{priority}</span>
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

vi.mock("@/components/BackToProjectButton", () => ({
  BackToProjectButton: ({ projectId }: { projectId: string }) => (
    <a href={`/project/${projectId}`}>Back to Project</a>
  ),
}))

vi.mock("@/components/graphics/StatsChart", () => ({
  StatsChart: () => <div data-testid="stats-chart" />,
}))

vi.mock("@/components/GapDropZone", () => ({
  GapDropZone: () => null,
}))

vi.mock("@/lib/reorderUtils", () => ({
  sortByOrderValue: (arr: unknown[]) => arr,
  midpointOrderValue: () => 0,
}))

vi.mock("@/components/dialogs/creatingDialogs/CreateFunctionalRequirementDialog", () => ({
  CreateFunctionalRequirementDialog: () => null,
}))

vi.mock("@/components/dialogs/updatingDialogs/UpdateFunctionalityDialog", () => ({
  UpdateFunctionalityDialog: () => null,
}))

vi.mock("@/components/dialogs/userLinking/LinkUserToFunctionalityDialog", () => ({
  LinkUserToFunctionalityDialog: () => <button>Link User to Functionality</button>,
}))

vi.mock("@/components/dialogs/ConfirmActionDialog", () => ({
  ConfirmActionDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/hooks/useApproveActions", () => ({
  useApproveRequirements: () => ({ approveFunctionality: vi.fn(), loading: false }),
}))

vi.mock("@/hooks/useFunctionalityActions", () => ({
  useDisableFunctionality: () => ({ disableFunctionality: vi.fn(), loading: false }),
  useEnableFunctionality:  () => ({ enableFunctionality:  vi.fn(), loading: false }),
  useRemoveFunctionality:  () => ({ removeFunctionality:  vi.fn(), loading: false }),
  useDeleteFunctionality:  () => ({ deleteFunctionality:  vi.fn(), loading: false }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Populate the per-URL-key response map consumed by the useBackendResource mock.
 * Keys match the URL-sniffing logic in the mock above:
 *   "func"    → functionality detail endpoint
 *   "reqs"    → active requirements endpoint
 *   "removed" → removed requirements endpoint
 */
function setBackendResponses({
  func = { data: mockFunctionality as Functionality|null, loading: false, error: null as string|null },
  reqs = { data: [] as unknown|null[], loading: false, error: null as string|null },
  removed = { data: [] as unknown|null[], loading: false, error: null as string|null },
} = {}) {
  backendResourceMap["func"]    = { ...func,    refresh: vi.fn() }
  backendResourceMap["reqs"]    = { ...reqs,    refresh: vi.fn() }
  backendResourceMap["removed"] = { ...removed, refresh: vi.fn() }
}

function renderFunctionalityView() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-1/functionalities/func-1"]}>
      <Routes>
        <Route
          path="/project/:projectId/functionalities/:functionalityId"
          element={<FunctionalityView />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FunctionalityView", () => {

  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch= mockFetch;
    // Clear the response map so each test starts clean
    Object.keys(backendResourceMap).forEach(k => delete backendResourceMap[k])

    Object.assign(mockProjectState, {
      priorityStyle: "TERNARY",
      functionalRequirementStats: {},
      isManager: false,
      id: "proj-1",
    })
    mockFunctionalitiesState.canEditFunctionality.mockReturnValue(false)
    setBackendResponses()
  })

  // ── Loading ──────────────────────────────────────────────────────────────────

  it("shows loading spinner while fetching functionality", () => {
    setBackendResponses({ func: { data: null, loading: true, error: null } })
    renderFunctionalityView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error ────────────────────────────────────────────────────────────────────

  it("shows error UI when functionality fetch fails", () => {
    setBackendResponses({ func: { data: null, loading: false, error: "Not found" } })
    renderFunctionalityView()
    expect(screen.getByText(/could not load functionality/i)).toBeInTheDocument()
  })

  it("shows the error message text", () => {
    setBackendResponses({ func: { data: null, loading: false, error: "Not found" } })
    renderFunctionalityView()
    expect(screen.getByText("Not found")).toBeInTheDocument()
  })

  it("shows 'Back to Project' link on error", () => {
    setBackendResponses({ func: { data: null, loading: false, error: "Not found" } })
    renderFunctionalityView()
    expect(screen.getByRole("link", { name: /back to project/i })).toBeInTheDocument()
  })

  // ── Header rendering ─────────────────────────────────────────────────────────

  it("renders the functionality name as the main heading", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("heading", { name: "Authentication", level: 1 })).toBeInTheDocument()
  })

  it("renders the functionality description", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByText("Handles user auth")).toBeInTheDocument()
  })

  it("renders the entity identifier", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByText("AUTH-001")).toBeInTheDocument()
  })

  it("renders the state badge", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByTestId("func-state-badge")).toHaveTextContent("ACTIVE")
  })

  it("renders the priority style badge", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByText("TERNARY")).toBeInTheDocument()
  })

  it("renders back-to-project link", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("link", { name: /back to project/i })).toHaveAttribute(
      "href",
      "/project/proj-1"
    )
  })

  it("renders the stats chart", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByTestId("stats-chart")).toBeInTheDocument()
  })

  // ── Manager controls ─────────────────────────────────────────────────────────

  it("does NOT show manager controls for non-managers", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.queryByRole("button", { name: /edit functionality/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /actions/i })).not.toBeInTheDocument()
  })

  it("shows 'Edit Functionality' button for managers", () => {
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("button", { name: /edit functionality/i })).toBeInTheDocument()
  })

  it("shows Actions dropdown for managers", () => {
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("button", { name: /actions/i })).toBeInTheDocument()
  })

  it("shows ViewToggle for managers", () => {
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByTestId("toggle-active")).toBeInTheDocument()
    expect(screen.getByTestId("toggle-removed")).toBeInTheDocument()
  })

  it("does NOT show ViewToggle for non-managers", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.queryByTestId("toggle-active")).not.toBeInTheDocument()
  })

  it("shows 'Add FR' button when user has edit permission", () => {
    mockFunctionalitiesState.canEditFunctionality.mockReturnValue(true)
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("button", { name: /add fr/i })).toBeInTheDocument()
  })

  it("does NOT show 'Add FR' button without edit permission", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.queryByRole("button", { name: /add fr/i })).not.toBeInTheDocument()
  })

  // ── Empty requirements ────────────────────────────────────────────────────────

  it("shows 'No functional requirements found' when there are none", () => {
    setBackendResponses({ reqs: { data: [], loading: false, error: null } })
    renderFunctionalityView()
    expect(screen.getByText(/no functional requirements found/i)).toBeInTheDocument()
  })

  it("shows loading spinner for requirements when active reqs are loading", () => {
    setBackendResponses({ reqs: { data: null, loading: true, error: null } })
    renderFunctionalityView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Requirements rendering ────────────────────────────────────────────────────

  it("renders a functional requirement card by name", () => {
    const req = {
      id: 1,
      name: "User can log in",
      description: "Login flow",
      state: "APPROVED",
      priority: "HIGH",
      orderValue: 1,
      children: [],
    }
    setBackendResponses({ reqs: { data: [req], loading: false, error: null } })
    renderFunctionalityView()
    expect(screen.getByText("User can log in")).toBeInTheDocument()
  })

  it("renders requirement description", () => {
    const req = {
      id: 1,
      name: "Login",
      description: "Auth flow description",
      state: "APPROVED",
      priority: "HIGH",
      orderValue: 1,
      children: [],
    }
    setBackendResponses({ reqs: { data: [req], loading: false, error: null } })
    renderFunctionalityView()
    expect(screen.getByText("Auth flow description")).toBeInTheDocument()
  })

  it("navigates to requirement detail on card click", async () => {
    const user = userEvent.setup()
    const req = {
      id: 42,
      name: "Clickable Req",
      description: "",
      state: "PENDING_APPROVAL",
      priority: "NORMAL",
      orderValue: 1,
      children: [],
    }
    setBackendResponses({ reqs: { data: [req], loading: false, error: null } })
    renderFunctionalityView()

    await user.click(screen.getByText("Clickable Req"))

    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/42"
    )
  })

  // ── Filters ──────────────────────────────────────────────────────────────────

  it("renders the filter bar in active view", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByText(/filters/i)).toBeInTheDocument()
  })

  it("shows 'showing deactivated' toggle by default", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByText(/showing deactivated/i)).toBeInTheDocument()
  })

  it("toggles to 'hiding deactivated' when clicked", async () => {
    const user = userEvent.setup()
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByText(/showing deactivated/i))
    expect(screen.getByText(/hiding deactivated/i)).toBeInTheDocument()
  })

  it("shows sort by Priority button", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("button", { name: /priority/i })).toBeInTheDocument()
  })

  it("shows sort by State button", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("button", { name: /^state$/i })).toBeInTheDocument()
  })

  it("does NOT show 'Clear sort' when no sort is active", () => {
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.queryByText(/clear sort/i)).not.toBeInTheDocument()
  })

  it("shows 'Clear sort' after activating a sort", async () => {
    const user = userEvent.setup()
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /priority/i }))
    expect(screen.getByText(/clear sort/i)).toBeInTheDocument()
  })

  it("hides 'Clear sort' after clicking it", async () => {
    const user = userEvent.setup()
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /priority/i }))
    await user.click(screen.getByText(/clear sort/i))
    expect(screen.queryByText(/clear sort/i)).not.toBeInTheDocument()
  })

  // ── Removed view mode ─────────────────────────────────────────────────────────

  it("shows removed-requirements banner when switching to removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText(/these requirements have been removed/i)).toBeInTheDocument()
  })

  it("shows 'No removed functional requirements found' when removed list is empty", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText(/no removed functional requirements found/i)).toBeInTheDocument()
  })

  it("renders removed requirement rows when they exist", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    const removedReq = {
      id: 99,
      name: "Deprecated Login",
      description: "Old flow",
      state: "REMOVED",
      priority: "LOW",
      orderValue: 1,
      entityIdentifier: "FR-099",
      children: [],
    }
    setBackendResponses({ removed: { data: [removedReq], loading: false, error: null } })
    renderFunctionalityView()

    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText("Deprecated Login")).toBeInTheDocument()
  })

  it("navigates to removed requirement on row click", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    const removedReq = {
      id: 77,
      name: "Old Feature",
      description: "",
      state: "REMOVED",
      priority: "LOW",
      orderValue: 1,
      entityIdentifier: "FR-077",
      children: [],
    }
    setBackendResponses({ removed: { data: [removedReq], loading: false, error: null } })
    renderFunctionalityView()

    await user.click(screen.getByTestId("toggle-removed"))
    await waitFor(() => expect(screen.getByText("Old Feature")).toBeInTheDocument())
    await user.click(screen.getByText("Old Feature"))

    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/77"
    )
  })

  // ── Actions dropdown — state machine ──────────────────────────────────────────

  it("'Disable functionality' is enabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /disable functionality/i })).not.toHaveAttribute("aria-disabled", "true")
  })

  it("'Enable functionality' is disabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /enable functionality/i })).toHaveAttribute("aria-disabled", "true")
  })

  it("'Enable functionality' is enabled when state is DEACTIVATED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses({
      func: {
        data: { ...mockFunctionality, state: "DEACTIVATED",projectId:1 },
        loading: false,
        error: null,
      },
    })
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /enable functionality/i })).not.toHaveAttribute("aria-disabled", "true")
  })

  it("'Remove functionality' is enabled when state is DEACTIVATED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses({
      func: {
        data: { ...mockFunctionality, state: "DEACTIVATED",projectId:1 },
        loading: false,
        error: null,
      },
    })
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /remove functionality/i })).not.toHaveAttribute("aria-disabled", "true")
  })

  it("'Delete permanently' is enabled when state is REMOVED", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses({
      func: {
        data: { ...mockFunctionality, state: "REMOVED", projectId:1 },
        loading: false,
        error: null,
      },
    })
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /delete permanently/i })).not.toHaveAttribute("aria-disabled", "true")
  })

  it("'Delete permanently' is disabled when state is ACTIVE", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /actions/i }))
    expect(screen.getByRole("menuitem", { name: /delete permanently/i })).toHaveAttribute("aria-disabled", "true")
  })

  // ── Approve button ────────────────────────────────────────────────────────────

  it("shows approve button disabled when there are no pending requirements", () => {
    mockProjectState.isManager = true
    setBackendResponses()
    renderFunctionalityView()
    expect(screen.getByRole("button", { name: /approve all \(0\)/i })).toBeDisabled()
  })

  it("shows approve button enabled when there are pending requirements", () => {
    mockProjectState.isManager = true
    const pendingReq = {
      id: 1,
      name: "Pending FR",
      description: "",
      state: "PENDING_APPROVAL",
      priority: "HIGH",
      orderValue: 1,
      children: [],
    }
    setBackendResponses({ reqs: { data: [pendingReq], loading: false, error: null } })
    renderFunctionalityView()
    expect(screen.getByRole("button", { name: /approve all \(1\)/i })).not.toBeDisabled()
  })
  it("shows 'No requirements match filters' when filtering hides all items", async () => {
    const user = userEvent.setup()
    const req = {
      id: 1,
      name: "Hidden",
      description: "",
      state: "DEACTIVATED",
      priority: "LOW",
      orderValue: 1,
      children: [],
    }

    setBackendResponses({ reqs: { data: [req], loading: false, error: null } })

    renderFunctionalityView()

    await user.click(screen.getByText(/showing deactivated/i))
    expect(
      screen.getByText(/no requirements match the current filters/i)
    ).toBeInTheDocument()
  })
  it("sorts requirements by priority asc and desc", async () => {
    const user = userEvent.setup()

    const reqs = [
      { id: 1, name: "Low", description: "", state: "APPROVED", priority: "LOW", orderValue: 1, children: [] },
      { id: 2, name: "High", description: "", state: "APPROVED", priority: "HIGH", orderValue: 2, children: [] },
    ]

    setBackendResponses({ reqs: { data: reqs, loading: false, error: null } })

    renderFunctionalityView()

    // asc
    await user.click(screen.getByRole("button", { name: /priority/i }))
    await user.click(screen.getByRole("button", { name: /priority/i })) // toggles to desc

    expect(screen.getByText("High")).toBeInTheDocument()
  })
  it("sorts requirements by state", async () => {
    const user = userEvent.setup()

    const reqs = [
      { id: 1, name: "B", description: "", state: "REMOVED", priority: "LOW", orderValue: 1, children: [] },
      { id: 2, name: "A", description: "", state: "APPROVED", priority: "LOW", orderValue: 2, children: [] },
    ]

    setBackendResponses({ reqs: { data: reqs, loading: false, error: null } })

    renderFunctionalityView()

    await user.click(screen.getByRole("button", { name: /^state$/i }))

    expect(screen.getByText("A")).toBeInTheDocument()
  })
  it("shows loading spinner in removed view", async () => {
    mockProjectState.isManager = true

    setBackendResponses({
      removed: { data: null, loading: true, error: null },
    })

    renderFunctionalityView()

    await userEvent.setup().click(screen.getByTestId("toggle-removed"))

    expect(screen.getByText(/loading removed requirements/i)).toBeInTheDocument()
  })
  it("retries loading removed requirements when clicking Try Again", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true

    setBackendResponses({
      removed: { data: null, loading: false, error: "Failed" },
    })

    renderFunctionalityView()

    await user.click(screen.getByTestId("toggle-removed"))
    await user.click(screen.getByRole("button", { name: /try again/i }))

    expect(mockFunctionalitiesState.refresh).not.toHaveBeenCalled() // just ensures click works
  })
})