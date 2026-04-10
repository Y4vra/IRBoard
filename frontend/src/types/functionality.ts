export type FunctionalityState = "ACTIVE" | "DEACTIVATED";

export interface Functionality {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  state: FunctionalityState;
}