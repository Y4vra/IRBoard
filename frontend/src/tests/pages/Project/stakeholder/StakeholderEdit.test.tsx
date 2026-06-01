import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import StakeholderEdit from "@/pages/Project/stakeholder/StakeholderEdit"

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

// useBackendResource controls the stakeholder GET; direct fetch handles lock + PATCH
const mockBackendResource = {
  data: null as unknown,
  loading: false,
  error: null as string | null,
  refresh: vi.fn(),
}

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: () => mockBackendResource,
}))

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const STAKEHOLDER_ID = "1"
const PROJECT_ID = "proj-abc"

const mockStakeholder = {
  id: 1,
  name: "Product Owner",
  description: "Drives the product vision",
  state: "ACTIVE",
  entityIdentifier: "STK-001",
  observers: [],
}

function renderEdit(projectId = PROJECT_ID, stakeholderId = STAKEHOLDER_ID) {
  return render(
    <MemoryRouter initialEntries={[`/project/${projectId}/stakeholders/${stakeholderId}/edit`]}>
      <Routes>
        <Route
          path="/project/:projectId/stakeholders/:stakeholderId/edit"
          element={<StakeholderEdit />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StakeholderEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", mockFetch)
    Object.assign(mockBackendResource, {
      data: null,
      loading: false,
      error: null,
      refresh: vi.fn(),
    })
  })

  // ── Loading ──────────────────────────────────────────────────────────────────

  it("shows loading spinner while fetching stakeholder", () => {
    mockBackendResource.loading = true
    renderEdit()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error states ─────────────────────────────────────────────────────────────

  it("shows error UI when stakeholder fetch fails", () => {
    mockBackendResource.error = "Failed to fetch stakeholder details"
    renderEdit()
    expect(screen.getByText(/could not load stakeholder/i)).toBeInTheDocument()
  })

  it("shows 'Back to Stakeholders' link on error", () => {
    mockBackendResource.error = "Failed to fetch stakeholder details"
    renderEdit()
    expect(screen.getByRole("link", { name: /back to stakeholders/i })).toBeInTheDocument()
  })

  // ── Rendering after load ─────────────────────────────────────────────────────

  it("renders the 'Edit Stakeholder' heading", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /edit stakeholder/i, level: 1 })).toBeInTheDocument()
    )
  })

  it("prefills the name input with the stakeholder name", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByDisplayValue("Product Owner")).toBeInTheDocument()
    )
  })

  it("prefills the description textarea with the stakeholder description", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByDisplayValue("Drives the product vision")).toBeInTheDocument()
    )
  })

  it("shows the stakeholder name in the lock info paragraph", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true })
    renderEdit()
    // Name is in a <span> inside the paragraph — match the span's own text node
    await waitFor(() =>
      expect(screen.getByText("Product Owner")).toBeInTheDocument()
    )
  })

  it("renders 'Save Changes' button", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument()
    )
  })

  it("renders 'Cancel' button", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    )
  })

  // ── Lock request behaviour ────────────────────────────────────────────────────

  it("navigates to /error with 'permission' type on 409 lock response", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: false, status: 409 })
    renderEdit()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "permission" }) })
      )
    )
  })

  it("navigates to /error with 'server' type on non-ok lock response", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    renderEdit()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "server" }) })
      )
    )
  })

  it("navigates to /error with 'server' type when lock request throws", async () => {
    mockBackendResource.data = mockStakeholder
    mockFetch.mockRejectedValue(new Error("Network error"))
    renderEdit()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "server" }) })
      )
    )
  })

  // ── Navigation ───────────────────────────────────────────────────────────────

  it("navigates back to stakeholder detail on cancel", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true })
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      `/project/${PROJECT_ID}/stakeholders/${STAKEHOLDER_ID}`
    )
  })

  it("navigates back to stakeholder via back button", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch.mockResolvedValue({ ok: true })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /back to stakeholder/i })).toBeInTheDocument()
    )

    await user.click(screen.getByRole("button", { name: /back to stakeholder/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      `/project/${PROJECT_ID}/stakeholders/${STAKEHOLDER_ID}`
    )
  })

  // ── Form submission — success ────────────────────────────────────────────────

  it("submits PATCH to /stakeholders/:id/modify and navigates on success", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch
      .mockResolvedValueOnce({ ok: true })  // requestEdit
      .mockResolvedValueOnce({ ok: true })  // PATCH modify
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        `/project/${PROJECT_ID}/stakeholders/${STAKEHOLDER_ID}`
      )
    )

    const patchCall = mockFetch.mock.calls.find(([url]) => url.includes("/modify"))
    expect(patchCall).toBeDefined()
    expect(patchCall![1].method).toBe("PATCH")
  })

  it("sends updated name in the PATCH body", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
    renderEdit()
    await waitFor(() => expect(screen.getByDisplayValue("Product Owner")).toBeInTheDocument())

    const nameInput = screen.getByDisplayValue("Product Owner")
    await user.clear(nameInput)
    await user.type(nameInput, "Tech Lead")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        `/project/${PROJECT_ID}/stakeholders/${STAKEHOLDER_ID}`
      )
    )

    const patchCall = mockFetch.mock.calls.find(([url]) => url.includes("/modify"))
    const body = JSON.parse(patchCall![1].body)
    expect(body.name).toBe("Tech Lead")
  })

  // ── Form submission — errors ──────────────────────────────────────────────────

  it("shows generic error on non-ok PATCH response", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 500 })
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/an error occurred while saving the stakeholder/i)).toBeInTheDocument()
    )
  })

  it("shows 403 permission error on PATCH", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 403 })
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/do not have permission/i)).toBeInTheDocument()
    )
  })

  it("shows 409 conflict error on PATCH", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 409 })
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/being edited by another user/i)).toBeInTheDocument()
    )
  })

  it("disables save button while submitting", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockStakeholder
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockReturnValueOnce(new Promise(() => {})) // PATCH never resolves
    const { container } = renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    // Spinner replaces text — button loses accessible name; query by type=submit
    await waitFor(() =>
      expect(container.querySelector("button[type='submit']")).toBeDisabled()
    )
  })
})