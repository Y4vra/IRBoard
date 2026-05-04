import type { FunctionalRequirement } from "./FunctionalRequirement";

export type FunctionalityState = "ACTIVE" | "DEACTIVATED";

export interface Functionality {
  id: string;
  name: string;
  description?: string;
  label: string;
  state: FunctionalityState;
  projectId: number;
}

export interface FunctionalityWithRequirements extends Functionality {
  requirements: FunctionalRequirement[];
}

export type Permission = "edit" | "view" | "none";

export type FunctionalitiesResponse = Record<Permission, Functionality[]>;