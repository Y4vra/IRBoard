export interface Project {
  id: string;
  name: string;
  description: string;
  priorityStyle: PriorityStyle;
  state: ProjectState;
  editPermission: boolean,
  
  stakeholderStats?: Record<string, number>;
  documentStats?: Record<string, number>;
  nonFunctionalRequirementStats?: Record<string, number>;
  functionalRequirementStats?: Record<string, Record<string, number>>;
}

export type PriorityStyle = "MOSCOW" | "TERNARY";

export type ProjectState = "ACTIVE" | "FINISHED" | "DEACTIVATED" | "REMOVED";