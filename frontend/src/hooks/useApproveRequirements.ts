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

  // pendingMap: { [functionalityId]: number[] }
  const approveAllInProject = useCallback(
    async (pendingMap: Record<string, number[]>) => {
      const entries = Object.entries(pendingMap).filter(([, ids]) => ids.length > 0)
      if (!entries.length) return
      setLoading(true)
      setError(null)
      try {
        await Promise.all(entries.map(([funcId, ids]) => approveFunctionalRequirements(funcId, ids)))
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
        throw e
      } finally {
        setLoading(false)
      }
    },
    [approveFunctionalRequirements]
  )

  return { approveFunctionalRequirements, approveFunctionality, approveAllInProject, loading, error }
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