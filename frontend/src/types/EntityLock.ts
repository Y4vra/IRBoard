export interface EntityLockDTO {
  username: string;
  entityType: string;
  entityId: number;
  lockedAt: string; // ISO string from LocalDateTime
}

export type LockMap = Map<string, EntityLockDTO>;

export interface LockContextValue {
  getLock: (entityType: string, entityId: number) => EntityLockDTO | undefined;
  isLocked: (entityType: string, entityId: number) => boolean;
  refresh: () => void;
}