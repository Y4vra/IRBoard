export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  active: boolean;
  isAdmin: boolean;

  projectsWhereUserIsManager: string[]|null;
  functionalitiesWhereUserIsEngineer: Record<string, string[]> |null;
  functionalitiesWhereUserIsStakeholder: Record<string, string[]> |null;
}