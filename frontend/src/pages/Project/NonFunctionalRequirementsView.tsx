import { useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../lib/globalVars"
import { Button } from "../../components/ui/button"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"
import { CreateNonFunctionalRequirementDialog } from "../../components/CreateNonFunctionalRequirementDialog"
import { RequirementStateBadge } from "@/components/RequirementStateBadge"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement"

// ─── Recursive card ──────────────────────────────────────────────────────────

interface NFRCardProps {
  requirement: NonFunctionalRequirement
  projectId: string
  depth?: number
  isAdmin: boolean
  onRefetch: () => void
}

function NFRCard({ requirement: r, projectId, depth = 0, isAdmin, onRefetch }: NFRCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        depth > 0 ? "ml-6 border-l-4 border-l-slate-200" : ""
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => navigate(`/project/${projectId}/nfr/${r.id}`)}
      >
        {/* Identifiers */}
        <span className="font-mono text-xs text-slate-400 w-10 shrink-0">{r.identifier ?? `#${r.id}`}</span>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{r.name}</p>
          {r.description && (
            <p className="text-sm text-slate-500 truncate mt-0.5">{r.description}</p>
          )}
        </div>

        {/* Status */}
        <div className="shrink-0">
          <RequirementStateBadge state={r.state} />
        </div>

        {/* Add child button — stop propagation so it doesn't navigate */}
        {isAdmin && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <CreateNonFunctionalRequirementDialog
              projectId={projectId}
              parentId={r.id}
              onSuccess={onRefetch}
            />
          </div>
        )}

        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
      </div>

      {/* Children */}
      {r.children && r.children.length > 0 && (
        <div className="px-5 pb-4 space-y-3">
          {r.children.map((child) => (
            <NFRCard
              key={child.id}
              requirement={child}
              projectId={projectId}
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

// ─── Main view ───────────────────────────────────────────────────────────────

function NonFunctionalRequirementsView() {
  const { projectId } = useParams<{ projectId: string }>()
  const { isAuthenticated, user } = useAuth()

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

  // refresh is the stable callback that re-runs the fetcher and updates state
  const { data, loading, error, refresh } = useBackendResource<NonFunctionalRequirement[]>({
    fetcher: fetchRequirements,
    enabled: isAuthenticated,
  })
  const requirements = data ?? []

  if (loading) return <LoadingSpinner text="Loading Non-Functional Requirements..." />

  if (error)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refresh}>
          Try Again
        </Button>
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Non-Functional Requirements</h1>
          <p className="text-slate-500 mt-1">Manage quality attributes and system constraints.</p>
        </div>
        {user?.isAdmin && (
          <CreateNonFunctionalRequirementDialog
            projectId={projectId!}
            onSuccess={refresh}
          />
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Project Non-Functional Requirements</CardTitle>
          <CardDescription>Listed non-functional requirements for this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requirements.length === 0 ? (
            <p className="text-center text-slate-400 italic py-8">
              No non-functional requirements found for this project.
            </p>
          ) : (
            requirements.map((r) => (
              <NFRCard
                key={r.id}
                requirement={r}
                projectId={projectId!}
                isAdmin={!!user?.isAdmin}
                onRefetch={refresh}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NonFunctionalRequirementsView