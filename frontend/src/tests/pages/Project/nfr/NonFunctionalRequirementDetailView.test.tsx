import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import NonFunctionalRequirementDetailView from "@/pages/Project/nfr/NonFunctionalRequirementDetailView"

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

const mockNFR = {
  id: 1,
  name: "Response Time",
  description: "API must respond within 200ms",
  state: "ACTIVE",
  entityIdentifier: "NFR-001",
  measurementUnit: "ms",
  operator: "LESS_THAN_OR_EQUAL_TO",
  thresholdValue: 200,
  targetValue: 150,
  actualValue: 180,
  orderValue: 1,
  children: [],
  observedStakeholders: [],
  observedDocuments: [],
  observerFRequirements: [],
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

vi.mock("@/components/dialogs/creatingDialogs/CreateNonFunctionalRequirementDialog", () => ({
  CreateNonFunctionalRequirementDialog: () => null,
}))

vi.mock("@/components/dialogs/observation/ObserveStakeholderDialog", () => ({
  ObserveStakeholderDialog: () => null,
}))

vi.mock("@/components/dialogs/observation/ObserveDocumentDialog", () => ({
  ObserveDocumentDialog: () => null,
}))

vi.mock("@/components/RemoveButton", () => ({
  RemoveButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} aria-label="Remove link">×</button>
  ),
}))

vi.mock("@/hooks/useNFRequirementActions", () => ({
  useApproveNFRequirements:  () => ({ approveNFRequirements:  vi.fn(), loading: false }),
  useFinishNFRequirements:   () => ({ finishNFRequirements:   vi.fn(), loading: false }),
  useDisableNFRequirements:  () => ({ disableNFRequirements:  vi.fn(), loading: false }),
  useEnableNFRequirements:   () => ({ enableNFRequirements:   vi.fn(), loading: false }),
  useRemoveNFRequirements:   () => ({ removeNFRequirements:   vi.fn(), loading: false }),
  useDeleteNFRequirements:   () => ({ deleteNFRequirements:   vi.fn(), loading: false }),
}))

vi.mock("@/lib/reorderUtils", () => ({
  sortByOrderValue: (arr: unknown[]) => arr,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderView() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-1/nfr/1"]}>
      <Routes>
        <Route
          path="/project/:projectId/nfr/:nfrId"
          element={<NonFunctionalRequirementDetailView />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("NonFunctionalRequirementDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mockProjectState, { editPermission: false, isManager: false, id: "proj-1" })
    Object.assign(mockAuthState, { user: { isAdmin: false, name: "alice" } })
    Object.assign(mockBackendResource, {
      data: mockNFR,
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

  it("shows 'Back to Non-Functional Requirements' link on error", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed"
    renderView()
    expect(screen.getByRole("link", { name: /back to non-functional requirements/i }))
      .toBeInTheDocument()
  })

  // ── Header rendering ──────────────────────────────────────────────────────────

  it("renders the requirement name as the main heading", () => {
    renderView()
    expect(screen.getByRole("heading", { name: "Response Time", level: 1 })).toBeInTheDocument()
  })

  it("renders the requirement description", () => {
    renderView()
    expect(screen.getByText("API must respond within 200ms")).toBeInTheDocument()
  })

  it("renders the entity identifier", () => {
    renderView()
    expect(screen.getByText(/NFR-001/)).toBeInTheDocument()
  })

  it("renders the state badge", () => {
    renderView()
    expect(screen.getByTestId("req-state-badge")).toHaveTextContent("ACTIVE")
  })

  it("renders the measurement unit badge", () => {
    renderView()
    expect(screen.getByTestId("measurement-unit-badge")).toBeInTheDocument()
  })

  it("renders back-to-NFR-list nav link", () => {
    renderView()
    expect(screen.getByRole("link", { name: /back to non-functional requirements/i }))
      .toHaveAttribute("href", "/project/proj-1/nfr")
  })

  it("does not render description paragraph when description is empty", () => {
    mockBackendResource.data = { ...mockNFR, description: "" }
    renderView()
    expect(screen.queryByText("API must respond within 200ms")).not.toBeInTheDocument()
  })

  // ── Metric expression ─────────────────────────────────────────────────────────

  it("renders actual value in the metric expression", () => {
    renderView()
    // actualValue=180 appears as a large number in the MetricExpression block
    expect(screen.getByText("180")).toBeInTheDocument()
  })

  it("renders threshold value in the metric expression", () => {
    renderView()
    expect(screen.getByText("200")).toBeInTheDocument()
  })

  it("shows 'Passing' when actual meets threshold", () => {
    // actual=180 ≤ threshold=200 → passing
    renderView()
    expect(screen.getByText("Passing")).toBeInTheDocument()
  })

  it("shows 'Failing' when actual does not meet threshold", () => {
    mockBackendResource.data = { ...mockNFR, actualValue: 250, thresholdValue: 200, operator: "LESS_THAN_OR_EQUAL_TO" }
    renderView()
    expect(screen.getByText("Failing")).toBeInTheDocument()
  })

  it("does not render metric expression when no metric values are present", () => {
    mockBackendResource.data = {
      ...mockNFR,
      actualValue: null,
      thresholdValue: null,
      targetValue: null,
    }
    renderView()
    // None of the metric-specific labels should appear
    expect(screen.queryByText("Passing")).not.toBeInTheDocument()
    expect(screen.queryByText("Failing")).not.toBeInTheDocument()
  })

  // ── editPermission controls ───────────────────────────────────────────────────

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
    mockBackendResource.data = { ...mockNFR, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /disable requirement/i })).not.toBeDisabled()
  })

  it("'Disable requirement' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockNFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /disable requirement/i })).toBeDisabled()
  })

  it("'Enable requirement' is disabled when state is ACTIVE", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockNFR, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /enable requirement/i })).toBeDisabled()
  })

  it("'Enable requirement' is enabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockNFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /enable requirement/i })).not.toBeDisabled()
  })

  it("navigates to edit page when 'Edit Requirement' is clicked on an unlocked ACTIVE requirement", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    renderView()
    await user.click(screen.getByRole("button", { name: /edit requirement/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/nfr/1/edit")
  })

  it("'Edit Requirement' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockNFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /edit requirement/i })).toBeDisabled()
  })

  // ── isManager controls ────────────────────────────────────────────────────────

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
    mockBackendResource.data = { ...mockNFR, state: "PENDING_APPROVAL" }
    renderView()
    expect(screen.getByRole("button", { name: /approve requirement/i })).not.toBeDisabled()
  })

  it("'Approve Requirement' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockNFR, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /approve requirement/i })).toBeDisabled()
  })

  it("shows 'Mark as finished' for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /mark as finished/i })).toBeInTheDocument()
  })

  it("'Mark as finished' is enabled when APPROVED and passing", () => {
    mockProjectState.isManager = true
    // actual=180 ≤ threshold=200 → passing; state=APPROVED
    mockBackendResource.data = { ...mockNFR, state: "APPROVED", actualValue: 180, thresholdValue: 200, operator: "LESS_THAN_OR_EQUAL_TO" }
    renderView()
    expect(screen.getByRole("button", { name: /mark as finished/i })).not.toBeDisabled()
  })

  it("'Mark as finished' is disabled when APPROVED but failing", () => {
    mockProjectState.isManager = true
    // actual=250 > threshold=200 → failing
    mockBackendResource.data = { ...mockNFR, state: "APPROVED", actualValue: 250, thresholdValue: 200, operator: "LESS_THAN_OR_EQUAL_TO" }
    renderView()
    expect(screen.getByRole("button", { name: /mark as finished/i })).toBeDisabled()
  })

  it("'Mark as finished' is disabled when state is ACTIVE (not APPROVED)", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockNFR, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /mark as finished/i })).toBeDisabled()
  })

  it("shows 'Remove requirement' for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /^remove requirement$/i })).toBeInTheDocument()
  })

  it("'Remove requirement' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockNFR, state: "ACTIVE" }
    renderView()
    expect(screen.getByRole("button", { name: /^remove requirement$/i })).toBeDisabled()
  })

  it("'Remove requirement' is enabled when state is DEACTIVATED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockNFR, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /^remove requirement$/i })).not.toBeDisabled()
  })

  it("does NOT show 'Delete requirement permanently' when state is not REMOVED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockNFR, state: "ACTIVE" }
    renderView()
    expect(screen.queryByRole("button", { name: /delete requirement permanently/i })).not.toBeInTheDocument()
  })

  it("shows 'Delete requirement permanently' when state is REMOVED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockNFR, state: "REMOVED" }
    renderView()
    expect(screen.getByRole("button", { name: /delete requirement permanently/i })).toBeInTheDocument()
  })

  // ── Child requirements section ────────────────────────────────────────────────

  it("does NOT show Child Requirements section when no children and no editPermission", () => {
    mockBackendResource.data = { ...mockNFR, children: [] }
    renderView()
    expect(screen.queryByText(/child requirements/i)).not.toBeInTheDocument()
  })

  it("shows Child Requirements section when editPermission is true", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockNFR, children: [] }
    renderView()
    expect(screen.getByText(/^child requirements$/i)).toBeInTheDocument()
  })

  it("renders child NFR cards when children exist", () => {
    mockBackendResource.data = {
      ...mockNFR,
      children: [{
        id: 10,
        name: "Sub NFR",
        description: "",
        state: "ACTIVE",
        entityIdentifier: "NFR-001.1",
        orderValue: 1,
        children: [],
      }],
    }
    renderView()
    expect(screen.getByText("Sub NFR")).toBeInTheDocument()
  })

  it("navigates to child NFR on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockNFR,
      children: [{
        id: 10,
        name: "Sub NFR",
        description: "",
        state: "ACTIVE",
        entityIdentifier: "NFR-001.1",
        orderValue: 1,
        children: [],
      }],
    }
    renderView()
    await user.click(screen.getByText("Sub NFR"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/nfr/10")
  })

  // ── Stakeholders section ──────────────────────────────────────────────────────

  it("shows 'No stakeholders linked' when observedStakeholders is empty", () => {
    mockBackendResource.data = { ...mockNFR, observedStakeholders: [] }
    renderView()
    expect(screen.getByText(/no stakeholders linked/i)).toBeInTheDocument()
  })

  it("renders linked stakeholder cards", () => {
    mockBackendResource.data = {
      ...mockNFR,
      observedStakeholders: [{
        id: 5,
        name: "Product Owner",
        description: "",
        state: "ACTIVE",
      }],
    }
    renderView()
    expect(screen.getByText("Product Owner")).toBeInTheDocument()
  })

  it("navigates to stakeholder detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockNFR,
      observedStakeholders: [{ id: 5, name: "Product Owner", description: "", state: "ACTIVE" }],
    }
    renderView()
    await user.click(screen.getByText("Product Owner"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/stakeholders/5")
  })

  it("shows 'Link Stakeholder' button when editPermission is true", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockNFR, observedStakeholders: [] }
    renderView()
    expect(screen.getByRole("button", { name: /link stakeholder/i })).toBeInTheDocument()
  })

  // ── Documents section ─────────────────────────────────────────────────────────

  it("shows 'No documents linked' when observedDocuments is empty", () => {
    mockBackendResource.data = { ...mockNFR, observedDocuments: [] }
    renderView()
    expect(screen.getByText(/no documents linked/i)).toBeInTheDocument()
  })

  it("renders linked document cards", () => {
    mockBackendResource.data = {
      ...mockNFR,
      observedDocuments: [{ id: 7, fileName: "spec.pdf", mimeType: "application/pdf" }],
    }
    renderView()
    expect(screen.getByText("spec.pdf")).toBeInTheDocument()
  })

  it("navigates to document detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockNFR,
      observedDocuments: [{ id: 7, fileName: "spec.pdf", mimeType: "application/pdf" }],
    }
    renderView()
    await user.click(screen.getByText("spec.pdf"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/documents/7")
  })

  it("shows 'Link Document' button when editPermission is true", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockNFR, observedDocuments: [] }
    renderView()
    expect(screen.getByRole("button", { name: /link document/i })).toBeInTheDocument()
  })

  // ── Observer FRs section ──────────────────────────────────────────────────────

  it("shows 'No functional requirements observe this NFR' when list is empty", () => {
    mockBackendResource.data = { ...mockNFR, observerFRequirements: [] }
    renderView()
    expect(screen.getByText(/no functional requirements observe this nfr/i)).toBeInTheDocument()
  })

  it("renders observer FR cards", () => {
    mockBackendResource.data = {
      ...mockNFR,
      observerFRequirements: [{
        id: 20,
        name: "User Login",
        description: "",
        state: "APPROVED",
        functionalityId: "func-1",
      }],
    }
    renderView()
    expect(screen.getByText("User Login")).toBeInTheDocument()
  })

  it("navigates to observer FR detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockNFR,
      observerFRequirements: [{
        id: 20,
        name: "User Login",
        description: "",
        state: "APPROVED",
        functionalityId: "func-1",
      }],
    }
    renderView()
    await user.click(screen.getByText("User Login"))
    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/20"
    )
  })
})