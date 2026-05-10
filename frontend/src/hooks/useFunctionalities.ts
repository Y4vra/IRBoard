import { useContext } from "react";
import { FunctionalitiesContext, type FunctionalitiesContextValue } from "@/context/FunctionalitiesContextInstance";

export function useFunctionalities() : FunctionalitiesContextValue & {
  canEditFunctionality: (functionalityId: string | number) => boolean;
} {
  const context = useContext(FunctionalitiesContext);
  if (!context) {
    throw new Error("useFunctionalities must be used within a FunctionalitiesProvider");
  }

  const canEditFunctionality = (functionalityId: string | number): boolean =>
    context.functionalities?.edit?.some((f) => String(f.id) === String(functionalityId)) ?? false;

  return { ...context, canEditFunctionality };
}