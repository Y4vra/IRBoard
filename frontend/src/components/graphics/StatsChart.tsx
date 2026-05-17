import { buildSlices } from "@/lib/graphUtils"
import { useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsChartProps {
  /** Map of label → count */
  stats: Record<string, number>
  /** Title shown above the chart */
  title?: string
  /** Size in pixels (diameter) */
  size?: number
  /** Optionally override the colour palette */
  colorMap?: Record<string, string>
}

// ─── Colour palettes ──────────────────────────────────────────────────────────

const DEFAULT_STATE_COLORS: Record<string, string> = {
  // Aligned with REQUIREMENT_STATE_CONFIG badge colors
  PENDING_APPROVAL: "#f59e0b", // amber-500  → bg-amber-50 / text-amber-700
  APPROVED:         "#3b82f6", // blue-500   → bg-blue-50  / text-blue-700
  FINISHED:         "#10b981", // emerald-500→ bg-emerald-50/ text-emerald-700
  DEACTIVATED:      "#94a3b8", // slate-400  → bg-slate-100/ text-slate-600
  REMOVED:          "#ef4444", // red-500    → bg-red-50   / text-red-700
  // Fallback sequence for unknown keys
  _0: "#8b5cf6",
  _1: "#ec4899",
  _2: "#14b8a6",
  _3: "#f97316",
  _4: "#6366f1",
}

/** Renders an SVG donut chart from percentage slices */
function DonutChart({
  slices,
  size,
  totalLabel,
}: {
  slices: { key: string; count: number; color: string; pct: number }[]
  size: number
  totalLabel: string
}) {
  const cx = size / 2
  const cy = size / 2
  const R = size * 0.38   // outer radius
  const r = size * 0.22   // inner radius (hole)
  const gap = 0.018       // gap between slices in radians

  // Build arc paths
  const paths = useMemo(() => {
    let angle = -Math.PI / 2 // start from top
    return slices.map((s) => {
      const sweep = s.pct * 2 * Math.PI - gap
      const x1 = cx + R * Math.cos(angle)
      const y1 = cy + R * Math.sin(angle)
      const x2 = cx + R * Math.cos(angle + sweep)
      const y2 = cy + R * Math.sin(angle + sweep)
      const xi1 = cx + r * Math.cos(angle + sweep)
      const yi1 = cy + r * Math.sin(angle + sweep)
      const xi2 = cx + r * Math.cos(angle)
      const yi2 = cy + r * Math.sin(angle)
      const large = sweep > Math.PI ? 1 : 0
      const d = [
        `M ${x1} ${y1}`,
        `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
        `L ${xi1} ${yi1}`,
        `A ${r} ${r} 0 ${large} 0 ${xi2} ${yi2}`,
        "Z",
      ].join(" ")
      angle += sweep + gap
      return { ...s, d }
    })
  }, [slices, cx, cy, R, r, gap])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {/* Slices */}
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          fill={p.color}
          className="transition-opacity duration-200 hover:opacity-80"
        >
          <title>{p.key}: {p.count} ({(p.pct * 100).toFixed(1)}%)</title>
        </path>
      ))}
      {/* Centre label */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-extrabold fill-slate-900"
        style={{ fontSize: size * 0.16, fontWeight: 800 }}
      >
        {totalLabel}
      </text>
      <text
        x={cx}
        y={cy + size * 0.1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-400"
        style={{ fontSize: size * 0.08 }}
      >
        total
      </text>
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * StatsChart
 *
 * Drop-in pie/donut chart with legend for any state map.
 * Replaces raw count badges in Functionality, Stakeholder, and NFR views.
 *
 * Usage:
 *   <StatsChart stats={{ APPROVED: 4, PENDING_APPROVAL: 2 }} title="Requirements" />
 */
function StatsChart({
  stats,
  title,
  size = 120,
  colorMap,
}: StatsChartProps) {
  const slices = buildSlices(stats, colorMap)
  const total = Object.values(stats).reduce((s, v) => s + v, 0)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        {title && (
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {title}
          </p>
        )}
        <p className="text-sm text-slate-400 italic">No data</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 self-start">
          {title}
        </p>
      )}

      <div className="flex items-center gap-6">
        {/* Donut */}
        <DonutChart slices={slices} size={size} totalLabel={String(total)} />

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {slices.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span
                className="inline-block rounded-sm shrink-0"
                style={{
                  width: 10,
                  height: 10,
                  background: s.color,
                }}
              />
              <span className="text-xs text-slate-600 font-medium leading-none">
                {s.key.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-slate-400 tabular-nums ml-auto pl-3">
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { StatsChart, DEFAULT_STATE_COLORS }