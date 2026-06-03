import { render, screen, fireEvent, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { EditUserDialog } from "@/components/dialogs/updatingDialogs/EditUserDialog";
import type { User } from "@/types/User";

const user: User = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "john@test.com",
  isAdmin: false,
  active: true,
  functionalitiesWhereUserIsEngineer: null,
  functionalitiesWhereUserIsStakeholder: null,
  projectsWhereUserIsManager: null,
};

function setup() {
  const onSuccess = vi.fn();

  render(
    <EditUserDialog
      user={user}
      onSuccess={onSuccess}
    />
  );

  return { onSuccess };
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function openDialog() {
  fireEvent.click(
    screen.getByRole("button", { name: /edit/i })
  );

  await flush();
}

describe("EditUserDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("requests edit lock when opened", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    setup();

    await openDialog();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/users/${user.id}/requestEdit`),
      expect.any(Object)
    );

    expect(
      screen.getByLabelText(/^name$/i)
    ).toBeInTheDocument();
  });

  it("shows conflict error on 409", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
    } as Response);

    setup();

    await openDialog();

    expect(
      screen.getByText(/currently being edited/i)
    ).toBeInTheDocument();
  });

  it("shows server error on lock failure", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    setup();

    await openDialog();

    expect(
      screen.getByText(/server error while requesting edit lock/i)
    ).toBeInTheDocument();
  });

  it("renders form after successful lock", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    setup();

    await openDialog();

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/surname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("submits changes successfully", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

    const { onSuccess } = setup();

    await openDialog();

    fireEvent.change(
      screen.getByLabelText(/^name$/i),
      {
        target: { value: "Jane" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await flush();

    expect(onSuccess).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
  });

  it("shows save error on 500", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

    setup();

    await openDialog();

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await flush();

    expect(
      screen.getByText(/an error occurred while saving/i)
    ).toBeInTheDocument();
  });

  it("shows permission error on 403", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response);

    setup();

    await openDialog();

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await flush();

    expect(
      screen.getByText(/do not have permission/i)
    ).toBeInTheDocument();
  });

  it("stays open while requesting lock", async () => {
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise(() => {})
    );

    setup();

    fireEvent.click(
      screen.getByRole("button", {
        name: /edit/i,
      })
    );

    expect(
      screen.getByText(/requesting edit lock/i)
    ).toBeInTheDocument();
  });
});