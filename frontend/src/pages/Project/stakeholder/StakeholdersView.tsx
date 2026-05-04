import { useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../lib/globalVars"
import { Button } from "../../../components/ui/button"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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


function StakeholdersView() {
  const { getLock } = useLocks()
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const fetchStakeholders = useCallback(() =>
  fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders`, { credentials: 'include' })
    .then(r => { if (!r.ok) throw new Error('Failed to fetch stakeholders'); return r.json(); }),
  [projectId]
);

const { data, loading, error, refresh } = useBackendResource<Stakeholder[]>({
  fetcher: fetchStakeholders,
  enabled: isAuthenticated,
});
const stakeholders = data ?? [];

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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Stakeholders</h1>
          <p className="text-slate-500 mt-1">Manage project actors and interest groups.</p>
        </div>
        {user?.isAdmin && <CreateStakeholderDialog projectId={projectId!} onSuccess={refresh}/>}
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
              {stakeholders.map((s) => (
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
                      {s.pendingReview && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase text-[10px]">
                          Pending Review
                        </Badge>
                      )}
                      {s.state === "ACTIVE" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="uppercase text-[10px]">Deactivated</Badge>
                      )}
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