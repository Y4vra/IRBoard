import { type ReactNode } from "react";
import { ProjectContext,type ProjectContextValue } from "./ProjectContextInstance";

export function ProjectProvider({ children, value }: { children: ReactNode; value: ProjectContextValue }) {
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}