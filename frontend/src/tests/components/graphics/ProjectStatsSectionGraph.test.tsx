import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectStatsSection } from "@/components/graphics/ProjectStatsSectionGraph";
import type { Project } from "@/types/Project";

vi.mock("@/components/graphics/StatsChart", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/graphics/StatsChart")>();

  return {
    ...actual,

    StatsChart: ({ stats }: { stats: Record<string, number> }) => (
      <div data-testid="stats-chart">
        {JSON.stringify(stats)}
      </div>
    ),
  };
});

describe("ProjectStatsSection", () => {
  const baseProject: Project = {
    id: "1",
    name: "Test Project",
    description: "Test Description",
    priorityStyle: "MOSCOW",
    state: "ACTIVE",
    editPermission: true,
    stakeholderStats: {},
    documentStats: {},
    nonFunctionalRequirementStats: {},
    functionalRequirementStats: {},
  };

  it("renders nothing when no statistics exist", () => {
    const { container } = render(
      <ProjectStatsSection project={baseProject} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders stakeholder statistics", () => {
    render(
      <ProjectStatsSection
        project={{
          ...baseProject,
          stakeholderStats: {
            APPROVED: 2,
            PENDING_APPROVAL: 1,
          },
        }}
      />
    );

    expect(
      screen.getByText("Stakeholders")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/APPROVED/)
    ).toBeInTheDocument();
  });

  it("renders non-functional requirement statistics", () => {
    render(
      <ProjectStatsSection
        project={{
          ...baseProject,
          nonFunctionalRequirementStats: {
            FINISHED: 3,
          },
        }}
      />
    );

    expect(
      screen.getByText("Non-Functional Requirements")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/FINISHED/)
    ).toBeInTheDocument();
  });

  it("renders document statistics", () => {
    render(
      <ProjectStatsSection
        project={{
          ...baseProject,
          documentStats: {
            FINISHED: 5,
          },
        }}
      />
    );

    expect(
      screen.getByText("Documents")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/FINISHED/)
    ).toBeInTheDocument();
  });

  it("aggregates functional requirement statistics", () => {
    render(
      <ProjectStatsSection
        project={{
          ...baseProject,
          functionalRequirementStats: {
            SECURITY: {
              APPROVED: 2,
              PENDING_APPROVAL: 1,
            },
            PERFORMANCE: {
              FINISHED: 3,
            },
          },
        }}
      />
    );

    expect(
      screen.getByText("Functional Requirements")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        '{"APPROVED":2,"PENDING_APPROVAL":1,"FINISHED":3}'
      )
    ).toBeInTheDocument();
  });

  it("renders functionality breakdown rows", () => {
    render(
      <ProjectStatsSection
        project={{
          ...baseProject,
          functionalRequirementStats: {
            SECURITY: {
              APPROVED: 2,
            },
            PERFORMANCE: {
              FINISHED: 1,
            },
          },
        }}
      />
    );

    expect(
      screen.getByText("Requirements by Functionality")
    ).toBeInTheDocument();

    expect(
      screen.getByText("#SECURITY")
    ).toBeInTheDocument();

    expect(
      screen.getByText("#PERFORMANCE")
    ).toBeInTheDocument();
  });

  it("renders multiple sections together", () => {
    render(
      <ProjectStatsSection
        project={{
          ...baseProject,
          stakeholderStats: {
            APPROVED: 1,
          },
          documentStats: {
            FINISHED: 2,
          },
          nonFunctionalRequirementStats: {
            PENDING_APPROVAL: 3,
          },
        }}
      />
    );

    expect(
      screen.getByText("Stakeholders")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Documents")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Non-Functional Requirements")
    ).toBeInTheDocument();
  });

  it("does not render sections whose stats are empty", () => {
    render(
      <ProjectStatsSection
        project={{
          ...baseProject,
          stakeholderStats: {
            APPROVED: 1,
          },
          documentStats: {},
          nonFunctionalRequirementStats: {},
          functionalRequirementStats: {},
        }}
      />
    );

    expect(
      screen.getByText("Stakeholders")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Documents")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Non-Functional Requirements")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Functional Requirements")
    ).not.toBeInTheDocument();
  });
});