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

const mockFunctionalities = {
  edit: [{ id: 1, name: "Auth System", description: "Login logic" }],
  view: [{ id: 2, name: "Reports" }],
  none: [{ id: 3, name: "Admin Panel" }]
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
    vi.stubGlobal("fetch", mockFetch)
    
    mockFetch.mockImplementation((url) => {
      if (url.includes("/functionalities")) {
        return Promise.resolve({ 
          ok: true, 
          json: async () => ({ edit: [], view: [], none: [] }) 
        })
      }
      return Promise.resolve({ 
        ok: true, 
        json: async () => mockProject 
      })
    })
  })

  it("shows the loading spinner while fetching project", () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderProjectView()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  it("renders project details and functionalities count", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/functionalities")) {
        return Promise.resolve({ ok: true, json: async () => mockFunctionalities })
      }
      return Promise.resolve({ ok: true, json: async () => mockProject })
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ir-board/i })).toBeInTheDocument()
      expect(screen.getByText(/2 accessible · 1 restricted/i)).toBeInTheDocument()
    })
  })

  it("renders functionality cards with correct permission labels", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/functionalities")) {
        return Promise.resolve({ ok: true, json: async () => mockFunctionalities })
      }
      return Promise.resolve({ ok: true, json: async () => mockProject })
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText("Auth System")).toBeInTheDocument()
      expect(screen.getByText("Editable")).toBeInTheDocument()
      expect(screen.getByText("View only")).toBeInTheDocument()
      expect(screen.getByText("No access")).toBeInTheDocument()
    })
  })

  it("shows Add Functionality button only for admins", async () => {
    mockAuthContext.user = { isAdmin: true };
    renderProjectView();

    await waitFor(() => {
      const addButtons = screen.getAllByRole("link", { name: /add functionality/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it("renders restricted functionality card as non-clickable", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/functionalities")) {
        return Promise.resolve({ ok: true, json: async () => mockFunctionalities })
      }
      return Promise.resolve({ ok: true, json: async () => mockProject })
    })

    renderProjectView()

    await waitFor(() => {
      const restrictedText = screen.getByText("Admin Panel")
      const link = restrictedText.closest("a")
      expect(link).toBeNull()
    })
  })

  it("shows empty state when no functionalities exist", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/functionalities")) {
        return Promise.resolve({ ok: true, json: async () => ({ edit: [], view: [], none: [] }) })
      }
      return Promise.resolve({ ok: true, json: async () => mockProject })
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText(/no functionalities yet/i)).toBeInTheDocument()
    })
  })

  it("handles error in project fetch", async () => {
    mockFetch.mockImplementation((url) => {
      if (!url.includes("/functionalities")) {
        return Promise.resolve({ ok: false })
      }
      return Promise.resolve({ ok: true, json: async () => ({ edit: [], view: [], none: [] }) })
    })

    renderProjectView()

    await waitFor(() => {
      expect(screen.getByText(/error: failed to fetch project details/i)).toBeInTheDocument()
    })
  })
})