import { useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../lib/globalVars"
import { Button } from "../../../components/ui/button"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"
import { CreateStakeholderDialog } from "@/components/dialogs/creatingDialogs/CreateStakeholderDialog"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { Stakeholder } from "@/types/Stakeholder"
import { useLocks } from "@/hooks/useLocks"
import { LockIndicator } from "@/components/LockIndicator"
import { EntityType } from "@/lib/lockUtils"
import { EntityStateBadge } from "@/components/badges/EntityStateBadge"
import { StatsChart } from "@/components/graphics/StatsChart"
import { useProject } from "@/hooks/useProject"
import { BackToProjectButton } from "@/components/BackToProjectButton"
import { useApproveStakeholders } from "@/hooks/useApproveActions"


function StakeholdersView() {
  const { getLock } = useLocks()
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {stakeholderStats, editPermission, isManager } = useProject();

  const fetchStakeholders = useCallback(() =>
  fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders`, { credentials: 'include' })
    .then(r => { if (!r.ok) throw new Error('Failed to fetch stakeholders'); return r.json(); }),
  [projectId]
  );

  const { data:stakeholders, loading, error, refresh } = useBackendResource<Stakeholder[]>({
    fetcher: fetchStakeholders,
    enabled: isAuthenticated,
  });

  const { approveStakeholders, loading: approving } = useApproveStakeholders({
    projectId: projectId!,
    onSuccess: refresh,
  })

  const pendingIds = useMemo(
    () => stakeholders?.filter(s => s.state === "PENDING_APPROVAL").map(s => s.id),
    [stakeholders]
  )

  if (loading) return <LoadingSpinner text="Loading Stakeholders..."/>;

  if (error) return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 font-semibold">Error</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
      <Button variant="outline" className="mt-4" onClick={() => fetchStakeholders()}>Try Again</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <BackToProjectButton className="mb-0" projectId={projectId!}/>
      
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Stakeholders</h1>
          <p className="text-slate-500 mt-1">Manage project actors and interest groups.</p>
        </div>
        <div className="flex items-stretch gap-3">
          {stakeholderStats && (
            <Card className="p-4">
              <StatsChart stats={stakeholderStats} title="Stakeholder States" size={100} />
            </Card>
          )}
          <div className="flex flex-col gap-3">
            {editPermission && 
              <CreateStakeholderDialog projectId={projectId!} onSuccess={refresh}/>
            }
            {isManager && 
              <Button size="sm" variant="outline" 
              disabled={pendingIds?.length===0?true:approving} 
              onClick={() => approveStakeholders(pendingIds!)}>
                {approving ? "Approving..." : `Approve All (${pendingIds?.length})`}
              </Button>
            }
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Project Stakeholders</CardTitle>
          <CardDescription>Listed stakeholders for this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders?.map((s) => (
                <TableRow 
                  key={s.id} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/project/${projectId}/stakeholders/${s.id}`)}
                >
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-500">{s.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <LockIndicator lock={getLock(EntityType.STAKEHOLDER, s.id)} />
                      <EntityStateBadge state={s.state} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default StakeholdersView;