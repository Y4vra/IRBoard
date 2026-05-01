import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import type { EntityLockDTO } from "@/types/EntityLock"

interface Props {
  lock: EntityLockDTO | undefined
}

export function LockIndicator({ lock }: Props) {
  if (!lock) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700 shrink-0">
          <Lock className="h-3 w-3" />
          {lock.username}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        Currently being edited by <strong>{lock.username}</strong>
      </TooltipContent>
    </Tooltip>
  )
}