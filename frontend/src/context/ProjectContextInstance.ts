import { createContext } from "react";
import type { Project } from "@/types/Project";

export interface ProjectContextValue extends Project {
  refresh: () => void;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);