import FunctionalRequirementDetailView from "@/pages/Project/fr/FunctionalRequirementDetailView"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"

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
  priorityStyle: "TERNARY",
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

const mockFR = {
  id: 1,
  name: "User Login",
  description: "Users must be able to log in",
  state: "ACTIVE",
  entityIdentifier: "FR-001",
  priority: "HIGH",
  stability: "STABLE",
  children: [],
  observedStakeholders: [],
  observedNFRequirements: [],
  observedDocuments: [],
  observedFRequirements: [],
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

vi.mock("@/hooks/useFunctionalities", () => ({
  useFunctionalities: () => ({ canEditFunctionality: () => mockProjectState.editPermission }),
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

vi.mock("@/components/badges/EntityStateBadge", () => ({
  EntityStateBadge: ({ state }: { state: string }) => (
    <span data-testid="entity-state-badge">{state}</span>
  ),
}))

vi.mock("@/components/dialogs/ConfirmActionDialog", () => ({
  ConfirmActionDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/components/dialogs/creatingDialogs/CreateFunctionalRequirementDialog", () => ({
  CreateFunctionalRequirementDialog: () => null,
}))

vi.mock("@/components/dialogs/observation/ObserveStakeholderDialog", () => ({
  ObserveStakeholderDialog: () => null,
}))

vi.mock("@/components/dialogs/observation/ObserveNfrDialog", () => ({
  ObserveNFRDialog: () => null,
}))

vi.mock("@/components/dialogs/observation/ObserveDocumentDialog", () => ({
  ObserveDocumentDialog: () => null,
}))

vi.mock("@/components/dialogs/observation/ObserveFrDialog", () => ({
  ObserveLinkedFRDialog: () => null,
}))

vi.mock("@/components/RemoveButton", () => ({
  RemoveButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} aria-label="Remove link">×</button>
  ),
}))

vi.mock("@/lib/reorderUtils", () => ({
  sortByOrderValue: (arr: unknown[]) => arr,
}))

const mockApprove = vi.fn()
const mockFinish = vi.fn()
const mockDisable = vi.fn()
const mockEnable = vi.fn()
const mockRemove = vi.fn()
const mockDeleteFn = vi.fn()

vi.mock("@/hooks/useFunctionalRequirementActions", () => ({
  useApproveFunctionalRequirements: () => ({ approveFunctionalRequirements: mockApprove,  loading: false }),
  useFinishFunctionalRequirements:  () => ({ finishFunctionalRequirements:  mockFinish,   loading: false }),
  useDisableFunctionalRequirements: () => ({ disableFunctionalRequirements: mockDisable,  loading: false }),
  useEnableFunctionalRequirements:  () => ({ enableFunctionalRequirements:  mockEnable,   loading: false }),
  useRemoveFunctionalRequirements:  () => ({ removeFunctionalRequirements:  mockRemove,   loading: false }),
  useDeleteFunctionalRequirements:  () => ({ deleteFunctionalRequirements:  mockDeleteFn, loading: false }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderView() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-1/functionalities/func-1/functionalRequirements/1"]}>
      <Routes>
        <Route
          path="/project/:projectId/functionalities/:functionalityId/functionalRequirements/:frId"
          element={<FunctionalRequirementDetailView />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FunctionalRequirementDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mockProjectState, { editPermission: false, isManager: false, priorityStyle: "TERNARY" })
    Object.assign(mockAuthState, { user: { isAdmin: false, name: "alice" } })
    Object.assign(mockBackendResource, {
      data: mockFR,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })
  })

  // ── Loading ───────────────────────────────────────────────────────────────

  it("shows loading spinner while fetching", () => {
    mockBackendResource.loading = true
    mockBackendResource.data = null
    renderView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error ─────────────────────────────────────────────────────────────────

  it("shows error UI when fetch fails", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed to fetch requirement"
    renderView()
    expect(screen.getByText(/could not load requirement/i)).toBeInTheDocument()
  })

  it("shows the error message text", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Not found"
    renderView()
    expect(screen.getByText("Not found")).toBeInTheDocument()
  })

  it("shows 'Back to Functionality' link on error", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed"
    renderView()
    expect(screen.getByRole("link", { name: /back to functionality/i })).toBeInTheDocument()
  })

  // ── Header rendering ──────────────────────────────────────────────────────

  it("renders the requirement name as the main heading", () => {
    renderView()
    expect(screen.getByRole("heading", { name: "User Login", level: 1 })).toBeInTheDocument()
  })

  it("renders the requirement description", () => {
    renderView()
    expect(screen.getByText("Users must be able to log in")).toBeInTheDocument()
  })

  it("renders the entity identifier", () => {
    renderView()
    expect(screen.getByText(/FR-001/)).toBeInTheDocument()
  })

  it("renders the state badge", () => {
    renderView()
    expect(screen.getByTestId("req-state-badge")).toHaveTextContent("ACTIVE")
  })

  it("renders back-to-functionality nav link", () => {
    renderView()
    expect(screen.getByRole("link", { name: /back to functionality/i }))
      .toHaveAttribute("href", "/project/proj-1/functionalities/func-1")
  })

  it("does not render description paragraph when description is empty", () => {
    mockBackendResource.data = { ...mockFR, description: "" }
    renderView()
    expect(screen.queryByText("Users must be able to log in")).not.toBeInTheDocument()
  })

  it("renders the stability badge when present", () => {
    renderView()
    expect(screen.getByText("STABLE")).toBeInTheDocument()
  })

  it("does not render stability badge when absent", () => {
    mockBackendResource.data = { ...mockFR, stability: null }
    renderView()
    expect(screen.queryByText("STABLE")).not.toBeInTheDocument()
  })

  // ── editPermission controls ───────────────────────────────────────────────

  it("does NOT show 'Edit Requirement' button without editPermission", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /edit requirement/i })).not.toBeInTheDocument()
  })

  it("shows 'Edit Requirement' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /edit requirement/i })).toBeInTheDocument()
  })

  it("shows 'Disable requirement' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /disable requirement/i })).toBeInTheDocument()
  })

  it("shows 'Enable requirement' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /enable requirement/i })).toBeInTheDocument()
  })

  it("'Disable requirement' is enabled when state is ACTIVE", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /disable requirement/i })).not.toBeDisabled()
  })

  it("'Disable requirement' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /disable requirement/i })).toBeDisabled()
  })

  it("'Enable requirement' is disabled when state is ACTIVE", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /enable requirement/i })).toBeDisabled()
  })

  it("'Enable requirement' is enabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /enable requirement/i })).not.toBeDisabled()
  })

  it("'Edit Requirement' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /edit requirement/i })).toBeDisabled()
  })

  it("'Edit Requirement' is disabled when state is REMOVED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockFR, state: "REMOVED" }
    renderView()
    expect(screen.getByRole("button", { name: /edit requirement/i })).toBeDisabled()
  })

  it("navigates to edit page when 'Edit Requirement' is clicked on an unlocked ACTIVE FR", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    renderView()
    await user.click(screen.getByRole("button", { name: /edit requirement/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/1/edit"
    )
  })

  it("calls disableFunctionalRequirements when 'Disable requirement' is clicked", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    renderView()
    await user.click(screen.getByRole("button", { name: /disable requirement/i }))
    expect(mockDisable).toHaveBeenCalledWith("func-1", [mockFR.id])
  })

  it("calls enableFunctionalRequirements when 'Enable requirement' is clicked", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockFR, state: "DEACTIVATED" }
    renderView()
    await user.click(screen.getByRole("button", { name: /enable requirement/i }))
    expect(mockEnable).toHaveBeenCalledWith("func-1", [mockFR.id])
  })

  // ── isManager controls ────────────────────────────────────────────────────

  it("does NOT show 'Approve Requirement' without isManager", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /approve requirement/i })).not.toBeInTheDocument()
  })

  it("shows 'Approve Requirement' for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /approve requirement/i })).toBeInTheDocument()
  })

  it("'Approve Requirement' is enabled when state is PENDING_APPROVAL", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockFR, state: "PENDING_APPROVAL" }
    renderView()
    expect(screen.getByRole("button", { name: /approve requirement/i })).not.toBeDisabled()
  })

  it("'Approve Requirement' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /approve requirement/i })).toBeDisabled()
  })

  it("calls approveFunctionalRequirements when 'Approve Requirement' is clicked", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockFR, state: "PENDING_APPROVAL" }
    renderView()
    await user.click(screen.getByRole("button", { name: /approve requirement/i }))
    expect(mockApprove).toHaveBeenCalledWith("func-1", [mockFR.id])
  })

  it("shows 'Mark as finished' for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /mark as finished/i })).toBeInTheDocument()
  })

  it("'Mark as finished' is enabled when state is APPROVED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockFR, state: "APPROVED" }
    renderView()
    expect(screen.getByRole("button", { name: /mark as finished/i })).not.toBeDisabled()
  })

  it("'Mark as finished' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /mark as finished/i })).toBeDisabled()
  })

  it("calls finishFunctionalRequirements when 'Mark as finished' is clicked", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockFR, state: "APPROVED" }
    renderView()
    await user.click(screen.getByRole("button", { name: /mark as finished/i }))
    expect(mockFinish).toHaveBeenCalledWith("func-1", [mockFR.id])
  })

  it("shows 'Remove requirement' for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /^remove requirement$/i })).toBeInTheDocument()
  })

  it("'Remove requirement' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /^remove requirement$/i })).toBeDisabled()
  })

  it("'Remove requirement' is enabled when state is DEACTIVATED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /^remove requirement$/i })).not.toBeDisabled()
  })

  it("does NOT show 'Delete requirement permanently' when state is not REMOVED", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.queryByRole("button", { name: /delete requirement permanently/i })).not.toBeInTheDocument()
  })

  it("shows 'Delete requirement permanently' when state is REMOVED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockFR, state: "REMOVED" }
    renderView()
    expect(screen.getByRole("button", { name: /delete requirement permanently/i })).toBeInTheDocument()
  })

  // ── Child Requirements section ────────────────────────────────────────────

  it("does NOT show Child Requirements section when no children and no editPermission", () => {
    renderView()
    expect(screen.queryByText(/child requirements/i)).not.toBeInTheDocument()
  })

  it("shows Child Requirements section when editPermission is true", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByText(/^child requirements$/i)).toBeInTheDocument()
  })

  it("renders child FR cards when children exist", () => {
    mockBackendResource.data = {
      ...mockFR,
      children: [{
        id: 10,
        name: "Sub Login",
        description: "",
        state: "ACTIVE",
        entityIdentifier: "FR-001.1",
        priority: null,
        stability: null,
        children: [],
      }],
    }
    renderView()
    expect(screen.getByText("Sub Login")).toBeInTheDocument()
  })

  it("navigates to child FR on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockFR,
      children: [{
        id: 10,
        name: "Sub Login",
        description: "",
        state: "ACTIVE",
        entityIdentifier: "FR-001.1",
        priority: null,
        stability: null,
        children: [],
      }],
    }
    renderView()
    await user.click(screen.getByText("Sub Login"))
    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/10"
    )
  })

  it("shows 'Add Child FR' button when editPermission is true", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /add child fr/i })).toBeInTheDocument()
  })

  // ── Stakeholders section ──────────────────────────────────────────────────

  it("shows 'No stakeholders linked' when observedStakeholders is empty", () => {
    renderView()
    expect(screen.getByText(/no stakeholders linked/i)).toBeInTheDocument()
  })

  it("renders linked stakeholder cards", () => {
    mockBackendResource.data = {
      ...mockFR,
      observedStakeholders: [{ id: 5, name: "Product Owner", description: "", state: "ACTIVE" }],
    }
    renderView()
    expect(screen.getByText("Product Owner")).toBeInTheDocument()
  })

  it("navigates to stakeholder detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockFR,
      observedStakeholders: [{ id: 5, name: "Product Owner", description: "", state: "ACTIVE" }],
    }
    renderView()
    await user.click(screen.getByText("Product Owner"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/stakeholders/5")
  })

  it("shows 'Link Stakeholder' button when editPermission is true", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /link stakeholder/i })).toBeInTheDocument()
  })

  // ── NFR section ───────────────────────────────────────────────────────────

  it("shows 'No NFRs linked' when observedNFRequirements is empty", () => {
    renderView()
    expect(screen.getByText(/no nfrs linked/i)).toBeInTheDocument()
  })

  it("renders linked NFR cards", () => {
    mockBackendResource.data = {
      ...mockFR,
      observedNFRequirements: [{ id: 7, name: "Response Time", state: "ACTIVE" }],
    }
    renderView()
    expect(screen.getByText("Response Time")).toBeInTheDocument()
  })

  it("navigates to NFR detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockFR,
      observedNFRequirements: [{ id: 7, name: "Response Time", state: "ACTIVE" }],
    }
    renderView()
    await user.click(screen.getByText("Response Time"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/nfr/7")
  })

  it("shows 'Link NFR' button when editPermission is true", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /link nfr/i })).toBeInTheDocument()
  })

  // ── Documents section ─────────────────────────────────────────────────────

  it("shows 'No documents linked' when observedDocuments is empty", () => {
    renderView()
    expect(screen.getByText(/no documents linked/i)).toBeInTheDocument()
  })

  it("renders linked document cards", () => {
    mockBackendResource.data = {
      ...mockFR,
      observedDocuments: [{ id: 9, fileName: "spec.pdf", mimeType: "application/pdf" }],
    }
    renderView()
    expect(screen.getByText("spec.pdf")).toBeInTheDocument()
  })

  it("navigates to document detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockFR,
      observedDocuments: [{ id: 9, fileName: "spec.pdf", mimeType: "application/pdf" }],
    }
    renderView()
    await user.click(screen.getByText("spec.pdf"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/documents/9")
  })

  it("shows 'Link Document' button when editPermission is true", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /link document/i })).toBeInTheDocument()
  })

  // ── Observed FRs section ──────────────────────────────────────────────────

  it("shows 'No observed functional requirements' when list is empty", () => {
    renderView()
    expect(screen.getByText(/no observed functional requirements/i)).toBeInTheDocument()
  })

  it("renders observed FR cards", () => {
    mockBackendResource.data = {
      ...mockFR,
      observedFRequirements: [{
        id: 20,
        name: "Password Reset",
        description: "",
        state: "ACTIVE",
        functionalityId: "func-2",
      }],
    }
    renderView()
    expect(screen.getByText("Password Reset")).toBeInTheDocument()
  })

  it("navigates to observed FR detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockFR,
      observedFRequirements: [{
        id: 20,
        name: "Password Reset",
        description: "",
        state: "ACTIVE",
        functionalityId: "func-2",
      }],
    }
    renderView()
    await user.click(screen.getByText("Password Reset"))
    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-2/requirement/20"
    )
  })

  it("shows 'Link FR' button when editPermission is true", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /link fr/i })).toBeInTheDocument()
  })
})