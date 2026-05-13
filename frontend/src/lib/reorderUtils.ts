// ---------------------------------------------------------------------------
// Shared reorder utilities for hierarchical drag-and-drop lists
// ---------------------------------------------------------------------------

/** Any item that can be reordered — must have id, orderValue, and children. */
export interface ReorderableItem {
  id: number
  orderValue: number
  parentId?: number | null
  children?: ReorderableItem[]
}

export type DropPreview =
  | { type: "between"; parentId: number | null; index: number }
  | { type: "child"; parentId: number }
  | null

export function sortByOrderValue<T extends ReorderableItem>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => a.orderValue - b.orderValue)
    .map((item) => ({
      ...item,
      children: item.children?.length
        ? sortByOrderValue(item.children as T[])
        : item.children,
    }))
}

/**
 * Compute the orderValue for inserting a dragged item at `insertIndex`
 * within a sibling list that already has the dragged item removed.
 *
 * `insertIndex` is relative to the ORIGINAL list (before removal), so we
 * adjust it to account for the shift caused by removing the dragged item.
 */
export function midpointOrderValue(
  siblingsWithoutDragged: ReorderableItem[],
  insertIndex: number,
  draggedIndex: number
): number {
  const adjustedIndex = insertIndex > draggedIndex ? insertIndex - 1 : insertIndex
  const prev = siblingsWithoutDragged[adjustedIndex - 1]
  const next = siblingsWithoutDragged[adjustedIndex]
  if (!prev && !next) return 1000
  if (!prev) return next.orderValue - 1000
  if (!next) return prev.orderValue + 1000
  return Math.round((prev.orderValue + next.orderValue) / 2)
}

export const DROP_ANIM_STYLE = `
@keyframes placeholder-in {
  from { opacity: 0; transform: scaleY(0.4); }
  to   { opacity: 1; transform: scaleY(1); }
}
.drop-placeholder {
  animation: placeholder-in 120ms cubic-bezier(0.2, 0, 0, 1) forwards;
  transform-origin: top;
}
`