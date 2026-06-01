import { Upload, FileText } from "lucide-react";
import { Label } from "./ui/label";
import { useRef } from "react";

interface DocumentFilePickerProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accentColor: "blue" | "amber";
}

export function DocumentFilePicker({
  file,
  onFileChange,
  accentColor,
}: DocumentFilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      onFileChange(dropped);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const colors =
    accentColor === "blue"
      ? {
          border: "border-blue-300 bg-blue-50",
          hover: "hover:border-blue-200 hover:bg-slate-50",
          icon: "text-blue-500",
          link: "text-blue-500",
        }
      : {
          border: "border-amber-300 bg-amber-50",
          hover: "hover:border-amber-200 hover:bg-slate-50",
          icon: "text-amber-500",
          link: "text-amber-500",
        };

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-semibold">
        File <span className="text-red-500">*</span>
      </Label>

      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          file ? colors.border : `border-slate-200 ${colors.hover}`
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
            <FileText className={`h-8 w-8 ${colors.icon}`} />

            <p className="text-sm font-medium text-slate-800 truncate max-w-[300px]">
              {file.name}
            </p>

            <p className="text-xs text-slate-400">
              {file.type || "unknown type"} · {formatBytes(file.size)}
            </p>

            <button
              type="button"
              className={`text-xs hover:underline mt-1 ${colors.link}`}
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
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
            <p className="text-xs text-slate-400">
              Any file type accepted
            </p>
          </div>
        )}
      </div>
    </div>
  );
}