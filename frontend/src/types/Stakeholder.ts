export interface Stakeholder {
  id: number;
  name: string;
  description: string;
  pendingReview: boolean;
  state: string;
}