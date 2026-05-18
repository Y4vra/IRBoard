import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"

interface ApproveRequirementsOptions {
  projectId: string
  onSuccess?: () => void
}

// ── FR approval ───────────────────────────────────────────────────────────────

export function useApproveRequirements({ projectId, onSuccess }: ApproveRequirementsOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveFunctionalRequirements = useCallback(
    async (functionalityId: string, functionalRequirementIds: number[]) => {
      if (!functionalRequirementIds.length) return
      const res = await fetch(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/approve`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(functionalRequirementIds),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Failed to approve requirements")
      }
      onSuccess?.()
    },
    [projectId, onSuccess]
  )

  const approveFunctionality = useCallback(
    async (functionalityId: string, requirementIds: number[]) => {
      if (!requirementIds.length) return
      setLoading(true)
      setError(null)
      try {
        await approveFunctionalRequirements(functionalityId, requirementIds)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
        throw e
      } finally {
        setLoading(false)
      }
    },
    [approveFunctionalRequirements]
  )

  return { approveFunctionalRequirements, approveFunctionality, loading, error }
}

// ── NFR approval ──────────────────────────────────────────────────────────────

export function useApproveNFRequirements({ projectId, onSuccess }: ApproveRequirementsOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveNFRequirements = useCallback(
    async (nfrIds: number[]) => {
      if (!nfrIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/approve`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nfrIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to approve NFRs")
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

  return { approveNFRequirements, loading, error }
}

// ── Stakeholder approval ──────────────────────────────────────────────────────

export function useApproveStakeholders({ projectId, onSuccess }: ApproveRequirementsOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveStakeholders = useCallback(
    async (stakeholderIds: number[]) => {
      if (!stakeholderIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/stakeholders/approve`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stakeholderIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to approve stakeholders")
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

  return { approveStakeholders, loading, error }
}

// ── Document approval ─────────────────────────────────────────────────────────

export function useApproveDocuments({ projectId, onSuccess }: ApproveRequirementsOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveDocuments = useCallback(
    async (documentIds: number[]) => {
      if (!documentIds.length) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE_URL}/projects/${projectId}/documents/approve`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(documentIds),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to approve documents")
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

  return { approveDocuments, loading, error }
}

// ── Project-wide approval ─────────────────────────────────────────────────────

export function useApproveAll({ projectId, onSuccess }: ApproveRequirementsOptions) {
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