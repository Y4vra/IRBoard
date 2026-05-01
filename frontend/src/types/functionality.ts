export type FunctionalityState = "ACTIVE" | "DEACTIVATED";

export interface Functionality {
  id: string;
  name: string;
  description?: string;
  label: string;
  state: FunctionalityState;
  projectId: number;
  priorityStyle: string;
}

export type Permission = "edit" | "view" | "none";

export type FunctionalitiesResponse = Record<Permission, Functionality[]>;