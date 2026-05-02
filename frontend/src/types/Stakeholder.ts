import type { RequirementSummaryDTO } from "./RequirementSummaryDTO";

export interface Stakeholder {
  id: number;
  name: string;
  description: string;
  pendingReview: boolean;
  state: string;
  observers: RequirementSummaryDTO[];
}