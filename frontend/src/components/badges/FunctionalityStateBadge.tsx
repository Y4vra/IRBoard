import { Badge } from "@/components/ui/badge"
import type { FunctionalityState } from "@/types/Functionality";
import { Activity } from "lucide-react";

const STATE_CONFIG: Record<FunctionalityState, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-blue-50 text-blue-700 border-blue-100",
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

interface FunctionalityStateBadgeProps {
  state: FunctionalityState
}

export function FunctionalityStateBadge({ state }: FunctionalityStateBadgeProps) {
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