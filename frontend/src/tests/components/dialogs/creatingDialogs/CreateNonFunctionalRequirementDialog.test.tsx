import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateNonFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateNonFunctionalRequirementDialog";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("CreateNonFunctionalRequirementDialog", () => {
  const onSuccess = vi.fn();
  const onOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange,
    onSuccess,
    projectId: "15",
    siblingRequirements: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDialog = (props = {}) =>
    render(
      <CreateNonFunctionalRequirementDialog
        {...defaultProps}
        {...props}
      />
    );

  describe("rendering", () => {
    it("renders top-level dialog", () => {
      renderDialog();

      expect(
        screen.getByRole("heading", {
          name: /new non-functional requirement/i,
        })
      ).toBeInTheDocument();
    });

    it("renders child mode", () => {
      renderDialog({
        parentId: 99,
      });

      expect(
        screen.getByRole("heading", {
          name: /new child non-functional requirement/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByDisplayValue("99")
      ).toBeInTheDocument();
    });

    it("shows project context", () => {
      renderDialog();

      expect(
        screen.getByDisplayValue("15")
      ).toBeInTheDocument();
    });
  });

  describe("form interaction", () => {
    it("updates text fields", async () => {
      const user = userEvent.setup();

      renderDialog();

      const nameInput =
        screen.getByLabelText(/name/i);

      const descriptionInput =
        screen.getByLabelText(/description/i);

      await user.type(nameInput, "Availability");

      await user.type(
        descriptionInput,
        "System uptime requirement"
      );

      expect(nameInput).toHaveValue("Availability");

      expect(descriptionInput).toHaveValue(
        "System uptime requirement"
      );
    });

    it("updates numeric fields", async () => {
      const user = userEvent.setup();

      renderDialog();

      const threshold =
        screen.getByLabelText(/threshold/i);

      await user.clear(threshold);
      await user.type(threshold, "500");

      expect(threshold).toHaveValue(500);
    });
  });

  describe("submit", () => {
    it("creates top-level requirement", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      renderDialog();

      await user.type(
        screen.getByLabelText(/name/i),
        "Response Time"
      );

      await user.type(
        screen.getByLabelText(/description/i),
        "Must be fast"
      );

      await user.click(
        screen.getByRole("button", {
          name: /register/i,
        })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const [, options] = mockFetch.mock.calls[0];

      const payload = JSON.parse(options.body);

      expect(payload).toMatchObject({
        name: "Response Time",
        description: "Must be fast",
        projectId: 15,
        orderValue: 1000,
      });

      expect(payload.parentId).toBeUndefined();

      expect(onSuccess).toHaveBeenCalled();
    });

    it("creates child requirement", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      renderDialog({
        parentId: 5,
      });

      await user.type(
        screen.getByLabelText(/name/i),
        "Latency"
      );

      await user.type(
        screen.getByLabelText(/description/i),
        "Child requirement"
      );

      await user.click(
        screen.getByRole("button", {
          name: /register/i,
        })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const [, options] = mockFetch.mock.calls[0];

      const payload = JSON.parse(options.body);

      expect(payload.parentId).toBe(5);
    });

    it("computes orderValue from siblings", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      renderDialog({
        siblingRequirements: [
          { id: 1, orderValue: 1000 },
          { id: 2, orderValue: 5000 },
          { id: 3, orderValue: 3000 },
        ],
      });

      await user.type(
        screen.getByLabelText(/name/i),
        "Availability"
      );

      await user.type(
        screen.getByLabelText(/description/i),
        "Description"
      );

      await user.click(
        screen.getByRole("button", {
          name: /register/i,
        })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const [, options] = mockFetch.mock.calls[0];

      const payload = JSON.parse(options.body);

      expect(payload.orderValue).toBe(6000);
    });

    it("shows backend error", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({
          message: "Duplicate requirement",
        }),
      });

      renderDialog();

      await user.type(
        screen.getByLabelText(/name/i),
        "Availability"
      );

      await user.type(
        screen.getByLabelText(/description/i),
        "Description"
      );

      await user.click(
        screen.getByRole("button", {
          name: /register/i,
        })
      );

      expect(
        await screen.findByText(
          /duplicate requirement/i
        )
      ).toBeInTheDocument();
    });

    it("shows loading state", async () => {
      const user = userEvent.setup();

      let resolveFetch!: (value: any) => void;

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      );

      renderDialog();

      await user.type(
        screen.getByLabelText(/name/i),
        "Availability"
      );

      await user.type(
        screen.getByLabelText(/description/i),
        "Description"
      );

      await user.click(
        screen.getByRole("button", {
          name: /register/i,
        })
      );

      expect(
        screen.getByRole("button", {
          name: "",
        })
      ).toBeDisabled();

      resolveFetch({ ok: true });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("closing", () => {
    it("calls onOpenChange(false) when cancelled", async () => {
      const user = userEvent.setup();

      renderDialog();

      await user.click(
        screen.getByRole("button", {
          name: /cancel/i,
        })
      );

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});