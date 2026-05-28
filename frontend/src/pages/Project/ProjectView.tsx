import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Users,
  ShieldAlert,
  FileText,
  ArrowLeft,
  ChevronRight,
  Eye,
  Pencil,
  Lock,
  ChevronDown,
  CheckCheck,
  PowerOff,
  Power,
  Flag,
  Archive,
  Trash2,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CreateFunctionalityDialog } from "../../components/dialogs/creatingDialogs/CreateFunctionalityDialog";
import type { Permission, Functionality } from "@/types/Functionality";
import { useLocks } from "@/hooks/useLocks";
import { LockIndicator } from "@/components/LockIndicator";
import { EntityType } from "@/lib/lockUtils";
import { useProject } from "@/hooks/useProject";
import { useFunctionalities } from "@/hooks/useFunctionalities";
import { ProjectStatsSection } from "@/components/graphics/ProjectStatsSectionGraph";
import { ProjectHealthBar } from "@/components/graphics/ProjectHealthBar";
import { LinkUserToProjectDialog } from "@/components/dialogs/userLinking/LinkUserToProjectDialog";
import { useApproveAll } from "@/hooks/useApproveActions";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { useDeleteProject, useDisableProject, useEnableProject, useFinishProject, useRemoveProject } from "@/hooks/useProjectActions";
import { ProjectStateBadge } from "@/components/badges/ProjectStateBadge";
import { useCallback, useState } from "react";
import type { ViewMode } from "@/types/ViewMode";
import { ViewToggle } from "@/components/ViewToggle";
import { useBackendResource } from "@/hooks/useBackendResource";
import { API_BASE_URL } from "@/lib/globalVars";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FunctionalityStateBadge } from "@/components/badges/FunctionalityStateBadge";

const permissionConfig: Record<
  Permission,
  {
    label: string;
    icon: React.ReactNode;
    badgeClass: string;
    cardClass: string;
    iconClass: string;
  }
> = {
  edit: {
    label: "Editable",
    icon: <Pencil className="h-3.5 w-3.5" />,
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cardClass: "border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/5",
    iconClass: "bg-emerald-500/10 text-emerald-600",
  },
  view: {
    label: "View only",
    icon: <Eye className="h-3.5 w-3.5" />,
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    cardClass: "border-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/5",
    iconClass: "bg-blue-500/10 text-blue-600",
  },
  none: {
    label: "No access",
    icon: <Lock className="h-3.5 w-3.5" />,
    badgeClass: "bg-muted/60 text-muted-foreground border-muted-foreground/10",
    cardClass: "border-muted/40 opacity-50 cursor-not-allowed",
    iconClass: "bg-muted text-muted-foreground",
  },
};

function FunctionalityCard({
  functionality,
  permission,
  projectId,
}: {
  functionality: Functionality;
  permission: Permission;
  projectId: string;
}) {
  const { getLock } = useLocks();
  const config = permissionConfig[permission];
  const isDisabled = permission === "none";

  const cardContent = (
    <Card
      className={`h-full transition-all duration-200 hover:shadow-md ${config.cardClass} ${
        !isDisabled ? "group-hover:-translate-y-0.5" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${config.iconClass}`}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {functionality.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              ID: {functionality.id}
            </p>
            {functionality.description && (
              <CardDescription className="mt-1 text-sm line-clamp-2">
                {functionality.description}
              </CardDescription>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
          <LockIndicator lock={getLock(EntityType.FUNCTIONALITY, Number(functionality.id))} />
          <Badge className={`text-xs border font-medium flex items-center gap-1 ${config.badgeClass}`}>
            {config.icon}
            {config.label}
          </Badge>
          <FunctionalityStateBadge state={functionality.state}/>
        </div>
      </CardHeader>
    </Card>
  );

  if (isDisabled) return <div>{cardContent}</div>;

  return (
    <Link to={`/project/${projectId}/functionalities/${functionality.id}`} className="group">
      {cardContent}
    </Link>
  );
}

function ProjectView() {
  const project = useProject();
  const { user,isAuthenticated } = useAuth();
  const { functionalities, loading, error, refresh: refreshProject } = useFunctionalities();
  const navigate = useNavigate();

  const refreshActive = () => { refreshProject(); project.refresh(); }

  const { approveAll, loading: approving } = useApproveAll({
    projectId: project.id!,
    onSuccess: refreshActive,
  })
  const { finishProject, loading: finishing } = useFinishProject({
    projectId: project.id!,
    onSuccess: refreshActive,
  })
  const { disableProject, loading: disabling } = useDisableProject({
    projectId: project.id!,
    onSuccess: refreshActive,
  })
  const { enableProject, loading: enabling } = useEnableProject({
    projectId: project.id!,
    onSuccess: refreshActive,
  })
  const { removeProject, loading: removing } = useRemoveProject({
    projectId: project.id!,
    onSuccess: () => navigate(`/home`),
  })
  const { deleteProject, loading: deleting } = useDeleteProject({
    projectId: project.id!,
    onSuccess: () => navigate(`/home`),
  })

  const { getLock } = useLocks();
  const lock = getLock(EntityType.PROJECT, Number(project.id));
  const isProjectLockedByAnother = !!lock && lock.username !== user?.name;

  // ── View mode ────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("active")

  const fetchRemovedFunctionalities = useCallback(
    () =>
      fetch(`${API_BASE_URL}/projects/${project.id}/functionalities/removed`, {
        credentials: "include",
      }).then((f) => {
        if (!f.ok) throw new Error("Failed to fetch removed functionalities")
        return f.json()
      }),
    [project]
  )

  const {
    data: removedData,
    loading: loadingRemoved,
    error: errorRemoved,
    refresh: refreshRemoved,
  } = useBackendResource<Functionality[]>({
    fetcher: fetchRemovedFunctionalities,
    enabled: isAuthenticated && project.isManager,
  })

  const removedFunctionalities: Functionality[] = removedData ?? []

  // Matches service logic exactly
  const canDisable = project.state === "ACTIVE" || project.state === "REMOVED";
  const canEnable  = project.state === "FINISHED" || project.state === "DEACTIVATED";
  const canApprove = project.state === "ACTIVE";
  const canFinish  = project.state === "ACTIVE";
  const canRemove  = project.state === "DEACTIVATED";
  const canDelete  = project.state === "REMOVED";

  const anyLoading = disabling || enabling || approving || finishing || removing || deleting;

  const isLoading = viewMode === "active" ? loading : loadingRemoved
  const currentError = viewMode === "active" ? error : errorRemoved
  const refresh = viewMode === "active" ? refreshActive : refreshRemoved

  if (isLoading) return <LoadingSpinner text={viewMode === "removed" ? "Loading Removed functionalities..." : "Loading functionalities..."} />

  if (currentError || !project)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
        <Button variant="outline" className="mt-4" onClick={refresh}>
          Try Again
        </Button>
      </div>
    );

  const navigationLinks = [
    {
      title: "Stakeholders",
      description: "Identify and manage project actors and interest groups.",
      href: `/project/${project.id}/stakeholders`,
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Non-Functional Requirements",
      description: "Security, performance, and technical constraints.",
      href: `/project/${project.id}/nfr`,
      icon: <ShieldAlert className="h-6 w-6" />,
    },
    {
      title: "Documents",
      description: "Technical documentation and linked project files.",
      href: `/project/${project.id}/documents`,
      icon: <FileText className="h-6 w-6" />,
    },
  ];

  const activeCount = (functionalities?.edit?.length ?? 0) +
    (functionalities?.view?.length ?? 0) +
    (functionalities?.none?.length ?? 0)

  const allFunctionalities: { func: Functionality; permission: Permission }[] = functionalities
    ? [
        ...(functionalities.edit ?? []).map((f) => ({ func: f, permission: "edit" as Permission })),
        ...(functionalities.view ?? []).map((f) => ({ func: f, permission: "view" as Permission })),
        ...(functionalities.none ?? []).map((f) => ({ func: f, permission: "none" as Permission })),
      ]
    : [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500">
      <nav className="mb-0 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
        </Button>
      </nav>

      <header className="flex items-start justify-between gap-8">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-black tracking-tight">{project.name}</h1>
            <Badge className="bg-primary/10 text-primary border-none uppercase text-xs">
              {project.priorityStyle}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {project.description || "No project description available."}
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <ProjectStateBadge state={project?.state} />
            <div className="font-mono opacity-50">
              REF: {project.id}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 shrink-0 pt-1">
          <ProjectHealthBar project={project} />
          <div className="flex items-center gap-2">
            {user?.isAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <LockIndicator lock={lock} />
                  <Button
                    asChild={!isProjectLockedByAnother}
                    variant="outline"
                    size="sm"
                    disabled={isProjectLockedByAnother}
                    title={isProjectLockedByAnother ? "This project is currently being edited by another user" : undefined}
                  >
                    {isProjectLockedByAnother ? (
                      <span><Settings className="mr-2 h-4 w-4" /> Edit project</span>
                    ) : (
                      <Link to={`/project/${project.id}/edit`}>
                        <Settings className="mr-2 h-4 w-4" /> Edit project
                      </Link>
                    )}
                  </Button>
                </div>
                <LinkUserToProjectDialog projectId={project.id!} onSuccess={project.refresh} />
              </>
            )}

            {project.isManager && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={anyLoading}>
                    {anyLoading ? "Processing..." : "Actions"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled={!canApprove || approving} onClick={approveAll}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Approve all entities
                  </DropdownMenuItem>

                  <DropdownMenuItem disabled={!canFinish || finishing} onClick={() => finishProject()}>
                    <Flag className="mr-2 h-4 w-4" />
                    Mark as finished
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled={!canDisable || disabling} onClick={() => disableProject()}>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Disable project
                  </DropdownMenuItem>

                  <DropdownMenuItem disabled={!canEnable || enabling} onClick={() => enableProject()}>
                    <Power className="mr-2 h-4 w-4" />
                    Enable project
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <ConfirmActionDialog
                    trigger={
                      <DropdownMenuItem
                        disabled={!canRemove || removing}
                        onSelect={e => e.preventDefault()}
                        className="text-amber-600 focus:text-amber-600"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Remove project
                      </DropdownMenuItem>
                    }
                    title="Remove this project?"
                    description="This project will be marked as removed and will no longer be active. Managers can still view and restore it."
                    confirmLabel="Remove"
                    loading={removing}
                    disabled={!canRemove}
                    onConfirm={() => removeProject()}
                  />

                  <ConfirmActionDialog
                    trigger={
                      <DropdownMenuItem
                        disabled={!canDelete || deleting}
                        onSelect={e => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete permanently
                      </DropdownMenuItem>
                    }
                    title="Delete permanently?"
                    description="This action cannot be undone. The project will be erased entirely."
                    confirmLabel="Delete permanently"
                    confirmVariant="destructive"
                    loading={deleting}
                    onConfirm={() => deleteProject()}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Project Sections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {navigationLinks.map((link) => (
            <Link key={link.href} to={link.href} className="group">
              <Card className="h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {link.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{link.title}</CardTitle>
                      <CardDescription className="mt-1">{link.description}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Functionalities
            </h2>
            {functionalities && (
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {(functionalities.edit?.length ?? 0) + (functionalities.view?.length ?? 0)} accessible ·{" "}
                {functionalities.none?.length ?? 0} restricted
              </p>
            )}
          </div>
          {project.isManager && (
            <ViewToggle
              mode={viewMode}
              onChange={setViewMode}
              activeCount={activeCount}
              removedCount={removedFunctionalities.length}
            />
          )}
          {project.editPermission && (
            <CreateFunctionalityDialog projectId={project.id!} onSuccess={refreshProject} />
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : viewMode === "removed" ? (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                <Archive className="h-4 w-4 shrink-0" />
                <span>These functionalities have been removed and are no longer active in the project.</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {removedFunctionalities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 italic py-8">
                        No removed functionalities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    removedFunctionalities.map((f) => (
                      <TableRow
                        key={f.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(`/project/${project.id}/functionalities/${f.id}`)}
                      >
                        <TableCell className="font-mono text-xs text-slate-400">{f.entityIdentifier ?? f.id}</TableCell>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-slate-500">{f.description}</TableCell>
                        <TableCell>
                          <FunctionalityStateBadge state={f.state} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ChevronRight className="h-4 w-4 ml-auto text-slate-400" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          ) : allFunctionalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl">
            <p className="text-muted-foreground font-medium">No functionalities yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add the first functionality to get started.
            </p>
            {project.editPermission && (
              <div className="mt-4">
                <CreateFunctionalityDialog projectId={project.id!} onSuccess={refreshProject} />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              {(["edit", "view", "none"] as Permission[]).map((p) => {
                const count =
                  p === "edit"
                    ? functionalities?.edit?.length
                    : p === "view"
                    ? functionalities?.view?.length
                    : functionalities?.none?.length;
                if (!count) return null;
                return (
                  <span
                    key={p}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${permissionConfig[p].badgeClass}`}
                  >
                    {permissionConfig[p].icon}
                    {permissionConfig[p].label} ({count})
                  </span>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {allFunctionalities.map(({ func, permission }) => (
                <FunctionalityCard
                  key={`${permission}-${func.id}`}
                  functionality={func}
                  permission={permission}
                  projectId={project.id!}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <ProjectStatsSection project={project} />
    </div>
  );
}

export default ProjectView;