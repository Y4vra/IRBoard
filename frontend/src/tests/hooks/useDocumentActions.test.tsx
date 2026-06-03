import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useApproveDocuments,
  useDeleteDocuments,
  useDisableDocuments,
  useEnableDocuments,
  useRemoveDocuments,
} from "@/hooks/useDocumentActions"
import { API_BASE_URL } from "@/lib/globalVars"

// ── fetch mock ────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = mockFetch;
})

function mockFetchOk() {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({}),
  })
}

function mockFetchFail(message = "fail", status = 400) {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ message }),
  })
}

// ── helpers ───────────────────────────────────────────────────────────────────

const projectId = "p-1"
const onSuccess = vi.fn()

// ── shared tests factory ──────────────────────────────────────────────────────

function testHook(useHook, action: string, getterName: string) {
  return describe(`${getterName}`, () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it("calls API successfully", async () => {
      mockFetchOk()

      const { result } = renderHook(() =>
        useHook({ projectId, onSuccess })
      )

      await act(async () => {
        await result.current[getterName]([1, 2])
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/projects/${projectId}/documents/${action}`,
        expect.objectContaining({
          method: "POST",
        })
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify([1, 2]),
        })
      )

      expect(onSuccess).toHaveBeenCalled()
    })

    it("sets loading state correctly", async () => {
      mockFetchOk()

      let resolveFn: (value: unknown)=> void;
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
        result.current[getterName]([1])
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
          result.current[getterName]([1])
        ).rejects.toThrow("Bad request")
      })

      expect(result.current.error).toBe("Bad request")
    })

    it("handles fallback error message", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      const { result } = renderHook(() =>
        useHook({ projectId, onSuccess })
      )

      await act(async () => {
        await expect(
          result.current[getterName]([1])
        ).rejects.toThrow(`Failed to ${action} documents`)
      })

      expect(result.current.error).toBe(
        `Failed to ${action} documents`
      )
    })

    it("does nothing when empty array is passed", async () => {
      const { result } = renderHook(() =>
        useHook({ projectId, onSuccess })
      )

      await act(async () => {
        await result.current[getterName]([])
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
}

// ── wrapper hooks tests ───────────────────────────────────────────────────────

testHook(useApproveDocuments, "approve", "approveDocuments")
testHook(useDeleteDocuments, "delete", "deleteDocuments")
testHook(useDisableDocuments, "disable", "disableDocuments")
testHook(useEnableDocuments, "enable", "enableDocuments")
testHook(useRemoveDocuments, "remove", "removeDocuments")