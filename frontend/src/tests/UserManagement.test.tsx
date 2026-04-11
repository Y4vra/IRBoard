import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import UserManagement from "../pages/UserManagement"

const { mockAuthContext, mockFetch } = vi.hoisted(() => ({
  mockAuthContext: { isAuthenticated: true, loading: false },
  mockFetch: vi.fn(),
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => <div data-testid="loading-spinner">{text}</div>,
}))

vi.mock("@/components/InviteUserDialog", () => ({
  InviteUserDialog: ({ onSuccess }: { onSuccess: () => void }) => (
    <button onClick={onSuccess} data-testid="invite-dialog">
      Invite User
    </button>
  ),
}))

const mockUsers = [
  { id: 1, name: "Javier", surname: "Carrasco", email: "javier@test.com", active: true, isAdmin: true },
  { id: 2, name: "Ana", surname: "García", email: "ana@test.com", active: false, isAdmin: false },
  { id: 3, name: "Luis", surname: "Pérez", email: "luis@test.com", active: true, isAdmin: false },
]

function renderUserManagement() {
  return render(
    <MemoryRouter>
      <UserManagement />
    </MemoryRouter>
  )
}

describe("UserManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.isAuthenticated = true
    mockAuthContext.loading = false
    vi.stubGlobal("fetch", mockFetch)
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  it("shows the loading spinner with correct text while fetching", () => {
    mockAuthContext.loading = true
    renderUserManagement()
    expect(screen.getByTestId("loading-spinner")).toHaveTextContent("Loading User Directory..")
  })

  it("does NOT fetch when auth is still loading", () => {
    mockAuthContext.loading = true
    renderUserManagement()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it("shows error UI when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/connection error/i)).toBeInTheDocument()
    })
  })

  it("shows the error message on fetch failure", async () => {
    mockFetch.mockRejectedValue(new Error("Server unreachable"))
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText("Server unreachable")).toBeInTheDocument()
    })
  })

  it("renders Try Again button on error which retries fetch", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => screen.getByRole("button", { name: /try again/i }))
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the User Management heading", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /user management/i })).toBeInTheDocument()
    })
  })

  it("renders user count in card description", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/3 users are registered/i)).toBeInTheDocument()
    })
  })

  it("renders a row for each user", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText("Javier Carrasco")).toBeInTheDocument()
      expect(screen.getByText("Ana García")).toBeInTheDocument()
      expect(screen.getByText("Luis Pérez")).toBeInTheDocument()
    })
  })

  it("renders user emails", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText("javier@test.com")).toBeInTheDocument()
    })
  })

  it("renders Active badge for active users", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      const badges = screen.getAllByText(/^active$/i)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it("renders Deactivated badge for inactive users", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/deactivated/i)).toBeInTheDocument()
    })
  })

  it("renders System Admin badge for admin users", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/system admin/i)).toBeInTheDocument()
    })
  })

  it("renders Re-invite buttons for each user", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      const reinviteButtons = screen.getAllByRole("button", { name: /re-invite/i })
      expect(reinviteButtons).toHaveLength(3)
    })
  })

  // ── Re-invite ──────────────────────────────────────────────────────────────

  it("calls /users/:id/re-invite on Re-invite click and alerts on success", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsers })
      .mockResolvedValueOnce({ ok: true })
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    renderUserManagement()

    await waitFor(() => screen.getAllByRole("button", { name: /re-invite/i }))
    fireEvent.click(screen.getAllByRole("button", { name: /re-invite/i })[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.irboard.local/v1/users/1/re-invite",
        expect.objectContaining({ method: "POST" })
      )
      expect(alertSpy).toHaveBeenCalledWith("Invitation code regenerated and sent.")
    })
    alertSpy.mockRestore()
  })

  it("logs error when re-invite fetch rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsers })
      .mockRejectedValueOnce(new Error("timeout"))
    renderUserManagement()

    await waitFor(() => screen.getAllByRole("button", { name: /re-invite/i }))
    fireEvent.click(screen.getAllByRole("button", { name: /re-invite/i })[0])

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Re-invite failed", expect.any(Error))
    })
    consoleSpy.mockRestore()
  })

  // ── InviteUserDialog ───────────────────────────────────────────────────────

  it("renders the InviteUserDialog", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByTestId("invite-dialog")).toBeInTheDocument()
    })
  })

  it("refetches users when InviteUserDialog onSuccess is called", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => screen.getByTestId("invite-dialog"))
    fireEvent.click(screen.getByTestId("invite-dialog"))
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  // ── Pagination ─────────────────────────────────────────────────────────────

  it("does NOT render pagination when users fit on one page", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockUsers })
    renderUserManagement()
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /previous/i })).not.toBeInTheDocument()
    })
  })

  it("renders pagination when users exceed 10", async () => {
    const manyUsers = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `User${i}`,
      surname: "Test",
      email: `user${i}@test.com`,
      active: true,
      isAdmin: false,
    }))
    mockFetch.mockResolvedValue({ ok: true, json: async () => manyUsers })
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
    mockFetch.mockResolvedValue({ ok: true, json: async () => manyUsers })
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
    mockFetch.mockResolvedValue({ ok: true, json: async () => manyUsers })
    renderUserManagement()
    await waitFor(() => screen.getByRole("button", { name: /next/i }))
    fireEvent.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument()
    })
  })
})
