import type { RequirementSummaryDTO } from "./RequirementSummaryDTO";

export interface DocumentDTO {
  id: number;
  fileName: string;
  mimeType: string;
  fileSize: number;

  accessUrl?: string;
  observers: RequirementSummaryDTO[];
}