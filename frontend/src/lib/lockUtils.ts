// lib/lockUtils.ts
export const POLL_INTERVAL_MS = 15_000;

export function lockKey(entityType: string, entityId: number) {
  return `${entityType}:${entityId}`;
}

export const EntityType = {
  PROJECT: "Project",
  USER: "User",
  STAKEHOLDER: "Stakeholder",
  FUNCTIONALITY: "Functionality",
  FUNCTIONAL_REQUIREMENT: "FunctionalRequirement",
  NON_FUNCTIONAL_REQUIREMENT: "NonFunctionalRequirement",
} as const

export type EntityType = typeof EntityType[keyof typeof EntityType];