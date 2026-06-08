import { Badge } from "@/components/ui/badge";
import type { RequirementState } from "@/types/enum/RequirementState";

export const REQUIREMENT_STATE_CONFIG = {
  PENDING_APPROVAL: {
    label: "Pending Approval",
    class: "bg-amber-50 text-amber-700 border-amber-100",
  },
  APPROVED: {
    label: "Approved",
    class: "bg-blue-50 text-blue-700 border-blue-100",
  },
  FINISHED: {
    label: "Finished",
    class: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  DEACTIVATED: {
    label: "Deactivated",
    class: "bg-slate-100 text-slate-600 border-slate-200",
  },
  REMOVED: {
    label: "Removed",
    class: "bg-red-50 text-red-700 border-red-100",
  },
} as const;

interface RequirementStateBadgeProps {
  state: RequirementState|undefined
}

export function RequirementStateBadge({ state }: RequirementStateBadgeProps) {
  const config = REQUIREMENT_STATE_CONFIG[state ?? "DEACTIVATED"]

  return (
    <Badge className={`${config.class} uppercase text-[10px] border`}>
      {config.label}
    </Badge>
  );
}