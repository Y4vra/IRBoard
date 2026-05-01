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
}