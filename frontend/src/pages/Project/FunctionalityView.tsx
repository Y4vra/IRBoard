import { useCallback, useState, useRef, useMemo, Fragment } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../lib/globalVars"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  AlertCircle,
  Pencil,
  ChevronRight,
  ChevronDown,
  Plus,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Eye,
  Archive,
  FolderOpen,
} from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { RequirementStateBadge } from "@/components/badges/RequirementStateBadge"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { FunctionalRequirement } from "../../types/FunctionalRequirement"
import type { Functionality } from "@/types/Functionality"
import { CreateFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateFunctionalRequirementDialog"
import { useLocks } from "@/hooks/useLocks"
import { LockIndicator } from "@/components/LockIndicator"
import { EntityType } from "@/lib/lockUtils"
import type { PriorityStyle } from "@/types/Project"
import { useProject } from "@/hooks/useProject"
import { PriorityBadge } from "@/components/badges/PriorityBadge"
import { StatsChart } from "@/components/graphics/StatsChart"
import { BackToProjectButton } from "@/components/BackToProjectButton"
import { LinkUserToFunctionalityDialog } from "@/components/dialogs/userLinking/LinkUserToFunctionalityDialog"
import { useFunctionalities } from "@/hooks/useFunctionalities"
import { GapDropZone } from "@/components/GapDropZone"
import {
  sortByOrderValue,
  midpointOrderValue,
  type DropPreview,
} from "@/lib/reorderUtils"
import { useApproveRequirements } from "@/hooks/useApproveActions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/context/AuthContext"
import { UpdateFunctionalityDialog } from "@/components/dialogs/updatingDialogs/UpdateFunctionalityDialog"

// ---------------------------------------------------------------------------
// Filter/sort types
// ---------------------------------------------------------------------------

type SortField = "priority" | "state"
type SortDir = "asc" | "desc"

interface SortConfig {
  field: SortField | null
  dir: SortDir
}

type ViewMode = "active" | "removed"

const PRIORITY_ORDER_MOSCOW = ["MUST", "SHOULD", "COULD", "WONT"]
const PRIORITY_ORDER_TERNARY = ["HIGH", "NORMAL", "LOW"]
const STATE_ORDER = ["PENDING_APPROVAL", "APPROVED", "FINISHED", "DEACTIVATED", "REMOVED"]

function priorityRank(priority: string | null | undefined, priorityStyle: PriorityStyle): number {
  const order = priorityStyle === "MOSCOW" ? PRIORITY_ORDER_MOSCOW : PRIORITY_ORDER_TERNARY
  const idx = order.indexOf(priority ?? "")
  return idx === -1 ? 999 : idx
}

function stateRank(state: string | null | undefined): number {
  const idx = STATE_ORDER.indexOf(state ?? "")
  return idx === -1 ? 999 : idx
}

// ---------------------------------------------------------------------------
// ViewToggle
// ---------------------------------------------------------------------------

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  activeCount?: number
  removedCount?: number
}

function ViewToggle({ mode, onChange, activeCount, removedCount }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
      <button
        onClick={() => onChange("active")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          mode === "active"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        Active
        {activeCount !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            mode === "active" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
          }`}>
            {activeCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onChange("removed")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          mode === "removed"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Archive className="h-3.5 w-3.5" />
        Removed
        {removedCount !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            mode === "removed" ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500"
          }`}>
            {removedCount}
          </span>
        )}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter toolbar
// ---------------------------------------------------------------------------

function SortButton({
  label,
  field,
  sort,
  onToggle,
}: {
  label: string
  field: SortField
  sort: SortConfig
  onToggle: (field: SortField) => void
}) {
  const active = sort.field === field
  return (
    <button
      onClick={() => onToggle(field)}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
        active
          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600",
      ].join(" ")}
    >
      {label}
      {!active && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      {active && sort.dir === "asc" && <ArrowUp className="h-3 w-3" />}
      {active && sort.dir === "desc" && <ArrowDown className="h-3 w-3" />}
    </button>
  )
}

interface FilterBarProps {
  showDeactivated: boolean
  onToggleDeactivated: () => void
  sort: SortConfig
  onClearSort: () => void
  onToggleSort: (field: SortField) => void
  totalHidden: number
}

function FilterBar({ showDeactivated, onToggleDeactivated, sort, onClearSort, onToggleSort, totalHidden }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mr-1">
        Filters
      </span>

      <button
        onClick={onToggleDeactivated}
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

      <div className="h-4 w-px bg-slate-200" />

      <span className="text-xs text-slate-400">Sort by</span>
      <SortButton label="Priority" field="priority" sort={sort} onToggle={onToggleSort} />
      <SortButton label="State" field="state" sort={sort} onToggle={onToggleSort} />

      {sort.field && (
        <button
          onClick={onClearSort}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
        >
          Clear sort
        </button>
      )}

      {totalHidden > 0 && (
        <span className="ml-auto text-xs text-slate-400 italic">
          {totalHidden} hidden
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filtering & sorting logic (applied recursively)
// ---------------------------------------------------------------------------

function applyFiltersAndSort(
  reqs: FunctionalRequirement[],
  showDeactivated: boolean,
  sort: SortConfig,
  priorityStyle: PriorityStyle
): FunctionalRequirement[] {
  let result = reqs
    .filter(r => showDeactivated || r.state !== "DEACTIVATED")
    .map(r => ({
      ...r,
      children: applyFiltersAndSort(r.children ?? [], showDeactivated, sort, priorityStyle),
    }))

  if (sort.field === "priority") {
    result = result.sort((a, b) => {
      const diff = priorityRank(a.priority, priorityStyle) - priorityRank(b.priority, priorityStyle)
      return sort.dir === "asc" ? diff : -diff
    })
  } else if (sort.field === "state") {
    result = result.sort((a, b) => {
      const diff = stateRank(a.state) - stateRank(b.state)
      return sort.dir === "asc" ? diff : -diff
    })
  }

  return result
}

function countHidden(
  original: FunctionalRequirement[],
  filtered: FunctionalRequirement[]
): number {
  return countAll(original) - countAll(filtered)
}

function countAll(reqs: FunctionalRequirement[]): number {
  return reqs.reduce((acc, r) => acc + 1 + countAll(r.children ?? []), 0)
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function apiReorder(projectId: string, functionalityId: string, requirementId: number, newOrderValue: number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${requirementId}/reorder`,
    { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newOrderValue) }
  )
  if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.message || "Failed to reorder requirement") }
}

async function apiChangeParent(projectId: string, functionalityId: string, requirementId: number, newParentId: number | null): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${requirementId}/changeParent`,
    { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newParentId) }
  )
  if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.message || "Failed to change parent") }
}

// ---------------------------------------------------------------------------
// FunctionalRequirementCard
// ---------------------------------------------------------------------------

interface FunctionalRequirementCardProps {
  requirement: FunctionalRequirement
  siblings: FunctionalRequirement[]
  positionInSiblings: number
  projectId: string
  functionalityId: string
  priorityStyle: PriorityStyle
  label: string
  depth?: number
  canEdit: boolean
  onRefetch: () => void
  dragStateRef: React.MutableRefObject<number | null>
  dropPreview: DropPreview
  setDropPreview: (p: DropPreview) => void
  onReorder: (draggingId: number, siblings: FunctionalRequirement[], insertIndex: number) => Promise<void>
  parentIdMap: Map<number, number | null>
  onChangeParent: (draggingId: number, newParentId: number | null) => Promise<void>
}

function FunctionalRequirementCard({
  requirement: r, siblings, positionInSiblings, projectId, functionalityId,
  priorityStyle, label, depth = 0, canEdit, onRefetch, dragStateRef,
  dropPreview, setDropPreview, onReorder, parentIdMap, onChangeParent,
}: FunctionalRequirementCardProps) {
  const { getLock } = useLocks()
  const navigate = useNavigate()
  const hasChildren = r.children && r.children.length > 0
  const [collapsed, setCollapsed] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const parentId = (r.parentId as number | null | undefined) ?? null
  const sortedChildren: FunctionalRequirement[] = sortByOrderValue(r.children ?? [])

  const handleDragStart = (e: React.DragEvent) => { if (!canEdit) return; dragStateRef.current = r.id; e.dataTransfer.effectAllowed = "move"; e.stopPropagation() }
  const handleDragEnd = () => { dragStateRef.current = null; setDropPreview(null) }
  const handleDragOver = (e: React.DragEvent) => {
    const draggingId = dragStateRef.current
    if (!canEdit || !draggingId || draggingId === r.id) return
    e.preventDefault(); e.stopPropagation()
    const headerEl = (e.currentTarget as HTMLElement).firstElementChild as HTMLElement
    const rect = headerEl ? headerEl.getBoundingClientRect() : (e.currentTarget as HTMLElement).getBoundingClientRect()
    if (e.clientY > rect.bottom) return
    const ratio = (e.clientY - rect.top) / rect.height
    if (ratio < 0.3) setDropPreview({ type: "between", parentId, index: positionInSiblings })
    else if (ratio > 0.7) setDropPreview({ type: "between", parentId, index: positionInSiblings + 1 })
    else setDropPreview({ type: "child", parentId: r.id })
  }
  const handleDragLeave = (e: React.DragEvent) => { if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return; setDropPreview(null) }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    const draggingId = dragStateRef.current; const preview = dropPreview
    setDropPreview(null); setReorderError(null)
    if (!canEdit || !draggingId || draggingId === r.id || !preview) return
    try {
      if (preview.type === "child") { await onChangeParent(draggingId, r.id); onRefetch() }
      else {
        const draggingCurrentParent = parentIdMap.get(draggingId) ?? null
        if (draggingCurrentParent !== preview.parentId) await onChangeParent(draggingId, preview.parentId)
        await onReorder(draggingId, siblings, preview.index); onRefetch()
      }
    } catch (err) { setReorderError(err instanceof Error ? err.message : "Operation failed") }
  }

  const isChildTarget = dropPreview?.type === "child" && dropPreview.parentId === r.id
  const gapProps = { canEdit, dragStateRef, dropPreview, setDropPreview, siblings: sortedChildren, parentIdMap, onReorder, onChangeParent, onRefetch }

  return (
    <div
      className={["rounded-xl border bg-white shadow-sm transition-all select-none",
        depth > 0 ? "ml-6 border-l-4 border-l-slate-200" : "",
        r.state === "DEACTIVATED" ? "opacity-50" : "",
        isChildTarget ? "ring-2 ring-blue-400 bg-blue-50/40 shadow-md" : "hover:shadow-md",
      ].join(" ")}
      draggable={canEdit} onDragStart={handleDragStart} onDragEnd={handleDragEnd}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      {isChildTarget && (
        <div className="text-center text-xs text-blue-500 font-semibold pt-1.5 pointer-events-none">
          ↳ Nest inside "{r.name}"
        </div>
      )}
      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => navigate(`/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${r.id}`)}>
        {canEdit && (
          <span className="shrink-0 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <GripVertical className="h-4 w-4" />
          </span>
        )}
        {hasChildren ? (
          <button className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c) }}
            aria-label={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        ) : <span className="w-4 shrink-0" />}
        <span className="font-mono text-xs text-slate-400 w-24 shrink-0">{label}</span>
        <div className="flex-1 min-w-0">
          {r.name && <p className="text-sm font-semibold truncate">{r.name}</p>}
          {r.description && <p className="text-sm text-slate-500 truncate mt-0.5">{r.description}</p>}
          {reorderError && <p className="text-xs text-red-500 mt-0.5">{reorderError}</p>}
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <LockIndicator lock={getLock(EntityType.FUNCTIONAL_REQUIREMENT, r.id)} />
          <PriorityBadge priority={r.priority} priorityStyle={priorityStyle} />
          <RequirementStateBadge state={r.state} />
        </div>
        {canEdit && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Child FR
            </Button>
            <CreateFunctionalRequirementDialog
              open={createDialogOpen} onOpenChange={setCreateDialogOpen}
              projectId={projectId} functionalityId={functionalityId}
              parentId={r.id} priorityStyle={priorityStyle}
              siblingRequirements={sortedChildren} onSuccess={onRefetch}
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
              <FunctionalRequirementCard
                requirement={child} siblings={sortedChildren} positionInSiblings={index}
                projectId={projectId} functionalityId={functionalityId}
                priorityStyle={priorityStyle} label={`${label}.${index + 1}`}
                depth={depth + 1} canEdit={canEdit} onRefetch={onRefetch}
                dragStateRef={dragStateRef} dropPreview={dropPreview}
                setDropPreview={setDropPreview} onReorder={onReorder}
                parentIdMap={parentIdMap} onChangeParent={onChangeParent}
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
// FunctionalityView
// ---------------------------------------------------------------------------

function FunctionalityView() {
  const { projectId, functionalityId } = useParams<{ projectId: string; functionalityId: string }>()
  const { priorityStyle, functionalRequirementStats, isManager } = useProject()
  const { canEditFunctionality } = useFunctionalities()
  const canEdit = canEditFunctionality(functionalityId!)

  const { getLock } = useLocks();
  const { user } = useAuth();
  const lock = getLock(EntityType.FUNCTIONALITY, Number(functionalityId));
  const isProjectLockedByAnother = !!lock && lock.username !== user?.name;

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const dragStateRef = useRef<number | null>(null)
  const [dropPreview, setDropPreview] = useState<DropPreview>(null)

  // ── View mode ────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("active")

  // ── Filter/sort state ────────────────────────────────────────────────────
  const [showDeactivated, setShowDeactivated] = useState(false)
  const [sort, setSort] = useState<SortConfig>({ field: null, dir: "asc" })

  const handleToggleSort = useCallback((field: SortField | "_clear") => {
    if (field === "_clear") {
      setSort({ field: null, dir: "asc" })
      return
    }
    setSort(prev => {
      if (prev.field !== field) return { field, dir: "asc" }
      if (prev.dir === "asc") return { field, dir: "desc" }
      return { field: null, dir: "asc" }
    })
  }, [])

  const fetchFunctionality = useCallback(
    () => fetch(`${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}`, { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error("Failed to fetch functionality"); return r.json() }),
    [projectId, functionalityId]
  )

  // Active requirements
  const fetchRequirements = useCallback(
    () => fetch(`${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/`, { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error("Failed to fetch requirements"); return r.json() }),
    [projectId, functionalityId]
  )

  // Removed requirements
  const fetchRemovedRequirements = useCallback(
    () => fetch(`${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/removed`, { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error("Failed to fetch removed requirements"); return r.json() }),
    [projectId, functionalityId]
  )

  const { data: functionality, loading: funcLoading, error: funcError, refresh: refresh } = useBackendResource<Functionality>({ fetcher: fetchFunctionality })
  const { data: requirementsData, loading: reqLoading, error: reqError, refresh: refreshRequirements } = useBackendResource<FunctionalRequirement[]>({ fetcher: fetchRequirements })
  const {
    data: removedData,
    loading: loadingRemoved,
    error: errorRemoved,
    refresh: refreshRemoved,
  } = useBackendResource<FunctionalRequirement[]>({
    fetcher: fetchRemovedRequirements,
    enabled: isManager,
  })

  const requirements: FunctionalRequirement[] = sortByOrderValue(requirementsData ?? [])
  const removedRequirements: FunctionalRequirement[] = removedData ?? []

  // ── Filtered + sorted view (memoized) ───────────────────────────────────
  const displayedRequirements = useMemo(
    () => applyFiltersAndSort(requirements, showDeactivated, sort, priorityStyle),
    [requirements, showDeactivated, sort, priorityStyle]
  )

  const totalHidden = useMemo(
    () => countHidden(requirements, displayedRequirements),
    [requirements, displayedRequirements]
  )

  const frStats = functionalRequirementStats?.[functionalityId!] ?? {}
  const functionalityPrefix = functionality?.label ?? "FR"

  const { approveFunctionality, loading: approving } = useApproveRequirements({
    projectId: projectId!,
    onSuccess: refreshRequirements,
  })

  function collectPendingIds(reqs: FunctionalRequirement[]): number[] {
    return reqs.flatMap((r) => [
      ...(r.state === "PENDING_APPROVAL" ? [r.id] : []),
      ...collectPendingIds(r.children ?? []),
    ])
  }
  const pendingIds = collectPendingIds(requirements)

  const parentIdMap = useMemo(() => {
    const map = new Map<number, number | null>()
    function walk(items: FunctionalRequirement[], parentId: number | null) {
      for (const item of items) { map.set(item.id, parentId); if (item.children?.length) walk(item.children, item.id) }
    }
    walk(requirements, null)
    return map
  }, [requirements])

  const handleReorder = useCallback(
    async (draggingId: number, siblings: FunctionalRequirement[], insertIndex: number) => {
      const sorted = [...siblings].sort((a, b) => a.orderValue - b.orderValue)
      const draggedIndex = sorted.findIndex((s) => s.id === draggingId)
      const without = sorted.filter((s) => s.id !== draggingId)
      const newOrderValue = midpointOrderValue(without, insertIndex, draggedIndex)
      await apiReorder(projectId!, functionalityId!, draggingId, newOrderValue)
    },
    [projectId, functionalityId]
  )

  const handleChangeParent = useCallback(
    async (draggingId: number, newParentId: number | null) => {
      await apiChangeParent(projectId!, functionalityId!, draggingId, newParentId)
    },
    [projectId, functionalityId]
  )

  const navigate = useNavigate()

  if (funcLoading) return <LoadingSpinner text="Loading functionality..." />
  if (funcError || !functionality)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Could not load functionality</p>
        <p className="text-red-500 text-sm mt-1">{funcError}</p>
        <Button asChild variant="outline" className="mt-4"><Link to={`/project/${projectId}`}>Back to Project</Link></Button>
      </div>
    )

  const rootGapProps = {
    canEdit, dragStateRef, dropPreview, setDropPreview,
    siblings: displayedRequirements, parentIdMap,
    onReorder: handleReorder, onChangeParent: handleChangeParent, onRefetch: refreshRequirements,
  }

  // Determine loading/error state based on active view
  const isContentLoading = viewMode === "active" ? reqLoading : loadingRemoved
  const contentError = viewMode === "active" ? reqError : errorRemoved
  const refreshCurrent = viewMode === "active" ? refreshRequirements : refreshRemoved

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <nav className="mb-0 flex items-center justify-between">
        <BackToProjectButton className="mb-0" projectId={projectId!} />
      </nav>

      <header className="flex items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Functionality</p>
          <h1 className="text-4xl font-black tracking-tight">{functionality.name}</h1>
          <p className="text-xs font-mono text-slate-400 pt-2">{functionality.entityIdentifier}</p>
          {functionality.description && (
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">{functionality.description}</p>
          )}
          <div className="flex items-center gap-3 pt-1">
            {functionality.state && (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                {functionality.state}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-mono text-slate-400">{priorityStyle}</Badge>
          </div>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 min-w-[200px]">
            <StatsChart stats={frStats} title="Requirements" size={100} />
          </div>
          <div className="flex flex-col gap-3">
            {isManager && (
              <>
                <LockIndicator lock={lock} />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProjectLockedByAnother}
                  title={
                    isProjectLockedByAnother
                      ? "This functionality is currently being edited by another user"
                      : undefined
                  }
                  onClick={() => {
                    if (!isProjectLockedByAnother) setUpdateDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Functionality
                </Button>
                <LinkUserToFunctionalityDialog
                  projectId={projectId!} functionalityId={functionalityId!}
                  canManage={isManager}
                />
                <Button size="sm" variant="outline"
                  disabled={pendingIds.length === 0 || approving}
                  onClick={() => approveFunctionality(functionalityId!, pendingIds)}>
                  {approving ? "Approving..." : `Approve All (${pendingIds.length})`}
                </Button>
              </>
            )}
            {functionality && (
              <UpdateFunctionalityDialog
                open={updateDialogOpen}
                onOpenChange={setUpdateDialogOpen}
                projectId={projectId!}
                functionality={functionality}
                onSuccess={refresh}
              />
            )}
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Functional Requirements
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage hierarchical functional requirements.{" "}
              {canEdit && viewMode === "active" && (
                <span className="text-slate-400">Drag to reorder · drag to the middle of a card to nest inside it.</span>
              )}
            </p>
          </div>
          {canEdit && viewMode === "active" && (
            <>
              <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add FR
              </Button>
              <CreateFunctionalRequirementDialog
                open={createDialogOpen} onOpenChange={setCreateDialogOpen}
                projectId={projectId!} functionalityId={functionalityId!}
                onSuccess={refreshRequirements} priorityStyle={priorityStyle}
                siblingRequirements={requirements}
              />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>
                  {viewMode === "active" ? "Functional Requirements" : "Removed Functional Requirements"}
                </CardTitle>
                <CardDescription>
                  {viewMode === "active"
                    ? "Listed functional requirements for this functionality, ordered by priority."
                    : "Functional requirements that have been removed. Visible to managers only."}
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
          <CardContent className="space-y-3">
            {viewMode === "removed" ? (
              <>
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                  <Archive className="h-4 w-4 shrink-0" />
                  <span>These requirements have been removed and are no longer active in this functionality.</span>
                </div>
                {isContentLoading ? (
                  <div className="py-16 flex justify-center">
                    <LoadingSpinner text="Loading removed requirements..." />
                  </div>
                ) : contentError ? (
                  <div className="py-10 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-500 text-sm">{contentError}</p>
                    <Button variant="outline" className="mt-4" onClick={refreshCurrent}>Try Again</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slug</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {removedRequirements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400 italic py-8">
                            No removed functional requirements found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        removedRequirements.map((r) => (
                          <TableRow
                            key={r.id}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => navigate(`/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${r.id}`)}
                          >
                            <TableCell className="font-mono text-xs text-slate-400">{r.entityIdentifier ?? r.id}</TableCell>
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell className="max-w-xs truncate text-slate-500">{r.description}</TableCell>
                            <TableCell>
                              <PriorityBadge priority={r.priority} priorityStyle={priorityStyle} />
                            </TableCell>
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
                )}
              </>
            ) : (
              <>
                {/* Filter bar — only shown in active view */}
                <FilterBar
                  showDeactivated={showDeactivated}
                  onToggleDeactivated={() => setShowDeactivated(v => !v)}
                  sort={sort}
                  onClearSort={() => setSort({ field: null, dir: "asc" })}
                  onToggleSort={handleToggleSort}
                  totalHidden={totalHidden}
                />

                <div className="border-t border-slate-100 pt-3">
                  {isContentLoading ? (
                    <div className="py-16 flex justify-center"><LoadingSpinner text="Loading requirements..." /></div>
                  ) : contentError ? (
                    <div className="py-10 text-center">
                      <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-500 text-sm">{contentError}</p>
                    </div>
                  ) : displayedRequirements.length === 0 ? (
                    <p className="text-center text-slate-400 italic py-8">
                      {requirements.length === 0 ? "No functional requirements found." : "No requirements match the current filters."}
                    </p>
                  ) : (
                    <>
                      <GapDropZone parentId={null} index={0} {...rootGapProps} />
                      {displayedRequirements.map((r, index) => (
                        <Fragment key={r.id}>
                          <FunctionalRequirementCard
                            requirement={r} siblings={displayedRequirements} positionInSiblings={index}
                            projectId={projectId!} functionalityId={functionalityId!}
                            priorityStyle={priorityStyle} label={`${functionalityPrefix}.${index + 1}`}
                            canEdit={canEdit} onRefetch={refreshRequirements}
                            dragStateRef={dragStateRef} dropPreview={dropPreview}
                            setDropPreview={setDropPreview} onReorder={handleReorder}
                            parentIdMap={parentIdMap} onChangeParent={handleChangeParent}
                          />
                          <GapDropZone parentId={null} index={index + 1} {...rootGapProps} />
                        </Fragment>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default FunctionalityView