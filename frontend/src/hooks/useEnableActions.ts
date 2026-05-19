import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ActionOptions {
  projectId: string
  onSuccess?: () => void
}

// ── Enable Documents ──────────────────────────────────────────────────────────

export function useEnableDocuments({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enableDocuments = useCallback(
    async (documentIds: number[]) => {
      if (!documentIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/documents/enable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(documentIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to enable documents")
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

  return { enableDocuments, loading, error }
}

// ── Enable Stakeholders ───────────────────────────────────────────────────────

export function useEnableStakeholders({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enableStakeholders = useCallback(
    async (stakeholderIds: number[]) => {
      if (!stakeholderIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/stakeholders/enable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stakeholderIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to enable stakeholders")
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

  return { enableStakeholders, loading, error }
}

// ── Enable Non-Functional Requirements ───────────────────────────────────────

export function useEnableNFRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enableNFRequirements = useCallback(
    async (nfrIds: number[]) => {
      if (!nfrIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/enable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nfrIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to enable non-functional requirements")
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

  return { enableNFRequirements, loading, error }
}

// ── Enable Functional Requirements ───────────────────────────────────────────

export function useEnableFunctionalRequirements({ projectId, onSuccess }: ActionOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enableFunctionalRequirements = useCallback(
    async (functionalityId: string, functionalRequirementIds: number[]) => {
      if (!functionalRequirementIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/enable`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(functionalRequirementIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to enable functional requirements")
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

  return { enableFunctionalRequirements, loading, error }
}