import { createContext } from "react";
import type { Project } from "@/types/Project";

export const ProjectContext = createContext<Project | undefined>(undefined);