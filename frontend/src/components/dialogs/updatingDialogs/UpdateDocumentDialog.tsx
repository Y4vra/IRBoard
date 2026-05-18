import { useState, useRef } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, CheckCircle2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DocumentDTO } from "@/types/Document";

interface UpdateDocumentDialogProps {
  projectId: string;
  document: DocumentDTO;
  disabled: boolean;
  onSuccess: () => void;
}

type UploadStep = "idle" | "uploading" | "done";

export function UpdateDocumentDialog({ projectId, document, disabled, onSuccess }: UpdateDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<UploadStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = step === "uploading";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setError(null);
    }
  };

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
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
      setStep("idle");
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
    setFile(null);
    setStep("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled} variant="outline">
          <Pencil className="mr-2 h-4 w-4" /> Replace File
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
          {/* Current file info */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Current File</Label>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-slate-50">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{document.fileName}</p>
                <p className="text-xs text-slate-400">
                  {document.mimeType} · {formatBytes(document.fileSize)}
                </p>
              </div>
            </div>
          </div>

          {/* File drop zone */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">
              New File <span className="text-red-500">*</span>
            </Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                file
                  ? "border-amber-300 bg-amber-50"
                  : "border-slate-200 hover:border-amber-200 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center gap-1.5">
                  <FileText className="h-8 w-8 text-amber-500" />
                  <p className="text-sm font-medium text-slate-800 truncate max-w-[300px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {file.type || "unknown type"} · {formatBytes(file.size)}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-amber-500 hover:underline mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500 font-medium">
                    Click or drag & drop a file
                  </p>
                  <p className="text-xs text-slate-400">Any file type accepted</p>
                </div>
              )}
            </div>
          </div>

          {/* Status messages */}
          {step === "uploading" && (
            <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-amber-500" />
              Replacing file in storage...
            </div>
          )}
          {step === "done" && (
            <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Document replaced successfully!
            </div>
          )}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !file || step === "done"}
              className="min-w-[100px] bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}