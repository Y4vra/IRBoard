import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RemoveButton } from "@/components/RemoveButton";

describe("RemoveButton", () => {
  it("renders remove button", () => {
    render(<RemoveButton onClick={vi.fn()} />);

    expect(
        screen.getByRole("button", { name: /remove/i })
    ).toBeInTheDocument();
  });

  it("renders title attribute", () => {
    render(<RemoveButton onClick={vi.fn()} />);

    expect(
      screen.getByTitle("Remove")
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<RemoveButton onClick={onClick} />);

    await user.click(screen.getByTitle("Remove"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call parent click handler because propagation is stopped", async () => {
    const user = userEvent.setup();

    const parentClick = vi.fn();
    const buttonClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <RemoveButton onClick={buttonClick} />
      </div>
    );

    await user.click(screen.getByTitle("Remove"));

    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("is enabled by default", () => {
    render(<RemoveButton onClick={vi.fn()} />);

    expect(
      screen.getByTitle("Remove")
    ).toBeEnabled();
  });

  it("is disabled when loading is true", () => {
    render(
      <RemoveButton
        onClick={vi.fn()}
        loading
      />
    );

    expect(
      screen.getByTitle("Remove")
    ).toBeDisabled();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <RemoveButton
        onClick={onClick}
        loading
      />
    );

    await user.click(screen.getByTitle("Remove"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies expected css classes", () => {
    render(<RemoveButton onClick={vi.fn()} />);

    const button = screen.getByTitle("Remove");

    expect(button.className).toContain("shrink-0");
    expect(button.className).toContain("hover:text-red-500");
    expect(button.className).toContain("disabled:opacity-50");
  });
});