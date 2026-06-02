import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectStateBadge } from "@/components/badges/ProjectStateBadge";

describe("ProjectStateBadge", () => {
  it("renders ACTIVE state", () => {
    render(<ProjectStateBadge state="ACTIVE" />);

    const badge = screen.getByText("Active");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-blue-50");
    expect(badge.className).toContain("text-blue-700");
  });

  it("renders FINISHED state", () => {
    render(<ProjectStateBadge state="FINISHED" />);

    const badge = screen.getByText("Finished");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-emerald-50");
    expect(badge.className).toContain("text-emerald-700");
  });

  it("renders DEACTIVATED state", () => {
    render(<ProjectStateBadge state="DEACTIVATED" />);

    const badge = screen.getByText("Deactivated");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-slate-100");
    expect(badge.className).toContain("text-slate-600");
  });

  it("renders REMOVED state", () => {
    render(<ProjectStateBadge state="REMOVED" />);

    const badge = screen.getByText("Removed");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-red-50");
    expect(badge.className).toContain("text-red-700");
  });

  it("falls back to DEACTIVATED when state is undefined", () => {
    render(<ProjectStateBadge state={undefined} />);

    expect(screen.getByText("Deactivated")).toBeInTheDocument();
  });

  it("renders Activity icon", () => {
    const { container } = render(
      <ProjectStateBadge state="ACTIVE" />
    );

    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
  });
});