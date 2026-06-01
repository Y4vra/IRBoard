import DocumentsView from "@/pages/Project/document/DocumentsView"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { DocumentDTO } from "@/types/Document"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockProject = {
  editPermission: false,
  isManager: false,
  documentStats: null,
}

const mockAuth = {
  isAuthenticated: true,
}

const activeRefresh = vi.fn()
const removedRefresh = vi.fn()

const activeResource = {
  data: [] as DocumentDTO[],
  loading: false,
  error: null as string|null,
  refresh: activeRefresh,
}

const removedResource = {
  data: [],
  loading: false,
  error: null,
  refresh: removedRefresh,
}

let callCount = 0

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: () => {
    callCount++
    return callCount === 1
      ? activeResource
      : removedResource
  },
}))

vi.mock("@/hooks/useProject", () => ({
  useProject: () => mockProject,
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuth,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner">Loading</div>,
}))

vi.mock("@/components/BackToProjectButton", () => ({
  BackToProjectButton: () => <div>BackToProject</div>,
}))

vi.mock("@/components/ViewToggle", () => ({
  ViewToggle: () => <div>ViewToggle</div>,
}))

vi.mock("@/components/dialogs/creatingDialogs/UploadDocumentDialog", () => ({
  UploadDocumentDialog: () => (
    <button>Upload Document</button>
  ),
}))

const mockApproveDocuments = vi.fn()

vi.mock("@/hooks/useDocumentActions", () => ({
  useApproveDocuments: () => ({
    approveDocuments: mockApproveDocuments,
    loading: false,
  }),
}))

function renderView() {
  callCount = 0

  return render(
    <MemoryRouter initialEntries={["/project/proj-1/documents"]}>
      <Routes>
        <Route
          path="/project/:projectId/documents"
          element={<DocumentsView />}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe("DocumentsView", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Object.assign(mockProject, {
      editPermission: false,
      isManager: false,
      documentStats: null,
    })

    Object.assign(activeResource, {
      data: [],
      loading: false,
      error: null,
    })

    Object.assign(removedResource, {
      data: [],
      loading: false,
      error: null,
    })
  })

  it("shows loading state", () => {
    activeResource.loading = true

    renderView()

    expect(
      screen.getByTestId("loading-spinner")
    ).toBeInTheDocument()
  })

  it("shows error state", () => {
    activeResource.error = "Failed"

    renderView()

    expect(screen.getByText("Error")).toBeInTheDocument()
  })

  it("shows empty documents message", () => {
    renderView()

    expect(
      screen.getByText(/no documents found/i)
    ).toBeInTheDocument()
  })

  it("renders document rows", () => {
    activeResource.data = [
      {
        entityIdentifier: "element",
        id: 1,
        fileName: "spec.pdf",
        mimeType: "application/pdf",
        fileSize: 2048,
        state: "PENDING_APPROVAL",
        observers: [],
      },
    ]

    renderView()

    expect(screen.getByText("spec.pdf"))
      .toBeInTheDocument()
  })

  it("navigates to detail when row clicked", async () => {
    const user = userEvent.setup()

    activeResource.data = [
      {
        entityIdentifier: "activeResource",
        id: 1,
        fileName: "spec.pdf",
        mimeType: "application/pdf",
        fileSize: 2048,
        state: "PENDING_APPROVAL",
        observers: [],
      },
    ]

    renderView()

    await user.click(screen.getByText("spec.pdf"))

    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/documents/1"
    )
  })

  it("shows upload document button when editPermission true", () => {
    mockProject.editPermission = true

    renderView()

    expect(
      screen.getByRole("button", {
        name: /upload document/i,
      })
    ).toBeInTheDocument()
  })

  it("shows approve all button for managers", () => {
    mockProject.isManager = true

    activeResource.data = [
      {
        entityIdentifier: "activeResource",
        id: 1,
        fileName: "pending.pdf",
        mimeType: "application/pdf",
        fileSize: 1000,
        state: "PENDING_APPROVAL",
        observers: [],
      },
    ]

    renderView()

    expect(
      screen.getByRole("button", {
        name: /approve all \(1\)/i,
      })
    ).toBeInTheDocument()
  })

  it("calls approveDocuments when approve all clicked", async () => {
    const user = userEvent.setup()

    mockProject.isManager = true

    activeResource.data = [
      {
        entityIdentifier: "activeResource",
        id: 5,
        fileName: "pending.pdf",
        mimeType: "application/pdf",
        fileSize: 1000,
        state: "PENDING_APPROVAL",
        observers: [],
      },
    ]

    renderView()

    await user.click(
      screen.getByRole("button", {
        name: /approve all/i,
      })
    )

    expect(mockApproveDocuments)
      .toHaveBeenCalledWith([5])
  })

  it("filters deactivated documents by default", () => {
    activeResource.data = [
      {
        entityIdentifier: "activeResource1",
        id: 1,
        fileName: "active.pdf",
        state: "PENDING_APPROVAL",
        observers: [],
        fileSize: 2,
        mimeType: "value"
      },
      {
        entityIdentifier: "activeResource2",
        id: 2,
        fileName: "deactivated.pdf",
        state: "DEACTIVATED",
        observers: [],
        fileSize: 2,
        mimeType: "value"
      },
    ]

    renderView()

    expect(screen.getByText("active.pdf"))
      .toBeInTheDocument()

    expect(
      screen.queryByText("deactivated.pdf")
    ).not.toBeInTheDocument()
  })

  it("shows toggle button in active view", () => {
    renderView()

    expect(
      screen.getByRole("button", {
        name: /hiding deactivated/i,
      })
    ).toBeInTheDocument()
  })
})