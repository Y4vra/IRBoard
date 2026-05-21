import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

// ── Finish Non-Functional Requirements ───────────────────────────────────────

export function useFinishNFRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finishNFRequirements = useCallback(
    async (nfrIds: number[]) => {
      if (!nfrIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/finish`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nfrIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to finish non-functional requirements")
        }
        onSuccess?.()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
        throw e
      } finally {
        setLoading(false)
      }
    },
    [projectId, onSuccess]
  )

  return { finishNFRequirements, loading, error }
}

// ── Finish Functional Requirements ───────────────────────────────────────────

export function useFinishFunctionalRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finishFunctionalRequirements = useCallback(
    async (functionalityId: string, functionalRequirementIds: number[]) => {
      if (!functionalRequirementIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/finish`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(functionalRequirementIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to finish functional requirements")
        }
        onSuccess?.()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
        throw e
      } finally {
        setLoading(false)
      }
    },
    [projectId, onSuccess]
  )

  return { finishFunctionalRequirements, loading, error }
}