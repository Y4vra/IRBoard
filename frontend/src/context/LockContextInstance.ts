import { createContext } from "react";
import type { LockContextValue } from "../types/EntityLock";

export const LockContext = createContext<LockContextValue | null>(null);