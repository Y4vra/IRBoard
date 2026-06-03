import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { API_BASE_URL } from "@/lib/globalVars"

import {
  useApproveStakeholders,
  useEnableStakeholders,
  useDisableStakeholders,
  useDeleteStakeholders,
  useRemoveStakeholders,
} from "@/hooks/useStakeholderActions"

// ── Mock fetch ────────────────────────────────────────────────────────────────

const fetchMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = fetchMock
})

function mockResponse(ok: boolean, data = {}) {
  fetchMock.mockResolvedValueOnce({
    ok,
    json: async () => data,
  } as Response)
}

// ── Generic test factory ──────────────────────────────────────────────────────

function testStakeholderHook(
  hook: any,
  actionName: string,
  endpointAction: string
) {
  it(`${actionName} calls API successfully`, async () => {
    mockResponse(true)

    const onSuccess = vi.fn()

    const { result } = renderHook(() =>
      hook({ projectId: "proj-1", onSuccess })
    )

    await act(async () => {
      await result.current[actionName]([1, 2])
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/projects/proj-1/stakeholders/${endpointAction}`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([1, 2]),
      })
    )

    expect(onSuccess).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it(`${actionName} handles API error`, async () => {
    mockResponse(false, { message: "fail" })

    const { result } = renderHook(() =>
      hook({ projectId: "proj-1" })
    )

    await act(async () => {
      await expect(result.current[actionName]([1])).rejects.toThrow("fail")
    })

    await waitFor(() => {
      expect(result.current.error).toBe("fail")
    })
  })

  it(`${actionName} does nothing when empty array`, async () => {
    const { result } = renderHook(() =>
      hook({ projectId: "proj-1" })
    )

    await act(async () => {
      await result.current[actionName]([])
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })
}

// ── Suites ────────────────────────────────────────────────────────────────────

describe("Stakeholder actions", () => {
  testStakeholderHook(
    useApproveStakeholders,
    "approveStakeholders",
    "approve"
  )

  testStakeholderHook(
    useEnableStakeholders,
    "enableStakeholders",
    "enable"
  )

  testStakeholderHook(
    useDisableStakeholders,
    "disableStakeholders",
    "disable"
  )

  testStakeholderHook(
    useDeleteStakeholders,
    "deleteStakeholders",
    "delete"
  )

  testStakeholderHook(
    useRemoveStakeholders,
    "removeStakeholders",
    "remove"
  )
})