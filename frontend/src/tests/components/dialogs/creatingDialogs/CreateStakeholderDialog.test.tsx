import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateStakeholderDialog } from "@/components/dialogs/creatingDialogs/CreateStakeholderDialog";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("CreateStakeholderDialog", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openDialog = () => {
    render(
      <CreateStakeholderDialog
        projectId="project-123"
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /add stakeholder/i })
    );
  };

  describe("dialog behavior", () => {
    it("opens when trigger button is clicked", () => {
      openDialog();

      expect(
        screen.getByRole("heading", { name: /new stakeholder/i })
      ).toBeInTheDocument();
    });

    it("renders all form fields", () => {
      openDialog();

      expect(screen.getByLabelText(/project context/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/stakeholder name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  describe("form input", () => {
    it("updates form values", () => {
      openDialog();

      const nameInput = screen.getByLabelText(/stakeholder name/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      fireEvent.change(nameInput, {
        target: { value: "Project Manager" },
      });

      fireEvent.change(descriptionInput, {
        target: { value: "Responsible for project oversight" },
      });

      expect(nameInput).toHaveValue("Project Manager");
      expect(descriptionInput).toHaveValue(
        "Responsible for project oversight"
      );
    });

    it("shows readonly project id", () => {
      openDialog();

      const projectInput = screen.getByDisplayValue("project-123");

      expect(projectInput).toBeDisabled();
      expect(projectInput).toHaveValue("project-123");
    });
  });

  describe("submit", () => {
    it("creates stakeholder successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      openDialog();

      fireEvent.change(
        screen.getByLabelText(/stakeholder name/i),
        {
          target: { value: "Project Manager" },
        }
      );

      fireEvent.change(
        screen.getByLabelText(/description/i),
        {
          target: { value: "Responsible for project oversight" },
        }
      );

      fireEvent.click(
        screen.getByRole("button", { name: /register/i })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/projects/project-123/stakeholders/new"
        ),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Project Manager",
            description: "Responsible for project oversight",
            projectId: "project-123",
          }),
        })
      );

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("shows loading state while submitting", async () => {
      let resolveFetch: (value: any) => void;

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      );

      openDialog();

      fireEvent.change(
        screen.getByLabelText(/stakeholder name/i),
        {
          target: { value: "PM" },
        }
      );

      fireEvent.change(
        screen.getByLabelText(/description/i),
        {
          target: { value: "Desc" },
        }
      );

      fireEvent.click(
        screen.getByRole("button", { name: /register/i })
      );

      expect(
        screen.getByRole("button", { name: "" })
      ).toBeDisabled();

      resolveFetch!({ ok: true });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("handles failed request", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({
          message: "Failed to create stakeholder",
        }),
      });

      openDialog();

      fireEvent.change(
        screen.getByLabelText(/stakeholder name/i),
        {
          target: { value: "PM" },
        }
      );

      fireEvent.change(
        screen.getByLabelText(/description/i),
        {
          target: { value: "Desc" },
        }
      );

      fireEvent.click(
        screen.getByRole("button", { name: /register/i })
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("closing", () => {
    it("closes when cancel is clicked", async () => {
      openDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /cancel/i })
      );

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", {
            name: /new stakeholder/i,
          })
        ).not.toBeInTheDocument();
      });
    });

    it("resets form when closed", async () => {
      openDialog();

      const nameInput = screen.getByLabelText(
        /stakeholder name/i
      );

      fireEvent.change(nameInput, {
        target: { value: "Temporary Name" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /cancel/i })
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: /add stakeholder/i,
        })
      );

      expect(
        screen.getByLabelText(/stakeholder name/i)
      ).toHaveValue("");
    });
  });
});