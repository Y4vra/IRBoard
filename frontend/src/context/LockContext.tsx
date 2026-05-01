import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { API_BASE_URL } from "../lib/globalVars";
import { POLL_INTERVAL_MS, lockKey } from "../lib/lockUtils";
import type { EntityLockDTO, LockMap } from "../types/EntityLock";
import { LockContext } from "./LockContextInstance";

interface LockProviderProps {
  children: ReactNode;
  projectId?: number;
}

export function LockProvider({ children, projectId }: LockProviderProps) {
  const [locks, setLocks] = useState<LockMap>(new Map());
  const fetchLocksRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const url = projectId
          ? `${API_BASE_URL}/projectLocks/${projectId}`
          : `${API_BASE_URL}/systemLocks`;

        const res = await fetch(url, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok || cancelled) return;

        const data: EntityLockDTO[] = await res.json();
        const map: LockMap = new Map(
          data.map((lock) => [lockKey(lock.entityType, lock.entityId), lock])
        );
        if (!cancelled) setLocks(map);
      } catch {
        // silently fail
      }
    };

    fetchLocksRef.current = run;

    const initial = setTimeout(run, 0);
    const interval = setInterval(run, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [projectId]);

  const refresh = useCallback(() => {
    fetchLocksRef.current();
  }, []);

  const getLock = useCallback(
    (entityType: string, entityId: number) => locks.get(lockKey(entityType, entityId)),
    [locks]
  );

  const isLocked = useCallback(
    (entityType: string, entityId: number) => locks.has(lockKey(entityType, entityId)),
    [locks]
  );

  return (
    <LockContext.Provider value={{ getLock, isLocked, refresh }}>
      {children}
    </LockContext.Provider>
  );
}
