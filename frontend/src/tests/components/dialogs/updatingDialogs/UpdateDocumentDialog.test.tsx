import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateDocumentDialog } from "@/components/dialogs/updatingDialogs/UpdateDocumentDialog";
import type { DocumentDTO } from "@/types/Document";

const mockDocument:DocumentDTO = {
  entityIdentifier:"DOC-1",
  id: 1,
  fileName: "old.pdf",
  mimeType: "application/pdf",
  fileSize: 2048,
  state:"PENDING_APPROVAL",
  observers:[],
};

const onSuccess = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  globalThis.fetch = vi.fn();
});

function setup() {
  render(
    <UpdateDocumentDialog
      projectId="123"
      document={mockDocument}
      disabled={false}
      onSuccess={onSuccess}
    />
  );
}

describe("UpdateDocumentDialog", () => {
  it("renders trigger button", () => {
    setup();
    expect(screen.getByRole("button", { name: /replace file/i })).toBeInTheDocument();
  });

  it("opens dialog on click", async () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /replace file/i }));

    expect(await screen.findByText(/current file/i)).toBeInTheDocument();
  });

  it("uploads file successfully", async () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /replace file/i }));

    const file = new File(["hello"], "new.pdf", { type: "application/pdf" });

    const input = await screen.findByLabelText(/file/i, { selector: "input" });

    fireEvent.change(input, { target: { files: [file] } });

    globalThis.fetch=vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    fireEvent.click(screen.getByRole("button", { name: /replace/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("handles API error", async () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /replace file/i }));

    const file = new File(["hello"], "new.pdf");

    const input = await screen.findByLabelText(/file/i, { selector: "input" });
    fireEvent.change(input, { target: { files: [file] } });

    globalThis.fetch= vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Upload failed" }),
    });

    fireEvent.click(screen.getByRole("button", { name: /replace/i }));

    expect(await screen.findByText(/upload failed/i)).toBeInTheDocument();
  });

  it("does not close while uploading", async () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /replace file/i }));

    const file = new File(["hello"], "new.pdf");

    const input = await screen.findByLabelText(/file/i, { selector: "input" });
    fireEvent.change(input, { target: { files: [file] } });

    globalThis.fetch= vi.fn().mockImplementation(
      () => new Promise(() => {}) // never resolves → stuck uploading
    );

    fireEvent.click(screen.getByRole("button", { name: /replace/i }));

    // try closing
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // dialog should still be open
    expect(screen.getByText(/current file/i)).toBeInTheDocument();
  });
});