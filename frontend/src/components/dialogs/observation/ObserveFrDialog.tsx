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
import { Circle, Search, AlertCircle, Check, ChevronDown, ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RequirementStateBadge } from "@/components/RequirementStateBadge";
import { useBackendResource } from "@/hooks/useBackendResource";
import type { FunctionalityWithRequirements } from "@/types/Functionality";
import type { FunctionalRequirement } from "@/types/FunctionalRequirement";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  functionalityId: string;
  functionalRequirementId: string;
  onSuccess: () => void;
}

function flattenFR(reqs: FunctionalRequirement[], result: FunctionalRequirement[] = []): FunctionalRequirement[] {
  for (const r of reqs) {
    result.push(r);
    if (r.children?.length) flattenFR(r.children, result);
  }
  return result;
}

function FRItem({
  fr,
  selectedId,
  currentId,
  onSelect,
}: {
  fr: FunctionalRequirement;
  selectedId: number | null;
  currentId: string;
  onSelect: (id: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const hasChildren = fr.children && fr.children.length > 0;
  const isSelf = String(fr.id) === currentId;

  return (
    <div>
      <button
        disabled={isSelf}
        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
          isSelf
            ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
            : selectedId === fr.id
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
        }`}
        onClick={() => !isSelf && onSelect(fr.id)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <span
                className="shrink-0 text-slate-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed((c) => !c);
                }}
              >
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </span>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold shrink-0">
              FR
            </Badge>
            <span className="font-medium text-sm text-slate-800 truncate">
              {fr.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <RequirementStateBadge state={fr.state} />
            {selectedId === fr.id && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </div>
        </div>
        {fr.description && (
          <p className="text-xs text-slate-400 truncate mt-1 pl-8">
            {fr.description}
          </p>
        )}
      </button>

      {hasChildren && !collapsed && (
        <div className="ml-5 mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
          {fr.children!.map((child) => (
            <FRItem
              key={child.id}
              fr={child}
              selectedId={selectedId}
              currentId={currentId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ObserveLinkedFRDialog({
  open,
  onOpenChange,
  projectId,
  functionalityId,
  functionalRequirementId,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetcher = useCallback(async (): Promise<FunctionalityWithRequirements[]> => {
    const res = await fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalRequirements/observable/${functionalRequirementId}`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch requirements");
    return res.json();
}, [projectId, functionalRequirementId]);

  const { data: groups, loading, error, refresh } = useBackendResource<FunctionalityWithRequirements[]>({
    fetcher,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setSearch("");
      setSubmitError(null);
    }
  }, [open]);

  // Reset and re-fetch when dialog opens again
  useEffect(() => {
    if (open) refresh();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const allFRs = (groups ?? []).flatMap((g) =>
    flattenFR(g.requirements).map((r) => ({ ...r, functionalityName: g.name }))
  );

  const filteredFlat = search
    ? allFRs.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}/linkRequirement`,
        { 
          method: "POST", 
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedId),
        }
      );
      if (!res.ok) throw new Error("Failed to link requirement");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Circle className="h-4 w-4" />
            </div>
            Link Functional Requirement
          </DialogTitle>
          <DialogDescription>
            Select a functional requirement to link. Requirements are grouped by functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder="Search requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner text="Loading requirements..." />
              </div>
            ) : displayError ? (
              <div className="py-6 text-center">
                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                <p className="text-sm text-red-500">{displayError}</p>
              </div>
            ) : filteredFlat !== null ? (
              filteredFlat.length === 0 ? (
                <p className="text-center text-slate-400 italic text-sm py-6">
                  No requirements match your search.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredFlat.map((fr) => (
                    <button
                      key={fr.id}
                      disabled={String(fr.id) === functionalRequirementId}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        String(fr.id) === functionalRequirementId
                          ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
                          : selectedId === fr.id
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        String(fr.id) !== functionalRequirementId && setSelectedId(fr.id)
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold shrink-0">
                            FR
                          </Badge>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400 truncate">
                              {fr.functionalityName}
                            </p>
                            <p className="font-medium text-sm text-slate-800 truncate">
                              {fr.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <RequirementStateBadge state={fr.state} />
                          {selectedId === fr.id && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (groups ?? []).length === 0 ? (
              <p className="text-center text-slate-400 italic text-sm py-6">
                No functional requirements found.
              </p>
            ) : (
              (groups ?? []).map((group) => (
                <div key={group.id} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-1">
                    {group.label ? `${group.label} — ` : ""}{group.name}
                  </p>
                  {group.requirements.map((fr) => (
                    <FRItem
                      key={fr.id}
                      fr={fr}
                      selectedId={selectedId}
                      currentId={functionalRequirementId}
                      onSelect={setSelectedId}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedId || submitting} onClick={handleSubmit}>
            {submitting ? "Linking..." : "Link Requirement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}