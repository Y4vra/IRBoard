import { Badge } from "@/components/ui/badge"
import type { ProjectState } from "@/types/Project";
import { Activity } from "lucide-react";

const STATE_CONFIG: Record<ProjectState, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },
  FINISHED: {
    label: "Finished",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  DEACTIVATED: {
    label: "Deactivated",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  REMOVED: {
    label: "Removed",
    className: "bg-red-50 text-red-700 border-red-100",
  },
} as const;

interface ProjectStateBadgeProps {
  state: ProjectState|undefined
}

export function ProjectStateBadge({ state }: ProjectStateBadgeProps) {
  const { label, className } = STATE_CONFIG[state ?? "DEACTIVATED"]

  return (
    <Badge
      variant="outline"
      className={`uppercase text-sm px-3 py-1 ${className}`}
    >
      <Activity/>
      {label}
    </Badge>
  )
}