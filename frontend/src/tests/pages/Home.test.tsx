import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import Home from "../../pages/Home"

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("../lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

vi.mock("@/hooks/useLocks", () => ({
  useLocks: () => ({
    getLock: () => null,
  }),
}))

vi.mock("@/components/LockIndicator", () => ({
  LockIndicator: () => null,
}))

vi.mock("@/components/badges/ProjectStateBadge", () => ({
  ProjectStateBadge: ({ state }: { state: string }) => (
    <span data-testid="state-badge">{state}</span>
  ),
}))

vi.mock("@/components/ViewToggle", () => ({
  ViewToggle: ({
    onChange,
  }: {
    onChange: (m: string) => void
  }) => (
    <div>
      <button onClick={() => onChange("active")} data-testid="toggle-active">
        Active
      </button>
      <button onClick={() => onChange("removed")} data-testid="toggle-removed">
        Removed
      </button>
    </div>
  ),
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProject(overrides: Partial<{
  id: string
  name: string
  description: string
  priorityStyle: string
  state: string
}> = {}) {
  return {
    id: overrides.id ?? "abcdef1234567890",
    name: overrides.name ?? "Test Project",
    description: overrides.description ?? "A description",
    priorityStyle: overrides.priorityStyle ?? "TERNARY",
    state: overrides.state ?? "ACTIVE",
  }
}

function makeProjects(n: number) {
  return Array.from({ length: n }, (_, i) =>
    makeProject({
      id: `id${String(i).padStart(14, "0")}`,
      name: `Project ${String.fromCharCode(65 + (i % 26))}${i}`,
    })
  )
}

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = { isAdmin: false }
    mockAuthContext.isAuthenticated = true
    mockAuthContext.loading = false
    vi.stubGlobal("fetch", mockFetch)
  })

  // ── Loading ─────────────────────────────────────────────────────────────────

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

  // ── Error ───────────────────────────────────────────────────────────────────

  it("shows error UI when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/whoops! something went wrong/i)).toBeInTheDocument()
    )
  })

  it("shows API error message", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    renderHome()
    await waitFor(() =>
      expect(screen.getByText("Network error")).toBeInTheDocument()
    )
  })

  it("shows retry button on error", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
    )
  })

  it("shows auth failure error when not authenticated", async () => {
    mockAuthContext.isAuthenticated = false
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/enviroment variable/i)).toBeInTheDocument()
    )
  })

  // ── Empty state ─────────────────────────────────────────────────────────────

  it("shows empty state when no projects exist", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
    )
  })

  it("shows admin CTA when empty and admin", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/create your first project/i)).toBeInTheDocument()
    )
  })

  it("shows contact admin when empty and not admin", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/contact an administrator/i)).toBeInTheDocument()
    )
  })

  // ── Data rendering ──────────────────────────────────────────────────────────

  it("renders project names", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ name: "IR-Board" })],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText("IR-Board")).toBeInTheDocument()
    )
  })

  it("renders priority styles", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ priorityStyle: "MOSCOW" })],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText("MOSCOW")).toBeInTheDocument()
    )
  })

  it("shows fallback description when description is empty", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ description: "" })],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/no description provided/i)).toBeInTheDocument()
    )
  })

  it("renders the project description when present", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ description: "My project description" })],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText("My project description")).toBeInTheDocument()
    )
  })

  it("renders a 'More...' link pointing to the correct project route", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ id: "abc123" })],
    })
    renderHome()
    await waitFor(() => {
      const link = screen.getByRole("link", { name: /more/i })
      expect(link).toHaveAttribute("href", "/project/abc123")
    })
  })

  it("renders state badge for each project", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ state: "INACTIVE" })],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByTestId("state-badge")).toHaveTextContent("INACTIVE")
    )
  })

  // ── Header ──────────────────────────────────────────────────────────────────

  it("renders page title", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^projects$/i, level: 1 })).toBeInTheDocument()
    )
  })

  it("does NOT show ViewToggle for non-admin users", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() =>
      expect(screen.queryByTestId("toggle-active")).not.toBeInTheDocument()
    )
  })

  it("shows ViewToggle for admin users", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    renderHome()
    await waitFor(() =>
      expect(screen.getByTestId("toggle-active")).toBeInTheDocument()
    )
  })

  it("shows 'New Project' button for admin with projects", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject()],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /new project/i })).toBeInTheDocument()
    )
  })

  it("does NOT show 'New Project' button for non-admin", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject()],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: /new project/i })).not.toBeInTheDocument()
    )
  })

  // ── Search ──────────────────────────────────────────────────────────────────

  it("filters projects by name search", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Alpha Project" }),
        makeProject({ id: "2", name: "Beta Project" }),
      ],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Alpha Project")).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search/i), "Alpha")

    expect(screen.getByText("Alpha Project")).toBeInTheDocument()
    expect(screen.queryByText("Beta Project")).not.toBeInTheDocument()
  })

  it("filters projects by description search", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Proj A", description: "unique-keyword" }),
        makeProject({ id: "2", name: "Proj B", description: "other stuff" }),
      ],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Proj A")).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search/i), "unique-keyword")

    expect(screen.getByText("Proj A")).toBeInTheDocument()
    expect(screen.queryByText("Proj B")).not.toBeInTheDocument()
  })

  it("search is case-insensitive", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ name: "AlPhA" })],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("AlPhA")).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search/i), "alpha")
    expect(screen.getByText("AlPhA")).toBeInTheDocument()
  })

  it("shows 'No matches' empty state when search has no results", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ name: "Alpha" })],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search/i), "zzznomatch")
    expect(screen.getByText(/no matches/i)).toBeInTheDocument()
  })

  it("clears search when X button is clicked", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ name: "Alpha" })],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument())

    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, "zzz")
    expect(screen.getByText(/no matches/i)).toBeInTheDocument()

    // The clear button appears when search is non-empty; click it
    const clearBtn = input.parentElement!.querySelector("button")!
    await user.click(clearBtn)
    expect(screen.getByText("Alpha")).toBeInTheDocument()
  })

  it("shows match count when search is active", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Alpha" }),
        makeProject({ id: "2", name: "Beta" }),
      ],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search/i), "Alpha")
    expect(screen.getByText(/1 of 2 project/i)).toBeInTheDocument()
  })

  // ── Filter chips ─────────────────────────────────────────────────────────────

  it("shows state filter chips when multiple states exist", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", state: "ACTIVE" }),
        makeProject({ id: "2", state: "INACTIVE" }),
      ],
    })
    renderHome()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "active" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "inactive" })).toBeInTheDocument()
    })
  })

  it("does NOT show state chips when all projects share the same state", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", state: "ACTIVE" }),
        makeProject({ id: "2", state: "ACTIVE" }),
      ],
    })
    renderHome()
    await waitFor(() => expect(screen.getAllByText("Test Project")).toHaveLength(2))
    // Only one unique state → no chips rendered
    expect(screen.queryByRole("button", { name: "active" })).not.toBeInTheDocument()
  })

  it("filters by state chip", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Active One", state: "ACTIVE" }),
        makeProject({ id: "2", name: "Inactive One", state: "INACTIVE" }),
      ],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "active" })).toBeInTheDocument()
    )

    await user.click(screen.getByRole("button", { name: "active" }))

    expect(screen.getByText("Active One")).toBeInTheDocument()
    expect(screen.queryByText("Inactive One")).not.toBeInTheDocument()
  })

  it("shows priority filter chips when multiple priorities exist", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", priorityStyle: "MOSCOW" }),
        makeProject({ id: "2", priorityStyle: "TERNARY" }),
      ],
    })
    renderHome()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "MOSCOW" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "TERNARY" })).toBeInTheDocument()
    })
  })

  it("filters by priority chip", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Moscow Project", priorityStyle: "MOSCOW" }),
        makeProject({ id: "2", name: "Ternary Project", priorityStyle: "TERNARY" }),
      ],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "MOSCOW" })).toBeInTheDocument()
    )

    await user.click(screen.getByRole("button", { name: "MOSCOW" }))

    expect(screen.getByText("Moscow Project")).toBeInTheDocument()
    expect(screen.queryByText("Ternary Project")).not.toBeInTheDocument()
  })

  it("'Clear all' button removes active filters", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Active One", state: "ACTIVE" }),
        makeProject({ id: "2", name: "Inactive One", state: "INACTIVE" }),
      ],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "active" })).toBeInTheDocument()
    )

    await user.click(screen.getByRole("button", { name: "active" }))
    expect(screen.queryByText("Inactive One")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /clear all/i }))
    expect(screen.getByText("Inactive One")).toBeInTheDocument()
  })

  it("'Clear filters' button in the no-match empty state resets filters", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject({ name: "Alpha" })],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search/i), "zzznomatch")
    expect(screen.getByText(/no matches/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /clear filters/i }))
    expect(screen.getByText("Alpha")).toBeInTheDocument()
  })

  // ── Sorting ──────────────────────────────────────────────────────────────────

  it("sorts projects by name A→Z by default", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "2", name: "Zebra" }),
        makeProject({ id: "1", name: "Apple" }),
      ],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Apple")).toBeInTheDocument())

    const cards = screen.getAllByText(/Apple|Zebra/)
    expect(cards[0]).toHaveTextContent("Apple")
    expect(cards[1]).toHaveTextContent("Zebra")
  })

  it("sorts projects by name Z→A when selected", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Apple" }),
        makeProject({ id: "2", name: "Zebra" }),
      ],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Apple")).toBeInTheDocument())

    await user.selectOptions(screen.getByRole("combobox"), "name_desc")

    const cards = screen.getAllByText(/Apple|Zebra/)
    expect(cards[0]).toHaveTextContent("Zebra")
    expect(cards[1]).toHaveTextContent("Apple")
  })

  it("sorts projects by state when selected", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1", name: "Proj B", state: "INACTIVE" }),
        makeProject({ id: "2", name: "Proj A", state: "ACTIVE" }),
      ],
    })
    renderHome()
    await waitFor(() => expect(screen.getByText("Proj A")).toBeInTheDocument())

    await user.selectOptions(screen.getByRole("combobox"), "state")

    // ACTIVE < INACTIVE alphabetically
    const titles = screen.getAllByText(/Proj A|Proj B/)
    expect(titles[0]).toHaveTextContent("Proj A")
  })

  // ── Pagination ───────────────────────────────────────────────────────────────

  it("does NOT show pagination when project count is at or below threshold", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => makeProjects(12),
    })
    renderHome()
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /prev/i })).not.toBeInTheDocument()
    )
  })

  it("shows pagination when there are more than 12 projects", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => makeProjects(13),
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /prev/i })).toBeInTheDocument()
    )
  })

  it("prev button is disabled on first page", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => makeProjects(13),
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled()
    )
  })

  it("next button is disabled on last page", async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => makeProjects(13),
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument()
    )
    await user.click(screen.getByRole("button", { name: /next/i }))
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled()
  })

  it("navigates to next page on Next click", async () => {
    const user = userEvent.setup()
    const projects = makeProjects(13)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => projects,
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument()
    )

    // Page 1: first project visible
    expect(screen.getByText(projects[0].name)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /next/i }))

    // Page 2: 13th project visible, 1st is not
    expect(screen.getByText(projects[12].name)).toBeInTheDocument()
    expect(screen.queryByText(projects[0].name)).not.toBeInTheDocument()
  })

  it("resets to page 1 when search changes", async () => {
    const user = userEvent.setup()
    const projects = makeProjects(25)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => projects,
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument()
    )

    await user.click(screen.getByRole("button", { name: /next/i }))
    expect(screen.getByText(/page 2/i)).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(/search/i), "Project")
    expect(screen.getByText(/page 1/i)).toBeInTheDocument()
  })

  it("shows page count in result summary", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => makeProjects(25),
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/page 1 of/i)).toBeInTheDocument()
    )
  })

  // ── Removed view mode ────────────────────────────────────────────────────────

  it("shows removed-projects banner when in removed mode", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })         // active
      .mockResolvedValueOnce({ ok: true, json: async () => [] })         // removed

    const user = userEvent.setup()
    renderHome()
    await waitFor(() => expect(screen.getByTestId("toggle-removed")).toBeInTheDocument())

    await user.click(screen.getByTestId("toggle-removed"))
    await waitFor(() =>
      expect(screen.getByText(/these projects have been removed/i)).toBeInTheDocument()
    )
  })

  it("shows empty state for removed view when no removed projects", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })

    const user = userEvent.setup()
    renderHome()
    await waitFor(() => expect(screen.getByTestId("toggle-removed")).toBeInTheDocument())

    await user.click(screen.getByTestId("toggle-removed"))
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /no removed projects/i })).toBeInTheDocument()
    )
  })

  it("fetches and renders removed projects", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeProject({ id: "r1", name: "Removed Project X" })],
      })

    const user = userEvent.setup()
    renderHome()
    await waitFor(() => expect(screen.getByTestId("toggle-removed")).toBeInTheDocument())

    await user.click(screen.getByTestId("toggle-removed"))
    await waitFor(() =>
      expect(screen.getByText("Removed Project X")).toBeInTheDocument()
    )
  })

  it("does NOT show 'New Project' button in removed mode", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeProject({ id: "a1", name: "Active One" })],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeProject({ id: "r1", name: "Removed One" })],
      })

    const user = userEvent.setup()
    renderHome()
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /new project/i })).toBeInTheDocument()
    )

    await user.click(screen.getByTestId("toggle-removed"))
    await waitFor(() => expect(screen.getByText("Removed One")).toBeInTheDocument())
    expect(screen.queryByRole("link", { name: /new project/i })).not.toBeInTheDocument()
  })

  it("fetches removed projects only once (lazy)", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })

    const user = userEvent.setup()
    renderHome()
    await waitFor(() => expect(screen.getByTestId("toggle-removed")).toBeInTheDocument())

    await user.click(screen.getByTestId("toggle-removed"))
    await waitFor(() => expect(screen.getByRole("heading", { name: /no removed projects/i })).toBeInTheDocument())

    // Switch back and forth; removed fetch should NOT fire again
    await user.click(screen.getByTestId("toggle-active"))
    await user.click(screen.getByTestId("toggle-removed"))

    // fetch called: once for active, once for removed — total 2
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it("resets filters when switching view modes", async () => {
    mockAuthContext.user = { isAdmin: true }
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeProject({ id: "1", name: "Active One" })],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })

    const user = userEvent.setup()
    renderHome()
    await waitFor(() => expect(screen.getByText("Active One")).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search/i), "something")
    expect(screen.getByDisplayValue("something")).toBeInTheDocument()

    await user.click(screen.getByTestId("toggle-removed"))
    await waitFor(() => expect(screen.getByRole("heading", { name: /no removed projects/i })).toBeInTheDocument())

    // input should be cleared
    expect(screen.queryByDisplayValue("something")).not.toBeInTheDocument()
  })

  // ── Project count label ──────────────────────────────────────────────────────

  it("shows singular 'project' label for a single project", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [makeProject()],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/^1 project$/)).toBeInTheDocument()
    )
  })

  it("shows plural 'projects' label for multiple projects", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        makeProject({ id: "1" }),
        makeProject({ id: "2" }),
      ],
    })
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/^2 projects$/)).toBeInTheDocument()
    )
  })
})