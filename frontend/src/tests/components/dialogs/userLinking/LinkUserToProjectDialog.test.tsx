import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  LinkUserToProjectDialog,
  type ProjectUsersMap,
} from "@/components/dialogs/userLinking/LinkUserToProjectDialog"
import { useBackendResource, type UseBackendResourceResult } from "@/hooks/useBackendResource"
import type { User } from "@/types/User"

vi.mock("@/hooks/useBackendResource")

const mockRefresh = vi.fn()
const mockedUseBackendResource = vi.mocked(useBackendResource)

const baseUsers = {
  managers: [
    {
      id: 1,
      name: "John",
      surname: "Manager",
      email: "john@company.com",
    } as Partial<User>,
  ],
  not_managers: [
    {
      id: 2,
      name: "Jane",
      surname: "User",
      email: "jane@company.com",
    } as Partial<User>,
  ],
}

describe("LinkUserToProjectDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setup(loading = false) {
    mockedUseBackendResource.mockReturnValue({
      data: loading ? null : baseUsers,
      loading,
      error: null,
      refresh: mockRefresh,
    } as UseBackendResourceResult<ProjectUsersMap>)

    render(<LinkUserToProjectDialog projectId="123" />)
  }
  
  function openDialog(){
    fireEvent.click(
      screen.getByRole("button", { name: /manage members/i })
    )
  }

  it("renders trigger button", () => {
    setup()

    expect(
      screen.getByRole("button", { name: /manage members/i })
    ).toBeInTheDocument()
  })

  it("shows loading state", () => {
    setup(true)
    openDialog()

    // your component uses LoadingSpinner, so don't search for "loading"
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("dialog").querySelector("svg")).toBeTruthy()
  })

  it("renders users correctly", () => {
    setup()
    openDialog()

    expect(screen.getByText("John Manager")).toBeInTheDocument()
    expect(screen.getByText("Jane User")).toBeInTheDocument()
  })

  it("links a user", async () => {
    setup()
    openDialog()

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    const addButton = screen.getByRole("button", { name: /add/i })

    fireEvent.click(addButton)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/linking/123"),
        expect.objectContaining({
          method: "POST",
        })
      )
    })
  })

  it("unlinks a user", async () => {
    setup()
    openDialog()

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    const removeButton = screen.getByRole("button", { name: /remove/i })

    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/linking/123/1"),
        expect.objectContaining({
          method: "DELETE",
        })
      )
    })
  })
})