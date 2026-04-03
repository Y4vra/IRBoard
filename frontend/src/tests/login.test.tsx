import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import Login from "../pages/Login"

// ─── vi.hoisted: runs before vi.mock hoisting, so refs are available ──────────
const {
  mockCreateBrowserLoginFlow,
  mockUpdateLoginFlow,
  mockNavigate,
  mockAuthContext,
} = vi.hoisted(() => ({
  mockCreateBrowserLoginFlow: vi.fn(),
  mockUpdateLoginFlow: vi.fn(),
  mockNavigate: vi.fn(),
  mockAuthContext: { isAuthenticated: false, loading: false },
}))

// ─── Mock: kratos ────────────────────────────────────────────────────────────
vi.mock("@/lib/kratos", () => ({
  kratos: {
    createBrowserLoginFlow: mockCreateBrowserLoginFlow,
    updateLoginFlow: mockUpdateLoginFlow,
  },
}))

// ─── Mock: react-router-dom navigate ─────────────────────────────────────────
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ─── Mock: AuthContext ────────────────────────────────────────────────────────
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FLOW_ID = "test-flow-id"
const CSRF_TOKEN = "test-csrf-token"

const mockFlowData = {
  id: FLOW_ID,
  ui: {
    nodes: [
      {
        attributes: { name: "csrf_token", value: CSRF_TOKEN },
      },
    ],
  },
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Login />
    </MemoryRouter>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Login component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.isAuthenticated = false
    mockAuthContext.loading = false
    mockCreateBrowserLoginFlow.mockResolvedValue({ data: mockFlowData })
    // Reset window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    })
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the card title", () => {
    renderLogin()
    expect(screen.getByText("Welcome to IR-Board!")).toBeInTheDocument()
  })

  it("renders email and password inputs", () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("renders the login button", () => {
    renderLogin()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
  })

  // ── Auth redirect ──────────────────────────────────────────────────────────

  it("redirects to / when already authenticated", () => {
    mockAuthContext.isAuthenticated = true
    renderLogin()
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true })
  })

  it("does NOT redirect when loading is true (even if authenticated)", () => {
    mockAuthContext.isAuthenticated = true
    mockAuthContext.loading = true
    renderLogin()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("does NOT redirect when not authenticated and not loading", () => {
    renderLogin()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ── Kratos flow ────────────────────────────────────────────────────────────

  it("creates a browser login flow on mount when not authenticated", async () => {
    renderLogin()
    await waitFor(() => {
      expect(mockCreateBrowserLoginFlow).toHaveBeenCalledTimes(1)
    })
  })

  it("does NOT create a login flow while loading", () => {
    mockAuthContext.loading = true
    renderLogin()
    expect(mockCreateBrowserLoginFlow).not.toHaveBeenCalled()
  })

  it("logs an error when createBrowserLoginFlow rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    mockCreateBrowserLoginFlow.mockRejectedValue(new Error("network error"))
    renderLogin()
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error setting up flow:",
        expect.any(Error)
      )
    })
    consoleSpy.mockRestore()
  })

  // ── Form interaction ───────────────────────────────────────────────────────

  it("updates email input on change", async () => {
    renderLogin()
    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, "user@irboard.com")
    expect(emailInput).toHaveValue("user@irboard.com")
  })

  it("updates password input on change", async () => {
    renderLogin()
    const passwordInput = screen.getByLabelText(/password/i)
    await userEvent.type(passwordInput, "secret123")
    expect(passwordInput).toHaveValue("secret123")
  })

  // ── Successful submit ──────────────────────────────────────────────────────

  it("calls updateLoginFlow with correct data on submit", async () => {
    mockUpdateLoginFlow.mockResolvedValue({})
    renderLogin()

    await waitFor(() => expect(mockCreateBrowserLoginFlow).toHaveBeenCalled())

    await userEvent.type(screen.getByLabelText(/email/i), "user@irboard.com")
    await userEvent.type(screen.getByLabelText(/password/i), "secret123")
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(mockUpdateLoginFlow).toHaveBeenCalledWith({
        flow: FLOW_ID,
        updateLoginFlowBody: {
          method: "password",
          identifier: "user@irboard.com",
          password: "secret123",
          csrf_token: CSRF_TOKEN,
        },
      })
    })
  })

  it("redirects to / after a successful login", async () => {
    mockUpdateLoginFlow.mockResolvedValue({})
    renderLogin()

    await waitFor(() => expect(mockCreateBrowserLoginFlow).toHaveBeenCalled())

    await userEvent.type(screen.getByLabelText(/email/i), "user@irboard.com")
    await userEvent.type(screen.getByLabelText(/password/i), "secret123")
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(window.location.href).toBe("/")
    })
  })

  // ── Failed submit ──────────────────────────────────────────────────────────

  it("shows an alert on login failure", async () => {
    mockUpdateLoginFlow.mockRejectedValue(new Error("401"))
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    renderLogin()

    await waitFor(() => expect(mockCreateBrowserLoginFlow).toHaveBeenCalled())

    await userEvent.type(screen.getByLabelText(/email/i), "user@irboard.com")
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass")
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Credenciales incorrectas")
    })
    alertSpy.mockRestore()
  })

  it("logs the error on login failure", async () => {
    const error = new Error("401 Unauthorized")
    mockUpdateLoginFlow.mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(window, "alert").mockImplementation(() => {})
    renderLogin()

    await waitFor(() => expect(mockCreateBrowserLoginFlow).toHaveBeenCalled())

    await userEvent.type(screen.getByLabelText(/email/i), "user@irboard.com")
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass")
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error en el login:", error)
    })
    consoleSpy.mockRestore()
  })

  it("does NOT call updateLoginFlow when flowData is null (flow not ready)", async () => {
    // Don't resolve the flow before submitting
    mockCreateBrowserLoginFlow.mockReturnValue(new Promise(() => {})) // never resolves
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email/i), "user@irboard.com")
    await userEvent.type(screen.getByLabelText(/password/i), "secret123")
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    expect(mockUpdateLoginFlow).not.toHaveBeenCalled()
  })
})