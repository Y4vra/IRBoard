import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { UpdateFunctionalityDialog } from "@/components/dialogs//updatingDialogs/UpdateFunctionalityDialog"
import type { Functionality } from "@/types/Functionality"

// ------------------ mocks ------------------

const mockOnOpenChange = vi.fn()
const mockOnSuccess = vi.fn()

const functionality: Functionality = {
  entityIdentifier: "FUNC-1",
  id: "1",
  name: "Auth",
  description: "desc",
  label: "AU",
  state:"ACTIVE",
  projectId:1,
}

const projectId = "123"

beforeEach(() => {
  vi.resetAllMocks()
})

// helper render
function setup() {
  return render(
    <UpdateFunctionalityDialog
      open={true}
      onOpenChange={mockOnOpenChange}
      projectId={projectId}
      functionality={functionality}
      onSuccess={mockOnSuccess}
    />
  )
}

// ------------------ fetch mocking helper ------------------

function mockFetchOnce(res: Partial<Response>) {
  (globalThis.fetch) = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...res,
  })
}

// ------------------ tests ------------------

describe("UpdateFunctionalityDialog", () => {
  it("requests edit lock on open", async () => {
    mockFetchOnce({ ok: true })

    setup()

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/requestEdit"),
        expect.objectContaining({ credentials: "include" })
      )
    })
  })

  it("shows lock error on 409", async () => {
    mockFetchOnce({ ok: false, status: 409 })

    setup()

    expect(
      await screen.findByText(/currently being edited/i)
    ).toBeInTheDocument()
  })

  it("renders form after successful lock", async () => {
    mockFetchOnce({ ok: true })

    setup()

    expect(
      await screen.findByLabelText(/functionality name/i)
    ).toBeInTheDocument()
  })

  it("submits update successfully", async () => {
    mockFetchOnce({ ok: true })

    // first call = lock, second = save
    globalThis.fetch= vi.fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

    setup()

    const nameInput = await screen.findByLabelText(/functionality name/i)
    fireEvent.change(nameInput, { target: { value: "New Name" } })

    const btn = screen.getByRole("button", { name: /save changes/i })
    fireEvent.click(btn)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it("handles label conflict error", async () => {
    globalThis.fetch= vi.fn()
      .mockResolvedValueOnce({ ok: true }) // lock
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          field: "label",
          message: "label exists",
        }),
      })

    setup()

    const label = await screen.findByLabelText(/label/i)
    fireEvent.change(label, { target: { value: "DUP" } })

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))

    expect(
      await screen.findByText(/already exists/i)
    ).toBeInTheDocument()
  })

  it("does not close while saving/requesting", async () => {
    mockFetchOnce({ ok: true })

    setup()

    const close = screen.getByRole("button", { name: /close/i })

    fireEvent.click(close)

    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false)
  })
})