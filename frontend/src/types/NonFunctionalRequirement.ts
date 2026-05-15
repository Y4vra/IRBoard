import type { DocumentDTO } from "./Document";
import type { RequirementState } from "./enum/RequirementState";
import type { FunctionalRequirementSummaryDTO, RequirementSummaryDTO } from "./RequirementSummaryDTO";
import type { Stakeholder } from "./Stakeholder";

export interface NonFunctionalRequirement {
  id: number;
  entityIdentifier: string;
  
  name: string;
  description: string;
  state: RequirementState;
  measurementUnit: string,
  operator: string,
  thresholdValue: number,
  targetValue: number,
  actualValue: number,
  projectId: number,
  parentId: number,
  orderValue: number;
  children: NonFunctionalRequirement[],
  observedStakeholders: Stakeholder[];
  observedNFRequirements: RequirementSummaryDTO[];
  observedDocuments: DocumentDTO[];
  observerFRequirements: FunctionalRequirementSummaryDTO[];
}