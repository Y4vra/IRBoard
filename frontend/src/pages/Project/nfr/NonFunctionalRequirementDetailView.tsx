import { useCallback, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Pencil,
  Users,
  FileText,
  GitBranch,
  Plus,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RequirementStateBadge } from "@/components/badges/RequirementStateBadge";
import { useBackendResource } from "@/hooks/useBackendResource";
import { ObserveStakeholderDialog } from "../../../components/dialogs/observation/ObserveStakeholderDialog";
import { ObserveDocumentDialog } from "../../../components/dialogs/observation/ObserveDocumentDialog";
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement";
import { CreateNonFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateNonFunctionalRequirementDialog";
import { RemoveButton } from "@/components/RemoveButton";
import { EntityStateBadge } from "@/components/badges/EntityStateBadge";
import { useProject } from "@/hooks/useProject";
import { sortByOrderValue } from "@/lib/reorderUtils";
import { useApproveNFRequirements } from "@/hooks/useApproveActions";
import { LockIndicator } from "@/components/LockIndicator";
import { useLocks } from "@/hooks/useLocks";
import { EntityType } from "@/lib/lockUtils";
import { useDisableNFRequirements } from "@/hooks/useDisableActions";
import { useEnableNFRequirements } from "@/hooks/useEnableActions";
import { useRemoveNFRequirements } from "@/hooks/useRemoveActions";
import { useDeleteNFRequirements } from "@/hooks/useDeleteActions";
import { useFinishNFRequirements } from "@/hooks/useFinishActions";
import { useAuth } from "@/context/AuthContext";

// ─── Operator helpers ─────────────────────────────────────────────────────────

const OPERATOR_SYMBOLS: Record<string, string> = {
  EQUAL_TO: "=",
  GREATER_THAN: ">",
  GREATER_THAN_OR_EQUAL_TO: "≥",
  LESS_THAN: "<",
  LESS_THAN_OR_EQUAL_TO: "≤",
  NOT_EQUAL_TO: "≠",
};

const OPERATOR_LABELS: Record<string, string> = {
  EQUAL_TO: "must equal",
  GREATER_THAN: "must be greater than",
  GREATER_THAN_OR_EQUAL_TO: "must be ≥",
  LESS_THAN: "must be less than",
  LESS_THAN_OR_EQUAL_TO: "must be ≤",
  NOT_EQUAL_TO: "must not equal",
};

function evaluatePassing(
  actual: number | null | undefined,
  operator: string | null | undefined,
  threshold: number | null | undefined
): boolean | null {
  if (actual == null || threshold == null || !operator) return null;
  switch (operator) {
    case "EQUAL_TO": return actual === threshold;
    case "GREATER_THAN": return actual > threshold;
    case "GREATER_THAN_OR_EQUAL_TO": return actual >= threshold;
    case "LESS_THAN": return actual < threshold;
    case "LESS_THAN_OR_EQUAL_TO": return actual <= threshold;
    case "NOT_EQUAL_TO": return actual !== threshold;
    default: return null;
  }
}

// ─── Metric expression block ──────────────────────────────────────────────────

function MetricExpression({ req,passing }: { req: NonFunctionalRequirement,passing:boolean }) {
  const { actualValue, thresholdValue, targetValue, operator, measurementUnit } = req;

  const hasMetrics =
    actualValue != null || thresholdValue != null || targetValue != null;

  if (!hasMetrics) return null;

  const unit = measurementUnit ? ` ${measurementUnit}` : "";

  // Progress bar: position of actual relative to threshold (clamped 0–100%)
  const barPercent =
    actualValue != null && thresholdValue != null && thresholdValue !== 0
      ? Math.min(100, Math.max(0, Math.round((actualValue / thresholdValue) * 100)))
      : null;

  const targetPercent =
    targetValue != null && thresholdValue != null && thresholdValue !== 0
      ? Math.min(100, Math.max(0, Math.round((targetValue / thresholdValue) * 100)))
      : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      {/* Expression row */}
      <div className="flex items-center flex-wrap gap-y-3">
        {/* Actual */}
        {actualValue != null && (
          <div className="flex flex-col items-center gap-1 min-w-[64px]">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
              Actual
            </span>
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {actualValue}
            </span>
            {unit && (
              <span className="text-xs text-slate-400 font-mono">{unit.trim()}</span>
            )}
          </div>
        )}

        {/* Operator */}
        {operator && thresholdValue != null && actualValue != null && (
          <div className="flex flex-col items-center px-4 gap-0.5">
            <span className="text-2xl text-slate-400 leading-none font-light">
              {OPERATOR_SYMBOLS[operator] ?? operator}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-300 whitespace-nowrap">
              must be
            </span>
          </div>
        )}

        {/* Threshold */}
        {thresholdValue != null && (
          <div className="flex flex-col items-center gap-1 min-w-[64px]">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
              Threshold
            </span>
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {thresholdValue}
            </span>
            {unit && (
              <span className="text-xs text-slate-400 font-mono">{unit.trim()}</span>
            )}
          </div>
        )}

        {/* Spacer + right-side info */}
        <div className="flex-1 min-w-6" />

        <div className="flex flex-col items-end gap-2">
          {/* Passing / Failing pill — only shown when we can evaluate */}
          {passing !== null && (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                passing
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {passing ? "Passing" : "Failing"}
            </span>
          )}

          {/* Target — secondary context */}
          {targetValue != null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Target</span>
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {targetValue}{unit}
              </span>
            </div>
          )}

          {/* Operator plain-language fallback when actual is missing */}
          {actualValue == null && operator && thresholdValue != null && (
            <span className="text-xs text-slate-400">
              {OPERATOR_LABELS[operator] ?? operator} {thresholdValue}{unit}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar — only when actual + threshold both present */}
      {barPercent !== null && (
        <div className="space-y-1.5">
          <div className="relative h-1.5 bg-slate-100 rounded-full overflow-visible">
            {/* Filled segment */}
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                passing === false ? "bg-red-400" : "bg-emerald-400"
              }`}
              style={{ width: `${barPercent}%` }}
            />
            {/* Target tick */}
            {targetPercent !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-slate-400 rounded-full"
                style={{ left: `${targetPercent}%` }}
                title={`Target: ${targetValue}${unit}`}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-slate-300 font-mono">
            <span>0</span>
            <span>threshold: {thresholdValue}{unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  icon,
  count,
  onAdd,
  addLabel,
  editPermission,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  onAdd?: () => void;
  addLabel?: string;
  editPermission: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">{icon}</div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                <Badge variant="outline" className="font-mono text-xs">
                  {count}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-0.5">{description}</CardDescription>
            </div>
          </div>
          {editPermission && onAdd && (
            <Button size="sm" variant="outline" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1.5" />
              {addLabel ?? "Add"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── Child NFR tree ───────────────────────────────────────────────────────────

function ChildNFRCard({
  req,
  projectId,
  depth = 0,
}: {
  req: NonFunctionalRequirement;
  projectId: string;
  depth?: number;
}) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = req.children && req.children.length > 0;

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        depth > 0 ? "ml-6 border-l-4 border-l-slate-200" : ""
      }`}
    >
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => navigate(`/project/${projectId}/nfr/${req.id}`)}
      >
        {hasChildren ? (
          <button
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((c) => !c);
            }}
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono text-slate-400">{req.entityIdentifier}</p>
            <p className="font-semibold text-slate-800 truncate">{req.name}</p>
          </div>
          {req.description && (
            <p className="text-sm text-slate-500 truncate mt-0.5">{req.description}</p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <RequirementStateBadge state={req.state} />
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="px-5 pb-4 space-y-3">
          {req.children.map((child) => (
            <ChildNFRCard key={child.id} req={child} projectId={projectId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

function NonFunctionalRequirementDetailView() {
  const { projectId, nfrId } = useParams<{
    projectId: string;
    nfrId: string;
  }>();
  const { editPermission, isManager } = useProject();
  const navigate = useNavigate();

  const { getLock } = useLocks();
  const { user } = useAuth();
  const lock = getLock(EntityType.NON_FUNCTIONAL_REQUIREMENT, Number(nfrId));
  const isLockedByAnotherUser = !!lock && lock.username !== user?.name;

  const [createNFRDialogOpen, setCreateNFRDialogOpen] = useState(false);
  const [stakeholderDialogOpen, setStakeholderDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetcher = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${nfrId}`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch requirement");
        return r.json();
      }),
    [projectId, nfrId]
  );

  const {
    data: requirement,
    loading,
    error,
    refresh,
  } = useBackendResource<NonFunctionalRequirement>({ fetcher });
  
  const { approveNFRequirements, loading: approving } = useApproveNFRequirements({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { finishNFRequirements, loading: finishing } = useFinishNFRequirements({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { disableNFRequirements, loading: disabling } = useDisableNFRequirements({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { enableNFRequirements, loading: enabling } = useEnableNFRequirements({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { removeNFRequirements, loading: removing } = useRemoveNFRequirements({
    projectId: projectId!,
    onSuccess: ()=>navigate(`/project/${projectId}/nfr`),
  })
  const { deleteNFRequirements, loading: deleting } = useDeleteNFRequirements({
    projectId: projectId!,
    onSuccess: ()=>navigate(`/project/${projectId}/nfr`),
  })

  const unlink = async (path: string, id: number) => {
    setRemovingId(id);
    try {
      await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(id),
      });
      refresh();
    } finally {
      setRemovingId(null);
    }
  };

  const unlinkStakeholder = (stakeholderId: number) =>
    unlink(
      `/projects/${projectId}/nonFunctionalRequirements/${nfrId}/unlinkStakeholder`,
      stakeholderId
    );

  const unlinkDocument = (docId: number) =>
    unlink(
      `/projects/${projectId}/nonFunctionalRequirements/${nfrId}/unlinkDocument`,
      docId
    );

  const passing = evaluatePassing(requirement?.actualValue, requirement?.operator, requirement?.thresholdValue);
  const ableToBeModified = !isLockedByAnotherUser && requirement?.state!="DEACTIVATED" && requirement?.state!="REMOVED"

  if (loading) return <LoadingSpinner text="Loading requirement..." />;

  if (error || !requirement)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Could not load requirement</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={`/project/${projectId}/nfr`}>
            Back to Non-Functional Requirements
          </Link>
        </Button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}/nfr`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Non-Functional Requirements
          </Link>
        </Button>
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Non-Functional Requirement
            </p>
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-tight">{requirement.name}</h1>
              <p className="text-xs font-mono text-slate-400">{requirement.entityIdentifier}</p>
            </div>
            {requirement.description && 
              <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">{requirement.description}</p>
            }
            <div className="flex items-center gap-3 flex-wrap">
              <RequirementStateBadge state={requirement.state} />
              {requirement.measurementUnit && (
                <Badge variant="outline" className="text-xs font-mono text-slate-400">
                  {requirement.measurementUnit}
                </Badge>
              )}
            </div>
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
                title={isLockedByAnotherUser ? "This nfr is currently being edited by another user" : undefined}
                onClick={() => navigate(`/project/${projectId}/nfr/${requirement.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit Requirement
              </Button>
              <Button variant="outline" size="sm" 
                disabled={requirement.state === "DEACTIVATED"?true:disabling}
                onClick={() => disableNFRequirements([requirement.id])}>
                {disabling ? "Disabling..." : "Disable requirement"}
              </Button>
              <Button variant="outline" size="sm" 
                disabled={requirement.state === "DEACTIVATED"?enabling:true}
                onClick={() => enableNFRequirements([requirement.id])}>
                {enabling ? "Enabling..." : "Enable requirement"}
              </Button>
            </>
          )}
          {isManager &&
            <>
              <Button variant="outline" size="sm" 
                disabled={requirement.state === "PENDING_APPROVAL"?approving:true}
                onClick={() => approveNFRequirements([requirement.id])}
                >
                {approving ? "Approving..." : "Approve Requirement"}
              </Button>
              <Button variant="outline" size="sm" 
                disabled={requirement.state === "APPROVED" && passing?finishing:true}
                onClick={() => finishNFRequirements([requirement.id])}
                >
                {finishing ? "Marking as finished..." : "Mark as finished"}
              </Button>
              <Button variant="outline" size="sm" 
                disabled={requirement.state === "DEACTIVATED"?removing:true}
                onClick={() => removeNFRequirements([requirement.id])}>
                {removing ? "Removing..." : "Remove requirement"}
              </Button>
            </>
          }
          {isManager && requirement.state === "REMOVED" &&
            <Button variant="outline" size="sm" 
              disabled={deleting}
              onClick={() => deleteNFRequirements([requirement.id])}>
              {deleting ? "Deleting..." : "Delete requirement permanently"}
            </Button>
          }
        </div>
      </header>

      {/* Semantic metric expression */}
      <MetricExpression req={requirement} passing/>

      {/* Children */}
      {(requirement.children?.length > 0 || editPermission) && (
        <SectionCard
          title="Child Requirements"
          description="Hierarchical sub-requirements nested under this NFR."
          icon={<GitBranch className="h-4 w-4" />}
          count={requirement.children?.length ?? 0}
          editPermission={editPermission}
          addLabel="Add Child NFR"
          onAdd={() => setCreateNFRDialogOpen(true)}
        >
          {requirement.children?.length === 0 ? (
            <p className="text-center text-slate-400 italic py-6">No child requirements.</p>
          ) : (
            <div className="space-y-3">
              {requirement.children.map((child) => (
                <ChildNFRCard key={child.id} req={child} projectId={projectId!} />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Stakeholders */}
      <SectionCard
        title="Observed Stakeholders"
        description="Stakeholders who observe or are affected by this requirement."
        icon={<Users className="h-4 w-4" />}
        count={requirement.observedStakeholders?.length ?? 0}
        editPermission={editPermission}
        addLabel="Link Stakeholder"
        onAdd={() => setStakeholderDialogOpen(true)}
      >
        {requirement.observedStakeholders?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">No stakeholders linked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedStakeholders.map((s) => (
              <Card
                key={s.id}
                className="hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${projectId}/stakeholders/${s.id}`)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm flex-1 truncate">{s.name}</CardTitle>
                    {s.state && <EntityStateBadge state={s.state} />}
                    {editPermission && (
                      <RemoveButton
                        onClick={() => unlinkStakeholder(s.id)}
                        loading={removingId === s.id}
                      />
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-9">{s.description}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Documents */}
      <SectionCard
        title="Observed Documents"
        description="Documents related to or referenced by this requirement."
        icon={<FileText className="h-4 w-4" />}
        count={requirement.observedDocuments?.length ?? 0}
        editPermission={editPermission}
        addLabel="Link Document"
        onAdd={() => setDocumentDialogOpen(true)}
      >
        {requirement.observedDocuments?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">No documents linked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${projectId}/documents/${doc.id}`)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm flex-1 truncate">{doc.fileName}</CardTitle>
                    {editPermission && (
                      <RemoveButton
                        onClick={() => unlinkDocument(doc.id)}
                        loading={removingId === doc.id}
                      />
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                  {doc.mimeType && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-9">{doc.mimeType}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Observer FRs — read-only */}
      <SectionCard
        title="Observer Functional Requirements"
        description="Functional requirements that observe or are constrained by this NFR."
        icon={<GitBranch className="h-4 w-4" />}
        count={requirement.observerFRequirements?.length ?? 0}
        editPermission={false}
      >
        {requirement.observerFRequirements?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">
            No functional requirements observe this NFR.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observerFRequirements.map((fr) => (
              <Card
                key={fr.id}
                className="hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() =>
                  navigate(
                    `/project/${projectId}/functionalities/${fr.functionalityId}/functionalRequirements/${fr.id}`
                  )
                }
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold shrink-0">
                      FR
                    </Badge>
                    <CardTitle className="text-sm flex-1 truncate">{fr.name}</CardTitle>
                    {fr.state && <RequirementStateBadge state={fr.state} />}
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                  {fr.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-9">{fr.description}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Dialogs */}
      <CreateNonFunctionalRequirementDialog
        open={createNFRDialogOpen}
        onOpenChange={setCreateNFRDialogOpen}
        projectId={projectId!}
        parentId={nfrId}
        siblingRequirements={sortByOrderValue(requirement.children ?? [])}
        onSuccess={refresh}
      />
      <ObserveStakeholderDialog
        open={stakeholderDialogOpen}
        onOpenChange={setStakeholderDialogOpen}
        projectId={projectId!}
        functionalityId=""
        requirementId={nfrId!}
        requirementType="NFR"
        onSuccess={refresh}
      />
      <ObserveDocumentDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        projectId={projectId!}
        functionalityId=""
        requirementId={nfrId!}
        requirementType="NFR"
        onSuccess={refresh}
      />
    </div>
  );
}

export default NonFunctionalRequirementDetailView;