import { useCallback, useState, useRef, useMemo, Fragment } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "@/lib/globalVars"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronRight, ChevronDown, Plus, GripVertical, Eye, EyeOff, Archive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"
import { CreateNonFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateNonFunctionalRequirementDialog"
import { RequirementStateBadge } from "@/components/badges/RequirementStateBadge"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement"
import { useLocks } from "@/hooks/useLocks"
import { LockIndicator } from "@/components/LockIndicator"
import { EntityType } from "@/lib/lockUtils"
import { useProject } from "@/hooks/useProject"
import { StatsChart } from "@/components/graphics/StatsChart"
import { BackToProjectButton } from "@/components/BackToProjectButton"
import { GapDropZone } from "@/components/GapDropZone"
import {
  sortByOrderValue,
  midpointOrderValue,
  type DropPreview,
} from "@/lib/reorderUtils"
import { collectPendingNFRIds } from "@/lib/requirementUtils"
import { useApproveNFRequirements } from "@/hooks/useApproveActions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ViewMode } from "@/types/ViewMode"
import { ViewToggle } from "@/components/ViewToggle"

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function apiReorder(
  projectId: string,
  requirementId: number,
  newOrderValue: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${requirementId}/reorder`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrderValue),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || "Failed to reorder requirement")
  }
}

async function apiChangeParent(
  projectId: string,
  requirementId: number,
  newParentId: number | null
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${requirementId}/changeParent`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newParentId),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || "Failed to change parent")
  }
}

// ---------------------------------------------------------------------------
// NFRCard
// ---------------------------------------------------------------------------

interface NFRCardProps {
  requirement: NonFunctionalRequirement
  siblings: NonFunctionalRequirement[]
  positionInSiblings: number
  projectId: string
  label: string
  depth?: number
  editPermission: boolean
  onRefetch: () => void
  dragStateRef: React.MutableRefObject<number | null>
  dropPreview: DropPreview
  setDropPreview: (p: DropPreview) => void
  onReorder: (draggingId: number, siblings: NonFunctionalRequirement[], insertIndex: number) => Promise<void>
  parentIdMap: Map<number, number | null>
  onChangeParent: (draggingId: number, newParentId: number | null) => Promise<void>
}

function NFRCard({
  requirement: r,
  siblings,
  positionInSiblings,
  projectId,
  label,
  depth = 0,
  editPermission,
  onRefetch,
  dragStateRef,
  dropPreview,
  setDropPreview,
  onReorder,
  parentIdMap,
  onChangeParent,
}: NFRCardProps) {
  const { getLock } = useLocks()
  const navigate = useNavigate()
  const hasChildren = r.children && r.children.length > 0
  const [collapsed, setCollapsed] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [reorderError, setReorderError] = useState<string | null>(null)

  const parentId = (r.parentId as number | null | undefined) ?? null
  const sortedChildren: NonFunctionalRequirement[] = sortByOrderValue(r.children ?? [])

  const handleDragStart = (e: React.DragEvent) => {
    if (!editPermission) return
    dragStateRef.current = r.id
    e.dataTransfer.effectAllowed = "move"
    e.stopPropagation()
  }

  const handleDragEnd = () => {
    dragStateRef.current = null
    setDropPreview(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    const draggingId = dragStateRef.current
    if (!editPermission || !draggingId || draggingId === r.id) return
    e.preventDefault()
    e.stopPropagation()

    const headerEl = (e.currentTarget as HTMLElement).firstElementChild as HTMLElement
    const rect = headerEl
      ? headerEl.getBoundingClientRect()
      : (e.currentTarget as HTMLElement).getBoundingClientRect()

    if (e.clientY > rect.bottom) return

    const ratio = (e.clientY - rect.top) / rect.height
    if (ratio < 0.3) {
      setDropPreview({ type: "between", parentId, index: positionInSiblings })
    } else if (ratio > 0.7) {
      setDropPreview({ type: "between", parentId, index: positionInSiblings + 1 })
    } else {
      setDropPreview({ type: "child", parentId: r.id })
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return
    setDropPreview(null)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const draggingId = dragStateRef.current
    const preview = dropPreview
    setDropPreview(null)
    setReorderError(null)

    if (!editPermission || !draggingId || draggingId === r.id || !preview) return

    try {
      if (preview.type === "child") {
        await onChangeParent(draggingId, r.id)
        onRefetch()
      } else {
        const draggingCurrentParent = parentIdMap.get(draggingId) ?? null
        if (draggingCurrentParent !== preview.parentId) {
          await onChangeParent(draggingId, preview.parentId)
        }
        await onReorder(draggingId, siblings, preview.index)
        onRefetch()
      }
    } catch (err) {
      setReorderError(err instanceof Error ? err.message : "Operation failed")
    }
  }

  const isChildTarget = dropPreview?.type === "child" && dropPreview.parentId === r.id

  const gapProps = {
    canEdit: editPermission,
    dragStateRef,
    dropPreview,
    setDropPreview,
    siblings: sortedChildren,
    parentIdMap,
    onReorder,
    onChangeParent,
    onRefetch,
  }

  return (
    <div
      className={[
        "rounded-xl border bg-white shadow-sm transition-all select-none",
        depth > 0 ? "ml-6 border-l-4 border-l-slate-200" : "",
        r.state === "DEACTIVATED" ? "opacity-50" : "",
        isChildTarget ? "ring-2 ring-blue-400 bg-blue-50/40 shadow-md" : "hover:shadow-md",
      ].join(" ")}
      draggable={editPermission}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isChildTarget && (
        <div className="text-center text-xs text-blue-500 font-semibold pt-1.5 pointer-events-none">
          ↳ Nest inside "{r.name}"
        </div>
      )}

      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => navigate(`/project/${projectId}/nfr/${r.id}`)}
      >
        {editPermission && (
          <span
            className="shrink-0 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </span>
        )}

        {hasChildren ? (
          <button
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c) }}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <span className="font-mono text-xs text-slate-400 w-24 shrink-0">{label}</span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{r.name}</p>
          {r.description && (
            <p className="text-sm text-slate-500 truncate mt-0.5">{r.description}</p>
          )}
          {reorderError && <p className="text-xs text-red-500 mt-0.5">{reorderError}</p>}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <LockIndicator lock={getLock(EntityType.NON_FUNCTIONAL_REQUIREMENT, r.id)} />
          <RequirementStateBadge state={r.state} />
        </div>

        {editPermission && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Child NFR
            </Button>
            <CreateNonFunctionalRequirementDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              projectId={projectId}
              parentId={r.id}
              onSuccess={onRefetch}
              siblingRequirements={sortedChildren}
            />
          </div>
        )}

        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
      </div>

      {hasChildren && !collapsed && (
        <div className="px-5 pb-4">
          <GapDropZone parentId={r.id} index={0} {...gapProps} />
          {sortedChildren.map((child, index) => (
            <Fragment key={child.id}>
              <NFRCard
                requirement={child}
                siblings={sortedChildren}
                positionInSiblings={index}
                projectId={projectId}
                label={`${label}.${index + 1}`}
                depth={depth + 1}
                editPermission={editPermission}
                onRefetch={onRefetch}
                dragStateRef={dragStateRef}
                dropPreview={dropPreview}
                setDropPreview={setDropPreview}
                onReorder={onReorder}
                parentIdMap={parentIdMap}
                onChangeParent={onChangeParent}
              />
              <GapDropZone parentId={r.id} index={index + 1} {...gapProps} />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NonFunctionalRequirementsView
// ---------------------------------------------------------------------------

function NonFunctionalRequirementsView() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { nonFunctionalRequirementStats, editPermission, isManager } = useProject()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const dragStateRef = useRef<number | null>(null)
  const [dropPreview, setDropPreview] = useState<DropPreview>(null)
  const [showDeactivated, setShowDeactivated] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("active")

  // Active requirements
  const fetchRequirements = useCallback(
    () =>
      fetch(`${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch requirements")
        return r.json()
      }),
    [projectId]
  )

  // Removed requirements
  const fetchRemovedRequirements = useCallback(
    () =>
      fetch(`${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/removed`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch removed requirements")
        return r.json()
      }),
    [projectId]
  )

  const { data, loading, error, refresh: refreshActive } = useBackendResource<NonFunctionalRequirement[]>({
    fetcher: fetchRequirements,
    enabled: isAuthenticated,
  })

  const {
    data: removedData,
    loading: loadingRemoved,
    error: errorRemoved,
    refresh: refreshRemoved,
  } = useBackendResource<NonFunctionalRequirement[]>({
    fetcher: fetchRemovedRequirements,
    enabled: isAuthenticated && isManager,
  })

  const requirements: NonFunctionalRequirement[] = sortByOrderValue(data ?? [])
  const removedRequirements: NonFunctionalRequirement[] = removedData ?? []

  const { approveNFRequirements, loading: approving } = useApproveNFRequirements({
    projectId: projectId!,
    onSuccess: refreshActive,
  })

  const pendingNFRIds = useMemo(() => collectPendingNFRIds(requirements), [requirements])

  const parentIdMap = useMemo(() => {
    const map = new Map<number, number | null>()
    function walk(items: NonFunctionalRequirement[], parentId: number | null) {
      for (const item of items) {
        map.set(item.id, parentId)
        if (item.children?.length) walk(item.children, item.id)
      }
    }
    walk(requirements, null)
    return map
  }, [requirements])

  const handleReorder = useCallback(
    async (draggingId: number, siblings: NonFunctionalRequirement[], insertIndex: number) => {
      const sorted = [...siblings].sort((a, b) => a.orderValue - b.orderValue)
      const draggedIndex = sorted.findIndex((s) => s.id === draggingId)
      const without = sorted.filter((s) => s.id !== draggingId)
      const newOrderValue = midpointOrderValue(without, insertIndex, draggedIndex)
      await apiReorder(projectId!, draggingId, newOrderValue)
    },
    [projectId]
  )

  const handleChangeParent = useCallback(
    async (draggingId: number, newParentId: number | null) => {
      await apiChangeParent(projectId!, draggingId, newParentId)
    },
    [projectId]
  )

  const displayedRequirements = useMemo(() => {
    const filter = (reqs: NonFunctionalRequirement[]): NonFunctionalRequirement[] =>
      reqs
        .filter(r => r.state !== "DEACTIVATED")
        .map(r => ({
          ...r,
          children: filter(r.children ?? [])
        }))

    return showDeactivated ? requirements : filter(requirements)
  }, [requirements, showDeactivated])

  const isLoading = viewMode === "active" ? loading : loadingRemoved
  const currentError = viewMode === "active" ? error : errorRemoved
  const refresh = viewMode === "active" ? refreshActive : refreshRemoved

  if (isLoading) return <LoadingSpinner text={viewMode === "removed" ? "Loading Removed Requirements..." : "Loading Non-Functional Requirements..."} />

  if (currentError)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
        <Button variant="outline" className="mt-4" onClick={refresh}>
          Try Again
        </Button>
      </div>
    )

  const rootGapProps = {
    canEdit: editPermission,
    dragStateRef,
    dropPreview,
    setDropPreview,
    siblings: displayedRequirements,
    parentIdMap,
    onReorder: handleReorder,
    onChangeParent: handleChangeParent,
    onRefetch: refreshActive,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <BackToProjectButton className="mb-0" projectId={projectId!} />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Non-Functional Requirements</h1>
          <p className="text-slate-500 mt-1">Manage quality attributes and system constraints.</p>
          {editPermission && viewMode === "active" && (
            <p className="text-xs text-slate-300 mt-0.5">
              <span className="text-slate-400">
                Drag to reorder · drag to the middle of a card to nest inside it.
              </span>
            </p>
          )}
        </div>
        <div className="flex items-stretch gap-3">
          {nonFunctionalRequirementStats && (
            <Card className="bg-white border border-slate-200 rounded-xl p-4 min-w-[200px]">
              <StatsChart stats={nonFunctionalRequirementStats} title="NFR States" size={100} />
            </Card>
          )}
          <div className="flex flex-col gap-3">
            {viewMode === "active" && (
              <button
                onClick={() => setShowDeactivated(v => !v)}
                className={[
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                  showDeactivated
                    ? "border-slate-300 bg-slate-100 text-slate-600"
                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300",
                ].join(" ")}
              >
                {showDeactivated
                  ? <><Eye className="h-3 w-3" /> Showing deactivated</>
                  : <><EyeOff className="h-3 w-3" /> Hiding deactivated</>
                }
              </button>
            )}
            {editPermission && viewMode === "active" && (
              <>
                <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add NFR
                </Button>
                <CreateNonFunctionalRequirementDialog
                  open={createDialogOpen}
                  onOpenChange={setCreateDialogOpen}
                  projectId={projectId!}
                  onSuccess={refreshActive}
                  siblingRequirements={requirements}
                />
              </>
            )}
            {isManager && viewMode === "active" && (
              <Button
                size="sm"
                variant="outline"
                disabled={pendingNFRIds.length === 0 ? true : approving}
                onClick={() => approveNFRequirements(pendingNFRIds)}
              >
                {approving ? "Approving..." : `Approve All (${pendingNFRIds.length})`}
              </Button>
            )}
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>
                {viewMode === "active" ? "Project Non-Functional Requirements" : "Removed Non-Functional Requirements"}
              </CardTitle>
              <CardDescription>
                {viewMode === "active"
                  ? "Listed non-functional requirements for this project."
                  : "Non-functional requirements that have been removed from this project. Visible to managers only."}
              </CardDescription>
            </div>
            {isManager && (
              <ViewToggle
                mode={viewMode}
                onChange={setViewMode}
                activeCount={requirements.length}
                removedCount={removedRequirements.length}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          {viewMode === "removed" ? (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                <Archive className="h-4 w-4 shrink-0" />
                <span>These requirements have been removed and are no longer active in the project.</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {removedRequirements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 italic py-8">
                        No removed non-functional requirements found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    removedRequirements.map((r) => (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(`/project/${projectId}/nfr/${r.id}`)}
                      >
                        <TableCell className="font-mono text-xs text-slate-400">{r.entityIdentifier ?? r.id}</TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-slate-500">{r.description}</TableCell>
                        <TableCell>
                          <RequirementStateBadge state={r.state} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ChevronRight className="h-4 w-4 ml-auto text-slate-400" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          ) : requirements.length === 0 ? (
            <p className="text-center text-slate-400 italic py-8">
              No non-functional requirements found for this project.
            </p>
          ) : (
            <>
              <GapDropZone parentId={null} index={0} {...rootGapProps} />
              {displayedRequirements.map((r, index) => (
                <Fragment key={r.id}>
                  <NFRCard
                    requirement={r}
                    siblings={displayedRequirements}
                    positionInSiblings={index}
                    projectId={projectId!}
                    label={`NFR.${index + 1}`}
                    editPermission={editPermission}
                    onRefetch={refreshActive}
                    dragStateRef={dragStateRef}
                    dropPreview={dropPreview}
                    setDropPreview={setDropPreview}
                    onReorder={handleReorder}
                    parentIdMap={parentIdMap}
                    onChangeParent={handleChangeParent}
                  />
                  <GapDropZone parentId={null} index={index + 1} {...rootGapProps} />
                </Fragment>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NonFunctionalRequirementsView