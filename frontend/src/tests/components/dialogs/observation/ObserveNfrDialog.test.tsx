import { render, screen, fireEvent, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ObserveNFRDialog } from "@/components/dialogs/observation/ObserveNfrDialog";
import { useBackendResource } from "@/hooks/useBackendResource";
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement";

vi.mock("@/hooks/useBackendResource");

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ text }: { text?: string }) => <div>{text}</div>,
}));

vi.mock("@/components/badges/RequirementStateBadge", () => ({
  RequirementStateBadge: ({ state }: { state: string }) => (
    <span>{state}</span>
  ),
}));

const mockRefresh = vi.fn();

const mockNfrs: NonFunctionalRequirement[] = [
  {
    id: 1,
    name: "Performance",
    description: "Fast response times",
    entityIdentifier: "1-NFR-performance",
    state: "APPROVED",
  } as NonFunctionalRequirement,
  {
    id: 2,
    name: "Security",
    description: "Secure authentication",
    entityIdentifier: "2-NFR-security",
    state: "PENDING_APPROVAL",
  } as NonFunctionalRequirement,
];

function setup(props = {}) {
  const onSuccess = vi.fn();
  const onOpenChange = vi.fn();

  render(
    <ObserveNFRDialog
      open={true}
      onOpenChange={onOpenChange}
      projectId="1"
      functionalityId="10"
      requirementType="FR"
      requirementId="20"
      onSuccess={onSuccess}
      {...props}
    />
  );

  return {
    onSuccess,
    onOpenChange,
  };
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("ObserveNFRDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    globalThis.fetch = vi.fn();

    vi.mocked(useBackendResource).mockReturnValue({
      data: mockNfrs,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders dialog title", () => {
    setup();

    expect(
      screen.getByText(/link non-functional requirement/i)
    ).toBeInTheDocument();
  });

  it("calls refresh when opened", () => {
    setup();

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("renders fetched NFRs", () => {
    setup();

    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();

    expect(
      screen.getByText("1-NFR-performance")
    ).toBeInTheDocument();

    expect(
      screen.getByText("2-NFR-security")
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.mocked(useBackendResource).mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    setup();

    expect(
      screen.getByText(/loading nfrs/i)
    ).toBeInTheDocument();
  });

  it("shows fetch error", () => {
    vi.mocked(useBackendResource).mockReturnValue({
      data: undefined,
      loading: false,
      error: "Failed to fetch non-functional requirements",
      refresh: mockRefresh,
    });

    setup();

    expect(
      screen.getByText(/failed to fetch non-functional requirements/i)
    ).toBeInTheDocument();
  });

  it("shows empty state", () => {
    vi.mocked(useBackendResource).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    setup();

    expect(
      screen.getByText(/no nfrs found/i)
    ).toBeInTheDocument();
  });

  it("filters NFRs by name", () => {
    setup();

    fireEvent.change(
      screen.getByPlaceholderText(/search by name or identifier/i),
      { target: { value: "security" } }
    );

    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.queryByText("Performance")).toBeNull();
  });

  it("filters NFRs by identifier", () => {
    setup();

    fireEvent.change(
      screen.getByPlaceholderText(/search by name or identifier/i),
      { target: { value: "performance" } }
    );

    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.queryByText("Security")).toBeNull();
  });

  it("enables submit button after selecting an NFR", () => {
    setup();

    const submitButton = screen.getByRole("button", {
      name: /link nfr/i,
    });

    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByText("Performance"));

    expect(submitButton).not.toBeDisabled();
  });

  it("submits successfully for FR requirement", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const { onSuccess, onOpenChange } = setup();

    fireEvent.click(screen.getByText("Performance"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /link nfr/i,
      })
    );

    await flush();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/functionalRequirements/20/linkRequirement"
      ),
      expect.objectContaining({
        method: "POST",
      })
    );

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("submits successfully for NFR requirement", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const { onSuccess } = setup({
      requirementType: "NFR",
    });

    fireEvent.click(screen.getByText("Performance"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /link nfr/i,
      })
    );

    await flush();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/nonFunctionalRequirements/20/linkNfr"
      ),
      expect.any(Object)
    );

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows submit error when linking fails", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    setup();

    fireEvent.click(screen.getByText("Performance"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /link nfr/i,
      })
    );

    await flush();

    expect(
      screen.getByText(/failed to link nfr/i)
    ).toBeInTheDocument();
  });

  it("closes when cancel is clicked", () => {
    const { onOpenChange } = setup();

    fireEvent.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("sends selected NFR id in request body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    setup();

    fireEvent.click(screen.getByText("Security"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /link nfr/i,
      })
    );

    await flush();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(2),
      })
    );
  });
});