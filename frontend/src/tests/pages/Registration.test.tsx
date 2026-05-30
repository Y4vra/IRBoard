import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import Registration from "../../pages/Registration"

/* ─────────────────────────────────────────────────────────────
   Mocks
───────────────────────────────────────────────────────────── */

const {
  mockCreateBrowserLoginFlow,
  mockUpdateLoginFlow,
  mockNavigate,
  mockAuthContext,
  mockFetch,
} = vi.hoisted(() => ({
  mockCreateBrowserLoginFlow: vi.fn(),
  mockUpdateLoginFlow: vi.fn(),
  mockNavigate: vi.fn(),
  mockCheckSession: vi.fn(),
  mockAuthContext: {
    isAuthenticated: false,
    loading: false,
    checkSession: vi.fn(),
  },
  mockFetch: vi.fn(),
}))

vi.mock("@/lib/kratos", () => ({
  kratos: {
    createBrowserLoginFlow: mockCreateBrowserLoginFlow,
    updateLoginFlow: mockUpdateLoginFlow,
  },
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

vi.mock("@/lib/globalVars", () => ({
  API_BASE_URL: "http://api.irboard.local/v1",
}))

/* ─────────────────────────────────────────────────────────────
   Test setup
───────────────────────────────────────────────────────────── */

const FLOW_ID = "reg-flow-id"
const CSRF_TOKEN = "reg-csrf-token"

const mockFlowData = {
  id: FLOW_ID,
  ui: {
    nodes: [
      {
        attributes: {
          name: "csrf_token",
          value: CSRF_TOKEN,
        },
      },
    ],
  },
}

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Registration />
    </MemoryRouter>
  )
}

/* ─────────────────────────────────────────────────────────────
   Tests
───────────────────────────────────────────────────────────── */

describe("Registration", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockAuthContext.isAuthenticated = false
    mockAuthContext.loading = false

    vi.stubGlobal("fetch", mockFetch)

    mockCreateBrowserLoginFlow.mockResolvedValue({
      data: mockFlowData,
    })

    mockUpdateLoginFlow.mockResolvedValue(undefined)

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
  })

  /* ── Rendering ─────────────────────────────────────────── */

  it("renders the Account Activation title", () => {
    renderRegistration()
    expect(screen.getByText("Account Activation")).toBeInTheDocument()
  })

  it("renders all form inputs", () => {
    renderRegistration()

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/security code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it("renders submit button", () => {
    renderRegistration()
    expect(
      screen.getByRole("button", { name: /complete registration/i })
    ).toBeInTheDocument()
  })

  it("renders login link", () => {
    renderRegistration()
    expect(screen.getByRole("link", { name: /click here/i })).toHaveAttribute(
      "href",
      "/login"
    )
  })

  /* ── Auth redirect ─────────────────────────────────────── */

  it("redirects when already authenticated", () => {
    mockAuthContext.isAuthenticated = true
    renderRegistration()
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true })
  })

  it("does NOT redirect while loading", () => {
    mockAuthContext.isAuthenticated = true
    mockAuthContext.loading = true

    renderRegistration()

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  /* ── Validation ────────────────────────────────────────── */

  it("shows validation error when passwords do not match", async () => {
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "123456")
    await userEvent.type(
      screen.getByLabelText(/^new password$/i),
      "password-one-very-long"
    )
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "password-two-different"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /complete registration/i })
    )

    expect(
      await screen.findByText("Validation Error")
    ).toBeInTheDocument()

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  /* ── Successful activation ─────────────────────────────── */

  it("calls activation API with correct payload", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(
      screen.getByLabelText(/^new password$/i),
      "super-secure-password"
    )
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "super-secure-password"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /complete registration/i })
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.irboard.local/v1/auth/activate",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "user@test.com",
            code: "654321",
            password: "super-secure-password",
          }),
        })
      )
    })
  })

  it("creates login flow after activation", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(
      screen.getByLabelText(/^new password$/i),
      "super-secure-password"
    )
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "super-secure-password"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /complete registration/i })
    )

    await waitFor(() => {
      expect(mockCreateBrowserLoginFlow).toHaveBeenCalledTimes(1)

      expect(mockUpdateLoginFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          flow: FLOW_ID,
          updateLoginFlowBody: expect.objectContaining({
            method: "password",
            csrf_token: CSRF_TOKEN,
            identifier: "user@test.com",
            password: "super-secure-password",
          }),
        })
      )
    })
  })

  it("navigates home after successful registration", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(
      screen.getByLabelText(/^new password$/i),
      "super-secure-password"
    )
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "super-secure-password"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /complete registration/i })
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.irboard.local/v1/auth/activate",
        expect.any(Object)
      )

      expect(mockCreateBrowserLoginFlow).toHaveBeenCalled()
      expect(mockUpdateLoginFlow).toHaveBeenCalled()

      expect(mockNavigate).toHaveBeenCalledWith("/")
    })
  })

  /* ── Loading state ─────────────────────────────────────── */

  it("shows Processing state while submitting", async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    )

    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(
      screen.getByLabelText(/^new password$/i),
      "super-secure-password"
    )
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "super-secure-password"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /complete registration/i })
    )

    expect(
      screen.getByRole("button", { name: /processing/i })
    ).toBeDisabled()
  })

  /* ── Failure cases ─────────────────────────────────────── */

  it("shows error message on activation failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid code" }),
    })

    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "000000")
    await userEvent.type(
      screen.getByLabelText(/^new password$/i),
      "super-secure-password"
    )
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "super-secure-password"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /complete registration/i })
    )

    await waitFor(() => {
      expect(
        screen.getByText("Registration Failed")
      ).toBeInTheDocument()
    })
  })

  it("handles fetch rejection and shows error", async () => {
    const error = new Error("Network failure")

    mockFetch.mockRejectedValue(error)

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "000000")
    await userEvent.type(
      screen.getByLabelText(/^new password$/i),
      "super-secure-password"
    )
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "super-secure-password"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /complete registration/i })
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error)
      expect(screen.getByText("Registration Failed")).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })
})