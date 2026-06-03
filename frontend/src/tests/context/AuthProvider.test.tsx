import { render, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { AuthProvider } from "@/context/AuthProvider"
import { AuthContext } from "@/context/AuthContext"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { kratos } from "@/lib/kratos"

vi.mock("@/lib/kratos", () => ({
  kratos: {
    toSession: vi.fn(),
    createBrowserLogoutFlow: vi.fn(),
  },
}))

let mockFetch: any

beforeEach(() => {
  mockFetch = vi.fn()
  globalThis.fetch = mockFetch
})

afterEach(() => {
  vi.clearAllMocks()
})

function getCtx() {
  let ctx: any = null

  function Consumer() {
    ctx = useContext(AuthContext)
    return null
  }

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  return () => ctx
}

describe("AuthProvider", () => {
  it("loads session + user successfully", async () => {
    vi.mocked(kratos.toSession).mockResolvedValueOnce({
      data: { identity: { id: "1" } },
    } as any)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: "John" }),
    })

    const get = getCtx()

    await waitFor(() => {
      expect(get()?.isAuthenticated).toBe(true)
    })

    expect(get()?.user).toEqual({ id: 1, name: "John" })
  })

  it("sets user to null when whoami fails (non-500)", async () => {
    vi.mocked(kratos.toSession).mockResolvedValueOnce({
      data: { identity: { id: "1" } },
    } as any)

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    })

    const get = getCtx()

    await waitFor(() => {
      expect(get()?.isAuthenticated).toBe(true)
    })

    await waitFor(() => {
      expect(get()?.user).toBeNull()
      expect(get()?.serverError).toBe(false)
    })
  })

  it("sets serverError on 500 response", async () => {
    vi.mocked(kratos.toSession).mockResolvedValueOnce({
      data: { identity: { id: "1" } },
    } as any)

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    const get = getCtx()

    await waitFor(() => {
      expect(get()?.serverError).toBe(true)
    })
  })

  it("handles no session", async () => {
    vi.mocked(kratos.toSession).mockResolvedValueOnce({
      data: null,
    } as any)

    const get = getCtx()

    await waitFor(() => {
      expect(get()?.isAuthenticated).toBe(false)
    })
  })

  it("handles kratos error", async () => {
    vi.mocked(kratos.toSession).mockRejectedValueOnce({
      code: "ERR_NETWORK",
    })

    const get = getCtx()

    await waitFor(() => {
      expect(get()?.serverError).toBe(true)
    })
  })
})