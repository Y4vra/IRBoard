import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { LinkUserToFunctionalityDialog } from "@/components/dialogs/userLinking/LinkUserToFunctionalityDialog"
import { useBackendResource, type UseBackendResourceResult } from "@/hooks/useBackendResource"
import type { ProjectUsersMap } from "@/components/dialogs/userLinking/LinkUserToProjectDialog"
import type { User } from "@/types/User"

vi.mock("@/hooks/useBackendResource")

const mockRefresh = vi.fn()

const baseUsers = {
  project_managers: [
    { id: 1, name: "PM", surname: "One", email: "pm@x.com" } as Partial<User>,
  ],
  requirement_engineers: [
    { id: 2, name: "Eng", surname: "One", email: "eng@x.com" } as Partial<User>,
  ],
  stakeholders: [
    { id: 3, name: "Stake", surname: "One", email: "st@x.com" } as Partial<User>,
  ],
  others: [
    { id: 4, name: "John", surname: "Doe", email: "john@x.com" } as Partial<User>,
  ],
}

const mockedUseBackendResource = vi.mocked(useBackendResource)

function setup() {
  mockedUseBackendResource.mockReturnValue({
    data: baseUsers,
    loading: false,
    error: null,
    refresh: mockRefresh,
  })

  const utils = render(
    <LinkUserToFunctionalityDialog
      projectId="123"
      functionalityId="456"
      canManage={true}
    />
  )

  return utils;
}

function openDialog(){
    fireEvent.click(screen.getByRole("button", { name: /manage team/i }))
}

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  })
})

describe("LinkUserToFunctionalityDialog", () => {
  it("renders trigger button", () => {
    setup()
    expect(screen.getByRole("button", { name: /manage team/i })).toBeInTheDocument()
  })

  it("shows loading state", () => {
    mockedUseBackendResource.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    } as UseBackendResourceResult<ProjectUsersMap>)

    render(
      <LinkUserToFunctionalityDialog
        projectId="123"
        functionalityId="456"
        canManage={true}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /manage team/i }))

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it("assigns engineer", async () => {
    setup()
    openDialog()

    const btn = screen.getByRole("button", { name: /engineer/i })

    fireEvent.click(btn)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/engineer"),
        expect.objectContaining({ method: "POST" })
      )
    })
  })

  it("assigns stakeholder", async () => {
    setup()
    openDialog();

    const btn = screen.getByRole("button", { name: /stakeholder/i })

    fireEvent.click(btn)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/stakeholder"),
        expect.objectContaining({ method: "POST" })
      )
    })
  })

  it("unlinks engineer", async () => {
    setup()
    openDialog();

    fireEvent.click(screen.getByRole("tab", { name: /current/i }))

    const removeBtns = screen.getAllByRole("button", {
      name: /engineer/i,
    })

    // second engineer button is in "current tab"
    fireEvent.click(removeBtns[0])

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/linking/123/456/engineer"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
        })
      )
    })
  })

  it("does not render when canManage=false", () => {
    mockedUseBackendResource.mockReturnValue({
      data: baseUsers,
      loading: false,
      error: null,
      refresh: mockRefresh,
    })

    render(
      <LinkUserToFunctionalityDialog
        projectId="123"
        functionalityId="456"
        canManage={false}
      />
    )

    expect(screen.queryByRole("button", { name: /manage team/i })).toBeNull()
  })
})