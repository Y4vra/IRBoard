// lib/lockUtils.ts
export const POLL_INTERVAL_MS = 15_000;

export function lockKey(entityType: string, entityId: number) {
  return `${entityType}:${entityId}`;
}

export const EntityTypes = {
  PROJECT: "PROJECT",
  TASK: "TASK",
  USER: "USER",
} as const;

export type EntityType = typeof EntityTypes[keyof typeof EntityTypes];