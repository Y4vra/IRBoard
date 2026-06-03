import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { API_BASE_URL } from "@/lib/globalVars"
import { waitFor } from "@testing-library/react"

import {
  useDisableProject,
  useEnableProject,
  useDeleteProject,
  useRemoveProject,
  useFinishProject,
  useApproveAll,
} from "@/hooks/useProjectActions"

// ── Mock fetch ────────────────────────────────────────────────────────────────

const fetchMock = vi.fn()


// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Generic action hook tester ────────────────────────────────────────────────

function testActionHook(
  hook,
  actionName: string,
  endpoint: string
) {
  it(`${actionName} calls API successfully`, async () => {
    mockResponse(true)

    const onSuccess = vi.fn()

    const { result } = renderHook(() =>
      hook({ projectId: "proj-1", onSuccess })
    )

    await act(async () => {
      await result.current[
        actionName
      ]()
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/projects/proj-1${endpoint}`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
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
      await expect(result.current[actionName]()).rejects.toThrow("fail")
    })

    await waitFor(() => {
      expect(result.current.error).toBe("fail")
    })
  })
}

// ── Project action hooks ──────────────────────────────────────────────────────

describe("Project actions", () => {
  testActionHook(
    useDisableProject,
    "disableProject",
    "/disable"
  )

  testActionHook(
    useEnableProject,
    "enableProject",
    "/enable"
  )

  testActionHook(
    useDeleteProject,
    "deleteProject",
    "/delete"
  )

  testActionHook(
    useRemoveProject,
    "removeProject",
    "/remove"
  )

  testActionHook(
    useFinishProject,
    "finishProject",
    "/finish"
  )
})

// ── useApproveAll ─────────────────────────────────────────────────────────────

describe("useApproveAll", () => {
  it("calls approveAll endpoint successfully", async () => {
    mockResponse(true)

    const onSuccess = vi.fn()

    const { result } = renderHook(() =>
      useApproveAll({ projectId: "proj-1", onSuccess })
    )

    await act(async () => {
      await result.current.approveAll()
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/projects/proj-1/approveAll`,
      expect.objectContaining({
        method: "POST",
      })
    )

    expect(onSuccess).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it("handles approveAll error", async () => {
    mockResponse(false, { message: "boom" })

    const { result } = renderHook(() =>
      useApproveAll({ projectId: "proj-1" })
    )

    await act(async () => {
      await expect(result.current.approveAll()).rejects.toThrow("boom")
    })

    await waitFor(() => {
      expect(result.current.error).toBe("boom")
    })
  })
})