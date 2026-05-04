export interface RequirementSummaryDTO {
    id:number;
    name: string;
    description: string;
    state: string;
    requirementType: string;
}
export interface FunctionalRequirementSummaryDTO extends RequirementSummaryDTO {
  requirementType: "FR";
  functionalityId: number;
}
export type RequirementType = "FR"|"NFR";