export interface Project {
  id: string;
  name: string;
  description: string;
  priorityStyle: PriorityStyle;
  state: ProjectState;
  createdAt: string;
}

export type PriorityStyle = "MOSCOW" | "TERNARY";

export type ProjectState = "ACTIVE" | "FINISHED" | "DEACTIVATED" | "REMOVED";