import { LockIndicator } from "@/components/LockIndicator";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { EntityLockDTO } from "@/types/EntityLock";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("LockIndicator", () => {
  const lock = {
    username: "john.doe",
    entityType:"FUNCTIONALITY",
    entityId:3,
    lockedAt:"2026-06-02T14:30:00"
  };

  function renderIndicator(lock?: EntityLockDTO) {
    return render(
      <TooltipProvider>
        <LockIndicator lock={lock} />
      </TooltipProvider>
    );
  }

  it("renders nothing when lock is undefined", () => {
    const { container } = renderIndicator(undefined);

    expect(container.firstChild).toBeNull();
  });

  it("renders username badge", () => {
    renderIndicator(lock);

    expect(
      screen.getByText("john.doe")
    ).toBeInTheDocument();
  });

  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup();

    renderIndicator(lock);

    await user.hover(
      screen.getByText("john.doe")
    );

    expect(
      await screen.findByRole("tooltip")
    ).toHaveTextContent(
      /currently being edited by john\.doe/i
    );
  });

  it("renders lock icon badge", () => {
    renderIndicator(lock);

    const badge = screen
      .getByText("john.doe")
      .closest("div,button,span");

    expect(badge).toBeInTheDocument();
  });
});