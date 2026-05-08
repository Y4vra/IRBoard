import { DEFAULT_STATE_COLORS } from "@/components/graphics/StatsChart";

function getColor(key: string, index: number, colorMap?: Record<string, string>): string {
  if (colorMap?.[key]) return colorMap[key]
  if (DEFAULT_STATE_COLORS[key]) return DEFAULT_STATE_COLORS[key]
  return DEFAULT_STATE_COLORS[`_${index % 5}`] ?? "#94a3b8"
}

export function buildSlices(
  stats: Record<string, number>,
  colorMap?: Record<string, string>
): { key: string; count: number; color: string; pct: number }[] {
  const entries = Object.entries(stats).filter(([, v]) => v > 0)
  const total = entries.reduce((s, [, v]) => s + v, 0)
  if (total === 0) return []
  return entries.map(([key, count], i) => ({
    key,
    count,
    color: getColor(key, i, colorMap),
    pct: count / total,
  }))
}