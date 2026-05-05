import type { DocumentDTO } from "./Document";
import type { FunctionalRequirementSummaryDTO, RequirementSummaryDTO } from "./RequirementSummaryDTO";
import type { Stakeholder } from "./Stakeholder";

export interface NonFunctionalRequirement {
  id: number;
  identifier: string;
  name: string;
  description: string;
  state: string;
  measurementUnit: string,
  operator: string,
  thresholdValue: number,
  targetValue: number,
  actualValue: number,
  projectId: number,
  parentId: number,
  children: NonFunctionalRequirement[],
  observedStakeholders: Stakeholder[];
  observedNFRequirements: RequirementSummaryDTO[];
  observedDocuments: DocumentDTO[];
  observerFRequirements: FunctionalRequirementSummaryDTO[];
}