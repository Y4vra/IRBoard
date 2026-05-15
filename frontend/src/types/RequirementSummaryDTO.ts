import type { RequirementState } from "./enum/RequirementState";

export interface RequirementSummaryDTO {
  id:number;
  entityIdentifier: string;

  name: string;
  description: string;
  state: RequirementState;
  requirementType: string;
}
export interface FunctionalRequirementSummaryDTO extends RequirementSummaryDTO {
  requirementType: "FR";
  functionalityId: number;
}
export type RequirementType = "FR"|"NFR";