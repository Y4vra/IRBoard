import type { EntityState } from "./enum/EntityState";
import type { RequirementSummaryDTO } from "./RequirementSummaryDTO";

export interface DocumentDTO {
  id: number;
  entityIdentifier: string;
  
  fileName: string;
  mimeType: string;
  fileSize: number;
  state: EntityState;

  accessUrl?: string;
  observers: RequirementSummaryDTO[];
}