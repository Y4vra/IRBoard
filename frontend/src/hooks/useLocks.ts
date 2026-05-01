import { useContext } from "react";
import { LockContext } from "../context/LockContextInstance";

export function useLocks() {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error("useLocks must be used inside <LockProvider>");
  return ctx;
}