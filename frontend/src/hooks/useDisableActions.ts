import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

// ── Disable Documents ─────────────────────────────────────────────────────────

export function useDisableDocuments({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disableDocuments = useCallback(
    async (documentIds: number[]) => {
      if (!documentIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/documents/disable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(documentIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to disable documents")
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

  return { disableDocuments, loading, error }
}

// ── Disable Stakeholders ──────────────────────────────────────────────────────

export function useDisableStakeholders({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disableStakeholders = useCallback(
    async (stakeholderIds: number[]) => {
      if (!stakeholderIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/stakeholders/disable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stakeholderIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to disable stakeholders")
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

  return { disableStakeholders, loading, error }
}

// ── Disable Non-Functional Requirements ──────────────────────────────────────

export function useDisableNFRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disableNFRequirements = useCallback(
    async (nfrIds: number[]) => {
      if (!nfrIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/disable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nfrIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to disable non-functional requirements")
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

  return { disableNFRequirements, loading, error }
}

// ── Disable Functional Requirements ──────────────────────────────────────────

export function useDisableFunctionalRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disableFunctionalRequirements = useCallback(
    async (functionalityId: string, functionalRequirementIds: number[]) => {
      if (!functionalRequirementIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/disable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(functionalRequirementIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to disable functional requirements")
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

  return { disableFunctionalRequirements, loading, error }
}