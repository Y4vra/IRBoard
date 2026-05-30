import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import NewProject from "@/pages/Project/NewProject"

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("../lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}))

function renderNewProject() {
  return render(
    <MemoryRouter>
      <NewProject />
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("NewProject", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", mockFetch)
  })

  // ── Rendering ───────────────────────────────────────────────────────────────

  it("renders the page heading", () => {
    renderNewProject()
    expect(screen.getByRole("heading", { name: /create new project/i, level: 1 })).toBeInTheDocument()
  })

  it("renders the project name input", () => {
    renderNewProject()
    expect(screen.getByPlaceholderText(/ir-board system/i)).toBeInTheDocument()
  })

  it("renders the client/organization input", () => {
    renderNewProject()
    expect(screen.getByPlaceholderText(/university of oviedo/i)).toBeInTheDocument()
  })

  it("renders the description textarea", () => {
    renderNewProject()
    expect(screen.getByPlaceholderText(/brief overview/i)).toBeInTheDocument()
  })

  it("renders TERNARY priority button selected by default", () => {
    renderNewProject()
    const ternaryBtn = screen.getByRole("button", { name: /ternary/i })
    expect(ternaryBtn).toBeInTheDocument()
    // Default selection reflected by primary classes
    expect(ternaryBtn.className).toContain("bg-primary")
  })

  it("renders MoSCoW priority button unselected by default", () => {
    renderNewProject()
    const moscowBtn = screen.getByRole("button", { name: /moscow/i })
    expect(moscowBtn.className).not.toContain("bg-primary")
  })

  it("renders the submit button", () => {
    renderNewProject()
    expect(screen.getByRole("button", { name: /initialize project/i })).toBeInTheDocument()
  })

  it("renders the cancel button", () => {
    renderNewProject()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("renders back-to-projects button", () => {
    renderNewProject()
    expect(screen.getByRole("button", { name: /back to projects/i })).toBeInTheDocument()
  })

  // ── Priority selection ───────────────────────────────────────────────────────

  it("switches priority to MoSCoW when clicked", async () => {
    const user = userEvent.setup()
    renderNewProject()

    await user.click(screen.getByRole("button", { name: /moscow/i }))

    expect(screen.getByRole("button", { name: /moscow/i }).className).toContain("bg-primary")
    expect(screen.getByRole("button", { name: /ternary/i }).className).not.toContain("bg-primary")
  })

  it("switches back to TERNARY when clicked again", async () => {
    const user = userEvent.setup()
    renderNewProject()

    await user.click(screen.getByRole("button", { name: /moscow/i }))
    await user.click(screen.getByRole("button", { name: /ternary/i }))

    expect(screen.getByRole("button", { name: /ternary/i }).className).toContain("bg-primary")
  })

  // ── Navigation ───────────────────────────────────────────────────────────────

  it("navigates back when back button is clicked", async () => {
    const user = userEvent.setup()
    renderNewProject()
    await user.click(screen.getByRole("button", { name: /back to projects/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it("navigates to /home when cancel is clicked", async () => {
    const user = userEvent.setup()
    renderNewProject()
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/home")
  })

  // ── Form submission — success ────────────────────────────────────────────────

  it("submits the form and navigates to /home on success", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: true })
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Acme Corp")
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/home")
    )
  })

  it("sends POST to /projects/new with form data", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: true })
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "Alpha")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Beta Corp")
    await user.type(screen.getByPlaceholderText(/brief overview/i), "Some description")
    await user.click(screen.getByRole("button", { name: /moscow/i }))
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain("/projects/new")
    expect(options.method).toBe("POST")

    const body = JSON.parse(options.body)
    expect(body.name).toBe("Alpha")
    expect(body.client).toBe("Beta Corp")
    expect(body.description).toBe("Some description")
    expect(body.priorityStyle).toBe("MOSCOW")
  })

  it("defaults to TERNARY priority in the submitted body", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: true })
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "X")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Y")
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.priorityStyle).toBe("TERNARY")
  })

  // ── Form submission — errors ─────────────────────────────────────────────────

  it("shows generic error message on non-ok response", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "X")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Y")
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() =>
      expect(screen.getByText(/an error occurred while creating the project/i)).toBeInTheDocument()
    )
  })

  it("shows 403 permission error message", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: false, status: 403 })
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "X")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Y")
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() =>
      expect(screen.getByText(/must be an admin/i)).toBeInTheDocument()
    )
  })

  it("shows network error message when fetch rejects", async () => {
    const user = userEvent.setup()
    mockFetch.mockRejectedValue(new Error("Network down"))
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "X")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Y")
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() =>
      expect(screen.getByText("Network down")).toBeInTheDocument()
    )
  })

  it("does NOT navigate to /home on error", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "X")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Y")
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() =>
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    )
    expect(mockNavigate).not.toHaveBeenCalledWith("/home")
  })

  // ── Loading state ────────────────────────────────────────────────────────────

  it("disables submit button while loading", async () => {
    const user = userEvent.setup()
    // Never resolves — keeps loading state
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderNewProject()

    await user.type(screen.getByPlaceholderText(/ir-board system/i), "X")
    await user.type(screen.getByPlaceholderText(/university of oviedo/i), "Y")
    await user.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /initialize project/i })).toBeDisabled()
    )
  })
})
