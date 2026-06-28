import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import StakeholdersView from "@/pages/Project/stakeholder/StakeholdersView"

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
  stakeholderStats: null as Record<string, number> | null,
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

vi.mock("@/components/badges/EntityStateBadge", () => ({
  EntityStateBadge: ({ state }: { state: string }) => (
    <span data-testid="entity-state-badge">{state}</span>
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

vi.mock("@/components/dialogs/creatingDialogs/CreateStakeholderDialog", () => ({
  CreateStakeholderDialog: () => <button>Create Stakeholder</button>,
}))

vi.mock("@/hooks/useStakeholderActions", () => ({
  useApproveStakeholders: () => ({ approveStakeholders: vi.fn(), loading: false }),
}))

vi.mock("@/components/ViewToggle", () => ({
  ViewToggle: ({ onChange }: { onChange: (m: string) => void }) => (
    <div>
      <button onClick={() => onChange("active")} data-testid="toggle-active">Active</button>
      <button onClick={() => onChange("removed")} data-testid="toggle-removed">Removed</button>
    </div>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeStakeholder(overrides: Partial<{
  id: number; name: string; description: string; state: string
}> = {}) {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? "Test Stakeholder",
    description: overrides.description ?? "A description",
    state: overrides.state ?? "ACTIVE",
    entityIdentifier: "STK-001",
    observers: [],
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
    <MemoryRouter initialEntries={["/project/proj-1/stakeholders"]}>
      <Routes>
        <Route path="/project/:projectId/stakeholders" element={<StakeholdersView />} />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StakeholdersView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(backendResourceMap).forEach(k => delete backendResourceMap[k])
    Object.assign(mockProjectState, {
      stakeholderStats: null,
      editPermission: false,
      isManager: false,
      id: "proj-1",
    })
    Object.assign(mockAuthState, { isAuthenticated: true, user: { isAdmin: false, name: "alice" } })
    setResponses()
  })

  // ── Loading ──────────────────────────────────────────────────────────────────

  it("shows loading spinner while active stakeholders are loading", () => {
    setResponses({ active: { data: null, loading: true, error: null } })
    renderView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error ────────────────────────────────────────────────────────────────────

  it("shows error UI when active fetch fails", () => {
    setResponses({ active: { data: null, loading: false, error: "Failed to fetch stakeholders" } })
    renderView()
    expect(screen.getByText(/failed to fetch stakeholders/i)).toBeInTheDocument()
  })

  it("shows Try Again button on error", () => {
    setResponses({ active: { data: null, loading: false, error: "Network error" } })
    renderView()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
  })

  // ── Header ───────────────────────────────────────────────────────────────────

  it("renders the page heading", () => {
    renderView()
    expect(screen.getByRole("heading", { name: /^stakeholders$/i })).toBeInTheDocument()
  })

  it("renders back-to-project link", () => {
    renderView()
    expect(screen.getByRole("link", { name: /back to project/i }))
      .toHaveAttribute("href", "/project/proj-1")
  })

  it("shows stats chart when stakeholderStats is provided", () => {
    mockProjectState.stakeholderStats = { ACTIVE: 2, PENDING_APPROVAL: 1 }
    renderView()
    expect(screen.getByTestId("stats-chart")).toBeInTheDocument()
  })

  it("does NOT show stats chart when stakeholderStats is null", () => {
    mockProjectState.stakeholderStats = null
    renderView()
    expect(screen.queryByTestId("stats-chart")).not.toBeInTheDocument()
  })

  // ── Deactivated toggle ────────────────────────────────────────────────────────

  it("shows 'Hiding deactivated' toggle by default", () => {
    renderView()
    expect(screen.getByText(/showing deactivated/i)).toBeInTheDocument()
  })

  it("toggles to 'Showing deactivated' when clicked", async () => {
    const user = userEvent.setup()
    renderView()
    await user.click(screen.getByText(/showing deactivated/i))
    expect(screen.getByText(/hiding deactivated/i)).toBeInTheDocument()
  })

  it("does not hide DEACTIVATED stakeholders by default", () => {
    setResponses({
      active: {
        data: [
          makeStakeholder({ id: 1, name: "Active One", state: "ACTIVE" }),
          makeStakeholder({ id: 2, name: "Disabled One", state: "DEACTIVATED" }),
        ],
        loading: false,
        error: null,
      },
    })
    renderView()
    expect(screen.getByText("Active One")).toBeInTheDocument()
    expect(screen.getByText("Disabled One")).toBeInTheDocument()
  })

  it("hides DEACTIVATED stakeholders after toggling", async () => {
    const user = userEvent.setup()
    setResponses({
      active: {
        data: [
          makeStakeholder({ id: 1, name: "Active One", state: "ACTIVE" }),
          makeStakeholder({ id: 2, name: "Disabled One", state: "DEACTIVATED" }),
        ],
        loading: false,
        error: null,
      },
    })
    renderView()
    await user.click(screen.getByText(/showing deactivated/i))
    expect(screen.queryByText("Disabled One")).not.toBeInTheDocument()
  })

  // ── Create stakeholder ────────────────────────────────────────────────────────

  it("does NOT show 'Create Stakeholder' button without editPermission", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /create stakeholder/i })).not.toBeInTheDocument()
  })

  it("shows 'Create Stakeholder' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /create stakeholder/i })).toBeInTheDocument()
  })

  // ── Approve all ───────────────────────────────────────────────────────────────

  it("does NOT show 'Approve All' button without isManager", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /approve all/i })).not.toBeInTheDocument()
  })

  it("shows 'Approve All' button for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /approve all/i })).toBeInTheDocument()
  })

  it("'Approve All' is disabled when no stakeholders are pending", () => {
    mockProjectState.isManager = true
    setResponses({
      active: {
        data: [makeStakeholder({ state: "ACTIVE" })],
        loading: false,
        error: null,
      },
    })
    renderView()
    expect(screen.getByRole("button", { name: /approve all/i })).toBeDisabled()
  })

  it("'Approve All' is enabled when there are pending stakeholders", () => {
    mockProjectState.isManager = true
    setResponses({
      active: {
        data: [makeStakeholder({ state: "PENDING_APPROVAL" })],
        loading: false,
        error: null,
      },
    })
    renderView()
    expect(screen.getByRole("button", { name: /approve all/i })).not.toBeDisabled()
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

  // ── Table rendering ───────────────────────────────────────────────────────────

  it("renders stakeholder rows in the table", () => {
    setResponses({
      active: {
        data: [makeStakeholder({ name: "Alice Stakeholder" })],
        loading: false,
        error: null,
      },
    })
    renderView()
    expect(screen.getByText("Alice Stakeholder")).toBeInTheDocument()
  })

  it("renders stakeholder description in the table", () => {
    setResponses({
      active: {
        data: [makeStakeholder({ description: "Primary contact" })],
        loading: false,
        error: null,
      },
    })
    renderView()
    expect(screen.getByText("Primary contact")).toBeInTheDocument()
  })

  it("navigates to stakeholder detail on row click", async () => {
    const user = userEvent.setup()
    setResponses({
      active: {
        data: [makeStakeholder({ id: 42, name: "Clickable" })],
        loading: false,
        error: null,
      },
    })
    renderView()
    await user.click(screen.getByText("Clickable"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/stakeholders/42")
  })

  // ── Removed view mode ─────────────────────────────────────────────────────────

  it("shows removed-stakeholders banner when switching to removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderView()

    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText(/these stakeholders have been removed/i)).toBeInTheDocument()
  })

  it("renders removed stakeholders in the table", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    setResponses({
      active: { data: [], loading: false, error: null },
      removed: {
        data: [makeStakeholder({ id: 99, name: "Removed Stakeholder", state: "REMOVED" })],
        loading: false,
        error: null,
      },
    })
    renderView()

    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.getByText("Removed Stakeholder")).toBeInTheDocument()
  })

  it("hides 'Create Stakeholder' and deactivated toggle in removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockProjectState.editPermission = true
    renderView()

    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.queryByRole("button", { name: /create stakeholder/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/hiding deactivated/i)).not.toBeInTheDocument()
  })

  it("hides 'Approve All' button in removed mode", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    renderView()

    await user.click(screen.getByTestId("toggle-removed"))
    expect(screen.queryByRole("button", { name: /approve all/i })).not.toBeInTheDocument()
  })

  it("shows removed loading spinner when removed fetch is in progress", async () => {
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
})