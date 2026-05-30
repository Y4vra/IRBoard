import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import UserManagement from "../../pages/UserManagement"

// ------------------------
// Hoisted mocks
// ------------------------
const { mockAuthContext, mockFetch, mockRefresh, mockBackendResource } = vi.hoisted(() => ({
  mockAuthContext: { isAuthenticated: true, loading: false },
  mockFetch: vi.fn(),
  mockRefresh: vi.fn(),
  mockBackendResource: vi.fn(),
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: (opts: unknown) => mockBackendResource(opts),
}))

vi.mock("@/hooks/useLocks", () => ({
  useLocks: () => ({ getLock: () => null }),
}))

vi.mock("@/components/LockIndicator", () => ({
  LockIndicator: () => null,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}))

vi.mock("@/components/dialogs/creatingDialogs/InviteUserDialog", () => ({
  InviteUserDialog: ({ onSuccess }: { onSuccess: () => void }) => (
    <button onClick={onSuccess} data-testid="invite-dialog">
      Invite User
    </button>
  ),
}))

vi.mock("@/components/dialogs/updatingDialogs/EditUserDialog", () => ({
  EditUserDialog: () => <button>Edit</button>,
}))

vi.mock("@/components/dialogs/UserDetailDialog", () => ({
  UserDetailDialog: () => <button>Details</button>,
}))

vi.mock("@/components/dialogs/ConfirmActionDialog", () => ({
  ConfirmActionDialog: ({
    trigger,
    onConfirm,
  }: {
    trigger: React.ReactNode
    onConfirm: () => void
  }) => (
    <div>
      {trigger}
      <button data-testid="confirm-action" onClick={onConfirm}>
        Confirm
      </button>
    </div>
  ),
}))

// ------------------------
// Sample data
// ------------------------
const mockUsers = [
  { id: 1, name: "Javier", surname: "Carrasco", email: "javier@test.com", active: true,  isAdmin: true  },
  { id: 2, name: "Ana",    surname: "García",   email: "ana@test.com",    active: false, isAdmin: false },
  { id: 3, name: "Luis",   surname: "Pérez",    email: "luis@test.com",   active: true,  isAdmin: false },
]

// ------------------------
// Default resource state
// ------------------------
function makeResource(overrides = {}) {
  return {
    data: mockUsers,
    loading: false,
    error: null,
    refresh: mockRefresh,
    ...overrides,
  }
}

// ------------------------
// Render helper
// ------------------------
function renderUserManagement() {
  return render(
    <MemoryRouter>
      <UserManagement />
    </MemoryRouter>
  )
}

// ------------------------
// Tests
// ------------------------
describe("UserManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.isAuthenticated = true
    mockAuthContext.loading = false
    mockBackendResource.mockReturnValue(makeResource())
    vi.stubGlobal("fetch", mockFetch)
  })

  // ── Loading state ────────────────────────────────────────────────────────

  it("shows loading spinner with correct text while auth is loading", () => {
    mockAuthContext.loading = true
    mockBackendResource.mockReturnValue(makeResource({ loading: true, data: null }))
    renderUserManagement()
    expect(screen.getByTestId("loading-spinner")).toHaveTextContent("Loading User Directory..")
  })

  it("shows loading spinner while data is fetching", () => {
    mockBackendResource.mockReturnValue(makeResource({ loading: true, data: null }))
    renderUserManagement()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error state ──────────────────────────────────────────────────────────

  it("shows Connection Error heading on fetch failure", async () => {
    mockBackendResource.mockReturnValue(makeResource({ data: null, error: "Failed to fetch users" }))
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/connection error/i)).toBeInTheDocument()
    })
  })

  it("shows the error message returned by the hook", async () => {
    mockBackendResource.mockReturnValue(makeResource({ data: null, error: "Server unreachable" }))
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText("Server unreachable")).toBeInTheDocument()
    })
  })

  it("renders Try Again button on error which calls refresh", async () => {
    mockBackendResource.mockReturnValue(makeResource({ data: null, error: "Network error" }))
    renderUserManagement()
    await waitFor(() => screen.getByRole("button", { name: /try again/i }))
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  // ── Rendering ────────────────────────────────────────────────────────────

  it("renders the User Management heading", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /user management/i })).toBeInTheDocument()
    })
  })

  it("renders user count in card description", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/3 users are registered/i)).toBeInTheDocument()
    })
  })

  it("renders a row for each user", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText("Javier Carrasco")).toBeInTheDocument()
      expect(screen.getByText("Ana García")).toBeInTheDocument()
      expect(screen.getByText("Luis Pérez")).toBeInTheDocument()
    })
  })

  it("renders user emails", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText("javier@test.com")).toBeInTheDocument()
    })
  })

  it("renders Active badge for active users", async () => {
    renderUserManagement()
    await waitFor(() => {
      const badges = screen.getAllByText(/^active$/i)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it("renders Deactivated badge for inactive users", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/deactivated/i)).toBeInTheDocument()
    })
  })

  it("renders System Admin badge for admin users", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/system admin/i)).toBeInTheDocument()
    })
  })

  it("renders Re-invite button for each user", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /re-invite/i })).toHaveLength(3)
    })
  })

  it("renders Delete button for each user", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /delete/i }).length).toBeGreaterThanOrEqual(3)
    })
  })

  // ── Re-invite ────────────────────────────────────────────────────────────

  it("calls /users/:id/re-invite on Re-invite click and alerts on success", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    renderUserManagement()

    await waitFor(() => screen.getAllByRole("button", { name: /re-invite/i }))
    fireEvent.click(screen.getAllByRole("button", { name: /re-invite/i })[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1/re-invite"),
        expect.objectContaining({ method: "POST" })
      )
      expect(alertSpy).toHaveBeenCalledWith("Invitation code regenerated and sent.")
    })
    alertSpy.mockRestore()
  })

  it("logs error when re-invite fetch rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error("timeout"))
    renderUserManagement()

    await waitFor(() => screen.getAllByRole("button", { name: /re-invite/i }))
    fireEvent.click(screen.getAllByRole("button", { name: /re-invite/i })[0])

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Re-invite failed", expect.any(Error))
    })
    consoleSpy.mockRestore()
  })

  // ── Delete ───────────────────────────────────────────────────────────────

  it("calls DELETE /users/:id on confirm and refreshes", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    renderUserManagement()

    await waitFor(() => screen.getAllByTestId("confirm-action"))
    fireEvent.click(screen.getAllByTestId("confirm-action")[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({ method: "DELETE" })
      )
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("logs error when delete fetch rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error("delete failed"))
    renderUserManagement()

    await waitFor(() => screen.getAllByTestId("confirm-action"))
    fireEvent.click(screen.getAllByTestId("confirm-action")[0])

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Delete failed", expect.any(Error))
    })
    consoleSpy.mockRestore()
  })

  // ── InviteUserDialog ─────────────────────────────────────────────────────

  it("renders the InviteUserDialog", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByTestId("invite-dialog")).toBeInTheDocument()
    })
  })

  it("calls refresh when InviteUserDialog onSuccess fires", async () => {
    renderUserManagement()
    await waitFor(() => screen.getByTestId("invite-dialog"))
    fireEvent.click(screen.getByTestId("invite-dialog"))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  // ── Pagination ───────────────────────────────────────────────────────────

  it("does NOT render pagination when users fit on one page", async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /previous/i })).not.toBeInTheDocument()
    })
  })

  it("renders pagination when users exceed 10", async () => {
    const manyUsers = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, name: `User${i}`, surname: "Test",
      email: `user${i}@test.com`, active: true, isAdmin: false,
    }))
    mockBackendResource.mockReturnValue(makeResource({ data: manyUsers }))
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument()
    })
  })

  it("Previous button is disabled on first page", async () => {
    const manyUsers = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, name: `User${i}`, surname: "Test",
      email: `user${i}@test.com`, active: true, isAdmin: false,
    }))
    mockBackendResource.mockReturnValue(makeResource({ data: manyUsers }))
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled()
    })
  })

  it("navigates to next page on Next click", async () => {
    const manyUsers = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, name: `User${i}`, surname: "Test",
      email: `user${i}@test.com`, active: true, isAdmin: false,
    }))
    mockBackendResource.mockReturnValue(makeResource({ data: manyUsers }))
    renderUserManagement()
    await waitFor(() => screen.getByRole("button", { name: /next/i }))
    fireEvent.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument()
    })
  })

  it("Next button is disabled on last page", async () => {
    const manyUsers = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, name: `User${i}`, surname: "Test",
      email: `user${i}@test.com`, active: true, isAdmin: false,
    }))
    mockBackendResource.mockReturnValue(makeResource({ data: manyUsers }))
    renderUserManagement()
    await waitFor(() => screen.getByRole("button", { name: /next/i }))
    fireEvent.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled()
    })
  })
})