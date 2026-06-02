import { GapDropZone } from "@/components/GapDropZone";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

describe("GapDropZone", () => {
  const onReorder = vi.fn().mockResolvedValue(undefined);
  const onChangeParent = vi.fn().mockResolvedValue(undefined);
  const onRefetch = vi.fn();
  const setDropPreview = vi.fn();

  const siblings = [
    { id: 1, orderValue: 100 },
    { id: 2, orderValue: 200 },
  ];

  const parentIdMap = new Map<number, number | null>([
    [99, null],
  ]);

  const dragStateRef = {
    current: 99,
  };

  const renderZone = (overrides = {}) =>
    render(
      <GapDropZone
        parentId={null}
        index={0}
        canEdit={true}
        dragStateRef={dragStateRef}
        dropPreview={null}
        setDropPreview={setDropPreview}
        siblings={siblings}
        parentIdMap={parentIdMap}
        onReorder={onReorder}
        onChangeParent={onChangeParent}
        onRefetch={onRefetch}
        {...overrides}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without placeholder when inactive", () => {
    renderZone();

    expect(
      screen.queryByText(/drop here/i)
    ).not.toBeInTheDocument();
  });

  it("renders placeholder when active", () => {
    renderZone({
      dropPreview: {
        type: "between",
        parentId: null,
        index: 0,
      },
    });

    expect(
      screen.getByText(/drop here/i)
    ).toBeInTheDocument();
  });

  it("updates drop preview on drag over", () => {
    const { container } = renderZone();

    fireEvent.dragOver(container.firstChild as HTMLElement);

    expect(setDropPreview).toHaveBeenCalledWith({
      type: "between",
      parentId: null,
      index: 0,
    });
  });

  it("clears preview on drag leave", () => {
    const { container } = renderZone();

    fireEvent.dragLeave(container.firstChild as HTMLElement, {
      relatedTarget: null,
    });

    expect(setDropPreview).toHaveBeenCalledWith(null);
  });

  it("calls reorder when dropped in same parent", async () => {
    const { container } = renderZone();

    fireEvent.drop(container.firstChild as HTMLElement);

    await waitFor(() => {
      expect(onReorder).toHaveBeenCalledWith(
        99,
        siblings,
        0
      );
    });

    expect(onChangeParent).not.toHaveBeenCalled();
    expect(onRefetch).toHaveBeenCalled();
  });

  it("changes parent before reorder when parent differs", async () => {
    const differentParentMap = new Map<
      number,
      number | null
    >([[99, 123]]);

    const { container } = renderZone({
      parentIdMap: differentParentMap,
    });

    fireEvent.drop(container.firstChild as HTMLElement);

    await waitFor(() => {
      expect(onChangeParent).toHaveBeenCalledWith(
        99,
        null
      );
    });

    expect(onReorder).toHaveBeenCalled();
    expect(onRefetch).toHaveBeenCalled();
  });

  it("does nothing when editing is disabled", () => {
    const { container } = renderZone({
        canEdit: false,
    });

    fireEvent.dragOver(container.firstChild as HTMLElement);
    fireEvent.drop(container.firstChild as HTMLElement);

    expect(setDropPreview).toHaveBeenCalledWith(null);

    expect(onReorder).not.toHaveBeenCalled();
    expect(onChangeParent).not.toHaveBeenCalled();
    expect(onRefetch).not.toHaveBeenCalled();
    });

  it("shows error when reorder fails", async () => {
    const failingReorder = vi
      .fn()
      .mockRejectedValue(new Error("Boom"));

    const { container } = renderZone({
      onReorder: failingReorder,
    });

    fireEvent.drop(container.firstChild as HTMLElement);

    expect(
      await screen.findByText("Boom")
    ).toBeInTheDocument();
  });

  it("shows generic error for non-Error exceptions", async () => {
    const failingReorder = vi
      .fn()
      .mockRejectedValue("failure");

    const { container } = renderZone({
      onReorder: failingReorder,
    });

    fireEvent.drop(container.firstChild as HTMLElement);

    expect(
      await screen.findByText("Operation failed")
    ).toBeInTheDocument();
  });
});