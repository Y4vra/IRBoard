import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import NewProject from "../pages/Project/NewProject"

const { mockNavigate, mockFetch } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockFetch: vi.fn(),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderNewProject() {
  return render(
    <MemoryRouter>
      <NewProject />
    </MemoryRouter>
  )
}

describe("NewProject", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", mockFetch)
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Create New Project heading", () => {
    renderNewProject()
    expect(screen.getByRole("heading", { name: /create new project/i })).toBeInTheDocument()
  })

  it("renders Project Name, Client and Description inputs", () => {
    renderNewProject()
    expect(screen.getByPlaceholderText(/ir-board system/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/university of oviedo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/brief overview/i)).toBeInTheDocument()
  })

  it("renders Ternary and MoSCoW priority strategy buttons", () => {
    renderNewProject()
    expect(screen.getByRole("button", { name: /ternary/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /moscow/i })).toBeInTheDocument()
  })

  it("defaults to TERNARY priority style", () => {
    renderNewProject()
    const ternaryBtn = screen.getByRole("button", { name: /ternary/i })
    expect(ternaryBtn.className).toContain("bg-primary")
  })

  it("renders Initialize Project and Cancel buttons", () => {
    renderNewProject()
    expect(screen.getByRole("button", { name: /initialize project/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  // ── Navigation ─────────────────────────────────────────────────────────────

  it("Cancel button navigates to /projects", () => {
    renderNewProject()
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/projects")
  })

  it("Back button calls navigate(-1)", () => {
    renderNewProject()
    fireEvent.click(screen.getByText(/back to projects/i))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  // ── Priority style toggle ──────────────────────────────────────────────────

  it("switches to MOSCOW when clicked", () => {
    renderNewProject()
    fireEvent.click(screen.getByRole("button", { name: /moscow/i }))
    expect(screen.getByRole("button", { name: /moscow/i }).className).toContain("bg-primary")
  })

  it("switches back to TERNARY from MOSCOW", () => {
    renderNewProject()
    fireEvent.click(screen.getByRole("button", { name: /moscow/i }))
    fireEvent.click(screen.getByRole("button", { name: /ternary/i }))
    expect(screen.getByRole("button", { name: /ternary/i }).className).toContain("bg-primary")
  })

  // ── Successful submit ──────────────────────────────────────────────────────

  it("sends POST to /projects/new with correct payload", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    renderNewProject()

    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    await userEvent.type(screen.getByPlaceholderText(/brief overview/i), "A great project")
    fireEvent.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.irboard.local/v1/projects/new",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "My Project",
            description: "A great project",
            client: "UNIOVI",
            priorityStyle: "TERNARY",
          }),
        })
      )
    })
  })

  it("navigates to /projects on success", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    renderNewProject()

    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    fireEvent.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/projects")
    })
  })

  it("sends MOSCOW priority style when selected", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    renderNewProject()

    fireEvent.click(screen.getByRole("button", { name: /moscow/i }))
    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    fireEvent.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => {
      const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
      expect(body.priorityStyle).toBe("MOSCOW")
    })
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  it("disables the submit button while loading", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderNewProject()

    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    
    const submitBtn = screen.getByRole("button", { name: /initialize project/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
    })
  })

  // ── Error states ───────────────────────────────────────────────────────────

  it("shows 403 error message when server returns forbidden", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 })
    renderNewProject()

    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    fireEvent.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => {
      expect(screen.getByText(/you must be an admin/i)).toBeInTheDocument()
    })
  })

  it("shows generic error message on non-403 failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    renderNewProject()

    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    fireEvent.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => {
      expect(screen.getByText(/an error occurred while creating the project/i)).toBeInTheDocument()
    })
  })

  it("shows error when fetch rejects", async () => {
    mockFetch.mockRejectedValue(new Error("Network down"))
    renderNewProject()

    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    fireEvent.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => {
      expect(screen.getByText("Network down")).toBeInTheDocument()
    })
  })

  it("re-enables the submit button after error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    renderNewProject()

    await userEvent.type(screen.getByPlaceholderText(/ir-board system/i), "My Project")
    await userEvent.type(screen.getByPlaceholderText(/university of oviedo/i), "UNIOVI")
    fireEvent.click(screen.getByRole("button", { name: /initialize project/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /initialize project/i })).not.toBeDisabled()
    })
  })
})
