import type { PriorityStyle } from "@/types/Project"
import { Badge } from "@/components/ui/badge"

const MOSCOW_STYLES: Record<string, string> = {
  MUST: "bg-amber-50 text-amber-700 border-amber-200",
  SHOULD: "bg-blue-50 text-blue-700 border-blue-200",
  COULD: "bg-slate-100 text-slate-600 border-slate-200",
  WONT: "bg-red-50 text-red-400 border-red-100",
}

const TERNARY_STYLES: Record<string, string> = {
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
}

export function PriorityBadge({
  priority,
  priorityStyle,
}: {
  priority?: string | null
  priorityStyle: PriorityStyle
}) {
  if (!priority) return null
  const styleMap = priorityStyle === "MOSCOW" ? MOSCOW_STYLES : TERNARY_STYLES
  const className = styleMap[priority] ?? "bg-slate-100 text-slate-500 border-slate-200"
  return (
    <Badge className={`border font-semibold text-xs ${className}`}>
      {priority}
    </Badge>
  )
}