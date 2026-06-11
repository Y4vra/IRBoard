import type { ViewMode } from "@/types/ViewMode";
import { Archive, FolderOpen } from "lucide-react";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  activeCount?: number;
  removedCount?: number;
}

export function ViewToggle({ mode, onChange, activeCount, removedCount }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
      <button
        data-testid="view_toggle_active"
        onClick={() => onChange("active")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          mode === "active"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        Active
        {activeCount !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            mode === "active" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
          }`}>
            {activeCount}
          </span>
        )}
      </button>
      <button
        data-testid="view_toggle_removed"
        onClick={() => onChange("removed")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          mode === "removed"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Archive className="h-3.5 w-3.5" />
        Removed
        {removedCount !== undefined && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            mode === "removed" ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500"
          }`}>
            {removedCount}
          </span>
        )}
      </button>
    </div>
  );
}