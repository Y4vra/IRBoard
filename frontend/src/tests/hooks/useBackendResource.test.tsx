import { renderHook, waitFor, act } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { useBackendResource } from "@/hooks/useBackendResource"

describe("useBackendResource", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("starts in loading state", async () => {
    const fetcher = vi.fn().mockResolvedValue("data")

    const { result } = renderHook(() =>
      useBackendResource({ fetcher })
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it("fetches data successfully", async () => {
    const fetcher = vi.fn().mockResolvedValue("hello")

    const { result } = renderHook(() =>
      useBackendResource({ fetcher })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe("hello")
    expect(result.current.error).toBe(null)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("handles fetch error", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"))

    const { result } = renderHook(() =>
      useBackendResource({ fetcher })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe("boom")
  })

  it("uses fallback error for non-Error throws", async () => {
    const fetcher = vi.fn().mockRejectedValue("bad")

    const { result } = renderHook(() =>
      useBackendResource({ fetcher })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe("Unknown error")
  })

  it("does not run when enabled is false", async () => {
    const fetcher = vi.fn()

    const { result } = renderHook(() =>
      useBackendResource({ fetcher, enabled: false })
    )

    expect(result.current.loading).toBe(true)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it("refresh re-runs fetcher", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce("first")
      .mockResolvedValueOnce("second")

    const { result } = renderHook(() =>
      useBackendResource({ fetcher })
    )

    await waitFor(() => {
      expect(result.current.data).toBe("first")
    })

    await act(async () => {
      await result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.data).toBe("second")
    })

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it("reacts to fetcher change", async () => {
    const fetcher1 = vi.fn().mockResolvedValue("A")
    const fetcher2 = vi.fn().mockResolvedValue("B")

    const { result, rerender } = renderHook(
      ({ fn }) => useBackendResource({ fetcher: fn }),
      { initialProps: { fn: fetcher1 } }
    )

    await waitFor(() => {
      expect(result.current.data).toBe("A")
    })

    rerender({ fn: fetcher2 })

    await waitFor(() => {
      expect(result.current.data).toBe("B")
    })
  })
})