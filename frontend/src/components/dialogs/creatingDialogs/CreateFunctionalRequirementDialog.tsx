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
} from "@/components/ui/dialog";
import {
  Loader2,
  AlignLeft,
  Hash,
  GitMerge,
  Star,
  Anchor,
} from "lucide-react";
import type { PriorityStyle } from "@/types/Project";

const MOSCOW_OPTIONS = ["MUST", "SHOULD", "COULD", "WONT"];
const TERNARY_OPTIONS = ["HIGH", "NORMAL", "LOW"];
const STABILITY_OPTIONS = ["STABLE", "UNSTABLE", "VOLATILE"];

interface CreateFunctionalRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  functionalityId: string;
  priorityStyle: PriorityStyle;
  /** When provided, the new FR will be created as a child of this requirement. */
  parentId?: number | string;
  onSuccess: () => void;
}

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

export function CreateFunctionalRequirementDialog({
  open,
  onOpenChange,
  projectId,
  functionalityId,
  priorityStyle,
  parentId,
  onSuccess,
}: CreateFunctionalRequirementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const isChild = parentId !== undefined && parentId !== null;
  const priorityOptions = priorityStyle === "MOSCOW" ? MOSCOW_OPTIONS : TERNARY_OPTIONS;

  const handleField =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name,
      description: formData.description,
      priority: formData.priority || undefined,
      stability: formData.stability || undefined,
      functionalityId: Number(functionalityId),
      projectId: Number(projectId),
      ...(isChild ? { parentId: Number(parentId) } : {}),
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/new`,
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
        throw new Error(errorData?.message || "Failed to create functional requirement");
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
    setFormData(EMPTY_FORM);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isChild ? "New Child Functional Requirement" : "New Functional Requirement"}
          </DialogTitle>
          <DialogDescription>
            {isChild
              ? "Define a sub-requirement nested under the selected requirement."
              : "Define a functional requirement for this functionality."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Functionality Context */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Functionality</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={functionalityId}
                readOnly
                disabled
                className="pl-9 bg-muted text-muted-foreground cursor-not-allowed font-mono text-sm"
              />
            </div>
          </div>

          {/* Parent — only shown when creating a child */}
          {isChild && (
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Parent Requirement</Label>
              <div className="relative">
                <GitMerge className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
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
            <Label htmlFor="fr-name" className="text-sm font-semibold">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fr-name"
              placeholder="e.g. User Authentication, Export Report"
              value={formData.name}
              onChange={handleField("name")}
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="fr-description" className="text-sm font-semibold">
              Description <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="fr-description"
                placeholder="Describe what this requirement entails..."
                className="pl-9 min-h-[90px] resize-none"
                value={formData.description}
                onChange={handleField("description")}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">
              Priority
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({priorityStyle})
              </span>
            </Label>
            <div className="relative">
              <Star className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Select
                value={formData.priority}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
              >
                <SelectTrigger className="pl-9">
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stability */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Stability</Label>
            <div className="relative">
              <Anchor className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Select
                value={formData.stability}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, stability: val }))}
              >
                <SelectTrigger className="pl-9">
                  <SelectValue placeholder="Select stability..." />
                </SelectTrigger>
                <SelectContent>
                  {STABILITY_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}