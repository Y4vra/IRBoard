import { useState } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  ShieldAlert,
  AlignLeft,
  Hash,
  Ruler,
  Target,
  TrendingUp,
  Activity,
  GitCompare,
  GitMerge,
} from "lucide-react";

// Must match the ComparisonOperator enum on the backend
const COMPARISON_OPERATORS = [
  { value: "EQUAL_TO", label: "= Equal" },
  { value: "GREATER_THAN", label: "> Greater than" },
  { value: "GREATER_THAN_OR_EQUAL_TO", label: ">= Greater than or equal" },
  { value: "LESS_THAN", label: "< Less than" },
  { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal" },
  { value: "NOT_EQUAL_TO", label: "≠ Not equal" },
];

interface CreateNonFunctionalRequirementDialogProps {
  projectId: string;
  /** When provided, the new NFR will be created as a child of this requirement. */
  parentId?: number | string;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  measurementUnit: string;
  operator: string;
  thresholdValue: number;
  targetValue: number;
  actualValue: number;
}

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  measurementUnit: "",
  operator: "EQUAL_TO",
  thresholdValue: 1,
  targetValue: 1,
  actualValue: 0,
};

export function CreateNonFunctionalRequirementDialog({
  projectId,
  parentId,
  onSuccess,
}: CreateNonFunctionalRequirementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const isChild = parentId !== undefined && parentId !== null;

  const handleField =
    (field: keyof FormData) =>
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

    const payload = {
      name: formData.name,
      description: formData.description,
      measurementUnit: formData.measurementUnit || undefined,
      operator: formData.operator || undefined,
      thresholdValue: formData.thresholdValue ? Number(formData.thresholdValue) : undefined,
      targetValue: formData.targetValue ? Number(formData.targetValue) : undefined,
      actualValue: formData.actualValue ? Number(formData.actualValue) : undefined,
      projectId: Number(projectId),
      ...(isChild ? { parentId: Number(parentId) } : {}),
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/new`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create non-functional requirement");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(EMPTY_FORM);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-md">
          <ShieldAlert className="mr-2 h-4 w-4" />
          {isChild ? "Add child NFR" : "Add NFR"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isChild ? "New Child Non-Functional Requirement" : "New Non-Functional Requirement"}
          </DialogTitle>
          <DialogDescription>
            {isChild
              ? "Define a child quality attribute or constraint nested under the selected requirement."
              : "Define a quality attribute or system constraint with measurable thresholds."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Project Context */}
          <div className="grid gap-2">
            <Label htmlFor="projectId" className="text-sm font-semibold">
              Project Context
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="projectId"
                value={projectId}
                readOnly
                disabled
                className="pl-9 bg-muted text-muted-foreground cursor-not-allowed font-mono text-sm"
              />
            </div>
          </div>

          {/* Parent Requirement — only shown when creating a child */}
          {isChild && (
            <div className="grid gap-2">
              <Label htmlFor="parentId" className="text-sm font-semibold">
                Parent Requirement
              </Label>
              <div className="relative">
                <GitMerge className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="parentId"
                  value={parentId}
                  readOnly
                  disabled
                  className="pl-9 bg-muted text-muted-foreground cursor-not-allowed font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This requirement will be nested under requirement #{parentId}.
              </p>
            </div>
          )}

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="e.g. Response Time, Availability"
                className="pl-9"
                value={formData.name}
                onChange={handleField("name")}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="description"
                placeholder="Describe the quality attribute or constraint..."
                className="pl-9 min-h-[90px] resize-none"
                value={formData.description}
                onChange={handleField("description")}
                required
              />
            </div>
          </div>

          {/* Measurement Unit */}
          <div className="grid gap-2">
            <Label htmlFor="measurementUnit" className="text-sm font-semibold">
              Measurement Unit
            </Label>
            <div className="relative">
              <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="measurementUnit"
                placeholder="e.g. ms, %, req/s"
                className="pl-9"
                value={formData.measurementUnit}
                onChange={handleField("measurementUnit")}
              />
            </div>
          </div>

          {/* Operator */}
          <div className="grid gap-2">
            <Label htmlFor="operator" className="text-sm font-semibold">
              Comparison Operator
            </Label>
            <div className="relative">
              <GitCompare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Select
                value={formData.operator}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, operator: val }))}
              >
                <SelectTrigger className="pl-9">
                  <SelectValue placeholder="Select operator..." />
                </SelectTrigger>
                <SelectContent>
                  {COMPARISON_OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Numeric Values — three in a row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="thresholdValue" className="text-sm font-semibold">
                Threshold
              </Label>
              <div className="relative">
                <Activity className="absolute left-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="thresholdValue"
                  type="number"
                  step="any"
                  placeholder="0"
                  className="pl-8"
                  value={formData.thresholdValue}
                  onChange={handleNumericField("thresholdValue")}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="targetValue" className="text-sm font-semibold">
                Target
              </Label>
              <div className="relative">
                <Target className="absolute left-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="targetValue"
                  type="number"
                  step="any"
                  placeholder="0"
                  className="pl-8"
                  value={formData.targetValue}
                  onChange={handleNumericField("targetValue")}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="actualValue" className="text-sm font-semibold">
                Actual
              </Label>
              <div className="relative">
                <TrendingUp className="absolute left-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="actualValue"
                  type="number"
                  step="any"
                  placeholder="0"
                  className="pl-8"
                  value={formData.actualValue}
                  onChange={handleNumericField("actualValue")}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}