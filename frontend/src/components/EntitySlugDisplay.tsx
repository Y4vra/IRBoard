import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function EntitySlugDisplay({ slug }: { slug: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="inline-flex items-center gap-1 text-xs font-mono text-slate-600 dark:text-slate-300 cursor-default group">
            Identity slug: {slug}
            <Info className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </p>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-xs text-xs leading-relaxed">
          <p className="font-semibold mb-1">Identity slug</p>
          <p className="text-slate-300">A unique, read-only identifier. Share it with teammates or search for it in the navigation bar.</p>
          <p className="text-slate-400 mt-1 font-mono">Format: projectId - entityType - date-time - shortUUID</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}