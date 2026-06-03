import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useApproveFunctionalRequirements,
  useDisableFunctionalRequirements,
  useDeleteFunctionalRequirements,
  useEnableFunctionalRequirements,
  useFinishFunctionalRequirements,
  useRemoveFunctionalRequirements,
} from "@/hooks/useFunctionalRequirementActions"
import { API_BASE_URL } from "@/lib/globalVars"

// ── global fetch mock ─────────────────────────────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = mockFetch
})

const projectId = "p-1"
const functionalityId = "f-10"
const onSuccess = vi.fn()

function mockFetchOk() {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({}),
  })
}

function mockFetchFail(message = "error") {
  mockFetch.mockResolvedValue({
    ok: false,
    json: async () => ({ message }),
  })
}

// ── shared test factory ───────────────────────────────────────────────────────

function testHook(useHook, action: string, getter: string) {
  describe(getter, () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it("calls correct API with payload", async () => {
      mockFetchOk()

      const { result } = renderHook(() =>
        useHook({ projectId, onSuccess })
      )

      await act(async () => {
        await result.current[getter](functionalityId, [1, 2, 3])
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/projects/${projectId}/functionalities/${functionalityId}/functionalRequirements/${action}`,
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([1, 2, 3]),
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
        useHook({ projectId, onSuccess })
      )

      act(() => {
        result.current[getter](functionalityId, [1])
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
        useHook({ projectId, onSuccess })
      )

      await act(async () => {
        await expect(
          result.current[getter](functionalityId, [1])
        ).rejects.toThrow("Bad request")
      })

      expect(result.current.error).toBe("Bad request")
    })

    it("uses fallback error message when API provides none", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      const { result } = renderHook(() =>
        useHook({ projectId, onSuccess })
      )

      await act(async () => {
        await expect(
          result.current[getter](functionalityId, [1])
        ).rejects.toThrow(
          `Failed to ${action} functional requirements`
        )
      })

      expect(result.current.error).toBe(
        `Failed to ${action} functional requirements`
      )
    })

    it("does nothing when empty array is passed", async () => {
      const { result } = renderHook(() =>
        useHook({ projectId, onSuccess })
      )

      await act(async () => {
        await result.current[getter](functionalityId, [])
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
}

// ── run all hooks ─────────────────────────────────────────────────────────────

testHook(
  useApproveFunctionalRequirements,
  "approve",
  "approveFunctionalRequirements"
)

testHook(
  useDisableFunctionalRequirements,
  "disable",
  "disableFunctionalRequirements"
)

testHook(
  useDeleteFunctionalRequirements,
  "delete",
  "deleteFunctionalRequirements"
)

testHook(
  useEnableFunctionalRequirements,
  "enable",
  "enableFunctionalRequirements"
)

testHook(
  useFinishFunctionalRequirements,
  "finish",
  "finishFunctionalRequirements"
)

testHook(
  useRemoveFunctionalRequirements,
  "remove",
  "removeFunctionalRequirements"
)