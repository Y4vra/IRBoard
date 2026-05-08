import { Badge } from "@/components/ui/badge"
import type { EntityState } from "@/types/enum/EntityState"

const STATE_CONFIG: Record<EntityState, { label: string; className: string }> = {
  PENDING_APPROVAL: {
    label: "Pending Approval",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  DEACTIVATED: {
    label: "Deactivated",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  REMOVED: {
    label: "Removed",
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

interface EntityStateBadgeProps {
  state: EntityState
}

export function EntityStateBadge({ state }: EntityStateBadgeProps) {
  const { label, className } = STATE_CONFIG[state]

  return (
    <Badge
      variant="outline"
      className={`uppercase text-[10px] ${className}`}
    >
      {label}
    </Badge>
  )
}