import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth } from "@/context/AuthContext";
import { NavBar } from "@/components/Navbar";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("@/context/AuthContext");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

const mockUser = { id: 1, name: "Jane", surname: "Smith", email: "jane@example.com", isAdmin: false, active: true, oryId: "ory-abc-123" };
const mockAdminUser = { id: 2, name: "Admin", surname: "User", email: "admin@example.com", isAdmin: true, active: true, oryId: "ory-def-456" };

function renderNavBar(pathname = "/home") {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <NavBar />
    </MemoryRouter>
  );
}

function setupAuth(user: typeof mockUser | null = mockUser) {
  vi.mocked(useAuth).mockReturnValue({ user, logout: mockLogout, isAuthenticated: true, session: null, loading: false, serverError: false, checkSession: () => Promise.resolve() });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Advance fake clock and flush all pending microtasks/React updates.
async function tick(ms: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

// Simulate the user typing into the slug input via a single change event.
// This is equivalent to the component's onChange and avoids userEvent overhead.
function typeIntoSlugInput(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

// Open the navbar and wait past the 300ms finishedOpening timeout.
async function openNavBar(root: Element) {
  fireEvent.mouseEnter(root);
  await tick(350);
}

// Type a slug and advance past the 500ms debounce so fetch fires (if valid).
async function typeSlug(input: HTMLElement, value: string) {
  typeIntoSlugInput(input, value);
  await tick(600);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("NavBar", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    globalThis.fetch = vi.fn();
    setupAuth();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── Render guard ─────────────────────────────────────────────────────────────

  describe("render guard", () => {
    it("renders nothing when user is null", () => {
      setupAuth(null);
      const { container } = renderNavBar();
      expect(container.firstChild).toBeNull();
    });

    it("renders the collapsed nav when user is present", () => {
      const { container } = renderNavBar();
      expect(container.firstChild).not.toBeNull();
    });
  });

  // ── Collapsed state ──────────────────────────────────────────────────────────

  describe("collapsed state", () => {
    it("does not show user name or email while collapsed", () => {
      renderNavBar();
      expect(screen.queryByText(mockUser.name)).toBeNull();
      expect(screen.queryByText(mockUser.email)).toBeNull();
    });

    it("does not show nav links while collapsed", () => {
      const { container } = renderNavBar();
      // JSDOM doesn't compute Tailwind CSS so toBeVisible() won't see opacity-0.
      // Check the class on the wrapper div directly instead.
      const expandable = container.querySelector(".grid");
      expect(expandable).toHaveClass("opacity-0");
    });
  });

  // ── Hover open/close ─────────────────────────────────────────────────────────

  describe("hover open/close", () => {
    it("opens on mouseenter and shows user info", async () => {
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    it("closes on mouseleave after 200ms debounce", async () => {
      const { container } = renderNavBar();
      const root = container.firstElementChild!;
      await openNavBar(root);

      fireEvent.mouseLeave(root);
      await tick(250);

      expect(screen.queryByText(mockUser.name)).toBeNull();
    });

    it("cancels close if mouse re-enters within debounce window", async () => {
      const { container } = renderNavBar();
      const root = container.firstElementChild!;
      await openNavBar(root);

      fireEvent.mouseLeave(root);
      await tick(100); // before 200ms elapses
      fireEvent.mouseEnter(root);
      await tick(200);

      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });
  });

  // ── Links disabled until finishedOpening ─────────────────────────────────────

  describe("link availability", () => {
    it("nav links are disabled immediately after open (before 300ms)", async () => {
      const { container } = renderNavBar();
      fireEvent.mouseEnter(container.firstElementChild!);
      await tick(50);

      const projectsLink = screen.queryByText("Projects")?.closest("a");
      expect(projectsLink).toHaveClass("cursor-default");
    });

    it("nav links become active after 300ms", async () => {
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);

      const projectsLink = screen.getByText("Projects").closest("a");
      expect(projectsLink).not.toHaveClass("cursor-default");
    });
  });

  // ── Slug validation ──────────────────────────────────────────────────────────

  describe("slug validation (isFullSlug)", () => {
    const cases: Array<[string, boolean]> = [
      ["1-FR-login-flow", true],
      ["42-NFR-performance", true],
      ["7-STKH-ceo", true],
      ["3-FUNC-auth-module", true],
      ["9-DOC-api-spec", true],
      ["1-fr-login", true],        // case-insensitive
      ["  1-FR-login  ", true],    // whitespace trimmed
      ["FR-login", false],         // missing project id
      ["1-XX-login", false],       // unknown type
      ["", false],                 // empty
      ["abc-FR-login", false],     // non-numeric project id
    ];

    it.each(cases)("isFullSlug(%s) → %s", async (slug, expected) => {
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);

      const input = screen.getByPlaceholderText(/go to slug/i);
      await typeSlug(input, slug);

      if (!expected) {
        expect(globalThis.fetch).not.toHaveBeenCalled();
      } else {
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining(encodeURIComponent(slug.trim())),
          expect.objectContaining({ credentials: "include" })
        );
      }
    });
  });

  // ── Search debounce ──────────────────────────────────────────────────────────

  describe("search debounce", () => {
    it("does not call fetch before 500ms debounce elapses", async () => {
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);

      const input = screen.getByPlaceholderText(/go to slug/i);
      typeIntoSlugInput(input, "1-FR-login");
      await tick(200); // 200ms < 500ms debounce

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("calls fetch once after 500ms debounce for a valid slug", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, name: "Login", type: "FR", projectId: 1, functionalityId: 2, entityIdentifier: "1-FR-login" }), { status: 200 })
      );

      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);

      const input = screen.getByPlaceholderText(/go to slug/i);
      await typeSlug(input, "1-FR-login");

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  // ── Search result display ────────────────────────────────────────────────────

  describe("search result states", () => {
    async function typeValidSlug() {
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);
      const input = screen.getByPlaceholderText(/go to slug/i);
      await typeSlug(input, "1-FR-login");
      return { input };
    }

    it("shows 'not found' message on 404", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));
      await typeValidSlug();
      expect(screen.getByText(/no entity found/i)).toBeInTheDocument();
    });

    it("shows result card on successful fetch", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, name: "User Login", type: "FR", projectId: 3, functionalityId: 5, entityIdentifier: "1-FR-login" }), { status: 200 })
      );
      await typeValidSlug();
      expect(screen.getByText("User Login")).toBeInTheDocument();
      expect(screen.getByText("1-FR-login")).toBeInTheDocument();
    });

    it("navigates to correct path on Enter when result is found", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, name: "User Login", type: "FR", projectId: 3, functionalityId: 5, entityIdentifier: "1-FR-login" }), { status: 200 })
      );
      const { input } = await typeValidSlug();
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockNavigate).toHaveBeenCalledWith("/project/3/functionalities/5/functionalRequirements/1");
    });

    it("clears slug and result on Escape", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, name: "User Login", type: "FR", projectId: 3, functionalityId: 5, entityIdentifier: "1-FR-login" }), { status: 200 })
      );
      const { input } = await typeValidSlug();
      fireEvent.keyDown(input, { key: "Escape" });
      expect(input).toHaveValue("");
      expect(screen.queryByText("User Login")).toBeNull();
    });
  });

  // ── resultPath ───────────────────────────────────────────────────────────────

  describe("resultPath resolution", () => {
    const cases = [
      {
        type: "FR" as const,
        result: { id: 1, name: "t", type: "FR" as const, projectId: 2, functionalityId: 9, entityIdentifier: "x" },
        expected: "/project/2/functionalities/9/functionalRequirements/1",
      },
      {
        type: "NFR" as const,
        result: { id: 3, name: "t", type: "NFR" as const, projectId: 2, entityIdentifier: "x" },
        expected: "/project/2/nfr/3",
      },
      {
        type: "STAKEHOLDER" as const,
        result: { id: 4, name: "t", type: "STAKEHOLDER" as const, projectId: 2, entityIdentifier: "x" },
        expected: "/project/2/stakeholders/4",
      },
      {
        type: "FUNCTIONALITY" as const,
        result: { id: 5, name: "t", type: "FUNCTIONALITY" as const, projectId: 2, entityIdentifier: "x" },
        expected: "/project/2/functionalities/5",
      },
      {
        type: "DOCUMENT" as const,
        result: { id: 6, name: "t", type: "DOCUMENT" as const, projectId: 2, entityIdentifier: "x" },
        expected: "/project/2/documents/6",
      },
    ];

    it.each(cases)("$type → $expected", async ({ result, expected }) => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(result), { status: 200 })
      );

      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);

      const input = screen.getByPlaceholderText(/go to slug/i);
      await typeSlug(input, "1-FR-x");

      const resultCard = screen.getByText(result.name);
      fireEvent.click(resultCard.closest("button")!);
      expect(mockNavigate).toHaveBeenCalledWith(expected);
    });
  });

  // ── Navigation links ─────────────────────────────────────────────────────────

  describe("navigation links", () => {
    it("shows Projects link always", async () => {
      const { container } = renderNavBar("/home");
      await openNavBar(container.firstElementChild!);
      expect(screen.getByText("Projects")).toBeInTheDocument();
    });

    it("does NOT show project sub-links outside a project route", async () => {
      const { container } = renderNavBar("/home");
      await openNavBar(container.firstElementChild!);
      expect(screen.queryByText("Dashboard")).toBeNull();
      expect(screen.queryByText("Stakeholders")).toBeNull();
    });

    it("shows project sub-links when inside a /project/* route", async () => {
      const { container } = renderNavBar("/project/42/functionalities");
      await openNavBar(container.firstElementChild!);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Stakeholders")).toBeInTheDocument();
      expect(screen.getByText("Non-Functional")).toBeInTheDocument();
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    it("does NOT show User management for non-admin users", async () => {
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);
      expect(screen.queryByText("User management")).toBeNull();
    });

    it("shows User management for admin users", async () => {
      setupAuth(mockAdminUser);
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);
      expect(screen.getByText("User management")).toBeInTheDocument();
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("calls logout when Log out is clicked", async () => {
      const { container } = renderNavBar();
      await openNavBar(container.firstElementChild!);
      fireEvent.click(screen.getByText(/log out/i));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  // ── Close resets state ───────────────────────────────────────────────────────

  describe("close resets state", () => {
    it("clears slug and result when nav closes", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, name: "Login", type: "FR", projectId: 1, functionalityId: 2, entityIdentifier: "1-FR-login" }), { status: 200 })
      );

      const { container } = renderNavBar();
      const root = container.firstElementChild!;
      await openNavBar(root);

      const input = screen.getByPlaceholderText(/go to slug/i);
      await typeSlug(input, "1-FR-login");
      expect(screen.getByText("Login")).toBeInTheDocument();

      fireEvent.mouseLeave(root);
      await tick(250);

      await openNavBar(root);
      expect(input).toHaveValue("");
      expect(screen.queryByText("Login")).toBeNull();
    });
  });
});