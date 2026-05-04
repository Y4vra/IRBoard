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
import { Users, Search, AlertCircle, Check } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBackendResource } from "@/hooks/useBackendResource";
import type { Stakeholder } from "@/types/Stakeholder";
import type { RequirementType } from "@/types/RequirementSummaryDTO";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  functionalityId: string;
  requirementId: string;
  requirementType: RequirementType;
  onSuccess: () => void;
}

export function ObserveStakeholderDialog({
  open,
  onOpenChange,
  projectId,
  functionalityId,
  requirementId,
  requirementType,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetcher = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/stakeholders/observable/${requirementId}`,
        { credentials: "include" }
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stakeholders");
        return res.json() as Promise<Stakeholder[]>;
      }),
    [projectId, requirementId]
  );

  const { data: stakeholders, loading, error, refresh } = useBackendResource<Stakeholder[]>({
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

  const filtered = (stakeholders ?? []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const url =
        requirementType === "FR"
          ? `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${requirementId}/linkStakeholder`
          : `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${requirementId}/linkStakeholder`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedId),
      });
      if (!res.ok) throw new Error("Failed to link stakeholder");
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
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="h-4 w-4" />
            </div>
            Link Stakeholder
          </DialogTitle>
          <DialogDescription>
            Select a stakeholder to link to this functional requirement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              placeholder="Search stakeholders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner text="Loading stakeholders..." />
              </div>
            ) : displayError ? (
              <div className="py-6 text-center">
                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                <p className="text-sm text-red-500">{displayError}</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-400 italic text-sm py-6">
                No observable stakeholders were found.
              </p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedId === s.id
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-sm text-slate-800 truncate">
                        {s.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                      {selectedId === s.id && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-400 truncate mt-1 pl-6">
                      {s.description}
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
            {submitting ? "Linking..." : "Link Stakeholder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}