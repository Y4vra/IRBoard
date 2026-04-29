import { useCallback } from "react"
import { useParams, Link } from "react-router-dom"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertCircle,
  ArrowLeft,
  Circle,
  Pencil,
  Eye,
} from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { RequirementStateBadge } from "@/components/RequirementStateBadge"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { FunctionalRequirement } from "../../types/FunctionalRequirement"
import type { Functionality } from "@/types/Functionality"
import { RequirementState } from "@/types/enum/RequirementState"
import { CreateFunctionalRequirementDialog } from "@/components/CreateFunctionalRequirementDialog"

// ── Types ─────────────────────────────────────────────────────────────────────

type PriorityStyle = "MOSCOW" | "TERNARY"

// ── Priority badge ────────────────────────────────────────────────────────────

const MOSCOW_STYLES: Record<string, string> = {
  MUST:   "bg-amber-50 text-amber-700 border-amber-200",
  SHOULD: "bg-blue-50 text-blue-700 border-blue-200",
  COULD:  "bg-slate-100 text-slate-600 border-slate-200",
  WONT:   "bg-red-50 text-red-400 border-red-100",
}

const TERNARY_STYLES: Record<string, string> = {
  HIGH:   "bg-amber-50 text-amber-700 border-amber-200",
  NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
  LOW:    "bg-slate-100 text-slate-600 border-slate-200",
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

// ── Recursive rows ────────────────────────────────────────────────────────────

function RequirementRows({
  requirements,
  depth = 0,
  priorityStyle,
  onView,
}: {
  requirements: FunctionalRequirement[]
  depth?: number
  priorityStyle: PriorityStyle
  onView: (req: FunctionalRequirement) => void
}) {
  return (
    <>
      {requirements.map((req) => {
        const isChild = depth > 0
        const paddingLeft = depth * 24 + 16

        return (
          <>
            <TableRow
              key={req.id}
              className={isChild ? "bg-slate-50/60" : ""}
            >
              <TableCell className="font-mono text-xs text-slate-400">
                {req.id}
              </TableCell>

              <TableCell style={{ paddingLeft }}>
                <div className="flex items-center gap-2">
                  {isChild && (
                    <span className="text-slate-300 text-xs select-none">└─</span>
                  )}
                  <span className="font-medium text-sm flex items-center gap-1.5">
                    {req.state==RequirementState.PENDING_APPROVAL && (
                      <Circle className="h-2 w-2 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                    {req.name}
                  </span>
                </div>
              </TableCell>

              <TableCell className="max-w-xs truncate text-slate-500 text-sm">
                {req.description}
              </TableCell>

              <TableCell>
                <PriorityBadge priority={req.priority} priorityStyle={priorityStyle} />
              </TableCell>

              <TableCell>
                {req.stability && (
                  <Badge variant="outline" className="text-xs font-normal text-slate-500">
                    {req.stability}
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <RequirementStateBadge state={req.state} />
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(req)}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>

            {req.children && req.children.length > 0 && (
              <RequirementRows
                requirements={req.children}
                depth={depth + 1}
                priorityStyle={priorityStyle}
                onView={onView}
              />
            )}
          </>
        )
      })}
    </>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

function FunctionalityView() {
  const { projectId, functionalityId } = useParams<{
    projectId: string
    functionalityId: string
  }>()
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
    data,
    loading: reqLoading,
    error: reqError,
    refresh: refreshRequirements
  } = useBackendResource<FunctionalRequirement[]>({ fetcher: fetchRequirements })

  const requirements = data ?? []

  const countAll = (reqs: FunctionalRequirement[]): number =>
    reqs.reduce((acc, r) => acc + 1 + countAll(r.children ?? []), 0)

  const pendingCount = requirements.filter((r) => r.state==RequirementState.PENDING_APPROVAL).length
  const priorityStyle = (functionality?.priorityStyle ?? "TERNARY") as PriorityStyle

  // ── Dialog handlers (stubs — replace with your dialog opens) ──────────────

  const handleViewRequirement = (req: FunctionalRequirement) => {
    // TODO: open FunctionalRequirementDetailDialog with req
    console.log("View requirement", req)
  }

  const handleEditFunctionality = () => {
    // TODO: open EditFunctionalityDialog with functionality
  }

  // ── Loading / error ────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">

      {/* Nav */}
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

      {/* Functionality header */}
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

      {/* Requirements section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Functional Requirements
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Children are indented under their parent requirement
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
          <CardHeader className="pb-0">
            <CardTitle className="text-base">
              Requirements for {functionality.name}
            </CardTitle>
            <CardDescription>
              Showing all functional requirements and their sub-requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            {reqLoading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner text="Loading requirements..." />
              </div>
            ) : reqError ? (
              <div className="py-10 text-center">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-500 text-sm">{reqError}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-28">Priority</TableHead>
                    <TableHead className="w-28">Stability</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="text-right w-16">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-slate-400 italic py-12"
                      >
                        No functional requirements yet.{" "}
                        {user?.isAdmin && (
                          <CreateFunctionalRequirementDialog
                            projectId={projectId!}
                            functionalityId={functionalityId!}
                            onSuccess={refreshRequirements}
                            priorityStyle={priorityStyle}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <RequirementRows
                      requirements={requirements}
                      priorityStyle={priorityStyle}
                      onView={handleViewRequirement}
                    />
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default FunctionalityView