import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import EditProject from "@/pages/Project/EditProject"

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("../lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text ?? "Loading..."}</div>
  ),
}))

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))

const PROJECT_ID = "proj-abc-123"

const mockProject = {
  id: PROJECT_ID,
  name: "IR-Board",
  description: "A requirements management system",
  priorityStyle: "TERNARY",
  state: "ACTIVE",
}

// Helpers
function makeOkJson(data: unknown) {
  return { ok: true, json: async () => data, status: 200 }
}

function renderEditProject(projectId = PROJECT_ID) {
  return render(
    <MemoryRouter initialEntries={[`/project/${projectId}/edit`]}>
      <Routes>
        <Route path="/project/:projectId/edit" element={<EditProject />} />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("EditProject", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", mockFetch)
  })

  // ── Loading ──────────────────────────────────────────────────────────────────

  it("shows loading spinner while fetching project", () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderEditProject()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error states ─────────────────────────────────────────────────────────────

  it("shows error UI when project fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByText(/could not load project/i)).toBeInTheDocument()
    )
  })

  it("shows 'Back to Projects' link on project fetch error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /back to projects/i })).toBeInTheDocument()
    )
  })

  // ── Rendering after load ─────────────────────────────────────────────────────

  it("renders the 'Edit Project' heading", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))  // GET project
      .mockResolvedValueOnce({ ok: true, status: 200 }) // requestEdit lock
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /edit project/i, level: 1 })).toBeInTheDocument()
    )
  })

  it("prefills the name input with the project name", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByDisplayValue("IR-Board")).toBeInTheDocument()
    )
  })

  it("prefills the description textarea with the project description", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByDisplayValue("A requirements management system")).toBeInTheDocument()
    )
  })

  it("shows the project name in the lock info paragraph", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByText(/IR-Board/)).toBeInTheDocument()
    )
  })

  it("renders save changes button", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument()
    )
  })

  it("renders cancel button", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    )
  })

  // ── Lock request behaviour ────────────────────────────────────────────────────

  it("navigates to /error with 'permission' type on 409 lock response", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: false, status: 409 })
    renderEditProject()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "permission" }) })
      )
    )
  })

  it("navigates to /error with 'server' type on non-ok lock response", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: false, status: 500 })
    renderEditProject()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "server" }) })
      )
    )
  })

  it("navigates to /error with 'server' type when lock request throws", async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockRejectedValueOnce(new Error("Network error"))
    renderEditProject()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "server" }) })
      )
    )
  })

  // ── Navigation ───────────────────────────────────────────────────────────────

  it("navigates back to project on cancel", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() => expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}`)
  })

  it("navigates back to project via back button", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() => expect(screen.getByRole("button", { name: /back to project/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /back to project/i }))
    expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}`)
  })

  // ── Form submission — success ────────────────────────────────────────────────

  it("submits PATCH to /projects/:id/modify and navigates to project on success", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))   // GET project
      .mockResolvedValueOnce({ ok: true })              // requestEdit
      .mockResolvedValueOnce({ ok: true })              // PATCH modify
    renderEditProject()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}`)
    )

    const patchCall = mockFetch.mock.calls.find(([url]: [string]) => url.includes("/modify"))
    expect(patchCall).toBeDefined()
    expect(patchCall[1].method).toBe("PATCH")
  })

  it("sends updated name and description in the PATCH body", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
    renderEditProject()
    await waitFor(() => expect(screen.getByDisplayValue("IR-Board")).toBeInTheDocument())

    const nameInput = screen.getByDisplayValue("IR-Board")
    await user.clear(nameInput)
    await user.type(nameInput, "Updated Name")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}`))

    const patchCall = mockFetch.mock.calls.find(([url]: [string]) => url.includes("/modify"))
    const body = JSON.parse(patchCall[1].body)
    expect(body.name).toBe("Updated Name")
  })

  // ── Form submission — errors ──────────────────────────────────────────────────

  it("shows generic error on non-ok PATCH response", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 500 })
    renderEditProject()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/an error occurred while saving/i)).toBeInTheDocument()
    )
  })

  it("shows 403 permission error on PATCH", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 403 })
    renderEditProject()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/do not have permission/i)).toBeInTheDocument()
    )
  })

  it("shows 409 conflict error on PATCH", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 409 })
    renderEditProject()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/being edited by another user/i)).toBeInTheDocument()
    )
  })

  it("disables save button while submitting", async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(makeOkJson(mockProject))
      .mockResolvedValueOnce({ ok: true })
      .mockReturnValueOnce(new Promise(() => {})) // PATCH never resolves
    renderEditProject()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled()
    )
  })
})
