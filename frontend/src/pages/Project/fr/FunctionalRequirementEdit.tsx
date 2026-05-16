import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  AlignLeft,
  Loader2,
  AlertCircle,
  Save,
  Star,
  Anchor,
  ClipboardList,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { useBackendResource } from "@/hooks/useBackendResource";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { FunctionalRequirement } from "@/types/FunctionalRequirement";
import type { PriorityStyle } from "@/types/Project";

const MOSCOW_OPTIONS = ["MUST", "SHOULD", "COULD", "WONT"];
const TERNARY_OPTIONS = ["HIGH", "NORMAL", "LOW"];
const STABILITY_OPTIONS = ["STABLE", "UNSTABLE", "VOLATILE"];

interface FormData {
  name: string;
  description: string;
  priority: string;
  stability: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  priority: "",
  stability: "",
};

export default function FunctionalRequirementEdit() {
  const { projectId, functionalityId, functionalRequirementId } = useParams<{
    projectId: string;
    functionalityId: string;
    functionalRequirementId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  // NOTE: priorityStyle may come from project context/props in your setup.
  // Here it is read from location state or falls back to "TERNARY".
  const priorityStyle: PriorityStyle =
    (window.history.state?.usr?.priorityStyle as PriorityStyle) ?? "TERNARY";
  const priorityOptions =
    priorityStyle === "MOSCOW" ? MOSCOW_OPTIONS : TERNARY_OPTIONS;

  const fetchRequirement = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch functional requirement");
        return r.json();
      }),
    [projectId, functionalityId, functionalRequirementId]
  );

  const {
    data: requirement,
    loading: requirementLoading,
    error: requirementError,
  } = useBackendResource<FunctionalRequirement>({ fetcher: fetchRequirement });

  useEffect(() => {
    if (!requirement) return;

    setFormData({
      name: requirement.name,
      description: requirement.description ?? "",
      priority: requirement.priority ?? "",
      stability: requirement.stability ?? "",
    });

    const requestLock = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}/requestEdit`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Server error requesting edit lock");
        const text = await res.text();
        const granted: boolean = text.trim() === "" ? true : JSON.parse(text);
        if (!granted) {
          navigate("/error", {
            state: {
              from: `/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}`,
              errorType: "permission",
            },
            replace: true,
          });
        }
      } catch {
        navigate("/error", {
          state: {
            from: `/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}`,
            errorType: "server",
          },
          replace: true,
        });
      }
    };

    requestLock();
  }, [requirement, projectId, functionalityId, functionalRequirementId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}/modify`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            priority: formData.priority || undefined,
            stability: formData.stability || undefined,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 403)
          throw new Error(
            "You do not have permission to modify this requirement."
          );
        if (response.status === 409)
          throw new Error(
            "This requirement is being edited by another user."
          );
        throw new Error("An error occurred while saving the requirement.");
      }

      navigate(
        `/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const backPath = `/project/${projectId}/functionalities/${functionalityId}/functionalRequirements/${functionalRequirementId}`;

  if (requirementLoading)
    return <LoadingSpinner text="Loading requirement..." />;

  if (requirementError || !requirement)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">
          Could not load functional requirement
        </p>
        <p className="text-red-500 text-sm mt-1">{requirementError}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link
            to={`/project/${projectId}/functionalities/${functionalityId}`}
          >
            Back to Functionality
          </Link>
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center text-foreground">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button
          onClick={() => navigate(backPath)}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to requirement
        </button>

        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-border bg-muted/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Edit Functional Requirement
            </h1>
            <p className="text-muted-foreground mt-1">
              You hold the edit lock on{" "}
              <span className="font-semibold text-foreground">
                {requirement.name}
              </span>
              . Changes are saved on submit and the lock is released.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in zoom-in-95">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. User Authentication"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe what this requirement entails..."
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50 resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                Priority
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({priorityStyle})
                </span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="">Select priority...</option>
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Stability */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Anchor className="h-4 w-4 text-muted-foreground" />
                Stability
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={formData.stability}
                onChange={(e) =>
                  setFormData({ ...formData, stability: e.target.value })
                }
              >
                <option value="">Select stability...</option>
                {STABILITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(backPath)}
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