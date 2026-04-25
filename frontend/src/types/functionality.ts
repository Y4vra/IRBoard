export type FunctionalityState = "ACTIVE" | "DEACTIVATED";

export interface Functionality {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  state: FunctionalityState;
}

export type Permission = "edit" | "view" | "none";

export type FunctionalitiesResponse = Record<Permission, Functionality[]>;