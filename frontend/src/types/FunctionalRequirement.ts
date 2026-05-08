import type { DocumentDTO } from "./Document";
import type { RequirementState } from "./enum/RequirementState";
import type { FunctionalRequirementSummaryDTO, RequirementSummaryDTO } from "./RequirementSummaryDTO";
import type { Stakeholder } from "./Stakeholder";

export interface FunctionalRequirement {
  id: number;
  identifier: string;
  name: string;
  description: string;
  priority: string;
  stability: string;
  functionalityId: number;
  parentId: number;
  orderValue: number;
  state: RequirementState;
  children: FunctionalRequirement[];
  observedStakeholders: Stakeholder[];
  observedNFRequirements: RequirementSummaryDTO[];
  observedDocuments: DocumentDTO[];
  observedFRequirements: FunctionalRequirementSummaryDTO[];
}