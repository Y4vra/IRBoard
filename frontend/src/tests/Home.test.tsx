import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import Home from "../pages/Home"

vi.mock("../lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

vi.mock("@/hooks/useLocks", () => ({
  useLocks: () => ({
    getLock: () => null,
  }),
}))

const { mockAuthContext, mockFetch } = vi.hoisted(() => ({
  mockAuthContext: {
    user: { isAdmin: false },
    isAuthenticated: true,
    loading: false,
  },
  mockFetch: vi.fn(),
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner" />,
}))

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = { isAdmin: false }
    mockAuthContext.isAuthenticated = true
    mockAuthContext.loading = false
    vi.stubGlobal("fetch", mockFetch)
  })

  // ── Loading ─────────────────────────────

  it("shows loading spinner while auth is loading", () => {
    mockAuthContext.loading = true
    renderHome()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  it("shows loading spinner while fetch is pending", () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderHome()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error ───────────────────────────────

  it("shows error UI when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderHome()

    await waitFor(() => {
      expect(
        screen.getByText(/whoops! something went wrong/i)
      ).toBeInTheDocument()
    })
  })

  it("shows API error message", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    renderHome()

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument()
    })
  })

  it("shows retry button on error", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderHome()

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument()
    })
  })

  it("shows auth failure error when not authenticated", async () => {
    mockAuthContext.isAuthenticated = false
    renderHome()

    await waitFor(() => {
      expect(
        screen.getByText(/enviroment variable/i)
      ).toBeInTheDocument()
    })
  })

  // ── Empty state ─────────────────────────

  it("shows empty state when no projects exist", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()

    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
    })
  })

  it("shows admin CTA when empty and admin", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()

    await waitFor(() => {
      expect(
        screen.getByText(/create your first project/i)
      ).toBeInTheDocument()
    })
  })

  it("shows contact admin when empty and not admin", async () => {
    mockAuthContext.user = { isAdmin: false }
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()

    await waitFor(() => {
      expect(
        screen.getByText(/contact an administrator/i)
      ).toBeInTheDocument()
    })
  })

  // ── Data rendering ──────────────────────

  it("renders project names", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "abcdef1234567890",
          name: "IR-Board",
          description: "Requirements management",
          priorityStyle: "TERNARY",
          state: "ACTIVE",
        },
      ],
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText("IR-Board")).toBeInTheDocument()
    })
  })

  it("renders priority styles", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "Test",
          description: "",
          priorityStyle: "MOSCOW",
          state: "ACTIVE",
        },
      ],
    })

    renderHome()

    await waitFor(() => {
      expect(screen.getByText("MOSCOW")).toBeInTheDocument()
    })
  })

  it("renders reference id truncated", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "abcdef1234567890",
          name: "Test",
          description: "",
          priorityStyle: "TERNARY",
          state: "ACTIVE",
        },
      ],
    })

    renderHome()

    await waitFor(() => {
      expect(
        screen.getByText(/reference id: abcdef12/i)
      ).toBeInTheDocument()
    })
  })

  it("shows fallback description", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "Test",
          description: "",
          priorityStyle: "TERNARY",
          state: "ACTIVE",
        },
      ],
    })

    renderHome()

    await waitFor(() => {
      expect(
        screen.getByText(/no description provided/i)
      ).toBeInTheDocument()
    })
  })
})