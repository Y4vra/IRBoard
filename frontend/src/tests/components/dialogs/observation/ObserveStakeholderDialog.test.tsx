// ObserveStakeholderDialog.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ObserveStakeholderDialog } from "@/components/dialogs/observation/ObserveStakeholderDialog";

vi.mock("@/lib/globalVars", () => ({
  API_BASE_URL: "http://localhost:8080",
}));

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: vi.fn(),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => <div>{text}</div>,
}));

vi.mock("@/components/badges/EntityStateBadge", () => ({
  EntityStateBadge: ({ state }: { state: string }) => (
    <span>{state}</span>
  ),
}));

import { useBackendResource } from "@/hooks/useBackendResource";

const mockUseBackendResource = vi.mocked(useBackendResource);

const stakeholders = [
  {
    id: 1,
    name: "Alice Johnson",
    description: "Product owner",
    state: "ACTIVE",
  },
  {
    id: 2,
    name: "Bob Smith",
    description: "Business analyst",
    state: "ACTIVE",
  },
];

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  projectId: "1",
  functionalityId: "10",
  requirementId: "20",
  requirementType: "FR" as const,
  onSuccess: vi.fn(),
};

describe("ObserveStakeholderDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseBackendResource.mockReturnValue({
      data: stakeholders,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("renders stakeholders", () => {
    render(<ObserveStakeholderDialog {...defaultProps} />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  it("filters stakeholders through search", () => {
    render(<ObserveStakeholderDialog {...defaultProps} />);

    const searchInput =
      screen.getByPlaceholderText(/search stakeholders/i);

    fireEvent.change(searchInput, {
      target: { value: "alice" },
    });

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseBackendResource.mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    render(<ObserveStakeholderDialog {...defaultProps} />);

    expect(
      screen.getByText(/loading stakeholders/i)
    ).toBeInTheDocument();
  });

  it("shows fetch error", () => {
    mockUseBackendResource.mockReturnValue({
      data: undefined,
      loading: false,
      error: "Failed to fetch stakeholders",
      refresh: vi.fn(),
    });

    render(<ObserveStakeholderDialog {...defaultProps} />);

    expect(
      screen.getByText(/failed to fetch stakeholders/i)
    ).toBeInTheDocument();
  });

  it("shows empty state", () => {
    mockUseBackendResource.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<ObserveStakeholderDialog {...defaultProps} />);

    expect(
      screen.getByText(/no observable stakeholders were found/i)
    ).toBeInTheDocument();
  });

  it("links stakeholder successfully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
    } as Response);

    render(<ObserveStakeholderDialog {...defaultProps} />);

    fireEvent.click(screen.getByText("Alice Johnson"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /link stakeholder/i,
      })
    );

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/projects/1/functionalities/10/functionalRequirements/20/linkStakeholder",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("uses NFR endpoint when requirement type is not FR", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
    } as Response);

    render(
      <ObserveStakeholderDialog
        {...defaultProps}
        requirementType={"NFR"}
      />
    );

    fireEvent.click(screen.getByText("Alice Johnson"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /link stakeholder/i,
      })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/projects/1/nonFunctionalRequirements/20/linkStakeholder",
      expect.any(Object)
    );
  });

  it("shows submit error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    } as Response);

    render(<ObserveStakeholderDialog {...defaultProps} />);

    fireEvent.click(screen.getByText("Alice Johnson"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /link stakeholder/i,
      })
    );

    expect(
      await screen.findByText(/failed to link stakeholder/i)
    ).toBeInTheDocument();
  });

  it("disables submit button when no stakeholder selected", () => {
    render(<ObserveStakeholderDialog {...defaultProps} />);

    const submitButton = screen.getByRole("button", {
      name: /link stakeholder/i,
    });

    expect(submitButton).toBeDisabled();
  });

  it("calls onOpenChange when cancel is clicked", () => {
    render(<ObserveStakeholderDialog {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});