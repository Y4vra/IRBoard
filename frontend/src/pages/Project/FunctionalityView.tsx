import { useCallback, useState } from "react"
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

interface FunctionalRequirementCardProps {
  requirement: FunctionalRequirement
  projectId: string
  functionalityId: string
  priorityStyle: PriorityStyle
  label: string
  depth?: number
  canEdit: boolean
  onRefetch: () => void
}

function FunctionalRequirementCard({
  requirement: r,
  projectId,
  functionalityId,
  priorityStyle,
  label,
  depth = 0,
  canEdit,
  onRefetch,
}: FunctionalRequirementCardProps) {
  const {getLock} = useLocks();
  const navigate = useNavigate()
  const hasChildren = r.children && r.children.length > 0
  const [collapsed, setCollapsed] = useState(false)
  const [createFunctionalRequirementDialogOpen, setCreateFunctionalRequirementDialogOpen] = useState(false);

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
          {r.name && (
            <p className="text-sm font-semibold truncate mt-0.5">
              {r.name}
            </p>
          )}{r.description && (
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

        {canEdit && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <Button size="sm" variant="outline" onClick={()=>setCreateFunctionalRequirementDialogOpen(!createFunctionalRequirementDialogOpen)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Child FR
              <CreateFunctionalRequirementDialog
                open={createFunctionalRequirementDialogOpen}
                onOpenChange={setCreateFunctionalRequirementDialogOpen}
                projectId={projectId}
                functionalityId={functionalityId}
                parentId={r.id}
                priorityStyle={priorityStyle}
                onSuccess={onRefetch}
              />
            </Button>
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
              canEdit={canEdit}
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
  const { priorityStyle,functionalRequirementStats } = useProject();
  const { canEditFunctionality } = useFunctionalities();
  const canEdit = canEditFunctionality(functionalityId!);
  
  const [createFunctionalRequirementDialogOpen, setCreateFunctionalRequirementDialogOpen] = useState(false);

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
  const frStats = functionalRequirementStats?.[functionalityId!] ?? {} 

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
      {/* ── Top nav ── */}
      <nav className="mb-0 flex items-center justify-between">
        <BackToProjectButton className="mb-0" projectId={projectId!}/>
      </nav>

      <header className="flex items-center justify-between gap-6">
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

        <div className="flex items-stretch gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 min-w-[200px]">
            <StatsChart stats={frStats} title="Requirements" size={100} />
          </div>
          <div className="flex flex-col gap-3">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={handleEditFunctionality}>
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
              Manage hierarchical functional requirements.
            </p>
          </div>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={()=>setCreateFunctionalRequirementDialogOpen(!createFunctionalRequirementDialogOpen)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add FR
              <CreateFunctionalRequirementDialog
                open={createFunctionalRequirementDialogOpen}
                onOpenChange={setCreateFunctionalRequirementDialogOpen}
                projectId={projectId!}
                functionalityId={functionalityId!}
                onSuccess={refreshRequirements}
                priorityStyle={priorityStyle}
              />
            </Button>
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
                  canEdit={canEdit}
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