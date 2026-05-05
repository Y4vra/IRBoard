import { useState, useRef } from "react";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, Hash, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UploadDocumentDialogProps {
  projectId: string;
  onSuccess: () => void;
}

type UploadStep = "idle" | "uploading" | "done";

export function UploadDocumentDialog({ projectId, onSuccess }: UploadDocumentDialogProps) {
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
        `${API_BASE_URL}/projects/${projectId}/documents/upload`,
        {
          method: "POST",
          credentials: "include",
          // No Content-Type header — browser sets multipart boundary automatically
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
        <Button size="sm" className="shadow-md">
          <Upload className="mr-2 h-4 w-4" /> Upload Document
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

          {/* File drop zone */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">
              File <span className="text-red-500">*</span>
            </Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                file
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
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
                  <FileText className="h-8 w-8 text-blue-500" />
                  <p className="text-sm font-medium text-slate-800 truncate max-w-[300px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {file.type || "unknown type"} · {formatBytes(file.size)}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-blue-500 hover:underline mt-1"
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
              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-blue-500" />
              Uploading to storage...
            </div>
          )}
          {step === "done" && (
            <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Document uploaded successfully!
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
              className="min-w-[100px]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}