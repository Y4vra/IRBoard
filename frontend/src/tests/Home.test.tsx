import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import Home from "../pages/Home"

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

const mockProjects = [
  {
    id: "abcdef1234567890",
    name: "IR-Board",
    description: "Requirements management",
    priorityStyle: "TERNARY",
    state: "ACTIVE",
  },
  {
    id: "bbbbbbbbbbbbbbbb",
    name: "Second Project",
    description: "Another one",
    priorityStyle: "MOSCOW",
    state: "FINISHED",
  },
]

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
    global.fetch = mockFetch
  })

  // ── Loading states ─────────────────────────────────────────────────────────

  it("shows the loading spinner while fetching", () => {
    mockAuthContext.loading = true
    renderHome()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  it("shows the loading spinner while data is loading", () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderHome()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it("shows error UI when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  it("shows the error message returned by the API", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    renderHome()
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument()
    })
  })

  it("renders a Retry button on error", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderHome()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
    })
  })

  it("shows error when not authenticated and not loading", async () => {
    mockAuthContext.isAuthenticated = false
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it("shows empty state when projects list is empty", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
    })
  })

  it("shows admin link to create first project when admin and empty", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/create your first project/i)).toBeInTheDocument()
    })
  })

  it("shows contact admin message for non-admin when empty", async () => {
    mockAuthContext.user = { isAdmin: false }
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/contact an administrator/i)).toBeInTheDocument()
    })
  })

  // ── Projects list ──────────────────────────────────────────────────────────

  it("renders the Projects heading", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^projects$/i })).toBeInTheDocument()
    })
  })

  it("renders a card for each project", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText("IR-Board")).toBeInTheDocument()
      expect(screen.getByText("Second Project")).toBeInTheDocument()
    })
  })

  it("renders priority style badges", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText("TERNARY")).toBeInTheDocument()
      expect(screen.getByText("MOSCOW")).toBeInTheDocument()
    })
  })

  it("renders state badges in lowercase", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText("active")).toBeInTheDocument()
      expect(screen.getByText("finished")).toBeInTheDocument()
    })
  })

  it("renders More... links pointing to /project/:id", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: /more/i })
      expect(links[0]).toHaveAttribute("href", `/project/${mockProjects[0].id}`)
    })
  })

  it("shows New Project button only for admins when projects exist", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /new project/i })).toBeInTheDocument()
    })
  })

  it("does NOT show New Project button for non-admins", async () => {
    mockAuthContext.user = { isAdmin: false }
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /new project/i })).not.toBeInTheDocument()
    })
  })

  it("uses truncated reference ID in each card", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProjects })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/reference id: abcdef12/i)).toBeInTheDocument()
    })
  })

  it("shows fallback description when project has none", async () => {
    const projectsNoDesc = [{ ...mockProjects[0], description: "" }]
    mockFetch.mockResolvedValue({ ok: true, json: async () => projectsNoDesc })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/no description provided/i)).toBeInTheDocument()
    })
  })
})
