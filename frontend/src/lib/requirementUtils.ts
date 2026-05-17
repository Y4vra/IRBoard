import type { FunctionalRequirement } from "@/types/FunctionalRequirement"
import type { NonFunctionalRequirement } from "@/types/NonFunctionalRequirement"

export function collectPendingFRIds(reqs: FunctionalRequirement[]): number[] {
  return reqs.flatMap((r) => [
    ...(r.state === "PENDING_APPROVAL" ? [r.id] : []),
    ...collectPendingFRIds(r.children ?? []),
  ])
}

export function collectPendingNFRIds(reqs: NonFunctionalRequirement[]): number[] {
  return reqs.flatMap((r) => [
    ...(r.state === "PENDING_APPROVAL" ? [r.id] : []),
    ...collectPendingNFRIds(r.children ?? []),
  ])
}