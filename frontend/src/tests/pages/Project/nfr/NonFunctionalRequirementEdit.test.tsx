import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import NonFunctionalRequirementEdit from "@/pages/Project/nfr/NonFunctionalRequirementEdit"

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

// useBackendResource controls the NFR GET; direct fetch handles lock + PATCH
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

const PROJECT_ID = "proj-abc"
const NFR_ID = "5"

const mockNFR = {
  id: 5,
  name: "Response Time",
  description: "Must respond within 200ms",
  state: "ACTIVE",
  entityIdentifier: "NFR-005",
  measurementUnit: "ms",
  operator: "LESS_THAN_OR_EQUAL_TO",
  thresholdValue: 200,
  targetValue: 150,
  actualValue: 180,
  orderValue: 1,
  children: [],
}

function renderEdit(projectId = PROJECT_ID, nfrId = NFR_ID) {
  return render(
    <MemoryRouter initialEntries={[`/project/${projectId}/nfr/${nfrId}/edit`]}>
      <Routes>
        <Route
          path="/project/:projectId/nfr/:nfrId/edit"
          element={<NonFunctionalRequirementEdit />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("NonFunctionalRequirementEdit", () => {
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

  it("shows loading spinner while fetching requirement", () => {
    mockBackendResource.loading = true
    renderEdit()
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  // ── Error states ─────────────────────────────────────────────────────────────

  it("shows error UI when requirement fetch fails", () => {
    mockBackendResource.error = "Failed to fetch non-functional requirement"
    renderEdit()
    expect(screen.getByText(/could not load non-functional requirement/i)).toBeInTheDocument()
  })

  it("shows 'Back to Requirements' link on error", () => {
    mockBackendResource.error = "Failed"
    renderEdit()
    expect(screen.getByRole("link", { name: /back to requirements/i })).toBeInTheDocument()
  })

  // ── Rendering after load ─────────────────────────────────────────────────────

  it("renders the 'Edit Non-Functional Requirement' heading", async () => {
    mockBackendResource.data = mockNFR
    // Lock returns 200 with empty body → granted
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /edit non-functional requirement/i, level: 1 })
      ).toBeInTheDocument()
    )
  })

  it("prefills the name input", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByDisplayValue("Response Time")).toBeInTheDocument()
    )
  })

  it("prefills the description textarea", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByDisplayValue("Must respond within 200ms")).toBeInTheDocument()
    )
  })

  it("prefills the measurement unit input", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByDisplayValue("ms")).toBeInTheDocument()
    )
  })

  it("prefills numeric threshold value", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByDisplayValue("200")).toBeInTheDocument()
    )
  })

  it("shows the requirement name in the lock info paragraph", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    // Name lives in a <span> inside the paragraph — match exact span text
    await waitFor(() =>
      expect(screen.getByText("Response Time")).toBeInTheDocument()
    )
  })

  it("renders 'Save Changes' button", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument()
    )
  })

  it("renders 'Cancel' button", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    )
  })

  it("renders 'Back to requirement' back button", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /back to requirement/i })).toBeInTheDocument()
    )
  })

  it("renders the comparison operator select with correct default", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() => {
      const select = screen.getByRole("combobox")
      expect(select).toHaveValue("LESS_THAN_OR_EQUAL_TO")
    })
  })

  // ── Lock request behaviour ────────────────────────────────────────────────────

  it("navigates to /error with 'permission' when lock returns false body", async () => {
    mockBackendResource.data = mockNFR
    // Server returns 200 but body is "false" → not granted
    mockFetch.mockResolvedValue({ ok: true, text: async () => "false" })
    renderEdit()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "permission" }) })
      )
    )
  })

  it("navigates to /error with 'server' when lock request throws", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockRejectedValue(new Error("Network error"))
    renderEdit()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "server" }) })
      )
    )
  })

  it("navigates to /error with 'server' when lock response is not ok", async () => {
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: false, status: 500, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/error",
        expect.objectContaining({ state: expect.objectContaining({ errorType: "server" }) })
      )
    )
  })

  // ── Navigation ───────────────────────────────────────────────────────────────

  it("navigates back to NFR detail on cancel", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}/nfr/${NFR_ID}`)
  })

  it("navigates back to NFR detail via back button", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockNFR
    mockFetch.mockResolvedValue({ ok: true, text: async () => "" })
    renderEdit()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /back to requirement/i })).toBeInTheDocument()
    )
    await user.click(screen.getByRole("button", { name: /back to requirement/i }))
    expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}/nfr/${NFR_ID}`)
  })

  // ── Form submission — success ────────────────────────────────────────────────

  it("submits PATCH to /nonFunctionalRequirements/:id/modify and navigates on success", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockNFR
    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => "" })  // requestEdit
      .mockResolvedValueOnce({ ok: true })                         // PATCH modify
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}/nfr/${NFR_ID}`)
    )

    const patchCall = mockFetch.mock.calls.find(([url]) => url.includes("/modify"))
    expect(patchCall).toBeDefined()
    expect(patchCall![1].method).toBe("PATCH")
  })

  it("sends updated name in the PATCH body", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockNFR
    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => "" })
      .mockResolvedValueOnce({ ok: true })
    renderEdit()
    await waitFor(() => expect(screen.getByDisplayValue("Response Time")).toBeInTheDocument())

    const nameInput = screen.getByDisplayValue("Response Time")
    await user.clear(nameInput)
    await user.type(nameInput, "Availability")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/project/${PROJECT_ID}/nfr/${NFR_ID}`)
    )

    const patchCall = mockFetch.mock.calls.find(([url]) => url.includes("/modify"))
    const body = JSON.parse(patchCall![1].body)
    expect(body.name).toBe("Availability")
  })

  // ── Form submission — errors ──────────────────────────────────────────────────

  it("shows generic error on non-ok PATCH response", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockNFR
    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => "" })
      .mockResolvedValueOnce({ ok: false, status: 500 })
    renderEdit()
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(screen.getByText(/an error occurred while saving the requirement/i)).toBeInTheDocument()
    )
  })

  it("shows 403 permission error on PATCH", async () => {
    const user = userEvent.setup()
    mockBackendResource.data = mockNFR
    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => "" })
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
    mockBackendResource.data = mockNFR
    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => "" })
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
    mockBackendResource.data = mockNFR
    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => "" })
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