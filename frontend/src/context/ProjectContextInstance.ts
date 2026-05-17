import { createContext } from "react";
import type { Project } from "@/types/Project";

export interface ProjectContextValue extends Project {
  isManager: boolean;
  refresh: () => void;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);