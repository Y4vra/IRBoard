import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectHealthBar } from "@/components/graphics/ProjectHealthBar";
import type { Project } from "@/types/Project";

describe("ProjectHealthBar", () => {
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

  it("renders nothing when all stats are empty", () => {
    const { container } = render(
      <ProjectHealthBar project={baseProject as Project} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders stakeholder stats", () => {
    render(
      <ProjectHealthBar
        project={{
          ...baseProject,
          stakeholderStats: {
            APPROVED: 2,
            PENDING_APPROVAL: 1,
          },
        } as Project}
      />
    );

    expect(
      screen.getByText("Stakeholders")
    ).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1 pending")).toBeInTheDocument();
  });

  it("renders document stats", () => {
    render(
      <ProjectHealthBar
        project={{
          ...baseProject,
          documentStats: {
            FINISHED: 5,
          },
        } as Project}
      />
    );

    expect(screen.getByText("Documents")).toBeInTheDocument();

    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });

  it("renders NFR stats", () => {
    render(
      <ProjectHealthBar
        project={{
          ...baseProject,
          nonFunctionalRequirementStats: {
            APPROVED: 2,
            FINISHED: 3,
          },
        } as Project}
      />
    );

    expect(screen.getByText("NFR")).toBeInTheDocument();

    // done = approved + finished
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });

  it("aggregates functional requirement stats", () => {
    render(
      <ProjectHealthBar
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
        } as Project}
      />
    );

    expect(
      screen.getByText("F.Requirements")
    ).toBeInTheDocument();

    // total = 2 + 1 + 3
    expect(screen.getByText("6")).toBeInTheDocument();

    // done = approved + finished
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);

    expect(screen.getByText("1 pending")).toBeInTheDocument();
  });

  it("renders multiple sections together", () => {
    render(
      <ProjectHealthBar
        project={{
          ...baseProject,
          stakeholderStats: { APPROVED: 1 },
          documentStats: { FINISHED: 2 },
          nonFunctionalRequirementStats: { PENDING_APPROVAL: 3 },
        } as Project}
      />
    );

    expect(screen.getByText("Stakeholders")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("NFR")).toBeInTheDocument();
  });

  it("does not render empty sections", () => {
    render(
      <ProjectHealthBar
        project={{
          ...baseProject,
          stakeholderStats: { "APPROVED": 1 },
          documentStats: {},
        } as Project}
      />
    );

    expect(screen.getByText("Stakeholders")).toBeInTheDocument();

    expect(
      screen.queryByText("Documents")
    ).not.toBeInTheDocument();
  });
});