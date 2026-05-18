import type { Project } from "@/types/Project"

// ─── Colour tokens (shared with StatsChart) ───────────────────────────────────

const STATE_COLORS: Record<string, { bar: string; dot: string; label: string }> = {
  APPROVED:         { bar: "bg-blue-500",    dot: "bg-blue-500",    label: "text-blue-600"    },
  FINISHED:         { bar: "bg-emerald-500", dot: "bg-emerald-500", label: "text-emerald-600" },
  PENDING_APPROVAL: { bar: "bg-amber-400",   dot: "bg-amber-400",   label: "text-amber-600"   },
  DEACTIVATED:      { bar: "bg-slate-300",   dot: "bg-slate-300",   label: "text-slate-400"   },
  REMOVED:          { bar: "bg-red-400",     dot: "bg-red-400",     label: "text-red-600"     },
}

function stateColor(key: string) {
  return STATE_COLORS[key] ?? { bar: "bg-slate-300", dot: "bg-slate-300", label: "text-slate-400" }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sumMap(m?: Record<string, number>): number {
  if (!m) return 0
  return Object.values(m).reduce((s, v) => s + v, 0)
}

function aggregateFRStats(
  functionalRequirementStats?: Record<string, Record<string, number>>
): Record<string, number> {
  if (!functionalRequirementStats) return {}
  const acc: Record<string, number> = {}
  Object.values(functionalRequirementStats).forEach((stateMap) => {
    Object.entries(stateMap).forEach(([state, count]) => {
      acc[state] = (acc[state] ?? 0) + count
    })
  })
  return acc
}

// ─── Segmented progress bar ───────────────────────────────────────────────────

function SegmentedBar({ stats, total }: { stats: Record<string, number>; total: number }) {
  if (total === 0) {
    return <div className="h-1.5 w-full rounded-full bg-slate-100" />
  }

  const entries = Object.entries(stats).filter(([, v]) => v > 0)

  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden flex gap-px bg-slate-100">
      {entries.map(([state, count]) => (
        <div
          key={state}
          className={`h-full transition-all duration-700 ${stateColor(state).bar}`}
          style={{ width: `${(count / total) * 100}%` }}
          title={`${state}: ${count}`}
        />
      ))}
    </div>
  )
}

// ─── Pill stat ────────────────────────────────────────────────────────────────

function StatPill({
  label,
  stats,
}: {
  label: string
  stats: Record<string, number>
}) {
  const total = sumMap(stats)
  const done = (stats["APPROVED"] ?? 0) + (stats["FINISHED"] ?? 0)
  const pending = stats["PENDING_APPROVAL"] ?? 0

  return (
    <div className="flex flex-col gap-1.5 min-w-[100px]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          {label}
        </span>
        <span className="text-[11px] font-mono text-muted-foreground/50 tabular-nums">
          {total}
        </span>
      </div>

      <SegmentedBar stats={stats} total={total} />

      <div className="flex items-center gap-3">
        {done > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium tabular-nums">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {done}
          </span>
        )}
        {pending > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium tabular-nums">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            {pending} pending
          </span>
        )}
        {total === 0 && (
          <span className="text-[11px] text-muted-foreground/40 italic">none</span>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProjectHealthBarProps {
  project: Project
}

/**
 * ProjectHealthBar
 *
 * Compact at-a-glance strip for the project header.
 * Shows three segmented bars (Stakeholders · NFR · FR) with done/pending counts.
 * Designed to sit directly below the project title/description.
 */
export function ProjectHealthBar({ project }: ProjectHealthBarProps) {
  const frStats = aggregateFRStats(project.functionalRequirementStats)

  const hasAny =
    sumMap(project.stakeholderStats) > 0 ||
    sumMap(project.nonFunctionalRequirementStats) > 0 ||
    sumMap(frStats) > 0

  if (!hasAny) return null

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-4 justify-end">
      {project.stakeholderStats && sumMap(project.stakeholderStats) > 0 && (
        <StatPill label="Stakeholders" stats={project.stakeholderStats} />
      )}
      {project.documentStats && sumMap(project.documentStats) > 0 && (
        <StatPill label="Documents" stats={project.documentStats} />
      )}
      {project.nonFunctionalRequirementStats && sumMap(project.nonFunctionalRequirementStats) > 0 && (
        <StatPill label="NFR" stats={project.nonFunctionalRequirementStats} />
      )}
      {sumMap(frStats) > 0 && (
        <StatPill label="F.Requirements" stats={frStats} />
      )}
    </div>
  )
}