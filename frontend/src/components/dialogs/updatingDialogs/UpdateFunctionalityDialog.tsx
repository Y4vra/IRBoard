import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Box, AlignLeft, Tag, AlertCircle, Pencil, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Functionality } from "@/types/Functionality";

interface UpdateFunctionalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  functionality: Functionality;
  onSuccess: () => void;
}

type Step = "idle" | "requesting" | "editing" | "saving" | "done" | "error";

export function UpdateFunctionalityDialog({
  open,
  onOpenChange,
  projectId,
  functionality,
  onSuccess,
}: UpdateFunctionalityDialogProps) {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [labelError, setLabelError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: functionality.name ?? "",
    description: functionality.description ?? "",
    label: functionality.label ?? "",
  });

  // Request edit lock when dialog opens
  useEffect(() => {
    if (!open) return;

    const requestLock = async () => {
      setStep("requesting");
      setError(null);
      setLabelError(null);
      setFormData({
        name: functionality.name ?? "",
        description: functionality.description ?? "",
        label: functionality.label ?? "",
      });

      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/functionalities/${functionality.id}/requestEdit`,
          { credentials: "include" }
        );

        if (res.status === 409) {
          setError("This functionality is currently being edited by another user.");
          setStep("error");
          return;
        }
        if (!res.ok) {
          setError("Server error while requesting edit lock.");
          setStep("error");
          return;
        }

        setStep("editing");
      } catch {
        setError("Could not connect to the server.");
        setStep("error");
      }
    };

    requestLock();
  }, [open, projectId, functionality.id, functionality.name, functionality.description, functionality.label]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelError(null);
    setFormData((prev) => ({ ...prev, label: e.target.value.toUpperCase() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("saving");
    setError(null);
    setLabelError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionality.id}/modify`,
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
            label: formData.label || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (
          errorData?.field === "label" ||
          errorData?.message?.toLowerCase().includes("label")
        ) {
          setLabelError(
            "A functionality with this label already exists for this project. Please choose a different one."
          );
          setStep("editing");
          return;
        }

        if (response.status === 409) {
          throw new Error("The functionality is being edited by another user.");
        }

        throw new Error(errorData?.message || "Failed to update functionality.");
      }

      setStep("done");
      onSuccess();
      setTimeout(handleClose, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("editing");
    }
  };

  const handleClose = () => {
    if (step === "saving" || step === "requesting") return;
    onOpenChange(false);
    setStep("idle");
    setError(null);
    setLabelError(null);
  };

  const isDirty =
    formData.name !== (functionality.name ?? "") ||
    formData.description !== (functionality.description ?? "") ||
    formData.label !== (functionality.label ?? "");

  const isLoading = step === "requesting" || step === "saving";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
              <Pencil className="h-4 w-4" />
            </div>
            Edit Functionality
          </DialogTitle>
          <DialogDescription>
            Update the details for{" "}
            <span className="font-semibold text-foreground">{functionality.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Lock requesting state */}
        {step === "requesting" && (
          <div className="flex items-center gap-3 py-8 justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Requesting edit lock...
          </div>
        )}

        {/* Error state (lock conflict or server error) */}
        {step === "error" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}

        {/* Edit form */}
        {(step === "editing" || step === "saving" || step === "done") && (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* General error */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Functionality Name */}
            <div className="grid gap-2">
              <Label htmlFor="update-func-name" className="text-sm font-semibold">
                Functionality Name
              </Label>
              <div className="relative">
                <Box className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="update-func-name"
                  placeholder="e.g. User Authentication"
                  className="pl-9"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Label */}
            <div className="grid gap-2">
              <Label htmlFor="update-func-label" className="text-sm font-semibold">
                Label
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="update-func-label"
                  placeholder="e.g. UA"
                  className={`pl-9 font-mono tracking-widest uppercase ${
                    labelError ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  value={formData.label}
                  onChange={handleLabelChange}
                  disabled={isLoading}
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
                  Must be unique within the project.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="update-func-description" className="text-sm font-semibold">
                Description
              </Label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="update-func-description"
                  placeholder="Describe the scope of this functionality..."
                  className="pl-9 min-h-[100px] resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !isDirty || step === "done"}
              >
                {step === "saving" ? (
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
        )}
      </DialogContent>
    </Dialog>
  );
}