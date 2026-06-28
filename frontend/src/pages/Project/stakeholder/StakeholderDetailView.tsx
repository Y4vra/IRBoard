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
import { useBackendResource } from "@/hooks/useBackendResource";
import { useApproveStakeholders, useDeleteStakeholders, useRemoveStakeholders, useEnableStakeholders, useDisableStakeholders } from "@/hooks/useStakeholderActions";
import { useAuth } from "@/context/AuthContext";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { EntitySlugDisplay } from "@/components/EntitySlugDisplay";

function isFR(r: RequirementSummaryDTO): r is FunctionalRequirementSummaryDTO {
  return r.requirementType === "FR";
}

function requirementPath(r: RequirementSummaryDTO, projectId: string): string {
  if (isFR(r)) {
    return `/project/${projectId}/functionalities/${r.functionalityId}/functionalRequirements/${r.id}`;
  }
  return `/project/${projectId}/nfr/${r.id}`;
}

// --- Extracted sub-components ---

interface ActionButtonProps {
  testId?: string;
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

function ActionButton({ testId, label, loadingLabel, loading, disabled, onClick }: ActionButtonProps) {
  return (
    <Button data-testid={testId} variant="outline" size="sm" disabled={disabled} onClick={onClick}>
      {loading ? loadingLabel : label}
    </Button>
  );
}

interface RequirementsSectionProps {
  requirements: RequirementSummaryDTO[];
  label: string;
  badgeClass: string;
  badgeLabel: string;
  hoverClass: string;
  projectId: string;
  navigate: (path: string) => void;
}

function RequirementsSection({ requirements, label, badgeClass, badgeLabel, hoverClass, projectId, navigate }: RequirementsSectionProps) {
  if (requirements.length === 0) return null;
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {requirements.map((r) => (
          <Card
            key={r.id}
            className={`${hoverClass} transition-colors cursor-pointer`}
            onClick={() => navigate(requirementPath(r, projectId))}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <Badge className={`${badgeClass} text-[10px] font-semibold shrink-0`}>
                  {badgeLabel}
                </Badge>
                <CardTitle className="text-sm flex-1 truncate">{r.name}</CardTitle>
                <Badge variant="outline" className="text-[10px] shrink-0">{r.state}</Badge>
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
  );
}

// --- Main component ---

function StakeholderDetailView() {
  const { projectId, stakeholderId } = useParams<{ projectId: string; stakeholderId: string }>();
  const { editPermission, isManager } = useProject();
  const navigate = useNavigate();
  const { getLock } = useLocks();
  const { user } = useAuth();

  const lock = getLock(EntityType.STAKEHOLDER, Number(stakeholderId));
  const isLockedByAnotherUser = !!lock && lock.username !== user?.name;

  const fetcher = useCallback(
    () => fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders/${stakeholderId}`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch stakeholder"); return r.json(); }),
    [projectId, stakeholderId]
  );

  const { data: stakeholder, loading, error, refresh } = useBackendResource<Stakeholder>({ fetcher });

  const { approveStakeholders, loading: approving } = useApproveStakeholders({ projectId: projectId!, onSuccess: refresh });
  const { disableStakeholders, loading: disabling } = useDisableStakeholders({ projectId: projectId!, onSuccess: refresh });
  const { enableStakeholders, loading: enabling } = useEnableStakeholders({ projectId: projectId!, onSuccess: refresh });
  const { removeStakeholders, loading: removing } = useRemoveStakeholders({ projectId: projectId!, onSuccess: () => navigate(`/project/${projectId}/stakeholders`) });
  const { deleteStakeholders, loading: deleting } = useDeleteStakeholders({ projectId: projectId!, onSuccess: () => navigate(`/project/${projectId}/stakeholders`) });

  if (loading) return <LoadingSpinner />;
  if (error || !stakeholder) return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
      <p className="text-red-600 font-semibold">Stakeholder not found.</p>
      <Button asChild variant="outline" className="mt-4">
        <Link to={`/project/${projectId}/stakeholders`}>Back to Stakeholders</Link>
      </Button>
    </div>
  );

  const isDeactivated = stakeholder.state === "DEACTIVATED";
  const isRemoved = stakeholder.state === "REMOVED";
  const ableToBeModified = !isLockedByAnotherUser && !isDeactivated && !isRemoved;
  const frRequirements = stakeholder.observers.filter(isFR);
  const nfrRequirements = stakeholder.observers.filter((r: RequirementSummaryDTO) => !isFR(r));

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
            <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Stakeholder</p>
            <h1 data-testid="stakeholder_detail_header" className="text-4xl font-black tracking-tight">{stakeholder.name}</h1>
            <div className="flex flex-wrap items-center gap-3 flex-wrap">
              <EntitySlugDisplay slug={stakeholder.entityIdentifier}/>
              <EntityStateBadge state={stakeholder.state} />
            </div>
            {stakeholder.description && (
              <p className="text-xl text-muted-foreground leading-relaxed">{stakeholder.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <LockIndicator lock={lock} />

          {editPermission && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={!ableToBeModified}
                title={isLockedByAnotherUser ? "This stakeholder is currently being edited by another user" : undefined}
                onClick={() => ableToBeModified && navigate(`/project/${projectId}/stakeholders/${stakeholderId}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Modify Stakeholder
              </Button>
              <ActionButton testId="disable_project_element" label="Disable stakeholder" loadingLabel="Disabling..." loading={disabling} disabled={isDeactivated} onClick={() => disableStakeholders([stakeholder.id])} />
              <ActionButton label="Enable stakeholder" loadingLabel="Enabling..." loading={enabling} disabled={!isDeactivated} onClick={() => enableStakeholders([stakeholder.id])} />
            </>
          )}

          {isManager && (
            <>
              <ActionButton label="Approve Stakeholder" loadingLabel="Approving..." loading={approving} disabled={stakeholder.state !== "PENDING_APPROVAL"} onClick={() => approveStakeholders([stakeholder.id])} />
              <ConfirmActionDialog
                trigger={
                  <Button data-testid="remove_project_element" variant="outline" size="sm" disabled={!isDeactivated || removing}>
                    {removing ? "Removing..." : "Remove stakeholder"}
                  </Button>
                }
                title="Remove this stakeholder?"
                description="This stakeholder will be marked as removed and will no longer be active. Managers can still view and restore it."
                confirmLabel="Remove"
                loading={removing}
                disabled={!isDeactivated}
                onConfirm={() => removeStakeholders([stakeholder.id])}
              />
            </>
          )}

          {isManager && isRemoved && (
            <ConfirmActionDialog
              trigger={
                <Button data-testid="delete_project_element" variant="outline" size="sm" disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete stakeholder permanently"}
                </Button>
              }
              title="Delete permanently?"
              description="This action cannot be undone. The stakeholder will be erased from the project entirely."
              confirmLabel="Delete permanently"
              confirmVariant="destructive"
              loading={deleting}
              onConfirm={() => deleteStakeholders([stakeholder.id])}
            />
          )}
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
            <RequirementsSection
              requirements={frRequirements}
              label="Functional"
              badgeLabel="FR"
              badgeClass="bg-blue-50 text-blue-700 border border-blue-200"
              hoverClass="hover:border-blue-300"
              projectId={projectId!}
              navigate={navigate}
            />
            <RequirementsSection
              requirements={nfrRequirements}
              label="Non-functional"
              badgeLabel="NFR"
              badgeClass="bg-green-50 text-green-700 border border-green-200"
              hoverClass="hover:border-green-300"
              projectId={projectId!}
              navigate={navigate}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default StakeholderDetailView;