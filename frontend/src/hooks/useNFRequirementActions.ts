import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

type NFRequirementAction = "approve" | "delete" | "disable" | "enable" | "finish" | "remove"

function useNFRequirementAction(
  action: NFRequirementAction,
  { projectId, onSuccess }: ActionOptions
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (nfrIds: number[]) => {
      if (!nfrIds.length) return

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${action}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(nfrIds),
          }
        )

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(
            err?.message || `Failed to ${action} non-functional requirements`
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

export function useApproveNFRequirements(options: ActionOptions) {
  const { execute, loading, error } = useNFRequirementAction(
    "approve",
    options
  )

  return { approveNFRequirements: execute, loading, error }
}

export function useDisableNFRequirements(options: ActionOptions) {
  const { execute, loading, error } = useNFRequirementAction(
    "disable",
    options
  )

  return { disableNFRequirements: execute, loading, error }
}

export function useDeleteNFRequirements(options: ActionOptions) {
  const { execute, loading, error } = useNFRequirementAction(
    "delete",
    options
  )

  return { deleteNFRequirements: execute, loading, error }
}

export function useEnableNFRequirements(options: ActionOptions) {
  const { execute, loading, error } = useNFRequirementAction(
    "enable",
    options
  )

  return { enableNFRequirements: execute, loading, error }
}

export function useFinishNFRequirements(options: ActionOptions) {
  const { execute, loading, error } = useNFRequirementAction(
    "finish",
    options
  )

  return { finishNFRequirements: execute, loading, error }
}

export function useRemoveNFRequirements(options: ActionOptions) {
  const { execute, loading, error } = useNFRequirementAction(
    "remove",
    options
  )

  return { removeNFRequirements: execute, loading, error }
}