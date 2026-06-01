import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import NonFunctionalRequirementsView from "@/pages/Project/nfr/NonFunctionalRequirementsView"

// ── Module mocks ──────────────────────────────────────────────────────────────

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
  nonFunctionalRequirementStats: null as Record<string, number> | null,
  editPermission: false,
  isManager: false,
  id: "proj-1",
}

const mockAuthState = {
  isAuthenticated: true,
  user: { isAdmin: false, name: "alice" },
}

// Two useBackendResource calls per render — keyed by URL substring in fetcher
const backendResourceMap: Record<string, {
  data: unknown
  loading: boolean
  error: string | null
  refresh: ReturnType<typeof vi.fn>
}> = {}

vi.mock("@/hooks/useProject", () => ({
  useProject: () => mockProjectState,
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}))

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: ({ fetcher }: { fetcher: () => Promise<unknown> }) => {
    const src = fetcher.toString()
    const key = src.includes("/removed") ? "removed" : "active"
    return backendResourceMap[key] ?? { data: [], loading: false, error: null, refresh: vi.fn() }
  },
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

vi.mock("@/components/badges/RequirementStateBadge", () => ({
  RequirementStateBadge: ({ state }: { state: string }) => (
    <span data-testid="req-state-badge">{state}</span>
  ),
}))

vi.mock("@/components/graphics/StatsChart", () => ({
  StatsChart: () => <div data-testid="stats-chart" />,
}))

vi.mock("@/components/BackToProjectButton", () => ({
  BackToProjectButton: ({ projectId }: { projectId: string }) => (
    <a href={`/project/${projectId}`}>Back to Project</a>
  ),
}))

vi.mock("@/components/dialogs/creatingDialogs/CreateNonFunctionalRequirementDialog", () => ({
  CreateNonFunctionalRequirementDialog: () => null,
}))

vi.mock("@/hooks/useNFRequirementActions", () => ({
  useApproveNFRequirements: () => ({ approveNFRequirements: vi.fn(), loading: false }),
}))

vi.mock("@/components/ViewToggle", () => ({
  ViewToggle: ({ onChange }: { onChange: (m: string) => void }) => (
    <div>
      <button onClick={() => onChange("active")} data-testid="toggle-active">Active</button>
      <button onClick={() => onChange("removed")} data-testid="toggle-removed">Removed</button>
    </div>
  ),
}))

vi.mock("@/components/GapDropZone", () => ({
  GapDropZone: () => null,
}))

vi.mock("@/lib/reorderUtils", () => ({
  sortByOrderValue: (arr: unknown[]) => arr,
  midpointOrderValue: () => 0,
}))

vi.mock("@/lib/requirementUtils", () => ({
  collectPendingNFRIds: (reqs: { id:number,state: string }[]) =>
    reqs.filter(r => r.state === "PENDING_APPROVAL").map((r) => r.id),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeNFR(overrides: Partial<{
  id: number; name: string; description: string; state: string; entityIdentifier: string
}> = {}) {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? "Test NFR",
    description: overrides.description ?? "A description",
    state: overrides.state ?? "ACTIVE",
    entityIdentifier: overrides.entityIdentifier ?? "NFR-001",
    orderValue: 1,
    children: [],
  }
}

function setResponses({
  active = { data: [] as unknown|null[], loading: false, error: null as string|null },
  removed = { data: [] as unknown|null[], loading: false, error: null as string|null },
} = {}) {
  backendResourceMap["active"]  = { ...active,  refresh: vi.fn() }
  backendResourceMap["removed"] = { ...removed, refresh: vi.fn() }
}

function renderView() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-1/nfr"]}>
      <Routes>
        <Route path="/project/:projectId/nfr" element={<NonFunctionalRequirementsView />} />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("NonFunctionalRequirementsView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(backendResourceMap).forEach(k => delete backendResourceMap[k])
    Object.assign(mockProjectState, {
      nonFunctionalRequirementStats: null,
      editPermission: false,
      isManager: false,
      id: "proj-1",
    })
    Object.assign(mockAuthState, { isAuthenticated: true })
    setResponses()
  })

  // ── Loading ──────────────────────────────────────────────────────────────────

  it("shows loading spinner while active requirements are loading", () => {
    setResponses({ active: { data: null, loading: true, error: null } })
    renderView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  it("shows 'Removed' loading text when loading in removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setResponses({
      active: { data: [], loading: false, error: null },
      removed: { data: null, loading: true, error: null },
    })
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error ────────────────────────────────────────────────────────────────────

  it("shows error UI when active fetch fails", () => {
    setResponses({ active: { data: null, loading: false, error: "Failed to fetch requirements" } })
    renderView()
    expect(screen.getByText(/failed to fetch requirements/i)).toBeInTheDocument()
  })

  it("shows Try Again button on error", () => {
    setResponses({ active: { data: null, loading: false, error: "Network error" } })
    renderView()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
  })

  // ── Header ───────────────────────────────────────────────────────────────────

  it("renders the page heading", () => {
    renderView()
    expect(screen.getByRole("heading", { name: /non-functional requirements/i })).toBeInTheDocument()
  })

  it("renders back-to-project link", () => {
    renderView()
    expect(screen.getByRole("link", { name: /back to project/i }))
      .toHaveAttribute("href", "/project/proj-1")
  })

  it("shows stats chart when nonFunctionalRequirementStats is provided", () => {
    mockProjectState.nonFunctionalRequirementStats = { ACTIVE: 2 }
    renderView()
    expect(screen.getByTestId("stats-chart")).toBeInTheDocument()
  })

  it("does NOT show stats chart when nonFunctionalRequirementStats is null", () => {
    renderView()
    expect(screen.queryByTestId("stats-chart")).not.toBeInTheDocument()
  })

  // ── Deactivated toggle ────────────────────────────────────────────────────────

  it("shows 'Hiding deactivated' toggle by default in active mode", () => {
    renderView()
    expect(screen.getByText(/hiding deactivated/i)).toBeInTheDocument()
  })

  it("toggles to 'Showing deactivated' when clicked", async () => {
    const user = userEvent.setup()
    renderView()
    await user.click(screen.getByText(/hiding deactivated/i))
    expect(screen.getByText(/showing deactivated/i)).toBeInTheDocument()
  })

  it("hides DEACTIVATED requirements by default", () => {
    setResponses({
      active: {
        data: [
          makeNFR({ id: 1, name: "Active NFR",      state: "ACTIVE" }),
          makeNFR({ id: 2, name: "Deactivated NFR", state: "DEACTIVATED" }),
        ],
        loading: false,
        error: null,
      },
    })
    renderView()
    expect(screen.getByText("Active NFR")).toBeInTheDocument()
    expect(screen.queryByText("Deactivated NFR")).not.toBeInTheDocument()
  })

  it("shows DEACTIVATED requirements after toggling", async () => {
    const user = userEvent.setup()
    setResponses({
      active: {
        data: [
          makeNFR({ id: 1, name: "Active NFR",      state: "ACTIVE" }),
          makeNFR({ id: 2, name: "Deactivated NFR", state: "DEACTIVATED" }),
        ],
        loading: false,
        error: null,
      },
    })
    renderView()
    await user.click(screen.getByText(/hiding deactivated/i))
    expect(screen.getByText("Deactivated NFR")).toBeInTheDocument()
  })

  it("hides deactivated toggle in removed view mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.queryByText(/hiding deactivated/i)).not.toBeInTheDocument()
  })

  // ── Add NFR button ─────────────────────────────────────────────────────────

  it("does NOT show 'Add NFR' button without editPermission", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /add nfr/i })).not.toBeInTheDocument()
  })

  it("shows 'Add NFR' button with editPermission in active mode", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /add nfr/i })).toBeInTheDocument()
  })

  it("hides 'Add NFR' button when in removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    mockProjectState.isManager = true
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.queryByRole("button", { name: /add nfr/i })).not.toBeInTheDocument()
  })

  // ── Approve All button ────────────────────────────────────────────────────────

  it("does NOT show 'Approve All' button without isManager", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /approve all/i })).not.toBeInTheDocument()
  })

  it("shows 'Approve All' button for managers in active mode", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /approve all/i })).toBeInTheDocument()
  })

  it("'Approve All' is disabled when no requirements are pending", () => {
    mockProjectState.isManager = true
    setResponses({
      active: { data: [makeNFR({ state: "ACTIVE" })], loading: false, error: null },
    })
    renderView()
    expect(screen.getByRole("button", { name: /approve all/i })).toBeDisabled()
  })

  it("'Approve All' is enabled when there are pending requirements", () => {
    mockProjectState.isManager = true
    setResponses({
      active: { data: [makeNFR({ state: "PENDING_APPROVAL" })], loading: false, error: null },
    })
    renderView()
    expect(screen.getByRole("button", { name: /approve all/i })).not.toBeDisabled()
  })

  it("hides 'Approve All' in removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.queryByRole("button", { name: /approve all/i })).not.toBeInTheDocument()
  })

  // ── ViewToggle ────────────────────────────────────────────────────────────────

  it("does NOT show ViewToggle for non-managers", () => {
    renderView()
    expect(screen.queryByTestId("toggle-active")).not.toBeInTheDocument()
  })

  it("shows ViewToggle for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByTestId("toggle-active")).toBeInTheDocument()
    expect(screen.getByTestId("toggle-removed")).toBeInTheDocument()
  })

  // ── Empty state ───────────────────────────────────────────────────────────────

  it("shows empty state text when there are no requirements", () => {
    setResponses({ active: { data: [], loading: false, error: null } })
    renderView()
    expect(screen.getByText(/no non-functional requirements found/i)).toBeInTheDocument()
  })

  // ── Requirements rendering ────────────────────────────────────────────────────

  it("renders an NFR card name", () => {
    setResponses({
      active: { data: [makeNFR({ name: "Availability" })], loading: false, error: null },
    })
    renderView()
    expect(screen.getByText("Availability")).toBeInTheDocument()
  })

  it("renders an NFR card description", () => {
    setResponses({
      active: { data: [makeNFR({ description: "System uptime must be ≥ 99.9%" })], loading: false, error: null },
    })
    renderView()
    expect(screen.getByText("System uptime must be ≥ 99.9%")).toBeInTheDocument()
  })

  it("navigates to NFR detail on card click", async () => {
    const user = userEvent.setup()
    setResponses({
      active: { data: [makeNFR({ id: 42, name: "Response Time" })], loading: false, error: null },
    })
    renderView()
    await user.click(screen.getByText("Response Time"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/nfr/42")
  })

  // ── Removed view mode ─────────────────────────────────────────────────────────

  it("shows removed-requirements banner when switching to removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText(/these requirements have been removed/i)).toBeInTheDocument()
  })

  it("shows empty state for removed when list is empty", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText(/no removed non-functional requirements found/i)).toBeInTheDocument()
  })

  it("renders removed requirement rows", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setResponses({
      active: { data: [], loading: false, error: null },
      removed: {
        data: [makeNFR({ id: 99, name: "Removed Perf NFR", state: "REMOVED" })],
        loading: false,
        error: null,
      },
    })
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText("Removed Perf NFR")).toBeInTheDocument()
  })

  it("navigates to removed NFR detail on row click", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setResponses({
      active: { data: [], loading: false, error: null },
      removed: {
        data: [makeNFR({ id: 77, name: "Old Security NFR", state: "REMOVED" })],
        loading: false,
        error: null,
      },
    })
    renderView()
    await user.click(screen.getByTestId("toggle-removed"))
    await user.click(screen.getByText("Old Security NFR"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/nfr/77")
  })
})