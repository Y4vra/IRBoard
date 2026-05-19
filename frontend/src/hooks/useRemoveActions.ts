import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

// ── Remove Documents ──────────────────────────────────────────────────────────

export function useRemoveDocuments({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeDocuments = useCallback(
    async (documentIds: number[]) => {
      if (!documentIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/documents/remove`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(documentIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to remove documents")
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

  return { removeDocuments, loading, error }
}

// ── Remove Stakeholders ───────────────────────────────────────────────────────

export function useRemoveStakeholders({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeStakeholders = useCallback(
    async (stakeholderIds: number[]) => {
      if (!stakeholderIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/stakeholders/remove`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stakeholderIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to remove stakeholders")
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

  return { removeStakeholders, loading, error }
}

// ── Remove Non-Functional Requirements ───────────────────────────────────────

export function useRemoveNFRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeNFRequirements = useCallback(
    async (nfrIds: number[]) => {
      if (!nfrIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/remove`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nfrIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to remove non-functional requirements")
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

  return { removeNFRequirements, loading, error }
}

// ── Remove Functional Requirements ───────────────────────────────────────────

export function useRemoveFunctionalRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeFunctionalRequirements = useCallback(
    async (functionalityId: string, functionalRequirementIds: number[]) => {
      if (!functionalRequirementIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/remove`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(functionalRequirementIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to remove functional requirements")
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

  return { removeFunctionalRequirements, loading, error }
}