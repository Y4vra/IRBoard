import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProtectedRoute } from "@/components/ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

function renderProtectedRoute(adminOnly = false) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          element={<ProtectedRoute adminOnly={adminOnly} />}
        >
          <Route
            path="/protected"
            element={<div>Protected Content</div>}
          />
        </Route>

        <Route
          path="/login"
          element={<div>Login Page</div>}
        />

        <Route
          path="/error"
          element={<div>Error Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner while auth is loading", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      serverError: false,
    });

    renderProtectedRoute();

    expect(
      screen.getByTestId("loading-spinner")
    ).toBeInTheDocument();
  });

  it("redirects to error page when server error exists", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      serverError: true,
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Error Page")
    ).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      serverError: false,
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      serverError: false,
      user: {
        isAdmin: false,
      },
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Protected Content")
    ).toBeInTheDocument();
  });

  it("renders protected content for admin users on admin routes", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      serverError: false,
      user: {
        isAdmin: true,
      },
    });

    renderProtectedRoute(true);

    expect(
      screen.getByText("Protected Content")
    ).toBeInTheDocument();
  });

  it("redirects non-admin users from admin-only routes", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      serverError: false,
      user: {
        isAdmin: false,
      },
    });

    renderProtectedRoute(true);

    expect(
      screen.getByText("Error Page")
    ).toBeInTheDocument();
  });

  it("allows authenticated user when adminOnly is false", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      serverError: false,
      user: null,
    });

    renderProtectedRoute(false);

    expect(
      screen.getByText("Protected Content")
    ).toBeInTheDocument();
  });
});