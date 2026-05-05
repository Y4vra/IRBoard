import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Search, AlertCircle, Check } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBackendResource } from "@/hooks/useBackendResource";
import type { RequirementType } from "@/types/RequirementSummaryDTO";
import type { DocumentDTO } from "@/types/Document";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  functionalityId: string;
  requirementType: RequirementType;
  requirementId: string;
  onSuccess: () => void;
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  projectId,
  functionalityId,
  requirementType,
  requirementId,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetcher = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/documents/observable/${requirementId}`,
        { credentials: "include" }
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch documents");
        return res.json() as Promise<DocumentDTO[]>;
      }),
    [projectId, requirementId]
  );

  const { data: documents, loading, error, refresh } = useBackendResource<DocumentDTO[]>({
    fetcher,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setSearch("");
      setSubmitError(null);
      refresh();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = (documents ?? []).filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const url =
        requirementType === "FR"
          ? `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${requirementId}/linkDocument`
          : `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${requirementId}/linkDocument`;

      const res = await fetch(url, { 
          method: "POST", 
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedId),
        });
      if (!res.ok) throw new Error("Failed to link document");
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      setSubmitError(e.message ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = submitError ?? error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            Link Document
          </DialogTitle>
          <DialogDescription>
            Select a document to link to this functional requirement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner text="Loading documents..." />
              </div>
            ) : displayError ? (
              <div className="py-6 text-center">
                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                <p className="text-sm text-red-500">{displayError}</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-400 italic text-sm py-6">
                No documents found.
              </p>
            ) : (
              filtered.map((doc) => (
                <button
                  key={doc.id}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedId === doc.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedId(doc.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 bg-blue-50 text-blue-500 rounded shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-sm text-slate-800 truncate">
                        {doc.name}
                      </span>
                    </div>
                    {selectedId === doc.id && (
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-7">
                      {doc.description}
                    </p>
                  )}
                  {doc.url && (
                    <p className="text-xs text-blue-400 truncate mt-0.5 pl-7">
                      {doc.url}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedId || submitting} onClick={handleSubmit}>
            {submitting ? "Linking..." : "Link Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}