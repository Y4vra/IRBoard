import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ObserveLinkedFRDialog } from "@/components/dialogs/observation/ObserveFrDialog";
import { useBackendResource, type UseBackendResourceResult } from "@/hooks/useBackendResource";
import type { FunctionalityWithRequirements } from "@/types/Functionality";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("@/hooks/useBackendResource");

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => <div>{text}</div>,
}));

vi.mock("@/components/badges/RequirementStateBadge", () => ({
  RequirementStateBadge: ({ state }: { state: string }) => (
    <span>{state}</span>
  ),
}));

async function tick(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

const mockRefresh = vi.fn();
const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

const mockGroups: FunctionalityWithRequirements[] = [
  {
    id: "1",
    entityIdentifier:"",
    name: "Authentication",
    projectId:1,
    state:"ACTIVE",
    label: "FUNC-1",
    requirements: [
      {
        id: 10,
        entityIdentifier:"FR-10",
        name: "Login",
        description: "User login",
        state: "APPROVED",
        functionalityId: 1,
        priority: "HIGH",
        observedDocuments: [],
        observedFRequirements: [],
        observedNFRequirements: [],
        observedStakeholders: [],
        orderValue: 1,
        parentId: NaN,
        stability:"LOW",
        children: [
          {
            id: 11,
            entityIdentifier:"FR-11",
            name: "OAuth Login",
            description: "OAuth support",
            state: "PENDING_APPROVAL",
            functionalityId: 1,
            priority: "HIGH",
            observedDocuments: [],
            observedFRequirements: [],
            observedNFRequirements: [],
            observedStakeholders: [],
            orderValue: 1,
            parentId: NaN,
            stability:"LOW",
            children: [],
          },
        ],
      },
      {
        id: 12,
        entityIdentifier:"FR-12",
        name: "Register",
        description: "User registration",
        state: "PENDING_APPROVAL",
        functionalityId: 1,
        priority: "HIGH",
        observedDocuments: [],
        observedFRequirements: [],
        observedNFRequirements: [],
        observedStakeholders: [],
        orderValue: 1,
        parentId: NaN,
        stability:"LOW",
        children: [],
      },
    ],
  },
];

function setupBackendResource({
  data = mockGroups,
  loading = false,
  error = null as string|null,
} = {}) {
  vi.mocked(useBackendResource).mockReturnValue({
    data,
    loading,
    error,
    refresh: mockRefresh,
  } as UseBackendResourceResult<FunctionalityWithRequirements[]>);
}

function renderDialog() {
  return render(
    <ObserveLinkedFRDialog
      open={true}
      onOpenChange={mockOnOpenChange}
      projectId="1"
      functionalityId="2"
      functionalRequirementId="99"
      onSuccess={mockOnSuccess}
    />
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("ObserveLinkedFRDialog", () => {
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
        screen.getByText(/loading requirements/i)
      ).toBeInTheDocument();
    });

    it("shows fetch error", () => {
      setupBackendResource({ error: "Failed to fetch requirements" });

      renderDialog();

      expect(
        screen.getByText(/failed to fetch requirements/i)
      ).toBeInTheDocument();
    });

    it("shows empty state when no groups exist", () => {
      setupBackendResource({ data: [] });

      renderDialog();

      expect(
        screen.getByText(/no functional requirements found/i)
      ).toBeInTheDocument();
    });
  });

  describe("group rendering", () => {
    it("renders functionality groups and FRs", () => {
      setupBackendResource();

      renderDialog();

      expect(screen.getByText(/authentication/i)).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });

    it("calls refresh when opened", () => {
      setupBackendResource();

      renderDialog();

      expect(mockRefresh).toHaveBeenCalled();
    });

    it("disables link button initially", () => {
      setupBackendResource();

      renderDialog();

      expect(
        screen.getByRole("button", { name: /link requirement/i })
      ).toBeDisabled();
    });
  });

  describe("tree expansion", () => {
    it("expands nested requirements", () => {
      setupBackendResource();

      renderDialog();

      expect(screen.queryByText("OAuth Login")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("expand-fr-10"));

      expect(screen.getByText("OAuth Login")).toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("allows selecting a requirement", () => {
      setupBackendResource();

      renderDialog();

      fireEvent.click(screen.getByText("Register"));

      expect(
        screen.getByRole("button", { name: /link requirement/i })
      ).not.toBeDisabled();
    });

    it("prevents selecting current requirement", () => {
      setupBackendResource({
        data: [
          {
            id: "1",
            entityIdentifier:"FUNC-1",
            projectId:1,
            name: "Auth",
            label:"A",
            state:"ACTIVE",
            requirements: [
              {
                id: 99,
                entityIdentifier:"FR-99",
                name: "Current Requirement",
                state: "PENDING_APPROVAL",
                description:"desc",
                functionalityId:1,
                observedDocuments:[],
                observedFRequirements:[],
                observedNFRequirements:[],
                observedStakeholders:[],
                orderValue:0,
                parentId:NaN,
                priority:"HIGH",
                stability:"LOW",
                children: [],
              },
            ],
          },
        ],
      });

      render(
        <ObserveLinkedFRDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          projectId="1"
          functionalityId="2"
          functionalRequirementId="99"
          onSuccess={mockOnSuccess}
        />
      );

      expect(
        screen.getByText("Current Requirement").closest("button")
      ).toBeDisabled();
    });
  });

  describe("search", () => {
    it("filters requirements by name", () => {
      setupBackendResource();

      renderDialog();

      fireEvent.change(
        screen.getByPlaceholderText(/search requirements/i),
        { target: { value: "register" } }
      );

      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.queryByText("Login")).toBeNull();
    });

    it("shows empty search state", () => {
      setupBackendResource();

      renderDialog();

      fireEvent.change(
        screen.getByPlaceholderText(/search requirements/i),
        { target: { value: "xyz123" } }
      );

      expect(
        screen.getByText(/no requirements match your search/i)
      ).toBeInTheDocument();
    });
  });

  describe("submit", () => {
    it("links requirement successfully", async () => {
      setupBackendResource();

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      renderDialog();

      fireEvent.click(screen.getByText("Register"));
      fireEvent.click(
        screen.getByRole("button", { name: /link requirement/i })
      );

      await flush();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/linkRequirement"),
        expect.objectContaining({
          method: "POST",
        })
      );

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows submit error", async () => {
      setupBackendResource();

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      renderDialog();

      fireEvent.click(screen.getByText("Register"));
      fireEvent.click(
        screen.getByRole("button", { name: /link requirement/i })
      );

      await tick();

      expect(
        screen.getByText(/failed to link requirement/i)
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

      fireEvent.click(screen.getByText("Register"));
      fireEvent.click(
        screen.getByRole("button", { name: /link requirement/i })
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

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});