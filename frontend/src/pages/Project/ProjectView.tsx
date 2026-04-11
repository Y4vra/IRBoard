import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../../lib/globalVars";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Users,
  ShieldAlert,
  FileText,
  ArrowLeft,
  ChevronRight,
  Activity,
  Plus,
  Eye,
  Pencil,
  Lock,
} from "lucide-react";
import { type Project } from "../../types/project";
import LoadingSpinner from "@/components/LoadingSpinner";

type Permission = "edit" | "view" | "none";

interface Functionality {
  id: string | number;
  name: string;
  description?: string;
  [key: string]: unknown;
}

type FunctionalitiesResponse = Record<Permission, Functionality[]>;

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
    cardClass:
      "border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/5",
    iconClass: "bg-emerald-500/10 text-emerald-600",
  },
  view: {
    label: "View only",
    icon: <Eye className="h-3.5 w-3.5" />,
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    cardClass:
      "border-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/5",
    iconClass: "bg-blue-500/10 text-blue-600",
  },
  none: {
    label: "No access",
    icon: <Lock className="h-3.5 w-3.5" />,
    badgeClass:
      "bg-muted/60 text-muted-foreground border-muted-foreground/10",
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
          <div
            className={`p-1.5 rounded-md shrink-0 mt-0.5 ${config.iconClass}`}
          >
            {config.icon}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {functionality.name}
            </CardTitle>
            {functionality.description && (
              <CardDescription className="mt-1 text-sm line-clamp-2">
                {functionality.description}
              </CardDescription>
            )}
          </div>
        </div>
        <Badge
          className={`ml-2 shrink-0 text-xs border font-medium flex items-center gap-1 ${config.badgeClass}`}
        >
          {config.icon}
          {config.label}
        </Badge>
      </CardHeader>
    </Card>
  );

  if (isDisabled) {
    return <div>{cardContent}</div>;
  }

  return (
    <Link
      to={`/project/${projectId}/functionalities/${functionality.id}`}
      className="group"
    >
      {cardContent}
    </Link>
  );
}

function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [functionalities, setFunctionalities] =
    useState<FunctionalitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [functionalitiesLoading, setFunctionalitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch project details");
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    const fetchFunctionalities = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/projects/${id}/functionalities`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch functionalities");
        const data: FunctionalitiesResponse = await response.json();
        setFunctionalities(data);
      } catch (err) {
        console.error("Failed to load functionalities:", err);
      } finally {
        setFunctionalitiesLoading(false);
      }
    };

    fetchProject();
    fetchFunctionalities();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error || !project)
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-semibold">
          Error: {error || "Project not found"}
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );

  const navigationLinks = [
    {
      title: "Stakeholders",
      description: "Identify and manage project actors and interest groups.",
      href: `/project/${id}/stakeholders`,
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Non-Functional Requirements",
      description: "Security, performance, and technical constraints.",
      href: `/project/${id}/nfr`,
      icon: <ShieldAlert className="h-6 w-6" />,
    },
    {
      title: "Documents",
      description: "Technical documentation and linked project files.",
      href: `/project/${id}/documents`,
      icon: <FileText className="h-6 w-6" />,
    },
  ];

  const allFunctionalities: { func: Functionality; permission: Permission }[] =
    functionalities
      ? [
          ...(functionalities.edit ?? []).map((f) => ({
            func: f,
            permission: "edit" as Permission,
          })),
          ...(functionalities.view ?? []).map((f) => ({
            func: f,
            permission: "view" as Permission,
          })),
          ...(functionalities.none ?? []).map((f) => ({
            func: f,
            permission: "none" as Permission,
          })),
        ]
      : [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500">
      {/* ── Top nav ── */}
      <nav className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
        </Button>
        {user?.isAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/project/${id}/edit`}>
              <Settings className="mr-2 h-4 w-4" /> Edit Project
            </Link>
          </Button>
        )}
      </nav>

      {/* ── Project info ── */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black tracking-tight">{project.name}</h1>
          <Badge className="bg-primary/10 text-primary border-none uppercase text-xs">
            {project.priorityStyle}
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
          {project.description || "No project description available."}
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5 font-bold text-foreground/80">
            <Activity className="h-4 w-4" />
            {project.state}
          </div>
          <div className="font-mono opacity-50">
            REF: {project.id.toString().slice(0, 12)}
          </div>
        </div>
      </header>

      {/* ── Quick-nav cards (Stakeholders, NFR, Documents) ── */}
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
                      <CardTitle className="text-lg font-bold">
                        {link.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Functionalities ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Functionalities
            </h2>
            {functionalities && (
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {(functionalities.edit?.length ?? 0) +
                  (functionalities.view?.length ?? 0)}{" "}
                accessible ·{" "}
                {functionalities.none?.length ?? 0} restricted
              </p>
            )}
          </div>
          {user?.isAdmin && (
            <Button asChild size="sm">
              <Link to={`/project/${id}/functionalities/new`}>
                <Plus className="mr-2 h-4 w-4" /> Add Functionality
              </Link>
            </Button>
          )}
        </div>

        {functionalitiesLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : allFunctionalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl">
            <p className="text-muted-foreground font-medium">
              No functionalities yet
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add the first functionality to get started.
            </p>
            {user?.isAdmin && (
              <Button asChild size="sm" className="mt-4">
                <Link to={`/project/${id}/functionalities/new`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Functionality
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Legend */}
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
                  projectId={id!}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default ProjectView;