import DocumentDetailView from "@/pages/Project/document/DocumentDetailView"
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
}

const mockAuthState = {
  user: { isAdmin: false, name: "alice" },
  isAuthenticated: true,
}

const mockBackendResource = {
  data: null as unknown,
  loading: false,
  error: null as string | null,
  refresh: vi.fn(),
}

const mockDocument = {
  id: 1,
  fileName: "requirements.pdf",
  mimeType: "application/pdf",
  fileSize: 204800,
  state: "ACTIVE",
  entityIdentifier: "DOC-001",
  accessUrl: "https://storage.example.com/requirements.pdf",
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
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}))

vi.mock("@/components/badges/EntityStateBadge", () => ({
  EntityStateBadge: ({ state }: { state: string }) => (
    <span data-testid="entity-state-badge">{state}</span>
  ),
}))

vi.mock("@/components/dialogs/ConfirmActionDialog", () => ({
  ConfirmActionDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/components/dialogs/updatingDialogs/UpdateDocumentDialog", () => ({
  UpdateDocumentDialog: ({ disabled }: { disabled: boolean }) => (
    <button disabled={disabled}>Update document</button>
  ),
}))

const mockApprove = vi.fn()
const mockDisable = vi.fn()
const mockEnable = vi.fn()
const mockRemove = vi.fn()
const mockDeleteFn = vi.fn()

vi.mock("@/hooks/useDocumentActions", () => ({
  useApproveDocuments: () => ({ approveDocuments: mockApprove,  loading: false }),
  useDisableDocuments: () => ({ disableDocuments: mockDisable,  loading: false }),
  useEnableDocuments:  () => ({ enableDocuments:  mockEnable,   loading: false }),
  useRemoveDocuments:  () => ({ removeDocuments:  mockRemove,   loading: false }),
  useDeleteDocuments:  () => ({ deleteDocuments:  mockDeleteFn, loading: false }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderView() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-1/documents/1"]}>
      <Routes>
        <Route
          path="/project/:projectId/documents/:documentId"
          element={<DocumentDetailView />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DocumentDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mockProjectState, { editPermission: false, isManager: false })
    Object.assign(mockAuthState, { user: { isAdmin: false, name: "alice" }, isAuthenticated: true })
    Object.assign(mockBackendResource, {
      data: mockDocument,
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
    mockBackendResource.error = "Failed to fetch document"
    renderView()
    expect(screen.getByText(/document not found/i)).toBeInTheDocument()
  })

  it("shows the error message text", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Network error"
    renderView()
    expect(screen.getByText("Network error")).toBeInTheDocument()
  })

  it("shows 'Back to Documents' link on error", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed"
    renderView()
    expect(screen.getByRole("link", { name: /back to documents/i })).toBeInTheDocument()
  })

  // ── Header rendering ──────────────────────────────────────────────────────

  it("renders the document file name as the main heading", () => {
    renderView()
    expect(screen.getByRole("heading", { name: "requirements.pdf", level: 1 })).toBeInTheDocument()
  })

  it("renders the entity identifier", () => {
    renderView()
    expect(screen.getByText(/DOC-001/)).toBeInTheDocument()
  })

  it("renders the mime type", () => {
    renderView()
    expect(screen.getByText("application/pdf")).toBeInTheDocument()
  })

  it("renders the file size as formatted bytes", () => {
    renderView()
    expect(screen.getByText("200.0 KB")).toBeInTheDocument()
  })

  it("renders the state badge", () => {
    renderView()
    expect(screen.getByTestId("entity-state-badge")).toHaveTextContent("ACTIVE")
  })

  it("renders back-to-documents nav link", () => {
    renderView()
    expect(screen.getByRole("link", { name: /back to documents/i }))
      .toHaveAttribute("href", "/project/proj-1/documents")
  })

  it("renders 'Open File' button when accessUrl is present", () => {
    renderView()
    expect(screen.getByRole("button", { name: /open file/i })).toBeInTheDocument()
  })

  it("does NOT render 'Open File' button when accessUrl is absent", () => {
    mockBackendResource.data = { ...mockDocument, accessUrl: null }
    renderView()
    expect(screen.queryByRole("button", { name: /open file/i })).not.toBeInTheDocument()
  })

  it("shows observer count badge", () => {
    renderView()
    expect(screen.getByText(/0 linked requirement/i)).toBeInTheDocument()
  })

  it("shows plural 'requirements' when multiple observers", () => {
    mockBackendResource.data = {
      ...mockDocument,
      observers: [
        { id: 1, name: "FR 1", state: "ACTIVE", requirementType: "FR", functionalityId: "f1" },
        { id: 2, name: "FR 2", state: "ACTIVE", requirementType: "FR", functionalityId: "f1" },
      ],
    }
    renderView()
    expect(screen.getByText(/2 linked requirements/i)).toBeInTheDocument()
  })

  // ── editPermission controls ───────────────────────────────────────────────

  it("does NOT show action buttons without editPermission", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /update document/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /disable document/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /enable document/i })).not.toBeInTheDocument()
  })

  it("shows 'Update document' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /update document/i })).toBeInTheDocument()
  })

  it("shows 'Disable document' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /disable document/i })).toBeInTheDocument()
  })

  it("shows 'Enable document' button with editPermission", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /enable document/i })).toBeInTheDocument()
  })

  it("'Disable document' is enabled when state is ACTIVE", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /disable document/i })).not.toBeDisabled()
  })

  it("'Disable document' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockDocument, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /disable document/i })).toBeDisabled()
  })

  it("'Enable document' is disabled when state is ACTIVE", () => {
    mockProjectState.editPermission = true
    renderView()
    expect(screen.getByRole("button", { name: /enable document/i })).toBeDisabled()
  })

  it("'Enable document' is enabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockDocument, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /enable document/i })).not.toBeDisabled()
  })

  it("'Update document' is disabled when state is DEACTIVATED", () => {
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockDocument, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /update document/i })).toBeDisabled()
  })

  it("calls disableDocuments when 'Disable document' is clicked", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    renderView()
    await user.click(screen.getByRole("button", { name: /disable document/i }))
    expect(mockDisable).toHaveBeenCalledWith([mockDocument.id])
  })

  it("calls enableDocuments when 'Enable document' is clicked", async () => {
    const user = userEvent.setup()
    mockProjectState.editPermission = true
    mockBackendResource.data = { ...mockDocument, state: "DEACTIVATED" }
    renderView()
    await user.click(screen.getByRole("button", { name: /enable document/i }))
    expect(mockEnable).toHaveBeenCalledWith([mockDocument.id])
  })

  // ── isManager controls ────────────────────────────────────────────────────

  it("does NOT show 'Approve document' without isManager", () => {
    renderView()
    expect(screen.queryByRole("button", { name: /approve document/i })).not.toBeInTheDocument()
  })

  it("shows 'Approve document' for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /approve document/i })).toBeInTheDocument()
  })

  it("'Approve document' is enabled when state is PENDING_APPROVAL", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockDocument, state: "PENDING_APPROVAL" }
    renderView()
    expect(screen.getByRole("button", { name: /approve document/i })).not.toBeDisabled()
  })

  it("'Approve document' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /approve document/i })).toBeDisabled()
  })

  it("calls approveDocuments when 'Approve document' is clicked", async () => {
    const user = userEvent.setup()
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockDocument, state: "PENDING_APPROVAL" }
    renderView()
    await user.click(screen.getByRole("button", { name: /approve document/i }))
    expect(mockApprove).toHaveBeenCalledWith([mockDocument.id])
  })

  it("shows 'Remove document' for managers", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /^remove document$/i })).toBeInTheDocument()
  })

  it("'Remove document' is disabled when state is ACTIVE", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.getByRole("button", { name: /^remove document$/i })).toBeDisabled()
  })

  it("'Remove document' is enabled when state is DEACTIVATED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockDocument, state: "DEACTIVATED" }
    renderView()
    expect(screen.getByRole("button", { name: /^remove document$/i })).not.toBeDisabled()
  })

  it("does NOT show 'Delete document permanently' when state is not REMOVED", () => {
    mockProjectState.isManager = true
    renderView()
    expect(screen.queryByRole("button", { name: /delete document permanently/i })).not.toBeInTheDocument()
  })

  it("shows 'Delete document permanently' when state is REMOVED", () => {
    mockProjectState.isManager = true
    mockBackendResource.data = { ...mockDocument, state: "REMOVED" }
    renderView()
    expect(screen.getByRole("button", { name: /delete document permanently/i })).toBeInTheDocument()
  })

  // ── Linked Requirements section ───────────────────────────────────────────

  it("shows 'No requirements linked' message when observers is empty", () => {
    renderView()
    expect(screen.getByText(/no requirements linked to this document/i)).toBeInTheDocument()
  })

  it("renders FR requirement cards", () => {
    mockBackendResource.data = {
      ...mockDocument,
      observers: [{
        id: 10,
        name: "User Login",
        description: "",
        state: "ACTIVE",
        requirementType: "FR",
        functionalityId: "func-1",
      }],
    }
    renderView()
    expect(screen.getByText("User Login")).toBeInTheDocument()
  })

  it("renders NFR requirement cards", () => {
    mockBackendResource.data = {
      ...mockDocument,
      observers: [{
        id: 20,
        name: "Response Time",
        description: "",
        state: "ACTIVE",
        requirementType: "NFR",
      }],
    }
    renderView()
    expect(screen.getByText("Response Time")).toBeInTheDocument()
  })

  it("navigates to FR detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockDocument,
      observers: [{
        id: 10,
        name: "User Login",
        description: "",
        state: "ACTIVE",
        requirementType: "FR",
        functionalityId: "func-1",
      }],
    }
    renderView()
    await user.click(screen.getByText("User Login"))
    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/10"
    )
  })

  it("navigates to NFR detail on card click", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = {
      ...mockDocument,
      observers: [{
        id: 20,
        name: "Response Time",
        description: "",
        state: "ACTIVE",
        requirementType: "NFR",
      }],
    }
    renderView()
    await user.click(screen.getByText("Response Time"))
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1/nfr/20")
  })

  it("renders both Functional and Non-functional sections when both types are present", () => {
    mockBackendResource.data = {
      ...mockDocument,
      observers: [
        { id: 10, name: "User Login", description: "", state: "ACTIVE", requirementType: "FR", functionalityId: "func-1" },
        { id: 20, name: "Response Time", description: "", state: "ACTIVE", requirementType: "NFR" },
      ],
    }
    renderView()
    expect(screen.getByText(/^functional$/i)).toBeInTheDocument()
    expect(screen.getByText(/^non-functional$/i)).toBeInTheDocument()
  })
})