import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

type FunctionalRequirementAction = "approve" | "delete" | "disable" | "enable" | "finish" | "remove"

function useFunctionalRequirementAction(
  action: FunctionalRequirementAction,
  { projectId, onSuccess }: ActionOptions
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (
      functionalityId: string,
      functionalRequirementIds: number[]
    ) => {
      if (!functionalRequirementIds.length) return

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${action}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(functionalRequirementIds),
          }
        )

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(
            err?.message ||
              `Failed to ${action} functional requirements`
          )
        }

        onSuccess?.()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
        throw e
      } finally {
        setLoading(false)
      }
    },
    [projectId, onSuccess, action]
  )

  return { execute, loading, error }
}

export function useApproveFunctionalRequirements(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalRequirementAction(
    "approve",
    options
  )

  return { approveFunctionalRequirements: execute, loading, error }
}

export function useDisableFunctionalRequirements(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalRequirementAction(
    "disable",
    options
  )

  return { disableFunctionalRequirements: execute, loading, error }
}

export function useDeleteFunctionalRequirements(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalRequirementAction(
    "delete",
    options
  )

  return { deleteFunctionalRequirements: execute, loading, error }
}

export function useEnableFunctionalRequirements(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalRequirementAction(
    "enable",
    options
  )

  return { enableFunctionalRequirements: execute, loading, error }
}

export function useFinishFunctionalRequirements(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalRequirementAction(
    "finish",
    options
  )

  return { finishFunctionalRequirements: execute, loading, error }
}

export function useRemoveFunctionalRequirements(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalRequirementAction(
    "remove",
    options
  )

  return { removeFunctionalRequirements: execute, loading, error }
}