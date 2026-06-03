import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateFunctionalRequirementDialog";
import { API_BASE_URL } from "@/lib/globalVars";
import type { FunctionalRequirement } from "@/types/FunctionalRequirement";

const onSuccess = vi.fn();
const onOpenChange = vi.fn();


const defaultProps = {
  open: true,
  onOpenChange,
  onSuccess,
  projectId: "1",
  functionalityId: "10",
  priorityStyle: "MOSCOW" as const,
  siblingRequirements: [],
};

describe("CreateFunctionalRequirementDialog", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = fetchMock;
  });

  it("renders dialog content", () => {
    render(<CreateFunctionalRequirementDialog {...defaultProps} />);

    expect(
      screen.getByText("New Functional Requirement")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("10")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /user authentication/i
      )
    ).toBeInTheDocument();
  });

  it("shows parent section when parentId exists", () => {
    render(
      <CreateFunctionalRequirementDialog
        {...defaultProps}
        parentId={55}
      />
    );

    expect(
      screen.getByText(/parent requirement/i)
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("55")
    ).toBeInTheDocument();
  });

  it("does not show parent section without parentId", () => {
    render(<CreateFunctionalRequirementDialog {...defaultProps} />);

    expect(
      screen.queryByText(/parent requirement/i)
    ).not.toBeInTheDocument();
  });

  it("submits successfully", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    });

    render(<CreateFunctionalRequirementDialog {...defaultProps} />);

    await userEvent.type(
      screen.getByLabelText(/name/i),
      "Login"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "User authentication"
    );

    fireEvent.submit(
      screen.getByRole("button", { name: /create/i })
        .closest("form")!
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/projects/1/functionalities/10/functionalRequirements/new`,
      expect.objectContaining({
        method: "POST",
      })
    );

    const body = JSON.parse(
      fetchMock.mock.calls[0][1].body
    );

    expect(body).toMatchObject({
      name: "Login",
      description: "User authentication",
      functionalityId: 10,
      projectId: 1,
      orderValue: 1000,
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("includes parentId in payload", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    });

    render(
      <CreateFunctionalRequirementDialog
        {...defaultProps}
        parentId={99}
      />
    );

    await userEvent.type(
      screen.getByLabelText(/name/i),
      "Child FR"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Description"
    );

    fireEvent.submit(
      screen.getByRole("button", { name: /create/i })
        .closest("form")!
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const body = JSON.parse(
      fetchMock.mock.calls[0][1].body
    );

    expect(body.parentId).toBe(99);
  });

  it("computes orderValue from siblings", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    });

    render(
      <CreateFunctionalRequirementDialog
        {...defaultProps}
        siblingRequirements={[
          { orderValue: 1000 },
          { orderValue: 3000 },
          { orderValue: 2000 },
        ] as FunctionalRequirement[]}
      />
    );

    await userEvent.type(
      screen.getByLabelText(/name/i),
      "FR"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Desc"
    );

    fireEvent.submit(
      screen.getByRole("button", { name: /create/i })
        .closest("form")!
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const body = JSON.parse(
      fetchMock.mock.calls[0][1].body
    );

    expect(body.orderValue).toBe(4000);
  });

  it("shows api error message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        message: "Custom error",
      }),
    });

    render(<CreateFunctionalRequirementDialog {...defaultProps} />);

    await userEvent.type(
      screen.getByLabelText(/name/i),
      "FR"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Desc"
    );

    fireEvent.submit(
      screen.getByRole("button", { name: /create/i })
        .closest("form")!
    );

    expect(
      await screen.findByText("Custom error")
    ).toBeInTheDocument();
  });

  it("shows fallback error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error()),
    });

    render(<CreateFunctionalRequirementDialog {...defaultProps} />);

    await userEvent.type(
      screen.getByLabelText(/name/i),
      "FR"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Desc"
    );

    fireEvent.submit(
      screen.getByRole("button", { name: /create/i })
        .closest("form")!
    );

    expect(
      await screen.findByText(
        "Failed to create functional requirement"
      )
    ).toBeInTheDocument();
  });

  it("closes when cancel is clicked", async () => {
    render(<CreateFunctionalRequirementDialog {...defaultProps} />);

    await userEvent.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders ternary priority label", async () => {
    render(
      <CreateFunctionalRequirementDialog
        {...defaultProps}
        priorityStyle="TERNARY"
      />
    );

    expect(
      screen.getByText("(TERNARY)")
    ).toBeInTheDocument();
  });
});