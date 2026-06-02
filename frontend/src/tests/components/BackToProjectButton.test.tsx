import { BackToProjectButton } from "@/components/BackToProjectButton";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

describe("BackToProjectButton", () => {
  function renderButton(
    projectId = "123",
    className?: string
  ) {
    return render(
      <MemoryRouter>
        <BackToProjectButton
          projectId={projectId}
          className={className}
        />
      </MemoryRouter>
    );
  }

  it("renders button text", () => {
    renderButton();

    expect(
      screen.getByText(/back to project/i)
    ).toBeInTheDocument();
  });

  it("links to the correct project page", () => {
    renderButton("42");

    const link = screen.getByRole("link", {
      name: /back to project/i,
    });

    expect(link).toHaveAttribute(
      "href",
      "/project/42"
    );
  });

  it("applies custom className", () => {
    renderButton("123", "custom-class");

    const link = screen.getByRole("link", {
      name: /back to project/i,
    });

    expect(link.closest(".custom-class")).toBeInTheDocument();
  });

  it("renders inside a button wrapper", () => {
    renderButton();

    expect(
      screen.getByRole("link", {
        name: /back to project/i,
      })
    ).toBeInTheDocument();
  });
});