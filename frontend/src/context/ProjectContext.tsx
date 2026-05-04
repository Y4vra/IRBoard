import { type ReactNode } from "react";
import type { Project } from "@/types/Project";
import { ProjectContext } from "./ProjectContextInstance";

export function ProjectProvider({ children, value }: { children: ReactNode; value: Project }) {
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}