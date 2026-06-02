import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog"

describe("ConfirmActionDialog", () => {
  it("renders trigger button", () => {
    render(
      <ConfirmActionDialog
        trigger={<button>Open dialog</button>}
        title="Delete item"
        description="This action cannot be undone"
        confirmLabel="Delete"
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: /open dialog/i })).toBeInTheDocument()
  })

  it("opens dialog and renders content", () => {
    render(
      <ConfirmActionDialog
        trigger={<button>Open dialog</button>}
        title="Delete item"
        description="This action cannot be undone"
        confirmLabel="Delete"
        onConfirm={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /open dialog/i }))

    expect(screen.getByText("Delete item")).toBeInTheDocument()
    expect(screen.getByText("This action cannot be undone")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument()
  })

  it("calls onConfirm when confirm is clicked", () => {
    const onConfirm = vi.fn()

    render(
      <ConfirmActionDialog
        trigger={<button>Open dialog</button>}
        title="Delete item"
        description="This action cannot be undone"
        confirmLabel="Delete"
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /open dialog/i }))
    fireEvent.click(screen.getByRole("button", { name: /delete/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("shows loading state and disables cancel + confirm", () => {
    render(
      <ConfirmActionDialog
        trigger={<button>Open dialog</button>}
        title="Delete item"
        description="This action cannot be undone"
        confirmLabel="Delete"
        loading
        onConfirm={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /open dialog/i }))

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
    expect(screen.getByTestId("confirmButton")).toBeDisabled()
  })

  it("shows loader instead of label when loading", () => {
    render(
      <ConfirmActionDialog
        trigger={<button>Open dialog</button>}
        title="Delete item"
        description="This action cannot be undone"
        confirmLabel="Delete"
        loading
        onConfirm={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /open dialog/i }))

    // loader icon should exist (lucide svg)
    expect(document.querySelector("svg")).toBeInTheDocument()
  })
})