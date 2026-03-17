export interface Project {
  id: string;
  name: string;
  description: string;
  priorityStyle: "TERNARY" | "MOSCOW";
  state: "ACTIVE" | "FINISHED" | "DEACTIVATED" | "REMOVED";
  createdAt: string;
}