import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

type StakeholderAction = "approve" | "enable" | "disable" | "delete" | "remove"

function useStakeholderAction(
  action: StakeholderAction,
  { projectId, onSuccess }: ActionOptions
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (stakeholderIds: number[]) => {
      if (!stakeholderIds.length) return

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/stakeholders/${action}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(stakeholderIds),
          }
        )

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || `Failed to ${action} stakeholders`)
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

export function useApproveStakeholders(options: ActionOptions) {
  const { execute, loading, error } = useStakeholderAction("approve", options)

  return { approveStakeholders: execute, loading, error }
}
export function useEnableStakeholders(options: ActionOptions) {
  const { execute, loading, error } = useStakeholderAction("enable", options)

  return { enableStakeholders: execute, loading, error }
}

export function useDisableStakeholders(options: ActionOptions) {
  const { execute, loading, error } = useStakeholderAction("disable", options)

  return { disableStakeholders: execute, loading, error }
}

export function useDeleteStakeholders(options: ActionOptions) {
  const { execute, loading, error } = useStakeholderAction("delete", options)

  return { deleteStakeholders: execute, loading, error }
}
export function useRemoveStakeholders(options: ActionOptions) {
  const { execute, loading, error } = useStakeholderAction("remove", options)

  return { removeStakeholders: execute, loading, error }
}