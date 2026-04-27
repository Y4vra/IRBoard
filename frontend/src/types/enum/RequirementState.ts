export const RequirementState = {
  PENDING_APPROVAL : "PENDING_APPROVAL",
  APPROVED : "APPROVED",
  FINISHED : "FINISHED",
  DEACTIVATED : "DEACTIVATED",
  REMOVED : "REMOVED",
} as const;

export type RequirementState = typeof RequirementState[keyof typeof RequirementState];