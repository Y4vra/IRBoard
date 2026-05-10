import { createContext } from "react";
import type { FunctionalitiesResponse } from "@/types/Functionality";

export interface FunctionalitiesContextValue {
  functionalities: FunctionalitiesResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const FunctionalitiesContext = createContext<FunctionalitiesContextValue | undefined>(undefined);