import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RequirementStateBadge } from "@/components/badges/RequirementStateBadge";

describe("RequirementStateBadge", () => {
  it("renders PENDING_APPROVAL state", () => {
    render(<RequirementStateBadge state="PENDING_APPROVAL" />);

    const badge = screen.getByText("Pending Approval");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-amber-50");
    expect(badge.className).toContain("text-amber-700");
  });

  it("renders APPROVED state", () => {
    render(<RequirementStateBadge state="APPROVED" />);

    const badge = screen.getByText("Approved");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-blue-50");
    expect(badge.className).toContain("text-blue-700");
  });

  it("renders FINISHED state", () => {
    render(<RequirementStateBadge state="FINISHED" />);

    const badge = screen.getByText("Finished");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-emerald-50");
    expect(badge.className).toContain("text-emerald-700");
  });

  it("renders DEACTIVATED state", () => {
    render(<RequirementStateBadge state="DEACTIVATED" />);

    const badge = screen.getByText("Deactivated");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-slate-100");
    expect(badge.className).toContain("text-slate-600");
  });

  it("renders REMOVED state", () => {
    render(<RequirementStateBadge state="REMOVED" />);

    const badge = screen.getByText("Removed");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-red-50");
    expect(badge.className).toContain("text-red-700");
  });

  it("falls back to DEACTIVATED when state is undefined", () => {
    render(<RequirementStateBadge state={undefined} />);

    expect(screen.getByText("Deactivated")).toBeInTheDocument();
  });
});