import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  AlignLeft,
  Loader2,
  AlertCircle,
  Save,
  ShieldAlert,
  Ruler,
  Target,
  TrendingUp,
  Activity,
  GitCompare,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { useBackendResource } from "@/hooks/useBackendResource";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement";

const COMPARISON_OPERATORS = [
  { value: "EQUAL_TO", label: "= Equal" },
  { value: "GREATER_THAN", label: "> Greater than" },
  { value: "GREATER_THAN_OR_EQUAL_TO", label: ">= Greater than or equal" },
  { value: "LESS_THAN", label: "< Less than" },
  { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal" },
  { value: "NOT_EQUAL_TO", label: "≠ Not equal" },
];

interface FormData {
  name: string;
  description: string;
  measurementUnit: string;
  operator: string;
  thresholdValue: number | "";
  targetValue: number | "";
  actualValue: number | "";
}

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  measurementUnit: "",
  operator: "EQUAL_TO",
  thresholdValue: "",
  targetValue: "",
  actualValue: "",
};

export default function NonFunctionalRequirementEdit() {
  const { projectId, nfrId } = useParams<{
    projectId: string;
    nfrId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const fetchRequirement = useCallback(
    () =>
      fetch(
        `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${nfrId}`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch non-functional requirement");
        return r.json();
      }),
    [projectId, nfrId]
  );

  const {
    data: requirement,
    loading: requirementLoading,
    error: requirementError,
  } = useBackendResource<NonFunctionalRequirement>({ fetcher: fetchRequirement });

  useEffect(() => {
    if (!requirement) return;

    setFormData({
      name: requirement.name ?? "",
      description: requirement.description ?? "",
      measurementUnit: requirement.measurementUnit ?? "",
      operator: requirement.operator ?? "EQUAL_TO",
      thresholdValue: requirement.thresholdValue ?? "",
      targetValue: requirement.targetValue ?? "",
      actualValue: requirement.actualValue ?? "",
    });

    const requestLock = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${nfrId}/requestEdit`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Server error requesting edit lock");
        // Backend returns 200 with empty body (ResponseEntity<Void>)
        const text = await res.text();
        const granted: boolean = text.trim() === "" ? true : JSON.parse(text);
        if (!granted) {
          navigate("/error", {
            state: {
              from: `/project/${projectId}/nfr/${nfrId}`,
              errorType: "permission",
            },
            replace: true,
          });
        }
      } catch {
        navigate("/error", {
          state: {
            from: `/project/${projectId}/nfr/${nfrId}`,
            errorType: "server",
          },
          replace: true,
        });
      }
    };

    requestLock();
  }, [requirement, projectId, nfrId, navigate]);

  const handleField =
    (field: keyof Pick<FormData, "name" | "description" | "measurementUnit">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleNumericField =
    (field: "thresholdValue" | "targetValue" | "actualValue") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: raw === "" ? "" : Number(raw),
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${nfrId}/modify`,
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
            measurementUnit: formData.measurementUnit || undefined,
            operator: formData.operator || undefined,
            thresholdValue: formData.thresholdValue !== "" ? Number(formData.thresholdValue) : undefined,
            targetValue: formData.targetValue !== "" ? Number(formData.targetValue) : undefined,
            actualValue: formData.actualValue !== "" ? Number(formData.actualValue) : undefined,
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

      navigate(`/project/${projectId}/nfr/${nfrId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const backPath = `/project/${projectId}/nfr/${nfrId}`;

  if (requirementLoading)
    return <LoadingSpinner text="Loading requirement..." />;

  if (requirementError || !requirement)
    return (
      <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">
          Could not load non-functional requirement
        </p>
        <p className="text-red-500 text-sm mt-1">{requirementError}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={`/project/${projectId}/nfr`}>
            Back to Requirements
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
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Edit Non-Functional Requirement
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
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Response Time, Availability"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                value={formData.name}
                onChange={handleField("name")}
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
                placeholder="Describe the quality attribute or constraint..."
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50 resize-none"
                value={formData.description}
                onChange={handleField("description")}
              />
            </div>

            {/* Measurement Unit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                Measurement Unit
              </label>
              <input
                type="text"
                placeholder="e.g. ms, %, req/s"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                value={formData.measurementUnit}
                onChange={handleField("measurementUnit")}
              />
            </div>

            {/* Comparison Operator */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-muted-foreground" />
                Comparison Operator
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={formData.operator}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, operator: e.target.value }))
                }
              >
                {COMPARISON_OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Numeric Values */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Threshold
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  value={formData.thresholdValue}
                  onChange={handleNumericField("thresholdValue")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Target
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  value={formData.targetValue}
                  onChange={handleNumericField("targetValue")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Actual
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  value={formData.actualValue}
                  onChange={handleNumericField("actualValue")}
                />
              </div>
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