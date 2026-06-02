import LoadingSpinner from "@/components/LoadingSpinner";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("LoadingSpinner", () => {
  it("renders default loading text", () => {
    render(<LoadingSpinner />);

    expect(
      screen.getByText("Loading...")
    ).toBeInTheDocument();
  });

  it("renders custom loading text", () => {
    render(
      <LoadingSpinner text="Fetching data..." />
    );

    expect(
      screen.getByText("Fetching data...")
    ).toBeInTheDocument();
  });

  it("renders the spinner icon", () => {
    const { container } = render(
      <LoadingSpinner />
    );

    expect(
      container.querySelector(".animate-spin")
    ).toBeInTheDocument();
  });

  it("renders the loading container", () => {
    const { container } = render(
      <LoadingSpinner />
    );

    expect(
      container.firstChild
    ).toHaveClass(
      "flex",
      "h-screen",
      "w-full",
      "items-center",
      "justify-center"
    );
  });
});