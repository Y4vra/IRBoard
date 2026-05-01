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
  state: string;
  children: FunctionalRequirement[];
}