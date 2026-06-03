import { render, waitFor } from "@testing-library/react"
import { act, useContext } from "react"
import { LockProvider } from "@/context/LockContext"
import { LockContext } from "@/context/LockContextInstance"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { POLL_INTERVAL_MS } from "@/lib/lockUtils"

let mockFetch: any

beforeEach(() => {
  mockFetch = vi.fn()
  globalThis.fetch = mockFetch
})

afterEach(() => {
  vi.clearAllMocks()
})

function renderLockProvider(ui: React.ReactNode) {
  return render(<LockProvider projectId={123}>{ui}</LockProvider>)
}

function useLocksTest() {
  return useContext(LockContext)
}

function Consumer({ onReady }: any) {
  const ctx = useLocksTest()

  queueMicrotask(() => {
    onReady(ctx)
  })

  return null
}

describe("LockProvider", () => {

  it("fetches project locks on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { entityType: "NFR", entityId: 1, userId: 10 },
      ],
    })

    let ctx: any

    renderLockProvider(
      <Consumer onReady={(c: any) => (ctx = c)} />
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/locks/projectLocks/123"),
        expect.any(Object)
      )
    })

    await waitFor(() => {
      expect(ctx?.isLocked("NFR", 1)).toBe(true)
    })
  })

  it("uses system locks endpoint when projectId is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(
      <LockProvider>
        <div />
      </LockProvider>
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/locks/systemLocks"),
        expect.any(Object)
      )
    })
  })

  it("refresh triggers a new fetch", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    })

    let ctx: any

    renderLockProvider(
      <Consumer onReady={(c: any) => (ctx = c)} />
    )

    await waitFor(() => expect(ctx).toBeDefined())

    mockFetch.mockClear()

    ctx.refresh()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it("isLocked returns correct boolean", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { entityType: "FR", entityId: 99, userId: 5 },
      ],
    })

    let ctx: any

    renderLockProvider(
      <Consumer onReady={(c: any) => (ctx = c)} />
    )

    await waitFor(() => {
      expect(ctx?.isLocked("FR", 99)).toBe(true)
      expect(ctx?.isLocked("FR", 100)).toBe(false)
    })
  })
})