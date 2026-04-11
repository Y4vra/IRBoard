import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import Registration from "../pages/Registration"

const {
  mockCreateBrowserLoginFlow,
  mockUpdateLoginFlow,
  mockNavigate,
  mockCheckSession,
  mockAuthContext,
  mockFetch,
} = vi.hoisted(() => ({
  mockCreateBrowserLoginFlow: vi.fn(),
  mockUpdateLoginFlow: vi.fn(),
  mockNavigate: vi.fn(),
  mockCheckSession: vi.fn().mockResolvedValue(undefined),
  mockAuthContext: { isAuthenticated: false, loading: false, checkSession: vi.fn() },
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
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

const FLOW_ID = "reg-flow-id"
const CSRF_TOKEN = "reg-csrf-token"

const mockFlowData = {
  id: FLOW_ID,
  ui: {
    nodes: [{ attributes: { name: "csrf_token", value: CSRF_TOKEN } }],
  },
}

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Registration />
    </MemoryRouter>
  )
}

describe("Registration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.isAuthenticated = false
    mockAuthContext.loading = false
    mockAuthContext.checkSession = mockCheckSession
    vi.stubGlobal("fetch", mockFetch)
    mockCreateBrowserLoginFlow.mockResolvedValue({ data: mockFlowData })
    mockUpdateLoginFlow.mockResolvedValue({})
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Account Activation title", () => {
    renderRegistration()
    expect(screen.getByText("Account Activation")).toBeInTheDocument()
  })

  it("renders email, code, password and confirm password inputs", () => {
    renderRegistration()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/security code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it("renders the Complete Registration button", () => {
    renderRegistration()
    expect(screen.getByRole("button", { name: /complete registration/i })).toBeInTheDocument()
  })

  it("renders a link back to login", () => {
    renderRegistration()
    const link = screen.getByRole("link", { name: /click here/i })
    expect(link).toHaveAttribute("href", "/login")
  })

  // ── Auth redirect ──────────────────────────────────────────────────────────

  it("redirects to / when already authenticated", () => {
    mockAuthContext.isAuthenticated = true
    renderRegistration()
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true })
  })

  it("does NOT redirect when loading is true even if authenticated", () => {
    mockAuthContext.isAuthenticated = true
    mockAuthContext.loading = true
    renderRegistration()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ── Password mismatch ──────────────────────────────────────────────────────

  it("alerts when passwords do not match", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "123456")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "password-one-very-long")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "password-two-different")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

    expect(alertSpy).toHaveBeenCalledWith("Passwords do not match")
    expect(mockFetch).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  // ── Successful activation ──────────────────────────────────────────────────

  it("calls /auth/activate with correct payload on submit", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "super-secure-password")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "super-secure-password")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

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

  it("creates a login flow and logs in automatically after activation", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "super-secure-password")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "super-secure-password")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

    await waitFor(() => {
      expect(mockCreateBrowserLoginFlow).toHaveBeenCalledTimes(1)
      expect(mockUpdateLoginFlow).toHaveBeenCalledWith({
        flow: FLOW_ID,
        updateLoginFlowBody: expect.objectContaining({
          method: "password",
          csrf_token: CSRF_TOKEN,
          identifier: "user@test.com",
          password: "super-secure-password",
        }),
      })
    })
  })

  it("calls checkSession and navigates to / on success", async () => {
    mockFetch.mockResolvedValue({ ok: true })
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "super-secure-password")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "super-secure-password")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

    await waitFor(() => {
      expect(mockCheckSession).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith("/")
    })
  })

  it("shows Processing... while submitting", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "654321")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "super-secure-password")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "super-secure-password")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled()
    })
  })

  // ── Failed activation ──────────────────────────────────────────────────────

  it("alerts on activation failure", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "000000")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "super-secure-password")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "super-secure-password")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Activation failed. Verify your credentials.")
    })
    alertSpy.mockRestore()
  })

  it("logs error and alerts when fetch rejects", async () => {
    const error = new Error("Network failure")
    mockFetch.mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "000000")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "super-secure-password")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "super-secure-password")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error)
      expect(alertSpy).toHaveBeenCalledWith("Activation failed. Verify your credentials.")
    })
    consoleSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it("re-enables the button after a failed submission", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    vi.spyOn(window, "alert").mockImplementation(() => {})
    renderRegistration()

    await userEvent.type(screen.getByLabelText(/^email$/i), "user@test.com")
    await userEvent.type(screen.getByLabelText(/security code/i), "000000")
    await userEvent.type(screen.getByLabelText(/^new password$/i), "super-secure-password")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "super-secure-password")
    fireEvent.click(screen.getByRole("button", { name: /complete registration/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /complete registration/i })).not.toBeDisabled()
    })
  })
})
