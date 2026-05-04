import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FolderEdit,
  ArrowLeft,
  LayoutGrid,
  AlignLeft,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react";
import { API_BASE_URL } from "../../lib/globalVars";
import { Button } from "../../components/ui/button";
import { useBackendResource } from "@/hooks/useBackendResource";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Project } from "../../types/Project";

export default function EditProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  // 1. Fetch project details
  const fetchProject = useCallback(
    () =>
      fetch(`${API_BASE_URL}/projects/${projectId}`, { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch project details");
        return r.json();
      }),
    [projectId]
  );

  const { data: project, loading: projectLoading, error: projectError } =
    useBackendResource<Project>({ fetcher: fetchProject });

  // 2. Request edit lock once project is loaded
  useEffect(() => {
    if (!project) return;

    setFormData({
      name: project.name,
      description: project.description ?? ""
    });

    const requestLock = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/projects/${projectId}/requestEdit`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Server error requesting edit lock");
        const granted: boolean = await res.json();
        if (!granted) {
          navigate("/error", {
            state: {
              from: `/project/${projectId}`,
              errorType: "permission",
              // Override description via state — ErrorPage uses errorType for content,
              // so we redirect with permission type which shows "Access Denied"
            },
            replace: true,
          });
        }
      } catch {
        navigate("/error", {
          state: { from: `/project/${projectId}`, errorType: "server" },
          replace: true,
        });
      }
    };

    requestLock();
  }, [project, projectId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/modify`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 403)
          throw new Error("You do not have permission to modify this project.");
        if (response.status === 409)
          throw new Error("The project is being edited by another user.");
        throw new Error("An error occurred while saving the project.");
      }

      navigate(`/project/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (projectLoading) return <LoadingSpinner text="Loading project..." />;

  if (projectError || !project)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Could not load project</p>
        <p className="text-red-500 text-sm mt-1">{projectError}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/home">Back to Projects</Link>
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center text-foreground">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to project
        </button>

        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-border bg-muted/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <FolderEdit className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
            <p className="text-muted-foreground mt-1">
              You hold the edit lock on{" "}
              <span className="font-semibold text-foreground">{project.name}</span>. Changes
              are saved on submit and the lock is released.
            </p>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in zoom-in-95">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                Project Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. IR-Board System"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Provide a brief overview of the project's scope..."
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/project/${projectId}`)}
                className="flex-1 rounded-xl h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl h-12 shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-8 uppercase tracking-widest">
          IR-Board Requirements Management &bull; 2026
        </p>
      </div>
    </div>
  );
}