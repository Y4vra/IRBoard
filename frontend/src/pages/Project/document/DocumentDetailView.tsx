import { useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../../lib/globalVars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, ExternalLink, ChevronRight, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBackendResource } from "@/hooks/useBackendResource";
import { useAuth } from "@/context/AuthContext";
import type { DocumentDTO } from "@/types/Document";
import type { FunctionalRequirementSummaryDTO, RequirementSummaryDTO } from "@/types/RequirementSummaryDTO";
import { UpdateDocumentDialog } from "@/components/dialogs/updatingDialogs/UpdateDocumentDialog";
import { useProject } from "@/hooks/useProject";
import { EntityStateBadge } from "@/components/badges/EntityStateBadge";
import { LockIndicator } from "@/components/LockIndicator";
import { useLocks } from "@/hooks/useLocks";
import { EntityType } from "@/lib/lockUtils";
import { useApproveDocuments } from "@/hooks/useApproveActions";
import { useDisableDocuments } from "@/hooks/useDisableActions";
import { useEnableDocuments } from "@/hooks/useEnableActions";
import { useRemoveDocuments } from "@/hooks/useRemoveActions";
import { useDeleteDocuments } from "@/hooks/useDeleteActions";

function isFR(r: RequirementSummaryDTO): r is FunctionalRequirementSummaryDTO {
  return r.requirementType === "FR";
}

function requirementPath(r: RequirementSummaryDTO, projectId: string): string {
  if (isFR(r)) {
    return `/project/${projectId}/functionalities/${r.functionalityId}/functionalRequirements/${r.id}`;
  }
  return `/project/${projectId}/nfr/${r.id}`;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentDetailView() {
  const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { editPermission, isManager } = useProject();

  const { getLock } = useLocks();
  const lock = getLock(EntityType.DOCUMENT, Number(documentId));
  const isLocked = !!lock;

  const fetchDocument = useCallback(
    () =>
      fetch(`${API_BASE_URL}/projects/${projectId}/documents/${documentId}`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch document");
        return r.json();
      }),
    [projectId, documentId]
  );

  const { data: document, loading, error, refresh } = useBackendResource<DocumentDTO>({
    fetcher: fetchDocument,
    enabled: isAuthenticated,
  });

  const { approveDocuments, loading: approving } = useApproveDocuments({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { disableDocuments, loading: disabling } = useDisableDocuments({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { enableDocuments, loading: enabling } = useEnableDocuments({
    projectId: projectId!,
    onSuccess: refresh,
  })
  const { removeDocuments, loading: removing } = useRemoveDocuments({
    projectId: projectId!,
    onSuccess: ()=>navigate(`/project/${projectId}/documents`),
  })
  const { deleteDocuments, loading: deleting } = useDeleteDocuments({
    projectId: projectId!,
    onSuccess: ()=>navigate(`/project/${projectId}/documents`),
  })

  if (loading) return <LoadingSpinner />;

  if (error || !document)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Document not found</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={`/project/${projectId}/documents`}>Back to Documents</Link>
        </Button>
      </div>
    );

  const frRequirements = document.observers.filter(isFR);
  const nfrRequirements = document.observers.filter((r) => !isFR(r));

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-6 animate-in fade-in duration-500">
      <nav>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}/documents`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
          </Link>
        </Button>
      </nav>

      <header className="flex items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Document
            </p>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shrink-0">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">{document.fileName}</h1>
                <p className="text-xs font-mono text-slate-400 pt-2">{document.entityIdentifier}</p>
                <p className="text-sm text-muted-foreground mt-1 font-mono">{document.mimeType}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                {formatBytes(document.fileSize)}
              </Badge>
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                {document.observers.length} linked requirement{document.observers.length !== 1 ? "s" : ""}
              </Badge>
              <EntityStateBadge state={document.state} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {document.accessUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.accessUrl, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Open File
            </Button>
          )}
          
          <div className="flex flex-col gap-3">
            <LockIndicator lock={lock} />
            {editPermission && 
              <>
                <UpdateDocumentDialog 
                  projectId={projectId!} 
                  document={document}
                  disabled={isLocked}
                  onSuccess={refresh} 
                  />
                <Button variant="outline" size="sm" 
                  disabled={document.state === "DEACTIVATED"?true:disabling}
                  onClick={() => disableDocuments([document.id])}>
                  {approving ? "Disabling..." : "Disable document"}
                </Button>
                <Button variant="outline" size="sm" 
                  disabled={document.state === "DEACTIVATED"?enabling:true}
                  onClick={() => enableDocuments([document.id])}>
                  {approving ? "Enabling..." : "Enable document"}
                </Button>
              </>
            }
            {isManager &&
              <>
                <Button variant="outline" size="sm" 
                  disabled={document.state === "PENDING_APPROVAL"?approving:true}
                  onClick={() => approveDocuments([document.id])}>
                  {approving ? "Approving..." : "Approve document"}
                </Button>
                <Button variant="outline" size="sm" 
                  disabled={document.state === "DEACTIVATED"?removing:true}
                  onClick={() => removeDocuments([document.id])}>
                  {approving ? "Removing..." : "Remove document"}
                </Button>
              </>
            }
            {isManager && document.state === "REMOVED" &&
              <Button variant="outline" size="sm" 
                disabled={deleting}
                onClick={() => deleteDocuments([document.id])}>
                {approving ? "Deleting..." : "Delete document permanently"}
              </Button>
            }
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Linked Requirements
        </h2>

        {document.observers.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No requirements linked to this document.</p>
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

export default DocumentDetailView;