import { Badge } from "@/components/ui/badge"
import type { EntityState } from "@/types/enum/EntityState"

const STATE_CONFIG: Record<EntityState, { label: string; className: string }> = {
  PENDING_APPROVAL: {
    label: "Pending Approval",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  APPROVED: {
    label: "Approved",
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

interface EntityStateBadgeProps {
  state: EntityState|undefined
}

export function EntityStateBadge({ state }: EntityStateBadgeProps) {
  const { label, className } = STATE_CONFIG[state ?? "DEACTIVATED"]

  return (
    <Badge
      variant="outline"
      className={`uppercase text-[10px] ${className}`}
    >
      {label}
    </Badge>
  )
}