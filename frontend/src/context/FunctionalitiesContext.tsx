import { type ReactNode } from "react";
import { FunctionalitiesContext } from "./FunctionalitiesContextInstance";
import type { FunctionalitiesResponse } from "@/types/Functionality";

interface FunctionalitiesProviderProps {
  children: ReactNode;
  functionalities: FunctionalitiesResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function FunctionalitiesProvider({
  children,
  functionalities,
  loading,
  error,
  refresh,
}: FunctionalitiesProviderProps) {
  return (
    <FunctionalitiesContext.Provider value={{ functionalities, loading, error, refresh }}>
      {children}
    </FunctionalitiesContext.Provider>
  );
}