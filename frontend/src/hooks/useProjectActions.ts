import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

type ProjectAction = "disable" | "enable" | "delete" | "remove" | "finish"

function useProjectAction(action: ProjectAction, { projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/${action}`, {
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

// ── Disable Project ───────────────────────────────────────────────────────────

export function useDisableProject(options: ActionOptions) {
  const { execute, loading, error } = useProjectAction("disable", options)
  return { disableProject: execute, loading, error }
}

// ── Activate Project ──────────────────────────────────────────────────────────

export function useEnableProject(options: ActionOptions) {
  const { execute, loading, error } = useProjectAction("enable", options)
  return { enableProject: execute, loading, error }
}

// ── Delete Project ────────────────────────────────────────────────────────────

export function useDeleteProject(options: ActionOptions) {
  const { execute, loading, error } = useProjectAction("delete", options)
  return { deleteProject: execute, loading, error }
}

// ── Remove Project ────────────────────────────────────────────────────────────

export function useRemoveProject(options: ActionOptions) {
  const { execute, loading, error } = useProjectAction("remove", options)
  return { removeProject: execute, loading, error }
}

// ── Finish Project ────────────────────────────────────────────────────────────

export function useFinishProject(options: ActionOptions) {
  const { execute, loading, error } = useProjectAction("finish", options)
  return { finishProject: execute, loading, error }
}

// ── Project-wide approval ─────────────────────────────────────────────────────

export function useApproveAll({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_BASE_URL}/projects/${projectId}/approveAll`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Failed to approve all elements")
      }
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
      throw e
    } finally {
      setLoading(false)
    }
  }, [projectId, onSuccess])

  return { approveAll, loading, error }
}