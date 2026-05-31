import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

type DocumentAction = "approve" | "delete" | "disable" | "enable" | "remove"

function useDocumentAction(
  action: DocumentAction,
  { projectId, onSuccess }: ActionOptions
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (documentIds: number[]) => {
      if (!documentIds.length) return

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/documents/${action}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(documentIds),
          }
        )

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || `Failed to ${action} documents`)
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

export function useApproveDocuments(options: ActionOptions) {
  const { execute, loading, error } = useDocumentAction(
    "approve",
    options
  )

  return { approveDocuments: execute, loading, error }
}

export function useDisableDocuments(options: ActionOptions) {
  const { execute, loading, error } = useDocumentAction(
    "disable",
    options
  )

  return { disableDocuments: execute, loading, error }
}

export function useEnableDocuments(options: ActionOptions) {
  const { execute, loading, error } = useDocumentAction(
    "enable",
    options
  )

  return { enableDocuments: execute, loading, error }
}

export function useDeleteDocuments(options: ActionOptions) {
  const { execute, loading, error } = useDocumentAction(
    "delete",
    options
  )

  return { deleteDocuments: execute, loading, error }
}
export function useRemoveDocuments(options: ActionOptions) {
  const { execute, loading, error } = useDocumentAction(
    "remove",
    options
  )

  return { removeDocuments: execute, loading, error }
}