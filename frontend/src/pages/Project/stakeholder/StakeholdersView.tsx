import { useCallback, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../lib/globalVars"
import { Button } from "../../../components/ui/button"
import { AlertCircle, ChevronRight, Archive, FolderOpen } from "lucide-react"
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
import { CreateStakeholderDialog } from "@/components/dialogs/creatingDialogs/CreateStakeholderDialog"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { Stakeholder } from "@/types/Stakeholder"
import { useLocks } from "@/hooks/useLocks"
import { LockIndicator } from "@/components/LockIndicator"
import { EntityType } from "@/lib/lockUtils"
import { EntityStateBadge } from "@/components/badges/EntityStateBadge"
import { StatsChart } from "@/components/graphics/StatsChart"
import { useProject } from "@/hooks/useProject"
import { BackToProjectButton } from "@/components/BackToProjectButton"
import { useApproveStakeholders } from "@/hooks/useApproveActions"

// ─── View Toggle ──────────────────────────────────────────────────────────────

type ViewMode = "active" | "removed";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  activeCount?: number;
  removedCount?: number;
}

function ViewToggle({ mode, onChange, activeCount, removedCount }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
      <button
        onClick={() => onChange("active")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          mode === "active"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        Active
        {activeCount !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            mode === "active" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
          }`}>
            {activeCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onChange("removed")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          mode === "removed"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Archive className="h-3.5 w-3.5" />
        Removed
        {removedCount !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            mode === "removed" ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500"
          }`}>
            {removedCount}
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Main StakeholdersView ────────────────────────────────────────────────────

function StakeholdersView() {
  const { getLock } = useLocks()
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { stakeholderStats, editPermission, isManager } = useProject();

  const [viewMode, setViewMode] = useState<ViewMode>("active");

  // Active stakeholders fetch
  const fetchStakeholders = useCallback(() =>
    fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch stakeholders"); return r.json(); }),
    [projectId]
  );

  // Removed stakeholders fetch (manager-only endpoint)
  const fetchRemovedStakeholders = useCallback(() =>
    fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders/removed`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch removed stakeholders"); return r.json(); }),
    [projectId]
  );

  const {
    data: stakeholders,
    loading: loadingActive,
    error: errorActive,
    refresh: refreshActive,
  } = useBackendResource<Stakeholder[]>({
    fetcher: fetchStakeholders,
    enabled: isAuthenticated,
  });

  const {
    data: removedStakeholders,
    loading: loadingRemoved,
    error: errorRemoved,
    refresh: refreshRemoved,
  } = useBackendResource<Stakeholder[]>({
    fetcher: fetchRemovedStakeholders,
    enabled: isAuthenticated && isManager,
  });

  const { approveStakeholders, loading: approving } = useApproveStakeholders({
    projectId: projectId!,
    onSuccess: refreshActive,
  });

  const pendingIds = useMemo(
    () => stakeholders?.filter(s => s.state === "PENDING_APPROVAL").map(s => s.id),
    [stakeholders]
  );

  const isLoading = viewMode === "active" ? loadingActive : loadingRemoved;
  const error = viewMode === "active" ? errorActive : errorRemoved;
  const refresh = viewMode === "active" ? refreshActive : refreshRemoved;

  if (isLoading) return <LoadingSpinner text={viewMode === "removed" ? "Loading Removed Stakeholders..." : "Loading Stakeholders..."} />;

  if (error) return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 font-semibold">Error</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
      <Button variant="outline" className="mt-4" onClick={refresh}>Try Again</Button>
    </div>
  );

  const activeCount = stakeholders?.length;
  const removedCount = removedStakeholders?.length;
  const currentStakeholders = viewMode === "active" ? (stakeholders ?? []) : (removedStakeholders ?? []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      <BackToProjectButton className="mb-0" projectId={projectId!} />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Stakeholders</h1>
          <p className="text-slate-500 mt-1">Manage project actors and interest groups.</p>
        </div>
        <div className="flex items-stretch gap-3">
          {stakeholderStats && (
            <Card className="p-4">
              <StatsChart stats={stakeholderStats} title="Stakeholder States" size={100} />
            </Card>
          )}
          <div className="flex flex-col gap-3">
            {editPermission && viewMode === "active" && (
              <CreateStakeholderDialog projectId={projectId!} onSuccess={refreshActive} />
            )}
            {isManager && viewMode === "active" && (
              <Button
                size="sm"
                variant="outline"
                disabled={pendingIds?.length === 0 || approving}
                onClick={() => approveStakeholders(pendingIds!)}
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
                {viewMode === "active" ? "Project Stakeholders" : "Removed Stakeholders"}
              </CardTitle>
              <CardDescription>
                {viewMode === "active"
                  ? "Listed stakeholders for this project."
                  : "Stakeholders that have been removed from this project. Visible to managers only."}
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
              <span>These stakeholders have been removed and are no longer active in the project.</span>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStakeholders.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/project/${projectId}/stakeholders/${s.id}`)}
                >
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-500">{s.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <LockIndicator lock={getLock(EntityType.STAKEHOLDER, s.id)} />
                      <EntityStateBadge state={s.state} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default StakeholdersView;