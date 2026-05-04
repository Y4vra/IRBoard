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
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, AlertCircle, Check } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RequirementStateBadge } from "@/components/RequirementStateBadge";

interface NFR {
  id: number;
  identifier: string;
  name: string;
  description?: string;
  state?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  functionalityId: string;
  functionalRequirementId: string;
  onSuccess: () => void;
}

export function AddNFRDialog({
  open,
  onOpenChange,
  projectId,
  functionalityId,
  functionalRequirementId,
  onSuccess,
}: Props) {
  const [nfrs, setNfrs] = useState<NFR[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchNFRs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch non-functional requirements");
      const data = await res.json();
      setNfrs(data);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      fetchNFRs();
      setSelectedId(null);
      setSearch("");
    }
  }, [open, fetchNFRs]);

  const filtered = nfrs.filter(
    (n) =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.identifier.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}/nonFunctionalRequirements/${selectedId}`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to link NFR");
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <ShieldCheck className="h-4 w-4" />
            </div>
            Link Non-Functional Requirement
          </DialogTitle>
          <DialogDescription>
            Select an NFR to link to this functional requirement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
              placeholder="Search by name or identifier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner text="Loading NFRs..." />
              </div>
            ) : error ? (
              <div className="py-6 text-center">
                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-400 italic text-sm py-6">
                No NFRs found.
              </p>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.id}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedId === n.id
                      ? "border-violet-400 bg-violet-50"
                      : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedId(n.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold shrink-0">
                        NFR
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-slate-400 truncate">
                          {n.identifier}
                        </p>
                        <p className="font-medium text-sm text-slate-800 truncate">
                          {n.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {n.state && <RequirementStateBadge state={n.state} />}
                      {selectedId === n.id && (
                        <Check className="h-4 w-4 text-violet-600" />
                      )}
                    </div>
                  </div>
                  {n.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-6">
                      {n.description}
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
          <Button
            disabled={!selectedId || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Linking..." : "Link NFR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}