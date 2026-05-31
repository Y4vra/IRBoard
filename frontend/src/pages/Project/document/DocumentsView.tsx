import { useCallback, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../lib/globalVars"
import { Button } from "../../../components/ui/button"
import { AlertCircle, ChevronRight, FileText, ExternalLink, Archive, Eye, EyeOff } from "lucide-react"
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
import { useBackendResource } from "@/hooks/useBackendResource"
import type { DocumentDTO } from "@/types/Document"
import { UploadDocumentDialog } from "@/components/dialogs/creatingDialogs/UploadDocumentDialog"
import { BackToProjectButton } from "@/components/BackToProjectButton"
import { useProject } from "@/hooks/useProject"
import { StatsChart } from "@/components/graphics/StatsChart"
import { EntityStateBadge } from "@/components/badges/EntityStateBadge"
import { useApproveDocuments } from "@/hooks/useDocumentActions"
import type { ViewMode } from "@/types/ViewMode"
import { ViewToggle } from "@/components/ViewToggle"

// ─── Shared Utilities ────────────────────────────────────────────────────────

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Documents Table ──────────────────────────────────────────────────────────

interface DocumentsTableProps {
  documents: DocumentDTO[];
  onRowClick: (docId: number | string) => void;
  projectId: string;
}

function DocumentsTable({ documents, onRowClick }: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <div className="py-16 text-center">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400 italic">No documents found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>File Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Observers</TableHead>
          <TableHead>Access</TableHead>
          <TableHead className="text-right">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow
            key={doc.id}
            className="cursor-pointer hover:bg-slate-50"
            onClick={() => onRowClick(doc.id)}
          >
            <TableCell className="font-mono text-xs text-slate-400">{doc.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded shrink-0">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-slate-800 truncate max-w-[200px]">
                  {doc.fileName}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {doc.mimeType ? (
                <Badge variant="outline" className="font-mono text-[10px] text-slate-500">
                  {String(doc.mimeType)}
                </Badge>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </TableCell>
            <TableCell className="text-slate-500 text-sm">
              {formatBytes(doc.fileSize)}
            </TableCell>
            <TableCell>
              <EntityStateBadge state={doc.state} />
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono text-xs">
                {doc.observers?.length ?? 0}
              </Badge>
            </TableCell>
            <TableCell>
              {doc.accessUrl ? (
                <button
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(doc.accessUrl, "_blank");
                  }}
                  title="Open file"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <ChevronRight className="h-4 w-4 ml-auto text-slate-400" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 font-semibold">Error</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>Try Again</Button>
    </div>
  );
}

// ─── Main DocumentsView ───────────────────────────────────────────────────────

function DocumentsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { editPermission, documentStats, isManager } = useProject();

  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [showDeactivated, setShowDeactivated] = useState(false)

  // Active documents fetch
  const fetchDocuments = useCallback(() =>
    fetch(`${API_BASE_URL}/projects/${projectId}/documents`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch documents"); return r.json(); }),
    [projectId]
  );

  // Removed documents fetch (manager-only endpoint)
  const fetchRemovedDocuments = useCallback(() =>
    fetch(`${API_BASE_URL}/projects/${projectId}/documents/removed`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch removed documents"); return r.json(); }),
    [projectId]
  );

  const {
    data: documents,
    loading: loadingActive,
    error: errorActive,
    refresh: refreshActive,
  } = useBackendResource<DocumentDTO[]>({
    fetcher: fetchDocuments,
    enabled: isAuthenticated,
  });

  const {
    data: removedDocuments,
    loading: loadingRemoved,
    error: errorRemoved,
    refresh: refreshRemoved,
  } = useBackendResource<DocumentDTO[]>({
    fetcher: fetchRemovedDocuments,
    enabled: isAuthenticated && isManager,
  });

  const displayedDocuments = useMemo(() => {
    const filter = (reqs: DocumentDTO[]): DocumentDTO[] =>
      reqs
        .filter(r => r.state !== "DEACTIVATED")

    return showDeactivated ? documents : filter(documents??[])
  }, [documents, showDeactivated])

  const { approveDocuments, loading: approving } = useApproveDocuments({
    projectId: projectId!,
    onSuccess: refreshActive,
  });

  const pendingIds = useMemo(
    () => documents?.filter(d => d.state === "PENDING_APPROVAL").map(d => d.id),
    [documents]
  );

  const isLoading = viewMode === "active" ? loadingActive : loadingRemoved;
  const error = viewMode === "active" ? errorActive : errorRemoved;
  const refresh = viewMode === "active" ? refreshActive : refreshRemoved;

  if (isLoading) return <LoadingSpinner text={viewMode === "removed" ? "Loading Removed Documents..." : "Loading Documents..."} />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;

  const activeCount = documents?.length;
  const removedCount = removedDocuments?.length;
  const currentDocs = viewMode === "active" ? (displayedDocuments ?? []) : (removedDocuments ?? []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <BackToProjectButton className="mb-0" projectId={projectId!} />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">Manage project files and references.</p>
        </div>
        <div className="flex items-stretch gap-3">
          {documentStats && (
            <Card className="p-4">
              <StatsChart stats={documentStats} title="Document States" size={100} />
            </Card>
          )}
          <div className="flex flex-col gap-3">
            {viewMode === "active" && (
              <button
                onClick={() => setShowDeactivated(v => !v)}
                className={[
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                  showDeactivated
                    ? "border-slate-300 bg-slate-100 text-slate-600"
                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300",
                ].join(" ")}
              >
                {showDeactivated
                  ? <><Eye className="h-3 w-3" /> Showing deactivated</>
                  : <><EyeOff className="h-3 w-3" /> Hiding deactivated</>
                }
              </button>
            )}
            {editPermission && viewMode === "active" && (
              <UploadDocumentDialog projectId={projectId!} onSuccess={refreshActive} />
            )}
            {isManager && viewMode === "active" && (
              <Button
                size="sm"
                variant="outline"
                disabled={pendingIds?.length === 0 || approving}
                onClick={() => approveDocuments(pendingIds!)}
              >
                {approving ? "Approving..." : `Approve All (${pendingIds?.length})`}
              </Button>
            )}
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>
                {viewMode === "active" ? "Project Documents" : "Removed Documents"}
              </CardTitle>
              <CardDescription>
                {viewMode === "active"
                  ? "Uploaded files and resources for this project."
                  : "Documents that have been removed from this project. Visible to managers only."}
              </CardDescription>
            </div>
            {isManager && (
              <ViewToggle
                mode={viewMode}
                onChange={setViewMode}
                activeCount={activeCount}
                removedCount={removedCount}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "removed" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <Archive className="h-4 w-4 shrink-0" />
              <span>These documents have been removed and are no longer active in the project.</span>
            </div>
          )}
          <DocumentsTable
            documents={currentDocs}
            projectId={projectId!}
            onRowClick={(docId) => navigate(`/project/${projectId}/documents/${docId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentsView;