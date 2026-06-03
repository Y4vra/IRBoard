import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateFunctionalityDialog } from "@/components/dialogs/creatingDialogs/CreateFunctionalityDialog";
import { API_BASE_URL } from "@/lib/globalVars";

const onSuccess = vi.fn();

describe("CreateFunctionalityDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn();

    vi.stubGlobal("alert", vi.fn());
  });

  const openDialog = async () => {
    render(
      <CreateFunctionalityDialog
        projectId="1"
        onSuccess={onSuccess}
      />
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /add functionality/i,
      })
    );
  };

  it("renders dialog content", async () => {
    await openDialog();

    expect(
      screen.getByText("New Functionality")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("1")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /user authentication/i
      )
    ).toBeInTheDocument();
  });

  it("auto generates label from name", async () => {
    await openDialog();

    const nameInput =
      screen.getByLabelText(/functionality name/i);

    const labelInput =
      screen.getByLabelText(/label/i);

    await userEvent.type(
      nameInput,
      "User Authentication"
    );

    await waitFor(() => {
      expect(labelInput).toHaveValue("UA");
    });
  });

  it("allows manual label editing", async () => {
    await openDialog();

    const nameInput =
      screen.getByLabelText(/functionality name/i);

    const labelInput =
      screen.getByLabelText(/label/i);

    await userEvent.type(
      nameInput,
      "User Authentication"
    );

    await waitFor(() => {
      expect(labelInput).toHaveValue("UA");
    });

    await userEvent.clear(labelInput);
    await userEvent.type(labelInput, "CUSTOM");

    expect(labelInput).toHaveValue("CUSTOM");

    expect(
      screen.getByRole("button", {
        name: /reset to auto/i,
      })
    ).toBeInTheDocument();
  });

  it("resets label to auto-generated value", async () => {
    await openDialog();

    const nameInput =
      screen.getByLabelText(/functionality name/i);

    const labelInput =
      screen.getByLabelText(/label/i);

    await userEvent.type(
      nameInput,
      "User Authentication"
    );

    await userEvent.clear(labelInput);
    await userEvent.type(labelInput, "CUSTOM");

    await userEvent.click(
      screen.getByRole("button", {
        name: /reset to auto/i,
      })
    );

    await waitFor(() => {
      expect(labelInput).toHaveValue("UA");
    });
  });

  it("submits successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });

    globalThis.fetch = fetchMock;

    await openDialog();

    await userEvent.type(
      screen.getByLabelText(/functionality name/i),
      "User Authentication"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Handles login"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /^create$/i,
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/projects/1/functionalities/new`,
      expect.objectContaining({
        method: "POST",
      })
    );

    const body = JSON.parse(
      fetchMock.mock.calls[0][1].body as string
    );

    expect(body).toMatchObject({
      name: "User Authentication",
      description: "Handles login",
      label: "UA",
      projectId: "1",
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows label conflict error from 409 response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: vi.fn().mockResolvedValue({}),
    });

    await openDialog();

    await userEvent.type(
      screen.getByLabelText(/functionality name/i),
      "User Authentication"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /^create$/i,
      })
    );

    expect(
      await screen.findByText(
        /functionality with this label already exists/i
      )
    ).toBeInTheDocument();
  });

  it("shows label conflict error when backend returns label field", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        field: "label",
      }),
    });

    await openDialog();

    await userEvent.type(
      screen.getByLabelText(/functionality name/i),
      "User Authentication"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /^create$/i,
      })
    );

    expect(
      await screen.findByText(
        /functionality with this label already exists/i
      )
    ).toBeInTheDocument();
  });

  it("shows label conflict error when message contains label", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        message: "Label already exists",
      }),
    });

    await openDialog();

    await userEvent.type(
      screen.getByLabelText(/functionality name/i),
      "User Authentication"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /^create$/i,
      })
    );

    expect(
      await screen.findByText(
        /functionality with this label already exists/i
      )
    ).toBeInTheDocument();
  });

  it("shows alert on generic api error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        message: "Server error",
      }),
    });

    await openDialog();

    await userEvent.type(
      screen.getByLabelText(/functionality name/i),
      "User Authentication"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /^create$/i,
      })
    );

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        "Error creating functionality"
      );
    });
  });

  it("closes dialog when cancel is clicked", async () => {
    await openDialog();

    await userEvent.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByText("New Functionality")
      ).not.toBeInTheDocument();
    });
  });

  it("clears manual label mode when name becomes empty", async () => {
    await openDialog();

    const nameInput =
      screen.getByLabelText(/functionality name/i);

    const labelInput =
      screen.getByLabelText(/label/i);

    await userEvent.type(
      nameInput,
      "User Authentication"
    );

    await userEvent.clear(labelInput);
    await userEvent.type(labelInput, "CUSTOM");

    expect(labelInput).toHaveValue("CUSTOM");

    await userEvent.clear(nameInput);

    await waitFor(() => {
      expect(labelInput).toHaveValue("");
    });
  });
});