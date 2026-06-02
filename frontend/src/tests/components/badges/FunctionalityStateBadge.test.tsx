import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunctionalityStateBadge } from "@/components/badges/FunctionalityStateBadge";

describe("FunctionalityStateBadge", () => {
  it("renders ACTIVE state", () => {
    render(<FunctionalityStateBadge state="ACTIVE" />);

    const badge = screen.getByText("Active");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-blue-50");
    expect(badge.className).toContain("text-blue-700");
  });

  it("renders DEACTIVATED state", () => {
    render(<FunctionalityStateBadge state="DEACTIVATED" />);

    const badge = screen.getByText("Deactivated");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-slate-100");
    expect(badge.className).toContain("text-slate-600");
  });

  it("renders REMOVED state", () => {
    render(<FunctionalityStateBadge state="REMOVED" />);

    const badge = screen.getByText("Removed");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-red-50");
    expect(badge.className).toContain("text-red-700");
  });

  it("renders Activity icon", () => {
    const { container } = render(
      <FunctionalityStateBadge state="ACTIVE" />
    );

    // lucide icons render as <svg>
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
  });

  it("falls back to DEACTIVATED when state is undefined", () => {
    render(<FunctionalityStateBadge state={undefined} />);

    expect(screen.getByText("Deactivated")).toBeInTheDocument();
  });
});