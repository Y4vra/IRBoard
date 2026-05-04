import { useCallback, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../lib/globalVars";
import { useAuth } from "@/context/AuthContext";
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
  ShieldCheck,
  FileText,
  GitBranch,
  Plus,
  Circle,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RequirementStateBadge } from "@/components/RequirementStateBadge";
import { useBackendResource } from "@/hooks/useBackendResource";
import { AddStakeholderDialog } from "../../../components/dialogs/observation/ObserveStakeholderDialog";
import { AddNFRDialog } from "../../../components/dialogs/observation/ObserveNfrDialog";
import { AddDocumentDialog } from "../../../components/dialogs/observation/ObserveDocumentDialog";
import { AddLinkedFRDialog } from "../../../components/dialogs/observation/ObserveFrDialog";
import type { FunctionalRequirement } from "@/types/FunctionalRequirement";
import { CreateFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateFunctionalRequirementDialog";
import { useProject } from "@/hooks/useProject";


// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  MUST: "bg-amber-50 text-amber-700 border-amber-200",
  SHOULD: "bg-blue-50 text-blue-700 border-blue-200",
  COULD: "bg-slate-100 text-slate-600 border-slate-200",
  WONT: "bg-red-50 text-red-400 border-red-100",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
};

function PriorityBadge({ priority }: { priority?: string | null }) {
  if (!priority) return null;
  const className =
    PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <Badge className={`border font-semibold text-xs ${className}`}>
      {priority}
    </Badge>
  );
}

// ─── Child FR tree ────────────────────────────────────────────────────────────

function ChildRequirementCard({
  req,
  projectId,
  functionalityId,
  depth = 0,
}: {
  req: FunctionalRequirement;
  projectId: string;
  functionalityId: string;
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
        onClick={() => navigate(`/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${req.id}`)}
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
            <p className="font-semibold text-slate-800 truncate">{req.name}</p>
          </div>
          {req.description && (
            <p className="text-sm text-slate-500 truncate mt-0.5">
              {req.description}
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <PriorityBadge priority={req.priority} />
          <RequirementStateBadge state={req.state} />
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="px-5 pb-4 space-y-3">
          {req.children.map((child) => (
            <ChildRequirementCard
              key={child.id}
              req={child}
              projectId={projectId}
              functionalityId={functionalityId}
              depth={depth + 1}
            />
          ))}
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
  isAdmin,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  onAdd?: () => void;
  addLabel?: string;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              {icon}
            </div>
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
          {isAdmin && onAdd && (
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

// ─── Main view ────────────────────────────────────────────────────────────────

function FunctionalRequirementDetailView() {
  const { projectId, functionalityId, frId } = useParams<{
    projectId: string;
    functionalityId: string;
    frId: string;
  }>();
  const project = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dialog open states
  const [createFunctionalRequirementDialogOpen, setCreateFunctionalRequirementDialogOpen] = useState(false);
  const [stakeholderDialogOpen, setStakeholderDialogOpen] = useState(false);
  const [nfrDialogOpen, setNfrDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [linkedFRDialogOpen, setLinkedFRDialogOpen] = useState(false);

  const fetcher = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${frId}`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch requirement");
        return r.json();
      }),
    [projectId, functionalityId, frId]
  );

  const {
    data: requirement,
    loading,
    error,
    refresh,
  } = useBackendResource<FunctionalRequirement>({ fetcher });

  if (loading) return <LoadingSpinner text="Loading requirement..." />;

  if (error || !requirement)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Could not load requirement</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={`/project/${projectId}/functionalities/${functionalityId}`}>
            Back to Functionality
          </Link>
        </Button>
      </div>
    );

  const isAdmin = !!user?.isAdmin;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}/functionalities/${functionalityId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Functionality
          </Link>
        </Button>
        {isAdmin && (
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" /> Edit Requirement
          </Button>
        )}
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Functional Requirement
          </p>
          <h1 className="text-4xl font-black tracking-tight">
            {requirement.name}
          </h1>
          {requirement.description && (
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
              {requirement.description}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <RequirementStateBadge state={requirement.state} />
            <PriorityBadge priority={requirement.priority} />
            {requirement.stability && (
              <Badge variant="outline" className="text-xs font-mono text-slate-400">
                {requirement.stability}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 shrink-0 flex-wrap justify-end">
          {[
            { label: "Children", value: requirement.children?.length ?? 0 },
            { label: "Stakeholders", value: requirement.observedStakeholders?.length ?? 0 },
            { label: "NFRs", value: requirement.observedNFRequirements?.length ?? 0 },
            { label: "Docs", value: requirement.observedDocuments?.length ?? 0 },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[72px]"
            >
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Children */}
      {(requirement.children?.length > 0 || isAdmin) && (
        <SectionCard
          title="Child Requirements"
          description="Hierarchical sub-requirements nested under this requirement."
          icon={<GitBranch className="h-4 w-4" />}
          count={requirement.children?.length ?? 0}
          isAdmin={isAdmin}
          addLabel="Add Child FR"
          onAdd={() => setCreateFunctionalRequirementDialogOpen(true)}
        >
          {requirement.children?.length === 0 ? (
            <p className="text-center text-slate-400 italic py-6">
              No child requirements.
            </p>
          ) : (
            <div className="space-y-3">
              {requirement.children.map((child) => (
                <ChildRequirementCard
                  key={child.id}
                  req={child}
                  projectId={projectId!}
                  functionalityId={functionalityId!}
                />
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
        isAdmin={isAdmin}
        addLabel="Link Stakeholder"
        onAdd={() => setStakeholderDialogOpen(true)}
      >
        {requirement.observedStakeholders?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">
            No stakeholders linked.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedStakeholders.map((s) => (
              <Card
                key={s.id}
                className="hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() =>
                  navigate(`/project/${projectId}/stakeholders/${s.id}`)
                }
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm flex-1 truncate">{s.name}</CardTitle>
                    {s.state && (
                      <Badge
                        className={
                          s.state === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700 text-[10px]"
                            : "bg-red-100 text-red-700 text-[10px]"
                        }
                      >
                        {s.state}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-9">
                      {s.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Non-Functional Requirements */}
      <SectionCard
        title="Observed Non-Functional Requirements"
        description="NFRs that apply to or constrain this functional requirement."
        icon={<ShieldCheck className="h-4 w-4" />}
        count={requirement.observedNFRequirements?.length ?? 0}
        isAdmin={isAdmin}
        addLabel="Link NFR"
        onAdd={() => setNfrDialogOpen(true)}
      >
        {requirement.observedNFRequirements?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">
            No NFRs linked.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedNFRequirements.map((nfr) => (
              <Card
                key={nfr.id}
                className="hover:border-violet-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${projectId}/nfr/${nfr.id}`)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold shrink-0">
                      NFR
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-400 truncate">
                        {nfr.id}
                      </p>
                      <CardTitle className="text-sm truncate">{nfr.name}</CardTitle>
                    </div>
                    {nfr.state && <RequirementStateBadge state={nfr.state} />}
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
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
        isAdmin={isAdmin}
        addLabel="Link Document"
        onAdd={() => setDocumentDialogOpen(true)}
      >
        {requirement.observedDocuments?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">
            No documents linked.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => doc.url && window.open(doc.url, "_blank")}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm flex-1 truncate">{doc.name}</CardTitle>
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                  {doc.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-9">
                      {doc.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Linked Functional Requirements */}
      <SectionCard
        title="Observed Functional Requirements"
        description="Other functional requirements related to this one."
        icon={<Circle className="h-4 w-4" />}
        count={requirement.observedFRequirements?.length ?? 0}
        isAdmin={isAdmin}
        addLabel="Link FR"
        onAdd={() => setLinkedFRDialogOpen(true)}
      >
        {requirement.observedFRequirements?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">
            No observed functional requirements.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedFRequirements.map((fr) => (
              <Card
                key={fr.id}
                className="hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() =>
                  navigate(
                    `/project/${projectId}/functionalities/${fr.functionalityId}/requirement/${fr.id}`
                  )
                }
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold shrink-0">
                      FR
                    </Badge>
                    <CardTitle className="text-sm flex-1 truncate">{fr.name}</CardTitle>
                    <RequirementStateBadge state={fr.state} />
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                  {fr.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-9">
                      {fr.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Dialogs */}
      <CreateFunctionalRequirementDialog
        open={createFunctionalRequirementDialogOpen}
        onOpenChange={setCreateFunctionalRequirementDialogOpen}
        projectId={projectId!}
        functionalityId={functionalityId!}
        parentId={frId}
        priorityStyle={project.priorityStyle}
        onSuccess={refresh}
      />
      <AddStakeholderDialog
        open={stakeholderDialogOpen}
        onOpenChange={setStakeholderDialogOpen}
        projectId={projectId!}
        functionalityId={functionalityId!}
        requirementId={frId!}
        requirementType="FR"
        onSuccess={refresh}
      />
      <AddNFRDialog
        open={nfrDialogOpen}
        onOpenChange={setNfrDialogOpen}
        projectId={projectId!}
        functionalityId={functionalityId!}
        functionalRequirementId={frId!}
        onSuccess={refresh}
      />
      <AddDocumentDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        projectId={projectId!}
        functionalityId={functionalityId!}
        requirementId={frId!}
        requirementType="FR"
        onSuccess={refresh}
      />
      <AddLinkedFRDialog
        open={linkedFRDialogOpen}
        onOpenChange={setLinkedFRDialogOpen}
        projectId={projectId!}
        functionalityId={functionalityId!}
        functionalRequirementId={frId!}
        onSuccess={refresh}
      />
    </div>
  );
}

export default FunctionalRequirementDetailView;