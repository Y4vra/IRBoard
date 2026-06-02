import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FunctionalitiesProviderWrapper } from "@/components/wrappers/FunctionalitiesProviderWrapper";
import { useBackendResource } from "@/hooks/useBackendResource";
import type { FunctionalitiesProviderProps } from "@/context/FunctionalitiesContext";

const mockUseParams = vi.fn();

vi.mock("react-router-dom", () => ({
  Outlet: () => <div>Outlet Content</div>,
  useParams: () => mockUseParams(),
}));

const mockProvider = vi.fn();

vi.mock("@/context/FunctionalitiesContext", () => ({
  FunctionalitiesProvider: (props: FunctionalitiesProviderProps
  ) => {
    mockProvider(props);
    return <>{props.children}</>;
  },
}));

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: vi.fn(),
}));

describe("FunctionalitiesProviderWrapper", () => {
  const refresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({
      projectId: "123",
    });
  });

  it("passes hook data into FunctionalitiesProvider", () => {
    const functionalities = {
      functionalities: [],
    };

    vi.mocked(useBackendResource).mockReturnValue({
      data: functionalities,
      loading: false,
      error: null,
      refresh,
    });

    render(<FunctionalitiesProviderWrapper />);

    expect(mockProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        functionalities,
        loading: false,
        error: null,
        refresh,
      })
    );

    expect(
      screen.getByText("Outlet Content")
    ).toBeInTheDocument();
  });

  it("passes null when data is undefined", () => {
    vi.mocked(useBackendResource).mockReturnValue({
      data: undefined,
      loading: true,
      error: "boom",
      refresh,
    });

    render(<FunctionalitiesProviderWrapper />);

    expect(mockProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        functionalities: null,
        loading: true,
        error: "boom",
        refresh,
      })
    );
  });

  it("provides a fetcher to useBackendResource", () => {
    vi.mocked(useBackendResource).mockReturnValue({
      data: undefined,
      loading: false,
      error: null,
      refresh,
    });

    render(<FunctionalitiesProviderWrapper />);

    expect(useBackendResource).toHaveBeenCalledWith(
      expect.objectContaining({
        fetcher: expect.any(Function),
      })
    );
  });
});