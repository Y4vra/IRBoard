import { useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../lib/globalVars"
import { Button } from "../../../components/ui/button"
import { AlertCircle, ChevronRight, FileText, ExternalLink } from "lucide-react"
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

function DocumentsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const fetchDocuments = useCallback(() =>
    fetch(`${API_BASE_URL}/projects/${projectId}/documents`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch documents"); return r.json(); }),
    [projectId]
  );

  const { data, loading, error, refresh } = useBackendResource<DocumentDTO[]>({
    fetcher: fetchDocuments,
    enabled: isAuthenticated,
  });
  const documents = data ?? [];

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <LoadingSpinner text="Loading Documents..." />;

  if (error) return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 font-semibold">Error</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
      <Button variant="outline" className="mt-4" onClick={refresh}>Try Again</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">Manage project files and references.</p>
        </div>
        {user?.isAdmin && (
          <UploadDocumentDialog projectId={projectId!} onSuccess={refresh} />
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Project Documents</CardTitle>
          <CardDescription>Uploaded files and resources for this project.</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 italic">No documents uploaded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
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
                    onClick={() => navigate(`/project/${projectId}/documents/${doc.id}`)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentsView;