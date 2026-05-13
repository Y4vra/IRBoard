import { useState } from "react"
import type { ReorderableItem, DropPreview } from "@/lib/reorderUtils"
import { DROP_ANIM_STYLE } from "@/lib/reorderUtils"

// ---------------------------------------------------------------------------
// GapDropZone — the invisible strip between / before / after cards that
// expands into a visible "Drop here" placeholder on hover during a drag.
// ---------------------------------------------------------------------------

export interface GapDropZoneProps<T extends ReorderableItem> {
  parentId: number | null
  index: number
  canEdit: boolean
  dragStateRef: React.MutableRefObject<number | null>
  dropPreview: DropPreview
  setDropPreview: (p: DropPreview) => void
  /** Siblings at this level (sorted). Used to compute the new orderValue. */
  siblings: T[]
  parentIdMap: Map<number, number | null>
  onReorder: (draggingId: number, siblings: T[], insertIndex: number) => Promise<void>
  onChangeParent: (draggingId: number, newParentId: number | null) => Promise<void>
  onRefetch: () => void
}

export function GapDropZone<T extends ReorderableItem>({
  parentId,
  index,
  canEdit,
  dragStateRef,
  dropPreview,
  setDropPreview,
  siblings,
  parentIdMap,
  onReorder,
  onChangeParent,
  onRefetch,
}: GapDropZoneProps<T>) {
  const [dropError, setDropError] = useState<string | null>(null)

  const isActive =
    dropPreview?.type === "between" &&
    dropPreview.parentId === parentId &&
    dropPreview.index === index

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit || !dragStateRef.current) return
    e.preventDefault()
    e.stopPropagation()
    setDropPreview({ type: "between", parentId, index })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return
    setDropPreview(null)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const draggingId = dragStateRef.current
    setDropPreview(null)
    setDropError(null)

    if (!canEdit || !draggingId) return

    try {
      const draggingCurrentParent = parentIdMap.get(draggingId) ?? null
      if (draggingCurrentParent !== parentId) {
        await onChangeParent(draggingId, parentId)
      }
      await onReorder(draggingId, siblings, index)
      onRefetch()
    } catch (err) {
      setDropError(err instanceof Error ? err.message : "Operation failed")
    }
  }

  return (
    <div
      style={{ height: isActive ? 56 : 8, transition: "height 120ms ease" }}
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isActive && (
        <>
          <style>{DROP_ANIM_STYLE}</style>
          <div className="drop-placeholder absolute inset-0 rounded-xl border-2 border-blue-400 border-dashed bg-blue-50/60 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-blue-400 font-medium select-none">Drop here</span>
          </div>
        </>
      )}
      {dropError && <p className="text-xs text-red-500 px-2">{dropError}</p>}
    </div>
  )
}