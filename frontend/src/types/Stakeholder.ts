import type { EntityState } from "./enum/EntityState";
import type { RequirementSummaryDTO } from "./RequirementSummaryDTO";

export interface Stakeholder {
  id: number;
  entityIdentifier: string;
  
  name: string;
  description: string;
  pendingReview: boolean;
  state: EntityState;
  observers: RequirementSummaryDTO[];
}