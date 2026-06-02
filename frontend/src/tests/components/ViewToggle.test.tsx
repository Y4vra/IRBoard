import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ViewToggle } from "@/components/ViewToggle";

describe("ViewToggle", () => {
  it("renders both toggle buttons", () => {
    render(
      <ViewToggle
        mode="active"
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /active/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /removed/i })
    ).toBeInTheDocument();
  });

  it("calls onChange with active when active button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ViewToggle
        mode="removed"
        onChange={onChange}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /active/i })
    );

    expect(onChange).toHaveBeenCalledWith("active");
  });

  it("calls onChange with removed when removed button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ViewToggle
        mode="active"
        onChange={onChange}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /removed/i })
    );

    expect(onChange).toHaveBeenCalledWith("removed");
  });

  it("renders active count when provided", () => {
    render(
      <ViewToggle
        mode="active"
        onChange={vi.fn()}
        activeCount={12}
      />
    );

    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders removed count when provided", () => {
    render(
      <ViewToggle
        mode="active"
        onChange={vi.fn()}
        removedCount={5}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders both counts when provided", () => {
    render(
      <ViewToggle
        mode="active"
        onChange={vi.fn()}
        activeCount={12}
        removedCount={5}
      />
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not render count badges when counts are undefined", () => {
    render(
      <ViewToggle
        mode="active"
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("applies active styling when mode is active", () => {
    render(
      <ViewToggle
        mode="active"
        onChange={vi.fn()}
      />
    );

    const activeButton = screen.getByRole("button", {
      name: /active/i,
    });

    const removedButton = screen.getByRole("button", {
      name: /removed/i,
    });

    expect(activeButton.className).toContain("bg-white");
    expect(removedButton.className).toContain("text-slate-500");
  });

  it("applies active styling when mode is removed", () => {
    render(
      <ViewToggle
        mode="removed"
        onChange={vi.fn()}
      />
    );

    const activeButton = screen.getByRole("button", {
      name: /active/i,
    });

    const removedButton = screen.getByRole("button", {
      name: /removed/i,
    });

    expect(removedButton.className).toContain("bg-white");
    expect(activeButton.className).toContain("text-slate-500");
  });

  it("renders active badge styling when active mode is selected", () => {
    render(
      <ViewToggle
        mode="active"
        onChange={vi.fn()}
        activeCount={3}
      />
    );

    const badge = screen.getByText("3");

    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-700");
  });

  it("renders removed badge styling when removed mode is selected", () => {
    render(
      <ViewToggle
        mode="removed"
        onChange={vi.fn()}
        removedCount={4}
      />
    );

    const badge = screen.getByText("4");

    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-600");
  });
});