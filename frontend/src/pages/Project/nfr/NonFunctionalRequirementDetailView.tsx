import { useCallback, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/globalVars";
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
  Trash2,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RequirementStateBadge } from "@/components/RequirementStateBadge";
import { useBackendResource } from "@/hooks/useBackendResource";
import { ObserveStakeholderDialog } from "../../../components/dialogs/observation/ObserveStakeholderDialog";
// import { ObserveNFRDialog } from "../../../components/dialogs/observation/ObserveNfrDialog";
import { AddDocumentDialog } from "../../../components/dialogs/observation/ObserveDocumentDialog";
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement";
import { CreateNonFunctionalRequirementDialog } from "@/components/dialogs/creatingDialogs/CreateNonFunctionalRequirementDialog";

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
            <p className="text-xs font-mono text-slate-400">{req.identifier}</p>
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
            <ChildNFRCard
              key={child.id}
              req={child}
              projectId={projectId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Remove button ────────────────────────────────────────────────────────────

function RemoveButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={loading}
      className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Remove"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

function NonFunctionalRequirementDetailView() {
  const { projectId, nfrId } = useParams<{
    projectId: string;
    nfrId: string;
  }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [createNonFunctionalRequirementDialogOpen,setCreateNonFunctionalRequirementDialogOpen]= useState(false);
  const [stakeholderDialogOpen, setStakeholderDialogOpen] = useState(false);
  // const [nfrDialogOpen, setNfrDialogOpen] = useState(false);
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

  // ─── Unlink helpers ───────────────────────────────────────────────────────

  const unlink = async (path: string, id: number) => {
    setRemovingId(id);
    try {
      await fetch(`${API_BASE_URL}${path}`, {
        method: "DELETE",
        credentials: "include",
      });
      refresh();
    } finally {
      setRemovingId(null);
    }
  };

  const unlinkStakeholder = (stakeholderId: number) =>
    unlink(
      `/projects/${projectId}/nonFunctionalRequirements/${nfrId}/unlinkStakeholder/${stakeholderId}`,
      stakeholderId
    );

  // const unlinkNfr = (linkedNfrId: number) =>
  //   unlink(
  //     `/projects/${projectId}/nonFunctionalRequirements/${nfrId}/nonFunctionalRequirements/${linkedNfrId}`,
  //     linkedNfrId
  //   );

  const unlinkDocument = (docId: number) =>
    unlink(
      `/projects/${projectId}/nonFunctionalRequirements/${nfrId}/documents/${docId}`,
      docId
    );

  // ─────────────────────────────────────────────────────────────────────────

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

  const isAdmin = !!user?.isAdmin;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}/nfr`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Non-Functional Requirements
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
            Non-Functional Requirement
          </p>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 mb-1">{requirement.identifier}</p>
              <h1 className="text-4xl font-black tracking-tight">{requirement.name}</h1>
            </div>
          </div>
          {requirement.description && (
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
              {requirement.description}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <RequirementStateBadge state={requirement.state} />
            {requirement.measurementUnit && (
              <Badge variant="outline" className="text-xs font-mono text-slate-400">
                {requirement.measurementUnit}
              </Badge>
            )}
          </div>
        </div>

        {/* Metric stats */}
        <div className="flex gap-3 shrink-0 flex-wrap justify-end">
          {[
            { label: "Threshold", value: requirement.thresholdValue },
            { label: "Target", value: requirement.targetValue },
            { label: "Actual", value: requirement.actualValue },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[80px]"
            >
              <p className="text-2xl font-extrabold text-slate-900">{value ?? "—"}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Children */}
      {(requirement.children?.length > 0 || isAdmin) && (
        <SectionCard
          title="Child Requirements"
          description="Hierarchical sub-requirements nested under this NFR."
          icon={<GitBranch className="h-4 w-4" />}
          count={requirement.children?.length ?? 0}
          isAdmin={isAdmin}
          addLabel="Add Child NFR"
          onAdd={() => setCreateNonFunctionalRequirementDialogOpen(true)}
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
        isAdmin={isAdmin}
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
                    {isAdmin && (
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

      {/* Observed NFRs */}
      {/* <SectionCard
        title="Observed Non-Functional Requirements"
        description="Other NFRs that this requirement observes or depends on."
        icon={<ShieldCheck className="h-4 w-4" />}
        count={requirement.observedNFRequirements?.length ?? 0}
        isAdmin={isAdmin}
        addLabel="Link NFR"
        onAdd={() => setNfrDialogOpen(true)}
      >
        {requirement.observedNFRequirements?.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">No NFRs linked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedNFRequirements.map((n) => (
              <Card
                key={n.id}
                className="hover:border-violet-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${projectId}/nfr/${n.id}`)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold shrink-0">
                      NFR
                    </Badge>
                    <CardTitle className="text-sm flex-1 truncate">{n.name}</CardTitle>
                    {n.state && <RequirementStateBadge state={n.state} />}
                    {isAdmin && (
                      <RemoveButton
                        onClick={() => unlinkNfr(n.id)}
                        loading={removingId === n.id}
                      />
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SectionCard> */}

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
          <p className="text-center text-slate-400 italic py-6">No documents linked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirement.observedDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() =>
                  navigate(
                    `/project/${projectId}/documents/${doc.id}`
                  )}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm flex-1 truncate">{doc.fileName}</CardTitle>
                    {isAdmin && (
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

      {/* Observer FRs — read-only, no dialog */}
      <SectionCard
        title="Observer Functional Requirements"
        description="Functional requirements that observe or are constrained by this NFR."
        icon={<GitBranch className="h-4 w-4" />}
        count={requirement.observerFRequirements?.length ?? 0}
        isAdmin={false}
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
        open={createNonFunctionalRequirementDialogOpen}
        onOpenChange={setCreateNonFunctionalRequirementDialogOpen}
        projectId={projectId!}
        parentId={nfrId}
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
      {/* <ObserveNFRDialog
        open={nfrDialogOpen}
        onOpenChange={setNfrDialogOpen}
        projectId={projectId!}
        functionalityId=""
        requirementType="NFR"
        requirementId={nfrId!}
        onSuccess={refresh}
      /> */}
      <AddDocumentDialog
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