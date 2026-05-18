import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Project } from "@/types/Project"
import { buildSlices } from "@/lib/graphUtils"
import { StatsChart } from "./StatsChart"

// ─── Mini stacked-bar for functionality breakdown ────────────────────────────

interface StackedBarProps {
  functionalityId: string
  statsByState: Record<string, number>
}

function StackedBar({ functionalityId, statsByState }: StackedBarProps) {
  const slices = buildSlices(statsByState)
  const total = Object.values(statsByState).reduce((s, v) => s + v, 0)

  return (
    <div className="flex items-center gap-3 group">
      <span className="font-mono text-[11px] text-slate-400 w-24 shrink-0 truncate">
        #{functionalityId}
      </span>

      <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
        <div className="h-full flex rounded-full overflow-hidden">
          {slices.map((s) => (
            <div
              key={s.key}
              style={{ width: `${s.pct * 100}%`, background: s.color }}
              title={`${s.key}: ${s.count}`}
              className="transition-opacity hover:opacity-75"
            />
          ))}
        </div>
      </div>

      <span className="text-xs text-slate-400 tabular-nums w-6 text-right shrink-0">
        {total}
      </span>
    </div>
  )
}

// ─── Compact legend ──────────────────────────────────────────────────────────

function MiniLegend({ stats }: { stats: Record<string, number> }) {
  const slices = buildSlices(stats)
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
      {slices.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="inline-block rounded-sm"
            style={{ width: 8, height: 8, background: s.color }}
          />
          {s.key.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface ProjectStatsSectionProps {
  project: Project
}

/**
 * ProjectStatsSection
 *
 * Full statistics overview for the project page.
 * Shows:
 *  • Stakeholder state distribution (donut)
 *  • NFR state distribution (donut)
 *  • Document state distribution (donut)
 *  • Per-functionality requirement breakdown (stacked bar chart, relative/100%)
 */
export function ProjectStatsSection({ project }: ProjectStatsSectionProps) {
  const {
    stakeholderStats,
    nonFunctionalRequirementStats,
    functionalRequirementStats,
    documentStats,
  } = project

  // Aggregate all FR stats into a single map for a global donut
  const aggregatedFRStats = useMemo<Record<string, number>>(() => {
    if (!functionalRequirementStats) return {}
    const acc: Record<string, number> = {}
    Object.values(functionalRequirementStats).forEach((stateMap) => {
      Object.entries(stateMap).forEach(([state, count]) => {
        acc[state] = (acc[state] ?? 0) + count
      })
    })
    return acc
  }, [functionalRequirementStats])

  const hasFRData =
    functionalRequirementStats &&
    Object.keys(functionalRequirementStats).length > 0

  const hasStakeholderData =
    stakeholderStats && Object.values(stakeholderStats).some((v) => v > 0)

  const hasNFRData =
    nonFunctionalRequirementStats &&
    Object.values(nonFunctionalRequirementStats).some((v) => v > 0)

  const hasDocumentData =
    documentStats && Object.values(documentStats).some((v) => v > 0)

  if (!hasStakeholderData && !hasNFRData && !hasFRData && !hasDocumentData) return null

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Stakeholders */}
        {hasStakeholderData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Stakeholders</CardTitle>
              <CardDescription>State distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <StatsChart stats={stakeholderStats!} size={110} />
            </CardContent>
          </Card>
        )}

        {/* NFR */}
        {hasNFRData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Non-Functional Requirements</CardTitle>
              <CardDescription>State distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <StatsChart stats={nonFunctionalRequirementStats!} size={110} />
            </CardContent>
          </Card>
        )}

        {/* Functional Requirements — global donut */}
        {hasFRData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Functional Requirements</CardTitle>
              <CardDescription>All functionalities combined</CardDescription>
            </CardHeader>
            <CardContent>
              <StatsChart stats={aggregatedFRStats} size={110} />
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {hasDocumentData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Documents</CardTitle>
              <CardDescription>State distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <StatsChart stats={documentStats!} size={110} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Per-functionality stacked bar breakdown — relative (100%) */}
      {hasFRData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Requirements by Functionality</CardTitle>
            <CardDescription>
              Each bar shows the state distribution as a proportion of that functionality's total.
              The count is shown on the right.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {Object.entries(functionalRequirementStats!).map(([funcId, stateMap]) => (
              <StackedBar
                key={funcId}
                functionalityId={funcId}
                statsByState={stateMap}
              />
            ))}
            <MiniLegend stats={aggregatedFRStats} />
          </CardContent>
        </Card>
      )}
    </section>
  )
}