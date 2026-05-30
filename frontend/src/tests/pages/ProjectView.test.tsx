import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import ProjectView from "../../pages/Project/ProjectView"

// ------------------------
// Shared mocks
// ------------------------
const mockAuthContext = {
  user: { isAdmin: false, name: "testuser" },
  isAuthenticated: true,
}

let mockUseProject: ReturnType<typeof vi.fn>
let mockUseFunctionalities: ReturnType<typeof vi.fn>

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

vi.mock("@/hooks/useProject", () => ({
  useProject: () => mockUseProject(),
}))

vi.mock("@/hooks/useFunctionalities", () => ({
  useFunctionalities: () => mockUseFunctionalities(),
}))

vi.mock("@/hooks/useLocks", () => ({
  useLocks: () => ({ getLock: () => null }),
}))

vi.mock("@/hooks/useApproveActions", () => ({
  useApproveAll: () => ({ approveAll: vi.fn(), loading: false }),
}))

vi.mock("@/hooks/useProjectActions", () => ({
  useFinishProject:  () => ({ finishProject: vi.fn(),  loading: false }),
  useDisableProject: () => ({ disableProject: vi.fn(), loading: false }),
  useEnableProject:  () => ({ enableProject: vi.fn(),  loading: false }),
  useRemoveProject:  () => ({ removeProject: vi.fn(),  loading: false }),
  useDeleteProject:  () => ({ deleteProject: vi.fn(),  loading: false }),
}))

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: () => ({
    data: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}))

vi.mock("@/components/LockIndicator", () => ({
  LockIndicator: () => null,
}))

vi.mock("@/components/graphics/ProjectHealthBar", () => ({
  ProjectHealthBar: () => null,
}))

vi.mock("@/components/graphics/ProjectStatsSectionGraph", () => ({
  ProjectStatsSection: () => null,
}))

vi.mock("@/components/dialogs/creatingDialogs/CreateFunctionalityDialog", () => ({
  CreateFunctionalityDialog: () => <button>Add functionality</button>,
}))

vi.mock("@/components/dialogs/userLinking/LinkUserToProjectDialog", () => ({
  LinkUserToProjectDialog: () => null,
}))

vi.mock("@/components/dialogs/ConfirmActionDialog", () => ({
  ConfirmActionDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/components/badges/ProjectStateBadge", () => ({
  ProjectStateBadge: ({ state }: { state: string }) => <span>{state}</span>,
}))

vi.mock("@/components/badges/FunctionalityStateBadge", () => ({
  FunctionalityStateBadge: ({ state }: { state: string }) => <span>{state}</span>,
}))

vi.mock("@/components/ViewToggle", () => ({
  ViewToggle: ({
    onChange,
  }: {
    mode: string
    onChange: (m: string) => void
    activeCount?: number
    removedCount?: number
  }) => (
    <div>
      <button onClick={() => onChange("active")}>Active</button>
      <button onClick={() => onChange("removed")}>Removed</button>
    </div>
  ),
}))

// ------------------------
// Sample data
// ------------------------
const mockProject = {
  id: 42,
  name: "IR-Board",
  description: "Requirements management platform",
  priorityStyle: "TERNARY",
  state: "ACTIVE",
  isManager: true,
  editPermission: true,
  refresh: vi.fn(),
}

const mockFunctionalities = {
  edit: [
    {
      id: 1,
      entityIdentifier: "FUNC-1",
      name: "Auth System",
      label: "Auth System",
      description: "Login logic",
      state: "ACTIVE",
      projectId: 42,
    },
  ],
  view: [
    {
      id: 2,
      entityIdentifier: "FUNC-2",
      name: "Reports",
      label: "Reports",
      description: "",
      state: "ACTIVE",
      projectId: 42,
    },
  ],
  none: [
    {
      id: 3,
      entityIdentifier: "FUNC-3",
      name: "Admin Panel",
      label: "Admin Panel",
      description: "...",
      state: "ACTIVE",
      projectId: 42,
    },
  ],
}

// ------------------------
// Render helper
// ------------------------
function renderProjectView(id = "42") {
  return render(
    <MemoryRouter initialEntries={[`/project/${id}`]}>
      <Routes>
        <Route path="/project/:id" element={<ProjectView />} />
      </Routes>
    </MemoryRouter>
  )
}

// ------------------------
// Tests
// ------------------------
describe("ProjectView", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseProject = vi.fn(() => ({ ...mockProject }))

    mockUseFunctionalities = vi.fn(() => ({
      functionalities: { edit: [], view: [], none: [] },
      loading: false,
      error: null,
      refresh: vi.fn(),
    }))

    mockAuthContext.user = { isAdmin: false, name: "testuser" }
  })

  // ── Loading ──────────────────────────────────────────────────────────────

  it("shows loading spinner while functionalities are loading", () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    })

    renderProjectView()

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error ────────────────────────────────────────────────────────────────

  it("shows error message when functionalities fetch fails", async () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: null,
      loading: false,
      error: "failed to fetch project details",
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      expect(
        screen.getByText(/failed to fetch project details/i)
      ).toBeInTheDocument()
    })
  })

  it("shows Try Again button on error", async () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: null,
      loading: false,
      error: "Network error",
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    })
  })

  // ── Project details ──────────────────────────────────────────────────────

  it("renders project name and description", async () => {
    renderProjectView()

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ir-board/i })).toBeInTheDocument()
      expect(screen.getByText(/requirements management platform/i)).toBeInTheDocument()
    })
  })

  it("renders project state badge", async () => {
    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText("ACTIVE")).toBeInTheDocument()
    })
  })

  it("renders functionality access counts", async () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: mockFunctionalities,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText(/2 accessible · 1 restricted/i)).toBeInTheDocument()
    })
  })

  // ── Functionality cards ──────────────────────────────────────────────────

  it("renders functionality cards with correct permission labels", async () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: mockFunctionalities,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText("Auth System")).toBeInTheDocument()
      expect(screen.getByText("Reports")).toBeInTheDocument()
      expect(screen.getByText("Admin Panel")).toBeInTheDocument()
      expect(screen.getByText("Editable")).toBeInTheDocument()
      expect(screen.getByText("View only")).toBeInTheDocument()
      expect(screen.getByText("No access")).toBeInTheDocument()
    })
  })

  it("renders restricted functionality as non-clickable (no anchor)", async () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: mockFunctionalities,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      const text = screen.getByText("Admin Panel")
      expect(text.closest("a")).toBeNull()
    })
  })

  it("wraps editable functionality in a link to the correct route", async () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: mockFunctionalities,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      const text = screen.getByText("Auth System")
      expect(text.closest("a")).toHaveAttribute(
        "href",
        "/project/42/functionalities/1"
      )
    })
  })

  // ── Empty state ──────────────────────────────────────────────────────────

  it("shows empty state when no functionalities exist", async () => {
    mockUseFunctionalities.mockReturnValue({
      functionalities: { edit: [], view: [], none: [] },
      loading: false,
      error: null,
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText(/no functionalities yet/i)).toBeInTheDocument()
    })
  })

  // ── Add functionality button ─────────────────────────────────────────────

  it("shows Add Functionality button when user has editPermission", async () => {
    renderProjectView()

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /add functionality/i }).length
      ).toBeGreaterThan(0)
    })
  })

  it("hides Add Functionality button when editPermission is false", async () => {
    mockUseProject = vi.fn(() => ({
      ...mockProject,
      editPermission: false,
    }))

    // non-empty list so the empty-state fallback button doesn't appear
    mockUseFunctionalities.mockReturnValue({
      functionalities: mockFunctionalities,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText(/ir-board/i)).toBeInTheDocument()
    })

    expect(
      screen.queryAllByRole("button", { name: /add functionality/i })
    ).toHaveLength(0)
  })

  // ── Manager actions dropdown ─────────────────────────────────────────────

  it("shows Actions dropdown for managers", async () => {
    renderProjectView()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /actions/i })).toBeInTheDocument()
    })
  })

  it("hides Actions dropdown for non-managers", async () => {
    mockUseProject = vi.fn(() => ({
      ...mockProject,
      isManager: false,
    }))

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText(/ir-board/i)).toBeInTheDocument()
    })

    expect(screen.queryByRole("button", { name: /actions/i })).toBeNull()
  })

  // ── Removed functionalities view ─────────────────────────────────────────

  it("shows ViewToggle for managers", async () => {
    renderProjectView()

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /removed/i })).toBeInTheDocument()
    })
  })

  it("switches to removed view and shows the removed banner", async () => {
    renderProjectView()

    const removedBtn = await screen.findByRole("button", { name: /removed/i })
    await userEvent.click(removedBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/these functionalities have been removed/i)
      ).toBeInTheDocument()
    })
  })

  it("hides ViewToggle for non-managers", async () => {
    mockUseProject = vi.fn(() => ({
      ...mockProject,
      isManager: false,
    }))

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText(/ir-board/i)).toBeInTheDocument()
    })

    expect(screen.queryByRole("button", { name: /removed/i })).toBeNull()
  })

  // ── Navigation links ─────────────────────────────────────────────────────

  it("renders the three project section navigation links", async () => {
    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText("Stakeholders")).toBeInTheDocument()
      expect(screen.getByText("Non-Functional Requirements")).toBeInTheDocument()
      expect(screen.getByText("Documents")).toBeInTheDocument()
    })
  })
})