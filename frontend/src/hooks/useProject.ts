import { ProjectContext } from "@/context/ProjectContextInstance";
import { useContext } from "react";

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}