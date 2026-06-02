import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatsChart, DEFAULT_STATE_COLORS } from "@/components/graphics/StatsChart";

describe("StatsChart", () => {
  it("renders no data state when total is zero", () => {
    render(
      <StatsChart
        title="Requirements"
        stats={{
          APPROVED: 0,
          FINISHED: 0,
        }}
      />
    );

    expect(screen.getByText("Requirements")).toBeInTheDocument();
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(
      <StatsChart
        title="Stakeholders"
        stats={{
          APPROVED: 2,
        }}
      />
    );

    expect(screen.getByText("Stakeholders")).toBeInTheDocument();
  });

  it("renders total in donut center", () => {
    render(
      <StatsChart
        stats={{
          APPROVED: 2,
          FINISHED: 3,
        }}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("total")).toBeInTheDocument();
  });

  it("renders legend entries", () => {
    render(
      <StatsChart
        stats={{
          APPROVED: 2,
          PENDING_APPROVAL: 1,
        }}
      />
    );

    expect(screen.getByText("APPROVED")).toBeInTheDocument();
    expect(screen.getByText("PENDING APPROVAL")).toBeInTheDocument();

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders one slice per non-zero state", () => {
    const { container } = render(
      <StatsChart
        stats={{
          APPROVED: 2,
          FINISHED: 3,
          REMOVED: 1,
        }}
      />
    );

    const paths = container.querySelectorAll("path");

    expect(paths).toHaveLength(3);
  });

  it("uses custom color map when provided", () => {
    const { container } = render(
      <StatsChart
        stats={{
          CUSTOM: 4,
        }}
        colorMap={{
          CUSTOM: "#123456",
        }}
      />
    );

    const path = container.querySelector("path");

    expect(path).toHaveAttribute("fill", "#123456");
  });

  it("uses default state colors", () => {
    const { container } = render(
      <StatsChart
        stats={{
          APPROVED: 1,
        }}
      />
    );

    const path = container.querySelector("path");

    expect(path).toHaveAttribute(
      "fill",
      DEFAULT_STATE_COLORS.APPROVED
    );
  });

  it("renders tooltip titles for slices", () => {
    const { container } = render(
      <StatsChart
        stats={{
          APPROVED: 2,
        }}
      />
    );

    const title = container.querySelector("title");

    expect(title?.textContent).toContain("APPROVED");
    expect(title?.textContent).toContain("2");
  });
});