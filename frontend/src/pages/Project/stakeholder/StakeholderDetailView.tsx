import { useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../lib/globalVars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, FileText, ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { FunctionalRequirementSummaryDTO, RequirementSummaryDTO } from "@/types/RequirementSummaryDTO";
import type { Stakeholder } from "@/types/Stakeholder";
import { useLocks } from "@/hooks/useLocks";
import { LockIndicator } from "@/components/LockIndicator";
import { EntityType } from "@/lib/lockUtils";
import { EntityStateBadge } from "@/components/badges/EntityStateBadge";
import { useProject } from "@/hooks/useProject";
import { useApproveStakeholders } from "@/hooks/useApproveActions";
import { useBackendResource } from "@/hooks/useBackendResource";
import { useDeleteStakeholders } from "@/hooks/useDeleteActions";
import { useRemoveStakeholders } from "@/hooks/useRemoveActions";
import { useEnableStakeholders } from "@/hooks/useEnableActions";
import { useDisableStakeholders } from "@/hooks/useDisableActions";
import { useAuth } from "@/context/AuthContext";

function isFR(r: RequirementSummaryDTO): r is FunctionalRequirementSummaryDTO {
  return r.requirementType === "FR";
}

function requirementPath(r: RequirementSummaryDTO, projectId: string): string {
  if (isFR(r)) {
    return `/project/${projectId}/functionalities/${r.functionalityId}/functionalRequirements/${r.id}`;
  }
  return `/project/${projectId}/nfr/${r.id}`;
}

function StakeholderDetailView() {
  const { projectId, stakeholderId } = useParams<{ projectId: string; stakeholderId: string }>();
  const { editPermission, isManager } = useProject();
  const navigate = useNavigate();

  const { getLock } = useLocks();
  const { user } = useAuth();
  const lock = getLock(EntityType.STAKEHOLDER, Number(stakeholderId));
  const isLockedByAnotherUser = !!lock && lock.username !== user?.name;

  const fetcher = useCallback(
    () => fetch(
      `${API_BASE_URL}/projects/${projectId}/stakeholders/${stakeholderId}`,
      { credentials: "include" }
    ).then(r => {
      if (!r.ok) throw new Error("Failed to fetch stakeholder");
      return r.json();
    }),
    [projectId, stakeholderId]
  );

  const { data: stakeholder, loading, error, refresh } = useBackendResource<Stakeholder>({ fetcher });


  const { approveStakeholders, loading: approving } = useApproveStakeholders({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { disableStakeholders, loading: disabling } = useDisableStakeholders({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { enableStakeholders, loading: enabling } = useEnableStakeholders({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { removeStakeholders, loading: removing } = useRemoveStakeholders({
    projectId: projectId!,
    onSuccess: ()=>navigate(`/project/${projectId}/stakeholders`),
  })
  const { deleteStakeholders, loading: deleting } = useDeleteStakeholders({
    projectId: projectId!,
    onSuccess: ()=>navigate(`/project/${projectId}/stakeholders`),
  })

  const ableToBeModified = !isLockedByAnotherUser && stakeholder?.state!="DEACTIVATED" && stakeholder?.state!="REMOVED" 

  if (loading) return <LoadingSpinner />;
  if (error || !stakeholder)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <p className="text-red-600 font-semibold">Stakeholder not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={`/project/${projectId}/stakeholders`}>Back to Stakeholders</Link>
        </Button>
      </div>
    );

  const frRequirements = stakeholder.observers.filter(isFR);
  const nfrRequirements = stakeholder.observers.filter((r:RequirementSummaryDTO) => !isFR(r));

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-6 animate-in fade-in duration-500">
      <nav>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}/stakeholders`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stakeholders
          </Link>
        </Button>
      </nav>

      <header className="flex items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Stakeholder
            </p>
            <div>
              <h1 className="text-4xl font-black tracking-tight">{stakeholder.name}</h1>
              <p className="text-xs font-mono text-slate-400 pt-2">{stakeholder.entityIdentifier}</p>
            </div>
            {stakeholder.description &&
              <p className="text-xl text-muted-foreground leading-relaxed">{stakeholder.description}</p>
            }
            <EntityStateBadge state={stakeholder.state}/>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <LockIndicator lock={lock} />
          {editPermission && 
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={!ableToBeModified}
                title={isLockedByAnotherUser ? "This stakeholder is currently being edited by another user" : undefined}
                onClick={() => {
                  if (ableToBeModified) {
                    navigate(`/project/${projectId}/stakeholders/${stakeholderId}/edit`);
                  }
                }}
                >
                <Pencil className="mr-2 h-4 w-4" /> Modify Stakeholder
              </Button>
              <Button variant="outline" size="sm" 
                  disabled={stakeholder.state === "DEACTIVATED"?true:disabling}
                  onClick={() => disableStakeholders([stakeholder.id])}>
                  {disabling ? "Disabling..." : "Disable stakeholder"}
                </Button>
                <Button variant="outline" size="sm" 
                  disabled={stakeholder.state === "DEACTIVATED"?enabling:true}
                  onClick={() => enableStakeholders([stakeholder.id])}>
                  {enabling ? "Enabling..." : "Enable stakeholder"}
                </Button>
            </>
          }
          {isManager &&
            <>
              <Button variant="outline" size="sm" 
                disabled={stakeholder.state === "PENDING_APPROVAL"?approving:true}
                onClick={() => approveStakeholders([stakeholder.id])}>
                {approving ? "Approving..." : "Approve Stakeholder"}
              </Button>
              <Button variant="outline" size="sm" 
                  disabled={stakeholder.state === "DEACTIVATED"?removing:true}
                  onClick={() => removeStakeholders([stakeholder.id])}>
                  {removing ? "Removing..." : "Remove stakeholder"}
                </Button>
            </>
          }
          {isManager && stakeholder.state === "REMOVED" &&
            <Button variant="outline" size="sm" 
              disabled={deleting}
              onClick={() => deleteStakeholders([stakeholder.id])}>
              {deleting ? "Deleting..." : "Delete stakeholder permanently"}
            </Button>
          }
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          Linked Requirements
        </h2>

        {stakeholder.observers.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No requirements linked to this stakeholder.</p>
        ) : (
          <div className="space-y-6">

            {frRequirements.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Functional
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {frRequirements.map((r) => (
                    <Card
                      key={r.id}
                      className="hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => navigate(requirementPath(r, projectId!))}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold shrink-0">
                            FR
                          </Badge>
                          <CardTitle className="text-sm flex-1 truncate">{r.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {r.state}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                        </div>
                        {r.description && (
                          <p className="text-xs text-slate-400 truncate mt-1 pl-9">{r.description}</p>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {nfrRequirements.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Non-functional
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nfrRequirements.map((r) => (
                    <Card
                      key={r.id}
                      className="hover:border-green-300 transition-colors cursor-pointer"
                      onClick={() => navigate(requirementPath(r, projectId!))}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold shrink-0">
                            NFR
                          </Badge>
                          <CardTitle className="text-sm flex-1 truncate">{r.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {r.state}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                        </div>
                        {r.description && (
                          <p className="text-xs text-slate-400 truncate mt-1 pl-9">{r.description}</p>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>
    </div>
  );
}

export default StakeholderDetailView;