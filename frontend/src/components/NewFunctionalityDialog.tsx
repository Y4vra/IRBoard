import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Box, AlignLeft, Tag, Hash, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateFunctionalityDialogProps {
  projectId: string;
  onSuccess: () => void;
}

/**
 * Generates initials from a name string.
 * e.g. "User Authentication" -> "UA"
 *      "My Cool Feature" -> "MCF"
 */
function generateLabel(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function CreateFunctionalityDialog({
  projectId,
  onSuccess,
}: CreateFunctionalityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [labelError, setLabelError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    label: "",
  });

  // Auto-generate label from name initials, but only if the user hasn't manually edited it
  const [labelManuallyEdited, setLabelManuallyEdited] = useState(false);

  useEffect(() => {
    if (!labelManuallyEdited) {
      setFormData((prev) => ({ ...prev, label: generateLabel(prev.name) }));
    }
  }, [formData.name, labelManuallyEdited]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelManuallyEdited(true);
    setLabelError(null);
    setFormData((prev) => ({ ...prev, label: e.target.value.toUpperCase() }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    // If user clears the name, reset manual edit flag so auto-gen kicks back in
    if (!e.target.value.trim()) {
      setLabelManuallyEdited(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLabelError(null);

    const payload = {
      name: formData.name,
      description: formData.description,
      label: formData.label || undefined,
      projectId,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/new`,
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

        // Handle label-specific conflict errors (e.g. 409 Conflict or a label field error)
        if (
          response.status === 409 ||
          errorData?.field === "label" ||
          errorData?.message?.toLowerCase().includes("label")
        ) {
          setLabelError(
            "Please make it different — a functionality with this label already exists for this project."
          );
          return;
        }

        throw new Error(errorData?.message || "Failed to create functionality");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      alert("Error creating functionality");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", description: "", label: "" });
    setLabelManuallyEdited(false);
    setLabelError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Add Functionality
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Functionality</DialogTitle>
          <DialogDescription>
            Define a new functional area for this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Read-only Project ID */}
          <div className="grid gap-2">
            <Label htmlFor="projectId" className="text-sm font-semibold">
              Project ID
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="projectId"
                value={projectId}
                readOnly
                disabled
                className="pl-9 bg-muted text-muted-foreground cursor-not-allowed select-all font-mono text-sm"
              />
            </div>
          </div>

          {/* Functionality Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Functionality Name
            </Label>
            <div className="relative">
              <Box className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="e.g. User Authentication"
                className="pl-9"
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </div>
          </div>

          {/* Label (auto-generated, editable) */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="label" className="text-sm font-semibold">
                Label
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              {labelManuallyEdited && formData.name && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                  onClick={() => {
                    setLabelManuallyEdited(false);
                    setLabelError(null);
                    setFormData((prev) => ({
                      ...prev,
                      label: generateLabel(prev.name),
                    }));
                  }}
                >
                  Reset to auto
                </button>
              )}
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="label"
                placeholder="e.g. UA"
                className={`pl-9 font-mono tracking-widest uppercase ${
                  labelError
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                value={formData.label}
                onChange={handleLabelChange}
                maxLength={10}
              />
            </div>
            {labelError ? (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {labelError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Auto-generated from name initials. Must be unique within the project.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="description"
                placeholder="Describe the scope of this functionality..."
                className="pl-9 min-h-[100px] resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}