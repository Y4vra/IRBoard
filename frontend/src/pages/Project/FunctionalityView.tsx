import { useCallback, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../lib/globalVars"
import { useAuth } from "@/context/AuthContext"
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
  ArrowLeft,
  Circle,
  Pencil,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { RequirementStateBadge } from "@/components/RequirementStateBadge"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { FunctionalRequirement } from "../../types/FunctionalRequirement"
import type { Functionality } from "@/types/Functionality"
import { RequirementState } from "@/types/enum/RequirementState"
import { CreateFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateFunctionalRequirementDialog"
import { useLocks } from "@/hooks/useLocks"
import { LockIndicator } from "@/components/LockIndicator"
import { EntityType } from "@/lib/lockUtils"
import type { PriorityStyle } from "@/types/Project"
import { useProject } from "@/hooks/useProject"

const MOSCOW_STYLES: Record<string, string> = {
  MUST: "bg-amber-50 text-amber-700 border-amber-200",
  SHOULD: "bg-blue-50 text-blue-700 border-blue-200",
  COULD: "bg-slate-100 text-slate-600 border-slate-200",
  WONT: "bg-red-50 text-red-400 border-red-100",
}

const TERNARY_STYLES: Record<string, string> = {
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
}

function PriorityBadge({
  priority,
  priorityStyle,
}: {
  priority?: string | null
  priorityStyle: PriorityStyle
}) {
  if (!priority) return null
  const styleMap = priorityStyle === "MOSCOW" ? MOSCOW_STYLES : TERNARY_STYLES
  const className = styleMap[priority] ?? "bg-slate-100 text-slate-500 border-slate-200"
  return (
    <Badge className={`border font-semibold text-xs ${className}`}>
      {priority}
    </Badge>
  )
}

interface FunctionalRequirementCardProps {
  requirement: FunctionalRequirement
  projectId: string
  functionalityId: string
  priorityStyle: PriorityStyle
  label: string
  depth?: number
  isAdmin: boolean
  onRefetch: () => void
}

function FunctionalRequirementCard({
  requirement: r,
  projectId,
  functionalityId,
  priorityStyle,
  label,
  depth = 0,
  isAdmin,
  onRefetch,
}: FunctionalRequirementCardProps) {
  const {getLock} = useLocks();
  const navigate = useNavigate()
  const hasChildren = r.children && r.children.length > 0
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        depth > 0 ? "ml-6 border-l-4 border-l-slate-200" : ""
      }`}
    >
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => navigate(`/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${r.id}`)}
      >
        {/* Collapse toggle */}
        {hasChildren ? (
          <button
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setCollapsed((c) => !c)
            }}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Computed label */}
        <span className="font-mono text-xs text-slate-400 w-24 shrink-0">{label}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {r.state === RequirementState.PENDING_APPROVAL && (
              <Circle className="h-2 w-2 fill-amber-400 text-amber-400 shrink-0" />
            )}
            <p className="font-semibold text-slate-800 truncate">{r.name}</p>
          </div>
          {r.description && (
            <p className="text-sm text-slate-500 truncate mt-0.5">
              {r.description}
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <LockIndicator lock={getLock(EntityType.FUNCTIONAL_REQUIREMENT, r.id)} />
          <PriorityBadge priority={r.priority} priorityStyle={priorityStyle} />
          <RequirementStateBadge state={r.state} />
        </div>

        {isAdmin && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <CreateFunctionalRequirementDialog
              projectId={projectId}
              functionalityId={functionalityId}
              parentId={r.id}
              priorityStyle={priorityStyle}
              onSuccess={onRefetch}
            />
          </div>
        )}

        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
      </div>

      {hasChildren && !collapsed && (
        <div className="px-5 pb-4 space-y-3">
          {r.children.map((child, index) => (
            <FunctionalRequirementCard
              key={child.id}
              requirement={child}
              projectId={projectId}
              functionalityId={functionalityId}
              priorityStyle={priorityStyle}
              label={`${label}.${index + 1}`}
              depth={depth + 1}
              isAdmin={isAdmin}
              onRefetch={onRefetch}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FunctionalityView() {
  const { projectId, functionalityId } = useParams<{
    projectId: string
    functionalityId: string
  }>()
  const { priorityStyle } = useProject();
  const { user } = useAuth()

  const fetchFunctionality = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}`,
        { credentials: "include" }
      ).then((r) => {
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

  const {
    data: functionality,
    loading: funcLoading,
    error: funcError,
  } = useBackendResource<Functionality>({ fetcher: fetchFunctionality })

  const {
    data: requirementsData,
    loading: reqLoading,
    error: reqError,
    refresh: refreshRequirements,
  } = useBackendResource<FunctionalRequirement[]>({ fetcher: fetchRequirements })

  const requirements = requirementsData ?? []

  const countAll = (reqs: FunctionalRequirement[]): number =>
    reqs.reduce((acc, r) => acc + 1 + countAll(r.children ?? []), 0)

  const countPending = (reqs: FunctionalRequirement[]): number =>
    reqs.reduce((acc, r) => {
      const isPending = r.state === RequirementState.PENDING_APPROVAL ? 1 : 0
      return acc + isPending + countPending(r.children ?? [])
    }, 0)

  const pendingCount = countPending(requirements)
  
  // Derive the prefix from the functionality label (e.g. "User Management" → "UM", or use label directly if already short)
  const functionalityPrefix = functionality?.label ?? "FR"

  const handleEditFunctionality = () => {
  }

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

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <nav className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
          </Link>
        </Button>
        {user?.isAdmin && (
          <Button variant="outline" size="sm" onClick={handleEditFunctionality}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Functionality
          </Button>
        )}
      </nav>

      <header className="flex items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Functionality
          </p>
          <h1 className="text-4xl font-black tracking-tight">{functionality.name}</h1>
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

        <div className="flex gap-3 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center min-w-[80px]">
            <p className="text-2xl font-extrabold text-slate-900">
              {countAll(requirements)}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Requirements</p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-extrabold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-amber-500 font-medium mt-0.5">Pending</p>
            </div>
          )}
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Functional Requirements
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage hierarchical functional requirements.
            </p>
          </div>
          {user?.isAdmin && (
            <CreateFunctionalRequirementDialog
              projectId={projectId!}
              functionalityId={functionalityId!}
              onSuccess={refreshRequirements}
              priorityStyle={priorityStyle}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Functional Requirements</CardTitle>
            <CardDescription>
              Listed functional requirements for this functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
              requirements.map((r, index) => (
                <FunctionalRequirementCard
                  key={r.id}
                  requirement={r}
                  projectId={projectId!}
                  functionalityId={functionalityId!}
                  priorityStyle={priorityStyle}
                  label={`${functionalityPrefix}.${index + 1}`}
                  isAdmin={!!user?.isAdmin}
                  onRefetch={refreshRequirements}
                />
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default FunctionalityView;