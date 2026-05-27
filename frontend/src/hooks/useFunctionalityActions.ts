import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string 
  functionalityId: string
  onSuccess?: () => void
}

type FunctionalityAction = "disable" | "enable" | "remove" | "delete" 

function useFunctionalityAction(action: FunctionalityAction, { projectId, functionalityId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/${action}`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || `Failed to ${action} project`)
      }
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
      throw e
    } finally {
      setLoading(false)
    }
  }, [projectId, onSuccess])

  return { execute, loading, error }
}

// ── Disable Functionality ───────────────────────────────────────────────────────────

export function useDisableFunctionality(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalityAction("disable", options)
  return { disableFunctionality: execute, loading, error }
}

// ── Activate Functionality ──────────────────────────────────────────────────────────

export function useEnableFunctionality(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalityAction("enable", options)
  return { enableFunctionality: execute, loading, error }
}

// ── Delete Functionality ────────────────────────────────────────────────────────────

export function useDeleteFunctionality(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalityAction("delete", options)
  return { deleteFunctionality: execute, loading, error }
}

// ── Remove Functionality ────────────────────────────────────────────────────────────

export function useRemoveFunctionality(options: ActionOptions) {
  const { execute, loading, error } = useFunctionalityAction("remove", options)
  return { removeFunctionality: execute, loading, error }
}
