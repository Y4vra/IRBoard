import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useApproveFunctionality,
  useDisableFunctionality,
  useEnableFunctionality,
  useDeleteFunctionality,
  useRemoveFunctionality,
} from "@/hooks/useFunctionalityActions"
import { API_BASE_URL } from "@/lib/globalVars"

// ── global fetch mock ─────────────────────────────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = mockFetch
})

const projectId = "p-1"
const functionalityId = "f-99"
const onSuccess = vi.fn()

function mockFetchOk() {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({}),
  })
}

function mockFetchFail(message = "error", status = 400) {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ message }),
  })
}

// ── shared test factory ───────────────────────────────────────────────────────

function testHook(useHook, action: string, getter: string) {
  describe(getter, () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it("calls correct API endpoint", async () => {
      mockFetchOk()

      const { result } = renderHook(() =>
        useHook({ projectId, functionalityId, onSuccess })
      )

      await act(async () => {
        await result.current[getter]()
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/${action}`,
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      )

      expect(onSuccess).toHaveBeenCalled()
    })

    it("sets loading state correctly", async () => {
      let resolveFn: (value: unknown) => void

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFn = resolve
          })
      )

      const { result } = renderHook(() =>
        useHook({ projectId, functionalityId, onSuccess })
      )

      act(() => {
        result.current[getter]()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolveFn({
          ok: true,
          json: async () => ({}),
        })
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it("handles API error with message", async () => {
      mockFetchFail("Bad request")

      const { result } = renderHook(() =>
        useHook({ projectId, functionalityId, onSuccess })
      )

      await act(async () => {
        await expect(result.current[getter]()).rejects.toThrow(
          "Bad request"
        )
      })

      expect(result.current.error).toBe("Bad request")
    })

    it("handles fallback error message", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      const { result } = renderHook(() =>
        useHook({ projectId, functionalityId, onSuccess })
      )

      await act(async () => {
        await expect(result.current[getter]()).rejects.toThrow(
          `Failed to ${action} project`
        )
      })

      expect(result.current.error).toBe(
        `Failed to ${action} project`
      )
    })
  })
}

// ── run tests for all hooks ───────────────────────────────────────────────────

testHook(useApproveFunctionality, "approve", "approveFunctionality")
testHook(useDisableFunctionality, "disable", "disableFunctionality")
testHook(useEnableFunctionality, "enable", "enableFunctionality")
testHook(useDeleteFunctionality, "delete", "deleteFunctionality")
testHook(useRemoveFunctionality, "remove", "removeFunctionality")