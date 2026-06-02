import { ProjectProviderWrapper } from "@/components/wrappers/ProjectProviderWrapper";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useBackendResource } from "@/hooks/useBackendResource";

vi.mock("@/lib/globalVars", () => ({
  API_BASE_URL: "http://api.test",
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({
    projectId: "123",
  }),
  Outlet: () => <div>Outlet Content</div>,
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: () => <div>Loading Spinner</div>,
}));

const mockProjectProvider = vi.fn();

vi.mock("@/context/ProjectContext", () => ({
  ProjectProvider: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: unknown;
  }) => {
    mockProjectProvider(value);
    return <div>{children}</div>;
  },
}));

vi.mock("@/hooks/useBackendResource", () => ({
  useBackendResource: vi.fn(),
}));

describe("ProjectProviderWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner while loading", () => {
    vi.mocked(useBackendResource)
      .mockReturnValueOnce({
        data: undefined,
        loading: true,
        refresh: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: undefined,
        loading: false,
      } as never);

    render(<ProjectProviderWrapper />);

    expect(
      screen.getByText("Loading Spinner")
    ).toBeInTheDocument();
  });

  it("renders outlet when project data is missing", () => {
    vi.mocked(useBackendResource)
      .mockReturnValueOnce({
        data: undefined,
        loading: false,
        refresh: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: false,
        loading: false,
      } as never);

    render(<ProjectProviderWrapper />);

    expect(
      screen.getByText("Outlet Content")
    ).toBeInTheDocument();

    expect(mockProjectProvider).not.toHaveBeenCalled();
  });

  it("provides project context when project exists", () => {
    const refresh = vi.fn();

    const project = {
      id: 123,
      name: "Test Project",
    };

    vi.mocked(useBackendResource)
      .mockReturnValueOnce({
        data: project,
        loading: false,
        refresh,
      } as never)
      .mockReturnValueOnce({
        data: true,
        loading: false,
      } as never);

    render(<ProjectProviderWrapper />);

    expect(
      screen.getByText("Outlet Content")
    ).toBeInTheDocument();

    expect(mockProjectProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 123,
        name: "Test Project",
        isManager: true,
        refresh,
      })
    );
  });

  it("defaults isManager to false when undefined", () => {
    const refresh = vi.fn();

    vi.mocked(useBackendResource)
      .mockReturnValueOnce({
        data: {
          id: 1,
          name: "Project",
        },
        loading: false,
        refresh,
      } as never)
      .mockReturnValueOnce({
        data: undefined,
        loading: false,
      } as never);

    render(<ProjectProviderWrapper />);

    expect(mockProjectProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        isManager: false,
      })
    );
  });
});