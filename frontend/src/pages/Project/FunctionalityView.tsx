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

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function apiReorder(
  projectId: string,
  functionalityId: string,
  requirementId: number,
  newOrderValue: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${requirementId}/reorder`,
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
  functionalityId: string,
  requirementId: number,
  newParentId: number | null
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${requirementId}/changeParent`,
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
  requirement: r,
  siblings,
  positionInSiblings,
  projectId,
  functionalityId,
  priorityStyle,
  label,
  depth = 0,
  canEdit,
  onRefetch,
  dragStateRef,
  dropPreview,
  setDropPreview,
  onReorder,
  parentIdMap,
  onChangeParent,
}: FunctionalRequirementCardProps) {
  const { getLock } = useLocks()
  const navigate = useNavigate()
  const hasChildren = r.children && r.children.length > 0
  const [collapsed, setCollapsed] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [reorderError, setReorderError] = useState<string | null>(null)

  const parentId = (r.parentId as number | null | undefined) ?? null
  const sortedChildren:FunctionalRequirement[] = sortByOrderValue(r.children ?? [])

  const handleDragStart = (e: React.DragEvent) => {
    if (!canEdit) return
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
    if (!canEdit || !draggingId || draggingId === r.id) return
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

    if (!canEdit || !draggingId || draggingId === r.id || !preview) return

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
    canEdit,
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
        isChildTarget ? "ring-2 ring-blue-400 bg-blue-50/40 shadow-md" : "hover:shadow-md",
      ].join(" ")}
      draggable={canEdit}
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
        onClick={() =>
          navigate(
            `/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${r.id}`
          )
        }
      >
        {canEdit && (
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
          {r.name && <p className="text-sm font-semibold truncate">{r.name}</p>}
          {r.description && (
            <p className="text-sm text-slate-500 truncate mt-0.5">{r.description}</p>
          )}
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
              <Plus className="h-4 w-4 mr-1.5" />
              Add Child FR
            </Button>
            <CreateFunctionalRequirementDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              projectId={projectId}
              functionalityId={functionalityId}
              parentId={r.id}
              priorityStyle={priorityStyle}
              siblingRequirements={sortedChildren}
              onSuccess={onRefetch}
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
                requirement={child}
                siblings={sortedChildren}
                positionInSiblings={index}
                projectId={projectId}
                functionalityId={functionalityId}
                priorityStyle={priorityStyle}
                label={`${label}.${index + 1}`}
                depth={depth + 1}
                canEdit={canEdit}
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
// FunctionalityView
// ---------------------------------------------------------------------------

function FunctionalityView() {
  const { projectId, functionalityId } = useParams<{
    projectId: string
    functionalityId: string
  }>()
  const { priorityStyle, functionalRequirementStats } = useProject()
  const { canEditFunctionality } = useFunctionalities()
  const canEdit = canEditFunctionality(functionalityId!)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const dragStateRef = useRef<number | null>(null)
  const [dropPreview, setDropPreview] = useState<DropPreview>(null)

  const fetchFunctionality = useCallback(
    () =>
      fetch(`${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch functionality")
        return r.json()
      }),
    [projectId, functionalityId]
  )

  const fetchRequirements = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch requirements")
        return r.json()
      }),
    [projectId, functionalityId]
  )

  const { data: functionality, loading: funcLoading, error: funcError } =
    useBackendResource<Functionality>({ fetcher: fetchFunctionality })

  const {
    data: requirementsData,
    loading: reqLoading,
    error: reqError,
    refresh: refreshRequirements,
  } = useBackendResource<FunctionalRequirement[]>({ fetcher: fetchRequirements })

  const requirements:FunctionalRequirement[] = sortByOrderValue(requirementsData ?? [])
  const frStats = functionalRequirementStats?.[functionalityId!] ?? {}
  const functionalityPrefix = functionality?.label ?? "FR"

  const parentIdMap = useMemo(() => {
    const map = new Map<number, number | null>()
    function walk(items: FunctionalRequirement[], parentId: number | null) {
      for (const item of items) {
        map.set(item.id, parentId)
        if (item.children?.length) walk(item.children, item.id)
      }
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

  if (funcLoading) return <LoadingSpinner text="Loading functionality..." />

  if (funcError || !functionality)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Could not load functionality</p>
        <p className="text-red-500 text-sm mt-1">{funcError}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={`/project/${projectId}`}>Back to Project</Link>
        </Button>
      </div>
    )

  const rootGapProps = {
    canEdit,
    dragStateRef,
    dropPreview,
    setDropPreview,
    siblings: requirements,
    parentIdMap,
    onReorder: handleReorder,
    onChangeParent: handleChangeParent,
    onRefetch: refreshRequirements,
  }

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
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
              {functionality.description}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1">
            {functionality.state && (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                {functionality.state}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-mono text-slate-400">
              {priorityStyle}
            </Badge>
          </div>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 min-w-[200px]">
            <StatsChart stats={frStats} title="Requirements" size={100} />
          </div>
          <div className="flex flex-col gap-3">
            {canEdit && (
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" /> Edit Functionality
              </Button>
            )}
            {functionality.isUserFunctionalityManager && (
              <LinkUserToFunctionalityDialog
                projectId={projectId!}
                functionalityId={functionalityId!}
                canManage={functionality.isUserFunctionalityManager}
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
              {canEdit && (
                <span className="text-slate-400">
                  Drag to reorder · drag to the middle of a card to nest inside it.
                </span>
              )}
            </p>
          </div>
          {canEdit && (
            <>
              <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add FR
              </Button>
              <CreateFunctionalRequirementDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                projectId={projectId!}
                functionalityId={functionalityId!}
                onSuccess={refreshRequirements}
                priorityStyle={priorityStyle}
                siblingRequirements={requirements}
              />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Functional Requirements</CardTitle>
            <CardDescription>
              Listed functional requirements for this functionality, ordered by priority.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {reqLoading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner text="Loading requirements..." />
              </div>
            ) : reqError ? (
              <div className="py-10 text-center">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-500 text-sm">{reqError}</p>
              </div>
            ) : requirements.length === 0 ? (
              <p className="text-center text-slate-400 italic py-8">
                No functional requirements found.
              </p>
            ) : (
              <>
                <GapDropZone parentId={null} index={0} {...rootGapProps} />
                {requirements.map((r, index) => (
                  <Fragment key={r.id}>
                    <FunctionalRequirementCard
                      requirement={r}
                      siblings={requirements}
                      positionInSiblings={index}
                      projectId={projectId!}
                      functionalityId={functionalityId!}
                      priorityStyle={priorityStyle}
                      label={`${functionalityPrefix}.${index + 1}`}
                      canEdit={canEdit}
                      onRefetch={refreshRequirements}
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
      </section>
    </div>
  )
}

export default FunctionalityView