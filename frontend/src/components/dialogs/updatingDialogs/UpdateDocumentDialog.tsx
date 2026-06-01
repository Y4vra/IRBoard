import { useState } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, CheckCircle2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { DocumentDTO } from "@/types/Document";
import { DocumentFilePicker } from "@/components/DocumentFilePicker";

interface UpdateDocumentDialogProps {
  projectId: string;
  document: DocumentDTO;
  disabled: boolean;
  onSuccess: () => void;
}

type UploadStep = "idle" | "uploading" | "done";

export function UpdateDocumentDialog({
  projectId,
  document,
  disabled,
  onSuccess,
}: UpdateDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<UploadStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const loading = step === "uploading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    setStep("uploading");

    try {
      const metadata = {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        projectId: Number(projectId),
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );

      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/documents/${document.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update document");
      }

      setStep("done");
      onSuccess();

      setTimeout(handleClose, 1200);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setStep("idle");
    }
  };

  const handleClose = () => {
    if (loading) return;

    setOpen(false);
    setError(null);
    setFile(null);
    setStep("idle");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled} variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Replace File
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Pencil className="h-4 w-4" />
            </div>
            Replace Document
          </DialogTitle>

          <DialogDescription>
            Upload a new file to replace the current one. The existing file will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Current file info (still unique → NOT duplicated) */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Current File</Label>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-slate-50">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />

              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {document.fileName}
                </p>
                <p className="text-xs text-slate-400">
                  {document.mimeType} · {(document.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>

          {/* 🔥 shared component */}
          <DocumentFilePicker
            file={file}
            onFileChange={(newFile) => {
              setFile(newFile);
              setError(null);
            }}
            accentColor="amber"
          />

          {/* Status */}
          {step === "uploading" && (
            <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Replacing file in storage...
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4" />
              Document replaced successfully!
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading || !file || step === "done"}
              className="min-w-[100px] bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Replace"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}