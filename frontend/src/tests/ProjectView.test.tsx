import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import ProjectView from "../pages/Project/ProjectView"

const { mockAuthContext, mockFetch } = vi.hoisted(() => ({
  mockAuthContext: { user: { isAdmin: false } },
  mockFetch: vi.fn(),
}))

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner" />,
}))

const mockProject = {
  id: 42,
  name: "IR-Board",
  description: "Requirements management platform",
  priorityStyle: "TERNARY",
  state: "ACTIVE",
}

function renderProjectView(id = "42") {
  return render(
    <MemoryRouter initialEntries={[`/project/${id}`]}>
      <Routes>
        <Route path="/project/:id" element={<ProjectView />} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ProjectView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = { isAdmin: false }
    global.fetch = mockFetch
  })

  // ── Loading ────────────────────────────────────────────────────────────────

  it("shows the loading spinner while fetching", () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderProjectView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it("shows error message when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch project details/i)).toBeInTheDocument()
    })
  })

  it("shows Back to Dashboard link on error", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /back to dashboard/i })).toBeInTheDocument()
    })
  })

  // ── Successful render ──────────────────────────────────────────────────────

  it("renders the project name as heading", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ir-board/i })).toBeInTheDocument()
    })
  })

  it("renders the priority style badge", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByText("TERNARY")).toBeInTheDocument()
    })
  })

  it("renders the project description", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByText("Requirements management platform")).toBeInTheDocument()
    })
  })

  it("renders the project state", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByText("ACTIVE")).toBeInTheDocument()
    })
  })

  it("renders fallback description when none provided", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ...mockProject, description: "" }) })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByText(/no project description available/i)).toBeInTheDocument()
    })
  })

  it("renders truncated reference ID", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByText(/ref: 42/i)).toBeInTheDocument()
    })
  })

  // ── Navigation links ───────────────────────────────────────────────────────

  it("renders all four navigation cards", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByText("Functionalities")).toBeInTheDocument()
      expect(screen.getByText("Stakeholders")).toBeInTheDocument()
      expect(screen.getByText("Non-Functional Requirements")).toBeInTheDocument()
      expect(screen.getByText("Documents")).toBeInTheDocument()
    })
  })

  it("navigation links point to correct project sub-routes", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /functionalities/i })).toHaveAttribute(
        "href", "/project/42/functionalities"
      )
      expect(screen.getByRole("link", { name: /stakeholders/i })).toHaveAttribute(
        "href", "/project/42/stakeholders"
      )
    })
  })

  it("renders Back to Projects link", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /back to projects/i })).toHaveAttribute("href", "/")
    })
  })

  // ── Admin controls ─────────────────────────────────────────────────────────

  it("shows Edit Project button for admins", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /edit project/i })).toBeInTheDocument()
    })
  })

  it("does NOT show Edit Project button for non-admins", async () => {
    mockAuthContext.user = { isAdmin: false }
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView()
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /edit project/i })).not.toBeInTheDocument()
    })
  })

  it("fetches from /projects/:id endpoint", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockProject })
    renderProjectView("42")
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.irboard.local/v1/projects/42",
        expect.objectContaining({ method: "GET" })
      )
    })
  })
})
