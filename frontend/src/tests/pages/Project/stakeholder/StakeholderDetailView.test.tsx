import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import StakeholderDetailView from "@/pages/Project/stakeholder/StakeholderDetailView"

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
  editPermission: false,
  isManager: false,
  id: "proj-1",
}

const mockAuthState = {
  user: { isAdmin: false, name: "alice" },
}

const mockBackendResource = {
  data: null as unknown,
  loading: false,
  error: null as string | null,
  refresh: vi.fn(),
}

const mockStakeholder = {
  id: 1,
  name: "Product Owner",
  description: "Owns the product backlog",
  state: "ACTIVE",
  entityIdentifier: "STK-001",
  observers: [],
}

vi.mock("@/hooks/useProject", () => ({
  useProject: () => mockProjectState,
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}))

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: () => mockBackendResource,
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

vi.mock("@/components/dialogs/ConfirmActionDialog", () => ({
  ConfirmActionDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/hooks/useStakeholderActions", () => ({
  useApproveStakeholders:  () => ({ approveStakeholders:  vi.fn(), loading: false }),
  useDisableStakeholders:  () => ({ disableStakeholders:  vi.fn(), loading: false }),
  useEnableStakeholders:   () => ({ enableStakeholders:   vi.fn(), loading: false }),
  useRemoveStakeholders:   () => ({ removeStakeholders:   vi.fn(), loading: false }),
  useDeleteStakeholders:   () => ({ deleteStakeholders:   vi.fn(), loading: false }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderView() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-1/stakeholders/1"]}>
      <Routes>
        <Route
          path="/project/:projectId/stakeholders/:stakeholderId"
          element={<StakeholderDetailView />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StakeholderDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mockProjectState, { editPermission: false, isManager: false, id: "proj-1" })
    Object.assign(mockAuthState, { user: { isAdmin: false, name: "alice" } })
    Object.assign(mockBackendResource, {
      data: mockStakeholder,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })
  })

  // ── Loading ──────────────────────────────────────────────────────────────────

  it("shows loading spinner while fetching", () => {
    mockBackendResource.loading = true
    mockBackendResource.data = null
    renderView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error ────────────────────────────────────────────────────────────────────

  it("shows error UI when fetch fails", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed to fetch stakeholder"
    renderView()
    expect(screen.getByText(/stakeholder not found/i)).toBeInTheDocument()
  })

  it("shows 'Back to Stakeholders' link on error", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed to fetch stakeholder"
    renderView()
    expect(screen.getByRole("link", { name: /back to stakeholders/i })).toBeInTheDocument()
  })

  // ── Header rendering ─────────────────────────────────────────────────────────

  it("renders the stakeholder name as the main heading", () => {
    renderView()
    expect(screen.getByRole("heading", { name: "Product Owner", level: 1 })).toBeInTheDocument()
  })

  it("renders the stakeholder description", () => {
    renderView()
    expect(screen.getByText("Owns the product backlog")).toBeInTheDocument()
  })

  it("renders the entity identifier", () => {
    renderView()
    expect(screen.getByText("STK-001")).toBeInTheDocument()
  })

  it("renders the state badge", () => {
    renderView()
    expect(screen.getByTestId("entity-state-badge")).toHaveTextContent("ACTIVE")
  })

  it("renders the back-to-stakeholders nav link", () => {
    renderView()
    expect(screen.getByRole("link", { name: /back to stakeholders/i }))
      .toHaveAttribute("href", "/project/proj-1/stakeholders")
  })

  it("does not render description paragraph when description is empty", () => {
    mockBackendResource.data = { ...mockStakeholder, description: "" }
    renderView()
    // The description <p> is only rendered when description is truthy
    expect(screen.queryByText("Owns the product backlog")).not.toBeInTheDocument()
  })

  // ── editPermission controls ───────────────────────────────────────────────────

  it("does NOT show 'Modify Stakeholder' button without editPermission", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /modify stakeholder/i })).not.toBeInTheDocument()
  })

  it("shows 'Modify Stakeholder' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /modify stakeholder/i })).toBeInTheDocument()
  })

  it("shows 'Disable stakeholder' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /disable stakeholder/i })).toBeInTheDocument()
  })

  it("shows 'Enable stakeholder' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /enable stakeholder/i })).toBeInTheDocument()
  })

  it("'Disable stakeholder' is enabled when state is ACTIVE", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockStakeholder, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /disable stakeholder/i })).not.toBeDisabled()
  })

  it("'Disable stakeholder' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockStakeholder, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /disable stakeholder/i })).toBeDisabled()
  })

  it("'Enable stakeholder' is disabled when state is ACTIVE", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockStakeholder, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /enable stakeholder/i })).toBeDisabled()
  })

  it("'Enable stakeholder' is enabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockStakeholder, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /enable stakeholder/i })).not.toBeDisabled()
  })

  it("navigates to edit page when 'Modify Stakeholder' is clicked on an unlocked ACTIVE stakeholder", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    renderView()
    await user.click(screen.getByRole("button", { name: /modify stakeholder/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/stakeholders/1/edit")
  })

  it("'Modify Stakeholder' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockStakeholder, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /modify stakeholder/i })).toBeDisabled()
  })

  // ── isManager controls ────────────────────────────────────────────────────────

  it("does NOT show 'Approve Stakeholder' button without isManager", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /approve stakeholder/i })).not.toBeInTheDocument()
  })

  it("shows 'Approve Stakeholder' button for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /approve stakeholder/i })).toBeInTheDocument()
  })

  it("'Approve Stakeholder' is enabled when state is PENDING_APPROVAL", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockStakeholder, state: "PENDING_APPROVAL" }
    renderView()
    expect(screen.getByRole("button", { name: /approve stakeholder/i })).not.toBeDisabled()
  })

  it("'Approve Stakeholder' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockStakeholder, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /approve stakeholder/i })).toBeDisabled()
  })

  it("shows 'Remove stakeholder' button for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /^remove stakeholder$/i })).toBeInTheDocument()
  })

  it("'Remove stakeholder' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockStakeholder, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /^remove stakeholder$/i })).toBeDisabled()
  })

  it("'Remove stakeholder' is enabled when state is DEACTIVATED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockStakeholder, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /^remove stakeholder$/i })).not.toBeDisabled()
  })

  it("does NOT show 'Delete stakeholder permanently' when state is not REMOVED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockStakeholder, state: "ACTIVE" }
    renderView()
    expect(screen.queryByRole("button", { name: /delete stakeholder permanently/i })).not.toBeInTheDocument()
  })

  it("shows 'Delete stakeholder permanently' when state is REMOVED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockStakeholder, state: "REMOVED" }
    renderView()
    expect(screen.getByRole("button", { name: /delete stakeholder permanently/i })).toBeInTheDocument()
  })

  // ── Linked requirements ───────────────────────────────────────────────────────

  it("shows empty state when no observers are linked", () => {
    mockBackendResource.data = { ...mockStakeholder, observers: [] }
    renderView()
    expect(screen.getByText(/no requirements linked/i)).toBeInTheDocument()
  })

  it("renders FR requirement card when observers include a FR", () => {
    mockBackendResource.data = {
      ...mockStakeholder,
      observers: [{
        id: 10,
        name: "User login",
        description: "Login flow",
        state: "APPROVED",
        requirementType: "FR",
        functionalityId: "func-1",
      }],
    }
    renderView()
    expect(screen.getByText("User login")).toBeInTheDocument()
    expect(screen.getByText("FR")).toBeInTheDocument()
  })

  it("renders NFR requirement card when observers include a NFR", () => {
    mockBackendResource.data = {
      ...mockStakeholder,
      observers: [{
        id: 20,
        name: "Response time < 200ms",
        description: "Performance",
        state: "APPROVED",
        requirementType: "NFR",
      }],
    }
    renderView()
    expect(screen.getByText("Response time < 200ms")).toBeInTheDocument()
    expect(screen.getByText("NFR")).toBeInTheDocument()
  })

  it("navigates to FR requirement on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockStakeholder,
      observers: [{
        id: 10,
        name: "User login",
        description: "",
        state: "APPROVED",
        requirementType: "FR",
        functionalityId: "func-1",
      }],
    }
    renderView()
    await user.click(screen.getByText("User login"))
    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/10"
    )
  })

  it("navigates to NFR requirement on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockStakeholder,
      observers: [{
        id: 20,
        name: "Response time",
        description: "",
        state: "APPROVED",
        requirementType: "NFR",
      }],
    }
    renderView()
    await user.click(screen.getByText("Response time"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/nfr/20")
  })
})