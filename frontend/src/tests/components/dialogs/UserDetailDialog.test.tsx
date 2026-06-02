import { render, screen, waitFor, fireEvent, within } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { UserDetailDialog } from "@/components/dialogs/UserDetailDialog"

// ─── mocks ───────────────────────────────────────────────────────────────────

vi.mock("react-router-dom", async () => {
    return {
        useNavigate: () => vi.fn(),
    }
})

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => ({ isAuthenticated: true }),
}))

const mockedUseBackendResource = vi.mocked(useBackendResource)

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: vi.fn(),
}))

import { useBackendResource } from "@/hooks/useBackendResource"

// ─── helpers ─────────────────────────────────────────────────────────────────

const baseUser = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "john@doe.com",
  active: true,
  isAdmin: true,
  projectsWhereUserIsManager: ["P1"],
  functionalitiesWhereUserIsEngineer: {
    P1: ["F1"],
  },
  functionalitiesWhereUserIsStakeholder: {
    P1: ["F2"],
  },
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("UserDetailDialog", () => {
  it("renders trigger button", () => {
    mockedUseBackendResource.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: ()=>{},
    })

    render(<UserDetailDialog userId={1} />)

    expect(screen.getByRole("button", { name: /view details/i })).toBeInTheDocument()
  })

  it("shows loading state", () => {
    mockedUseBackendResource.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: ()=>{},
    })

    render(<UserDetailDialog userId={1} />)

    const trigger = screen.getByRole("button", { name: /view details/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
  })

  it("renders error state", async () => {
    mockedUseBackendResource.mockReturnValue({
      data: null,
      loading: false,
      error: "Failed",
      refresh: ()=>{},
    })

    render(<UserDetailDialog userId={1} />)

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument()
    })
  })

  it("renders user data", async () => {
    mockedUseBackendResource.mockReturnValue({
      data: baseUser,
      loading: false,
      error: null,
      refresh: ()=>{},
    })

    render(<UserDetailDialog userId={1} />)

    fireEvent.click(screen.getByRole("button"))

    expect(await screen.findByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("john@doe.com")).toBeInTheDocument()

    // role badges
    expect(screen.getByText("Active")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()

    // counts
    expect(within(screen.getByText(/functionalities as engineer/i).closest("div")!).getByText("1")).toBeInTheDocument() // manager projects
    expect(screen.getAllByText("1").length).toBeGreaterThan(0)
  })

  it("renders empty states correctly", async () => {
    mockedUseBackendResource.mockReturnValue({
      data: {
        ...baseUser,
        projectsWhereUserIsManager: [],
        functionalitiesWhereUserIsEngineer: null,
        functionalitiesWhereUserIsStakeholder: null,
      },
      loading: false,
      error: null,
      refresh: ()=>{},
    })

    render(<UserDetailDialog userId={1} />)

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(
        screen.getByText(/not a manager on any project/i)
      ).toBeInTheDocument()
    })
  })
})