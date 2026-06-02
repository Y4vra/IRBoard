import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntityStateBadge } from "@/components/badges/EntityStateBadge";

describe("EntityStateBadge", () => {
  it("renders PENDING_APPROVAL state", () => {
    render(<EntityStateBadge state="PENDING_APPROVAL" />);

    const badge = screen.getByText("Pending Approval");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-amber-50");
    expect(badge.className).toContain("text-amber-700");
  });

  it("renders APPROVED state", () => {
    render(<EntityStateBadge state="APPROVED" />);

    const badge = screen.getByText("Approved");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-blue-50");
    expect(badge.className).toContain("text-blue-700");
  });

  it("renders DEACTIVATED state", () => {
    render(<EntityStateBadge state="DEACTIVATED" />);

    const badge = screen.getByText("Deactivated");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-slate-100");
    expect(badge.className).toContain("text-slate-600");
  });

  it("renders REMOVED state", () => {
    render(<EntityStateBadge state="REMOVED" />);

    const badge = screen.getByText("Removed");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-red-50");
    expect(badge.className).toContain("text-red-700");
  });

  it("falls back to DEACTIVATED when state is undefined", () => {
    render(<EntityStateBadge state={undefined} />);

    const badge = screen.getByText("Deactivated");

    expect(badge).toBeInTheDocument();
  });
});