import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ObserveDocumentDialog } from "@/components/dialogs/observation/ObserveDocumentDialog";
import {
  useBackendResource,
  type UseBackendResourceResult,
} from "@/hooks/useBackendResource";
import type { DocumentDTO } from "@/types/Document";

vi.mock("@/hooks/useBackendResource");

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => <div>{text}</div>,
}));

const mockRefresh = vi.fn();
const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

const mockDocuments: DocumentDTO[] = [
  {
    id: 1,
    fileName: "Requirements.pdf",
    mimeType: "application/pdf",
    fileSize: 1024,
  } as DocumentDTO,
  {
    id: 2,
    fileName: "Architecture.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 2048,
  } as DocumentDTO,
];

function setupBackendResource({
  data = mockDocuments,
  loading = false,
  error = null as string | null,
} = {}) {
  vi.mocked(useBackendResource).mockReturnValue({
    data,
    loading,
    error,
    refresh: mockRefresh,
  } as UseBackendResourceResult<DocumentDTO[]>);
}

function renderDialog(requirementType: "FR" | "NFR" = "FR") {
  return render(
    <ObserveDocumentDialog
      open={true}
      onOpenChange={mockOnOpenChange}
      projectId="1"
      functionalityId="2"
      requirementType={requirementType}
      requirementId="3"
      onSuccess={mockOnSuccess}
    />
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("ObserveDocumentDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("loading/error states", () => {
    it("shows loading state", () => {
      setupBackendResource({ loading: true });

      renderDialog();

      expect(
        screen.getByText(/loading documents/i)
      ).toBeInTheDocument();
    });

    it("shows fetch error", () => {
      setupBackendResource({ error: "Failed to fetch documents" });

      renderDialog();

      expect(
        screen.getByText(/failed to fetch documents/i)
      ).toBeInTheDocument();
    });

    it("shows empty state", () => {
      setupBackendResource({ data: [] });

      renderDialog();

      expect(
        screen.getByText(/no documents found/i)
      ).toBeInTheDocument();
    });
  });

  describe("rendering", () => {
    it("renders documents", () => {
      setupBackendResource();

      renderDialog();

      expect(screen.getByText("Requirements.pdf")).toBeInTheDocument();
      expect(screen.getByText("Architecture.docx")).toBeInTheDocument();
    });

    it("calls refresh when opened", () => {
      setupBackendResource();

      renderDialog();

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it("disables submit button initially", () => {
      setupBackendResource();

      renderDialog();

      expect(
        screen.getByRole("button", { name: /link document/i })
      ).toBeDisabled();
    });
  });

  describe("selection", () => {
    it("allows selecting a document", () => {
      setupBackendResource();

      renderDialog();

      fireEvent.click(screen.getByText("Requirements.pdf"));

      expect(
        screen.getByRole("button", { name: /link document/i })
      ).not.toBeDisabled();
    });
  });

  describe("search", () => {
    it("filters documents by filename", () => {
      setupBackendResource();

      renderDialog();

      fireEvent.change(
        screen.getByPlaceholderText(/search documents/i),
        {
          target: { value: "architecture" },
        }
      );

      expect(screen.getByText("Architecture.docx")).toBeInTheDocument();
      expect(screen.queryByText("Requirements.pdf")).toBeNull();
    });

    it("shows empty search state", () => {
      setupBackendResource();

      renderDialog();

      fireEvent.change(
        screen.getByPlaceholderText(/search documents/i),
        {
          target: { value: "xyz123" },
        }
      );

      expect(
        screen.getByText(/no documents found/i)
      ).toBeInTheDocument();
    });
  });

  describe("submit", () => {
    it("links document successfully for FR", async () => {
      setupBackendResource();

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      renderDialog("FR");

      fireEvent.click(screen.getByText("Requirements.pdf"));

      fireEvent.click(
        screen.getByRole("button", { name: /link document/i })
      );

      await flush();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/linkDocument"),
        expect.objectContaining({
          method: "POST",
        })
      );

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("links document successfully for NFR", async () => {
      setupBackendResource();

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      renderDialog("NFR");

      fireEvent.click(screen.getByText("Requirements.pdf"));

      fireEvent.click(
        screen.getByRole("button", { name: /link document/i })
      );

      await flush();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/nonFunctionalRequirements/3/linkDocument"
        ),
        expect.any(Object)
      );
    });

    it("shows submit error", async () => {
      setupBackendResource();

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      renderDialog();

      fireEvent.click(screen.getByText("Requirements.pdf"));

      fireEvent.click(
        screen.getByRole("button", { name: /link document/i })
      );

      await flush();

      expect(
        screen.getByText(/failed to link document/i)
      ).toBeInTheDocument();
    });

    it("shows linking state while submitting", async () => {
      setupBackendResource();

      let resolve!: (value: any) => void;

      vi.mocked(globalThis.fetch).mockReturnValueOnce(
        new Promise((r) => {
          resolve = r;
        })
      );

      renderDialog();

      fireEvent.click(screen.getByText("Requirements.pdf"));

      fireEvent.click(
        screen.getByRole("button", { name: /link document/i })
      );

      expect(screen.getByText(/linking/i)).toBeInTheDocument();

      resolve({ ok: true });

      await flush();
    });
  });

  describe("actions", () => {
    it("closes dialog when cancel is clicked", () => {
      setupBackendResource();

      renderDialog();

      fireEvent.click(
        screen.getByRole("button", { name: /cancel/i })
      );

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});