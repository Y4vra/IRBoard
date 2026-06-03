import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { InviteUserDialog } from "@/components/dialogs/creatingDialogs/InviteUserDialog";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockOnSuccess = vi.fn();
const mockClipboardWrite = vi.fn();

function renderDialog() {
  return render(<InviteUserDialog onSuccess={mockOnSuccess} />);
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("InviteUserDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    globalThis.fetch = vi.fn();

    Object.assign(navigator, {
      clipboard: {
        writeText: mockClipboardWrite,
      },
    });

    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("dialog behavior", () => {
    it("opens when trigger button is clicked", () => {
      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      expect(
        screen.getByText(/enter user details to generate a system identity/i)
      ).toBeInTheDocument();
    });

    it("renders form fields", () => {
      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^surname$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /generate invitation/i })
      ).toBeInTheDocument();
    });
  });

  describe("submit", () => {
    it("invites user successfully", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          oryId: "ory-123",
        }),
      } as Response);

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      fireEvent.change(screen.getByLabelText(/^name$/i), {
        target: { value: "John" },
      });

      fireEvent.change(screen.getByLabelText(/^surname$/i), {
        target: { value: "Doe" },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@test.com" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /generate invitation/i })
      );

      await flush();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/invite"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);

      expect(screen.getByText("ory-123")).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByText("ory-123")).not.toBeInTheDocument();
    });

    it("sends admin flag when selected", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          oryId: "ory-admin",
        }),
      } as Response);

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      fireEvent.change(screen.getByLabelText(/^name$/i), {
        target: { value: "Admin" },
      });

      fireEvent.change(screen.getByLabelText(/^surname$/i), {
        target: { value: "User" },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin@test.com" },
      });

      fireEvent.click(screen.getByRole("checkbox"));

      fireEvent.click(
        screen.getByRole("button", { name: /generate invitation/i })
      );

      await flush();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            email: "admin@test.com",
            name: "Admin",
            surname: "User",
            isAdmin: true,
            active: true,
          }),
        })
      );
    });

    it("shows alert when invite fails", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      fireEvent.change(screen.getByLabelText(/^name$/i), {
        target: { value: "John" },
      });

      fireEvent.change(screen.getByLabelText(/^surname$/i), {
        target: { value: "Doe" },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@test.com" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /generate invitation/i })
      );

      await flush();

      expect(window.alert).toHaveBeenCalledWith(
        "Error inviting user"
      );

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("shows loading state while submitting", async () => {
      let resolve!: (value: Response) => void;

      vi.mocked(globalThis.fetch).mockReturnValueOnce(
        new Promise((r) => {
          resolve = r;
        })
      );

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      fireEvent.change(screen.getByLabelText(/^name$/i), {
        target: { value: "John" },
      });

      fireEvent.change(screen.getByLabelText(/^surname$/i), {
        target: { value: "Doe" },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@test.com" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /generate invitation/i })
      );

      expect(
        screen.getByRole("button", { name: "" })
      ).toBeDisabled();

      resolve({
        ok: true,
        json: async () => ({
          oryId: "ory-123",
        }),
      } as Response);

      await flush();
    });
  });

  describe("invitation code", () => {
    it("renders generated invitation code", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          oryId: "generated-ory-id",
        }),
      } as Response);

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      fireEvent.change(screen.getByLabelText(/^name$/i), {
        target: { value: "John" },
      });

      fireEvent.change(screen.getByLabelText(/^surname$/i), {
        target: { value: "Doe" },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@test.com" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /generate invitation/i })
      );

      await flush();

      expect(
        screen.getByText("generated-ory-id")
      ).toBeInTheDocument();

      expect(screen.getByText(/identity id/i)).toBeInTheDocument();
    });

    it("copies invitation code to clipboard", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          oryId: "copy-me",
        }),
      } as Response);

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      fireEvent.change(screen.getByLabelText(/^name$/i), {
        target: { value: "John" },
      });

      fireEvent.change(screen.getByLabelText(/^surname$/i), {
        target: { value: "Doe" },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@test.com" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /generate invitation/i })
      );

      await flush();

      fireEvent.click(
        screen.getByRole("button", {
            name: /copy invitation code/i,
        })
      );

      expect(mockClipboardWrite).toHaveBeenCalledWith("copy-me");

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockClipboardWrite).toHaveBeenCalledTimes(1);
    });

    it("closes invitation view manually", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          oryId: "ory-123",
        }),
      } as Response);

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /invite new user/i })
      );

      fireEvent.change(screen.getByLabelText(/^name$/i), {
        target: { value: "John" },
      });

      fireEvent.change(screen.getByLabelText(/^surname$/i), {
        target: { value: "Doe" },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@test.com" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /generate invitation/i })
      );

      await flush();

      fireEvent.click(
        screen.getAllByRole("button", { name: /close/i })[0]
      );

      expect(
        screen.queryByText("ory-123")
      ).not.toBeInTheDocument();
    });
  });
});