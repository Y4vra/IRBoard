import { useState } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Hash, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DocumentFilePicker } from "@/components/DocumentFilePicker";

interface UploadDocumentDialogProps {
  projectId: string;
  onSuccess: () => void;
}

type UploadStep = "idle" | "uploading" | "done";

export function UploadDocumentDialog({
  projectId,
  onSuccess,
}: UploadDocumentDialogProps) {
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
        `${API_BASE_URL}/projects/${projectId}/documents/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to upload document");
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
        <Button size="sm" variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            Upload Document
          </DialogTitle>

          <DialogDescription>
            Select a file to upload to this project's document storage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Project context */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Project Context</Label>

            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={projectId}
                readOnly
                disabled
                className="w-full pl-9 py-2 text-sm font-mono rounded-md border bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* 🔥 REPLACED DROPZONE */}
          <DocumentFilePicker
            file={file}
            onFileChange={(newFile) => {
              setFile(newFile);
              setError(null);
            }}
            accentColor="blue"
          />

          {/* Status */}
          {step === "uploading" && (
            <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Uploading to storage...
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4" />
              Document uploaded successfully!
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
              className="min-w-[100px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}