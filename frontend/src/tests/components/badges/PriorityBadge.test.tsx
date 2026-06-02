import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriorityBadge } from "@/components/badges/PriorityBadge";

describe("PriorityBadge", () => {
  it("renders MOSCOW MUST priority", () => {
    render(
      <PriorityBadge priority="MUST" priorityStyle="MOSCOW" />
    );

    const badge = screen.getByText("MUST");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-amber-50");
    expect(badge.className).toContain("text-amber-700");
  });

  it("renders MOSCOW SHOULD priority", () => {
    render(
      <PriorityBadge priority="SHOULD" priorityStyle="MOSCOW" />
    );

    const badge = screen.getByText("SHOULD");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-blue-50");
  });

  it("renders TERNARY HIGH priority", () => {
    render(
      <PriorityBadge priority="HIGH" priorityStyle="TERNARY" />
    );

    const badge = screen.getByText("HIGH");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-amber-50");
  });

  it("renders fallback style for unknown priority", () => {
    render(
      <PriorityBadge priority="UNKNOWN" priorityStyle="MOSCOW" />
    );

    const badge = screen.getByText("UNKNOWN");

    expect(badge.className).toContain("bg-slate-100");
    expect(badge.className).toContain("text-slate-500");
  });

  it("returns null when priority is not provided", () => {
    const { container } = render(
      <PriorityBadge priority={null} priorityStyle="MOSCOW" />
    );

    expect(container.firstChild).toBeNull();
  });

  it("switches style map based on priorityStyle", () => {
    render(
      <PriorityBadge priority="LOW" priorityStyle="TERNARY" />
    );

    const badge = screen.getByText("LOW");

    expect(badge.className).toContain("bg-slate-100");
  });
});