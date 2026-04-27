import { useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../lib/globalVars"
import { Button } from "../../components/ui/button"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
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
import { CreateNonFunctionalRequirementDialog } from "../../components/CreateNonFunctionalRequirementDialog"
import { RequirementStateBadge } from "@/components/RequirementStateBadge"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement"

function NonFunctionalRequirementsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const fetchRequirements = useCallback(() =>
    fetch(`${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Failed to fetch requirements'); return r.json(); }),
    [projectId]
  );

  const { data, loading, error } = useBackendResource<NonFunctionalRequirement[]>({
    fetcher: fetchRequirements,
    enabled: isAuthenticated,
  });
  const requirements = data?? [];

  if (loading) return <LoadingSpinner text="Loading Non-Functional Requirements..." />;

  if (error) return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 font-semibold">Error</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
      <Button variant="outline" className="mt-4" onClick={() => fetchRequirements()}>Try Again</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Non-Functional Requirements</h1>
          <p className="text-slate-500 mt-1">Manage quality attributes and system constraints.</p>
        </div>
        {user?.isAdmin && (
          <CreateNonFunctionalRequirementDialog projectId={projectId!} onSuccess={fetchRequirements} />
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Project Non-Functional Requirements</CardTitle>
          <CardDescription>Listed non-functional requirements for this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/project/${projectId}/nfr/${r.id}`)}
                >
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-mono text-xs">{r.identifier}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-500">{r.description}</TableCell>
                  <TableCell>
                    <RequirementStateBadge state={r.state} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ))}
              {requirements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 italic py-8">
                    No non-functional requirements found for this project.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default NonFunctionalRequirementsView;
