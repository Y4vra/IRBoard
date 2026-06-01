import FunctionalRequirementEdit from "@/pages/Project/fr/FunctionalRequirementEdit"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest"

// ─────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────

vi.mock("../lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockBackendResource = {
  data: null as unknown,
  loading: false,
  error: null as string | null,
}

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: () => mockBackendResource,
}))

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}))

const mockRequirement = {
  id: 1,
  name: "User Login",
  description: "Login requirement",
  priority: "HIGH",
  stability: "STABLE",
}

function renderView() {
  return render(
    <MemoryRouter
      initialEntries={[
        "/project/proj-1/functionalities/func-1/functionalRequirements/1/edit",
      ]}
    >
      <Routes>
        <Route
          path="/project/:projectId/functionalities/:functionalityId/functionalRequirements/:functionalRequirementId/edit"
          element={<FunctionalRequirementEdit />}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe("FunctionalRequirementEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Object.assign(mockBackendResource, {
      data: mockRequirement,
      loading: false,
      error: null,
    })

    globalThis.fetch = vi.fn() as MockedFunction<typeof fetch>
  })

  // ──────────────────────────────
  // Loading
  // ──────────────────────────────

  it("shows loading spinner while requirement loads", () => {
    mockBackendResource.loading = true
    mockBackendResource.data = null

    renderView()

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ──────────────────────────────
  // Error
  // ──────────────────────────────

  it("renders error state", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed"

    renderView()

    expect(
      screen.getByText(/could not load functional requirement/i)
    ).toBeInTheDocument()
  })

  it("renders backend error text", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Network error"

    renderView()

    expect(screen.getByText("Network error")).toBeInTheDocument()
  })

  it("renders back to functionality link", () => {
    mockBackendResource.data = null
    mockBackendResource.error = "Failed"

    renderView()

    expect(
      screen.getByRole("link", { name: /back to functionality/i })
    ).toHaveAttribute(
      "href",
      "/project/proj-1/functionalities/func-1"
    )
  })

  // ──────────────────────────────
  // Form rendering
  // ──────────────────────────────

  it("renders requirement values into form", () => {
    renderView()

    expect(screen.getByDisplayValue("User Login")).toBeInTheDocument()

    expect(
      screen.getByDisplayValue("Login requirement")
    ).toBeInTheDocument()

    expect(screen.getByDisplayValue("HIGH")).toBeInTheDocument()

    expect(screen.getByDisplayValue("STABLE")).toBeInTheDocument()
  })

  it("renders page heading", () => {
    renderView()

    expect(
      screen.getByRole("heading", {
        name: /edit functional requirement/i,
      })
    ).toBeInTheDocument()
  })

  // ──────────────────────────────
  // Navigation
  // ──────────────────────────────

  it("navigates back when cancel clicked", async () => {
    const user = userEvent.setup()

    renderView()

    await user.click(
      screen.getByRole("button", { name: /cancel/i })
    )

    expect(mockNavigate).toHaveBeenCalledWith(
      "/project/proj-1/functionalities/func-1/functionalRequirements/1"
    )
  })

  it("navigates back button click", async () => {
    const user = userEvent.setup()

    renderView()

    await user.click(
      screen.getByRole("button", {
        name: /back to requirement/i,
      })
    )

    expect(mockNavigate).toHaveBeenCalled()
  })

  // ──────────────────────────────
  // Lock Request
  // ──────────────────────────────

  it("requests edit lock when requirement loads", async () => {
    const mockFetch = globalThis.fetch as MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "",
    } as Response)

    renderView()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/requestEdit"),
        expect.any(Object)
      )
    })
  })

  it("redirects to permission error when lock denied", async () => {
    const mockFetch = globalThis.fetch as MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "false",
    } as Response)

    renderView()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({
          replace: true,
        })
      )
    })
  })

  // ──────────────────────────────
  // Submit
  // ──────────────────────────────

  it("submits form successfully", async () => {
    const user = userEvent.setup()
    const mockFetch = globalThis.fetch as MockedFunction<typeof fetch>

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "",
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
      } as Response)

    renderView()

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/project/proj-1/functionalities/func-1/functionalRequirements/1"
      )
    })
  })

  it("shows 403 permission error", async () => {
    const user = userEvent.setup()
    const mockFetch = globalThis.fetch as MockedFunction<typeof fetch>

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "",
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response)

    renderView()

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    )

    expect(
      await screen.findByText(
        /you do not have permission to modify this requirement/i
      )
    ).toBeInTheDocument()
  })

  it("shows 409 lock conflict error", async () => {
    const user = userEvent.setup()
    const mockFetch = globalThis.fetch as MockedFunction<typeof fetch>

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "",
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
      } as Response)

    renderView()

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    )

    expect(
      await screen.findByText(
        /being edited by another user/i
      )
    ).toBeInTheDocument()
  })
})