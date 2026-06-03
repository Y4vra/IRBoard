import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { UploadDocumentDialog } from "@/components/dialogs/creatingDialogs/UploadDocumentDialog";

const mockOnSuccess = vi.fn();

let selectedFile: File | null = null;

vi.mock("@/components/DocumentFilePicker", () => ({
  DocumentFilePicker: ({
    onFileChange,
  }: {
    file: File | null;
    onFileChange: (file: File | null) => void;
  }) => (
    <button
      data-testid="file-picker"
      onClick={() => {
        selectedFile = new File(
          ["hello"],
          "requirements.pdf",
          { type: "application/pdf" }
        );
        onFileChange(selectedFile);
      }}
    >
      Pick File
    </button>
  ),
}));

async function tick(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function renderDialog() {
  return render(
    <UploadDocumentDialog
      projectId="42"
      onSuccess={mockOnSuccess}
    />
  );
}

async function openDialog() {
  fireEvent.click(
    screen.getByRole("button", {
      name: /upload document/i,
    })
  );

  expect(
    screen.getByText(/project context/i)
  ).toBeInTheDocument();
}

describe("UploadDocumentDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
    selectedFile = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("opening", () => {
    it("opens dialog when trigger is clicked", async () => {
      renderDialog();

      await openDialog();

      expect(
        screen.getByText(/select a file to upload/i)
      ).toBeInTheDocument();
    });

    it("shows project id", async () => {
      renderDialog();

      await openDialog();

      expect(
        screen.getByDisplayValue("42")
      ).toBeInTheDocument();
    });
  });

  describe("upload button state", () => {
    it("starts disabled without file", async () => {
      renderDialog();

      await openDialog();

      expect(
        screen.getByRole("button", { name: /^upload$/i })
      ).toBeDisabled();
    });

    it("enables upload after file selection", async () => {
      renderDialog();

      await openDialog();

      fireEvent.click(screen.getByTestId("file-picker"));

      expect(
        screen.getByRole("button", { name: /^upload$/i })
      ).not.toBeDisabled();
    });
  });

  describe("successful upload", () => {
    it("uploads file successfully", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      renderDialog();

      await openDialog();

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      await tick();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/projects/42/documents/upload"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it("shows success state", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      renderDialog();

      await openDialog();

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      await tick();

      expect(
        screen.getByText(/document uploaded successfully/i)
      ).toBeInTheDocument();
    });

    it("auto closes after 1200ms", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      renderDialog();

      await openDialog();

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      await tick();

      expect(
        screen.getByText(/document uploaded successfully/i)
      ).toBeInTheDocument();

      await tick(1300);

      expect(
        screen.queryByText(/document uploaded successfully/i)
      ).toBeNull();
    });
  });

  describe("uploading state", () => {
    it("shows uploading indicator while request is pending", () => {
      vi.mocked(globalThis.fetch).mockReturnValueOnce(
        new Promise(() => {})
      );

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", {
          name: /upload document/i,
        })
      );

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      expect(
        screen.getByText(/uploading to storage/i)
      ).toBeInTheDocument();
    });

    it("disables cancel while uploading", () => {
      vi.mocked(globalThis.fetch).mockReturnValueOnce(
        new Promise(() => {})
      );

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", {
          name: /upload document/i,
        })
      );

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeDisabled();
    });
  });

  describe("error handling", () => {
    it("shows server error message", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "Upload failed",
          }),
      } as Response);

      renderDialog();

      await openDialog();

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      await tick();

      expect(
        screen.getByText(/upload failed/i)
      ).toBeInTheDocument();
    });

    it("shows fallback error when server returns no body", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(),
      } as Response);

      renderDialog();

      await openDialog();

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      await tick();

      expect(
        screen.getByText(/failed to upload document/i)
      ).toBeInTheDocument();
    });

    it("returns to idle state after failure", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(),
      } as Response);

      renderDialog();

      await openDialog();

      fireEvent.click(screen.getByTestId("file-picker"));

      fireEvent.click(
        screen.getByRole("button", { name: /^upload$/i })
      );

      await tick();

      expect(
        screen.getByRole("button", { name: /^upload$/i })
      ).not.toBeDisabled();
    });
  });

  describe("cancel", () => {
    it("closes dialog when cancel is clicked", async () => {
      renderDialog();

      await openDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /cancel/i })
      );

      expect(
        screen.queryByText(/project context/i)
      ).toBeNull();
    });
  });
});